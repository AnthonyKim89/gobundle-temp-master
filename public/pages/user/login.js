angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('login', {
          url: "/login",
          templateUrl: "pages/user/login.html",
          controller: "LoginController as loginCtrl",
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
  .controller('LoginController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'Facebook', 'currentUser', 'Users', 'Utils',
  	function ($rootScope, $scope, $state, $routeParams, $location, Facebook, currentUser, Users, Utils) {

  		
      if(currentUser !== null) {
        $state.go('home');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'landing';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;


  		$scope.error = '';
  		$scope.email = '';
  		$scope.password = '';

  		$scope.login = function() {
        $scope.error = '';
        Utils.showWaiting('Logging in...');
  			Users.auth({
  				email: $scope.email,
  				password: $scope.password
  			}).$promise.then(function(result) {
          Utils.hideWaiting();
    			$rootScope.isLoggedIn = true;
          $rootScope.redirectAfterLogin();
  			}, function(err) {
          Utils.hideWaiting();
  				$scope.error = err.data.errors;
  			});
  		};

      $scope.loginWithFacebook = function() {
        $scope.error = '';
        Utils.showWaiting('Logging in...');
        Facebook.login(function(response) {
          if (response.authResponse) {
            Facebook.api('/me', function(response) {
              Users.authFacebook({
                facebookId: response.id,
                firstname: response.first_name,
                surname: response.last_name,
                dob: null,
                email: null,
                photo: 'http://graph.facebook.com/' + response.id + '/picture?type=square'
              }).$promise.then(function(result) {
                Utils.hideWaiting();
                $rootScope.isLoggedIn = true;
                $rootScope.redirectAfterLogin();
              }, function(err) {
                Utils.hideWaiting();
                $scope.error = err.data.errors;
              });
            });
          }
          else {
            Utils.hideWaiting();
          }
        });
      };

  		$scope.clearError= function() {
  			$scope.error = '';
  		};

  }]);