# Lizzy Finds

Refreshed static website with Recommendations, All Finds, and sourced Shokz owner experiences.

Edit root HTML pages and assets/. Product prices supplied by the owner are in content/prices.json. The article is recommendations/shokz-running-headphones/index.html.

Run node build.cjs to rebuild dist/, canonical links, sitemap, robots.txt, and redirects for the previous Shokz guide URL. No dependencies are needed.

Run node server.cjs to preview at http://127.0.0.1:8786.

Push main to https://github.com/MaybeLizzy/lizzy-finds. GitHub Actions builds and deploys dist/ to https://maybelizzy.github.io/lizzy-finds/.

The previous local site is preserved separately as lizzy-finds-v1 and is not used by this build.
