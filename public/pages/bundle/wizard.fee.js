angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/fee', {
          url: "/bundle/fee",
          templateUrl: "pages/bundle/wizard.fee.html",
          controller: "wizardFeeController as wizardFeeCtrl",
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
  .controller('wizardFeeController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'APP_SETTINGS',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, APP_SETTINGS) {

  		
      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = false;
      $rootScope.siteParams.buttonBack.url = '';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = true;
      $rootScope.siteParams.buttonCloseMenu.show = true;

      $rootScope.siteParams.registerCloseButtonHooker(function() {
        $state.go('bundle/wizard', {step: 4});
        return true;;
      });

      $scope.APP_SETTINGS = APP_SETTINGS;


  }]);