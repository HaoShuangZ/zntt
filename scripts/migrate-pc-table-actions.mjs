/**
 * Move list action buttons from toolbar-right / page-header to .pc-table-actions above table.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PC_ROOT = path.join(__dirname, '../pages/PC端');

const LIST_ACTION_RE =
  /新增|导入|导出|批量|派单|登记|上传|下载|同步|新建|添加|创建|启用|停用|刷新列表|前往|对下合同列表|新增对/;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function extractToolbarRight(html) {
  const re = /<div class="toolbar-right"([^>]*)>([\s\S]*?)<\/div>/g;
  const chunks = [];
  let m;
  let out = html;
  while ((m = re.exec(html)) !== null) chunks.push(m[2].trim());
  if (chunks.length) {
    out = html.replace(/<div class="toolbar-right"[^>]*>[\s\S]*?<\/div>\s*/g, '');
  }
  return { html: out, chunks };
}

function extractPageHeaderActions(html) {
  const re = /<div class="page-header">([\s\S]*?)<\/div>/g;
  const chunks = [];
  let out = html;
  let m;
  const replacements = [];
  while ((m = re.exec(html)) !== null) {
    const inner = m[1];
    const titleRe =
      /^\s*((?:<div[^>]*class="page-title"[^>]*>|<h1[^>]*class="page-title"[^>]*>)[\s\S]*?<\/(?:div|h1)>)/;
    const tm = inner.match(titleRe);
    if (!tm) continue;
    const title = tm[1];
    const rest = inner.slice(tm[0].length).trim();
    if (!rest) continue;
    if (!LIST_ACTION_RE.test(rest)) continue;
    if (/保存|提交审核|取消编辑/.test(rest) && !LIST_ACTION_RE.test(rest)) continue;
    chunks.push(rest);
    replacements.push({
      full: m[0],
      replacement: `<div class="page-header">\n    ${title.trim()}\n  </div>`,
    });
  }
  for (const r of replacements) out = out.replace(r.full, r.replacement);
  return { html: out, chunks };
}

function mergeIntoExistingBar(html, newChunks) {
  if (!newChunks.length) return html;
  const inner = newChunks.join('\n        ');
  const barRe = /<div class="(?:pc-table-actions|ol-table-actions)">([\s\S]*?)<\/div>/;
  const m = html.match(barRe);
  if (m) {
    const merged = `${m[1].trim()}\n        ${inner}`.trim();
    return html.replace(
      barRe,
      `<div class="pc-table-actions">\n        ${merged}\n      </div>`
    );
  }
  const bar = `\n      <div class="pc-table-actions">\n        ${inner}\n      </div>\n\n      `;
  const markers = [
    /<div class="ol-table-scroll">/,
    /<div style="overflow-x:auto">\s*\n\s*<table/,
    /<table class="data-table"/,
    /<table class="w-full/,
    /<table /,
  ];
  for (const re of markers) {
    if (re.test(html)) return html.replace(re, (match) => bar + match);
  }
  return html;
}

function transform(html) {
  let actions = [];
  let h = html.replace(/ol-table-actions/g, 'pc-table-actions');

  const ph = extractPageHeaderActions(h);
  h = ph.html;
  actions.push(...ph.chunks);

  const tr = extractToolbarRight(h);
  h = tr.html;
  actions.push(...tr.chunks);

  if (actions.length) h = mergeIntoExistingBar(h, actions);

  /* Remove page-local duplicate .ol-table-actions rules */
  h = h.replace(
    /\s*\.ol-table-actions\s*\{[^}]*\}\s*/g,
    '\n'
  );

  /* task-list toolbar-right custom style */
  h = h.replace(
    /\s*\.toolbar\.task-list-toolbar \.toolbar-right\s*\{[^}]*\}\s*/g,
    '\n'
  );

  return h;
}

let changed = 0;
for (const file of walk(PC_ROOT)) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.includes('pc-layout.css')) continue;
  const next = transform(raw);
  if (next !== raw) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
    console.log(path.relative(PC_ROOT, file));
  }
}
console.log(`Done. ${changed} files updated.`);
