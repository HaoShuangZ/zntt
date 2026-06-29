const fs = require('fs');
const p = require('path').join(__dirname, '../pages/iPad端/检测/分段/ipad_inspect_segment.html');
let h = fs.readFileSync(p, 'utf8');

const block = `  function renderForm() {
    var s = segments[activeIndex];
    if (!s) return;
    var title = segmentLabel(activeIndex) + ' · 检测数据';
    var bolt0 = s.boltLoose ? '' : ' on-pass';
    var bolt1 = s.boltLoose ? ' on-fail' : '';
    var res1 = s.resultPass ? ' on-pass' : '';
    var res0 = s.resultPass ? '' : ' on-fail';
    var parts = [];
    parts.push('<section class="seg-form-card" aria-labelledby="segFormTitle">');
    parts.push('<h3 id="segFormTitle" class="seg-form-title">', escapeHtml(title), '</h3>');
    parts.push('<motion class="basic-grid-2">');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-ruler" aria-hidden="true"></i>壁厚（mm）</label>');
    parts.push('<input type="number" class="form-input" data-f="thickness" value="', escapeAttr(s.thickness), '" placeholder="请输入壁厚"></motion>');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-droplet" aria-hidden="true"></i>锈蚀程度</label>');
    parts.push('<select class="form-input" data-f="corrosion">', optionHtml('无锈蚀', s.corrosion), optionHtml('轻微锈蚀', s.corrosion), optionHtml('中度锈蚀', s.corrosion), optionHtml('严重锈蚀', s.corrosion), '</select></motion>');
    parts.push('</motion><motion class="basic-grid-2">');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-ruler-horizontal" aria-hidden="true"></i>法兰间隙（mm）</label>');
    parts.push('<input type="number" class="form-input" data-f="flangeGap" value="', escapeAttr(s.flangeGap), '" placeholder="请输入法兰间隙"></motion>');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i>螺栓松动</label>');
    parts.push('<motion class="toggle-pair" data-toggle="boltLoose" data-f="boltLoose" data-val="', s.boltLoose ? '1' : '0', '">');
    parts.push('<motion class="toggle-opt', bolt0, '" data-val="0">无松动</motion><motion class="toggle-opt', bolt1, '" data-val="1">有松动</motion></motion></motion></motion>');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>检测结果</label>');
    parts.push('<motion class="toggle-pair" data-toggle="resultPass" data-f="resultPass" data-val="', s.resultPass ? '1' : '0', '">');
    parts.push('<motion class="toggle-opt', res1, '" data-val="1">合格</motion><motion class="toggle-opt', res0, '" data-val="0">不合格</motion></motion></motion>');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-camera" aria-hidden="true"></i>拍照记录</label>');
    parts.push('<motion class="photo-thumb-add" role="button" tabindex="0"><i class="fa-solid fa-camera" aria-hidden="true"></i><span>拍照</span></motion></motion>');
    parts.push('<motion class="basic-field"><label class="basic-label"><i class="fa-solid fa-pen" aria-hidden="true"></i>备注</label>');
    parts.push('<textarea class="form-textarea" data-f="remark" placeholder="请输入备注信息">', escapeHtml(s.remark), '</textarea></motion>');
    parts.push('</section>');
    formHost.innerHTML = parts.join('').replace(/<\\/?motion\\b[^>]*>/gi, function (m) { return m.indexOf('/') === 1 ? '</div>' : '<div>'; });
    bindToggles(formHost);
    updateProgress();
  }

  function renderTabs() {
    tabScroll.innerHTML = '';
    segments.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'seg-tab-item' + (i === activeIndex ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      btn.setAttribute('data-index', String(i));
      var label = document.createElement('span');
      label.textContent = segmentLabel(i);
      btn.appendChild(label);
`;

const fixed = block.replace(/motion/g, 'TAG').replace(/TAG/g, 'div');

h = h.replace(/  function renderForm\(\) \{[\s\S]*?  function scrollTabIntoView/, fixed + '\n  function scrollTabIntoView');

fs.writeFileSync(p, h);
console.log('ok');
