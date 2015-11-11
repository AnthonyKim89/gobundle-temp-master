angular.module('das.system')
	.filter('nl2br', function($sce){
	    return function(msg,is_xhtml) { 
	        var xhtml = is_xhtml || true;
	        var breakTag = (xhtml) ? '<br />' : '<br>';
	        var text = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
	        return $sce.trustAsHtml(text);
	    };
	})
	.filter('date_add', function() {
		return function(date, value, type) {
			if(date === null) date = new Date();
			else if(!_.isDate(date)) date = new Date(date);
			if(type === null || typeof type === "undefined") type = "day";

			if(!_.isDate(date)) date = new Date();

			var multiplier = 1;
			if(type == 'second') multiplier = 1000;
			else if(type == 'minute') multiplier = 1000 * 60;
			else if(type == 'hour') multiplier = 1000 * 60 * 60;
			else if(type == 'day') multiplier = 1000 * 60 * 60 * 24;
			else if(type == 'week') multiplier = 1000 * 60 * 60 * 24 * 7;
			else if(type == 'month') multiplier = 1000 * 60 * 60 * 24 * 30;
			else if(type == 'year') multiplier = 1000 * 60 * 60 * 24 * 365;

			return new Date(date.getTime() + multiplier * value);
		};
	});