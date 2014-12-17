self.port.on("setBadgeText", function(text)
{
  var element = document.getElementById("badgeText");
  element.textContent = text;
  element.hidden = (text == null);
});