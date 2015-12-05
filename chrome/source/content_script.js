var DEBUG = false;

var urlOrigin=window.location.origin;
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
		if(cfgData['numberOfScroll'] > 1){
			autoScrollToBottom(cfgData)
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
			var moreComments = $("a[role='button'][class='UFIPagerLink']");
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
			loadMoreComment(moreComments,1000);
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

		},2000);
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
					sad_posts = $("a[role='button'][data-ft='{\"tn\":\">\"}']").filter(function( index ) {
						var dataReactid = $(this).attr("data-reactroot");
						return dataReactid !== undefined;
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

		var happy = [];
		
		LOGGER("Number of posts and comments : "+ sad_posts.length);
		// Select only the Like buttons.
		// Convert the sad NodeList to a happy Array.
		var numberOfLikes=sad_posts.length;
		if(numberOfLikes > 0){
			chrome.runtime.sendMessage({count: numberOfLikes}, function(response) {
				//console.log(response);
			});  
		}


		for (var i = 0; i < numberOfLikes; i++) {
			happy.push(sad_posts[i]);
		}
		LOGGER(happy);
		function happyFn(happy, intervalTime) {
			if (happy.length <= 0) {
				return;
			}
			// console.log("happy : ", happy[0]);
		    
		    happy[0].click();

			if(happy.length > 0){
				//console.log('Send request : '+ (happy.length - 1));
				chrome.runtime.sendMessage({count: (happy.length - 1)}, function(response) {
					//console.log(response);
				});  
			}

			window.setTimeout(function() {
				happyFn(happy.splice(1), intervalTime);
			}, intervalTime);
		}
		LOGGER(time);
		happyFn(happy , time);		
	};
})();

function isFacebook(){
	return urlOrigin.indexOf('facebook') > -1;
}
function isGooglePlus(){
	return urlOrigin.indexOf('plus.google.com') > -1;
}
function isTwitter(){
	return urlOrigin.indexOf('twitter') > -1;
}
function LOGGER(p){
	if(DEBUG){
		console.log(p);
	}
}