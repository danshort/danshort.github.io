const fs = require('fs');
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItHeaderSections = require("markdown-it-header-sections");
const markdownItAttrs = require('markdown-it-attrs');
const CleanCSS = require("clean-css");
const Terser = require("terser");

module.exports = function(eleventyConfig) {
    // Custom markdown renderer with anchor links
    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true
    })
    // Apply markdown-it-attrs first
    .use(markdownItAttrs, {
        allowedAttributes: [], // Empty array means all attributes are allowed
        leftDelimiter: '{',
        rightDelimiter: '}'
    })
    // Then apply anchor links
    .use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: `
        <span aria-hidden="true">#</span>
        `,
        placement: 'after'
    })
    })
    // Then wrap evertything in sections
    .use(markdownItHeaderSections, {
    // Optional config: which heading levels to wrap
    // default is to wrap h1 through h6
    // levels: [2] // wrap only h2 sections
    });

    eleventyConfig.setLibrary("md", markdownLibrary);

    // IMPORTANT: Set the markdown template engine to null
    // This prevents Nunjucks from trying to process markdown files
    eleventyConfig.markdownTemplateEngine = null;

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
    eleventyConfig.addPassthroughCopy("./src/images");

    // Generate CNAME file before build
    eleventyConfig.on('beforeBuild', () => {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const domain = packageJson.config?.domain;

        if (domain) {
            // Ensure docs directory exists
            if (!fs.existsSync('./docs')) {
                fs.mkdirSync('./docs', { recursive: true });
            }
            // Write CNAME directly to docs folder
            fs.writeFileSync('./docs/CNAME', domain);
        }
    });

    // Watch for changes
    eleventyConfig.addWatchTarget("./src/css/");
    eleventyConfig.addWatchTarget("./src/js/");

    // Configure directory structure
    return {
        dir: {
            input: "src",
            output: "docs",
            includes: "_includes",
            layouts: "_includes/layouts",
            data: "_data"
        },
        templateFormats: ["md", "njk", "html"],
        htmlTemplateEngine: "njk"
    };
};