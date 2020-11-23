module.exports = function(eleventyConfig) {
    eleventyConfig.addLayoutAlias('home', 'layouts/home.html');

    // Copy assets over
    eleventyConfig.addPassthroughCopy('assets/css');
    eleventyConfig.addPassthroughCopy('assets/fonts');
    eleventyConfig.addPassthroughCopy('assets/images');
    eleventyConfig.addPassthroughCopy('assets/js');

    return {
        dir: {
            css: "assets/css"
        }
    }
}
