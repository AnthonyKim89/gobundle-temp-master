var config = require('./config');
var stripe = require('stripe')(
	config.stripe.secret_key
);
module.exports = stripe;