angular.module("das.system")
.directive('uiBundleSlider', function($timeout) {
    return {
        restrict: 'E',
        scope: {
            options: '@',
            min: '@',
            max: '@',
            model:'=ngModel'
        },
        templateUrl: '/js/directives/ui-bundle-slider/ui-bundle-slider.html',
        link: function($scope, $elem, $attrs) {
            $timeout(function() {
                var $target = $('<div class="ui-slider-selected-area"></div>');
                $elem.find('div.ui-slider').prepend($target);
                ['model', 'min', 'max'].forEach(function(param) {
                    $scope.$watch(param, function() {
                        $target.width( ($scope.model - $scope.min)/($scope.max - $scope.min) * 100 + '%' );
                    });
                });
            });
        }
    };
});