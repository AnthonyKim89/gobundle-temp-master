angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/delete', {
          url: "/bundle/delete/:step/:slug",
          templateUrl: "pages/bundle/delete.html",
          controller: "bundleDeleteController as bundleDeleteCtrl",
          resolve: {
          	currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
            	var deferred = $q.defer();

          		Users.get({userId: 'me'}).$promise.then(function(user) {
                deferred.resolve(user);
          		}, function(err) {
          			deferred.resolve(null);
          		});

          		return deferred.promise;
          	}],
            bundle: ['$stateParams', '$q', 'Bundles', function($stateParams, $q, Bundles) {
              var deferred = $q.defer();
              if(typeof $stateParams.slug === 'undefined' || $stateParams.slug === null || $stateParams.slug === "") deferred.resolve(null);
              else {
                Bundles.getBySlug({slug: $stateParams.slug}).$promise.then(function(bundle) {
                  deferred.resolve(bundle);
                }, function(err) {
                  deferred.resolve(null);
                });
              }

              return deferred.promise;
            }],
            step: ['$stateParams', function($stateParams) {
              var step = parseInt($stateParams.step);
              if(isNaN(step) || typeof step == "undefined")
                return 0;
              return step;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('bundleDeleteController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'bundle', 'step', 'BUNDLE_STATUS',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, bundle, step, BUNDLE_STATUS) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = '';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;



      var init = function() {
        $scope.currentUser = currentUser;
        $scope.bundle = bundle;

        $rootScope.siteParams.clearHookers();
        $rootScope.siteParams.registerBackButtonHooker(function() {
          $scope.onBack();
          return true;
        });
      };

      $scope.onDelete = function() {
        if(bundle === null) {
          $state.go('home');
        }
        else {
          bundle.$delete()
            .then(function() {
              $state.go('home');
            });
        }        
      };
      $scope.onBack = function() {
        if(step !== 0) {
          $state.go('bundle/wizard', {step: step});
        }
        else {
          $state.go('bundle/view', {slug: bundle.slug});
        }
      };

      init();


  }]);