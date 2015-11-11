/**
 * Module dependencies.
 */
var express     = require('express');
var fs          = require('fs');
var _ = require('lodash');
var moment = require('moment');
var mailer = require('./app/lib/mailer');
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load Configurations

var env             = process.env.NODE_ENV = process.env.NODE_ENV || 'production';
var config          = require('./config/config');
var db              = require('./config/sequelize');

var bundleSuccess = function(bundle) {
	bundle.status = 3;
	bundle.save();
	mailer.email_bundle_success({
		email: bundle.User.email,
        Bundle: bundle
	});
};
var bundleFailed = function(bundle) {
	bundle.refund(function() {
		bundle.status = 4;
		bundle.save();
	});
	mailer.email_bundle_failed({
		email: bundle.User.email,
        Bundle: bundle
	});
};
var checkBundle = function(bundle) {
	var days_left = bundle.duration - moment().diff(moment(bundle.dateLive), 'days')
	
	if(days_left >= 0) return;

	bundle.checkSuccess(function(success) {
		if(success) {
			bundle.collect(function() {
				bundle.checkSuccess(function(success) {
					if(success) {
						bundleSuccess(bundle);
					}
					else if( (bundle.isExtended == 0 && days_left <= -2) || bundle.isExtended == 1) {
						bundleFailed(bundle);
					}
				});
			});
			console.log(bundle.id + ' : success');
		}
		else if( (bundle.isExtended == 0 && days_left <= -2) || bundle.isExtended == 1) {
			bundleFailed(bundle);
			console.log(bundle.id + ' : failed');
		}
		else {
			console.log(bundle.id + ' : live');
		}
	});
};

db.Bundle.scope('live').all({include: [{ model: db.Contribution, required: false, include:[ {model: db.Transaction, include: [db.CreditCard]}, db.User ]}, db.User]})
	.then(function(bundles) {
		_.each(bundles, function(bundle) {
			checkBundle(bundle);
		});
	}, function(err) {
		console.log(err);
	});