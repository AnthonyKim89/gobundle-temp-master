var path = require('path'),
	templatesDir   = path.resolve(__dirname, '..', 'views', 'emails'),
	emailTemplates = require('email-templates'),
	config = require('../../config/config');

exports.mail_template = function(req, res) {
	emailTemplates(templatesDir, function(err, template) {
		if(err) {
			console.log(err);
			return res.status(400).send("");
		}
		template('welcome', {config: config}, function(err, html, text) {
			res.send(html);
		});
	});
};