window.__layoutConfig = { active: 'contract_list', breadcrumb: ['合同管理', '对上合同', '合同详情'] };

var CONTRACT_MOCK = {
  'HT2026-0512': {
    code: 'HT2026-0512', name: '杭州移动 2026 年度铁塔检测框架', customer: '中国移动通信集团浙江有限公司',
    type: '自有', subRate: '', status: '履行中', workflowStatus: '已通过', auditNode: '合同部终审', auditor: '王敏', auditAt: '2026-01-05 10:00',
    amtTax: 2860000, amtNoTax: 2548672.57, cumReceipt: 1200000, cumPayment: 320000,
    dateStart: '2026-01-01', dateEnd: '2026-12-31',
    attachments: ['杭州移动2026框架合同.pdf'], remark: '年度框架协议，按站结算。',
    prices: [{ name: '单站安全性鉴定', tax: '8500', noTax: '7547', qty: '1' }],
    recvRem: [
      { name: '首付款', time: '2026-02-01T09:00', msgStatus: '已发送', msgSentAt: '2026-02-01 09:00' },
      { name: '尾款', time: '2026-11-01T09:00', msgStatus: '待发送', msgSentAt: '—' }
    ],
    receipts: [
      { no: 'SK20260115001', date: '2026-01-15', amt: '500,000', method: '银行转账', stage: '首付款' },
      { no: 'SK20260320002', date: '2026-03-20', amt: '700,000', method: '银行转账', stage: '进度款' }
    ],
    payments: [
      { no: 'FK-202605-0009', downCode: 'DX2026-0101', downName: '单站检测外协服务包', unit: '杭州某某检测技术有限公司', date: '2026-05-06', amt: '120,000', method: '银行转账' },
      { no: 'FK-202603-0015', downCode: 'DX2026-0101', downName: '单站检测外协服务包', unit: '杭州某某检测技术有限公司', date: '2026-03-18', amt: '200,000', method: '银行转账' }
    ],
    downstream: [{ code: 'DX2026-0101', name: '单站检测外协服务包', unit: '杭州某某检测', amt: '120,000' }],
    projects: [{ code: 'GC2026-0088', name: '杭州移动余杭站点包', status: '履行中' }]
  },
  'HT2026-0428': {
    code: 'HT2026-0428', name: '城西改造专项检测分包', customer: '浙江某建设集团有限公司',
    type: '分包', subRate: 35, status: '履行中', workflowStatus: '审核中', auditNode: '法务审核', auditor: '—', auditAt: '—',
    amtTax: 480000, amtNoTax: 424778.76, cumReceipt: 160000, cumPayment: 95000,
    dateStart: '2026-04-01', dateEnd: '2026-09-30',
    attachments: ['城西改造专项合同.pdf'], remark: '分包合同。',
    prices: [{ name: '专项检测包干', tax: '480000', noTax: '424778.76', qty: '1' }],
    recvRem: [{ name: '首款', time: '2026-05-01T10:00', msgStatus: '待发送', msgSentAt: '—' }],
    receipts: [{ no: 'SK20260410001', date: '2026-04-10', amt: '160,000', method: '银行转账', stage: '首款' }],
    payments: [{ no: 'FK-202604-0021', downCode: 'DX2026-0102', downName: '塔身焊缝抽检协作', unit: '外协协作单位', date: '2026-04-22', amt: '45,000', method: '银行转账' }],
    downstream: [{ code: 'DX2026-0102', name: '塔身焊缝抽检协作', unit: '外协协作单位', amt: '96,000' }],
    projects: []
  }
};

var current = null;
var isEdit = false;
var priceRows = document.getElementById('priceRows');
var recvRemRows = document.getElementById('recvRemRows');

