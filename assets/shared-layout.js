/**
 * 通信铁塔检测系统 — PC端共享布局
 * 包含：侧边栏菜单、顶部导航栏、页面框架
 */
const MENU = [
  { id:'grzx', label:'个人中心', icon:'fa-user', items:[
    {id:'profile', label:'我的信息', href:'../../个人中心/我的信息/pc_profile.html'},
    {id:'messages', label:'消息中心', href:'../../个人中心/消息中心/pc_messages.html'},
    {id:'logs', label:'登录日志', href:'../../个人中心/登录日志/pc_logs.html'},
  ]},
  { id:'htgl', label:'合同管理', icon:'fa-file-signature', items:[
    {id:'contract_list', label:'对上合同', href:'../../合同管理/合同列表/pc_contract_list.html'},
    {id:'contract_downstream', label:'对下合同', href:'../../合同管理/对下合同/pc_contract_downstream_list.html'},
    {id:'contract_receipt', label:'对上收款', href:'../../合同管理/合同收款/pc_contract_receipt.html'},
    {id:'contract_payment', label:'对下付款', href:'../../合同管理/合同付款/pc_contract_payment.html'},
    {id:'invoice_manage', label:'开票管理', href:'../../合同管理/开票管理/pc_invoice_manage.html'},
  ]},
  { id:'yxgl', label:'营销管理', icon:'fa-handshake', items:[
    {id:'customer_list', label:'客户管理', href:'../../营销管理/客户管理/pc_customer_list.html'},
    {id:'project_list', label:'工程管理', href:'../../营销管理/工程管理/pc_project_list.html'},
    {id:'order_list', label:'订单管理', href:'../../合同部管理/订单管理/pc_order_list.html'},
  ]},
  { id:'jcyw', label:'检测管理', icon:'fa-tower-broadcast', items:[
    {id:'task_list', label:'检测任务', href:'../../铁塔检测业务/检测任务/pc_task_list.html'},
    {id:'report_generate', label:'报告编制', href:'../../铁塔检测业务/报告编制/report-list.html'},
  ]},
  { id:'tjfx', label:'统计分析', icon:'fa-chart-column', items:[
    {id:'order_stats', label:'订单统计', href:'../../统计分析/订单统计/pc_order_stats.html'},
    {id:'order_reports', label:'报告查询', href:'../../合同部管理/报告查阅/pc_order_reports.html'},
  ]},
  { id:'ttjcpz', label:'模板配置', icon:'fa-sliders', items:[
    {id:'inspect_template_list', label:'检测模板', href:'../../模板配置/检测模板/pc_inspect_template_list.html'},
    {id:'message_template_list', label:'消息模板', href:'../../消息模板配置/消息模板管理/pc_message_template_list.html'},
  ]},
  { id:'jcsj', label:'基础数据', icon:'fa-database', items:[
    {id:'data_inspection_unit', label:'检测单位', href:'../../基础数据/检测单位/pc_data_inspection_unit.html'},
    {id:'data_device', label:'设备管理', href:'../../基础数据/设备管理/pc_data_device_list.html'},
    {id:'data_tower_type', label:'铁塔类型', href:'../../基础数据/铁塔类型/pc_data_tower_type.html'},
    {id:'data_wind', label:'区域风压', href:'../../基础数据/区域风压/pc_data_wind.html'},
    {id:'data_standard', label:'标准规范', href:'../../基础数据/标准规范/pc_data_standard.html'},
    {id:'data_standard_group', label:'规范组', href:'../../基础数据/规范组/pc_data_standard_group.html'},
    {id:'data_device_type', label:'设备类型', href:'../../基础数据/设备类型/pc_data_device_type.html'},
    {id:'data_inspect_type', label:'检测类型', href:'../../基础数据/检测类型/pc_data_inspect_type.html'},
    {id:'data_segment_style', label:'塔段样式信息', href:'../../基础数据/塔段样式管理/pc_data_segment_style.html'},
  ]},
  { id:'xtgl', label:'系统管理', icon:'fa-gear', items:[
    {id:'system_users', label:'用户管理', href:'../../系统管理/用户管理/pc_system_users.html'},
    {id:'system_roles', label:'角色管理', href:'../../系统管理/角色管理/pc_system_roles.html'},
    {id:'system_logs', label:'操作日志', href:'../../系统管理/操作日志/pc_system_logs.html'},
  ]},
];

function flattenMenuItems(items) {
  const out = [];
  for (const item of items) {
    if (item.children) out.push.apply(out, item.children);
    else out.push(item);
  }
  return out;
}

function menuGroupHasActive(group, activeId) {
  return flattenMenuItems(group.items).some(function (i) { return i.id === activeId; });
}

