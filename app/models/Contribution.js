

module.exports = function(sequelize, DataTypes) {

	var Contribution = sequelize.define('Contribution', {
			type: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			status: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1			// 0 - deleted, 1 - active, 2 - withdrawn
			}
		},
		{
			defaultScope: {
				where: {
					"status": 1
				}
			},
			scopes: {
				all: { where: { } }
			},
			associate: function(models){
				Contribution.belongsTo(models.User);
				Contribution.belongsTo(models.Bundle);
				Contribution.hasOne(models.Transaction);
			}
		}
	);

	return Contribution;
};
