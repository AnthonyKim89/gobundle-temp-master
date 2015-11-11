angular.module('das.system').controller('HeaderController', ['$rootScope', '$scope', '$state', 'Users', '$q', function ($rootScope, $scope, $state, Users, $q) {

	$scope.currentUser = null;

	var loadUser = function() {
		Users.me().$promise.then(function(user) {
			$scope.currentUser = user;
		}, function() {
			$scope.currentUser = null;
		});
	};

	$rootScope.$watch('isLoggedIn', function() {
		loadUser();
	}, true);


	loadUser();
}]);