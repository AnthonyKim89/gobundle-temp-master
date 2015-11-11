angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/view', {
          url: "/bundle/view/:slug?preview",
          templateUrl: "pages/bundle/view.html",
          controller: "bundleViewController as bundleViewCtrl",
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
            preview: ['$stateParams', function($stateParams) {
              return typeof $stateParams.preview === undefined ? 0 : $stateParams.preview;
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
  .controller('bundleViewController', ['$rootScope', '$scope', '$state', '$routeParams', '$timeout', 'BundleDataService', 'currentUser', 'preview', 'bundle', 'BUNDLE_STATUS', 
  	function ($rootScope, $scope, $state, $routeParams, $timeout, BundleDataService, currentUser, preview, bundle, BUNDLE_STATUS) {

      // if(currentUser === null) {
      //   $state.go('landing');
      //   return;
      // }
      if(bundle == null) {
        $state.go('home'); 
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = currentUser !== null;
      $rootScope.siteParams.buttonBack.url = 'home';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = currentUser !== null;


      var init = function() {
        $scope.bundle = bundle;
        $scope.preview = preview;
        $scope.currentUser = currentUser;
        $scope.BUNDLE_STATUS = BUNDLE_STATUS;
        $scope.showBundleOverlay = bundle.status == BUNDLE_STATUS.DRAFTED;
        if($scope.showBundleOverlay) {
          $timeout(function() {
            
          });
        }
        $scope.afterRenderBundlePreview = function() {
            angular.element('.bundle-overlay').css('height', (angular.element('.page-container').height() + 50) + 'px');
            angular.element('.guide-desc').css('top', angular.element('.btn-bundle-add-desc').offset().top + 'px');
            angular.element('.btn-got-it').css('top', angular.element('.btn-bundle-add-desc').offset().top + angular.element('.btn-bundle-add-desc').height() + 'px');
        };


        $scope.bundleProblem = BundleDataService.getBundleProblem($scope.bundle);
        if($scope.bundleProblem != null && $scope.bundleProblem.type != 'FAILED_BUNDLE' && $scope.bundleProblem.type != 'EXPIRED_BUNDLE' && ($scope.currentUser == null || $scope.currentUser.id != $scope.bundle.UserId))  {
          $scope.bundleProblem = null;
        }

        $scope.hasContributed = $scope.currentUser != null && typeof (_.findWhere($scope.bundle.Contributions, {UserId: $scope.currentUser.id})) !== "undefined";

        if(bundle.status === 0) {
          $rootScope.siteParams.clearHookers();
          $rootScope.siteParams.registerBackButtonHooker(function() {
            $rootScope.bundle = bundle;
            $state.go('bundle/wizard', {step: 6});
            return true;
          });
          $rootScope.siteParams.registerCloseButtonHooker(function() {
            $state.go('bundle/delete', {slug:bundle.slug, step: 0});
            return true;
          });
        }
        else {
          $rootScope.siteParams.buttonCloseMenu.show = false;
          $rootScope.siteParams.buttonMenu.show = currentUser !== null;
        }
      };

      $scope.getProgressDescription = function() {
        return BundleDataService.getProgressDescription($scope.bundle);
      };

      $scope.onEditPhoto = function() {
        $state.go('bundle/edit/photo', {slug: $scope.bundle.slug});
      };

      $scope.onEditDesc = function() {
        $state.go('bundle/edit/desc', {slug: $scope.bundle.slug});
      };

      $scope.onMakeLive = function() {
        // $scope.bundle.status = BUNDLE_STATUS.LIVE;
        $scope.bundle.$live().then(function() {
          $state.go('bundle/live', {slug: $scope.bundle.slug});
        });
      };

      $scope.onHideOverlay = function() {
        $scope.showBundleOverlay = false;
      };

      $scope.onThumbnailClick = function() {

      };
      $scope.onLoginRedirect = function() {
        $rootScope.loginRedirect = { url: 'bundle/view', params: {slug:$scope.bundle.slug}};
        $state.go('landing');
      };
      $scope.onHideError= function() {
        $scope.bundleProblem = null;
      };
      // $scope.onExtendBundle = function() {
      //   $rootScope.bundle = bundle;
      //   $state.go('bundle/wizard', {step: 2});
      // };

      $scope.$watch('bundle', function() {
        console.log($scope.bundle);
      }, true);

      init();


  }]);