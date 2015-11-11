/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');

/**
 * Find message by id
 * Note: This is called every time that the parameter :messageId is used in a URL. 
 * Its purpose is to preload the message on the req object then call the next function. 
 */
exports.message = function(req, res, next, id) {
    console.log('id => ' + id);
    db.Message.scope('all').find({ where: {id: id}, include: [db.User, db.Contribution, db.Message]}).then(function(message){
        if(!message) {
            return next(new Error('Failed to load message ' + id));
        } else {
            req.message = message;
            return next();            
        }
    }, function(err){
        return next(err);
    });
};

/**
 * Create a message
 */
exports.create = function(req, res) {
    // augment the message by adding the UserId
    req.body.UserId = req.user.id;
    req.body.status = 0;
    // save and return and instance of message on the res object. 
    db.Message.create(req.body).then(function(message){
        if(!message){
            return res.status(500).send({errors: err});
        } else {
            return res.jsonp(message);
        }
    }, function(err){
        return res.status(500).send({ 
            errors: err,
            status: 500
        });
    });
};

/**
 * Update a message
 */
exports.update = function(req, res) {

    // create a new variable to hold the message that was placed on the req object.
    var message = req.message;
    if(message === null) {
        return res.status(500).send({
            error: {message: ['Message not found.']}, 
            status: 500
        });
    }

    message.updateAttributes({
        message: req.body.message,
        attachment: req.body.attachment
    }).then(function(a){
        return res.jsonp(a);
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};

/**
 * Delete an message
 */
exports.destroy = function(req, res) {

    // create a new variable to hold the message that was placed on the req object.
    var message = req.message;

    if(message === null) {
        return res.status(500).send({
            error: {message: ['Message not found.']}, 
            status: 500
        });
    }

    message.destroy().then(function(a){
        return res.jsonp(a);
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};

/**
 * Show an message
 */
exports.show = function(req, res) {
    // Sending down the message that was just preloaded by the messages.message function
    // and saves message on the req object.
    return res.jsonp(req.message);
};

/**
 * List of messages
 */
exports.all = function(req, res) {
    req.user.getMessages()
        .then(function(messages) {
            return res.jsonp(messages);
        }, function(err) {
            return res.status(500).send({
                error: err, 
                status: 500
            });
        });
};