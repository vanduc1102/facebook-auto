var ytTimeout = setTimeout(function(){ 
	var button = $("button.like-button-renderer-like-button-unclicked");
	if(button.hasClass("hid")){
		LOGGER("button is pressed, clearInterval : "+ ytTimeout);
		clearTimeout(ytTimeout);
	}else{
		LOGGER("Button is not pressed, try to press after 3 second.");
		button.click();
	}
}, 3000);
