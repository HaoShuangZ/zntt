(function (global) {
  'use strict';

  var KEYS = {
    reports: 'tower_reports',
    opinions: 'tower_rectification_library',
    summaryState: 'tower_problem_summary_state'
  };

  var projectNames = ['螺栓缺失', '螺栓松动', '构件锈蚀', '构件变形', '构件缺失', '接地扁铁锈蚀'];
  var seedOpinions = [
    { id:'OP001', project:'螺栓缺失', opinion:'按照设计规格补齐缺失螺栓。', enabled:true, createdAt:'2026-10-16 16:57:41' },
    { id:'OP002', project:'螺栓缺失', opinion:'补齐缺失螺栓，并对连接部位进行紧固检查。', enabled:true, createdAt:'2026-10-15 14:32:18' },
    { id:'OP003', project:'螺栓松动', opinion:'对松动螺栓进行复紧，并检查紧固情况。', enabled:true, createdAt:'2026-10-14 10:21:05' },
    { id:'OP004', project:'构件锈蚀', opinion:'对锈蚀部位除锈后涂刷防锈漆。', enabled:true, createdAt:'2026-10-12 09:16:33' },
    { id:'OP005', project:'构件变形', opinion:'矫正变形构件，必要时按照原规格更换。', enabled:true, createdAt:'2026-10-10 11:08:27' },
    { id:'OP006', project:'构件缺失', opinion:'按照设计规格补装缺失构件。', enabled:false, createdAt:'2026-10-09 10:08:27' },
    { id:'OP007', project:'接地扁铁锈蚀', opinion:'除锈防腐，严重锈蚀部位予以更换。', enabled:false, createdAt:'2026-10-08 09:08:27' }
  ];

  var reportProfiles = {
    R1:{ province:'浙江省', city:'杭州市', siteName:'滨江01#塔', siteCode:'330108000001', longitude:'120.2126', latitude:'30.2084', taskCreatedAt:'2026-05-01 09:00', problems:[
      {id:'R1-P1', project:'螺栓缺失', description:'第三塔段主肢螺栓缺失2处。'},
      {id:'R1-P2', project:'螺栓松动', description:'第四塔段辅材螺栓松动3处。'}
    ]},
    R2:{ province:'浙江省', city:'杭州市', siteName:'滨江02#塔', siteCode:'330108000002', longitude:'120.2018', latitude:'30.2051', taskCreatedAt:'2026-05-02 10:20', problems:[
      {id:'R2-P1', project:'接地扁铁锈蚀', description:'接地扁铁表面存在锈蚀。'}
    ]},
    R3:{ province:'湖北省', city:'武汉市', siteName:'西湖01#塔', siteCode:'420106000103', longitude:'114.3055', latitude:'30.5928', taskCreatedAt:'2026-05-03 14:10', problems:[
      {id:'R3-P1', project:'构件变形', description:'第一塔段斜辅材变形1根。'}
    ]},
    R4:{ province:'湖北省', city:'武汉市', siteName:'余杭01#塔', siteCode:'420106000104', longitude:'114.3102', latitude:'30.5980', taskCreatedAt:'2026-05-04 08:40', problems:[
      {id:'R4-P1', project:'螺栓松动', description:'平台连接螺栓松动2处。', riskLevel:'B类', opinion:'对松动螺栓进行复紧，并检查紧固情况。'}
    ]},
    R5:{ province:'黑龙江省', city:'牡丹江市', siteName:'萧山02#塔', siteCode:'231084908000000170', longitude:'129.365734', latitude:'44.312051', taskCreatedAt:'2026-04-30 09:30', problems:[
      {id:'R5-P1', project:'螺栓缺失', description:'第三塔段主肢螺栓缺失2处。', riskLevel:'B类', opinion:'按照设计规格补齐缺失螺栓。'},
      {id:'R5-P2', project:'螺栓松动', description:'第四塔段辅材螺栓松动3处。', riskLevel:'', opinion:'对松动螺栓进行复紧。'}
    ]}
  };

  // 统一演示报告数据。统计页面可独立打开，不再依赖用户先访问“报告编制”页面。
  var seedReports = [
    { id:'R1', reportNo:'BG202605001', towerCode:'TT-BJ-001', towerName:'滨江01#塔', inspectType:'安全性鉴定', contractNo:'HT2026-001', inspector:'李明', compiler:'—', submitTime:'2026-05-10 09:00', inspectDate:'2026-05-04', status:'待编制', taskId:'RW202605001', rejectReason:'', auditStep:'', auditStatus:'未涉及', auditNode:'—', auditor:'—', auditAt:'—', declareFailed:false, extraSign:false, sourceNote:'检毕自动生成' },
    { id:'R2', reportNo:'BG202605002', towerCode:'TT-BJ-002', towerName:'滨江02#塔', inspectType:'常规检测', contractNo:'HT2026-002', inspector:'王强', compiler:'—', submitTime:'2026-05-09 14:20', inspectDate:'2026-05-05', status:'待编制', taskId:'RW202605002', rejectReason:'', auditStep:'', auditStatus:'未涉及', auditNode:'—', auditor:'—', auditAt:'—', declareFailed:true, declareFailReason:'监管平台申报失败：签名证书过期', extraSign:false, sourceNote:'检毕自动生成' },
    { id:'R3', reportNo:'BG202605003', towerCode:'TT-XH-001', towerName:'西湖01#塔', inspectType:'可靠性鉴定', contractNo:'HT2026-003', inspector:'张华', compiler:'李明', submitTime:'2026-05-08 16:30', inspectDate:'2026-05-06', status:'编制中', taskId:'RW202605003', rejectReason:'', auditStep:'', auditStatus:'未提交', auditNode:'未发起审核', auditor:'—', auditAt:'—', declareFailed:false, extraSign:false, sourceNote:'检毕自动生成' },
    { id:'R4', reportNo:'BG202605004', towerCode:'TT-YH-001', towerName:'余杭01#塔', inspectType:'安全性鉴定', contractNo:'HT2026-004', inspector:'赵六', compiler:'王强', submitTime:'2026-05-08 18:00', inspectDate:'2026-05-07', status:'已编制', taskId:'RW202605004', rejectReason:'', auditStep:'待技术部门主管审核', auditStatus:'审核中', auditNode:'待技术部门主管审核', auditor:'—', auditAt:'—', declareFailed:false, extraSign:true, sourceNote:'检毕自动生成' },
    { id:'R5', reportNo:'BG202605005', towerCode:'TT-XS-002', towerName:'萧山02#塔', inspectType:'常规检测', contractNo:'HT2026-005', inspector:'李明', compiler:'张华', submitTime:'2026-05-07 11:00', inspectDate:'2026-05-06', status:'已出报告', taskId:'RW202605005', rejectReason:'', auditStep:'已完成', auditStatus:'已通过', auditNode:'已完成', auditor:'李娜', auditAt:'2026-05-08 09:40', declareFailed:false, extraSign:false, sourceNote:'检毕自动生成' }
  ];

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch (_e) { return fallback; }
  }
  function load(key, fallback) { return safeParse(localStorage.getItem(key) || '', fallback); }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
  function nowText() {
    var d = new Date();
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function ensureOpinions() {
    var rows = load(KEYS.opinions, []);
    if (!rows.length) rows = save(KEYS.opinions, clone(seedOpinions));
    return rows;
  }
  function getOpinions() { return ensureOpinions(); }
  function saveOpinions(rows) { return save(KEYS.opinions, rows); }
  function standardOpinions(project) {
    return ensureOpinions().filter(function (row) { return row.enabled && row.project === project; });
  }
  function ensureReport(report) {
    var profile = reportProfiles[report.id] || {};
    Object.keys(profile).forEach(function (key) {
      if (report[key] === undefined || report[key] === null || report[key] === '') report[key] = clone(profile[key]);
    });
    if (!Array.isArray(report.problems)) report.problems = [];
    report.problems = report.problems.filter(function (row) { return String(row.description || '').trim(); });
    if (!report.rectification) report.rectification = { version:0, boundVersion:0, wpsState:'未绑定', updatedAt:'', rows:[] };
    if (!Array.isArray(report.rectification.rows)) report.rectification.rows = [];
    if (!report.rectification.rows.length && report.problems.length && report.problems.every(function (p) { return String(p.opinion || '').trim(); })) {
      report.rectification.rows = report.problems.map(function (p) { return { problemId:p.id, project:p.project, description:p.description, riskLevel:p.riskLevel || '', opinion:p.opinion }; });
      report.rectification.version = 1;
      report.rectification.boundVersion = (report.status === '已编制' || report.status === '已出报告') ? 1 : 0;
      report.rectification.wpsState = report.rectification.boundVersion ? '已绑定' : '未绑定';
      report.rectification.updatedAt = report.submitTime || '';
    }
    if (report.status === '已出报告' && report.auditStatus === '已通过' && (!report.auditApprovedAt || report.auditApprovedAt === '—')) {
      report.auditApprovedAt = report.auditAt && report.auditAt !== '—' ? report.auditAt : report.submitTime;
    }
    return report;
  }
  function ensureDemoReports() {
    var rows = load(KEYS.reports, []);
    if (!Array.isArray(rows) || !rows.length) rows = save(KEYS.reports, clone(seedReports));
    var changed = false;
    rows.forEach(function (r) {
      var before = JSON.stringify(r);
      ensureReport(r);
      if (before !== JSON.stringify(r)) changed = true;
    });
    if (changed) save(KEYS.reports, rows);
    return rows;
  }
  function getReports() { return ensureDemoReports(); }
  function saveReports(rows) { rows.forEach(ensureReport); return save(KEYS.reports, rows); }
  function isApprovalInProgress(report) {
    return report.status === '已编制' || ['待审核','审核中'].indexOf(report.auditStatus) >= 0;
  }
  function isApproved(report) { return report.status === '已出报告' && report.auditStatus === '已通过'; }
  function hasProblems(report) { return Array.isArray(report.problems) && report.problems.some(function (p) { return String(p.description || '').trim(); }); }
  function rectificationComplete(report) {
    if (!hasProblems(report)) return true;
    var rows = (report.rectification && report.rectification.rows) || [];
    return report.problems.every(function (p) {
      var row = rows.find(function (x) { return x.problemId === p.id; });
      return row && String(row.opinion || '').trim() && String(row.opinion || '').trim().length <= 100;
    });
  }
  function eligibleForSummary(report) {
    return isApproved(report) && hasProblems(report) && rectificationComplete(report);
  }
  function mergeProblemRows(report) {
    var saved = (report.rectification && report.rectification.rows) || [];
    return (report.problems || []).filter(function (p) { return String(p.description || '').trim(); }).map(function (p) {
      var old = saved.find(function (x) { return x.problemId === p.id; }) || {};
      return {
        problemId:p.id,
        project:p.project,
        description:p.description,
        riskLevel:old.riskLevel !== undefined ? old.riskLevel : (p.riskLevel || ''),
        opinion:old.opinion !== undefined ? old.opinion : (p.opinion || '')
      };
    });
  }
  function dateOnly(value) { return String(value || '').slice(0, 10); }
  function inRange(value, start, end) {
    var d = dateOnly(value);
    if (!d) return false;
    return (!start || d >= start) && (!end || d <= end);
  }
  function filterSummaryReports(filters) {
    filters = filters || {};
    return getReports().filter(function (r) {
      if (!eligibleForSummary(r)) return false;
      if (filters.province && r.province !== filters.province) return false;
      if (filters.city && r.city !== filters.city) return false;
      if ((filters.taskStart || filters.taskEnd) && !inRange(r.taskCreatedAt, filters.taskStart, filters.taskEnd)) return false;
      if ((filters.approvalStart || filters.approvalEnd) && !inRange(r.auditApprovedAt || r.auditAt, filters.approvalStart, filters.approvalEnd)) return false;
      return true;
    });
  }
  function csvCell(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'; }
  function downloadCsv(filename, headers, rows) {
    var text = '\uFEFF' + [headers].concat(rows).map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:'text/csv;charset=utf-8'}));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  global.RectificationStore = {
    keys:KEYS,
    projectNames:projectNames.slice(),
    nowText:nowText,
    getOpinions:getOpinions,
    saveOpinions:saveOpinions,
    standardOpinions:standardOpinions,
    ensureReport:ensureReport,
    getReports:getReports,
    ensureDemoReports:ensureDemoReports,
    saveReports:saveReports,
    isApprovalInProgress:isApprovalInProgress,
    isApproved:isApproved,
    hasProblems:hasProblems,
    rectificationComplete:rectificationComplete,
    eligibleForSummary:eligibleForSummary,
    mergeProblemRows:mergeProblemRows,
    filterSummaryReports:filterSummaryReports,
    downloadCsv:downloadCsv,
    saveSummaryState:function (state) { save(KEYS.summaryState, state); },
    getSummaryState:function () { return load(KEYS.summaryState, {}); }
  };
})(window);
