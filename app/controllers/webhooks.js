/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var stripe = require('../../config/stripe');
var moment = require("moment");
var mailer = require("../lib/mailer");


exports.stripe = function(req, res) {
    // console.log(req.body);
    var payload = req.body;
    // Do something with payload

    var charge_id = payload.data.object.id;
    
    // charge_id = 'ch_16CMk8HrNqcolqqi76uaBsKl';
    db.Transaction.find({ where: {apiResponse: charge_id}, include: [{
            model: db.Contribution.scope('all'),
            include: [ {model: db.Bundle.scope('all'), include: [db.User] }, db.User ]
        }]})
    .then(function(transaction){
        if(!transaction) {
            res.send(200);    
        } else {
            if(payload.type == 'charge.succeeded') {
                transaction.status = 1;
            }
            else if(payload.type == 'charge.failed') {
                transaction.status = 2;
                if(transaction.Contribution.Bundle.User.email !== "") {
                    mailer.email_bundle_payment_failed({
                        email: transaction.Contribution.Bundle.User.email,
                        Bundle: transaction.Contribution.Bundle,
                        Contribution: transaction.Contribution
                    });
                }
            }
            else if(payload.type == 'charge.refunded') {
                transaction.status = 3;
                if(transaction.Contribution.Bundle.User.email !== "") {
                    mailer.email_bundle_payment_refunded({
                        email: transaction.Contribution.Bundle.User.email,
                        Bundle: transaction.Contribution.Bundle,
                        Contribution: transaction.Contribution
                    });
                }
            }

            transaction.save();

            res.send(200);     
        }
    }, function(err){
        res.send(200);
    });
};