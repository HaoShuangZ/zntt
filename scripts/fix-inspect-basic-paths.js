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

const AI_BLOCK =
  /<!-- AI建议 -->\s*<div style="background:#E8F3FF; border:1px solid #BEDAFF; border-radius:12px; padding:14px; margin-bottom:12px;">[\s\S]*?<\/motion>\s*<\/motion>/;

const AI_REPLACE =
  '<section class="inspect-ai-card" aria-label="AI 智能分析">\n' +
  '    <div class="ai-head">\n' +
  '      <div class="ai-icon"><i class="fa-solid fa-robot" aria-hidden="true"></i></div>\n' +
  '      <div>\n' +
  '        <div class="ai-title">AI 智能分析</div>\n' +
  '        <motion class="ai-body">倾斜率 0.10%，远低于规范限值（≤1%），铁塔垂直度状况良好。综合偏移量 X=35mm、Y=28mm，合成偏移约44.8mm，属于正常范围。建议持续监测。</div>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '  </section>';

for (const f of walk(ROOT)) {
  let h = fs.readFileSync(f, 'utf8');
  const before = h;
  h = h.replace(/href="(?:\.\.\/)+assets\/ipad-inspect-basic\.css"/g, 'href="../../../../assets/ipad-inspect-basic.css"');
  if (AI_BLOCK.test(h)) {
    h = h.replace(AI_BLOCK, AI_REPLACE.replace(/<motion/g, '<div').replace(/<\/motion>/g, '</motion>'));
    h = h.replace(/<\/motion>/g, '</div>').replace(/<motion\b/g, '<motion');
    h = h.replace(/<motion\b/g, '<div');
  }
  h = h.replace(/placeholder="请输入备注信息"+"/g, 'placeholder="请输入备注信息"');
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log('fixed', path.relative(ROOT, f));
  }
}
