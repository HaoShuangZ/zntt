const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../pages/iPad端/个人中心');
const D = 'di' + 'v';

function head(title, backHref, navRight, assetPrefix) {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="ipad-profile-html">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>${title}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="${assetPrefix}/app-frame.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-tokens.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-frame.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-layout.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-visual.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-embed.css">
<link rel="stylesheet" href="${assetPrefix}/ipad-profile-shell.css">
<script src="${assetPrefix}/ipad-adapt.js" defer></script>
</head>
<body class="ipad-adapt ipad-profile-page">
<${D} class="page-status" aria-hidden="true"><span>9:41</span><span class="icons"><i class="fa-solid fa-signal"></i> <i class="fa-solid fa-wifi"></i> <i class="fa-solid fa-battery-full"></i></span></${D}>
<${D} class="page-nav">
  <a class="nav-back" href="${backHref}"><i class="fa-solid fa-chevron-left"></i> 返回</a>
  <h1 class="nav-title">${title}</h1>
  ${navRight}
</${D}>
`;
}

function write(rel, body) {
  fs.writeFileSync(path.join(root, rel), body, 'utf8');
}

const back = '首页/ipad_profile_index.html';
const ap = '../../../assets';

write(
  'ipad_profile_personnel_detail.html',
  head('个人信息', back, '<span class="nav-spacer" aria-hidden="true"></span>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner">
<p class="page-hint">以下数据来自「基础数据 · 检测单位」中本单位的人员主数据，<strong>只读展示</strong>。</p>
<${D} class="detail-grid">
<section class="detail-sec"><h2>人员档案</h2><${D} class="info-grid">
<${D} class="info-cell"><span class="info-label">姓名</span><span class="info-value">李明</span></${D}>
<${D} class="info-cell"><span class="info-label">工号</span><span class="info-value">ZN-JC-01023</span></${D}>
<${D} class="info-cell"><span class="info-label">手机号</span><span class="info-value">138****5678</span></${D}>
<${D} class="info-cell span-2"><span class="info-label">所属检测单位</span><span class="info-value">浙江中能工程检测有限公司</span></${D}>
<${D} class="info-cell"><span class="info-label">单位编码</span><span class="info-value">ORG-ZN-001</span></${D}>
<${D} class="info-cell"><span class="info-label">检测组</span><span class="info-value">检测一组</span></${D}>
<${D} class="info-cell"><span class="info-label">岗位</span><span class="info-value">检测工程师</span></${D}>
<${D} class="info-cell"><span class="info-label">是否组负责人</span><span class="info-value">否</span></${D}>
<${D} class="info-cell"><span class="info-label">账号状态</span><span class="info-value ok">正常</span></${D}>
</${D}></section>
<section class="detail-sec"><h2>资质与证书</h2><${D} class="info-grid">
<${D} class="info-cell span-2"><span class="info-label">上岗证编号</span><span class="info-value">TT-JC-2024-0156</span></${D}>
<${D} class="info-cell"><span class="info-label">有效期至</span><span class="info-value">2027-12-31</span></${D}>
<${D} class="info-cell"><span class="info-label">无损检测资格</span><span class="info-value">UT Ⅱ级</span></${D}>
<${D} class="info-cell span-2"><span class="info-label">登高作业证</span><span class="info-value">已备案</span></${D}>
</${D}></section>
<section class="detail-sec"><h2>联系信息</h2><${D} class="info-grid">
<${D} class="info-cell"><span class="info-label">企业邮箱</span><span class="info-value">liming@znjc.cn</span></${D}>
<${D} class="info-cell"><span class="info-label">办公电话</span><span class="info-value">0571-8888****</span></${D}>
</${D}></section>
</${D}></${D}></main></body></html>`
);

const flowCard = (badge, badgeClass, time, title, meta, extra) => `
<article class="flow-card">
  <${D} class="flow-card-head"><span class="badge ${badgeClass}">${badge}</span><span class="flow-time">${time}</span></${D}>
  <${D} class="flow-title">${title}</${D}>
  ${meta}
  ${extra || ''}
  <${D} class="flow-actions"><button type="button" class="btn-sm">查看</button><button type="button" class="btn-sm-primary">办理</button></${D}>
</article>`;

