/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var stripe = require('../../config/stripe');
var moment = require("moment");


exports.contribution = function(req, res, next, id) {
    console.log('id => ' + id);
    db.Contribution.find({ where: {id: id} }).then(function(contribution){
        if(!contribution) {
            return next(new Error('Failed to load contribution ' + id));
        } else {
            req.contribution = contribution;
            return next();            
        }
    }, function(err){
        return next(err);
    });
};

/**
 * Create a contribution
 */
exports.create = function(req, res) {
    var type = req.body.type;
    var amount = req.body.amount;
    var BundleId = req.body.BundleId;
    var CardId = req.body.CardId;

    var addContribution = function(callback) {
        db.Contribution.create({
            type: type === 0 ? 0 : 1,
            BundleId: BundleId,
            UserId: req.user.id
        }).then(function(contribution){
            callback(contribution);
        }, function(err){
            console.log(err);
            return res.status(500).send({ 
                error: 'Unexpected error occured',
                status: 500
            });
        });
    };
    var addTransaction = function(contributionId, status, transactionId) {
        db.Transaction.create({
            amount: amount,
            apiResponse: transactionId,
            status: status,
            ContributionId: contributionId,
            CreditCardId: CardId
        }).then(function(transaction){
            return res.send({
            });
        }, function(err){
            console.log(err);
            return res.status(500).send({ 
                error: 'Unexpected error occured',
                status: 500
            });
        });
    };

    db.Bundle.scope('all').find({ where: {"id": BundleId}, include: [db.User]})
    .then(function(bundle){
        if(!bundle || bundle.status !== 1) {
            return res.status(500).send({
                error: 'Invalid bundle specified.',
                status:500
            });
        } else {
            if(type === 0) {
                db.CreditCard.find({ where: {id: CardId}}).then(function(creditCard){
                    if(!creditCard) {
                        return res.status(500).send({
                            error: 'Failed to load creditCard.',
                            status:500
                        });
                    } else {
                        creditCard.charge({
                                customerToken: req.user.paymentUserToken, 
                                amount: amount, 
                                currency: 'gbp',
                                description: 'Contributing to ' + bundle.User.firstname + ' ' + bundle.User.surname + '\'s ' + bundle.bundleName
                            },
                            function(error, transactionId) {
                                if(error !== "") {
                                    return res.status(500).send({
                                        error: error,
                                        status:500
                                    });
                                }
                                else {
                                    addContribution(function(contribution) {
                                        addTransaction(contribution.id, 0, transactionId);
                                    });
                                }
                        });   
                    }
                }, function(err){
                    console.log(err);
                    return res.status(500).send({
                        error: 'Failed to load creditCard.',
                        status:500
                    });
                });
            }
            else {
                addContribution(function(contribution) {
                    addTransaction(contribution.id, 0, '');
                });
            }
        }
    }, function(err){
        return res.status(500).send({
            error: 'Invalid bundle specified.',
            status:500
        });
    });
};


exports.delete = function(req, res) {
    var contributionId = req.query.contributionId;
    db.Contribution.scope('all').find({ where: {'id': contributionId}, include:[db.Bundle, db.Transaction] }).then(function(contribution){
        if(!contribution) {
            return res.status(500).send({
                error: 'Invalid contribution specified.',
                status:500
            });
        } else {
            if(contribution.Bundle.UserId != req.user.id) {
                return res.status(500).send({
                    error: 'Invalid contribution specified.',
                    status:500
                });
            }
            else {
                if(contribution.Transaction.status == 1) {
                    // refund
                    stripe.charges.createRefund(
                        contribution.Transaction.apiResponse,
                        { },
                        function(err, refund) {
                        }
                    );
                }

                contribution.Transaction.status = 3;
                contribution.Transaction.save()
                    .then(function() {
                        contribution.status = 0;
                        contribution.save()
                            .then(function() {
                                return res.send({
                                });
                            }, function() {
                                return res.status(500).send({
                                    error: 'Unexpected error occured.',
                                    status:500
                                });
                            });
                    }, function() {
                        return res.status(500).send({
                            error: 'Unexpected error occured.',
                            status:500
                        });
                    });
            }
        }
    }, function(err){
        return res.status(500).send({
            error: 'Invalid contribution specified.',
            status:500
        });
    });  
};