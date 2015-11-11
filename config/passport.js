
var passport = require('passport');
var _ = require('lodash');
// These are different types of authentication strategies that can be used with Passport. 
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var config = require('./config');
var db = require('./sequelize');

//Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.User.find({where: {id: id}}).then(function(user){
        console.log('Session: { id: ' + user.id + ', email: ' + user.email + ' }');
        done(null, user);
    }, function(err){
        done(err, null);
    });
});

//Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    db.User.find({ where: { email: email }}).then(function(user) {
      if (!user) {
        done(null, false, { message: 'Unknown user' });
      } 
      else if(user.facebookId != "" && user.facebookId != null) {
        done(null, false, { message: 'This account is created by Facebook account'});
      }
      else if (!user.authenticate(password)) {
        done(null, false, { message: 'Invalid password'});
      } else {
        console.log('Login (local) : { id: ' + user.id + ', email: ' + user.email + ' }');
        done(null, user);
      }
    }, function(err){
      done(err);
    });
  }
));

module.exports = passport;

