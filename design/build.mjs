#!/usr/bin/env node
// 產生各設計概念的靜態 HTML：node build.mjs
// 內容只來自 data/content.json；每個 concepts/<dir>/template.mjs 匯出 default render(ctx) → HTML 字串。
// 輸出為純文字 HTML（不靠 JS 渲染內容），Google 與螢幕閱讀器都讀得到。
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { seoHead, jsonLd, esc } from './shared/seo.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const content = JSON.parse(readFileSync(join(root, 'data/content.json'), 'utf8'));
const only = process.argv[2];
const dirs = readdirSync(join(root, 'concepts'), { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(root, 'concepts', d.name, 'template.mjs')))
  .map(d => d.name).filter(n => !only || n.includes(only)).sort();

// 首頁：選定的概念另外輸出一份到 repo 根目錄 index.html（路徑改指向 design/）
const HOME = '03-island-map';

async function render(name, base) {
  const mod = await import(pathToFileURL(join(root, 'concepts', name, 'template.mjs')).href + '?t=' + Date.now());
  const ctx = {
    c: content,
    concept: name,
    esc,
    base,
    img: f => base + 'assets/img/' + f,
    head: (opts = {}) => seoHead(content, { concept: name, base, ...opts }),
    jsonLd: () => jsonLd(content),
    inquiryScript: `<script src="${base}shared/inquiry.js" defer></script>`,
    sdg: n => ({ n, ...content.sdgs[String(n)] }),
  };
  return mod.default(ctx);
}

for (const name of dirs) {
  const html = await render(name, '../../');
  writeFileSync(join(root, 'concepts', name, 'index.html'), html);
  console.log('built concepts/' + name + '/index.html', (html.length / 1024).toFixed(1) + 'KB');
  if (name === HOME) {
    const dir = `design/concepts/${name}/`;
    const home = (await render(name, 'design/'))
      .replace(/href="style\.css"/g, `href="${dir}style.css"`)
      .replace(/src="script\.js"/g, `src="${dir}script.js"`);
    writeFileSync(join(root, '..', 'index.html'), home);
    console.log('built ../index.html (home ← ' + name + ')');
  }
}
