angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('account/name', {
          url: "/account/name",
          templateUrl: "pages/user/account.edit_name.html",
          controller: "accountEditNameController as accountEditNameCtrl",
          resolve: {
          	currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
            	var deferred = $q.defer();

          		Users.get({userId: 'me'}).$promise.then(function(user) {
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
  .controller('accountEditNameController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'Users', 'currentUser',
  	function ($rootScope, $scope, $state, $routeParams, $location, Users, currentUser) {

  		
      if(currentUser === null) {
        $state.go('landing');
        return;
      }

      currentUser.password = '';
      $scope.error = '';
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'account';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = true;
      $rootScope.siteParams.buttonCloseMenu.show = true;


      var init = function() {
        $scope.currentUser = currentUser;
      };

      $scope.onSave = function (apply) {
        $scope.currentUser.$update()
          .then(function() {
            $state.go('account');
          }, function(err) {
            $scope.error = err.data.errors[Object.keys(err.data.errors)[0]][0];
          });
      };

      init();


  }]);