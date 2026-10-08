# Rena Seulgi Jang website

A static Astro website with shared English, German, and Korean page layouts.

## Development

Use Node.js 24 and run commands from the repository root:

```sh
npm ci
ASTRO_TELEMETRY_DISABLED=1 npm run dev
ASTRO_TELEMETRY_DISABLED=1 npm run build
ASTRO_TELEMETRY_DISABLED=1 npm run preview
```

The production build is written to `dist/`. Cloud tasks already use isolated
checkouts; use the existing checkout rather than creating a Git worktree.

## Publish with GitHub Pages

In the GitHub repository, open **Settings → Pages** and choose **GitHub Actions**
as the source. The workflow in `.github/workflows/deploy-pages.yml` installs the
locked dependencies, builds the site for the address supplied by GitHub Pages,
and publishes the resulting static files when `main` changes.

After enabling Pages, use **Actions → Publish website to GitHub Pages → Run
workflow** if the initial run happened before Pages was enabled. The successful
deployment's `github-pages` environment shows the public website URL.

For the default project address, the destination is:

```text
https://gksdl0311.github.io/renaseulgijang/
```

This address is live only after GitHub reports a successful Pages deployment.

To test the project address locally:

```sh
ASTRO_BASE_PATH=/renaseulgijang/ ASTRO_TELEMETRY_DISABLED=1 npm run build
ASTRO_BASE_PATH=/renaseulgijang/ ASTRO_TELEMETRY_DISABLED=1 npm run preview
```

The deployment base is applied to local images, navigation, language switches,
favicons, generated scripts/styles, and the homepage redirect. Without
`ASTRO_BASE_PATH`, the site continues to run at the domain root. Set
`ASTRO_SITE_URL` when specifying a production origin outside the Pages workflow.

## Content

- `src/data/schedule.json`: performance dates, venues, and optional local times.
  Dates are classified as upcoming or past when the static site is built.
- `src/data/repertoire.json`: authoritative roles, works, and composers.
- `src/data/videos.json`: video IDs/titles and catalogue provenance.

Refresh public YouTube uploads when verified HTTPS access to the official channel
is available:

```sh
python3 scripts/sync-youtube-videos.py
```

The importer follows the public `/videos` tab's pagination and replaces the
catalogue only after a complete, supported response. Shorts and live-stream tabs
are outside that scope. The current catalogue retains three existing curated
videos; the full channel import is still pending network access. Rebuild the site
after content changes.
