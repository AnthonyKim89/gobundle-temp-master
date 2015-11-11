
/**
	* User Model
	*/

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {

	var User = sequelize.define('User', 
		{
			firstname: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: {
						args: 3,
						msg: "First name must be at least 3 characters."
					}
				}
			},
			surname: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: {
						args: 3,
						msg: "Surname must be at least 3 characters."
					}
				}
			},
			dob: {
				type: DataTypes.DATE,
				allowNull: true
			},
			email: {
				type: DataTypes.STRING,
				allowNull: true
			},
			hashedPassword: {
				type: DataTypes.STRING
			},
			salt: DataTypes.STRING,
			photo: DataTypes.STRING,
			facebookId: {
				type: DataTypes.STRING
			},
			verification: DataTypes.STRING(512),
			token: DataTypes.STRING(512),
			tokenExpiry: DataTypes.DATE,
			paymentUserToken: DataTypes.STRING(256),
			status: DataTypes.INTEGER
		},
		{ 
			instanceMethods: {
				makeSalt: function() {
					return crypto.randomBytes(16).toString('base64'); 
				},
				authenticate: function(plainText){
					return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
				},
				encryptPassword: function(password, salt) {
					if (!password || !salt) return '';
					salt = new Buffer(salt, 'base64');
					return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
				}
			},
			associate: function(models) {
				User.hasMany(models.Bundle);
				User.hasMany(models.Contribution);
				User.hasMany(models.Message);
				User.hasMany(models.CreditCard);
			}
		}
	);

	return User;
};
