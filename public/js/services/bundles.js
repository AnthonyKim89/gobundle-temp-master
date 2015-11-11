//Trip service used for trips REST endpoint
angular.module('das.services').factory("Bundles", ['$resource', function($resource) {
    return $resource('api/bundles/:bundleId', {
        bundleId: '@id'
    }, {
        update: {
            method: 'PUT'
        },
        getBySlug: {
            method: 'GET',
            url: '/api/bundles/slug'
        },
        live: {
            method: 'POST',
            url: '/api/bundles/:bundleId/live'  
        },
        extend: {
            method: 'POST',
            url: '/api/bundles/:bundleId/extend'  
        },
        contributions: {
            method: 'GET',
            url: '/api/bundles/contributions',
            isArray: true
        },
        contribute: {
            method: 'POST',
            url: '/api/contribution'
        },
        removeContribute: {
            method: 'DELETE',
            url: '/api/contribution'
        }
    });
}]);