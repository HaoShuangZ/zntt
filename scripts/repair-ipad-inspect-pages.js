/**
 * 从 APP 检测子页强制重新生成 iPad 检测页（修复 class 被误替换问题）
 */
const fs = require('fs');
const path = require('path');

const proto = path.join(__dirname, '..');
const appRoot = path.join(proto, 'pages', 'APP\u7aef', '\u68c0\u6d4b');
const ipadRoot = path.join(proto, 'pages', 'iPad\u7aef', '\u68c0\u6d4b');

function assetPrefixFromContent(content) {
  const m = content.match(/href="((?:\.\.\/)+)assets\/app-(?:frame|inspect-layout)\.css"/);
  if (m) return m[1] + 'assets/';
  return '../../../assets/';
}

function injectIpad(content, prefix) {
  content = content.replace(
    /\s*<link rel="stylesheet" href="[^"]*ipad-tokens\.css">[\s\S]*?<script src="[^"]*ipad-adapt\.js" defer><\/script>\s*/g,
    '\n'
  );
  const block = [
    `<link rel="stylesheet" href="${prefix}ipad-tokens.css">`,
    `<link rel="stylesheet" href="${prefix}ipad-frame.css">`,
    `<link rel="stylesheet" href="${prefix}ipad-layout.css">`,
    `<link rel="stylesheet" href="${prefix}ipad-visual.css">`,
    `<link rel="stylesheet" href="${prefix}ipad-inspect-layout.css">`,
    `<link rel="stylesheet" href="${prefix}ipad-embed.css">`,
    `<script src="${prefix}ipad-adapt.js" defer></script>`,
  ].join('\n');
  return content.replace(
    /(<link rel="stylesheet" href="[^"]*app-inspect-layout\.css">)/,
    `$1\n${block}`
  );
}

function transform(content) {
  content = content.replace(/pages\/APP\u7aef/g, 'pages/iPad\u7aef');
  content = content.replace(/app-index\.html/g, 'ipad-index.html');
  content = content.replace(/app_([a-z0-9_]+\.html)/gi, 'ipad_$1');
  content = content.replace(/'app_task_inspect_home'/g, "'ipad_task_inspect_home'");
  content = content.replace(/"app_task_inspect_home"/g, '"ipad_task_inspect_home"');

  content = content.replace(
    /<body(\s+class=")([^"]*)(")/i,
    (m, pre, cls, suf) => {
      if (cls.includes('ipad-adapt')) return m;
      return `<body${pre}${cls.trim()} ipad-adapt${suf}`;
    }
  );
  content = content.replace(/<body(?![^>]*\bclass=)(\s[^>]*)>/i, '<body class="ipad-adapt"$1>');

  content = content.replace(
    /(<div)([^>]*data-app-flow-footer[^>]*)(style="[^"]*position:fixed[^"]*bottom:0[^"]*")/i,
    '$1 class="ipad-flow-footer"$2$3'
  );

  return content;
}

function walk(dir, fn) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, fn);
    else if (name.startsWith('app_') && name.endsWith('.html')) fn(full);
  }
}

let n = 0;
walk(appRoot, (appFile) => {
  const rel = path.relative(appRoot, appFile);
  const ipadName = path.basename(rel).replace(/^app_/, 'ipad_');
  const ipadFile = path.join(ipadRoot, path.dirname(rel), ipadName);
  fs.mkdirSync(path.dirname(ipadFile), { recursive: true });
  let c = fs.readFileSync(appFile, 'utf8');
  c = transform(c);
  c = injectIpad(c, assetPrefixFromContent(c));
  const slug = ipadName.replace('.html', '').replace(/^ipad_/, '').toUpperCase();
  c = c.replace(/<!-- iPad-[\s\S]*?-->\n?/i, '');
  c = c.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n<!-- iPad-${slug} v2.0 landscape -->`);
  fs.writeFileSync(ipadFile, c, 'utf8');
  console.log('repaired:', path.join(path.dirname(rel), ipadName));
  n++;
});

// 删除误生成的 app_*.html 副本
function cleanWrong(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) cleanWrong(full);
    else if (name.startsWith('app_') && name.endsWith('.html')) {
      fs.unlinkSync(full);
      console.log('removed stray:', full);
    }
  }
}
cleanWrong(ipadRoot);

console.log('done', n, 'inspect pages');
