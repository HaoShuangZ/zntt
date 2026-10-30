(function (global) {
  'use strict';

  var KEYS = {
    orders: 'towerAppOrdersV11',
    tasks: 'towerAppOrderTasksV11',
    permissions: 'towerAppPermissionsV11',
    listState: 'towerAppOrderListStateV11',
    flash: 'towerAppOrderFlashV11'
  };

  var seedOrders = [
    {
      orderId: 'order-001', orderCode: 'ZJHC20260505001', orderName: '城西改造项目检测',
      stationName: '城西03#角钢塔站', siteCode: 'ZZ-HZ-CX03', projectId: 'project-cx',
      projectName: '城西区域改造项目', contractCode: 'DX2026-0428', contractName: '城西改造专项检测分包',
      customerShort: '杭州铁塔', province: '浙江省', city: '杭州市', longitude: '120.0891', latitude: '30.2955',
      inspectionType: '可靠性鉴定', standardGroup: '存量铁塔-角钢格构附表套件', requirements: '重点检查连接节点与塔身构件。',
      dispatchDate: '2026-05-05', deadlineDate: '2026-05-20', createdAt: '2026-05-05 09:18',
      status: 'assigned', draft: false, approved: true, urged: true, assignedTo: '李明', taskId: 'task-order-001'
    },
    {
      orderId: 'order-002', orderCode: 'ZJHYH20260503002', orderName: '余杭5G升级检测',
      stationName: '余杭5G升级站', siteCode: 'ZZ-YH-12', projectId: 'project-yh',
      projectName: '余杭5G升级项目', contractCode: 'DX2026-0516', contractName: '余杭5G升级检测服务',
      customerShort: '杭州移动', province: '浙江省', city: '杭州市', longitude: '119.9780', latitude: '30.4211',
      inspectionType: '安全性鉴定', standardGroup: '存量铁塔-单管类附表套件', requirements: '完成塔体、基础及附属设施检查。',
      dispatchDate: '2026-05-03', deadlineDate: '2026-05-15', createdAt: '2026-05-03 11:26',
      status: 'assigned', draft: false, approved: true, urged: true, assignedTo: '王强', taskId: 'task-order-002'
    },
    {
      orderId: 'order-003', orderCode: 'ZJZN20260508003', orderName: '滨江年检批次二',
      stationName: '滨江年检站', siteCode: 'ZZ-HZ-BJ02', projectId: 'project-bj',
      projectName: '2026年杭州铁塔年检工程', contractCode: 'DX2026-0512', contractName: '杭州铁塔年度检测框架',
      customerShort: '杭州铁塔', province: '浙江省', city: '杭州市', longitude: '120.2126', latitude: '30.2084',
      inspectionType: '年度例行检测', standardGroup: '存量铁塔-单管类附表套件', requirements: '年度常规检查。',
      dispatchDate: '', deadlineDate: '2026-06-01', createdAt: '2026-05-08 14:06',
      status: 'pending', draft: false, approved: true, urged: false, assignedTo: '', taskId: ''
    }
  ];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key));
      return value === null || value === undefined ? clone(fallback) : value;
    } catch (e) { return clone(fallback); }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }
  function ensure() {
    if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, seedOrders);
    if (!localStorage.getItem(KEYS.tasks)) {
      write(KEYS.tasks, seedOrders.filter(function (o) { return o.taskId; }).map(function (o) {
        return { taskId: o.taskId, orderId: o.orderId, orderCode: o.orderCode, orderName: o.orderName, stationName: o.stationName, assignee: o.assignedTo, createdAt: o.createdAt, status: 'pending' };
      }));
    }
  }
  function getPermissions() {
    var defaults = { canViewOrders: true, canCreateOrder: true, canAssignOrder: true };
    var saved = read(KEYS.permissions, defaults);
    var params = new URLSearchParams(location.search);
    var role = params.get('demoRole');
    if (role === 'no-orders') return { canViewOrders: false, canCreateOrder: false, canAssignOrder: false };
    if (role === 'view-only') return { canViewOrders: true, canCreateOrder: false, canAssignOrder: false };
    return Object.assign(defaults, saved || {});
  }
  function getOrders() { ensure(); return read(KEYS.orders, seedOrders); }
  function saveOrders(orders) { return write(KEYS.orders, orders); }
  function getOrder(id) { return getOrders().find(function (o) { return o.orderId === id || o.orderCode === id; }) || null; }
  function saveOrder(order) {
    var orders = getOrders();
    var index = orders.findIndex(function (item) { return item.orderId === order.orderId; });
    if (index >= 0) orders[index] = order; else orders.unshift(order);
    saveOrders(orders);
    return order;
  }
  function getTasks() { ensure(); return read(KEYS.tasks, []); }
  function assign(orderId, assignee) {
    var permissions = getPermissions();
    if (!permissions.canAssignOrder) return { ok: false, message: '当前角色没有订单指派权限。' };
    var orders = getOrders();
    var order = orders.find(function (item) { return item.orderId === orderId; });
    if (!order) return { ok: false, message: '未找到订单。' };
    if (order.draft || !order.approved || order.status !== 'pending') return { ok: false, message: '订单草稿或未达到既有派单门槛，暂不能指派。' };
    var tasks = getTasks();
    var task = tasks.find(function (item) { return item.orderId === orderId; });
    if (!task) {
      task = { taskId: 'task-' + orderId, orderId: orderId, orderCode: order.orderCode, orderName: order.orderName, stationName: order.stationName || '—', assignee: assignee, createdAt: nowText(), status: 'pending' };
      tasks.unshift(task);
      write(KEYS.tasks, tasks);
    } else {
      task.assignee = assignee;
      write(KEYS.tasks, tasks);
    }
    order.status = 'assigned';
    order.assignedTo = assignee;
    order.taskId = task.taskId;
    if (!order.dispatchDate) order.dispatchDate = todayText();
    saveOrders(orders);
    return { ok: true, order: order, task: task, duplicatePrevented: tasks.filter(function (item) { return item.orderId === orderId; }).length === 1 };
  }
  function todayText() {
    var d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function nowText() {
    var d = new Date();
    return todayText() + ' ' + [String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0')].join(':');
  }
  function createId() { return 'order-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function createDemoCode(projectCode, dispatchDate) {
    var date = (dispatchDate || todayText()).replace(/-/g, '');
    if (projectCode) return projectCode + date + String((getOrders().length + 1) % 1000).padStart(3, '0');
    return 'DEMO' + date + String(Date.now()).slice(-3);
  }
  function statusMeta(order) {
    if (order.draft || order.status === 'draft') return { text: '草稿', cls: 'is-draft' };
    if (order.status === 'assigned') return { text: '已派单', cls: 'is-assigned' };
    if (order.status === 'completed') return { text: '已完成', cls: 'is-completed' };
    return { text: '待派单', cls: 'is-pending' };
  }
  function sortedOrders(orders) {
    return orders.slice().sort(function (a, b) {
      if (!!a.urged !== !!b.urged) return a.urged ? -1 : 1;
      if (!!a.dispatchDate !== !!b.dispatchDate) return a.dispatchDate ? -1 : 1;
      if (a.dispatchDate !== b.dispatchDate) return String(b.dispatchDate || '').localeCompare(String(a.dispatchDate || ''));
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }
  function setListState(state) { write(KEYS.listState, state); }
  function getListState() { return read(KEYS.listState, { keyword: '', status: 'all', scrollTop: 0 }); }
  function setFlash(data) { write(KEYS.flash, data); }
  function popFlash() { var value = read(KEYS.flash, null); localStorage.removeItem(KEYS.flash); return value; }

  ensure();
  global.OrderV11 = {
    KEYS: KEYS, getPermissions: getPermissions, getOrders: getOrders, getOrder: getOrder, saveOrder: saveOrder,
    getTasks: getTasks, assign: assign, createId: createId, createDemoCode: createDemoCode, statusMeta: statusMeta,
    sortedOrders: sortedOrders, nowText: nowText, setListState: setListState, getListState: getListState,
    setFlash: setFlash, popFlash: popFlash
  };
})(window);
