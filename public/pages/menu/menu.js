angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('menu', {
          url: "/menu",
          templateUrl: "pages/menu/menu.html",
          controller: "MenuController as menuCtrl",
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
  .controller('MenuController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'Users', 'Bundles',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, Users, Bundles) {

  		
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


      var init = function() {

        $scope.bundles = {
          bundles: [],
          contributions: []
        };
        loadBundles();
      };

      var loadBundles = function() {
        Bundles.query().$promise
          .then(function(bundles) {
            $scope.bundles.bundles = bundles;
          }, function(err) {
            $scope.bundles.bundles = [];
          });
        Bundles.contributions().$promise
          .then(function(contributions) {
            $scope.bundles.contributions = contributions;
          }, function(err) {
            $scope.bundles.contributions = [];
          });
      };


      init();


  }]);