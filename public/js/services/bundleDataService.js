angular.module('das.services')
	.factory("BundleDataService", [ '$filter', 'BUNDLE_FOR', function($filter, BUNDLE_FOR) {
		return {
			generateDefaultBundleDescription: function(bundle) {
				var description = '';
				var bundleName = '';
				if(bundle.bundleFor != BUNDLE_FOR.length - 1) bundleName = BUNDLE_FOR[bundle.bundleFor] + ' ' + bundle.bundleName;
				else bundleName = bundle.bundleName;
				if(bundle.bundleType === 0) {
					description = 'We are raising money for ' + bundleName + '.';
					if(bundle.targetType == 1) description += ' We need to reach ' + $filter('currency')(bundle.target, '£', 0) + ' to make this happen.';
					
				}
				else if(bundle.bundleType === 1) {
					description = 'We are raising money for ' + bundleName + '.	We each need to pay ' + $filter('currency')(bundle.target, '£', 0) + '. we need a minimum of ' + bundle.minPeopleCount + ' and a maximum of ' + bundle.maxPeopleCount + ' of us to make this bundle.';
				}
				else if(bundle.bundleType === 2) {
					description = 'We are spitting ' + $filter('currency')(bundle.target, '£', 0) + ' for ' + bundleName + '. We need ' + bundle.minPeopleCount + ' of us to make this happen.';
				}
				description += '\nCome on guys!';

				return description;
			},

			getProgressDescription: function(bundle) {
				var data = this.getBundleCompletionData(bundle);
				var sum = data.sum;
				var raised = data.raised;

				var days_left = bundle.duration - moment().diff(moment(bundle.dateLive), 'days');
				if(isNaN(days_left)) days_left = bundle.duration;
				if(days_left > 1) days_left = days_left + ' days left';
				else if(days_left > 0) days_left = '1 day left';
				else days_left = 'This bundle has ended.';

				return '£' + $filter('number')(raised, 2) + ' of £' + $filter('number')(sum, 2) + ' raised so far\n' + days_left;
			},
			getBundleEndDate: function(bundle) {
				return moment(bundle.dateLive).add(bundle.duration, 'days').format('YYYY-MM-DD');
			},
			getBundleCompletionData: function(bundle) {
				var ret = {
					raised: 0,
					sum: 0
				};
				ret.raised = _.reduce(bundle.Contributions, function(sum, cont) { return sum + (cont.Transaction.status == 1 || cont.Transaction.status === 0 ? cont.Transaction.amount : 0); }, 0);

				if(bundle.bundleType === 0) {
					ret.sum = bundle.target;
				}
				else if(bundle.bundleType == 1) {
					ret.sum = bundle.target * bundle.minPeopleCount;
				}
				else if(bundle.bundleType == 2) {
					ret.sum = bundle.target;
				}

				return ret;
			},
			getBundleProblem: function(bundle) {
				if(bundle.status == 1) {	//live
					failed_contributions = _.filter(bundle.Contributions, function(cont) {
						if(cont.Transaction.status == 2) { //faild 
							return true;
						}
						return false;
					});
					if(failed_contributions.length > 0) {
						return {
							type: 'FAILED_PAYMENT',
							data: failed_contributions
						};
					}
					else {
						var days_left = bundle.duration - moment().diff(moment(bundle.dateLive), 'days');
						if(days_left <= 0) {
							return {
								type: 'EXPIRED_BUNDLE',
								data: null
							};
						}
					}
				}
				else if(bundle.status == 4) {	// failed
					return {
						type: 'FAILED_BUNDLE',
						data: null
					};
				}

				return null;
			}
		};
	}]);