angular.module('das')
.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();

    window.isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i) ? true : false;
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i) ? true : false;
        },
        Windows: function() {
            return (navigator.userAgent.match(/IEMobile/i) ? true : false) || (navigator.userAgent.match(/WPDesktop/i) ? true : false);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    HTMLElement.prototype.alphaText = function(a) {
        current_color = getComputedStyle(this).getPropertyValue("color");
        match = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[\.\d+]*)*\)/g.exec(current_color);
        a = a > 1 ? (a / 100) : a;
        this.style.color = "rgba(" + [match[1],match[2],match[3],a].join(',') +")";
    };
}]);

//Setting HTML5 Location Mode
angular.module('das').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
])
.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get.Pragma = 'no-cache';
}])
.config(function(FacebookProvider) {
    // Set your appId through the setAppId method or
    // use the shortcut in the initialize method directly.
    FacebookProvider.init(FACEBOOK_API_KEY);
});

/* Setup global settings */
angular.module('das').factory('settings', ['$rootScope', function($rootScope) {
}]);

/* Setup Rounting For All Pages */
angular.module('das').config(['$stateProvider', '$urlRouterProvider', 'stripeProvider', function($stateProvider, $urlRouterProvider, stripeProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/");

    //stripe
    stripeProvider.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
}]);