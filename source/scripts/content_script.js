var urlOrigin=window.location.origin;
var fullUrl = window.location.href;
LOGGER('Content script running........... : '+urlOrigin);
(function(){
	chrome.storage.sync.get({
		"google": "post",
		"google_time":"1.0",
		"facebook": "post",
		"facebook_time":"1.0",
		"twitter_time":"0.8",
		"numberOfScroll":0
	  }, function(cfgData) {
	  	LOGGER(cfgData);

		if(cfgData['numberOfScroll'] > 1 && isScrollable()){
			autoScrollToBottom(cfgData);
		}else{
			if(isFacebook() && cfgData['facebook'] == 'both'){
				loadAllComment(cfgData);
			}else{
				executeLike(cfgData);
			}	
		}
		
	});
	function loadAllComment(cfgData){		
		if(isFacebook() && cfgData['facebook'] == 'both'){
			var moreComments = $("a[role='button'][class='UFILikeLink']");
			function loadMoreComment(comments, intervalTime) {
				if (comments.length <= 0) {
					LOGGER("Finished load more comments");
					window.setTimeout(function(){
						LOGGER("executeLike after waiting 2 seconds");
						executeLike(cfgData);
					},2000);
					return;
				}
				comments[0].click();
				
				window.setTimeout(function() {					
					loadMoreComment(comments.splice(1), intervalTime);
				}, intervalTime);
			}
			loadMoreComment(moreComments,2000);
		}		

	}
	function autoScrollToBottom(cfgData){
		var i = 0;
		var scrollInterval = window.setInterval(function(){
			if(i == cfgData['numberOfScroll']){
				 clearInterval(scrollInterval);
				 if(isFacebook() && cfgData['facebook'] == 'both'){
				 	loadAllComment(cfgData);
				 }else{
				 	executeLike(cfgData);
				 }				 
			}else{
				LOGGER("Scroll to bottom : "+ i);
				window.scrollTo(0,document.body.scrollHeight);
			}
			i++;
		},4000);
	}
	function executeLike(cfgData){
		var time=0;
		var sad_posts =[];
		if(isGooglePlus()){
			time = parseFloat(cfgData['google_time'])*1000;
			switch(cfgData['google']){
				case 'post':
					sad_posts = $("div[role='button'][aria-pressed='false']");
					break;
				case 'comment':
					sad_posts = $("button[role='button'][aria-pressed='false'][jscontroller]");
					break;
				case 'both':
					sad_posts = $("div[id^=po-][aria-pressed='false'],button[role='button'][aria-pressed='false'][jscontroller]");
					break;
				default:
					break;
			};
		}

		if(isFacebook()){
			time = parseFloat(cfgData['facebook_time'])* 1000;		
			switch(cfgData['facebook']){
				case 'post':
					sad_posts = $("a[role='button'][aria-pressed='false']").filter(function(index){
						return !$(this).hasClass("UFIReactionLink");
					});
					LOGGER('Like all post : '+sad_posts.length);
					break;
				case 'comment':
					sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']").filter(function( index ) {
						var dataReactid = $(this).attr( "data-testid" );
						return dataReactid.length >= 0;
					});
					LOGGER('Like all comment : '+sad_posts.length);
					break;
				case 'both':
					sad_posts = $("a[role='button'][data-ft='{\"tn\":\">\"}']");
					LOGGER('Facebook all post and comment : '+sad_posts.length);
					break;
				default:
					break;
			};
		}

		if(isTwitter()){
			time = parseFloat(cfgData['twitter_time'])*1000;
			sad_posts = $("button[class^='ProfileTweet-actionButton js-actionButton js-actionFavorite']").filter(function( index ) {
				return $( this ).css("display") == 'inline-block' ;
			});
		}

		if(isInstagram()){
			time = parseFloat(cfgData['twitter_time'])*1000;
			sad_posts = $("a[role='button']").filter(function( index ) {
				var likeElement =  $( this ).find("span");
				return (likeElement &&(likeElement.hasClass("whiteoutSpriteHeartOpen") 
					|| likeElement.hasClass("coreSpriteHeartOpen")));
			});
		}

		if(isLinkedin()){
			time = parseFloat(cfgData['twitter_time'])*1000;
			if( isLinkedinCompany() ){
				sad_posts = $("a.like");
			}else{
				sad_posts = $("button.like").filter(function(index){ 
					var button = $(this);
					return button.attr('data-type') != 'comment' && button.attr('data-type') != 'reply' && !button.attr('data-liked') 
				});
			}
		}

		if(isTumblr()){
			time = parseFloat(cfgData['twitter_time'])*1000;
			sad_posts = $("div.post-control-icon.like").filter(function( index ) {
				var classAttr =  $( this ).attr('class');
				return classAttr.indexOf("liked") < 0;
			});
		}

		var happy = createHappyButtons(sad_posts);
		
		LOGGER("Number of posts and comments : "+ sad_posts.length);
		// Select only the Like buttons.
		// Convert the sad NodeList to a happy Array.
		var numberOfLikes=sad_posts.length;
		sendNumberToActionButton(numberOfLikes);


		

		function createHappyButtons(sad_posts){
			var array = []
			for (var i = 0; i < sad_posts.length; i++) {
				array.push(sad_posts[i]);
			}
			return array;
		}
		LOGGER(happy);
		LOGGER(time);
		
		if(isLinkedInPeopleYouMayKnow()){
			time = 1000 * 2;
			makeConnection(time, 0);
		}else{
			happyFn(happy , time);	
		}

		if(isLinkedInSearchPeople()){
			sendInvite();
		}

		function sendInvite(){			
			var happyButtons = getAllInviteButtonOnPage();
			sendInviteForAllPeopleOnPage(happyButtons,2000,0);
		}

		function getAllInviteButtonOnPage(){
			var originButtons =  $('a[href^="/people/invite?"]').filter(function(index){
				var classAttr =  $( this ).attr('class');
				return classAttr && classAttr.indexOf("invite-sent") < 0;
			});
			return createHappyButtons(originButtons);
		}
		
		function sendInviteForAllPeopleOnPage( happy, intervalTime , number) {
			if (happy.length <= 0) {
				if(loadNextPage()){
					var loadMore = window.setTimeout(function() {
						clearTimeout(loadMore);
						console.log("load more stop");
						var sendAllInviteButtons = getAllInviteButtonOnPage();
						sendInviteForAllPeopleOnPage(happy.splice(1), intervalTime , number);
						if(sendAllInviteButtons.length == 0){
							sendNumberToActionButton(0);
							return;	
						}
					}, 5000);
				}else{
					sendNumberToActionButton(0);
					return;	
				}
			}
			console.log("sent ddddddddd" + number);
		    //happy[0].click();
	
			if(happy.length > 0){
				sendNumberToActionButton(number);
			}

			window.setTimeout(function() {
				sendInviteForAllPeopleOnPage(happy.splice(1), intervalTime , ++number);
			}, intervalTime);
		}

		function happyFn(happy, intervalTime) {
			if (happy.length <= 0) {
				return;
			}
			
		    if(isGooglePlus() && isNewGooglePlus()){
		    	triggerClickEvent(happy[0]);
		    }else{
		    	happy[0].click();
		    }

			if(happy.length > 0){
				//console.log('Send request : '+ (happy.length - 1));
				sendNumberToActionButton(happy.length - 1);
			}

			window.setTimeout(function() {
				happyFn(happy.splice(1), intervalTime);
			}, intervalTime);
		}
		
		// Make connection in LinkedIn
		function makeConnection(intervalTime, count){
			count++;
			
			var connectionElement = $("ul > li:first-child button.bt-request-buffed");
			if(connectionElement.length > 0){
				connectionElement.click();
				sendNumberToActionButton(count);
			}else{
				sendNumberToActionButton(0);
				return;
			}
			
			window.setTimeout(function() {
				makeConnection( intervalTime , count);
			}, intervalTime);
		}		
	};
})();

