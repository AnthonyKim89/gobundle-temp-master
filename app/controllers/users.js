/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');
var md5 = require('MD5');
var async = require('async');
var validator = require('validator');
var mailer = require('../lib/mailer');

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  return res.jsonp({});
};

exports.failed = function(req, res) {
  return res.status(400).send({ 
      errors: "Woops, wrong email or password!",
      status: 400
  });
};

/**
 * func user
 */
exports.create = function(req, res) {
    if(req.body.firstname === "") {
      return res.status(500).send({ 
        errors: {firstname:['Please enter first name.']},
        status: 500
      });
    }
    if(req.body.surname === "") {
      return res.status(500).send({ 
        errors: {surname:['Please enter surname.']},
        status: 500
      });
    }
    if(req.body.email === '') {
      return res.status(500).send({ 
        errors: {email:['Please enter email address.']},
        status: 500
      }); 
    }
    if( !validator.isEmail(req.body.email) ) {
        return res.status(500).send({ 
          errors: {email:['Please enter valid email address.']},
          status: 500
        });
    }
    if( req.body.dob === "" ) {
        return res.status(500).send({ 
          errors: {dob:['Please enter date of birth.']},
          status: 500
        });
    }
    if( !validator.isDate(req.body.dob) ) {
        return res.status(500).send({ 
          errors: {dob:['Date of birth is not in correct format.']},
          status: 500
        });
    }
    if(req.body.password === null || req.body.password.length < 6) {
      return res.status(500).send({ 
        errors: {dob:['Passwords must be at least 6 charactors.']},
        status: 500
      }); 
    }


    var user = db.User.build({
      firstname: req.body.firstname,
      surname: req.body.surname,
      dob: req.body.dob,
      email: req.body.email,
      photo: req.body.photo,
      status: 0,
      verification: md5(Date.now())
    });

    user.salt = user.makeSalt();
    user.hashedPassword = user.encryptPassword(req.body.password, user.salt);
    
    db.User.find({where:{email:user.email}})
      .then(function(result) {
        if(result) {
          return res.status(500).send({ 
            errors: {email:['Email address is already in use.']},
            status: 500
          });
        }

        user.save().then(function(){
          mailer.email_welcome(user);
          
          req.login(user, function(err){
            res.jsonp(user);
          });
        }, function(err){
          return res.status(500).send({ 
              errors: err,
              status: 500
          });
        });
      });

};

exports.update = function(req, res) {
  
  if(req.body.firstname === "") {
    return res.status(500).send({ 
      errors: {firstname:['Please enter first name.']},
      status: 500
    });
  }
  if(req.body.surname === "") {
    return res.status(500).send({ 
      errors: {surname:['Please enter surname.']},
      status: 500
    });
  }
  if(req.body.email === '') {
    return res.status(500).send({ 
      errors: {email:['Please enter email address.']},
      status: 500
    }); 
  }
  if( !validator.isEmail(req.body.email) ) {
      return res.status(500).send({ 
        errors: {email:['Please enter valid email address.']},
        status: 500
      });
  }
  if( req.body.dob !== "" && req.body.dob !== null && !validator.isDate(req.body.dob) ) {
      return res.status(500).send({ 
        errors: {dob:['Date of birth is not in correct format.']},
        status: 500
      });
  }
  if(req.user.facebookId === null && req.user.facebookId === "" && (req.body.password === null || req.body.password.length < 6)) {
    return res.status(500).send({ 
      errors: {dob:['Passwords must be at least 6 charactors.']},
      status: 500
    }); 
  }
      

  req.user.firstname = req.body.firstname;
  req.user.surname = req.body.surname;
  if(req.body.dob !== null && req.body.dob !== "") {
    req.user.dob = req.body.dob;
  }
  req.user.photo = req.body.photo;
  if(req.body.password !== null && req.body.password !== "") {
    req.user.salt = req.user.makeSalt();
    req.user.hashedPassword = req.user.encryptPassword(req.body.password, req.user.salt);
  }
  req.user.email = req.body.email;

  db.User.find({where:{email:req.body.email}})
    .then(function(result) {
      if(result && result.id != req.user.id) {
        return res.status(500).send({ 
          errors: {email:['Email address is already in use.']},
          status: 500
        });
      }

      req.user.save().then(function(){
        res.jsonp(req.user);
      }, function(err){
        return res.status(500).send({ 
            errors: err,
            status: 500
        });
      });
    });
  
};

