/**
 * 检测详情页 → 基础信息 UI（basic-card / basic-field / 共享样式表）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../pages/iPad端/检测');
const SKIP = new Set([
  'ipad_inspect_shell.html',
  'ipad_inspect_index.html',
  'ipad_inspect_upload.html',
  'ipad_detect_entry.html',
  'ipad_inspect_validate.html',
  'ipad_inspect_note.html',
]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/ipad_inspect_.*\.html$/i.test(name) && !SKIP.has(name)) out.push(p);
  }
  return out;
}

function depthToAssets(file) {
  const rel = path.relative(ROOT, file);
  const depth = rel.split(path.sep).length;
  return '../'.repeat(depth + 1) + 'assets/ipad-inspect-basic.css';
}

function ensureBasicCssLink(html, file) {
  if (html.includes('ipad-inspect-basic.css')) return html;
  const href = depthToAssets(file);
  const re = /(<link[^>]+ipad-inspect-layout\.css[^>]*>)/i;
  if (!re.test(html)) return html;
  return html.replace(re, '$1\n<link rel="stylesheet" href="' + href + '">');
}

function stripInlineFormStyles(html) {
  return html
    .replace(
      /<style>\s*body\s*\{[^}]*\}\s*\.form-label\s*\{[^}]*\}\s*\.form-input\s*\{[^}]*\}\s*<\/style>\s*/gi,
      ''
    )
    .replace(
      /<style>\s*body\s*\{[^}]*\}\s*\.check-card\s*\{[^}]*\}[\s\S]*?\.toggle-btn\.active-fail\s*\{[^}]*\}\s*<\/style>\s*/gi,
      ''
    );
}

function iconForLabel(label) {
  if (/仪器|方法/.test(label)) return 'fa-sliders';
  if (/合格|结果/.test(label)) return 'fa-circle-check';
  if (/门/.test(label)) return 'fa-door-open';
  if (/孔|数量|直径|宽度|偏移|高|深|mm|m|率/.test(label)) return 'fa-ruler';
  return 'fa-pen-to-square';
}

function migrate(html) {
  let out = html;

  out = out.replace(
    /<motion style="background:#fff;\s*border-radius:12px;\s*padding:16px;\s*margin-bottom:12px;\s*box-shadow:0 1px 4px rgba\(0,0,0,0\.06\);">/gi,
    '<div class="basic-card">'
  );
  out = out.replace(
    /<div style="background:#fff;\s*border-radius:12px;\s*padding:16px;\s*margin-bottom:12px;\s*box-shadow:0 1px 4px rgba\(0,0,0,0\.06\);">/gi,
    '<motion class="basic-card">'
  );
  out = out.replace(/<motion class="basic-card">/g, '<div class="basic-card">');

  out = out.replace(
    /<div style="font-size:15px;\s*font-weight:600;\s*color:#1D2129;\s*margin-bottom:14px;">([^<]+)<\/motion>/gi,
    '<h3 class="basic-card-title">$1</h3>'
  );
  out = out.replace(
    /<div style="font-size:15px;\s*font-weight:600;\s*color:#1D2129;\s*margin-bottom:14px;">([^<]+)<\/div>/gi,
    '<h3 class="basic-card-title">$1</h3>'
  );

  out = out.replace(
    /<div style="background:#E8F3FF;\s*border-radius:8px;\s*padding:10px 14px;\s*margin-bottom:12px;\s*display:flex;\s*align-items:center;\s*gap:8px;">\s*<i class="fa-solid fa-circle-info" style="color:#165DFF;"><\/i>\s*<span style="font-size:13px;\s*color:#165DFF;">([^<]+)<\/span>\s*<\/motion>/gi,
    '<div class="inspect-banner"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>$1</span></div>'
  );
  out = out.replace(
    /<div style="background:#E8F3FF;\s*border-radius:8px;\s*padding:10px 14px;\s*margin-bottom:12px;\s*display:flex;\s*align-items:center;\s*gap:8px;">[\s\S]*?<\/div>/gi,
    (block) => {
      const m = block.match(/<span[^>]*>([^<]+)<\/span>/);
      if (!m) return block;
      return (
        '<div class="inspect-banner"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>' +
        m[1] +
        '</span></div>'
      );
    }
  );

  out = out.replace(
    /<motion style="display:flex;\s*gap:12px;\s*margin-bottom:14px;">/gi,
    '<div class="basic-grid-2">'
  );
  out = out.replace(
    /<div style="display:flex;\s*gap:12px;\s*margin-bottom:14px;">/gi,
    '<div class="basic-grid-2">'
  );
  out = out.replace(/<div style="flex:1;">/g, '<div>');

  out = out.replace(
    /<div style="margin-bottom:14px;">\s*<label class="form-label">([^<]+)<\/label>\s*([\s\S]*?)\s*<\/div>/gi,
    (_, label, inner) => {
      const ic = iconForLabel(label.trim());
      return (
        '<div class="basic-field">\n' +
        '        <label class="basic-label"><i class="fa-solid ' +
        ic +
        '" aria-hidden="true"></i>' +
        label.trim() +
        '</label>\n' +
        inner.trim() +
        '\n      </div>'
      );
    }
  );

  out = out.replace(
    /<div style="height:44px; background:#F7F8FA; border-radius:12px; display:flex; align-items:center; padding:0 14px; font-size:15px; color:#1D2129;">([^<]*)<\/div>/g,
    '<motion class="form-readonly">$1</div>'
  );
  out = out.replace(
    /<div style="height:44px; background:#F7F8FA; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:600; color:#165DFF;">([^<]*)<\/div>/g,
    '<div class="form-readonly highlight">$1</div>'
  );

  out = out.replace(
    /<motion style="height:44px; background:#E8FFEA; border:1px solid #00B42A; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:6px;">\s*<i class="fa-solid fa-circle-check" style="color:#00B42A;"><\/i>\s*<span style="font-size:15px; font-weight:600; color:#00B42A;">合格<\/span>\s*<\/motion>/gi,
    '<div class="status-pass"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>合格</span></div>'
  );
  out = out.replace(
    /<div style="height:44px; background:#E8FFEA; border:1px solid #00B42A; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:6px;">\s*<i class="fa-solid fa-circle-check" style="color:#00B42A;"><\/i>\s*<span style="font-size:15px; font-weight:600; color:#00B42A;">合格<\/span>\s*<\/div>/gi,
    '<div class="status-pass"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>合格</span></motion>'
  );
  out = out.replace(/<\/motion>/g, '</div>').replace(/<motion/g, '<div');

  out = out.replace(
    /<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">\s*<span style="font-size:14px; font-weight:600; color:#1D2129;">([^<]+)<\/span>\s*<\/div>/g,
    '<motion class="check-card-head">$1</div>'
  );
  out = out.replace(/<motion class="check-card-head">/g, '<motion class="check-card-head">');
  out = out.replace(/<motion class="check-card-head">/g, '<div class="check-card-head">');

  out = out.replace(
    /placeholder="备注（选填）" style="width:100%; height:36px; border:1px solid #E5E6EB; border-radius:8px; padding:0 12px; font-size:13px; outline:none; box-sizing:border-box;"/g,
    'class="form-input" placeholder="备注（选填）"'
  );

  return out;
}

for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = ensureBasicCssLink(html, file);
  html = stripInlineFormStyles(html);
  html = migrate(html);
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    console.log('updated', path.relative(ROOT, file));
  }
}
