/**
 * Module dependencies.
 */
var should = require('should'),
    db = require('../../../config/sequelize');

//Globals
var user;
var trip;

//The tests
describe('Unit test', function() {
    describe('Model <Trip>:', function() {

        before(function(done) {
            var user_info = {
                name: 'Test user',
                email: 'testuser@mocha.com',
                password: 'randompassword'
            };
            user = db.User.build(user_info);

            user.salt = user.makeSalt();
            user.hashedPassword = user.encryptPassword(user_info.password, user.salt);

            user.save().success(function(res) {
                done();
            });
        });

        describe('Method Create', function() {
            it('should be able to save without problems', function(done) {
                var trip_info = {
                    destination: 'KL',
                    startDate: '2015-5-20',
                    endDate: '2015-5-22',
                    comment: 'some comment',
                    UserId: user.id
                };

                return db.Trip.create(trip_info).success(function(res){
                    trip = res;
                    should.exist(res);
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });

            });

            it('should be able to show an error when try to save without destination', function(done) {
                var trip_info = {
                    destination: '',
                    startDate: '2015-5-20',
                    endDate: '2015-5-22',
                    comment: 'some comment'
                };

                return db.Trip.create(trip_info).success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with invalid startDate format', function(done) {
                var trip_info = {
                    destination: 'KL',
                    startDate: 'some invalid format',
                    endDate: '2015-5-22',
                    comment: 'some comment'
                };

                return db.Trip.create(trip_info).success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });
            
            it('should be able to show an error when try to save with invalid endDate format', function(done) {
                var trip_info = {
                    destination: 'KL',
                    startDate: '2015-5-20',
                    endDate: 'some invalid format',
                    comment: 'some comment'
                };

                return db.Trip.create(trip_info).success(function(res){
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        describe('Method Query', function() {
            it('should be able to save without problems', function(done) {
                db.Trip.find({ where: {id: trip.id}, include: [db.User]}).success(function(res){
                    should.exist(res);
                    done();
                }).error(function(err){
                    should.not.exist(err);
                    done();
                });
            });

            it('should be able to save without problems', function(done) {
                db.Trip.findAll({where: {UserId : user.id}, include: [db.User]}).success(function(trips){
                    should.exist(trips);
                    done();
                }).error(function(err){
                    should.not.exist(err);
                    done();
                });
            });

        });

        describe('Method Update', function() {
            it('should be able to save without problems', function(done) {
                return trip.save().success(function() {
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with destination more than 32 length', function(done) {
                var tmp = trip.destination;
                trip.destination = 'This is destination with more than 32 length';

                return trip.save().success(function(res) {
                    trip.destination = tmp;
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    trip.destination = tmp;
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with invalid startDate format', function(done) {
                var tmp = trip.startDate;
                trip.startDate = 'some invalid format';

                return trip.save().success(function(res) {
                    trip.startDate = tmp;
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    trip.startDate = tmp;
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save with invalid endDate format', function(done) {
                var tmp = trip.endDate;
                trip.endDate = 'some invalid format';

                return trip.save().success(function(res) {
                    trip.endDate = tmp;
                    should.not.exist(res);
                    done();
                }).error(function(err) {
                    trip.endDate = tmp;
                    should.exist(err);
                    done();
                });
            });
        });

        describe('Method Destroy', function() {
            it('should be able to save without problems', function(done) {
                user.destroy();

                return trip.destroy().success(function() {
                    done();
                }).error(function(err) {
                    should.not.exist(err);
                    done();
                });
            });
        });
    });
});