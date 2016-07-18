
/* Scroll navigation */
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