var config = require('./config');
var mangopay = require('mangopay')(
	config.mangopay
);
module.exports = mangopay;