const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const CleanCSS = require("clean-css");
const Terser = require("terser");
const fs = require("fs");

module.exports = function(eleventyConfig) {
    // Custom markdown renderer with anchor links
    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true
    }).use(markdownItAnchor, {
        permalink: true,
        permalinkClass: "direct-link",
        permalinkSymbol: "#"
    });

    eleventyConfig.setLibrary("md", markdownLibrary);

    // Add a date formatting filter
    eleventyConfig.addFilter("readableDate", dateObj => {
        return new Date(dateObj).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    });

    // CSS Minification Filter
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // JS Minification Filter (async)
    eleventyConfig.addNunjucksAsyncFilter("jsmin", async function(code, callback) {
        try {
            const minified = await Terser.minify(code);
            callback(null, minified.code);
        } catch (err) {
            console.error("Terser error: ", err);
            // Fallback to unminified code if Terser fails
            callback(null, code);
        }
    });

    // Read CSS and JS files for inline use if needed
    eleventyConfig.addFilter("readFile", function(file) {
        return fs.readFileSync(file, "utf8");
    });

    // Passthrough file copy
    // Don't passthrough CSS and JS as we'll process them with our build templates
    // eleventyConfig.addPassthroughCopy("./src/css");
    // eleventyConfig.addPassthroughCopy("./src/js");
    eleventyConfig.addPassthroughCopy("./src/images");

    // Watch for changes
    eleventyConfig.addWatchTarget("./src/css/");
    eleventyConfig.addWatchTarget("./src/js/");

    // Configure directory structure
    return {
        dir: {
            input: "src",           // Input directory
            output: "docs",         // Output directory
            includes: "_includes",  // Includes directory
            layouts: "_includes/layouts", // Layouts directory
            data: "_data"          // Data directory
        },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk"
    };
};