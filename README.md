# Rena Seulgi Jang website

A static Astro website with shared English, Korean, German, Italian, and French
page templates. Public language prefixes remain `/en/`, `/ko/`, `/de/`, `/it/`,
and `/fr/`.

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
ASTRO_SITE_URL=https://gksdl0311.github.io ASTRO_BASE_PATH=/renaseulgijang/ ASTRO_TELEMETRY_DISABLED=1 npm run build
npm run check:site
ASTRO_BASE_PATH=/renaseulgijang/ ASTRO_TELEMETRY_DISABLED=1 npm run preview
```

The deployment base is applied to local images, navigation, language switches,
favicons, generated scripts/styles, and the homepage redirect. Without
`ASTRO_BASE_PATH`, the site continues to run at the domain root. Set
`ASTRO_SITE_URL` when specifying a production origin outside the Pages workflow.
The configured fallback origin is `https://gksdl0311.github.io`; the Pages
workflow supplies both the actual origin and project base. `check:site` expects
this project address by default; set the same `ASTRO_SITE_URL` and
`ASTRO_BASE_PATH` variables for another deployment address.

## Languages and SEO

- `src/i18n.ts` is the ordered language registry: labels, native names, date
  locales, Open Graph locales, and translation imports live here.
- `src/i18n/locales/*.ts` contains localized interface text, page descriptions,
  biography paragraphs, schedule labels, repertoire labels, and press summaries.
  The shared `LocaleCopy` schema and build-time validation reject missing or
  empty keys, different placeholder tokens, and incomplete video explanations.
- `src/components/pages/` contains ten shared templates. Language route files
  are thin wrappers; they supply only the appropriate language prop.
- `src/i18n/routes.ts` discovers available wrapper filenames without importing
  their components. Language switches preserve the current page, with a target
  language homepage fallback when that page has no wrapper. Navigation also
  respects availability. Every registered language must have a homepage.
- `BaseLayout.astro` generates document language, translated metadata,
  self-canonical URLs, reciprocal hreflang, an English x-default fallback, and
  Open Graph metadata. `src/pages/sitemap.xml.ts` uses the same registry and route
  availability to include every language page and its alternates.

To add a future language:

1. Create a complete `src/i18n/locales/<code>.ts` implementing `LocaleCopy`;
   translate UI and descriptive text while preserving facts and original titles.
2. Import and register it in `src/i18n.ts`, including its display label, native
   name, date locale, and Open Graph locale. Do not add language arrays elsewhere.
3. Add its video explanations to `src/data/video-descriptions.json` for every
   catalogue ID. Press translation entries use the factual article IDs.
4. Copy the required thin wrappers from `src/pages/en/` to `src/pages/<code>/`,
   changing their `lang` props. Provide all ten routes for a complete edition.
   Navigation, language switching, SEO, and sitemap update automatically.
5. Build with the production origin/base and run `npm run check:site`, then
   inspect the new text on desktop, phone, and tablet layouts. Human native
   editorial review is recommended before publishing a new translation.

The verifier checks all generated language routes, document languages, titles,
descriptions, canonical and reciprocal alternate URLs, Open Graph metadata,
sitemap entries, local links/assets, switcher destinations, shared content
counts, original press headlines, and absence of CV routes. Existing language
URLs and shared templates do not need a routing migration.

## Content

- `src/data/schedule.json`: performance dates, venues, and optional local times.
  Dates are classified as upcoming or past when the static site is built.
- `src/data/repertoire.json`: authoritative roles, works, and composers.
- `src/data/videos.json`: video IDs/titles and catalogue provenance.
- `src/data/video-descriptions.json`: short editorial explanations in all five languages,
  keyed by video ID so refreshing channel metadata preserves the explanations.
- `src/data/press.json`: stable article IDs, original article URLs/headlines and
  language, verified publication information, thumbnails, and provenance.
  Translated headlines, summaries, publisher labels, and alt text live in each
  locale's `press.articles` section; original source headlines remain intact.

Refresh public YouTube uploads when verified HTTPS access to the official channel
is available:

```sh
python3 scripts/sync-youtube-videos.py
```

The importer follows the public `/videos` tab's pagination and replaces the
catalogue only after a complete, supported response. Shorts and live-stream tabs
are outside that scope. The current catalogue contains all ten public uploads
verified on 8 October 2026, including the four separately supplied video links.
Add a localized explanation for any new video ID before publishing updated
content, then rebuild the site.

If cloud network access is unavailable, run **Actions → Collect public YouTube
catalogue → Run workflow**. The manual workflow saves `videos.json` in the
`public-youtube-catalogue` artifact for seven days. It changes neither source
content nor the deployed website. Review the IDs, canonical titles, provenance,
pagination, and completeness before adopting the file into `src/data/videos.json`.

If artifact downloads are blocked, enable the optional `publish_api_output`
input. The same public JSON is then available through GitHub's Checks API:
concatenate the numbered check runs' `output.text` fields in order and verify the
UTF-8 SHA-256 digest shown in their summaries before reviewing the catalogue.

The manual **Collect public press sources** workflow retrieves editorial evidence
from the two original publishers for review. It does not change site content.
Press cards link directly to those original articles in every language.
