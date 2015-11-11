angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('account/password', {
          url: "/account/password",
          templateUrl: "pages/user/account.edit_password.html",
          controller: "accountEditPasswordController as accountEditPasswordCtrl",
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
  .controller('accountEditPasswordController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'currentUser',
  	function ($rootScope, $scope, $state, $routeParams, $location, currentUser) {

  		
      if(currentUser === null) {
        $state.go('landing');
        return;
      }

      currentUser.password = '';
      $scope.error = '';
      $scope.password = '';
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

      $scope.canSave= function() {
        if($scope.currentUser.password == '') return false;
        if($scope.password != $scope.currentUser.password) return false;
        return true;
      };



      init();


  }]);