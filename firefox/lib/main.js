var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;

var urls = ['plus.google.com', '.facebook.com', 'twitter.com'];
var checkEnable = function(url) {
	for (idx in urls) {
		if (url.indexOf(urls[idx]) > 0) {
			return idx;
		}
	}
	return -1;
};
var cfgData = {
	"google" : "post",
	"google_time" : "2.0",
	"facebook" : "post",
	"facebook_time" : "2.0",
	"twitter_time" : "1.0"
};

cfgData = {
	"google" : prefs.google_plus,
	"google_time" : prefs.google_plus_time,
	"facebook" : prefs.facebook,
	"facebook_time" : prefs.fb_time,
	"twitter_time" : prefs.twitter_time
};
require("sdk/simple-prefs").on("", function() {
	cfgData = {
		"google" : prefs.google_plus,
		"google_time" : prefs.google_plus_time,
		"facebook" : prefs.facebook,
		"facebook_time" : prefs.fb_time,
		"twitter_time" : prefs.twitter_time
	};
});
// console.log(cfgData);
var actionButton = buttons.ActionButton({
	id : "mozilla-link",
	label : "Like all",
	icon : {
		"16" : "./assets/icon16.png",
		"32" : "./assets/icon32.png",
		"64" : "./assets/icon64.png"
	},
	onClick : handleClick
});
tabs.on('activate', function(tab) {
	// console.log('onTabActive : ' + tab.url);
	if (checkEnable(tab.url) != -1) {
		actionButton.state(tabs.activeTab, {
			disabled : false
		});
	} else {
		actionButton.state(tabs.activeTab, {
			disabled : true
		});
	}
	//activatedUrl = tab.url;
	//setButtonLabelEachSite(activatedUrl,actionButton);
});
tabs.on('ready', function(tab) {
	// console.log('onTabReady : ' + tab.url);
	if (checkEnable(tab.url) != -1) {
		actionButton.state(tabs.activeTab, {
			disabled : false
		});
	} else {
		actionButton.state(tabs.activeTab, {
			disabled : true
		});
	}
	//activatedUrl = tab.url;
	//setButtonLabelEachSite(activatedUrl,actionButton);
});
function handleClick(state) {
	//console.log('state :  ');
	//console.log(state);
	// console.log("onClick buttonAction : ");
	var worker = tabs.activeTab.attach({
		contentScriptFile : [self.data.url("./scripts/jquery.js"), self.data.url("./scripts/content_script.js")],
		onMessage : function(message) {
			// console.log('OnMessage     :         ');
			// console.log(message);
		},
		onError : function(error) {
			// console.log("OnError   :            ");
			// console.log(error.fileName + ":" + error.lineNumber + ": " + error);
		}
	});
	// console.log(worker);
	worker.port.emit('sendConfigurationData', cfgData);
	worker.port.on('numberOfLike', function(originLocation, numberOfLike) {
		// console.log('Addon receive number of Like : ' + numberOfLike + 'tabTitle : '+ tabs.activeTab.url + ' originalUrl  '+ originLocation);
		var buttonLabel = (String(numberOfLike) == '') ? ' ' : String(numberOfLike);
		if (numberOfLike > 0 && tabs.activeTab.url.indexOf(originLocation)  > -1) {
			actionButton.state(tabs.activeTab, {
				disabled : true,
				badge : numberOfLike,
				label : buttonLabel
			});
		} else if(numberOfLike == 0 && tabs.activeTab.url.indexOf(originLocation)  > -1){
			actionButton.state(tabs.activeTab, {
				disabled : false
			});
		}
	});
}