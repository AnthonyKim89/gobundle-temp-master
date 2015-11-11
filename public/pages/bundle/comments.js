angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/comments', {
          url: "/bundle/:slug/comments",
          templateUrl: "pages/bundle/comments.html",
          controller: "bundleCommentsController as bundleCommentsCtrl",
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
                bundle.Messages = _.sortBy(bundle.Messages, function(message) {
                  return 1000000000000 - moment(message.createdAt).unix();
                });
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
  .controller('bundleCommentsController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'bundle', 'BUNDLE_STATUS',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, bundle, BUNDLE_STATUS) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      if(bundle === null || bundle.status == BUNDLE_STATUS.DRAFT) {
        $state.go('home'); 
        return;
      }
      
      $rootScope.siteParams.clearHookers();
      
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = {url: 'bundle/view', params: {slug:bundle.slug}};
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = false;
      $rootScope.siteParams.buttonCloseMenu.url = {url: 'bundle/live', params: {slug: bundle.slug}};


      var init = function() {
        $scope.currentUser = currentUser;
        $scope.bundle = bundle;
        $scope.BUNDLE_STATUS= BUNDLE_STATUS;
      };

      init();


  }]);