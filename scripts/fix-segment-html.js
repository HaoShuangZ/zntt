const fs = require('fs');
const p = require('path').join(__dirname, '../pages/iPad端/检测/分段/ipad_inspect_segment.html');
let h = fs.readFileSync(p, 'utf8');
h = h.replace(/<\/?motion\b[^>]*>/gi, (m) => (m.startsWith('</') ? '</div>' : '<motion>'));
h = h.replace(/<motion>/gi, '<div>');
h = h.replace(/<\/motion>/gi, '</div>');
h = h.replace(
  /\s*formHost\.innerHTML = formHost\.innerHTML\.replace\([\s\S]*?\);\s*\n/,
  '\n'
);
fs.writeFileSync(p, h);
console.log('fixed segment html');
