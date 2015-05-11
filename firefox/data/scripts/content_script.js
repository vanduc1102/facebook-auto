var getUrl = window.location;
var originLocation = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

self.port.on('sendConfigurationData', function(configurationData) {
	mainExcetute(configurationData);
});

var mainExcetute = function(cfgData) {
	var urlOrigin = window.location.origin;
	var time = 0;
	//console.log(urlOrigin);
	var sad_posts = [];
	//Google plus all
	if (urlOrigin.indexOf('plus.google.com') > -1) {
		time = (parseFloat(cfgData['google_time']) < 1) ? 2000 : parseFloat(cfgData['google_time']) * 1000;
		switch(cfgData['google']) {
		case 'post':
			sad_posts = $("div[id^=po-][aria-pressed='false']");
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
	};

	//Facebook like all
	if (urlOrigin.indexOf('facebook') > -1) {
		time = parseFloat(cfgData['facebook_time']) < 1 ? 2000 : parseFloat(cfgData['facebook_time']) * 1000;
		switch(cfgData['facebook']) {
		case 'post':
			// sad_posts = $("div");
			sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']").filter(function(index) {
				var dataReactid = $(this).attr("data-reactid");
				return dataReactid.length < 20;
			});
			break;
		case 'comment':
			sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']").filter(function(index) {
				var dataReactid = $(this).attr("data-reactid");
				return dataReactid.length >= 20;
			});
			break;
		case 'both':
			sad_posts = $("a[class='UFILikeLink'][data-ft='{\"tn\":\">\"}']");
			break;
		default:
			break;
		};
	}

	//Twitter favorite all
	if (urlOrigin.indexOf('twitter') > -1) {
		time = parseFloat(cfgData['twitter_time']) < 1 ? 1000 : parseFloat(cfgData['twitter_time']) * 1000;
		sad_posts = $("button[class^='ProfileTweet-actionButton js-actionButton js-actionFavorite']").filter(function(index) {
			return $(this).css("display") == 'inline-block';
		});
	}

	var happy = [];

	//console.log("Number of posts and comments : " + sad_posts.length);
	self.port.emit("numberOfLike", originLocation, sad_posts.length);

	// Convert the sad NodeList to a happy Array.
	var numberOfLikes = sad_posts.length;

	for (var i = 0; i < numberOfLikes; i++) {
		happy.push(sad_posts[i]);
	}

	function happyFn(happy, intervalTime) {
		if (happy.length <= 0) {
			return;
		}
		
		happy[0].click();

		if (happy.length > 0) {
			self.port.emit("numberOfLike", originLocation, (happy.length - 1));
		}

		window.setTimeout(function() {
			happyFn(happy.splice(1), intervalTime);
		}, intervalTime);
	}

	happyFn(happy, time);

};
