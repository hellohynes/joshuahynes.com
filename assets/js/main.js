function renderMenu() {
    var target = $(".js-toc--menu");
    var header = $(".js-toc--title");

    $.each($(header),function(i){
        var num = i + 1;
        var title = $(this).text();

        target.append("<li class='grid--cell jh-toc--item'>\
            <a class='jh-toc--link js-toc--link' href='#link-"+num+"'>\
                <div class='grid gs16 gsx'>\
                    <div class='grid--cell o40 js-toc--number'>"+num+"</div>\
                    <div class='grid--cell js-toc--label'>"+title+"</div>\
                </div>\
            </a>\
        </li>");

        $(".js-toc--number").text(function(i,val){
            return $.trim(val).length === 1 ? '0' + val : val;
        });

        $(this).attr("id","link-"+num++);
    });
};

$(document).ready(function() {
    renderMenu();
});

window.onload = function () {
    scrollSpy('.js-toc--menu', {
        offset: 100,
        menuActiveTarget: '.js-toc--link',
        sectionClass: '.js-scrollspy',
        activeClass: 'is__active'
    })
}
