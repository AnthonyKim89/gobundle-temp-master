/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var stripe = require('../../config/stripe');
var moment = require("moment");

/**
 * Find creditCard by id
 * Note: This is called every time that the parameter :creditCardId is used in a URL. 
 * Its purpose is to preload the creditCard on the req object then call the next function. 
 */
exports.creditCard = function(req, res, next, id) {
    console.log('id => ' + id);
    db.CreditCard.find({ where: {id: id} }).then(function(creditCard){
        if(!creditCard) {
            return next(new Error('Failed to load creditCard ' + id));
        } else {
            req.creditCard = creditCard;
            return next();            
        }
    }, function(err){
        return next(err);
    });
};

/**
 * Create a creditCard
 */
exports.create = function(req, res) {
    // // augment the creditCard by adding the UserId
    // req.body.UserId = req.user.id;
    // req.body.status = 0;
    // // save and return and instance of creditCard on the res object. 
    
    var createPaymentUser = function(callback) {
        stripe.customers.create({
            email:req.user.email,
            description: req.user.firstname + ' ' + req.user.surname
        }, function(err, customer) {
            req.user.paymentUserToken = customer.id;
            req.user.save()
                .then(function() {
                    callback(customer);
                }, function(err) {
                    return res.status(500).send({
                        error: 'Error occured while adding your credit card. Please try again.',
                        status:500
                    });
                });
        });
    };

    var addCard = function(customer) {
        stripe.customers.createSource(
            customer.id,
            {source: req.body.token},
            function(err, card) {
                console.log(card);
                if(err || card === null) {
                    console.log(err);
                    return res.status(500).send({
                        error: {CreditCard: ['Invalid card number.']},
                        status: 500
                    });
                }
                else {
                    db.CreditCard.create({
                        cardType: card.brand.replace(' ', '').toLowerCase(),
                        last4: card.last4,
                        expiryDate: (card.exp_month<10 ? '0' + card.exp_month : card.exp_month) + '/' + card.exp_year,
                        paymentCardToken: card.id,
                        UserId: req.user.id
                    }).then(function(creditCard){
                        return res.jsonp(creditCard);
                    }, function(err){
                        return res.status(500).send({ 
                            error: err,
                            status: 500
                        });
                    });
                }
            });
    };

    if(req.user.paymentUserToken === null || req.user.paymentUserToken === "") {
       createPaymentUser(function(customer) {
            addCard(customer);
       });
    }
    else {
        stripe.customers.retrieve(req.user.paymentUserToken,
            function(err, customer) {
                if(err || customer === null) {
                    createPaymentUser(function(customer) {
                        addCard(customer);
                    });
                }
                else {
                    addCard(customer);
                }
            });
    }
    
};

/**
 * Delete an creditCard
 */
exports.destroy = function(req, res) {

    // create a new variable to hold the creditCard that was placed on the req object.
    var creditCard = req.creditCard;

    if(creditCard === null) {
        return res.status(500).send({
            error: {creditCard: ['creditCard not found.']}, 
            status: 500
        });
    }
    stripe.customers.deleteCard(
        req.user.paymentUserToken,
        creditCard.paymentCardToken,
        function(err, confirmation) {
        // asynchronously called
        }
    );

    creditCard.updateAttributes({
        status: 2
    }).then(function(a){
        return res.jsonp(a);
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};

/**
 * Show an creditCard
 */
exports.show = function(req, res) {
    // Sending down the creditCard that was just preloaded by the creditCards.creditCard function
    // and saves creditCard on the req object.
    return res.jsonp(req.creditCard);
};

/**
 * List of creditCards
 */
exports.all = function(req, res) {
    req.user.getCreditCards({where: {status: 1}})
        .then(function(creditCards) {
            return res.jsonp(creditCards);
        })
        .error(function(err) {
            return res.status(500).send({
                error: err, 
                status: 500
            });
        });
};