import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import { parse } from "parse5";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const base = `/${(process.env.ASTRO_BASE_PATH ?? "renaseulgijang").replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");
const origin = new URL(process.env.ASTRO_SITE_URL ?? "https://gksdl0311.github.io").origin;
const walkFiles = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = resolve(dir, entry.name);
  return entry.isDirectory() ? walkFiles(path) : [path];
});
const nodes = document => {
  const output = [];
  const visit = node => { output.push(node); (node.childNodes ?? []).forEach(visit); };
  visit(document);
  return output;
};
const attrs = node => Object.fromEntries((node.attrs ?? []).map(attr => [attr.name, attr.value]));
const text = node => node.nodeName === "#text" ? node.value : (node.childNodes ?? []).map(text).join("");
const hasClass = (node, name) => (attrs(node).class ?? "").split(/\s+/).includes(name);
const withClass = (document, name) => nodes(document).filter(node => hasClass(node, name));
const normalizedText = node => text(node).replace(/\s+/g, " ").trim();
const urlFor = (lang, page = "") => `${origin}${base}${lang}/${page ? `${page}/` : ""}`;
const wrappers = walkFiles(resolve(root, "src/pages"))
  .map(file => relative(resolve(root, "src/pages"), file).split(sep).join("/"))
  .filter(file => file.endsWith("/index.astro"));
const expected = wrappers.map(file => ({ lang: file.split("/")[0], page: file.split("/").slice(1, -1).join("/") }));
const languages = [...new Set(expected.map(page => page.lang))];
const available = (lang, page) => expected.some(entry => entry.lang === lang && entry.page === page);
assert(languages.length > 0, "No language routes found");
assert(expected.every(entry => !entry.page.split("/").includes("cv")), "CV route must remain removed");
for (const lang of languages) assert(available(lang, ""), `Missing homepage: ${lang}`);
const json = name => JSON.parse(readFileSync(resolve(root, `src/data/${name}.json`), "utf8"));
const schedule = json("schedule");
const eventDates = [...schedule.upcoming, ...schedule.past].map(event => event.date).sort();
const eventTimes = [...schedule.upcoming, ...schedule.past].map(event => event.time).filter(Boolean).sort();
const repertoireCount = json("repertoire").columns.flatMap(column => column.sections.flatMap(section => section.items)).length;
const videos = json("videos").videos;
const press = json("press");
const rootDocument = parse(readFileSync(resolve(dist, "index.html"), "utf8"));
const redirect = nodes(rootDocument).find(node => node.tagName === "meta" && attrs(node)["http-equiv"]?.toLowerCase() === "refresh");
assert(redirect, "Root must retain its language redirect");
const destination = attrs(redirect).content.match(/url\s*=\s*(.+)$/i)?.[1];
assert(destination?.startsWith(base), "Root redirect has the wrong deployment base");
const defaultLang = destination.slice(base.length).split("/")[0];
assert(languages.includes(defaultLang), "Root redirect targets an unsupported language");

const pageDocuments = new Map();
const checkedTargets = new Set();
const titles = new Set();
let optionOrder;
for (const { lang, page } of expected) {
  const file = resolve(dist, lang, page, "index.html");
  assert(existsSync(file), `Missing output: ${lang}/${page}`);
  const document = parse(readFileSync(file, "utf8"));
  const all = nodes(document);
  const canonical = urlFor(lang, page);
  const head = all.find(node => node.tagName === "head");
  const headNodes = nodes(head);
  const headLink = rel => headNodes.filter(node => node.tagName === "link" && attrs(node).rel === rel);
  const meta = (key, value) => headNodes.find(node => node.tagName === "meta" && attrs(node)[key] === value);
  assert.equal(attrs(all.find(node => node.tagName === "html")).lang, lang, `Wrong document language: ${canonical}`);
  const title = normalizedText(headNodes.find(node => node.tagName === "title"));
  assert(title && !titles.has(title), `Empty/duplicate page title: ${canonical}`);
  titles.add(title);
  const description = attrs(meta("name", "description")).content;
  assert(description?.trim(), `Missing description: ${canonical}`);
  assert.deepEqual(headLink("canonical").map(node => attrs(node).href), [canonical]);
  const alternates = new Map(headLink("alternate").map(node => [attrs(node).hreflang, attrs(node).href]));
  const translatedLanguages = languages.filter(code => available(code, page));
  assert.equal(headLink("alternate").length, translatedLanguages.length + 1, `Wrong hreflang count: ${canonical}`);
  for (const code of translatedLanguages) assert.equal(alternates.get(code), urlFor(code, page));
  assert.equal(alternates.get("x-default"), urlFor(defaultLang, available(defaultLang, page) ? page : ""));
  assert.equal(attrs(meta("property", "og:url")).content, canonical);
  assert.equal(attrs(meta("property", "og:title")).content, title);
  assert.equal(attrs(meta("property", "og:description")).content, description);
  assert(attrs(meta("property", "og:locale")).content, "Missing Open Graph locale");
  assert(attrs(meta("property", "og:image")).content.startsWith(`${origin}${base}`), "Wrong social image base");

  const choices = withClass(document, "lang-link");
  const order = choices.map(node => attrs(node).hreflang);
  assert.deepEqual([...order].sort(), [...languages].sort(), `Missing language choice: ${canonical}`);
  optionOrder ??= order;
  assert.deepEqual(order, optionOrder, "Inconsistent language ordering");
  assert.equal(choices.filter(node => attrs(node)["aria-current"] === "true").length, 1);
  for (const node of choices) {
    const a = attrs(node); const code = a.hreflang;
    assert.equal(a.lang, code);
    assert(a["aria-label"]?.trim() && normalizedText(node), "Missing accessible language name");
    assert.equal(a.href, new URL(urlFor(code, available(code, page) ? page : "")).pathname);
    assert.equal(a["aria-current"] === "true", code === lang);
  }
  for (const node of all) {
    const a = attrs(node);
    for (const attribute of ["href", "src", "poster"]) {
      const ref = a[attribute]; if (!ref || ref.startsWith("#")) continue;
      const url = new URL(ref, canonical);
      if (url.origin !== origin || !["http:", "https:"].includes(url.protocol)) continue;
      assert(url.pathname.startsWith(base), `Wrong base: ${ref} on ${canonical}`);
      assert(!url.pathname.split("/").includes("cv"), `CV link: ${ref}`);
      const local = decodeURIComponent(url.pathname.slice(base.length));
      const target = resolve(dist, local, ...(url.pathname.endsWith("/") ? ["index.html"] : []));
      assert(existsSync(target), `Broken local target: ${ref} on ${canonical}`);
      checkedTargets.add(url.pathname);
    }
  }
  if (page === "schedule") {
    assert.deepEqual(withClass(document, "schedule-date").map(node => attrs(node).datetime).sort(), eventDates);
    assert.deepEqual(withClass(document, "schedule-time").map(node => attrs(node).datetime).sort(), eventTimes);
  }
  if (page === "repertoire") assert.equal(withClass(document, "rep-entry").length, repertoireCount);
  if (page === "media/video") {
    const choices = withClass(document, "video-choice"); assert.equal(choices.length, videos.length);
    assert.deepEqual(withClass(document, "video-choice-title").map(normalizedText), videos.map(video => video.title.replace(/\s+/g, " ").trim()));
    assert(withClass(document, "video-choice-description").every(node => normalizedText(node).length > 0));
  }
  if (page === "press") {
    assert.deepEqual(withClass(document, "article-link").map(node => attrs(node).href), press.map(article => article.url));
    assert.deepEqual(withClass(document, "article-thumbnail").flatMap(node => nodes(node).filter(child => child.tagName === "img").map(child => attrs(child).src)), press.map(article => `${base}${article.image.replace(/^\/+/, "")}`));
    for (const article of press) assert(normalizedText(all.find(node => node.tagName === "main")).includes(article.originalTitle), `Original headline missing: ${article.id}`);
  }
  pageDocuments.set(canonical, { alternates });
}
for (const [url, { alternates }] of pageDocuments) {
  for (const [code, target] of alternates) {
    if (code === "x-default") continue;
    const sourceLang = url.slice(`${origin}${base}`.length).split("/")[0];
    assert.equal(pageDocuments.get(target)?.alternates.get(sourceLang), url, `Nonreciprocal hreflang: ${url}`);
  }
}
const sitemap = readFileSync(resolve(dist, "sitemap.xml"), "utf8");
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)];
assert.equal(sitemapEntries.length, expected.length, "Sitemap route count differs");
assert.deepEqual(sitemapEntries.map(entry => entry[1].match(/<loc>(.*?)<\/loc>/)?.[1]).sort(), [...pageDocuments.keys()].sort());
for (const [, xml] of sitemapEntries) {
  const url = xml.match(/<loc>(.*?)<\/loc>/)?.[1];
  const links = new Map([...xml.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map(match => [match[1], match[2]]));
  assert.deepEqual(links, pageDocuments.get(url).alternates, `Sitemap alternates differ: ${url}`);
}
console.log(`Verified ${expected.length} localized pages in ${languages.length} languages, ${checkedTargets.size} local targets, reciprocal SEO, sitemap and shared content.`);
