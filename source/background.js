//The main function.
LOGGER("Background is running");
var urls = ['plus.google.com', '.facebook.com', 'twitter.com','instagram.com','linkedin.com','tumblr.com'];
var youtubeURL = "www.youtube.com/watch";
var count = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
	try {
		executeScripts(null, [ 
	        { file : "libs/jquery.js" }, 
	        { file : "scripts/utils.js" },
	        { file : "scripts/content_script.js" }
	    ]);
		setBadgeText(tab,'');
		disableButton(tab);
		updateNumberOfUsed();
	} catch(e) {
		console.log(' Exception on chrome.browserAction.onClicked');
	}
});

chrome.tabs.onCreated.addListener(function(tab) {
	LOGGER('chrome.tabs.onCreated.addListener tab.id ' + tab.id + ' ; tab.url ' + tab.url);
	disableButton(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	LOGGER('chrome.tabs.onUpdated.addListener tab.id ' + tab.id + ' ; tab.url ' + tab.url);
	try {
		if (checkEnable(tab.url)) {
			enableButtonIfNoneText(tab);		
		} else {
			disableButton(tab);
		}

	} catch(e) {
		console.log(e)
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
		var tab = sender.tab;
		if(count == 0){
			setBadgeText(tab, getDefaultText(tab));
			enableButton(tab);
		}else{
			setBadgeNumber(tab, request.count);
			disableButton(tab);
		}		
	}
});
var CONSTANT = {
	"FACEBOOK":{
		"MENUS":{
			"CONFIRM-FRIEND":"confirm-friend-request",
			"REQUEST-FRIEND":"send-friend-request",
			"LIKE-ALL":"like-all"
		}
	}
}

function genericOnClick(info, tab) {
  console.log("Cliked : "+ info.menuItemId);
  switch(info.menuItemId){
  	case CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"]:
  		executeScripts(null, [ 
		    { file : "libs/jquery.js" }, 
		    { file : "scripts/utils.js" },
		    { file : "scripts/confirm-friend.js" }
		]);
  		break;
  	case CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"]:
  		executeScripts(null, [ 
		    { file : "libs/jquery.js" }, 
		    { file : "scripts/utils.js" },
		    { file : "scripts/request-friend.js" }
		]);
  		break;
  	default:
  	break;
  }

}

function createContextMenus(){
	var rootFbMenu = chrome.contextMenus.create({id:"facebook-auto","title": "Facebook Auto", "contexts":["all"]});
	chrome.contextMenus.onClicked.addListener(genericOnClick);

	// Create a parent item and two children.
	chrome.contextMenus.create({"id":CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"],"title": "Confirm friend request","parentId": rootFbMenu});
	chrome.contextMenus.create({"id":CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"],"title": "Send friend request","parentId": rootFbMenu});
	chrome.contextMenus.create({"id":"separator1",type:'separator',"parentId": rootFbMenu});
	// chrome.contextMenus.create({"id":CONSTANT["FACEBOOK"]["MENUS"]["LIKE-ALL"],"title": "Like all","parentId": rootFbMenu});
}

createContextMenus();

function setBadgeNumber(tab, count) {
	if (checkEnable(tab.url)) {
		if (count > 99) {
			setBadgeText(tab, '99+');
		} else if (count == 0) {
			setBadgeText(tab, '');
		} else {
			setBadgeText(tab, String(count));
		}
	}
}

function setBadgeText(tab, text){
	chrome.browserAction.setBadgeText({
		text : text,
		'tabId' : tab.id
	});
}

function checkEnable(url) {
	for (idx in urls) {
		if (url.indexOf(urls[idx]) > 0) {
			return true;
		}
	}
	return false;
}

function enableButtonIfNoneText(tab){
	chrome.browserAction.getBadgeText({"tabId" : tab.id}, function (text){
		LOGGER("enableButtonIfNoneText : "+text);
		if(text == ''){
			enableButton(tab);
			setBadgeText(tab, getDefaultText(tab));
		}
	});
}
function enableButton(tab){
	chrome.browserAction.enable(tab.id);
}
function disableButton(tab){
	chrome.browserAction.disable(tab.id);	
}
function getDefaultText(tab){
	var url = tab.url;
	// Goole plus
	if(url.indexOf(urls[0]) > -1){
		return "Plus";
	}else if(isConnect(url)){
		return "Con.";
	}else{
		return "Like";
	}
}
function isNotFacebook(tab){
	var url = tab.url;
	if(url.indexOf(urls[1]) > 1){
		return true;
	}
	return true;
}
function isConnect(currentUrl){
	var urls = ["https://www.linkedin.com/vsearch/","https://www.linkedin.com/people/"];
	var url = urls.find(link => currentUrl.indexOf(link) > -1);
	return url != undefined;
}
function likeYoutubeVideo(url) {
	chrome.storage.sync.get({
		"youtube_like" : "false"
	}, function(cfgData) {
		LOGGER(cfgData);
		if (cfgData['youtube_like'] == "true") {
			if (url.indexOf(youtubeURL) > -1) {
				LOGGER("You are in youtube watch page");
				try {
					executeScripts(null, [ 
				        { file : "libs/jquery.js" }, 
				        { file : "scripts/utils.js" },
				        { file : "scripts/youtube.js" }
				    ]);
				} catch(e) {
					console.log(' Exception on chrome.browserAction.onClicked');
				}
			} else {
				LOGGER("You are in youtube, but not waching page");
			}
		}
	});
}

function setStorageNumber(key,number,callback){
	var object = {};
	object[key] = number;
	chrome.storage.sync.set(object, function() {
		if(callback){
			callback();
		}
	});
}
function getStorageNumber(key,callback){
	var object = {};
	object[key] = 0;
	chrome.storage.sync.get(object, function(item) {
			if(callback){
				callback(item[key]);
			}else{
				console.log("You can't get value without callback.")
			}
		});
}

function executeScripts(tabId, injectDetailsArray)
{
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback();   // execute outermost function
}
function updateNumberOfUsed(){
	var countNumberFieldName = "count_number";
	getStorageNumber(countNumberFieldName,function(numberOfUsed){
		var times = Number(numberOfUsed);
		times++;
		setStorageNumber(countNumberFieldName,times);
	});
}