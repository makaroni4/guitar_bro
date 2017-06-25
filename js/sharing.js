$(document).on("click", ".share-button", function(e) {
  var $this = $(this);

  ga("send", "event", "Game", "Share", $this.data("eventLabel"));

  $this.customerPopup(e);
});
