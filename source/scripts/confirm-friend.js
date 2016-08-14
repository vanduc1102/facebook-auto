$(function(){
	LOGGER('Confirm friend request');
	loadMoreByElement('a[class~="uiMorePagerPrimary"][rel="async"]',10).then(function(response){
		LOGGER('Done load more page');	
		var buttons = $(".ruResponseButtons > button");
		LOGGER('Number of buttons '+ buttons.length);
		clickButtonListOneByOne(buttons,2000,0);	
	});
});