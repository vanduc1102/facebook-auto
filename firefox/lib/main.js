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

var actionButton = require('browserAction').BrowserAction({
    default_icon: './assets/icon64.png', 
	default_title: 'Like all'
});

actionButton.onClicked.addListener( function(tab){
	handleClick();
});

tabs.on('activate', function(tab) {
	// console.log('onTabActive : ' + tab.url);
	if (checkEnable(tab.url) != -1) {
		console.log("tabs.activeTab.id : "+tabs.activeTab.id);
		actionButton.enable(tabs.activeTab.id);
	} else {
		actionButton.disable(tabs.activeTab.id);
	}
});
tabs.on('ready', function(tab) {
	if (checkEnable(tab.url) != -1) {
		actionButton.enable(tabs.activeTab.id);
	} else {
		actionButton.disable(tabs.activeTab.id);
	}
});
function handleClick(state) {
	var worker = tabs.activeTab.attach({
		contentScriptFile : [self.data.url("./scripts/jquery.js"), self.data.url("./scripts/content_script.js")],
		onMessage : function(message) {
		},
		onError : function(error) {
		}
	});
	
	// console.log(worker);
	worker.port.emit('sendConfigurationData', cfgData);
	worker.port.on('numberOfLike', function(originLocation, numberOfLike) {
		// console.log('Addon receive number of Like : ' + numberOfLike + 'tabTitle : '+ tabs.activeTab.url + ' originalUrl  '+ originLocation);
		var buttonLabel = (String(numberOfLike) == '') ? ' ' : String(numberOfLike);
		if (numberOfLike > 0 && tabs.activeTab.url.indexOf(originLocation)  > -1) {
			actionButton.disable(tabs.activeTab.id);
			actionButton.setBadgeText({text: String(numberOfLike)});
		} else if(numberOfLike == 0 && tabs.activeTab.url.indexOf(originLocation)  > -1){
			actionButton.enable(tabs.activeTab.id);
		}
	});
}