

module.exports = function(sequelize, DataTypes) {

	var Transaction = sequelize.define('Transaction', {
			amount: {
				type: DataTypes.FLOAT,
				allowNull: false,
				validate: {
					min: {
						args: 1,
						msg: "Minimum amount is 1."
					}
				}
			},
			apiResponse: {
				type: DataTypes.TEXT
			},
			status: {
				type: DataTypes.INTEGER,		// 0 - PENDING, 1 - COMPLETED, 2 - FAILED, 3 - REFUNDED
				allowNull: false
			}
		},
		{
			associate: function(models){
				Transaction.belongsTo(models.CreditCard);
				Transaction.belongsTo(models.Contribution);
			}
		}
	);

	return Transaction;
};
