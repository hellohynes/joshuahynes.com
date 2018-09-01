window.onload = function () {
    scrollSpy('#menu-list', {
        offset: 100,
        menuActiveTarget: '.menu__item > a',
        sectionClass: 'body section.scrollspy',
        activeClass: 'active'
    })
}
