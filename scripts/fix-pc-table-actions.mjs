/**
 * Fix toolbar markup + move page-header list actions to pc-table-actions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PC_ROOT = path.join(__dirname, '../pages/PC端');

const LIST_ACTION_RE =
  /新增|导入|导出|批量|派单|登记|上传|下载|同步|新建|添加|创建|列表|对下合同|新增对/;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function parsePageHeaderBlock(html, startIdx) {
  const marker = '<div class="page-header">';
  const afterOpen = startIdx + marker.length;
  let depth = 1;
  let pos = afterOpen;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      pos = nextClose + 6;
    }
  }
  return { start: startIdx, end: pos, inner: html.slice(afterOpen, pos - 6) };
}

function extractPageHeaderActions(html) {
  const chunks = [];
  let out = html;
  let search = 0;
  const replacements = [];
  while (search < out.length) {
    const idx = out.indexOf('<div class="page-header">', search);
    if (idx === -1) break;
    const block = parsePageHeaderBlock(out, idx);
    if (!block) break;
    const titleRe =
      /^\s*((?:<div[^>]*class="page-title"[^>]*>|<h1[^>]*class="page-title"[^>]*>)[\s\S]*?<\/(?:div|h1)>)/;
    const tm = block.inner.match(titleRe);
    if (tm) {
      const rest = block.inner.slice(tm[0].length).trim();
      if (rest && LIST_ACTION_RE.test(rest) && !/保存|提交审核/.test(rest)) {
        chunks.push(rest);
        replacements.push({
          start: block.start,
          end: block.end,
          replacement: `<div class="page-header">\n    ${tm[1].trim()}\n  </div>`,
        });
      }
    }
    search = block.end;
  }
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
  }
  return { html: out, chunks };
}

function fixToolbarClose(html) {
  return html.replace(
    /(<div class="toolbar[^"]*">\s*<div class="toolbar-left"[^>]*>[\s\S]*?<\/div>)\s*<\/div>\s*(?=\n\s*(?:<p |<div class="pc-table-actions"|<div style="overflow|<table))/g,
    '$1\n      </div>\n'
  );
}

function insertActions(html, newChunks) {
  if (!newChunks.length) return html;
  const inner = newChunks.join('\n        ');
  const barRe = /<div class="pc-table-actions">([\s\S]*?)<\/div>/;
  if (barRe.test(html)) {
    return html.replace(barRe, (m, existing) => {
      const merged = `${existing.trim()}\n        ${inner}`.trim();
      return `<div class="pc-table-actions">\n        ${merged}\n      </div>`;
    });
  }
  const bar = `\n      <div class="pc-table-actions">\n        ${inner}\n      </div>\n\n      `;
  const markers = [
    /<div class="ol-table-scroll">/,
    /<div style="overflow-x:auto">/,
    /<table class="data-table"/,
    /<table class="w-full/,
    /<table /,
  ];
  for (const re of markers) {
    if (re.test(html)) return html.replace(re, (m) => bar + m);
  }
  return html;
}

let changed = 0;
for (const file of walk(PC_ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('pc-layout.css')) continue;
  const orig = html;
  html = fixToolbarClose(html);
  const ph = extractPageHeaderActions(html);
  html = ph.html;
  if (ph.chunks.length) html = insertActions(html, ph.chunks);
  html = html.replace(
    /\s*\.pc-table-actions\s*\{[^}]*\}\s*/g,
    (m, offset, s) => (s.includes('pc-layout.css') ? m : '\n')
  );
  if (html !== orig) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
    console.log(path.relative(PC_ROOT, file));
  }
}
console.log(`Fixed ${changed} files.`);
