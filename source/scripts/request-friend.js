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
		var dialogBox = xPath('//*[@id="facebook"]/body/div[19]/div[2]');
		if(dialogBox.length > 0){
			var buttons = $(".FriendButton > button.FriendRequestAdd");
			clickButtonListOneByOne(buttons,2000,0).then(function(response){
				sendNumberToActionButton(0);
				LOGGER("Finished find friend on Post");
			});	
		}else{
			var firstButtonXpath = '//*[@id="pagelet_ego_pane"]/div/div/div[2]/div[1]/div/div/div[3]/a/button';
			clickOnXpathButtonTill(firstButtonXpath,2000,100).then(function(response){
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