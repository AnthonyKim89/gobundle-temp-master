//Trip service used for messages REST endpoint
angular.module('das.services').factory("Messages", ['$resource', function($resource) {
    return $resource('api/messages/:messageId', {
        messageId: '@id'
    });
}]);