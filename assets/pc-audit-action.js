/**
 * 列表行「审核/审批」按钮 — 通用弹层（原型演示，不落库）
 * 页面需提供 #pcAuditModal，操作按钮 class 含 btn-pc-audit
 */
(function () {
  function nowText() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function findAuditCells(btn) {
    var root = btn.closest('tr') || btn.closest('.card-body') || btn.closest('#page-content');
    if (!root) return null;
    var marked = root.querySelectorAll('td[data-audit-col], dd[data-audit-col]');
    if (marked.length >= 4) {
      return {
        status: marked[0],
        node: marked[1],
        auditor: marked[2],
        time: marked[3]
      };
    }
    return null;
  }

  function setTag(el, text, tagClass) {
    if (!el) return;
    el.innerHTML = '<span class="tag ' + (tagClass || 'tag-gray') + '">' + text + '</span>';
  }

  function applyPass(btn, remark) {
    var cells = findAuditCells(btn);
    var node = btn.getAttribute('data-node') || '已通过';
    var auditor = btn.getAttribute('data-auditor-default') || '当前用户';
    var isDataAudit = btn.getAttribute('data-audit-kind') === 'inspect-data';
    if (cells) {
      setTag(cells.status, '已通过', 'tag-green');
      cells.node.textContent = node === '—' ? '已通过' : node;
      cells.auditor.textContent = auditor;
      cells.time.textContent = nowText();
    }
    var row = btn.closest('tr');
    if (isDataAudit && row) {
      var statusCell = row.querySelector('td:nth-child(11) .tag') || row.querySelector('.tag.tag-orange');
      if (statusCell && statusCell.textContent.indexOf('已检测') >= 0) {
        statusCell.className = 'tag tag-green';
        statusCell.textContent = '检毕';
      }
      row.dataset.auditStatus = '已通过';
      row.dataset.taskStatus = '检毕';
    }
    var isReportAudit = btn.getAttribute('data-audit-kind') === 'report';
    var passLabel = isDataAudit ? '【检测数据审核通过】' : (isReportAudit ? '【审核通过】' : '【审批通过】');
    var lines = [passLabel, '业务：' + (btn.getAttribute('data-title') || ''), '节点：' + node];
    if (remark) lines.push('意见：' + remark);
    if (isDataAudit) lines.push('', '任务将变为「检毕」，报告编制列表可生成草稿（原型演示）。');
    else lines.push('', '数据未落库（原型演示）。');
    alert(lines.join('\n'));
  }

  function applyReject(btn, remark) {
    if (!remark || !String(remark).trim()) {
      alert('驳回时请填写审核意见');
      return false;
    }
    var cells = findAuditCells(btn);
    if (cells) {
      setTag(cells.status, '已驳回', 'tag-red');
      cells.node.textContent = '已驳回';
      cells.auditor.textContent = '当前用户';
      cells.time.textContent = nowText();
    }
    var isReportAudit = btn.getAttribute('data-audit-kind') === 'report';
    var rejectLabel = isReportAudit ? '【审核驳回】' : '【审批驳回】';
    alert(rejectLabel + '\n' + (btn.getAttribute('data-title') || '') + '\n意见：' + remark + '\n\n数据未落库（原型演示）。');
    return true;
  }

  window.initPcAuditModal = function () {
    var mask = document.getElementById('pcAuditModal');
    if (!mask || mask.dataset.auditBound === '1') return;
    mask.dataset.auditBound = '1';

    var titleEl = document.getElementById('pcAuditModalTitle');
    var subEl = document.getElementById('pcAuditModalSub');
    var remarkEl = document.getElementById('pcAuditRemark');
    var goDetail = document.getElementById('pcAuditGoDetail');
    var activeBtn = null;

    function showMask() {
      mask.classList.add('open');
      if (mask.classList.contains('modal-mask')) mask.classList.add('show');
      mask.style.display = 'flex';
      mask.setAttribute('aria-hidden', 'false');
    }

    function close() {
      mask.classList.remove('open');
      mask.classList.remove('show');
      mask.style.display = 'none';
      mask.setAttribute('aria-hidden', 'true');
      activeBtn = null;
    }

    function open(btn) {
      activeBtn = btn;
      var kind = btn.getAttribute('data-audit-kind') || '';
      var isDataAudit = kind === 'inspect-data';
      var isReportAudit = kind === 'report';
      if (titleEl) {
        titleEl.textContent = isDataAudit ? '检测数据审核' : (isReportAudit ? '审核' : '审批');
      }
      if (subEl) {
        var ver = btn.getAttribute('data-version') || '';
        subEl.innerHTML =
          '任务：<strong>' + (btn.getAttribute('data-title') || '—') + '</strong><br>' +
          (ver ? '当前版本：<strong>' + ver + '</strong><br>' : '') +
          '审核节点：<strong>' + (btn.getAttribute('data-node') || '—') + '</strong>';
      }
      if (remarkEl) remarkEl.value = '';
      if (remarkEl) remarkEl.placeholder = isDataAudit ? '选填；驳回时请填写原因' : '选填；驳回时建议填写原因';
      if (goDetail) {
        var href = btn.getAttribute('data-href');
        if (href) {
          if (isDataAudit && href.indexOf('tab=review') < 0) {
            href += (href.indexOf('?') >= 0 ? '&' : '?') + 'tab=review';
          }
          goDetail.href = href;
          goDetail.textContent = isDataAudit
            ? '进入任务详情 · 数据复核'
            : (isReportAudit ? '进入报告详情审核' : '进入任务详情 / 数据复核');
          goDetail.style.display = 'inline-flex';
        } else {
          goDetail.style.display = 'none';
        }
      }
      showMask();
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-pc-audit');
      if (!btn || !document.getElementById('pcAuditModal')) return;
      e.preventDefault();
      open(btn);
    });

    var closeIds = ['pcAuditModalClose', 'pcAuditCancel'];
    closeIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', close);
    });
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });

    var passBtn = document.getElementById('pcAuditPass');
    if (passBtn) {
      passBtn.addEventListener('click', function () {
        if (!activeBtn) return;
        applyPass(activeBtn, remarkEl ? remarkEl.value.trim() : '');
        close();
      });
    }

    var rejectBtn = document.getElementById('pcAuditReject');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        if (!activeBtn) return;
        if (applyReject(activeBtn, remarkEl ? remarkEl.value.trim() : '')) close();
      });
    }
  };

  window.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('pcAuditModal')) window.initPcAuditModal();
  });
})();