function fmtMoney(n) {
  return '¥ ' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function numVal(v) { var n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? 0 : n; }
function fmtNum(n) { if (isNaN(n) || n === 0) return ''; return (Math.round(n * 100) / 100).toLocaleString('zh-CN'); }
function canBizOperate(d) { return d && d.status === '履行中' && d.workflowStatus === '已通过'; }
function platformWorkflowUrl(code) {
  return '../../工作台/流程中心/pc_workflow_approve.html?bizType=contract_up&bizId=' + encodeURIComponent(code);
}

function applyViewMode() {
  document.body.classList.toggle('view-only', !isEdit);
  document.querySelectorAll('.edit-only').forEach(function (el) { el.style.display = isEdit ? '' : 'none'; });
  document.getElementById('formFooter').style.display = isEdit ? '' : 'none';
}

function syncHdrActions(d) {
  var hdr = document.getElementById('hdrActions');
  var wf = d.workflowStatus;
  if (wf === '未提交' || wf === '已驳回') {
    hdr.innerHTML = '<button type="button" class="btn btn-primary btn-sm" id="btnSubmitWf"><i class="fa-solid fa-paper-plane"></i> 提交审批</button>';
    document.getElementById('btnSubmitWf').onclick = function () { alert('已提交至基础平台审批流（原型）'); };
  } else if (wf === '审核中') {
    hdr.innerHTML = '<a href="' + platformWorkflowUrl(d.code) + '" class="btn btn-primary btn-sm"><i class="fa-solid fa-clipboard-check"></i> 去审批（平台）</a>';
  } else {
    hdr.innerHTML = '<a href="' + platformWorkflowUrl(d.code) + '" class="btn btn-default btn-sm"><i class="fa-solid fa-clock-rotate-left"></i> 审批记录（平台）</a>';
  }
  if (!isEdit && wf !== '未提交') {
    hdr.innerHTML += ' <a href="pc_contract_detail.html?code=' + encodeURIComponent(d.code) + '&mode=edit" class="btn btn-default btn-sm"><i class="fa-solid fa-pen"></i> 编辑</a>';
  }
}

function syncBizUi() {
  var d = current;
  if (!d) return;
  var hint = document.getElementById('bizHint');
  var actions = document.getElementById('bizActions');
  if (canBizOperate(d)) {
    if (hint) {
      hint.className = 'biz-hint';
      hint.textContent = '合同状态为「履行中」且审核「已通过」：可登记对上收款，并在此合同下新建工程（工程审核通过可创建订单）。';
    }
    actions.innerHTML =
      '<a href="../合同收款/pc_contract_receipt.html?contractCode=' + encodeURIComponent(d.code) + '" class="btn btn-primary btn-sm">对上收款</a>' +
      '<a href="../合同付款/pc_contract_payment.html?upContractCode=' + encodeURIComponent(d.code) + '" class="btn btn-default btn-sm">对下付款</a>' +
      '<a href="../../营销管理/工程管理/pc_project_create.html?contractCode=' + encodeURIComponent(d.code) + '" class="btn btn-default btn-sm">新建工程</a>';
  } else {
    if (hint) {
      hint.className = 'biz-hint warn';
      hint.textContent = d.status !== '履行中' ? '合同状态为「' + d.status + '」：业务操作已限制。' : '审核未通过：须基础平台审批通过后方可收付款与新建工程。';
    }
    actions.innerHTML = '';
  }
  var rc = document.getElementById('btnAddReceipt');
  if (rc) rc.href = '../合同收款/pc_contract_receipt.html?contractCode=' + encodeURIComponent(d.code);
  var bp = document.getElementById('btnAddPayment');
  if (bp) bp.href = '../合同付款/pc_contract_payment.html?upContractCode=' + encodeURIComponent(d.code);
}

function renderFundBar(d) {
  var pct = d.amtTax ? Math.round((d.cumReceipt / d.amtTax) * 100) : 0;
  document.getElementById('fundBar').innerHTML =
    '<div><span style="color:var(--text-3)">含税金额 </span><strong>' + fmtMoney(d.amtTax) + '</strong></div>' +
    '<div><span style="color:var(--text-3)">累计收款 </span><strong>' + fmtMoney(d.cumReceipt) + '</strong> (' + pct + '%)</div>' +
    '<div><span style="color:var(--text-3)">累计付款(对下) </span><strong>' + fmtMoney(d.cumPayment) + '</strong></div>' +
    '<div><span style="color:var(--text-3)">不含税金额 </span><strong>' + fmtMoney(d.amtNoTax) + '</strong></div>';
}

function renderAuditBar(d) {
  var auditBar = document.getElementById('auditBar');
  if (!auditBar) return;
  auditBar.innerHTML =
    '<div><span>审核状态 </span><strong>' + d.workflowStatus + '</strong></div>' +
    '<div><span>审核节点 </span><strong>' + (d.auditNode || '—') + '</strong></div>' +
    '<div><span>审核人 </span><strong>' + (d.auditor || '—') + '</strong></div>' +
    '<div><span>审核时间 </span><strong>' + (d.auditAt || '—') + '</strong></div>';
}

function renderRemindTable(tbody, list, editable) {
  tbody.innerHTML = '';
  (list || []).forEach(function (r) {
    var tr = document.createElement('tr');
    if (editable) {
      tr.innerHTML = '<td class="edit-only"><button type="button" class="btn-row-del js-del-rem">删</button></td>' +
        '<td><input class="form-input js-rem-name" value="' + (r.name || '') + '"></td>' +
        '<td><input type="datetime-local" class="form-input js-rem-time" value="' + (r.time || '') + '"></td>';
      tr.querySelector('.js-del-rem').onclick = function () { tr.remove(); };
    } else {
      tr.innerHTML = '<td>' + r.name + '</td><td>' + r.time + '</td>';
    }
    tbody.appendChild(tr);
  });
}

function recalcPriceRow(tr) {
  var taxP = numVal(tr.querySelector('.js-p-tax').value);
  var noTaxP = numVal(tr.querySelector('.js-p-notax').value);
  var qty = numVal(tr.querySelector('.js-p-qty').value);
  tr.querySelector('.js-sum-tax').textContent = (taxP && qty) ? fmtNum(taxP * qty) : '';
  tr.querySelector('.js-sum-notax').textContent = (noTaxP && qty) ? fmtNum(noTaxP * qty) : '';
}
function addPriceRow(data) {
  var tr = document.createElement('tr');
  tr.innerHTML = '<td class="edit-only"><button type="button" class="btn-row-del js-del-row">删</button></td><td><input class="form-input js-p-name"></td><td><input type="number" class="form-input js-p-tax"></td><td><input type="number" class="form-input js-p-notax"></td><td><input type="number" class="form-input js-p-qty" value="1"></td><td class="cell-readonly js-sum-tax"></td><td class="cell-readonly js-sum-notax"></td>';
  priceRows.appendChild(tr);
  if (data) {
    tr.querySelector('.js-p-name').value = data.name || '';
    tr.querySelector('.js-p-tax').value = data.tax || '';
    tr.querySelector('.js-p-notax').value = data.noTax || '';
    tr.querySelector('.js-p-qty').value = data.qty || '1';
    recalcPriceRow(tr);
  }
  tr.querySelectorAll('.js-p-tax,.js-p-notax,.js-p-qty').forEach(function (i) { i.oninput = function () { recalcPriceRow(tr); }; });
  tr.querySelector('.js-del-row').onclick = function () { tr.remove(); };
}
function renderPrices(list) {
  priceRows.innerHTML = '';
  (list || []).forEach(function (p) {
    if (isEdit) addPriceRow(p);
    else {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + p.name + '</td><td>' + p.tax + '</td><td>' + p.noTax + '</td><td>' + p.qty + '</td><td>' + fmtNum(numVal(p.tax) * numVal(p.qty)) + '</td><td>' + fmtNum(numVal(p.noTax) * numVal(p.qty)) + '</td>';
      priceRows.appendChild(tr);
    }
  });
}

function loadContract(d) {
  current = d;
  var modeLabel = isEdit ? '编辑' : '详情';
  document.getElementById('pageTitle').textContent = modeLabel + ' · ' + d.code;
  window.__layoutConfig.breadcrumb[2] = modeLabel;
  document.getElementById('cCode').value = d.code;
  document.getElementById('cStatus').value = d.status;
  document.getElementById('cName').value = d.name;
  document.getElementById('cCustomer').value = d.customer;
  document.getElementById('cType').value = d.type;
  document.getElementById('cSubWrap').style.display = d.type === '分包' ? 'block' : 'none';
  document.getElementById('cSubRate').value = d.subRate || '';
  document.getElementById('cAmtTax').value = d.amtTax;
  document.getElementById('cAmtNoTax').value = d.amtNoTax;
  document.getElementById('cDateStart').value = d.dateStart;
  document.getElementById('cDateEnd').value = d.dateEnd;
  document.getElementById('cRemark').value = d.remark || '';
  document.getElementById('cAttachmentList').innerHTML = (d.attachments || []).map(function (n) { return '<li><a href="#">' + n + '</a></li>'; }).join('');
  renderFundBar(d);
  renderAuditBar(d);
  renderPrices(d.prices);
  renderRemindTable(recvRemRows, d.recvRem, isEdit);
  document.getElementById('receiptTbody').innerHTML = (d.receipts || []).map(function (r) {
    return '<tr><td>' + r.no + '</td><td>' + r.date + '</td><td>¥ ' + r.amt + '</td><td>' + r.method + '</td><td>' + r.stage + '</td></tr>';
  }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-3)">暂无</td></tr>';
  document.getElementById('paymentTbody').innerHTML = (d.payments || []).map(function (p) {
    return '<tr><td>' + p.no + '</td><td><a href="../对下合同/pc_contract_downstream_detail.html?code=' + encodeURIComponent(p.downCode) + '" class="btn-text">' + p.downCode + '</a> ' + (p.downName || '') + '</td><td>' + (p.unit || '—') + '</td><td>' + p.date + '</td><td>¥ ' + p.amt + '</td><td>' + p.method + '</td></tr>';
  }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-3)">暂无对下付款记录</td></tr>';
  document.getElementById('downTbody').innerHTML = (d.downstream || []).map(function (x) {
    return '<tr><td>' + x.code + '</td><td>' + x.name + '</td><td>' + x.unit + '</td><td>' + x.amt + '</td><td><a href="../对下合同/pc_contract_downstream_detail.html?code=' + x.code + '" class="btn-text">详情</a></td></tr>';
  }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-3)">暂无</td></tr>';
  document.getElementById('projTbody').innerHTML = (d.projects || []).map(function (p) {
    return '<tr><td>' + p.code + '</td><td>' + p.name + '</td><td>' + p.status + '</td><td><a href="../../营销管理/工程管理/pc_project_list.html" class="btn-text">查看</a></td></tr>';
  }).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-3)">暂无，审核通过后可新建工程</td></tr>';
  syncHdrActions(d);
  syncBizUi();
  applyViewMode();
}

