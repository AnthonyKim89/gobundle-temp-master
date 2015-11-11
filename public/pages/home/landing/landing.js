angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('landing', {
          url: "/",
          templateUrl: "pages/home/landing/landing.html",
          controller: "LandingController as landingCtrl",
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
  .controller('LandingController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser) {

  		if(currentUser !== null) {
  			$state.go('home');
        return;
  		}
      
      $rootScope.siteParams.buttonBack.show = false;
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;
  }]);