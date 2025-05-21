module.exports = {
    isProd: process.env.ELEVENTY_ENV === 'production',
    environment: process.env.ELEVENTY_ENV || 'development'
};