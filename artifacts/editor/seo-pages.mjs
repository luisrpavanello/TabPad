import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(import.meta.dirname, "dist/public");
const siteUrl = "https://tabpad.online";

const localeAlternates = [
  { hreflang: "en", href: "https://tabpad.online/" },
  { hreflang: "pt", href: "https://tabpad.online/pt/" },
  { hreflang: "es", href: "https://tabpad.online/es/" },
  { hreflang: "x-default", href: "https://tabpad.online/" },
];

const pages = [
  {
    path: "/",
    lang: "en",
    ogLocale: "en_US",
    title: "TabPad - Online Notepad, Text Editor and Notes App",
    description:
      "TabPad is a fast online notepad and text editor with tabs, autosave, Markdown preview and text tools. Write notes, edit text and format JSON for free.",
    keywords:
      "notepad online, online notepad, notepad, notes, notes app, text editor, online text editor, free notepad, markdown editor, word counter, json formatter",
    priority: "1.0",
  },
  {
    path: "/notepad-online/",
    lang: "en",
    ogLocale: "en_US",
    title: "Notepad Online - Free Browser Notes and Text Editor | TabPad",
    description:
      "Open a free notepad online with tabs, autosave, word count, Markdown preview and JSON formatting. TabPad is fast, private and browser-based.",
    keywords:
      "notepad online, online notepad, free online notepad, browser notepad, notes online, text editor online, quick notes",
    priority: "0.9",
  },
  {
    path: "/online-notepad/",
    lang: "en",
    ogLocale: "en_US",
    title: "Online Notepad - Fast Notes, Tabs and Text Tools | TabPad",
    description:
      "Use TabPad as an online notepad for quick notes, drafts, text cleanup and Markdown preview. No install required.",
    keywords:
      "online notepad, notepad, notes, online notes, free notes app, text tools, markdown notes",
    priority: "0.9",
  },
  {
    path: "/text-editor-online/",
    lang: "en",
    ogLocale: "en_US",
    title: "Text Editor Online - Write, Clean and Format Text | TabPad",
    description:
      "A clean text editor online for notes, plain text, Markdown and JSON formatting. Use tabs, autosave and text tools in your browser.",
    keywords:
      "text editor online, online text editor, edit text online, plain text editor, markdown editor, json formatter",
    priority: "0.85",
  },
  {
    path: "/pt/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "TabPad - Bloco de Notas Online, Notas e Editor de Texto",
    description:
      "TabPad e um bloco de notas online rapido com abas, salvamento automatico, preview Markdown e ferramentas de texto. Escreva notas e edite textos gratis.",
    keywords:
      "bloco de notas online, bloco de notas, notas online, notas, caderno online, caderno, texto, editor de texto online, contador de palavras, formatar json",
    priority: "0.95",
  },
  {
    path: "/pt/bloco-de-notas-online/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "Bloco de Notas Online Gratis - Notas e Texto | TabPad",
    description:
      "Use um bloco de notas online gratis para escrever notas, editar texto, contar palavras, salvar automaticamente e formatar JSON no navegador.",
    keywords:
      "bloco de notas online, bloco de notas gratis, notas online, caderno online, texto online, editor de texto, formatar json",
    priority: "0.9",
  },
  {
    path: "/pt/notas-online/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "Notas Online - Caderno e Editor de Texto Gratis | TabPad",
    description:
      "Escreva notas online com abas, autosave, preview Markdown e ferramentas para limpar, ordenar e formatar textos.",
    keywords:
      "notas online, notas, caderno online, caderno, texto, editor de texto online, bloco de notas",
    priority: "0.85",
  },
  {
    path: "/pt/caderno-online/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "Caderno Online - Escreva Notas e Textos | TabPad",
    description:
      "Um caderno online simples para escrever notas, rascunhos e textos com salvamento automatico e ferramentas rapidas.",
    keywords:
      "caderno online, caderno, notas, notas online, texto, bloco de notas online, editor de texto",
    priority: "0.8",
  },
  {
    path: "/es/",
    lang: "es",
    ogLocale: "es_ES",
    title: "TabPad - Bloc de Notas Online, Notas y Editor de Texto",
    description:
      "TabPad es un bloc de notas online rapido con pestanas, autoguardado, vista Markdown y herramientas de texto. Escribe notas y edita texto gratis.",
    keywords:
      "bloc de notas online, bloc de notas, notas online, notas, cuaderno online, cuaderno, texto, editor de texto online, contador de palabras, formatear json",
    priority: "0.95",
  },
  {
    path: "/es/bloc-de-notas-online/",
    lang: "es",
    ogLocale: "es_ES",
    title: "Bloc de Notas Online Gratis - Notas y Texto | TabPad",
    description:
      "Usa un bloc de notas online gratis para escribir notas, editar texto, contar palabras, guardar automaticamente y formatear JSON.",
    keywords:
      "bloc de notas online, bloc de notas gratis, notas online, cuaderno online, texto online, editor de texto, formatear json",
    priority: "0.9",
  },
  {
    path: "/es/notas-online/",
    lang: "es",
    ogLocale: "es_ES",
    title: "Notas Online - Cuaderno y Editor de Texto Gratis | TabPad",
    description:
      "Escribe notas online con pestanas, autoguardado, vista Markdown y herramientas para limpiar, ordenar y formatear texto.",
    keywords:
      "notas online, notas, cuaderno online, cuaderno, texto, bloc de notas online, editor de texto",
    priority: "0.85",
  },
  {
    path: "/es/cuaderno-online/",
    lang: "es",
    ogLocale: "es_ES",
    title: "Cuaderno Online - Escribe Notas y Textos | TabPad",
    description:
      "Un cuaderno online simple para escribir notas, borradores y textos con autoguardado y herramientas rapidas.",
    keywords:
      "cuaderno online, cuaderno, notas, notas online, texto, bloc de notas online, editor de texto",
    priority: "0.8",
  },
];

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function absoluteUrl(page) {
  return `${siteUrl}${page.path === "/" ? "/" : page.path}`;
}

