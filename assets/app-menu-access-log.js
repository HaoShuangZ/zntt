/**
 * 记录用户进入各「大菜单」的时间（sessionStorage，本会话内有效）。
 * window.__logMenuAccess('工作台' | '检测' | '我的' | '订单入口' | '流程中心')
 */
(function (g) {
  var KEY = 'tower_app_menu_access_log';
  var MAX = 80;
  function logMenu(name) {
    if (!name) return;
    try {
      var raw = sessionStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
      arr.unshift({ t: Date.now(), menu: String(name) });
      if (arr.length > MAX) arr.length = MAX;
      sessionStorage.setItem(KEY, JSON.stringify(arr));
    } catch (e) {}
  }
  g.__logMenuAccess = logMenu;
})(typeof window !== 'undefined' ? window : this);
