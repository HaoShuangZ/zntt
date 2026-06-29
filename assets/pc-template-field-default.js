/**
 * 任务模板字段 · 默认值配置（数值类型支持序列生成）
 */
(function (global) {
  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /** 首值 avg−range，末值 avg+小幅上浮，中间按 0.1×range 步长递近平均值 */
  function generateNumericSequence(avg, range, count) {
    var a = parseFloat(avg);
    var r = Math.abs(parseFloat(range));
    var n = parseInt(count, 10);
    if (isNaN(a)) a = 0;
    if (isNaN(r)) r = 0;
    if (isNaN(n) || n < 1) n = 1;
    if (n > 99) n = 99;
    if (n === 1) return [round1(a)];

    var bump = round1(Math.max(0.05, Math.min(r * 0.15, r * 0.1 + 0.05)));
    if (n === 2) return [round1(a - r), round1(a)];

    var out = [round1(a - r)];
    var midCount = n - 3;
    var j;
    for (j = 1; j <= midCount; j++) {
      var delta;
      if (midCount <= 4) {
        delta = -r * Math.max(0.08, 0.5 - (j - 1) * 0.1);
      } else {
        var t = j / (midCount + 1);
        var eased = t * t * (3 - 2 * t);
        delta = -r * (1 - eased * 0.92);
      }
      out.push(round1(a + delta));
    }
    out.push(round1(a));
    out.push(round1(a + bump));
    return out;
  }

  function formatSeqResult(arr) {
    return arr.join(', ');
  }

  function parseSeqResult(str) {
    if (!str || !String(str).trim()) return [];
    return String(str)
      .split(/[\s,，;；]+/)
      .map(function (s) {
        return parseFloat(s.trim());
      })
      .filter(function (v) {
        return !isNaN(v);
      });
  }

  function defaultCellHtml(fixedValue, seqConfig) {
    seqConfig = seqConfig || {};
    var mode = seqConfig.mode || 'fixed';
    var avg = seqConfig.avg != null ? seqConfig.avg : 10;
    var range = seqConfig.range != null ? seqConfig.range : 1;
    var cnt = seqConfig.count != null ? seqConfig.count : 6;
    var result =
      seqConfig.result ||
      formatSeqResult(generateNumericSequence(avg, range, cnt));
    var fixed = fixedValue != null ? fixedValue : '';

    return (
      '<div class="default-value-cell">' +
      '<select class="form-select default-mode-select" title="默认值配置方式">' +
      '<option value="fixed"' +
      (mode === 'fixed' ? ' selected' : '') +
      '>固定值</option>' +
      '<option value="seq"' +
      (mode === 'seq' ? ' selected' : '') +
      '>序列生成</option>' +
      '</select>' +
      '<div class="default-seq-panel' +
      (mode === 'seq' ? '' : ' is-hidden') +
      '">' +
      '<div class="default-seq-params">' +
      '<span class="default-seq-label">平均值</span>' +
      '<input type="number" class="form-input default-seq-avg" value="' +
      avg +
      '" step="0.1" title="序列中心值">' +
      '<span class="default-seq-label">±范围</span>' +
      '<input type="number" class="form-input default-seq-range" value="' +
      range +
      '" step="0.1" min="0" title="相对平均值的正负偏差">' +
      '<span class="default-seq-label">个数</span>' +
      '<input type="number" class="form-input default-seq-count" value="' +
      cnt +
      '" min="1" max="99" step="1" title="生成数值个数">' +
      '<button type="button" class="btn btn-default btn-sm btn-gen-seq">生成</button>' +
      '</div>' +
      '<input type="text" class="form-input default-seq-result" readonly value="' +
      result +
      '" title="生成结果（逗号分隔，写入模板默认值）">' +
      '<p class="default-seq-tip">在 [平均值−范围, 平均值+范围×15%] 内插值，并保证含平均值；示例：10、±1、6 → 9, 9.5, 9.6, 9.7, 10, 10.1</p>' +
      '</div>' +
      '<input type="text" class="form-input default-fixed-input' +
      (mode === 'fixed' ? '' : ' is-hidden') +
      '" value="' +
      fixed +
      '" placeholder="默认值">' +
      '</div>'
    );
  }

  function plainDefaultCellHtml(value, placeholder) {
    return (
      '<input type="text" class="form-input default-plain-input" style="width:100%" value="' +
      (value || '') +
      '" placeholder="' +
      (placeholder || '默认值') +
      '">'
    );
  }

  function getFieldType(tr) {
    var sel = tr.querySelector('.field-type-select');
    return sel ? sel.value : '';
  }

  function syncDefaultCellFromType(tr) {
    if (!tr) return;
    var tds = tr.querySelectorAll('td');
    if (tds.length < 8) return;
    var defaultTd = tds[7];
    var type = getFieldType(tr);
    var existing = defaultTd.querySelector('.default-value-cell, .default-plain-input');

    if (type === '数字') {
      var mode = 'seq';
      var avg = 10;
      var range = 1;
      var count = 6;
      var result = formatSeqResult(generateNumericSequence(avg, range, count));
      var fixed = '';
      if (existing) {
        if (existing.classList.contains('default-plain-input')) {
          fixed = existing.value;
          if (fixed) {
            mode = 'fixed';
            result = '';
          }
        } else {
          var modeSel = defaultTd.querySelector('.default-mode-select');
          if (modeSel) mode = modeSel.value;
          var avgInp = defaultTd.querySelector('.default-seq-avg');
          var rangeInp = defaultTd.querySelector('.default-seq-range');
          var countInp = defaultTd.querySelector('.default-seq-count');
          var resInp = defaultTd.querySelector('.default-seq-result');
          var fixInp = defaultTd.querySelector('.default-fixed-input');
          if (avgInp) avg = avgInp.value;
          if (rangeInp) range = rangeInp.value;
          if (countInp) count = countInp.value;
          if (resInp) result = resInp.value;
          if (fixInp) fixed = fixInp.value;
        }
      }
      defaultTd.innerHTML = defaultCellHtml(fixed, {
        mode: mode,
        avg: avg,
        range: range,
        count: count,
        result: result,
      });
    } else {
      var val = '';
      if (existing) {
        if (existing.classList.contains('default-plain-input')) {
          val = existing.value;
        } else {
          var m = defaultTd.querySelector('.default-mode-select');
          if (m && m.value === 'seq') {
            var ri = defaultTd.querySelector('.default-seq-result');
            val = ri ? ri.value : '';
          } else {
            var fi = defaultTd.querySelector('.default-fixed-input');
            val = fi ? fi.value : '';
          }
        }
      }
      defaultTd.innerHTML = plainDefaultCellHtml(val, type === '图片' ? '无' : '默认值');
    }
  }

  function toggleDefaultMode(cell, mode) {
    var panel = cell.querySelector('.default-seq-panel');
    var fixedInp = cell.querySelector('.default-fixed-input');
    if (panel) panel.classList.toggle('is-hidden', mode !== 'seq');
    if (fixedInp) fixedInp.classList.toggle('is-hidden', mode !== 'fixed');
  }

  function runGenerate(cell) {
    var avgInp = cell.querySelector('.default-seq-avg');
    var rangeInp = cell.querySelector('.default-seq-range');
    var countInp = cell.querySelector('.default-seq-count');
    var resInp = cell.querySelector('.default-seq-result');
    if (!avgInp || !rangeInp || !countInp || !resInp) return;
    var arr = generateNumericSequence(avgInp.value, rangeInp.value, countInp.value);
    resInp.value = formatSeqResult(arr);
  }

  function bindTable(tableRoot) {
    if (!tableRoot || tableRoot.__defaultBound) return;
    tableRoot.__defaultBound = true;

    tableRoot.addEventListener('change', function (e) {
      if (e.target.classList.contains('default-mode-select')) {
        var cell = e.target.closest('.default-value-cell');
        if (cell) toggleDefaultMode(cell, e.target.value);
        return;
      }
      if (e.target.classList.contains('field-type-select')) {
        var tr = e.target.closest('tr');
        if (tr) syncDefaultCellFromType(tr);
      }
    });

    tableRoot.addEventListener('click', function (e) {
      if (e.target.closest('.btn-gen-seq')) {
        var cell = e.target.closest('.default-value-cell');
        if (cell) runGenerate(cell);
      }
    });
  }

  function initRows(tbody) {
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(syncDefaultCellFromType);
    bindTable(tbody);
  }

  global.PcTemplateFieldDefault = {
    generateNumericSequence: generateNumericSequence,
    formatSeqResult: formatSeqResult,
    parseSeqResult: parseSeqResult,
    defaultCellHtml: defaultCellHtml,
    plainDefaultCellHtml: plainDefaultCellHtml,
    syncDefaultCellFromType: syncDefaultCellFromType,
    initRows: initRows,
    bindTable: bindTable,
  };
})(typeof window !== 'undefined' ? window : this);
