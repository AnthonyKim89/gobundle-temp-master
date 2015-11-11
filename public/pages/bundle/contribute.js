angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('bundle/contribute', {
          url: "/bundle/contribute/:slug/:step",
          templateUrl: "pages/bundle/contribute.html",
          controller: "bundleContributeController as bundleContributeCtrl",
          resolve: {
          	currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
            	var deferred = $q.defer();

          		Users.me().$promise.then(function(user) {
          			deferred.resolve(user);
          		}, function(err) {
          			deferred.resolve(null);
          		});

          		return deferred.promise;
          	}],
            bundle: ['$stateParams', '$q', 'Bundles', function($stateParams, $q, Bundles) {
              var deferred = $q.defer();

              Bundles.getBySlug({slug: $stateParams.slug}).$promise.then(function(bundle) {
                deferred.resolve(bundle);
              }, function(err) {
                deferred.resolve(null);
              });

              return deferred.promise;
            }],
            cards: ['$q', 'Cards', function($q, Cards) {
              var deferred = $q.defer();

              Cards.query().$promise.then(function(cards) {
                deferred.resolve(cards);
              }, function(err) {
                deferred.resolve(null);
              });

              return deferred.promise;
            }],
            step: ['$stateParams', function($stateParams) {
              var step = parseInt($stateParams.step);
              if(isNaN(step) || typeof step == "undefined" || step < 1 || step > 5)
                return 1;
              return step;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('bundleContributeController', ['$rootScope', '$scope', '$state', '$filter', '$routeParams', '$timeout', 'stripe', 'BundleDataService', 'Bundles', 'Cards', 'currentUser', 'step', 'bundle', 'cards', 'BUNDLE_STATUS', 'CONTRIBUTION_TYPE', 'Utils',
  	function ($rootScope, $scope, $state, $filter, $routeParams, $timeout, stripe, BundleDataService, Bundles, Cards, currentUser, step, bundle, cards, BUNDLE_STATUS, CONTRIBUTION_TYPE, Utils) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      if(bundle == null) {
        $state.go('home'); 
        return;
      }
      if(bundle.userId == currentUser.id || bundle.status != BUNDLE_STATUS.LIVE) {
        $state.go('home'); 
        return;
      }
      if(typeof _.findWhere(bundle.contributions, {UserId: currentUser.id}) !== "undefined") {
        $state.go('home'); 
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'home';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = false;
      $rootScope.siteParams.buttonCloseMenu.show = true;
      $rootScope.siteParams.buttonCloseMenu.url = {url: 'bundle/view', params: {slug: bundle.slug}};


      var init = function() {
        $scope.bundle = bundle;
        $scope.step = step;
        $scope.currentUser = currentUser;
        $scope.CONTRIBUTION_TYPE = CONTRIBUTION_TYPE;
        $scope.cards = cards;
        $scope.error = '';
        $scope.backPage = 'bundle/contribute/' + bundle.slug + '/3';

        if($scope.step == 1 || typeof $rootScope.contribution === "undefined" || $rootScope.contribution === null) {
          $rootScope.contribution = {
            amount: '£',
            type: 0,
            card: null
          };
          $rootScope.card = {
            cardNo: '',
            expiryDate: '',
            cvv: '',
            cardType: ''
          };
          if($scope.bundle.bundleType == 1) {
            $rootScope.contribution.amount = '£' + $filter('number')($scope.bundle.target, 2).replace(',', '');
          }
          else if($scope.bundle.bundleType == 2) {
            $rootScope.contribution.amount = '£' + $filter('number')($scope.bundle.target/$scope.bundle.minPeopleCount, 2).replace(',', '');
            console.log($rootScope.contribution.amount);
          }
          console.log($scope.bundle);
          $scope.step = 1;
        }
      };
      $rootScope.$watch('contribution.amount', function() {
        if($rootScope.contribution.amount == "") {
          $rootScope.contribution.amount = '£';
        }
      }, true);

      $scope.$watch('step', function() {
        if($scope.step == 1) {
          $rootScope.siteParams.clearHookers();
          $rootScope.siteParams.registerBackButtonHooker(function() {
            $state.go('bundle/view', {slug: $scope.bundle.slug});
            return true;
          });
          if(typeof $rootScope.contribution !== "undefined" && !isNaN(parseInt($rootScope.contribution.amount))) {
            $rootScope.contribution.amount = '£' + $rootScope.contribution.amount;
          }
        }
        else {
          $rootScope.siteParams.clearHookers();
          $rootScope.siteParams.registerBackButtonHooker(function() {
            $scope.onStepPrev();
            return true;
          });
        }
      }, true);

      $rootScope.$watch('card', function() {
        card = $rootScope.card;
        if(card === null || typeof card === 'undefined') return;
        if(card.cardNo.indexOf('4') === 0) {
          card.cardType = 'visa';
        }
        else if(card.cardNo.indexOf('51') === 0 || card.cardNo.indexOf('52') === 0 || card.cardNo.indexOf('53') === 0 || card.cardNo.indexOf('54') === 0 || card.cardNo.indexOf('55') === 0) {
          card.cardType = 'mastercard';
        }
        else if(card.cardNo.indexOf('34') === 0 || card.cardNo.indexOf('37') === 0) {
          card.cardType = 'amex';
        }
        else if(card.cardNo.indexOf('300') === 0 || card.cardNo.indexOf('301') === 0 || card.cardNo.indexOf('302') === 0 || card.cardNo.indexOf('303') === 0 || card.cardNo.indexOf('304') === 0 || card.cardNo.indexOf('305') === 0 || card.cardNo.indexOf('36') === 0 || card.cardNo.indexOf('38') === 0) {
          card.cardType = 'dinnersclub';
        }
        else if(card.cardNo.indexOf('6011') === 0 || card.cardNo.indexOf('65') === 0) {
          card.cardType = 'discover';
        }
        else if(card.cardNo.indexOf('2131') === 0 || card.cardNo.indexOf('1800') === 0 || card.cardNo.indexOf('35') === 0) {
          card.cardType = 'jcb';
        }
        else {
          card.cardType = '';
        }

        $scope.creditcard_icon = {
          none: card.cardType == '',
          amex: card.cardType == 'amex',
          dinnersclub: card.cardType == 'dinnersclub',
          discover: card.cardType == 'discover',
          jcb: card.cardType == 'jcb',
          mastercard: card.cardType == 'mastercard',
          visa: card.cardType == 'visa'
        };
      }, true);

      $scope.onStepPrev = function() {
        $scope.error = '';

        if($scope.step == 4) $scope.step -= 2;
        else $scope.step --;
      };

      $scope.onStepNext = function() {
        $scope.error = '';
        switch($scope.step) {
          case 1: {
            var amount = $rootScope.contribution.amount.toString().replace('£', '');
            if( $rootScope.isEmpty(amount) || parseInt(amount) === 0 ) {
              $scope.error = 'Please enter amount.';
              return;
            }
            $rootScope.contribution.amount = amount;
            break;
          }
          case 3: {
            if($rootScope.card.cardNo === '') {
              $scope.error = 'Please enter credit card number.';
              return;
            }
            
            if($rootScope.card.expiryDate === '') {
              $scope.error = 'Please enter expiry date.';
              return;
            }
            var extractExpiryDate = function(date) {
              var tmp = date.split('/');
              if(tmp.length != 2) return null;
              var ret = {
                month: 0,
                year: 0
              };
              ret.month = parseInt(tmp[0]);
              ret.year = parseInt(tmp[1]);
              if(isNaN(ret.month) || ret.month < 1 || ret.month > 12 || isNaN(ret.year)) return null;

              return ret;
            };
            var exp_date = extractExpiryDate($rootScope.card.expiryDate);
            if(exp_date === null) {
              $scope.error = 'Please enter correct expiry date.';
            }

            if($rootScope.card.cvv === '') {
              $scope.error = 'Please enter CVV.';
              return;
            }
            Utils.showWaiting('Please wait...');


            stripe.card.createToken({
              number: $rootScope.card.cardNo,
              cvc: $rootScope.card.cvv,
              exp_month: exp_date.month,
              exp_year: exp_date.year  
            }).then(function(token) {
                //token.id
                var cc = new Cards({
                  token: token.id
                });
                cc.$save()
                  .then(function(err) {
                    Utils.hideWaiting();
                    console.log(cc);
                    $rootScope.contribution.card = cc;
                    $scope.step ++;
                  }, function(err) {
                    Utils.hideWaiting();
                    $scope.error = err.data.error[Object.keys(err.data.error)[0]][0];    
                  })
            }).catch(function(err) {
                Utils.hideWaiting();
                $scope.error = err.message;
            });

            return;
          }
          case 4: {
            Utils.showWaiting('Please wait...');

            Bundles.contribute({
              type: $rootScope.contribution.type,
              amount: parseInt($rootScope.contribution.amount),
              BundleId: $scope.bundle.id,
              CardId: $rootScope.contribution.card.id
            }).$promise.then(function(result) {
              Utils.hideWaiting();

              $scope.amount = $rootScope.contribution.amount;
              $rootScope.card = null;
              $rootScope.contribution = null;

              $scope.step ++;
            }, function(err) {
              Utils.hideWaiting();
              $scope.error = err.data.error;
            });

            return;
          }
        }

        $scope.step ++;
      };
      $scope.onAddNewCard = function() {
        $scope.step ++;
      };
      $scope.onSelectCard= function(card) {
        $rootScope.contribution.card = card;
        $scope.step += 2;
      };

      init();


      $scope.$watch('contribution', function() {
        console.log($rootScope.contribution);
      }, true);


      $scope.changePlaceholder = function($event, placeholder) {
        angular.element($event.target).attr('placeholder', placeholder);
      };

  }]);