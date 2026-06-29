import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PC_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../pages/PC端');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const RE =
  /(<div class="toolbar[^"]*">\s*<div class="toolbar-left"[^>]*>[\s\S]*?<\/div>)\s*<\/div>(\s*\n\s*(?:<div class="pc-table-actions"|<p |<div style="overflow))/g;

let n = 0;
for (const file of walk(PC_ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const next = html.replace(RE, '$1\n      </div>$2');
  if (next !== html) {
    fs.writeFileSync(file, next, 'utf8');
    n++;
    console.log(path.relative(PC_ROOT, file));
  }
}
console.log(`toolbar fix: ${n}`);
