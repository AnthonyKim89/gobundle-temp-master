/**
 * Module dependencies.
 */
var should = require('should'),
    db = require('../../../config/sequelize');

//Globals
var user;

//The tests
describe('Unit test', function() {
    describe('Model <User>:', function() {
        describe('Method Create', function() {
            it('should be able to save without problems', function(done) {

                var user_info = {
                    name: 'Test user',
                    email: 'testuser@mocha.com',
                    password: 'randompassword'
                };
                user = db.User.build(user_info);

                user.salt = user.makeSalt();
                user.hashedPassword = user.encryptPassword(user_info.password, user.salt);

                return user.save().success(function(res){
                    should.exist(res);
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });

            });

            it('should be able to show an error when try to save without name', function(done) {
                var user_info = {
                    name: '',
                    email: 'testuser1@mocha.com',
                    password: 'randompassword'
                };
                var user1 = db.User.build(user_info);

                user1.salt = user1.makeSalt();
                user1.hashedPassword = user1.encryptPassword(user_info.password, user1.salt);

                return user1.save().success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with invalid email', function(done) {
                var user_info = {
                    name: 'Test user',
                    email: 'some invalid email',
                    password: 'randompassword'
                };
                var user1 = db.User.build(user_info);

                user1.salt = user1.makeSalt();
                user1.hashedPassword = user1.encryptPassword(user_info.password, user1.salt);

                return user1.save().success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without password', function(done) {
                var user_info = {
                    name: 'Test user',
                    email: 'testuser1@mocha.com',
                    password: ''
                };
                var user1 = db.User.build(user_info);

                user1.salt = user1.makeSalt();
                user1.hashedPassword = user1.encryptPassword(user_info.password, user1.salt);

                return user1.save().success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        describe('Method Update', function() {
            it('should be able to save without problems', function(done) {
                return user.save().success(function(res) {
                    should.exist(res);
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without name', function(done) {
                var tmp = user.name;
                user.name = '';

                return user.save().success(function(res) {
                    user.name = tmp;
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    user.name = tmp;
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with invalid email', function(done) {
                var tmp = user.email;
                user.email = 'invalid email address';

                return user.save().success(function(res) {
                    user.email = tmp;
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    user.email = tmp;
                    should.exist(err);
                    done();
                });
            });
        });

        describe('Method Destroy', function() {
            it('should be able to save without problems', function(done) {
                return user.destroy().success(function() {
                    should.exist('Success');
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });
            });
        });
    });
});