function replaceOrInsertMeta(html, selector, tag) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${escapedSelector}[^>]*>`, "i");

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function alternatesHtml() {
  return localeAlternates
    .map(
      (alternate) =>
        `<link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`,
    )
    .join("\n    ");
}

function structuredData(page) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TabPad",
    url: absoluteUrl(page),
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any",
    inLanguage: page.lang,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: page.description,
    featureList: [
      "Online notepad",
      "Tabbed text editor",
      "Autosave",
      "Markdown preview",
      "Text tools",
      "JSON formatter",
      "Word counter",
    ],
  };
}

function sitemapXml() {
  const urlEntries = pages
    .map(
      (page) => `  <url>
    <loc>${absoluteUrl(page)}</loc>
    <lastmod>2026-06-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
    ${localeAlternates
      .map(
        (alternate) =>
          `<xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`,
      )
      .join("\n    ")}
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries}
</urlset>
`;
}

function localizedHtml(baseHtml, page) {
  const canonical = absoluteUrl(page);
  let html = baseHtml
    .replace(/<html lang="[^"]*">/i, `<html lang="${page.lang}">`)
    .replace(/<title>.*?<\/title>/i, `<title>${page.title}</title>`);

  html = replaceOrInsertMeta(
    html,
    'name="description"',
    `<meta name="description" content="${escapeAttribute(page.description)}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'name="keywords"',
    `<meta name="keywords" content="${escapeAttribute(page.keywords)}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'name="robots"',
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />',
  );
  html = replaceOrInsertMeta(
    html,
    'name="googlebot"',
    '<meta name="googlebot" content="index, follow" />',
  );
  html = replaceOrInsertMeta(
    html,
    'property="og:site_name"',
    '<meta property="og:site_name" content="TabPad" />',
  );
  html = replaceOrInsertMeta(
    html,
    'property="og:title"',
    `<meta property="og:title" content="${escapeAttribute(page.title)}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'property="og:description"',
    `<meta property="og:description" content="${escapeAttribute(page.description)}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'property="og:url"',
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'property="og:locale"',
    `<meta property="og:locale" content="${page.ogLocale}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'name="twitter:title"',
    `<meta name="twitter:title" content="${escapeAttribute(page.title)}" />`,
  );
  html = replaceOrInsertMeta(
    html,
    'name="twitter:description"',
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}" />`,
  );

  html = html
    .replace(/<link rel="canonical"[^>]*>\n?/i, "")
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>\n?/gi, "")
    .replace(/<script type="application\/ld\+json">.*?<\/script>\n?/gis, "");

  return html.replace(
    "</head>",
    `    <link rel="canonical" href="${canonical}" />\n    ${alternatesHtml()}\n    <script type="application/ld+json">${JSON.stringify(structuredData(page))}</script>\n  </head>`,
  );
}

async function writePage(page, html) {
  const outputDir =
    page.path === "/" ? distDir : path.join(distDir, page.path.slice(1));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html);
}

const baseHtml = await readFile(path.join(distDir, "index.html"), "utf8");

for (const page of pages) {
  await writePage(page, localizedHtml(baseHtml, page));
}

await writeFile(
  path.join(distDir, "404.html"),
  localizedHtml(baseHtml, pages[0]),
);
await writeFile(path.join(distDir, "sitemap.xml"), sitemapXml());
