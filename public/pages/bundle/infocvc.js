angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/infocvc', {
          url: "/bundle/infocvc/:backPage",
          templateUrl: "pages/bundle/infocvc.html",
          controller: "addCardInfoCSVController as addCardInfoCSVCtrl",
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
            backPage: ['$stateParams', function($stateParams) {
              return $stateParams.backPage;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('addCardInfoCSVController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser', 'backPage',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser, backPage) {

  		
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
        $location.path(backPage);
        return true;;
      });


  }]);