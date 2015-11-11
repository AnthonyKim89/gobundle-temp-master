var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var http = require('http');
var path = require('path'),
	templatesDir   = path.resolve(__dirname, '..', 'views', 'emails'),
	emailTemplates = require('email-templates');

var config    = require('../../config/config');

var send_email = function(email) {

	console.log('---Sending email to ' + email.to + '---');
	emailTemplates(templatesDir, function(err, template) {
		if(err) {
			console.log(err);
			return res.status(400).send("");
		}
		template(email.view, {config: config, param: email.param}, function(err, html, text) {
			var transport = nodemailer.createTransport(smtpTransport({
			    host: config.smtp.host,
			    port: config.smtp.port,
			    auth: {
			        user: config.smtp.username,
			        pass: config.smtp.password
			    }
			}));

			var body = {
				from: email.from,
				to: email.to,
				subject: email.subject,
				html: html,
			};

			transport.sendMail(body);
		});
	});

	

};
exports.email = function(email) {
	send_email(email);
};

exports.email_forget_password = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "You have requested to reset your password.",
		view: "forget_password",
		param: param
	});
};


exports.email_welcome = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "Welcome to "+ config.app.name + "!",
		view: "welcome",
		param: param
	});
};

exports.email_bundle_payment_failed = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "There's problem occured on your bundle [" + param.Bundle.bundleName + "] while making payment!",
		view: "bundle_payment_failed",
		param: param
	});
};
exports.email_bundle_payment_joined = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "You have joined bundle [" + param.Bundle.bundleName + "]!",
		view: param.Contribution.type === 0 ? "bundle_joined1" : "bundle_joined",
		param: param
	});
};
exports.email_bundle_payment_refunded = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "There's problem occured on your bundle [" + param.Bundle.bundleName + "] while making payment!",
		view: "bundle_payment_refunded",
		param: param
	});
};

exports.email_bundle_success = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "Your bundle [" + param.Bundle.bundleName + "] has succeeded!",
		view: "bundle_success",
		param: param
	});
};
exports.email_bundle_failed = function(param) {
	send_email({
		from: config.app.admin_name + "<" + config.app.admin_email + ">",
		to: param.email,
		subject: "Your bundle [" + param.Bundle.bundleName + "] has failed!",
		view: "bundle_failed",
		param: param
	});
};
exports.email_bundle_failed_contributor = function(param) {

};