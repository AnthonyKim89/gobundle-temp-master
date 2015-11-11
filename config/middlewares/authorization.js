/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send('User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.status(401).send('User is not authorized');
        }
        next();
    }
};

/**
 * bundle authorizations routing middleware
 */
exports.bundle = {
    isOwner: function(req, res, next) {
        if (req.bundle.UserId != req.user.id) {
            return res.status(401).send('User is not authorized');
        }
        next();
    },
    canRead: function(req, res, next) {
        if (req.bundle.UserId != req.user.id && req.bundle.status != 1) {
            return res.status(401).send('User is not authorized');
        }
        next();

    }
};