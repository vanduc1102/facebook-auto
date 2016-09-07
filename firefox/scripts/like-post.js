var urlOrigin=window.location.origin;
var fullUrl = window.location.href;
LOGGER('Content script running........... : '+urlOrigin);
(function(){
	chrome.storage.local.get({
		"facebook": "post",
		"facebook_time":"1.0",
		"numberOfScroll":0
	  }, function(cfgData) {
	  	LOGGER(cfgData);
		var scrollTimes = cfgData['numberOfScroll'];
	  	loadMoreByScroll(null,scrollTimes).then(function(){
	  		executeLike(cfgData);
	  	});
		
	});
	
	function executeLike(cfgData){
		var time = 0;
		var sad_posts =[];
		time = parseFloat(cfgData['facebook_time'])* 1000;		
		sad_posts = $("a[role='button'][aria-pressed='false']").filter(function(index){
			return !$(this).hasClass("UFIReactionLink");
		});
		LOGGER('Like all post : '+sad_posts.length);

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

function getRandom(min,max){
	return Math.floor(Math.random() * max) + min ;
}
