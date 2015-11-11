angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('logout', {
          url: "/logout",
          template: "",
          controller: "LogoutController as logoutCtrl",
          resolve: {
          }
      });

  }]);

angular.module('das.controllers')
  .controller('LogoutController', ['$rootScope', '$scope', '$state', '$routeParams', '$location', 'Users',
  	function ($rootScope, $scope, $state, $routeParams, $location, Users) {

      Users.signout().$promise.then(function() {
        $rootScope.isLoggedIn = false;
        $state.go('landing');
      });

  }]);