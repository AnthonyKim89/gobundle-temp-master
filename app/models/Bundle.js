
/**
	* Bundle Model
	*/

var slugify = require('slug');
var _ = require('lodash');
var async = require('async');
var mailer = require('../lib/mailer');
var stripe = require('../../config/stripe');

module.exports = function(sequelize, DataTypes) {

	var Bundle = sequelize.define('Bundle', 
		{
			bundleFor: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			bundleType: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			bundleName: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: {
						args: 3,
						msg: "Bundle name must be at least 3 characters."
					}
				}
			},
			slug: {
				type: DataTypes.STRING,
				unique: true
			},
			target: {
				type: DataTypes.FLOAT,
				allowNull: false
			},
			targetType: {
				type: DataTypes.INTEGER
			},
			minPeopleCount: {
				type: DataTypes.INTEGER
			},
			maxPeopleCount: {
				type: DataTypes.INTEGER
			},
			duration: {
				type: DataTypes.INTEGER
			},
			photo: DataTypes.STRING,
			description: DataTypes.TEXT,
			dateLive: DataTypes.DATE,
			isExtended: DataTypes.INTEGER,
			status: DataTypes.INTEGER
		},
		{
			defaultScope: {
				where: {
					"status": {
						ne: 2
					}
				}
			},
			scopes: {
				all: { where: { } },
				deleted: { where: { "status": 2 } },
				not_deleted: { where: { "status": { ne: 2 } } },
				live: { where: { "status": 1 } },
				draft: { where: { "status": 0 } },
				success: { where: { "status": 3 } },
				failed: { where: { "status": 4 } },
				any: function(status) {
					return {
						where: {
							"status": status
						}
					};
				}
			},
			instanceMethods: {
				getTotal: function() {
					var ret = {
						raised: 0,
						sum: 0
					};
					ret.raised = _.reduce(this.Contributions, function(sum, cont) { return sum + (cont.Transaction.status == 1 || cont.Transaction.status === 0 ? cont.Transaction.amount : 0); }, 0);

					if(this.bundleType === 0) {
						ret.sum = this.target;
					}
					else if(this.bundleType == 1) {
						ret.sum = this.target * this.minPeopleCount;
					}
					else if(this.bundleType == 2) {
						ret.sum = this.target;
					}

					return ret;
				},
				checkSuccess: function(next) {
					var total = this.getTotal();

					if(this.bundleType === 0) {
						if(this.targetType === 0) {
							if(total.raised > 0) {
								next(true);
							}
							else {
								next(false);
							}
						}
						else if(this.targetType == 1) {
							if(total.raised >= total.sum) {
								next(true);
							}
							else {
								next(false);
							}
						}
					}
					else if(this.bundleType == 1 || this.bundleType == 2) {
						if(total.raised >= total.sum) {
							next(true);
						}
						else {
							next(false);
						}
					}
				},
				collect: function(next) {
					var operations = [];
					var bundle = this;
					_.each(this.Contributions, function(contribution) {
						if(contribution.type != 1 || contribution.Transaction.status !== 0) return;

						operations.push(function(next) {
							contribution.Transaction.CreditCard.charge({
	                                customerToken: contribution.User.paymentUserToken, 
	                                amount: contribution.Transaction.amount, 
	                                currency: 'gbp',
	                                description: 'Contributing to ' + bundle.User.firstname + ' ' + bundle.User.surname + '\'s ' + bundle.bundleName
	                            },
	                            function(error, transactionId) {
	                                if(error !== "") {
	                                	contribution.Transaction.status = 2;
	                                }
	                                else {
	                                	contribution.Transaction.apiResponse = transactionId;
	                                	contribution.Transaction.status = 1;
	                                }
	                                contribution.Transaction.save()
	                                	.then(function() {
	                                		next();
	                                	}, function(err) {
	                                		console.log(err);
	                                		next(err);
	                                	});
                        	});   
						});
					});

					async.series(operations, function(err) {
						next();
					});
				},
				refund: function(next) {
					var operations = [];
					var bundle = this;
					_.each(this.Contributions, function(contribution) {
						if(contribution.Transaction.status != 1) return;
						operations.push(function(next) {
							stripe.charges.createRefund(
		                        contribution.Transaction.apiResponse,
		                        { },
		                        function(err, refund) {
		                        }
		                    );

		                    contribution.Transaction.status = 3;
                			contribution.Transaction.save()
                				.then(function() {
                					contribution.status = 2;
				                        contribution.save()
				                            .then(function() {
				                            	next(null);
				                            }, function() {
			                					console.log(err);
			                					next(err);
				                            });
                				}, function(err) {
                					console.log(err);
                					next(err);
                				});
						});
					});
					
					async.series(operations, function(err) {
						next();
					});
				}
			},
			classMethods: {
				getSlug: function(bundleName, id, next) {
					var slug = slugify(bundleName).toLowerCase();
					var where = [];
					if(id === null) where = ["slug LIKE ?", slug + '%'];
					else where = ["slug LIKE ? AND id != ?", slug + '%', id];
					Bundle.scope('all').count({where: where})
							.then(function(count) {
								if(count > 0) next(slug + '-' + count);
								else next(slug);
							});
				}
			},
			associate: function(models) {
				Bundle.belongsTo(models.User);
				Bundle.hasMany(models.Contribution);
				Bundle.hasMany(models.Message);
			},
			hooks: {
			    beforeCreate: function(instance, options, fn) {
			    	Bundle.getSlug(instance.bundleName, null, function(result) {
			    		instance.slug = result;
			    		fn(null, instance);
			    	});
			    },
			    beforeUpdate: function(instance, options, fn) {
			    	// Bundle.getSlug(instance.bundleName, instance.id, function(result) {
			    	// 	instance.slug = result;
			    	// 	fn(null, instance);
			    	// });
					fn(null, instance);
			    }
			}
		}
	);

	return Bundle;
};
