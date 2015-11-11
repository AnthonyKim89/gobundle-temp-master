angular.module("das.system")
    .directive('uiBundleImg', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                src:'=ngSrc',
                width:'=width',
                height:'=height',
                callback:'=callback'
            },
            templateUrl: '/js/directives/ui-bundle-img/ui-bundle-img.html',
            link: function($scope, $elem, $attrs) {
                $elem.css('position', 'relative');
                $elem.css('width', '100%');
                $elem.css('height', '100%');
                $elem.css('border-radius', '100%');
                var width = $elem.width();
                var height = $elem.height();
                $scope.$watch('src', function() {
                    $elem.empty();
                    var $img = $("<img/>").attr("src", $scope.src).load(function(){
                        // $img.css('position', 'absolute');
                        // $img.css('border-radius', 0);
                        $elem.css('background-image', 'url(' + $scope.src + ')');
                        $elem.css('background-position', 'center');
                        if(this.width / this.height > $scope.width / $scope.height) {
                            // $img.css('top', 0);
                            // $img.css('height', '100%');
                            // $img.css('width', 'auto');
                            // $img.css('left', (width - this.width * height / this.height)/2);
                            $elem.css('background-size', 'auto 100%');
                        }
                        else {
                            // $img.css('left', 0);
                            // $img.css('top', (height - this.height * width / this.width)/2);
                            // $img.css('width', '100%');
                            // $img.css('height', 'auto');
                            $elem.css('background-size', '100% auto');
                        }

                        // $elem.append($img);
                        if($scope.callback !== null && typeof $scope.callback !== 'undefined') {
                            $scope.callback();
                        }
                    }); 
                }, true);     
            }
        };
}]);