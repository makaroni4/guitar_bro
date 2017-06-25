$(function() {
  $(".share-button--fb").on("click", function(e) {
    e.preventDefault();

    FB.ui({
      method: "share",
      href: $("meta[property='og:url']").attr("content"),
    }, function(response){
      console.log("SHARED")
    });
  });
});
