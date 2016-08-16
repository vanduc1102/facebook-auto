$(function(){
	LOGGER('Send friend request');	
	if(checkLoadMoreAble()){
		loadMoreByScroll(5).then(function(response){
			LOGGER('Done load more page');	
			var buttons = $("li .FriendRequestAdd");
			LOGGER('Number of buttons '+ buttons.length);	
			clickButtonListOneByOne(buttons,2000,0).then(function(done){
				sendNumberToActionButton(0);
			});	
		});
	}else{
		var dialogBox = $("div[role='dialog'] ul[id*='reaction_profile_browser'");
		if(dialogBox.length > 0 ){
			var buttons = dialogBox.find(".FriendButton > button.FriendRequestAdd");
			LOGGER('Number of buttons '+ buttons.length);
			clickButtonListOneByOne(buttons,2000,0).then(function(response){
				sendNumberToActionButton(0);
				LOGGER("Finished find friend on Post");
			});	
		}else{
			var firstButtonXpath = 'div#rightCol div.clearfix.ego_unit button';
			clickOnXpathButtonTill(firstButtonXpath,3000,100).then(function(response){
				sendNumberToActionButton(0);
				LOGGER("Finished find of left panel");
			});
		}
	}
});

function checkLoadMoreAble() {
    var links = ["https://www.facebook.com/?sk=ff",
        "https://www.facebook.com/friends/requests/?fcref=jwl",
        "https://www.facebook.com/find-friends/browser/?ref=psa"];
    var fullUrl = getFullUrl();
    return checkLinkInLinks(fullUrl, links);
}