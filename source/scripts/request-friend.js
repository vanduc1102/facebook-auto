$(function(){
	LOGGER('Send friend request');	
	if(checkLoadMoreAble()){
		loadMoreByScroll(5).then(function(response){
			LOGGER('Done load more page');	
			var buttons = $("li .FriendRequestAdd").filter(function(index){
				var btn = $(this);
				return !btn.hasClass('hidden_elem') && btn.is(":visible");
			});
			LOGGER('Number of buttons '+ buttons.length);	
			clickButtonListOneByOne(buttons,2000,0).then(function(done){
				sendNumberToActionButton(0);
			});	
		});
	}else{
		var dialogBox = $("div[role='dialog'] ul[id*='reaction_profile_browser'").filter(function(index){
			return $(this).is(":visible");
		});
		if(dialogBox.length > 0 ){
			var buttons = dialogBox.find(".FriendButton > button.FriendRequestAdd").filter(function(index){
				var btn = $(this);
				return !btn.hasClass('hidden_elem') && btn.is(":visible");
			});
			LOGGER('Number of buttons '+ buttons.length);
			clickButtonListOneByOne(buttons,2000,0).then(function(response){
				sendNumberToActionButton(0);
				LOGGER("Finished find friend on Post");
			});	
		}else{
			var buttonCssSelector = 'div#rightCol div.clearfix.ego_unit button';
			clickOnXpathButtonTill(buttonCssSelector,3000,100).then(function(response){
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