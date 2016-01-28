//The main function.
// chrome.browserAction.setBadgeText({text:String(10)});
LOGGER("Background is running");
var urls = ['plus.google.com', '.facebook.com', 'twitter.com'];
var youtubeURL = "www.youtube.com/watch";
var setBadgeNumber = function(tab, count) {
	if (checkEnable(tab.url)) {
		if (count > 99) {
			chrome.browserAction.setBadgeText({
				text : String('99+'),
				'tabId' : tab.id
			});
		} else if (count == 0) {
			//chrome.browserAction.setIcon({path:iconPath, tabId: tab.id});
			chrome.browserAction.setBadgeText({
				text : String(''),
				'tabId' : tab.id
			});
		} else {
			chrome.browserAction.setBadgeText({
				text : String(count),
				'tabId' : tab.id
			});
		}
	}
};
var checkEnable = function(url) {
	for (idx in urls) {
		if (url.indexOf(urls[idx]) > 0) {
			return true;
		}
	}
	return false;
};

var count = 0;
chrome.browserAction.onClicked.addListener(function(tab) {
	try {
		chrome.tabs.executeScript(null, {
			file : "libs/jquery.js"
		});
		chrome.tabs.executeScript(null, {
			file : "scripts/logger.js"
		});
		chrome.tabs.executeScript(null, {
			file : "scripts/content_script.js"
		});
	} catch(e) {
		console.log(' Exception on chrome.browserAction.onClicked');
	}
});

chrome.tabs.onCreated.addListener(function(tab) {
	chrome.browserAction.disable(tab.id);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	LOGGER('chrome.tabs.onUpdated.addListener tab.id ' + tab.id + ' ; tab.url ' + tab.url);
	try {
		if (checkEnable(tab.url)) {
			chrome.browserAction.enable(tabId);
			if (tab.url.indexOf(urls[0]) > 0) {
				chrome.browserAction.setTitle({
					"title" : chrome.i18n.getMessage("iconTileGp"),
					"tabId" : tabId
				});
			} else if (tab.url.indexOf(urls[1]) > 0) {
				chrome.browserAction.setTitle({
					"title" : chrome.i18n.getMessage("iconTileFb"),
					"tabId" : tabId
				});
			} else if (tab.url.indexOf(urls[2]) > 0) {
				chrome.browserAction.setTitle({
					"title" : chrome.i18n.getMessage("iconTileTw"),
					"tabId" : tabId
				});
			}
			//chrome.browserAction.setBadgeText({'text':String('@'),'tabId':tabId});
			//chrome.browserAction.setBadgeBackgroundColor({'color':'#000' , 'tabId':tabId});
		} else {
			chrome.browserAction.disable(tab.id);
		}

	} catch(e) {
		LOGGER(' Exception on chrome.tabs.onUpdated');
	}

	likeYoutubeVideo(tab.url);
});
chrome.runtime.onInstalled.addListener(function(details) {
	LOGGER("on Installed");
	chrome.storage.sync.get({
		isOptionOpened : "false"
	}, function(cfgData) {
		LOGGER("Option is not opened yet!" + JSON.stringify(cfgData));
		if (cfgData["isOptionOpened"] == "false") {
			LOGGER("Option tab is openning");
			chrome.tabs.create({
				url : "options.html"
			}); 
		}
	});
	
	chrome.storage.sync.set({
		"isOptionOpened" : "true"
	}, function() {
		LOGGER("Option is openned, Dont open it again.");
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	LOGGER('receive: ' + request.count + " from tab : " + sender.tab.id + " content script:" + sender.tab.url);
	if (request.count || request.count == 0) {
		count = request.count;
		//chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		//var tab=tabs[0];
		var tab = sender.tab;
		setBadgeNumber(tab, request.count);
		chrome.browserAction.disable(tab.id);
		if (count == 0) {
			chrome.browserAction.enable(tab.id);
		}
		//});
	}
});

function likeYoutubeVideo(url) {
	chrome.storage.sync.get({
		"youtube_like" : "false"
	}, function(cfgData) {
		LOGGER(cfgData);
		if (cfgData['youtube_like'] == "true") {
			if (url.indexOf(youtubeURL) > -1) {
				LOGGER("You are in youtube watch page");
				try {
					chrome.tabs.executeScript(null, {
						file : "libs/jquery.js"
					});
					chrome.tabs.executeScript(null, {
						file : "scripts/logger.js"
					});
					chrome.tabs.executeScript(null, {
						file : "scripts/youtube.js"
					});
				} catch(e) {
					console.log(' Exception on chrome.browserAction.onClicked');
				}
			} else {
				LOGGER("You are in youtube, but not waching page");
			}
		}
	});

}