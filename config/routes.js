
var users       = require('../app/controllers/users');
var bundles    = require('../app/controllers/bundles');
var cards    = require('../app/controllers/cards');
var transactions    = require('../app/controllers/transactions');
var contributions = require('../app/controllers/contributions');
var messages    = require('../app/controllers/messages');
var index       = require('../app/controllers/index');
var webhooks       = require('../app/controllers/webhooks');
var test       = require('../app/controllers/test');

exports.init = function(app, passport, auth) {

    console.log('Initializing Routes');

    // User Routes
    app.post    ('/api/users/auth', passport.authenticate('local', {
        successRedirect: '/api/users/me',
        failureRedirect: '/api/users/auth/failed'
    }));
    app.get     ('/api/users/forget', users.requestForget);
    app.post    ('/api/users/forget', users.verifyForget);
    app.put    ('/api/users/forget', users.resetPassword);
    
    app.post    ('/api/users/auth/facebook', users.authFacebook);
    app.get     ('/api/users/signout', auth.requiresLogin, users.signout);
    app.get     ('/api/users/me', auth.requiresLogin, users.me);
    app.get     ('/api/users/:userId', auth.requiresLogin, users.me);
    app.post    ('/api/users', users.create);
    app.put     ('/api/users', auth.requiresLogin, users.update);

    app.get     ('/api/users/auth/failed', users.failed);

    // Finish with setting up the userId param
    app.param('userId', users.user);

    // Bundle Routes
    app.get     ('/api/bundles', auth.requiresLogin, bundles.all);
    app.get     ('/api/bundles/contributions', auth.requiresLogin, bundles.contributions);
    app.get     ('/api/bundles/slug', bundles.showBySlug);
    app.post    ('/api/bundles', auth.requiresLogin, auth.requiresLogin, bundles.create);
    app.get     ('/api/bundles/:bundleId', auth.requiresLogin, auth.bundle.canRead, bundles.show);
    app.put     ('/api/bundles/:bundleId', auth.requiresLogin, auth.bundle.isOwner, bundles.update);
    app.post    ('/api/bundles/:bundleId/live', auth.requiresLogin, auth.bundle.isOwner, bundles.live);
    app.post    ('/api/bundles/:bundleId/extend', auth.requiresLogin, auth.bundle.isOwner, bundles.extend);
    app.del     ('/api/bundles/:bundleId', auth.requiresLogin, auth.bundle.isOwner, bundles.destroy);

    // Finish with setting up the bundleId param
    // Note: the bundles.bundle function will be called everytime then it will call the next function. 
    app.param('bundleId', bundles.bundle);

    // Credit card
    app.get     ('/api/cards', auth.requiresLogin, cards.all);
    app.post    ('/api/cards', auth.requiresLogin, cards.create);
    app.delete  ('/api/cards/:cardId', auth.requiresLogin, cards.destroy);
    app.param('cardId', cards.creditCard);
    // Transaction
    app.get     ('/api/transactions', auth.requiresLogin, transactions.all);
    // Message
    app.post    ('/api/messages', auth.requiresLogin, messages.create);

    //Contribution
    app.post    ('/api/contribution', auth.requiresLogin, contributions.create);
    app.delete  ('/api/contribution', auth.requiresLogin, contributions.delete);


    //Web hooks
    app.post    ('/hook/stripe', webhooks.stripe);

    // Home route
    app.get('/', index.render);

    app.get('/test', test.mail_template);

};
