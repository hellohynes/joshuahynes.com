// Message a candidate!
$(".js-message-candidate").click(function() {
	$(".js-candidate-list").css("margin-left","-40%");
	$(".js-candidate-profile").css({
		"flex": "1 0 50%",
		"max-width": "50%"
	})
})
$(".js-message-candidate-preview").click(function() {
	$(".js-candidate-list").css("margin-left","-90%");
})
$(".js-message-send").click(function() {
	$(".js-candidate-list").css("margin-left","0");
	$(".js-candidate-profile").css({
		"flex": "1 0 60%",
		"max-width": "60%"
	})
})

/* Show and reveal sections */
$(".js-nav-link").click(function() {
	var linkId = $(this).data("page");
	var target = "#" + linkId; 

	$(".js-content-section.is-visible").removeClass("is-visible").addClass("is-hidden");
	$(target).removeClass("is-hidden").addClass("is-visible");
});
