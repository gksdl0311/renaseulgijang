import type { APIRoute } from "astro";
import { languages } from "../i18n";
import { alternateLanguages, availablePages, defaultPath, localizedPath } from "../i18n/routes";

export const prerender = true;
const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
})[char]!);

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("Set the production site origin before generating the sitemap.");
  const absolute = (path: string) => escapeXml(new URL(path, site).href);
  const entries = languages.flatMap(lang => availablePages(lang).map(page => {
    const alternates = alternateLanguages(page).map(code =>
      `<xhtml:link rel="alternate" hreflang="${code}" href="${absolute(localizedPath(code, page))}"/>`,
    ).join("");
    return `<url><loc>${absolute(localizedPath(lang, page))}</loc>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(defaultPath(page))}"/></url>`;
  })).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
