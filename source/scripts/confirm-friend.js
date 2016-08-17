$(function() {
    LOGGER('Confirm friend request');
    if(checkLoadMoreAble()){
	    loadMoreByElement('a[class~="uiMorePagerPrimary"][rel="async"]', 10).then(function(response) {
	        LOGGER('Done load more page');
	        var buttons = $(".ruResponseButtons > button").filter(function(index){
	        	return $(this).is(":visible");
	        });
	        LOGGER('Number of buttons ' + buttons.length);
	        clickButtonListOneByOne(buttons, 2000, 0).then(function(response){
				sendNumberToActionButton(0);
				LOGGER("Finished find of left panel");
			});
	    });
	}else{
		var buttons = $("div#fbRequestsList_wrapper button[name=\"actions[accept]\"]").filter(function(index){
			return $(this).is(":visible");
		});
	    LOGGER('Number of buttons ' + buttons.length);
	    clickButtonListOneByOne(buttons, 2000, 0).then(function(response){
			sendNumberToActionButton(0);
			LOGGER("Finished find of left panel");
		});
	}
});

function checkLoadMoreAble() {
    var links = ["https://www.facebook.com/?sk=ff",
        "https://www.facebook.com/friends/requests/?fcref=jwl",
        "https://www.facebook.com/find-friends/browser/?ref=psa"];
    var fullUrl = getFullUrl();
    return checkLinkInLinks(fullUrl, links);
}
