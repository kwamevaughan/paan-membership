// scripts/generate-sitemap-static.js
const fs = require("fs");
const path = require("path");

const staticUrls = [
  { loc: "https://membership.paan.africa/", priority: "1.0" },
  { loc: "https://membership.paan.africa/interview", priority: "0.7" },
  { loc: "https://membership.paan.africa/jobs", priority: "0.7" },
];

const lastmod = new Date().toISOString();

const sitemapStatic = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

const outputPath = path.join(__dirname, "../public/sitemap-static.xml");
fs.writeFileSync(outputPath, sitemapStatic, "utf8");

console.log("Static sitemap generated at public/sitemap-static.xml");