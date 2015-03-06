var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
var { setInterval } = require("sdk/timers");
var prefs = require('sdk/simple-prefs');

var getUrl = function() {
	return prefs.prefs['url'];
};

var button = buttons.ActionButton({
	id : "commafeed-button",
	label : "CommaFeed",
	icon : {
		"16" : "./icon-16.png",
		"32" : "./icon-32.png",
		"64" : "./icon-64.png"
	},
	badge : '?',
	onClick : function() {
		var url = getUrl();
		for (let tab of tabs) {
			if (tab.url.startsWith(url)) {
				tab.activate();
				return;
			}
		}
		tabs.open(url);
	}
});

var refresh = function() {
	var url = getUrl();
	if (url.lastIndexOf('/') != url.length - 1) {
		url += '/';
	}
	Request({
		url : url + "rest/category/unreadCount",
		contentType : 'application/json',
		onComplete : function(response) {
			var json = response.json;
			if (json) {
				var count = 0;
				for (var i = 0; i < json.length; i++) {
					count += json[i].unreadCount;
				}
				if (count === 0)
					count = '';
				button.badge = ('' + count);
			} else {
				button.badge = '?';
			}
		}
	}).get();
};

setInterval(function() {
	refresh();
}, 60000);

refresh();