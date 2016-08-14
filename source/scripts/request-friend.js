$(function(){
	LOGGER('Send friend request');	
	loadMoreByScroll(5).then(function(response){
		LOGGER('Done load more page');	
		var buttons = $("li .FriendRequestAdd");
		LOGGER('Number of buttons '+ buttons.length);	
		clickButtonListOneByOne(buttons,2000,0);	
	});
});