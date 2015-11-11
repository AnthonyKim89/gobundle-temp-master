

module.exports = function(sequelize, DataTypes) {

	var Message = sequelize.define('Message', {
			message: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: "Message must not be empty."
					}
				}
			},
			attachment: DataTypes.STRING
		},
		{
			associate: function(models){
				Message.belongsTo(models.User);
				Message.belongsTo(models.Bundle);
			}
		}
	);

	return Message;
};
