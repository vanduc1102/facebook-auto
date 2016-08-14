var DEBUG = true;
function LOGGER(p){
	if(DEBUG){
		console.log(p);
	}
}
function clickOnButton(button, time, number){
	var d = $.Deferred();
	var rand = getRandom(1,1000) ;
	setTimeout(function() {
		number ++;
		// The root of everything
		
		LOGGER("button clicked");
		
		button.click();		
		//sendNumberToActionButton(number);
	    d.resolve(number);
	}, time + rand);
	return d.promise();
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

function loadMoreByElement(cssSelector, expected){
	var d = $.Deferred();
	return clickOnElementTill(cssSelector,d, 1, expected);
}

function loadMoreByScroll(expected){
	var d = $.Deferred();
	return scrollWrapper(d,1,expected);
}

function clickOnElementTill(cssSelector,d, times, expected){
	if(expected != 0 && times == expected){
		d.resolve();
		return d.promise();
	}
	LOGGER("Load more by element  "+ times);
	times ++;
	clickOnElementAndWait(cssSelector).then(function(resolve){
		clickOnElementTill(cssSelector,d, times , expected);
	},function(reason){
		d.resolve();
	});
	return d.promise();
}

function clickOnElementAndWait(cssSelector){
	var d = $.Deferred();
	var nextPageElement = $(cssSelector).get(0);
	var rand = getRandom(1,1000) ;
	if(nextPageElement){
		setTimeout(function() {
			nextPageElement.click();
		}, 1000 + rand);
		
		setTimeout(function() {
			LOGGER("loaded next page ");
		    d.resolve();
		}, 5000 + rand);
	}else{
		d.reject();
	}
	return d.promise();
}

function scrollWrapper(d,times,expected){
	if(!times){
		if(expected == 5){
			d.resolve();
			return d.promise();
		}
	}else if(times == expected){
		d.resolve();
		return d.promise();
	}
	LOGGER("Load more by scroll  "+ times);
	times ++;
	scrollToBottom().then(function(resolve){
		scrollWrapper(d,times,expected);
	});
	return d.promise();
}
function scrollToBottom(){
	var d = $.Deferred();
	window.scrollTo(0,document.body.scrollHeight);
	window.setTimeout(function(){
		d.resolve();		
	}, 4000 +  getRandom(1,1000));
	return d.promise();
}

function getRandom(min,max){
	return Math.floor(Math.random() * max) + min ;
}

function openPage(url){
	var d = $.Deferred();
	window.location.href = url;
	window.setTimeout(function(){
		d.resolve();		
	}, 4000 +  getRandom(1,1000));
	return d.promise();
}
function getFullUrl(){
	return window.location.href;
}
