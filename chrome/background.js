//The main function.
LOGGER("Background is running");
var fbUrl = '.facebook.com';
var count = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
    LOGGER('chrome.browserAction.onClicked.addListener');
    try {
        executeScripts(null, [
            { file: "libs/jquery.js" },
            { file: "scripts/utils.js" },
            { file: "scripts/like-all.js" }
        ]);
        setBadgeText(tab, '');
        disableButton(tab);
        updateNumberOfUsed();
    } catch (e) {
        console.log('Exception on chrome.browserAction.onClicked');
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
    } catch (e) {
        LOGGER(' Exception on chrome.tabs.onUpdated');
    }
});
chrome.runtime.onInstalled.addListener(function(details) {
    LOGGER("on Installed");
    chrome.storage.sync.get({
        isOptionOpened: "false"
    }, function(cfgData) {
        LOGGER("Option is not opened yet!" + JSON.stringify(cfgData));
        if (cfgData["isOptionOpened"] == "false") {
            LOGGER("Option tab is openning");
            chrome.tabs.create({
                url: "options.html"
            });
        }
    });

    chrome.storage.sync.set({
        "isOptionOpened": "true"
    }, function() {
        LOGGER("Option is openned, Dont open it again.");
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    LOGGER('receive: ' + request.count + " from tab : " + sender.tab.id + " content script:" + sender.tab.url);
    if (request.count || request.count == 0) {
        count = request.count;
        var tab = sender.tab;
        if (count == 0) {
            setBadgeText(tab, getDefaultText(tab));
            enableButton(tab);
        } else {
            setBadgeNumber(tab, request.count);
            disableButton(tab);
        }
    }
});
var CONSTANT = {
    "FACEBOOK": {
        "MENUS": {
            "CONFIRM-FRIEND": "confirm-friend-request",
            "REQUEST-FRIEND": "send-friend-request",
            "LIKE-ALL": "like-all",
            "INVITE-FRIEND-PAGE": "invite-friend-page",
            "INVITE-FRIEND-EVENT": "invite-friend-event",
            "COMMENT": "comment"
        }
    }
}

function genericOnClick(info, tab) {
    LOGGER("Cliked : " + info.menuItemId);
    if (!isFacebook(tab)) {
        LOGGER("Context menus only running on Facebook.");
        return;
    }
    switch (info.menuItemId) {
        case CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/confirm-friend.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/request-friend.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-PAGE"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/invite-friend-page.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-EVENT"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/invite-friend-event.js" }
            ]);
            updateNumberOfUsed();
            break;
        case CONSTANT["FACEBOOK"]["MENUS"]["LIKE-ALL"]:
            executeScripts(null, [
                { file: "libs/jquery.js" },
                { file: "scripts/utils.js" },
                { file: "scripts/like-all.js" }
            ]);
            updateNumberOfUsed();
            break;
        default:
            break;
    }

}

function createContextMenus(urlParterns) {
	

    var rootFbMenu = chrome.contextMenus.create({ id: "facebook-auto", "title": "Facebook Auto", "contexts": ["all"] , documentUrlPatterns : urlParterns});
    chrome.contextMenus.onClicked.addListener(genericOnClick);

    // Create a parent item and two children.
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["CONFIRM-FRIEND"], "title": "Confirm friend requests", "parentId": rootFbMenu , documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["REQUEST-FRIEND"], "title": "Send friend requests", "parentId": rootFbMenu ,documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": "separator1", type: 'separator', "parentId": rootFbMenu , documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-PAGE"], "title": "Invite friend on Page", "parentId": rootFbMenu ,documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["INVITE-FRIEND-EVENT"], "title": "Invite friend on Event", "parentId": rootFbMenu ,documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": "separator1", type: 'separator', "parentId": rootFbMenu , documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["LIKE-ALL"], "title": "Like all", "parentId": rootFbMenu ,documentUrlPatterns : urlParterns});
    chrome.contextMenus.create({ "id": CONSTANT["FACEBOOK"]["MENUS"]["COMMENT"], "title": "Comming soon", "parentId": rootFbMenu ,documentUrlPatterns : urlParterns});
}
var fbUrlParterns = ["https://*.facebook.com/*","http://*.facebook.com/*"];
createContextMenus(fbUrlParterns);


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

function setBadgeText(tab, text) {
    chrome.browserAction.setBadgeText({
        text: text,
        'tabId': tab.id
    });
}

function checkEnable(url) {
    return url.indexOf(fbUrl) > -1;
}

function enableButtonIfNoneText(tab) {
    chrome.browserAction.getBadgeText({ "tabId": tab.id }, function(text) {
        LOGGER("enableButtonIfNoneText : " + text);
        if (text == '') {
            enableButton(tab);
            setBadgeText(tab, getDefaultText(tab));
        }
    });
}

function enableButton(tab) {
    chrome.browserAction.enable(tab.id);
}

function disableButton(tab) {
    chrome.browserAction.disable(tab.id);
}

function getDefaultText(tab) {
    return "Like";
}

function isFacebook(tab) {
    var url = tab.url;
    return url.indexOf(fbUrl);
}

function setStorageNumber(key, number, callback) {
    var object = {};
    object[key] = number;
    chrome.storage.sync.set(object, function() {
        if (callback) {
            callback();
        }
    });
}

function getStorageNumber(key, callback) {
    var object = {};
    object[key] = 0;
    chrome.storage.sync.get(object, function(item) {
        if (callback) {
            callback(item[key]);
        } else {
            console.log("You can't get value without callback.")
        }
    });
}

function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function() {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback(); // execute outermost function
}

function updateNumberOfUsed() {
    var countNumberFieldName = "count_number";
    getStorageNumber(countNumberFieldName, function(numberOfUsed) {
        var times = Number(numberOfUsed);
        times++;
        setStorageNumber(countNumberFieldName, times);
    });
}