function sendNumberToActionButton(number){
	chrome.runtime.sendMessage({count: number}, function(response) {
		//console.log(response);
	});  
}

function isFacebook(){
	return urlOrigin.indexOf('facebook') > -1;
}

function isGooglePlus(){
	return urlOrigin.indexOf('plus.google.com') > -1;
}

function isTwitter(){
	return urlOrigin.indexOf('twitter') > -1;
}

function isInstagram(){
	return urlOrigin.indexOf('instagram') > -1;
}
function isLinkedin(){
	return urlOrigin.indexOf('linkedin') > -1;
}
function isLinkedInPeopleYouMayKnow(){
	return fullUrl.indexOf('https://www.linkedin.com/people/') > -1;
}
function isLinkedInSearchPeople(){
	return fullUrl.indexOf("https://www.linkedin.com/vsearch/") > -1 ;
}
function isScrollable(){
	return !(fullUrl.indexOf("https://www.linkedin.com/vsearch/") > -1);
}
function loadNextPage(){
	var nextPageElement = $('a[class^="page-link"][href^="/vsearch"][rel^="next"]').get(0);
	if(nextPageElement){
		nextPageElement.click();
		return true;
	}
	else{
		return false;
	}
}

function isLinkedinCompany(){
	return window.location.pathname.indexOf('company') > -1;
}

function isTumblr(){
	return urlOrigin.indexOf('tumblr.com') > -1;
}

function isNewGooglePlus(){
	var body = $("body.Td");
	return (body.length == 0);
}

function triggerClickEvent(node){
	fireEvent(node,"mousedown");
	fireEvent(node,"mouseup");
}

function fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9){
        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

    if (node.dispatchEvent) {
        // Gecko-style approach (now the standard) takes more work
        var eventClass = "";

        // Different events have different event classes.
        // If this switch statement can't map an eventName to an eventClass,
        // the event firing is going to fail.
        switch (eventName) {
            case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
            case "mousedown":
            case "mouseup":
            eventClass = "MouseEvents";
            break;

            case "focus":
            case "change":
            case "blur":
            case "select":
            eventClass = "HTMLEvents";
            break;

            default:
            throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
            break;
        }
        var event = doc.createEvent(eventClass);

        var bubbles = eventName == "change" ? false : true;
        event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

        event.synthetic = true; // allow detection of synthetic events
        // The second parameter says go ahead with the default action
        node.dispatchEvent(event, true);
    } else  if (node.fireEvent) {
        // IE-old school style
        var event = doc.createEventObject();
        event.synthetic = true; // allow detection of synthetic events
        node.fireEvent("on" + eventName, event);
    }

};