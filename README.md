# Dan's README

This is the repo for my personal readme file, hosted through GitHub pages, at [readme.dansshorts.com](https://readme.dansshorts.com).

This site was built with [11ty](https://www.11ty.dev), and major parts of it were coded using [Claude](https://claude.ai) as a way to experiment with AI code generation, and learn about the pitfalls and triumphs of Agentic AI and parts of 11ty that I haven't used in the past.

It's a work in progress, like myself, and will change and evolve over time. It's small, but it works for me. Feel free to fork the repo and build your own if you'd like.

## Prerequisites
- Node.js 18+
- npm 9+

## Local Development
1. Clone this repository
```bash
git clone https://github.com/danshort/danshort.github.io.git
cd danshort.github.io
```

2. Install dependencies
```bash
npm install
```

3. Start local development server
```bash
npm start
```

The site will be available at http://localhost:8080

## Available Scripts

- `npm start` - Starts the development server with live reload
- `npm run build` - Cleans the docs folder and builds the site for production
- `npm run clean` - Removes the docs folder
- `npm run debug` - Runs build with Eleventy debugging enabled

## Building
```bash
npm run build
```
Built files are placed in the `docs` folder, which is automatically deployed by GitHub Pages.

## Personal notes for me:

Stats are available through [Umami](https://us.umami.is/dashboard), and public statistics (I promise they will _not_ be impressive) can be viewed at the [Umami share URL](https://cloud.umami.is/share/mgCbCBMxdjBwFsyZ/readme.dansshorts.com).

## Deployment Status
[![pages-build-deployment](https://github.com/danshort/danshort.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/danshort/danshort.github.io/actions/workflows/pages/pages-build-deployment)

