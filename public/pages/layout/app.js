angular.module('das.controllers').controller('AppController', ['$rootScope', '$state', 'Utils', function ($rootScope, $state, Utils) {

	$rootScope.siteParams = {
		buttonBack : {
			show: true,
			url: ''
		},
		buttonMenu: {
			show: true
		},
		buttonCloseMenu: {
			show: false,
			url: 'home'
		},
		isMenu: false,
		backHookers: [],
		closeHookers: [],
		registerBackButtonHooker: function(hooker) { $rootScope.siteParams.backHookers.push(hooker); },
		registerCloseButtonHooker: function(hooker) { $rootScope.siteParams.closeHookers.push(hooker); },
		clearBackButtonHookers: function() { $rootScope.siteParams.backHookers = []; },
		clearCloseButtonHookers: function() { $rootScope.siteParams.closeHookers = []; },
		clearHookers: function() { 
			$rootScope.siteParams.clearBackButtonHookers();
			$rootScope.siteParams.clearCloseButtonHookers();
		}
	};

	var callHookers = function(hookers) {
		for(var i = 0; i < hookers.length; i++) {
			if(hookers[i]()) {
				return true;
			}
		}
		return false;
	};
	$rootScope.go = function(url) {
		if(_.isObject(url)) {
			$state.go(url.url, url.params);
		}
		else {
			$state.go(url);
		}
	};
	$rootScope.onBack = function() {
		if(!callHookers($rootScope.siteParams.backHookers)) {
			$rootScope.go($rootScope.siteParams.buttonBack.url);
		}
		$rootScope.siteParams.clearHookers();
	};
	$rootScope.onShowMenu = function() {
		$rootScope.siteParams.buttonCloseMenu.url = {
			url: $state.current.name,
			params: $state.params
		};
		$state.go('menu');
	};
	$rootScope.onCloseMenu = function() {

		if(!callHookers($rootScope.siteParams.closeHookers)) {
			var url;
			if($rootScope.siteParams.buttonCloseMenu.url === '' || $rootScope.siteParams.buttonCloseMenu.url === null || typeof $rootScope.siteParams.buttonCloseMenu.url === "undefined") {
				url = 'home';
			}
			else {
				url = $rootScope.siteParams.buttonCloseMenu.url;
			}

			$rootScope.siteParams.buttonCloseMenu.url = '';
			$rootScope.go(url);
		}
		$rootScope.siteParams.clearHookers();
	};

	$rootScope.isEmpty = function(val) {
		return val === '' || typeof val === "undefined" || typeof val === null;
	};
	$rootScope.redirectAfterLogin = function() {
		if($rootScope.loginRedirect === '' || typeof $rootScope.loginRedirect === 'undefined') {
			$rootScope.go('home');
		}
		else {
			$rootScope.go($rootScope.loginRedirect);
		}
		$rootScope.loginRedirect = '';
	};

	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
		Utils.showWaiting('Loading...');
	});
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		Utils.hideWaiting();
	});

}]);