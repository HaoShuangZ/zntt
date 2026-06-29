const fs = require('fs');
const path = require('path');

const proto = path.join(__dirname, '..');
const dirs = [
  path.join(proto, 'pages', 'iPad\u7aef', '\u68c0\u6d4b'),
  path.join(proto, 'pages', 'iPad\u7aef', '\u7cfb\u7edf', '\u540c\u6b65'),
];

function patchFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  const o = c;
  c = c.replace(
    /id="ipadGlobalTabBar" class="ipad-global-tabbar" data-app-flow-footer/g,
    'class="ipad-flow-footer" data-app-flow-footer'
  );
  c = c.replace(
    /id="ipadGlobalTabBar" class="ipad-global-tabbar"/g,
    'class="ipad-flow-footer" data-app-flow-footer'
  );
  if (c !== o) {
    fs.writeFileSync(file, c, 'utf8');
    console.log('fixed', path.relative(proto, file));
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) patchFile(full);
  }
}

dirs.forEach(walk);
console.log('done');
