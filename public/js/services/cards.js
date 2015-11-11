//Trip service used for trips REST endpoint
angular.module('das.services').factory("Cards", ['$resource', function($resource) {
    return $resource('api/cards/:cardId', {
        cardId: '@id'
    });
}]);