angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/wizard', {
          url: "/bundle/wizard/:step",
          templateUrl: "pages/bundle/wizard.html",
          controller: "bundleWizardController as wizardCtrl",
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
            step: ['$stateParams', function($stateParams) {
              var step = parseInt($stateParams.step);
              if(isNaN(step) || typeof step == "undefined" || step < 1 || step > 6)
                return 1;
              return step;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('bundleWizardController', ['$rootScope', '$scope', '$state', '$routeParams', '$filter', '$location', 'currentUser', 'step', 'Users', 'Bundles', 'BundleDataService', 'APP_SETTINGS', 'BUNDLE_FOR', 'BUNDLE_TYPE', 'BUNDLE_TARGET_TYPE', 'BUNDLE_PEOPLE_COUNT', 'BUNDLE_DURATION', 'DEFAUT_BUNDLE_PHOTO', 'BUNDLE_STATUS',
  	function ($rootScope, $scope, $state, $routeParams, $filter, $location, currentUser, step, Users, Bundles, BundleDataService, APP_SETTINGS, BUNDLE_FOR, BUNDLE_TYPE, BUNDLE_TARGET_TYPE, BUNDLE_PEOPLE_COUNT, BUNDLE_DURATION, DEFAUT_BUNDLE_PHOTO, BUNDLE_STATUS) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'home';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = true;


      var init = function() {
        $scope.step = step;
        if(step == 1 || typeof $rootScope.bundle == "undefined") {
          step = 1;
          $scope.step = 1;
          $rootScope.bundle = new Bundles({
            id: '',
            bundleFor: 0,
            bundleType: 0,
            bundleName: '',
            target: '£',
            targetType: 0,
            minPeopleCount: BUNDLE_PEOPLE_COUNT.DEFAULT_MIN,
            maxPeopleCount: BUNDLE_PEOPLE_COUNT.DEFAULT_MAX,
            duration: BUNDLE_DURATION.DEFAULT,
            photo: '',
            description: ''
          });
        }
        $scope.error = '';
        $scope.percentCompleted = 0;

        $scope.BUNDLE_FOR = BUNDLE_FOR;
        $scope.BUNDLE_TYPE = BUNDLE_TYPE;
        $scope.BUNDLE_TARGET_TYPE = BUNDLE_TARGET_TYPE;
        $scope.BUNDLE_PEOPLE_COUNT = BUNDLE_PEOPLE_COUNT;
        $scope.BUNDLE_DURATION = BUNDLE_DURATION;
      };

      $scope.$watch('step', function() {
        if($scope.step == 1) {
          $rootScope.siteParams.clearHookers();
        }
        else {
          $rootScope.siteParams.clearHookers();
          $rootScope.siteParams.registerBackButtonHooker(function() {
            $scope.onStepPrev();
            return true;
          });
        }
        $rootScope.siteParams.registerCloseButtonHooker(function() {
          if($scope.step == 1 && $rootScope.bundle.id === '') return false;

          if($rootScope.bundle.id !== '') {
            $state.go('bundle/delete', {slug:$rootScope.bundle.slug, step: $scope.step});
          }    
          else {
            $state.go('bundle/delete', {step:$scope.step});
          }
          return true;
        });

        switch($scope.step) {
          case 1: $scope.percentCompleted = 3; break;
          case 2: $scope.percentCompleted = 10; break;
          case 3: $scope.percentCompleted = 25; break;
          case 4: $scope.percentCompleted = 50; break;
          case 5: $scope.percentCompleted = 60; break;
          case 6: $scope.percentCompleted = 75; break;
        }

        if($scope.step == 4) {
          if(!isNaN(parseInt($rootScope.bundle.target))) {
            $rootScope.bundle.target = '£' + $rootScope.bundle.target;
          }
        }
      }, true);

      $rootScope.$watch('bundle.target', function() {
        if($rootScope.bundle.target == "") {
          $rootScope.bundle.target = '£';
        }
      }, true);

      $scope.onStepPrev = function() {
        $scope.error = '';
        if($scope.step == 6 && $scope.bundle.bundleType == 0) $scope.step --;
        $scope.step --;
      };

      $scope.onStepNext = function() {
        $scope.error = '';
        switch($scope.step) {
          case 1: {
            if( $rootScope.isEmpty($rootScope.bundle.bundleFor) ) {
              $scope.error = 'Please select bundle category.';
              return;
            }
            break;
          }

          case 2: {
            if( $rootScope.isEmpty($rootScope.bundle.bundleName) ) {
              $scope.error = 'Please enter bundle name.';
              return;
            }
            else if($rootScope.bundle.bundleName.length < 3) {
              $scope.error = 'At least 3 charactors.';
              return; 
            }
            else if($rootScope.bundle.bundleName.length > 32) {
              $scope.error = 'Too many charactors.';
              return; 
            }
            break;
          }

          case 3: {
            if( $rootScope.isEmpty($rootScope.bundle.bundleType) ) {
              $scope.error = 'Please select bundle type.';
              return;
            }
            break;
          }

          case 4: {
            $rootScope.bundle.target = $rootScope.bundle.target.toString().replace('£', '');
            if( $rootScope.isEmpty($rootScope.bundle.target) ) {
              $scope.error = 'Please enter amount.';
              return;
            }
            if($scope.bundle.bundleType == 0) $scope.step ++;
            break;
          }

          case 6: {
            var $promise = null;

            if($rootScope.bundle.photo == '') $rootScope.bundle.photo = DEFAUT_BUNDLE_PHOTO[0];
            if($rootScope.bundle.description == '') $rootScope.bundle.description = BundleDataService.generateDefaultBundleDescription($rootScope.bundle);

            var preview = 0;
            if($rootScope.bundle.id == '') { $promise = $rootScope.bundle.$save(); preview = 1; }
            else $promise = $rootScope.bundle.$update();
            $promise.then(function() {
              if($rootScope.bundle.status == BUNDLE_STATUS.LIVE) {
                $rootScope.bundle.$live().then(function() {
                  $state.go('bundle/view', {slug: $rootScope.bundle.slug, preview: preview});
                });
              }
              else {
                $state.go('bundle/view', {slug: $rootScope.bundle.slug, preview: preview});
              }
            });
            return;
            break;
          }
        }
        $scope.step ++;
      };

      $scope.getPriceExcludeFee = function() {
        var target = parseInt($rootScope.bundle.target.toString().replace('£', ''));
        if(isNaN(target)) return 0;
        return $filter('number')(target * (100 - APP_SETTINGS.BUNDLE_FEE) / 100, 2);
      };

      $rootScope.$watch('bundle', function() {
        console.log($rootScope.bundle);
      }, true);

      init();


  }]);