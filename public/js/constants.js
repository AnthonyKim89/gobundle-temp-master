angular.module("das.system")
	.constant('APP_SETTINGS', {
		BUNDLE_FEE: 4
	})
	.constant('DEFAULT_AVATARS', [
		'img/avatars/1.png', 'img/avatars/2.png', 'img/avatars/3.png', 'img/avatars/4.png', 'img/avatars/5.png', 'img/avatars/6.png', 'img/avatars/7.png', 'img/avatars/8.png', 'img/avatars/9.png', 'img/avatars/10.png', 'img/avatars/11.png', 'img/avatars/12.png'
	])
	.constant('BUNDLE_FOR', [
		'a holiday', 'a weekend away', 'a gift', 'a party', 'a day/night out', 'a stag/hen party', 'charity', 'something else'
	])
	.constant('BUNDLE_TYPE', [
		'set their own amount',
		'pay a fixed amount',
		'divide the cost equally'
	])
	.constant('BUNDLE_TARGET_TYPE', [
		'I\'ll take what I get',
		'I must reach it'
	])
	.constant('DEFAUT_BUNDLE_PHOTO', [
		'img/bundle/1.png', 'img/bundle/2.png', 'img/bundle/3.png', 'img/bundle/4.png', 'img/bundle/5.png', 'img/bundle/6.png', 'img/bundle/7.png', 'img/bundle/8.png', 'img/bundle/9.png'
	])
	.constant('BUNDLE_PEOPLE_COUNT', {
		DEFAULT_MIN: 3,
		DEFAULT_MAX: 7,
		MIN: 1,
		MAX: 20
	})
	.constant('BUNDLE_DURATION', {
		DEFAULT: 7,
		MIN: 1,
		MAX: 31
	})
	.constant('BUNDLE_STATUS', {
		DRAFTED: 0,
		LIVE: 1,
		DELETED: 2
	})
	.constant('CONTRIBUTION_TYPE', [
		'Take money now',
		'Wait'
	])
	.constant('BUNDLE_EXTEND_DAYS', [
		3,5,7
	]);