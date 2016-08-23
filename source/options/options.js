var userLang = navigator.language || navigator.userLanguage;
userLang = userLang.substring(0,2);
//userLang = "vi";
if(!messages[userLang]){
	userLang = 'en';
}
//userLang='fr';
var paypalButtonVal = (messages[userLang]['btnSubmitPayPal']).replace('{}',2);
$("#paypal-button").val(paypalButtonVal);

$(function() {
  $("[i18n]").each(function() {
    $(this).html(messages[userLang][$(this).attr("i18n")]);
  });
  
});
function updateNumber(number){
	var strCount = messages[userLang]['msgCountNumber'].replace("{0}","<b style='color:red'>"+number+"</b>");
	$("[i18n='msgCountNumber']").html(strCount);
}

function updateLinkAnchorTag(anchorSelector){
	var anchor = $(anchorSelector);
	var urlReview = anchor.attr("href");
	urlReview +="?hl="+userLang;
	anchor.attr("href",urlReview);
}


// Saves options to chrome.storage
(function(){
	$("#options" ).on("input focusout",function( event ) {
		event.preventDefault();
		var facebook = document.getElementById('facebook').value;
		var facebook_time = document.getElementById('facebook-time').value;
		var numberOfScroll = document.getElementById('auto-scroll-times').value;
		LOGGER(youtubeCheck);
		chrome.storage.sync.set({
			"facebook": facebook,
			"facebook_time":facebook_time,
			"numberOfScroll":numberOfScroll
		}, function() {
			// Update status to let user know options were saved.
			var saveStatus =$('#save-success');
			saveStatus.removeClass("alert-dismissable");
			setTimeout(function() {
				saveStatus.addClass("alert-dismissable");
			}, 750);
		});
	});

	// Restores select box and checkbox state using the preferences
	// stored in chrome.storage.
	document.addEventListener('DOMContentLoaded', function restore_options() {
		chrome.storage.sync.get({
			"facebook": "post",
			"facebook_time": 1,
			"numberOfScroll":0,
			"count_number":1
		}, function(item) {
			document.getElementById('facebook').value = item['facebook'];
			document.getElementById('facebook-time').value = item['facebook_time'];
			document.getElementById('auto-scroll-times').value = item['numberOfScroll'];
			updateNumber(item["count_number"]);
			// console.log(item);
		});
	});
	// Update the slider UI and maybe plead with the user not to pay $0
	function onSliderChange() {
	    var zero = ($("#slider").val() == 0);
	    $("#not-paying").toggle(zero);
	    $("#payment-types").toggle(!zero);
	    $("#gift").toggle(!zero);

	    updateAmountFromSlider();
	}

	$("#slider").on("input change", function updateAmountFromSlider(event) {
		event.preventDefault();
	    var here = $("#right-panel");
	    var val = $("#slider").val();
	    var offset = (val - 1)  / 9 * ($("#slider").width());
	    offset = (val == 10) ? (offset - 22): offset;
	    var dollars = val;
	    here.find('#amt-text').css({
	        "padding-left": offset
	    });
	    here.find('#amt-text-num').text(dollars);
	    var paypalButtonVal = (messages[userLang]['btnSubmitPayPal']).replace('{}',(val*2));
	    // 'Send '+ (val*2) + ' cans with PayPal';
	    here.find("#paypal-button").val(paypalButtonVal);
	    var priceChoose= String((val*2) + ' cans');
	    here.find("#paypal-choose-price").val(priceChoose);
	});

	updateLinkAnchorTag("a#please-review");
})();