function buildSidebar(activeId) {
  let html = `<div class="layout-sidebar" id="sidebar">
  <div class="sidebar-logo">
    <i class="fa-solid fa-tower-broadcast"></i>
    <span class="logo-text">铁塔检测系统</span>
  </div>
  <nav class="sidebar-nav">`;
  for (const g of MENU) {
    const hasActive = menuGroupHasActive(g, activeId);
    html += `<div class="menu-group${hasActive ? ' open' : ''}">
      <div class="menu-group-title" onclick="this.parentElement.classList.toggle('open')">
        <span><i class="fa-solid ${g.icon} group-icon"></i>${g.label}</span>
        <i class="fa-solid fa-chevron-right chevron"></i>
      </div>
      <div class="menu-group-items">`;
    for (const item of g.items) {
      if (item.children) {
        const subActive = item.children.some(function (c) { return c.id === activeId; });
        html += `<div class="menu-submenu${subActive ? ' open' : ''}">
          <div class="menu-submenu-title" onclick="event.stopPropagation();this.parentElement.classList.toggle('open')">
            <span>${item.label}</span>
            <i class="fa-solid fa-chevron-right chevron"></i>
          </div>
          <div class="menu-submenu-items">`;
        for (const child of item.children) {
          html += `<a class="menu-item menu-item-nested${child.id === activeId ? ' active' : ''}" href="${child.href}">${child.label}</a>`;
        }
        html += `</div></div>`;
      } else {
        html += `<a class="menu-item${item.id === activeId ? ' active' : ''}" href="${item.href}">${item.label}</a>`;
      }
    }
    html += `</div></div>`;
  }
  html += `</nav>
  <div style="padding:12px 20px;border-top:1px solid rgba(255,255,255,0.08)">
    <a href="../../系统管理/登录页/pc_login.html" style="color:rgba(255,255,255,0.45);font-size:12px;text-decoration:none;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-right-from-bracket"></i>退出登录</a>
  </div></div>`;
  return html;
}

function buildTopNav(breadcrumbArr, userName) {
  userName = userName || '张伟';
  let bc = '<div class="breadcrumb"><a href="../../铁塔检测业务/检测任务/pc_task_list.html"><i class="fa-solid fa-house" style="font-size:13px"></i></a>';
  if (breadcrumbArr && breadcrumbArr.length) {
    for (let i = 0; i < breadcrumbArr.length; i++) {
      bc += '<span class="bc-sep">/</span>';
      if (i === breadcrumbArr.length - 1) {
        bc += `<span class="bc-current">${breadcrumbArr[i]}</span>`;
      } else {
        bc += `<span>${breadcrumbArr[i]}</span>`;
      }
    }
  }
  bc += '</div>';
  return `<div class="top-nav">
    ${bc}
    <div class="top-nav-right">
      <a href="../../个人中心/消息中心/pc_messages.html" class="nav-icon"><i class="fa-regular fa-bell"></i><span class="badge"></span></a>
      <div class="user-info">
        <img class="user-avatar" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80" alt="">
        <span>${userName}</span>
      </div>
    </div>
  </div>`;
}

function initLayout(config) {
  const content = document.getElementById('page-content');
  if (!content) return;
  if (config && config.skipLayout) return;
  // 嵌入模式（在父页 iframe 中渲染）：跳过侧边栏/顶部导航，只显示页面内容
  try {
    var sp = new URLSearchParams(window.location.search);
    if (sp.get('embed') === '1') {
      document.documentElement.classList.add('pc-embed');
      document.body.classList.add('pc-embed');
      return;
    }
  } catch (_e) {}
  const bc = config.breadcrumb || [];
  // 先整体移出 #page-content，再清空 body，避免用 innerHTML 序列化/重插导致页内脚本已绑定的监听器全部失效
  content.remove();
  document.body.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'layout-wrap';
  wrap.innerHTML = buildSidebar(config.active || '') +
    `<div class="layout-main">` +
    buildTopNav(bc, config.user) +
    `<div class="page-content"></div></div>`;
  document.body.appendChild(wrap);
  const main = wrap.querySelector('.layout-main');
  let slot = main && main.querySelector('.page-content');
  if (!slot && main) {
    slot = document.createElement('div');
    slot.className = 'page-content';
    main.appendChild(slot);
  }
  if (slot) {
    slot.appendChild(content);
  } else {
    console.error('[prototype] initLayout: 未找到 .layout-main，已将 #page-content 挂到 layout-wrap');
    wrap.appendChild(content);
  }
}

function loadPcListDelete() {
  if (window.__pcListDeleteLoaded) return;
  window.__pcListDeleteLoaded = true;
  var scripts = document.getElementsByTagName('script');
  var base = '';
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute('src') || '';
    if (src.indexOf('shared-layout.js') >= 0) {
      base = src.replace(/shared-layout\.js.*$/, 'pc-list-delete.js');
      break;
    }
  }
  if (!base) return;
  var s = document.createElement('script');
  s.src = base;
  s.async = false;
  document.head.appendChild(s);
}

window.addEventListener('DOMContentLoaded', function () {
  try {
    if (window.__layoutConfig) initLayout(window.__layoutConfig);
  } catch (e) {
    console.error('[prototype] initLayout', e);
  }
  loadPcListDelete();
  var boot = window.__prototypePageInit;
  if (typeof boot === 'function') {
    window.__prototypePageInit = undefined;
    try {
      boot();
    } catch (e) {
      console.error('[prototype] __prototypePageInit', e);
    }
  }
});