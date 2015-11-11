angular.module("das.system")
.directive('uiBundleConfirm', function($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ok: '=ok',
            cancel: '=cancel',
            margin: '@',
            model: '=ngModel'
        },
        templateUrl: '/js/directives/ui-bundle-confirm/ui-bundle-confirm.html',
        link: function($scope, $elem, $attrs) {
            $scope.margin = typeof $scope.margin === 'undefined' ? 50 : $scope.margin;
            $timeout(function() {
                $elem.find('.ui-bundle-confirm-btn-cancel').css('margin-right', $scope.margin + 'px');
            });
        }
    };
});