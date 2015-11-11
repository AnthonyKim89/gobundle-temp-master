angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('about', {
          url: "/about",
          templateUrl: "pages/home/about/about.html",
          controller: "AboutController as aboutCtrl",
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
  .controller('AboutController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser) {

  		
      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'menu';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = true;
      $rootScope.siteParams.buttonCloseMenu.show = true;

      $scope.images = ['img/about/gift.png', 'img/about/holidays.png', 'img/about/nightout.png', 'img/about/party.png', 'img/about/weekend.png'];

      var rotateImage = function($apply) {
        var index = $scope.curImageIndex;

        index ++; 
        if( index >= $scope.images.length) {
          index = 0;
        }
        if($apply) {
          $scope.$apply(function() {
            $scope.curImageIndex = index;
          });
        }
        else {
          $scope.curImageIndex = index;
        }

        setTimeout(function() {
          rotateImage(true);
        }, 3000);
      };
      $scope.curImageIndex = 0;
      rotateImage(false);


  }]);