/**
 * facebook auth
 */
exports.authFacebook = function(req, res) {
  if(req.body.facebookId === "" || req.body.facebookId === null) {
    return res.status(500).send({ 
        errors: {facebookId: ['Facebook ID is required.']},
        status: 500
    });
  }

  db.User.find({where:{facebookId: req.body.facebookId}})
    .then(function(user) {
      if(user) {
        req.login(user, function(err){
          res.jsonp(user);
        });
      }
      else {
        user = db.User.build({
          firstname: req.body.firstname,
          surname: req.body.surname,
          dob: null,
          email: null,
          photo: req.body.photo,
          facebookId: req.body.facebookId,
          status: 0,
          verification: md5(Date.now())
        });

        user.save().then(function(){
          req.login(user, function(err){
            res.jsonp(user);
          });
        }, function(err){
          return res.status(500).send({ 
              errors: err,
              status: 500
          });
        });
      }

    });
};

/**
 * Forget password
 */
exports.requestForget = function(req, res) {
  db.User.find({where:{email:req.query.email}})
    .then(function(user) {
      if(!user) {
        return res.status(500).send({ 
          errors: {email:['Email address does not exist.']},
          status: 500
        });
      }
      else if(user.facebookId !== "" && user.facebookId !== null) {
        return res.status(500).send({ 
          errors: {email:['User account with this email address seems to be created with Open ID.']},
          status: 500
        });
      }
      else {
        user.token = md5(Date.now());
        user.tokenExpiry = new Date((new Date()).getTime() + 2 * 60 * 60 * 1000); //expire in 2 hours
        user.save().then(function() {

            mailer.email_forget_password(user);

            return res.send({
              
            });
          }, function(err) {
            return res.status(500).send({ 
                errors: err,
                status: 500
            });
          });
      }
    });
};

exports.verifyForget = function(req, res) {
  db.User.find({where:{token:req.body.token}})
    .then(function(user) {
      if(!user) {
        return res.status(500).send({ 
          errors: {token:['Invalid token specified.']},
          status: 500
        });
      }
      else if(user.tokenExpiry.getTime() <= new Date().getTime()) {
        return res.status(500).send({ 
          errors: {email:['Token has expired. Please try again.']},
          status: 500
        });
      }
      else {
        res.jsonp(user);
        // user.token = '';
        // user.tokenExpiry = null;
        // user.save()
        //   .then(function() {
        //     req.login(user, function(err){
        //     });
        //   });        
      }
    });
};
exports.resetPassword = function(req, res) {
  db.User.find({where:{token:req.body.token}})
    .then(function(user) {
      if(!user) {
        return res.status(500).send({ 
          errors: {token:['Invalid token specified.']},
          status: 500
        });
      }
      else if(user.tokenExpiry.getTime() <= new Date().getTime()) {
        return res.status(500).send({ 
          errors: {email:['Token has expired. Please try again.']},
          status: 500
        });
      }
      else if(!req.body.password){
        return res.status(500).send({ 
          errors: {password:['Please enter password.']},
          status: 500
        });
      }
      else {
        user.salt = user.makeSalt();
        user.hashedPassword = user.encryptPassword(req.body.password, user.salt);
        
        user.token = '';
        user.tokenExpiry = null;
        user.save()
          .then(function() {
            res.jsonp(user);
          });        
      }
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user);
};


exports.user = function(req, res, next, id) {
  db.User.find({where : { id: id}}).then ( function(user) {
    if(!user) return next(new Error("Failed to load User " + id));
    req.profile = user;
    next();
  }, function(err) {
    next(err);
  });
};