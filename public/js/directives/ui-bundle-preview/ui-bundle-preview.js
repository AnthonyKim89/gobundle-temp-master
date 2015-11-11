angular.module("das.system")
.directive('uiBundlePreview', ['$timeout', 'BundleDataService', function($timeout, BundleDataService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            bundle: '=bundle',
            callback: '=callback',
            size: '@',
            animation: '=animation',
            showProblem: '=showProblem',
            isError: '=isError',
            afterRender: '=afterRender'
        },
        templateUrl: '/js/directives/ui-bundle-preview/ui-bundle-preview.html',
        link: function($scope, $elem, $attrs) {
            $scope.class = {};
            $scope.class[$scope.size] = true;
            $scope.bundleProblem = BundleDataService.getBundleProblem($scope.bundle);
            var labels = [{
                photo: $scope.bundle.photo,
                label: ''
            }, {
                photo: $scope.bundle.User.photo,
                label: $scope.bundle.User.firstname + '\'s in'
            }];
            _.each($scope.bundle.Contributions, function(contribution) {
                if(contribution.Transaction.status !== 0 && contribution.Transaction.status !== 1) return;
                labels.push({
                    photo: contribution.User.photo,
                    label: contribution.User.firstname + '\'s in'
                });
            });
            $scope.currentPhoto = labels[0].photo;

            var data = BundleDataService.getBundleCompletionData($scope.bundle);
            var percentageComplete = data.raised / data.sum *100;

            var delay = 3000 / 360;
            var initialDelay = 6000;
            var index = 0;

            var arc = $elem.find('path');
            var $img = $elem.find("img");
            var $label = $elem.find(".ui-bundle-preview-label");
            var stroke_width = 0;
            if($scope.size == 'large') {
                stroke_width = 6;
                arc.attr("stroke-width", "6px");
            }
            else {
                stroke_width = 4;
                arc.attr('stroke-width', "4px");
            }

            var angle = 180;
            var polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
                var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

                return {
                    x: centerX + (radius * Math.cos(angleInRadians)),
                    y: centerY + (radius * Math.sin(angleInRadians))
                };
            };
            var describeArc = function (x, y, radius, startAngle, endAngle){

                var start = polarToCartesian(x, y, radius, endAngle);
                var end = polarToCartesian(x, y, radius, startAngle);

                var arcSweep = endAngle - startAngle > 0 ? "0" : "1";

                var d = [
                    "M", start.x, start.y, 
                    "A", radius, radius, 0, arcSweep, 0, end.x, end.y
                ].join(" ");

                return d;       
            };

            var drawArc = function() {
                var curCompletion = (angle >= 180 ? angle - 180 : angle + 180) / 360 * 100;
                var stop = false;
                var full_arc = false;
                if( percentageComplete  <= curCompletion || angle == 179) {
                    if(angle == 179) {
                        full_arc = true;
                    }
                    stop = true;
                }

                var width = $elem.find('svg').width();
                var height = $elem.find('svg').height();
                angle  = (angle + 1 ) % 360;
                arc[0].setAttribute("d", describeArc(width/2, height/2, width/2 - stroke_width/2, 180, full_arc ? 179.99 : angle));
                
                if(stop) {
                    return;
                }

                $timeout(drawArc, delay);                   
            };
            $timeout(drawArc, 500);

            var showWhosIn = function() {
                index = (index + 1) % labels.length;
                $scope.currentPhoto = labels[index].photo;
                $label.html(labels[index].label);

                $timeout(showWhosIn, 3000);
            };
            if($scope.animation) {
                $timeout(showWhosIn, initialDelay);
            }
        }
    };
}]);