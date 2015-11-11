
var stripe = require('../../config/stripe');

module.exports = function(sequelize, DataTypes) {

	var CreditCard = sequelize.define('CreditCard', {
			cardType: {
				type: DataTypes.STRING,
				allowNull: false
			},
			last4: {
				type: DataTypes.STRING,
				allowNull: false
			},
			expiryDate: {
				type: DataTypes.STRING,
				allowNull: false
			},
			status: {
				type: DataTypes.INTEGER,		// 0 - DELETED, 1 - ACTIVE
				allowNull: false,
				defaultValue: 1
			},
			paymentCardToken: DataTypes.TEXT
		},
		{
			instanceMethods: {
				charge: function(options, callback) {
					var that = this;
					stripe.customers.retrieveCard(
	                    options.customerToken,
	                    that.paymentCardToken,
	                    function(err, stripeCard) {
	                        if(err || stripeCard === null) {
	                            callback('Failed to load creditCard.');
	                        }
	                        else {
	                        	stripe.charges.create({
									amount: Math.round(options.amount * 100),
									currency: options.currency,
									customer: options.customerToken,
									card: stripeCard.id,
									description: options.description
									}, function(err, charge) {
										console.log(err);
										if(err || charge === null) {
											callback('Failed to charge the credit card.');
										}
										else {
											callback('', charge.id);
										}
									});
	                        }
	                    }
	                );      
				}
			},
			associate: function(models){
				CreditCard.belongsTo(models.User);
				CreditCard.hasMany(models.Transaction);
			}
		}
	);

	return CreditCard;
};
