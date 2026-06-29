const fs = require('fs');
const path = require('path');

const ipadRoot = path.join(__dirname, '..', 'pages', 'iPad\u7aef');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.startsWith('ipad_') && name.endsWith('.html')) patch(full);
  }
}

function patch(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('ipad-tokens.css')) return;

  const m = c.match(/href="((?:\.\.\/)+)assets\/ipad-frame\.css"/);
  if (!m) {
    console.warn('skip (no ipad block):', file);
    return;
  }
  const pre = m[1];
  const esc = pre.replace(/\./g, '\\.');
  const re = new RegExp(
    '<link rel="stylesheet" href="' +
      esc +
      'assets/ipad-frame\\.css">\\s*' +
      '<link rel="stylesheet" href="' +
      esc +
      'assets/ipad-layout\\.css">\\s*' +
      '<link rel="stylesheet" href="' +
      esc +
      'assets/ipad-embed\\.css">\\s*' +
      '<script src="' +
      esc +
      'assets/ipad-adapt\\.js" defer></script>',
    'g'
  );
  const rep =
    `<link rel="stylesheet" href="${pre}assets/ipad-tokens.css">\n` +
    `<link rel="stylesheet" href="${pre}assets/ipad-frame.css">\n` +
    `<link rel="stylesheet" href="${pre}assets/ipad-layout.css">\n` +
    `<link rel="stylesheet" href="${pre}assets/ipad-visual.css">\n` +
    `<link rel="stylesheet" href="${pre}assets/ipad-embed.css">\n` +
    `<script src="${pre}assets/ipad-adapt.js" defer></script>`;

  if (!re.test(c)) {
    console.warn('skip (pattern):', file);
    return;
  }
  c = c.replace(re, rep);
  c = c.replace(/v1\.0 landscape/g, 'v2.0 landscape');
  fs.writeFileSync(file, c, 'utf8');
  console.log('patched:', path.basename(file));
}

walk(ipadRoot);
console.log('done');
