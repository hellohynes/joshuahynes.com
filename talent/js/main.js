/* Show and reveal sections */
$(".js-nav-link").click(function() {
	var linkId = $(this).data("page");
	var target = "#" + linkId; 

	$(".js-content-section.is-visible").removeClass("is-visible").addClass("is-hidden");
	$(target).removeClass("is-hidden").addClass("is-visible");
});
