angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('forget_password', {
          url: "/forget_password",
          templateUrl: "pages/user/forget_password.html",
          controller: "ForgetPasswordController as forgetPasswordCtrl",
          resolve: {
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
  .controller('ForgetPasswordController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'Users',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, Users) {

  		if(currentUser !== null) {
  			$state.go('home');
        return;
  		}
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'login';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;

  		$scope.error = '';
      $scope.email = '';

  		$scope.send = function() {
  			Users.requestForget({email: $scope.email})
          .$promise.then(function(result) {
            $scope.error = 'We have sent an email. Please check your inbox.'
          }, function(err) {
            console.log(err);
            $scope.error = err.data.errors[Object.keys(err.data.errors)[0]][0];
          });
  		};

  		$scope.clearError= function() {
  			$scope.error = '';
  		};

  }]);