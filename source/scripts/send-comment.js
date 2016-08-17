$(function(){
	debugger;
	//'div[contenteditable="true"]'
	var editableElements = $("div[id*='addComment']").filter(function(index){
		return $(this).is(":visible");
	});
	if(editableElements.get(0)){
		sendComment(editableElements.get(0), createTextElement());
	}
});

function sendComment(editableElement, textElement){
	var d = $.Deferred();
	editableElementObject = $(editableElement);
	var focous = editableElementObject.find("div.UFICommentContainer");
	focous.focus();	
	var span = focous.find("span").filter(function(index){
		return $(this).attr("data-offset-key");
	});
	if(span.length > 0){
		span.html(textElement);
		setTimeout(function(){
			sendEnterKey($(span), 8);
			sendEnterKey($(span), 13);
			d.resolve(true);
		},2000);
	}else{
		d.reject();
	}
	return d.promise();
}
function sendEnterKey(element , code){
	var e = jQuery.Event("keypress");
	e.which = code; //choose the one you want
	e.keyCode = code;
	element.trigger(e);
}
function createTextElement(text){
	return '<span data-text="true">Xin chao, cho minh lam quen nhe</span>';
}