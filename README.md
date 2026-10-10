# Lizzy Finds

English, buildless static content website. Local version only; no public hosting or affiliate tracking.

## Preview

In this directory run:

```powershell
node server.cjs
```

Open http://127.0.0.1:8788 . Stop the server with Ctrl+C. No npm install is needed. Node.js is required.

## Files

- `dist/`: all eight pages and local assets, ready for a future static host.
- `build-lizzy.cjs`: shared layout, article content and page generator.
- `content/models.json`: headphone scores, specifications and official price snapshot.
- `content/posts.json`: published article metadata; homepage and lists share this data.
- `dist/assets/main.js`: browser-local calculator and mobile navigation.
- `server.cjs`: local HTTP preview server.
- `qa.cjs`: browser and link checks, uses the locally available Playwright package and Edge.

After editing content or page templates run `node build.cjs`. For a new article, create its page in the builder and add its metadata to posts.json. The shared cards will then update. Update both visible price-check dates and model data when refreshing prices.

## Content notes

Sony prices are a dated snapshot checked on October 10, 2026, not live prices. XM3 and XM4 need personal quotes to join a price-weighted ranking. Reviews are intentionally empty pending Lizzy’s actual experience.

The cover is an original typographic SVG, not a product photograph. No external fonts, image services, cookies, analytics or storage are used. Privacy copy must be reviewed against the actual hosting setup before public launch. Domain purchase, hosting and affiliate approval remain pending.