write(
  'ipad_profile_flow.html',
  head('流程中心', back, '<span class="nav-spacer" aria-hidden="true"></span>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner">
<p class="page-hint">展示当前账号<strong>待审批</strong>事项。</p>
<${D} class="card-grid">` +
    flowCard(
      '检测报告审核',
      'badge-warn',
      '2026-05-12 10:20',
      '滨江区单管塔年度检测报告 V1',
      '<p class="flow-meta">发起人：<b>张华（检测三组）</b></p><p class="flow-meta">关联订单：<b>DD20260506001</b></p>'
    ) +
    flowCard(
      '检测数据复核',
      'badge-blue',
      '2026-05-11 16:05',
      '城西区铁塔专项 · 数据提交',
      '<p class="flow-meta">发起人：<b>李某某</b></p><p class="flow-meta">关联任务：<b>RW202606004</b></p>'
    ) +
    flowCard(
      '改派申请',
      'badge-purple',
      '2026-05-10 09:00',
      '余杭季度巡检 · 检测人员改派',
      '<p class="flow-meta">发起人：<b>营销部 · 王芳</b></p>'
    ) +
    `</${D}></${D}></main>
<script>document.addEventListener('DOMContentLoaded',function(){if(typeof __logMenuAccess==='function')__logMenuAccess('流程中心');});</script>
<script src="${ap}/app-menu-access-log.js"></script></body></html>`
);

write(
  'ipad_profile_ops_log.html',
  head('操作记录', back, '<span class="nav-spacer" aria-hidden="true"></span>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner"><${D} id="list"></${D}></${D}></main>
<script src="${ap}/app-menu-access-log.js"></script>
<script>
(function(){
  var KEY='tower_app_menu_access_log';
  var wrap=document.getElementById('list');
  var rows=[];try{rows=JSON.parse(sessionStorage.getItem(KEY)||'[]');}catch(e){}
  if(!rows.length){wrap.innerHTML='<${D} class="log-empty">暂无访问记录<br><span style="font-size:12px">切换底部「工作台 / 检测 / 我的」或进入订单、流程中心后将在此显示。</span></${D}>';return;}
  function fmt(ts){var d=new Date(ts);if(isNaN(d.getTime()))return'—';var p=function(n){return n<10?'0'+n:''+n;};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());}
  wrap.innerHTML='<${D} class="log-table">'+rows.map(function(r){
    var m=String(r.menu||'—').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    return '<${D} class="log-row"><span class="log-menu">'+m+'</span><span class="log-time">'+fmt(r.t)+'</span></${D}>';
  }).join('')+'</${D}>';
})();
</script></body></html>`
);

const orderCard = (id, tag, tagClass, name, rows) => `
<article class="order-card">
  <${D} class="order-card-head"><span class="order-id">${id}</span><span class="tag ${tagClass}">${tag}</span></${D}>
  <${D} class="order-name">${name}</${D}>
  ${rows}
  <${D} class="order-foot"><button type="button">查看</button></${D}>
</article>`;

const orow = (k, v) => `<${D} class="order-row"><span>${k}</span><strong>${v}</strong></${D}>`;

write(
  'ipad_profile_orders.html',
  head('订单管理', back, '<a class="nav-action" href="ipad_profile_order_create.html"><i class="fa-solid fa-plus"></i> 新增</a>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner">
<p class="page-hint">已催办订单置顶，其余按派单时间倒序。</p>
<${D} class="filter-bar">
  <input type="text" placeholder="订单名称/编号">
  <select><option>全部状态</option><option>待派单</option><option>已派单</option><option>已完成</option></select>
  <button type="button" class="btn-search"><i class="fa-solid fa-magnifying-glass"></i> 查询</button>
</${D}>
<${D} class="card-grid">` +
    orderCard(
      'ZJHC20260505001',
      '已催办',
      'tag-orange',
      '城西改造项目检',
      orow('站址编码', 'ZZ-HZ-CX03') +
        orow('关联工程', '城西区域改造项目') +
        orow('检测单位', '华东某外协检测') +
        orow('检测类型', '可靠性鉴定') +
        orow('状态', '<span class="tag tag-blue">已派</span>') +
        orow('派单 / 截止', '2026-05-05 · 2026-05-20') +
        orow('是否过期', '<span class="tag tag-green">正常</span>') +
        orow('检测人', '李明')
    ) +
    orderCard(
      'ZJHYH20260503002',
      '已催办',
      'tag-orange',
      '余杭5G升级检测',
      orow('站址编码', 'ZZ-YH-12') +
        orow('关联工程', '余杭5G升级项目') +
        orow('检测单位', '浙江中能检测') +
        orow('检测类型', '安全性鉴定') +
        orow('状态', '<span class="tag tag-blue">已派</span>') +
        orow('派单 / 截止', '2026-05-03 · 2026-05-15') +
        orow('是否过期', '<span class="tag tag-orange">即将过期</span>') +
        orow('检测人', '王强')
    ) +
    orderCard(
      'ZJZN20260508003',
      '未催办',
      'tag-gray',
      '滨江年检批次二',
      orow('站址编码', 'ZZ-HZ-BJ02') +
        orow('关联工程', '2026年杭州铁塔年检工程') +
        orow('检测单位', '浙江中能检测') +
        orow('检测类型', '年度例行检测') +
        orow('状态', '<span class="tag tag-orange" style="background:#fff7e8;color:#ff7d00">待派</span>') +
        orow('派单 / 截止', '— · 2026-06-01') +
        orow('检测人', '—')
    ) +
    `</${D}></${D}></main>
<script src="${ap}/app-menu-access-log.js"></script>
<script>document.addEventListener('DOMContentLoaded',function(){if(typeof __logMenuAccess==='function')__logMenuAccess('订单入口');});</script>
</body></html>`
);

write(
  'ipad_profile_password.html',
  head('修改密码', back, '<span class="nav-spacer" aria-hidden="true"></span>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner">
<${D} class="form-sec">
  <${D} class="form-fld"><label for="pwdOld">当前密码</label><input id="pwdOld" type="password" autocomplete="current-password" placeholder="请输入当前密码"></${D}>
  <${D} class="form-fld"><label for="pwdNew">新密码</label><input id="pwdNew" type="password" autocomplete="new-password" placeholder="8～20 位，含字母与数字"></${D}>
  <${D} class="form-fld"><label for="pwdConfirm">确认新密码</label><input id="pwdConfirm" type="password" autocomplete="new-password" placeholder="再次输入新密码"></${D}>
</${D}>
</${D}></main>
<${D} class="profile-footer">
  <button type="button" class="btn-ghost" onclick="history.back()">取消</button>
  <button type="button" class="btn-primary" id="btnSavePwd">保存</button>
</${D}>
<script>document.getElementById('btnSavePwd').addEventListener('click',function(){alert('密码已更新（原型演示）');});</script>
</body></html>`
);

write(
  'ipad_profile_about.html',
  head('关于系统', back, '<span class="nav-spacer" aria-hidden="true"></span>', ap) +
    `<main class="sub-scroll"><${D} class="sub-inner">
<${D} class="about-card">
  <${D} class="about-logo"><i class="fa-solid fa-tower-broadcast"></i></${D}>
  <${D} class="about-name">铁塔检测移动端</${D}>
  <${D} class="about-ver">版本 2.1.0 · 构建 20260516</${D}>
  <${D} class="about-desc">
    <p>本系统用于铁塔现场检测任务的派单、填报、校验与数据同步。</p>
    <p style="margin-top:10px">技术支持：浙江中能工程检测有限公司 · 信息化部</p>
    <p style="margin-top:10px;color:#86909c;font-size:12px">© 2026 Tower Inspect Prototype</p>
  </${D}>
</${D}>
</${D}></main></body></html>`
);

console.log('done');
