angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/edit/photo', {
          url: "/bundle/:slug/edit/photo",
          templateUrl: "pages/bundle/edit/bundle.edit.photo.html",
          controller: "bundleEditPhotoController as bundleEditPhotoCtrl",
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
  .controller('bundleEditPhotoController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'DEFAUT_BUNDLE_PHOTO', 'currentUser', 'bundle', 'Utils',
  	function ($rootScope, $scope, $state, $routeParams, $location, DEFAUT_BUNDLE_PHOTO, currentUser, bundle, Utils) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      if(bundle === null) {
        $state.go('home'); 
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
        $scope.DEFAUT_BUNDLE_PHOTO = DEFAUT_BUNDLE_PHOTO;
        $scope.current_photo = '';

        $scope.registerBackHooker();
      };

      $scope.registerBackHooker = function() {
        $rootScope.siteParams.clearHookers();
        $rootScope.siteParams.registerBackButtonHooker(function() {
          $scope.goBack();
          return true;
        });
      };

      $scope.goBack = function() {
        if($scope.current_photo === '') {
          $state.go('bundle/view', {slug: $scope.bundle.slug});
        }
        else {
          $scope.current_photo = '';
          $rootScope.siteParams.buttonBack.show = true;
        }
      };

      $scope.onSave = function () {
        $scope.bundle.photo = $scope.current_photo;
        $scope.bundle.$update()
          .then(function() {
            $scope.current_photo = '';
            $scope.goBack();
          });
      };
      $scope.onBeforeUploadPhoto = function() {
        Utils.showWaiting('Uploading...');
      };
      $scope.onChangePhoto= function(url, apply) {
        Utils.hideWaiting();
        if(apply === false) $scope.current_photo = url;
        else {
          $scope.$apply( function() {
            $scope.current_photo = url;
          });
        }
        $rootScope.siteParams.buttonBack.show = false;
      };



      init();


  }]);