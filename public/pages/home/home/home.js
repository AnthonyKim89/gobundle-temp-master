angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('home', {
          url: "/home",
          templateUrl: "pages/home/home/home.html",
          controller: "HomeController as homeCtrl",
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
  .controller('HomeController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'Users', 'Bundles', 'Utils',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, Users, Bundles, Utils) {

  		
      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = false;
      $rootScope.siteParams.buttonBack.url = '';
      $rootScope.siteParams.buttonMenu.show = true;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;


      var init = function() {

        $scope.bundles = {
          bundles: [],
          contributions: []
        };
        $scope.showDeleteButton = false;
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

      $scope.onBundleClick = function(bundle) {
        $state.go('bundle/view', {slug: bundle.slug});
      };
      $scope.onShowDeleteButton = function() {
        $scope.showDeleteButton = !$scope.showDeleteButton;
      };
      $scope.onDelete = function(bundle) {
        Utils.showWaiting('Deleting...');
        bundle.$delete()
          .then(function() {

            Utils.hideWaiting();
            loadBundles();
          });
      };


      init();


  }]);