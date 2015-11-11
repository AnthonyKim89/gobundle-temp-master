angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/extend', {
          url: "/bundle/extend/:slug",
          templateUrl: "pages/bundle/extend.html",
          controller: "bundleExtendController as bundleExtendCtrl",
          resolve: {
          	currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
            	var deferred = $q.defer();

          		Users.me().$promise.then(function(user) {
          			deferred.resolve(user);
          		}, function(err) {
          			deferred.resolve(null);
          		});

          		return deferred.promise;
          	}],
            bundle: ['$stateParams', '$q', 'Bundles', function($stateParams, $q, Bundles) {
              var deferred = $q.defer();

              Bundles.getBySlug({slug: $stateParams.slug}).$promise.then(function(bundle) {
                deferred.resolve(bundle);
              }, function(err) {
                deferred.resolve(null);
              });

              return deferred.promise;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('bundleExtendController', ['$rootScope', '$scope', '$state', '$routeParams', '$timeout', 'BundleDataService', 'currentUser', 'bundle', 'BUNDLE_EXTEND_DAYS', 
  	function ($rootScope, $scope, $state, $routeParams, $timeout, BundleDataService, currentUser, bundle, BUNDLE_EXTEND_DAYS) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      if(bundle == null) {
        $state.go('home'); 
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = {url: 'bundle/view', params:{slug:bundle.slug}};
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;


      var init = function() {
        $scope.bundle = bundle;
        $scope.currentUser = currentUser;
        $scope.BUNDLE_EXTEND_DAYS = BUNDLE_EXTEND_DAYS;
        $scope.extendDays = 0;

        $scope.bundleProblem = BundleDataService.getBundleProblem($scope.bundle);
        console.log($scope.bundleProblem);

        if($scope.bundleProblem.type != 'EXPIRED_BUNDLE') {
          $scope.go('home');
          return;
        }
      };

      $scope.onExtend = function() {
        $scope.bundle.$extend({
          duration: BUNDLE_EXTEND_DAYS[$scope.extendDays]
        }).then(function() {
          $state.go('bundle/view', {slug: $scope.bundle.slug});
        });
      };

      init();


  }]);