//fbProfileBrowserResult scrollable threeColumns hideSummary
$(function(){
	LOGGER('Invite friend request');	
	if(checkLoadMoreAble()){
		var scrollSelector = ".fbProfileBrowserResult.scrollable.hideSummary";
		var buttonSelector = "a.uiButton";
		loadMoreByScrollWithSelectorCondition(scrollSelector,buttonSelector).then(function(response){
			LOGGER('Done load more page');	
			var buttons = $(buttonSelector).filter(function(index){
				return $(this).is(":visible");
			});
			LOGGER('Number of buttons '+ buttons.length);	
			clickButtonListOneByOne(buttons,2000,0).then(function(done){
				sendNumberToActionButton(0);
			});	
		});
	}else{
		alert("Please goto your fanpage, and open invite friend list");
	}
});

function checkLoadMoreAble() {
 	var form = $('form[action*="ajax/pages/invite/"]');
 	return form.is(":visible");
}