function initTabBar() {
  var tabBar = document.getElementById('tabBar');
  if (!tabBar || tabBar.dataset.bound === '1') return;
  tabBar.dataset.bound = '1';
  tabBar.addEventListener('click', function (e) {
    var tab = e.target.closest('.tab');
    if (!tab || !tabBar.contains(tab)) return;
    var id = tab.getAttribute('data-tab');
    if (!id) return;
    tabBar.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t === tab); });
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('on', p.id === 'panel-' + id);
    });
  });
}

function initFormHandlers() {
  var cType = document.getElementById('cType');
  if (cType) {
    cType.onchange = function () {
      document.getElementById('cSubWrap').style.display = this.value === '分包' ? 'block' : 'none';
    };
  }
  var cStatus = document.getElementById('cStatus');
  if (cStatus) {
    cStatus.onchange = function () {
      if (current) { current.status = this.value; syncBizUi(); }
    };
  }
  var btnPrice = document.getElementById('btnAddPriceRow');
  if (btnPrice) btnPrice.onclick = function () { addPriceRow(); };
  var btnRecv = document.getElementById('btnAddRecvRem');
  if (btnRecv) btnRecv.onclick = function () { addRemindRow(recvRemRows); };
  var btnSave = document.getElementById('btnSave');
  if (btnSave) {
    btnSave.onclick = function () {
      alert('已保存（原型）');
      if (current && current.code && current.code.indexOf('保存') < 0) {
        location.href = 'pc_contract_detail.html?code=' + encodeURIComponent(current.code);
      }
    };
  }
}

