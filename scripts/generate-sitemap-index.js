// scripts/generate-sitemap-index.js
const fs = require("fs");
const path = require("path");

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://membership.paan.africa/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://membership.paan.africa/api/sitemap-jobs.xml</loc>
  </sitemap>
</sitemapindex>`;

const outputPath = path.join(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outputPath, sitemapIndex, "utf8");

console.log("Sitemap index generated at public/sitemap.xml");