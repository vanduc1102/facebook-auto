//console.log('Content script running........... : '+window.location.origin);
// Use default value color = 'red' and likesColor = true.
//var aSocial=['www.facebook.com','plus.google.com','twitter.com'];
(function(){
	chrome.storage.sync.get({
		"google": "post",
		"google_time":"1.0",
		"facebook": "post",
		"facebook_time":"1.0",
		"twitter_time":"0.8"
	  }, function(cfgData) {
		//console.log('chrome extenstion storage ');
		//console.log(cfgData);
		executeLike(cfgData);
		
	});
	function executeLike(cfgData){
		var urlOrigin=window.location.origin;
		var time=0;
		//console.log(urlOrigin);
		var sad_posts =[];
		if(urlOrigin.indexOf('plus.google.com') > -1){
			time = parseFloat(cfgData['google_time'])*1000;
			switch(cfgData['google']){
				case 'post':
					sad_posts = $("div[role='button'][aria-pressed='false']");
					// console.log('Plus all post : '+sad_posts.length);
					// for(var idx in sad_posts){
					// 	console.log('tags : ', sad_posts[idx]);
					// }
					break;
				case 'comment':
					sad_posts = $("button[role='button'][aria-pressed='false'][jscontroller]");
					//console.log('Plus all comment : '+sad_posts.length);
					break;
				case 'both':
					sad_posts = $("div[id^=po-][aria-pressed='false'],button[role='button'][aria-pressed='false'][jscontroller]");
					//var google_comment = $("button[role='button'][aria-pressed='false'][jscontroller]");
					//sad_posts =  $.merge(google_posts, google_comment);
					//console.log('Plus all post and comment : '+sad_posts.length);
					break;
				default:
					break;
			};
		}

		if(urlOrigin.indexOf('facebook') > -1){
			time = parseFloat(cfgData['facebook_time'])* 1000;
			// all post and comment
			// sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']");
			// only comment filter : filter("a[data-reactid*='comment']");
			
			switch(cfgData['facebook']){
				case 'post':
					sad_posts = $("a[role='button'][data-ft='{\"tn\":\">\"}']").filter(function( index ) {
						var dataReactid = $(this).attr("data-reactroot");
						//console.log(dataReactid.length);
						//console.log(dataReactid);
						//console.log("tag : ", this);
						//console.log(dataReactid.indexOf("commnet"));
						//TODO: need check why indexOf not work
						return dataReactid !== undefined;
					});
					//console.log('Like all post : '+sad_posts.length);
					break;
				case 'comment':
					sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']").filter(function( index ) {
						var dataReactid = $(this).attr( "data-testid" );
						return dataReactid.length >= 0;
					});
					//console.log('Like all comment : '+sad_posts.length);
					break;
				case 'both':
					sad_posts = $("a[role='button'][data-ft='{\"tn\":\">\"}']");
					//console.log('Facebook all post and comment : '+sad_posts.length);
					break;
				default:
					break;
			};
		}

		if(urlOrigin.indexOf('twitter') > -1){
			time = parseFloat(cfgData['twitter_time'])*1000;
			sad_posts = $("button[class^='ProfileTweet-actionButton js-actionButton js-actionFavorite']").filter(function( index ) {
				return $( this ).css("display") == 'inline-block' ;
			});
			//console.log("Number of favorite : "+ sad_posts.length);
			// sad_posts.filter(function(index, element){
			//     return !element.children("span")[0].hasClass('.is-favorited');
			// });
		}
		//var sad_comments = $('button[title="'+gl_comment+'"]');
		//var sad_all=sad_posts.concat(sad_comments);
		var happy = [];

		//console.log("Number of posts and comments : "+ sad_posts.length);
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
		//console.log('End content script running.............' + time);
		happyFn(happy , time);
	};
})();