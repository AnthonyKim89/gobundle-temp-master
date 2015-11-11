/**
 * Module dependencies.
 */
var _ = require('underscore');
var config    = require('../../config/config');


exports.render = function(req, res) {
    res.render('index', {
        user: req.user ? JSON.stringify(req.user) : "null",
        config: config
    });
};
