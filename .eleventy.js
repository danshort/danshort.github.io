module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("./src/style.css");
    eleventyConfig.addPassthroughCopy("./src/images");
    return {
        dir: {
            input: "src",
            output: "docs",
        },
    };
};