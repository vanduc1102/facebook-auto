var urlOrigin=window.location.origin;
var fullUrl = window.location.href;
LOGGER('Content script running........... : '+urlOrigin);
(function(){
	chrome.storage.sync.get({
		"facebook": "post",
		"facebook_time":"1.0",
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
				}, intervalTime + getRandom(1,1000));
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
		}, 4000 +  getRandom(1,1000));
	}
	function executeLike(cfgData){
		var time=0;
		var sad_posts =[];
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
					sad_posts = $("a[data-testid='fb-ufi-unlikelink'][aria-pressed='false'],a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']");
					LOGGER('Like all comment : '+sad_posts.length);
					break;
				case 'both':
					sad_posts = $("a[role='button'][aria-pressed='false'],a[role='button'][data-ft='{\"tn\":\">\"}']");
					LOGGER('Facebook all post and comment : '+sad_posts.length);
					break;
				default:
					break;
			};
		}

		var happyBtns = createHappyButtons(sad_posts);
		
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
		LOGGER(happyBtns);
		LOGGER(time);
		
		happyFn(happyBtns , time);	

		function happyFn(happy, intervalTime) {
			if (happy.length <= 0) {
				return;
			}
			
		    
		    LOGGER("sent a like");
		    happy[0].click();

			if(happy.length > 0){
				//console.log('Send request : '+ (happy.length - 1));
				sendNumberToActionButton(happy.length - 1);
			}

			window.setTimeout(function() {
				happyFn(happy.splice(1), intervalTime);
			}, intervalTime + getRandom(1,1000));
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

function clickButtonListOneByOne(buttons, time, number) {
  var d = $.Deferred();
  var promise = d.promise();
  $.each(buttons, function(index, button) {
    promise = promise.then(function() {
    	return clickOnButton(button, time, number++);
    });
  });
  d.resolve();
  return promise;
}

function clickOnButton(button, time, number){
	var d = $.Deferred();
	var rand = getRandom(1,1000) ;
	setTimeout(function() {
		number ++;
		button.click();		
		sendNumberToActionButton(number);
	    d.resolve(number);
	}, time + rand);
	return d.promise();
}

function getRandom(min,max){
	return Math.floor(Math.random() * max) + min ;
}
