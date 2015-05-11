var tabs = require("sdk/tabs");
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;
var DEBUG = false;
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

var { ToggleButton } = require("sdk/ui/button/toggle");

var actionButton = ToggleButton({
    id: "facebook-like-all",
    label: "Like All",
    icon: {
      "16": "./assets/icon16.png",
      "32": "./assets/icon32.png"
    },
    onChange: changed,
    badge: '',
    badgeColor: "#FF0000"
});

function changed(state) {
	handleClick(state);
}

tabs.on('activate', function(tab) {
	if (checkEnable(tab.url) != -1) {
		actionButton.disabled = false;
	} else {
		actionButton.disabled = true;
	}
	actionButton.badge = '';
});
tabs.on('ready', function(tab) {
	if (checkEnable(tab.url) != -1) {
		actionButton.disabled = false;
	} else {
		actionButton.disabled = true;
	}
	actionButton.badge = '';
});
function handleClick(state) {
	var worker = tabs.activeTab.attach({
		contentScriptFile : [self.data.url("./scripts/jquery.js"), self.data.url("./scripts/content_script.js")],
		onMessage : function(message) {
		},
		onError : function(error) {
		}
	});
	
	if(DEBUG) console.log(worker);
	worker.port.emit('sendConfigurationData', cfgData);
	worker.port.on('numberOfLike', function(originLocation, numberOfLike) {
		if(DEBUG) console.log('Addon receive number of Like : ' + numberOfLike + 'tabTitle : '+ tabs.activeTab.url + ' originalUrl  '+ originLocation);
		var textBadage = (String(numberOfLike) == '') ? '' : String(numberOfLike);
		if (numberOfLike > 0 && tabs.activeTab.url.indexOf(originLocation)  > -1) {
			actionButton.disabled = true;
			actionButton.badge = textBadage;
		} else if(numberOfLike == 0 && tabs.activeTab.url.indexOf(originLocation)  > -1){
			actionButton.disabled = false;
			actionButton.badge = '';
		}
	});
}