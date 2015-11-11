//Trip service used for trips REST endpoint
angular.module('das.services').factory("Transactions", ['$resource', function($resource) {
    return $resource('api/transactions/:transactionId', {
        transactionId: '@id'
    });
}]);