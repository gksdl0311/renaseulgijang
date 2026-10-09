# Contemporary Opera Editorial redesign

Implemented locally for review. Existing language URLs and GitHub Pages deployment
configuration are preserved. No commit, push or deployment accompanies this work.

## Design and implementation

- Warm ivory, charcoal, restrained burgundy, and a darker warm grey chosen for
  readable text on both ivory and tinted panels.
- Self-hosted variable Cormorant Garamond and DM Sans, with Korean serif/sans
  fallbacks. Font licences are included in `public/fonts/`. No font-provider
  request is required when visiting the site.
- A prominent official portrait and artist wordmark introduce the homepage,
  followed by an existing biography excerpt, three factual past performances,
  three recordings, curated photography, and professional enquiries.
- Seven direct navigation destinations and a shared footer use one navigation
  helper. All five language switches preserve the current route and recording
  selection; unavailable localized routes still fall back to that language's home.
- The Listen selector changes sourced musical metadata, the existing localized
  explanation, and a complementary approved artist photograph. A direct link
  can select a recording. YouTube is contacted only after a play click; closing
  the dialog destroys its player. Original YouTube links remain available.
- Both photograph collections share an accessible native dialog with original
  photographs, previous/next controls, arrow keys, Escape, and restored focus.
  Without the gallery enhancement, photograph links still open the originals.
- All 35 collection photographs, 10 recordings, 10 performance records, 14
  repertoire entries and two press articles are retained. The unfinished contact
  representation note is no longer displayed; no agency details were invented.
- Schedule classification uses the Berlin calendar at build time and refreshes
  in the browser, including day rollover. No future engagement has been invented.
- Canonical, hreflang, x-default, Open Graph and sitemap behavior is retained.
  Artist, website and localized page structured data use verified public details.

## Images and maintenance

40 approved photographs have 118 responsive WebP variants at widths up to 1200px.
The original photographs remain byte-for-byte intact. Originals occupy about
61.97 MiB; all derivative sizes together occupy about 5.37 MiB. The homepage
portrait's variants range from 6.8 to 26.1 KiB. These figures describe files, not a
claim about measured Core Web Vitals or total page transfer.

After updating approved photographs, run `npm run optimize:images`, then build
and run `npm run check:site`. Keep the originals and commit the regenerated
manifest and variants together. The production verifier checks their hashes,
formats, dimensions and local URLs, including CSS font URLs and `srcset` targets.
The existing GitHub Pages workflow runs this verifier before uploading its build.

New interface text lives in `src/i18n/editorial/<language>.json`, imported by the
existing locale dictionaries. Existing translated strings and biography paragraphs
are unchanged. The same complete-key/placeholder validation applies to new copy.
A new language needs an editorial dictionary as well as the existing locale,
video explanations and localized route wrappers.

## Editorial review still needed

New interface copy is draft editorial translation in EN, KO, DE, IT and FR. It is
complete and validated, but has not received human native-speaker approval.
Please review these new dictionaries before publication, especially French,
Italian and Korean display labels and enquiry phrasing.

Artist confirmation is still needed for time-sensitive biography wording about
current studies and upcoming engagements. The biography's competition name
"Pavarotti Voice Competition" differs from the official video's Korean title
"파파로티 성악 콩쿠르" (Paparotti). Both existing sources were preserved; no
assumption was used to resolve this discrepancy.

No verified downloadable professional biography was found. Embedded EXIF Artist
and Copyright fields identify Emily Scroggie for onstage photographs 02–04;
those three captions and their fullscreen views now show this credit. Credits
for the remaining photographs require artist confirmation. No confirmed future dates appear in the
current schedule as of 9 October 2026. Press items remain reports/mentions, not
invented critical reviews or pull quotes.

## Verification

Production build and TypeScript checking pass. The static verifier covers all
50 localized pages, reciprocal SEO, sitemap, five-language switching destinations,
all referenced local assets, retained content, structured data, absence of CV
routes, original image hashes and all 118 WebP variants.

Browser checks cover all 50 pages at 375, 768, 1024 and 1440px (200 combinations):
no horizontal overflow, overlapping desktop navigation, missing local assets,
page errors or unsolicited third-party requests were found. Interaction checks
cover all 50 recording selections across five languages, five recording dialogs,
10 gallery dialogs, language switching with selected recordings, mobile menu
focus/Escape, and schedule regrouping across Berlin midnight. Screenshots were
reviewed after lazy images loaded.

Automated WCAG A/AA checks reported no violations across 60 page/width checks
and three open interaction states. Native dialog focus wrapping, Escape, the
correct Korean pronunciation text/voice selection, and the narrow-screen email
were also checked. These checks supplement this review;
they do not replace a full accessibility audit. Tablet checks use Chromium touch
emulation. Physical iPad/Safari testing and actual YouTube media streaming could
not be verified in this environment; player construction and original-video
fallback links were verified. Test the published site on those devices after an
approved deployment. No measured Lighthouse/Core Web Vitals score is claimed.
