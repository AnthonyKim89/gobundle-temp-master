angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('reset_password', {
          url: "/reset_password/:token",
          templateUrl: "pages/user/reset_password.html",
          controller: "ResetPasswordController as resetPasswordCtrl",
          resolve: {
            token: ['$stateParams', function($stateParams) {
              return $stateParams.token;
            }],
          	currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
            	var deferred = $q.defer();

          		Users.me().$promise.then(function(user) {
          			deferred.resolve(user);
          		}, function(err) {
          			deferred.resolve(null);
          		});

          		return deferred.promise;
          	}]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('ResetPasswordController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'Users', 'token',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, Users, token) {

  		if(currentUser !== null) {
  			// $state.go('home');
        // return;
  		}
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'login';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;

  		$scope.error = '';
      $scope.user = null;

      Users.verifyForget({token: token})
        .$promise.then(function(user) {
          $scope.error = '';
          $scope.user = user;
          $scope.user.password = '';
          $scope.user.cpassword = '';
        }, function(err) {
          $scope.error = err.data.errors[Object.keys(err.data.errors)[0]][0];
        });

      $scope.onSave = function () {
        Users.resetPassword({token: token, password: $scope.user.password})
          .$promise.then(function() {
            $state.go('landing');
          }, function(err) {
            $scope.error = err.data.errors[Object.keys(err.data.errors)[0]][0];
          });
      };

      $scope.canSave= function() {
        if($scope.user === null) return false;
        if($scope.user.password === '') return false;
        if($scope.user.cpassword != $scope.user.password) return false;
        return true;
      };

  }]);