//User service used for user-auth REST endpoint
angular.module('das.services').factory("Users", ['$resource', function($resource) {
    return $resource('api/users/:userId', {
        userId: '@id'
    }, {
        update: {
            method: 'PUT',
            url: 'api/users'
        },
        auth: {
        	method: 'POST',
        	url: 'api/users/auth'
        },
        authFacebook: {
            method: 'POST',
            url: '/api/users/auth/facebook'
        },
        signout: {
            method: 'GET',
            url: 'api/users/signout'
        },
        me: {
            method: 'GET',
            url: 'api/users/me'
        },
        requestForget: {
            method: 'GET',
            url: '/api/users/forget'
        },
        verifyForget: {
            method: 'POST',
            url: '/api/users/forget'
        },
        resetPassword: {
            method: 'PUT',
            url: '/api/users/forget'
        }
    });
}]);