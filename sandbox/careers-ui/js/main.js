/* WIZARD */
$(".js-wizard-next").click(function() {
	var step = $(".js-focus").data("step");

	if(step != "6") {
		$(".wizard-step[data-step=" + step + "]").removeClass("js-focus").addClass("js-hide").addClass("js-left");
		$(".wizard-step[data-step=" + (step + 1) + "]").removeClass("js-hide").removeClass("js-right").addClass("js-focus");
		$(".js-progress-fill").attr("data-step", (step + 1));
	} else {
		window.location = "preview-basics.html";
	}
});

$(".js-wizard-prev").click(function() {
	var step = $(".js-focus").attr("data-step");

	if(step != "1") {
		$(".wizard-step[data-step=" + step + "]").removeClass("js-focus").addClass("js-hide").addClass("js-right");
		$(".wizard-step[data-step=" + (step - 1) + "]").removeClass("js-hide").removeClass("js-left").addClass("js-focus");
		$(".js-progress-fill").attr("data-step", step - 1);
	} else {
		alert("You just started man!");
	}
});





/* Scroll navigation */
/* This is old stuff */
$(".js-nav-content").on("click", function() {
	$(".nav-main").addClass("js-offpage");
	$(".nav-company").addClass("js-focus").removeClass("js-offpage");
});
$(".js-nav-design").on("click", function() {
	$(".nav-main").addClass("js-offpage");
	$(".nav-design").addClass("js-focus").removeClass("js-offpage");
});
$(".js-nav-analytics").on("click", function() {
	$(".nav-main").addClass("js-offpage");
	$(".nav-analytics").addClass("js-focus").removeClass("js-offpage");
});
$(".js-nav-settings").on("click", function() {
	$(".nav-main").addClass("js-offpage");
	$(".nav-settings").addClass("js-focus").removeClass("js-offpage");
});

$(".-home").on("click", function() {
	$(this).parent().parent().addClass("js-offpage").removeClass("js-focus");
	$(".nav-main").addClass("js-focus").removeClass("js-offpage");
});