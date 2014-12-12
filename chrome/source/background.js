//The main function.
// chrome.browserAction.setBadgeText({text:String(10)});
var urls=['plus.google.com','.facebook.com','twitter.com'];
var setBadgeNumber = function(tab, count){
	if(checkEnable(tab.url)){
		if(count > 99){
			chrome.browserAction.setBadgeText({text:String('99+'),'tabId':tab.id});
		}else if (count == 0){
			//chrome.browserAction.setIcon({path:iconPath, tabId: tab.id});
			chrome.browserAction.setBadgeText({text:String(''),'tabId':tab.id});
		}else{
			chrome.browserAction.setBadgeText({text:String(count),'tabId':tab.id});
		}
	}
};
var checkEnable = function(url){
	for(idx in urls){
		if(url.indexOf(urls[idx]) > 0){
			return true;
		}
	}
	return false;
};
(function(){
	var count = 0;
	chrome.browserAction.onClicked.addListener(function(tab) {
	  message='onClick browserAction.........';
	  // console.log(message);
	  try{
		chrome.tabs.executeScript(null, {file: "jquery.js"});
		chrome.tabs.executeScript(null, {file: "content_script.js"});
	  }catch(e){
		// console.log(' Exception on chrome.browserAction.onClicked');
	  }
	});
	chrome.tabs.onCreated.addListener(function (tab){
		chrome.browserAction.disable(tab.id);
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		//console.log('chrome.tabs.onUpdated.addListener tab.id '+ tab.id+' ; tab.url '+ tab.url);
		try{
			if(checkEnable(tab.url)){
				chrome.browserAction.enable(tabId);
				if(tab.url.indexOf(urls[0]) > 0){
					chrome.browserAction.setTitle({"title":chrome.i18n.getMessage("iconTileGp"),"tabId":tabId});
				}else if(tab.url.indexOf(urls[1]) > 0){
					chrome.browserAction.setTitle({"title":chrome.i18n.getMessage("iconTileFb"),"tabId":tabId});
				}else if(tab.url.indexOf(urls[2]) > 0){
					chrome.browserAction.setTitle({"title":chrome.i18n.getMessage("iconTileTw"),"tabId":tabId});
				}
				//chrome.browserAction.setBadgeText({'text':String('@'),'tabId':tabId});
				//chrome.browserAction.setBadgeBackgroundColor({'color':'#000' , 'tabId':tabId});
			}
			else{
				chrome.browserAction.disable(tab.id);
			}
			
		}catch(e){
			// console.log(' Exception on chrome.tabs.onUpdated');
		}
	}); 
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			// console.log( 'receive: '+request.count+ " from tab : "+sender.tab.id +" content script:" + sender.tab.url );
			if (request.count || request.count == 0){
				count = request.count;
				//chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
					//var tab=tabs[0];
					var tab=sender.tab;
					setBadgeNumber(tab,request.count);
					chrome.browserAction.disable(tab.id);
					if(count == 0){
						chrome.browserAction.enable(tab.id);
					}
				//});
			}
	});
	// chrome.tabs.onActivated.addListener(function (activeInfo){
		//console.log('tab is active : '+activeInfo.tabId);
		//chrome.browserAction.setBadgeText({text:String(''),'tabId':tab.id});
		// /*
		// if(activeInfo){
			//activeInfo.tabId
			//chrome.browserAction.setTitle({});
		// }
		//console.log(activeInfo);
		// */
	// });
	
})();
