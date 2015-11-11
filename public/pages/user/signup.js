angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('signup', {
          url: "/signup",
          templateUrl: "pages/user/signup.html",
          controller: "SignupController as signupCtrl",
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
  .controller('SignupController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'Facebook', 'currentUser', 'Users', 'DEFAULT_AVATARS', 'Utils',
  	function ($rootScope, $scope, $state, $routeParams, $location, Facebook, currentUser, Users, DEFAULT_AVATARS, Utils) {

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

      $scope.isSigningup = false;
  		$scope.error = '';
      $scope.user = new Users({
        email: '',
        password: '',
        firstname: '',
        surname: '',
        dob: '',
        photo: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]
      });
      $scope.confirm_password = '';

  		$scope.signup = function() {
        $scope.error = '';
        if($scope.confirm_password !== $scope.user.password) {
          $scope.error = 'Confirm password does not match.';
          return;
        }

        //English date format
        var dob = moment($scope.user.dob, "DD/MM/YYYY");
        if(dob.isValid()) {
          $scope.user.dob = dob.format('MM/DD/YYYY');
        }
        else {
          $scope.error = 'Please enter valid date of birth.';
          return;
        }

        Utils.showWaiting('Signing up...');
        $scope.isSigningup = true;
  			$scope.user.$save().then(function(user) {
          $scope.user.dob = moment($scope.user.dob).format('MM/DD/YYYY');
          $scope.user.password = $scope.confirm_password;
          Utils.hideWaiting();
          $rootScope.redirectAfterLogin();
          $rootScope.isLoggedIn = true;
        }, function(err) {
          $scope.isSigningup = false;
          Utils.hideWaiting();
          $scope.error = err.data.errors[Object.keys(err.data.errors)[0]][0];
        });
  		};

      $scope.loginWithFacebook = function() {

        Utils.showWaiting('Logging in...');
        $scope.error = '';
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

      $scope.changePlaceholder = function($event, placeholder) {
        angular.element($event.target).attr('placeholder', placeholder);
      };

  }]);