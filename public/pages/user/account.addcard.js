angular.module('das')
  .config(['$stateProvider', function($stateProvider) {
    $stateProvider
      .state('account/addcard', {
          url: "/account/addcard",
          templateUrl: "pages/user/account.addcard.html",
          controller: "addCreditCardController as addCreditCardCtrl",
          resolve: {
            currentUser: ['$stateParams', '$q', 'Users', function($stateParams, $q, Users) {
              var deferred = $q.defer();

              Users.me().$promise.then(function(user) {
                deferred.resolve(user);
              }, function(err) {
                deferred.resolve(null);
              });

              return deferred.promise;
            }]
          }
      });

  }]);

angular.module('das.controllers')
  .controller('addCreditCardController', ['$rootScope', '$scope', '$state', '$routeParams', '$timeout', 'stripe', 'BundleDataService', 'Bundles', 'Cards', 'currentUser', 'BUNDLE_STATUS', 'CONTRIBUTION_TYPE', 'Utils',
    function ($rootScope, $scope, $state, $routeParams, $timeout, stripe, BundleDataService, Bundles, Cards, currentUser, BUNDLE_STATUS, CONTRIBUTION_TYPE, Utils) {

      if(currentUser === null) {
        $state.go('landing');
        return;
      }
      $rootScope.siteParams.clearHookers();
      $rootScope.siteParams.buttonBack.show = true;
      $rootScope.siteParams.buttonBack.url = 'account';
      $rootScope.siteParams.buttonMenu.show = false;
      $rootScope.siteParams.isMenu = true;
      $rootScope.siteParams.buttonCloseMenu.show = false;
      $rootScope.siteParams.buttonCloseMenu.url = '';


      var init = function() {
        $scope.currentUser = currentUser;
        $scope.error = '';
        $scope.backPage = 'account/addcard';

        if(typeof $rootScope.card === "undefined" || $rootScope.card == null) {
          $rootScope.card = {
            cardNo: '',
            expiryDate: '',
            cvv: '',
            cardType: ''
          };
        }
      };

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

      $scope.onStepNext = function() {
        $scope.error = '';
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
                $rootScope.card = null;
                $state.go('account');
              }, function(err) {
                Utils.hideWaiting();
                $scope.error = err.data.error[Object.keys(err.data.error)[0]][0];    
              })
        }).catch(function(err) {
            Utils.hideWaiting();
            $scope.error = err.message;
        });
      };

      init();

  }]);