/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var moment = require('moment');

/**
 * Find bundle by id
 * Note: This is called every time that the parameter :bundleId is used in a URL. 
 * Its purpose is to preload the bundle on the req object then call the next function. 
 */
exports.bundle = function(req, res, next, id) {
    console.log('id => ' + id);
    db.Bundle.scope('all').find({ where: {'id': id}, include: [db.User, {model: db.Contribution, required: false}, {model: db.Message, include: [db.User]}]})
    .then(function(bundle){
        if(!bundle) {
            return next(new Error('Failed to load bundle ' + id));
        } else {
            req.bundle = bundle;
            return next();            
        }
    }, function(err){
        return next(err);
    });
};

/**
 * Create a bundle
 */
exports.create = function(req, res) {
    // augment the bundle by adding the UserId
    req.body.UserId = req.user.id;
    req.body.status = 0;
    // save and return and instance of bundle on the res object. 
    db.Bundle.create(req.body)
    .then(function(bundle){
        if(!bundle){
            return res.status(500).send({errors: err});
        } else {
            return res.jsonp(bundle);
        }
    }, function(err){
        return res.status(500).send({ 
            error: err,
            status: 500
        });
    });
};

/**
 * Update a bundle
 */
exports.update = function(req, res) {

    // create a new variable to hold the bundle that was placed on the req object.
    var bundle = req.bundle;
    if(bundle === null) {
        return res.status(500).send({
            error: {bundle: ['Bundle not found.']}, 
            status: 500
        });
    }

    bundle.updateAttributes({
        bundleFor: req.body.bundleFor,
        bundleType: req.body.bundleType,
        bundleName: req.body.bundleName,
        target: req.body.target,
        targetType: req.body.targetType,
        minPeopleCount: req.body.minPeopleCount,
        maxPeopleCount: req.body.maxPeopleCount,
        duration: req.body.duration,
        photo: req.body.photo,
        description: req.body.description,
        status: req.body.status
    }).then(function(a){
        return res.jsonp(a);
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};

exports.live = function(req, res) {
    // create a new variable to hold the bundle that was placed on the req object.
    var bundle = req.bundle;
    if(bundle === null) {
        return res.status(500).send({
            error: {bundle: ['Bundle not found.']}, 
            status: 500
        });
    }

    bundle.updateAttributes({
        status: 1,
        dateLive: moment().format()
    }).then(function(a){
        return res.jsonp(a);
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};

exports.extend = function(req, res) {
    var bundle = req.bundle;
    if(bundle === null) {
        return res.status(500).send({
            error: {bundle: ['Bundle not found.']}, 
            status: 500
        });
    }
    if(bundle.isExtended == 1) {
        return res.status(500).send({
            error: {bundle: ['Bundle not found.']}, 
            status: 500
        });   
    }
    if(req.query.duration != 3 && req.query.duration != 5  &&req.query.duration != 7 ) {
        return res.status(500).send({
            error: {duration: ['Invalid duration.']},
            status: 500
        });
    }

    bundle.updateAttributes({
        status: 1,
        dateLive: moment().format(),
        isExtended: 1,
        duration: req.query.duration
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
 * Delete an bundle
 */
exports.destroy = function(req, res) {

    // create a new variable to hold the bundle that was placed on the req object.
    var bundle = req.bundle;

    if(bundle === null) {
        return res.status(500).send({
            error: {bundle: ['Bundle not found.']}, 
            status: 500
        });
    }

    bundle.updateAttributes({
        status: 2
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
 * Show an bundle
 */
exports.show = function(req, res) {
    // Sending down the bundle that was just preloaded by the bundles.bundle function
    // and saves bundle on the req object.
    return res.jsonp(req.bundle);
};

exports.showBySlug = function(req, res) {
    db.Bundle.scope('not_deleted').find({ where: ['slug LIKE ?', req.query.slug], include: [db.User, { model: db.Contribution, where: {status: 1}, required: false, include:[ db.Transaction, db.User ]}, {model: db.Message, include: [db.User]}]})
    .then(function(bundle){
        if(!bundle || 
            (bundle && !req.isAuthenticated() && bundle.status != 1) ||
            (bundle && req.isAuthenticated() && bundle.UserId != req.user.id && (bundle.status === 0 || bundle.status === 2))
        ) {
            return res.status(500).send({
                error: 'Failed to load bundle ' + req.query.slug,
                status:500
            });
        } else {
            return res.jsonp(bundle);        
        }
    }, function(err){
        return res.status(500).send({
            error: err, 
            status: 500
        });
    });
};
/**
 * List of bundles
 */
exports.all = function(req, res) {
    req.user.getBundles({include: [{ model: db.Contribution, required: false, include:[ db.Transaction, db.User ]}, db.User]})
        .then(function(bundles) {
            return res.jsonp(bundles);
        })
        .error(function(err) {
            return res.status(500).send({
                error: err, 
                status: 500
            });
        });
};
/**
 * List of Contributions
 */
exports.contributions = function(req, res) {
    req.user.getContributions({
            where: {
                status: 1
            },
            required: false,
            include: [{
                    model: db.Bundle, 
                    where: ['Bundle.status != 2'], 
                    include: [{ 
                        model: db.Contribution, 
                        include:[ db.Transaction, db.User ]
                    },
                    db.User]
                }, 
                db.Transaction, 
                db.User
            ]
        })
        .then(function(contributions) {
            return res.jsonp(contributions);
        }, function(err) {
            return res.status(500).send({
                error: err, 
                status: 500
            });
        });
};