function addRemindRow(tbody) {
  var tr = document.createElement('tr');
  tr.innerHTML =
    '<td class="edit-only"><button type="button" class="btn-row-del js-del-rem">删</button></td>' +
    '<td><input class="form-input js-rem-name" placeholder="阶段名称"></td>' +
    '<td><input type="datetime-local" class="form-input js-rem-time"></td>';
  tbody.appendChild(tr);
  tr.querySelector('.js-del-rem').onclick = function () { tr.remove(); };
}

var pageDataLoaded = false;

function bootContractDetailPage() {
  initTabBar();
  initFormHandlers();
  if (pageDataLoaded) return;

  var params = new URLSearchParams(location.search);
  var code = (params.get('code') || '').trim();
  var mode = (params.get('mode') || 'view').trim();
  isEdit = mode === 'edit' || mode === 'create';
  pageDataLoaded = true;

  if (mode === 'create') {
    loadContract({
      code: '（保存后生成）', name: '', customer: '', type: '自有', subRate: '', status: '待生效',
      workflowStatus: '未提交', auditNode: '—', auditor: '—', auditAt: '—',
      amtTax: 0, amtNoTax: 0, cumReceipt: 0, cumPayment: 0, dateStart: '', dateEnd: '',
      attachments: [], remark: '',
      prices: [{ name: '', tax: '', noTax: '', qty: '1' }],
      recvRem: [{ name: '', time: '', msgStatus: '待发送', msgSentAt: '—' }],
      receipts: [], payments: [], downstream: [], projects: []
    });
    document.getElementById('pageTitle').textContent = '新建对上合同';
    window.__layoutConfig.breadcrumb[2] = '新建合同';
  } else {
    if (!code || !CONTRACT_MOCK[code]) code = 'HT2026-0512';
    loadContract(JSON.parse(JSON.stringify(CONTRACT_MOCK[code])));
  }
}

window.addEventListener('DOMContentLoaded', bootContractDetailPage);
/* shared-layout 注入侧栏后可能晚于 DOMContentLoaded，再绑一次 Tab */
setTimeout(bootContractDetailPage, 0);
