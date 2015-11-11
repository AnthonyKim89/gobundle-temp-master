/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var _ = require('lodash');

/**
 * Find transaction by id
 * Note: This is called every time that the parameter :transactionId is used in a URL. 
 * Its purpose is to preload the transaction on the req object then call the next function. 
 */
exports.transaction = function(req, res, next, id) {
    console.log('id => ' + id);
    db.Transaction.find({ where: {id: id}, include: [db.User, db.Contribution, db.Message]}).then(function(transaction){
        if(!transaction) {
            return next(new Error('Failed to load transaction ' + id));
        } else {
            req.transaction = transaction;
            return next();            
        }
    }, function(err){
        return next(err);
    });
};

/**
 * Create a transaction
 */
exports.create = function(req, res) {
    // augment the transaction by adding the UserId
    req.body.status = 0;
    // save and return and instance of transaction on the res object. 
    db.Transaction.create(req.body).then(function(transaction){
        if(!transaction){
            return res.status(500).send({errors: err});
        } else {
            return res.jsonp(transaction);
        }
    }, function(err){
        return res.status(500).send({ 
            errors: err,
            status: 500
        });
    });
};

/**
 * Update a transaction
 */
exports.update = function(req, res) {

    // create a new variable to hold the transaction that was placed on the req object.
    var transaction = req.transaction;

    if(transaction === null) {
        return res.status(500).send({
            error: {transaction: ['transaction not found.']}, 
            status: 500
        });
    }

    transaction.updateAttributes({
        photo: req.body.photo,
        description: req.body.description,
        status: req.body.status
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
 * Delete an transaction
 */
exports.destroy = function(req, res) {

    // create a new variable to hold the transaction that was placed on the req object.
    var transaction = req.transaction;

    if(transaction === null) {
        return res.status(500).send({
            error: {transaction: ['transaction not found.']}, 
            status: 500
        });
    }

    transaction.updateAttributes({
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
 * Show an transaction
 */
exports.show = function(req, res) {
    // Sending down the transaction that was just preloaded by the transactions.transaction function
    // and saves transaction on the req object.
    return res.jsonp(req.transaction);
};

/**
 * List of transactions
 */
exports.all = function(req, res) {
    req.user.getCreditCards(
        {
            include: [{
                model : db.Transaction, 
                include: [{
                    model: db.Contribution.scope('all'), 
                    required: false,
                    include: [{
                        model:db.Bundle.scope('all'), 
                        include : [db.User]
                    }]
                }],
                order: [['updatedAt', 'DESC']]
            }]
        })
    .then(function(cards) {
        var transactions = _.reduce(cards, function(sum, item) { return sum.concat(item.Transactions); }, []);
        return res.jsonp(transactions);
    }, function(err) {
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};