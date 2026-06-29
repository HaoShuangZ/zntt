const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../pages/iPad端/检测');

function walk(d, o = []) {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p, o);
    else if (/ipad_inspect_.*\.html$/i.test(n)) o.push(p);
  }
  return o;
}

const AI_RE =
  /<div style="background:#E8F3FF; border:1px solid #BEDAFF; border-radius:12px; padding:14px; margin-bottom:12px;">[\s\S]*?<\/motion>\s*<\/motion>/i;

function aiCard(body) {
  return (
    '<section class="inspect-ai-card" aria-label="AI 智能分析">\n' +
    '    <div class="ai-head">\n' +
    '      <div class="ai-icon"><i class="fa-solid fa-robot" aria-hidden="true"></i></div>\n' +
    '      <div>\n' +
    '        <motion class="ai-title">AI 智能分析</motion>\n' +
    '        <div class="ai-body">' +
    body +
    '</div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </section>'
  ).replace(/<motion/g, '<motion').replace(/<\/motion>/g, '</motion>');
}

for (const f of walk(ROOT)) {
  let h = fs.readFileSync(f, 'utf8');
  const before = h;

  h = h.replace(/\.\.\/\.\.\/\.\.\/assets\/ipad-inspect-basic\.css/g, '../../../../assets/ipad-inspect-basic.css');

  h = h.replace(AI_RE, (block) => {
    const m = block.match(/line-height:1\.6;">\s*([\s\S]*?)\s*<\/div>/);
    return aiCard(m ? m[1].trim() : '');
  });

  h = h.replace(/<\/motion>/g, '</div>').replace(/<motion\b/g, '<div');

  h = h.replace(
    /placeholder="请输入备注信息""""""/g,
    'class="form-textarea" placeholder="请输入备注信息"'
  );
  h = h.replace(
    /<textarea style="width:100%; height:68px;[^"]*"([^>]*)>/g,
    '<textarea class="form-textarea"$1>'
  );

  h = h.replace(
    /<style>\s*\.form-label\s*\{[^}]*\}\s*\.form-input\s*\{[^}]*\}\s*\.form-input:focus\s*\{[^}]*\}\s*\/\* 基础信息[\s\S]*?<\/style>\s*/i,
    ''
  );

  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log('polish', path.relative(ROOT, f));
  }
}
