/**

 * 统一底部工作栏：工作台 / 检测 / 我的

 */

(function () {

  var TAB_META = [

    { key: 'workbench', label: '工作台', icon: 'fa-house', path: '工作台/首页/ipad_workbench_index.html' },

    { key: 'inspect', label: '检测', icon: 'fa-tower-broadcast', path: '检测/ipad_detect_entry.html' },

    { key: 'mine', label: '我的', icon: 'fa-user', path: '个人中心/首页/ipad_profile_index.html' }

  ];



  function decodePath(p) {

    var s = (p || '').replace(/\\/g, '/');

    try {

      s = decodeURI(s);

    } catch (e) {}

    return s;

  }



  function findIpadRootIndex(parts) {

    for (var j = 0; j < parts.length; j++) {

      var seg = parts[j];

      try {

        seg = decodeURIComponent(seg);

      } catch (e) {}

      if (seg === 'iPad端') return j;

    }

    return -1;

  }



  /** 由 ipad-adapt.js 的相对路径推算回到 iPad端 目录的前缀 */

  function relPrefixFromAdaptScript() {

    var s = document.querySelector('script[src*="ipad-adapt.js"]');

    if (!s) return null;

    var src = (s.getAttribute('src') || '').split('?')[0];

    if (!src || /^(https?:|\/\/)/i.test(src)) return null;

    var m = src.match(/^((?:\.\.\/)+)assets\//i);

    if (!m) return null;

    var scriptUp = (m[1].match(/\.\.\//g) || []).length;

    /* pages/iPad端/.../file.html → assets 为 ../../../../；回到 iPad端 少 2 级 */

    var depth = scriptUp - 2;

    if (depth > 0) {

      var out = [];

      for (var k = 0; k < depth; k++) out.push('..');

      return out.join('/') + '/';

    }

    return '';

  }



  function relPrefix() {

    var body = document.body;

    if (body) {

      var forced = body.getAttribute('data-ipad-nav-prefix');

      if (forced != null) return forced;

    }



    var fromScript = relPrefixFromAdaptScript();

    if (fromScript != null) return fromScript;



    var parts = decodePath(location.pathname || '').split('/');

    var i = findIpadRootIndex(parts);

    if (i < 0) return '';

    var depth = parts.length - i - 2;

    if (depth <= 0) return '';

    var out = [];

    for (var k = 0; k < depth; k++) out.push('..');

    return out.join('/') + '/';

  }



  function detectActiveTab() {

    var p = decodePath(location.pathname || '');

    var forced = document.body && document.body.getAttribute('data-ipad-tab-active');

    if (forced === 'workbench' || forced === 'inspect' || forced === 'mine') return forced;

    if (/个人中心|profile/i.test(p)) return 'mine';

    if (

      /\/检测\//.test(p) ||

      /\/任务\//.test(p) ||

      /ipad_inspect|ipad_detect|task_inspect|inspect_shell|inspect_index/i.test(p)

    ) {

      return 'inspect';

    }

    if (/工作台|workbench|message_center/i.test(p)) return 'workbench';

    return 'workbench';

  }



  function buildNav(active) {

    var prefix = relPrefix();

    var nav = document.createElement('nav');

    nav.id = 'ipadMainTabBar';

    nav.className = 'ipad-main-tabbar ipad-global-tabbar';

    nav.setAttribute('aria-label', '主导航');

    TAB_META.forEach(function (tab) {

      var a = document.createElement('a');

      a.href = prefix + tab.path;

      var isActive = tab.key === active;

      if (isActive) {

        a.className = 'is-active';

        a.setAttribute('aria-current', 'page');

      }

      a.innerHTML =

        '<i class="fa-solid ' +

        tab.icon +

        '" aria-hidden="true"></i><span>' +

        tab.label +

        '</span>';

      nav.appendChild(a);

    });

    return nav;

  }



  function upgradeExisting(nav, active) {

    nav.id = nav.id || 'ipadMainTabBar';

    nav.classList.add('ipad-main-tabbar', 'ipad-global-tabbar');

    nav.setAttribute('aria-label', '主导航');

    var links = nav.querySelectorAll('a');

    if (links.length < 3) return nav;

    var prefix = relPrefix();

    links.forEach(function (a, idx) {

      var tab = TAB_META[idx];

      if (!tab) return;

      a.href = prefix + tab.path;

      a.classList.remove('active', 'is-active');

      a.removeAttribute('aria-current');

      if (tab.key === active) {

        a.classList.add('is-active');

        a.setAttribute('aria-current', 'page');

      }

      var icon = a.querySelector('i');

      if (icon) icon.className = 'fa-solid ' + tab.icon;

      var text = a.querySelector('span');

      if (!text) {

        var label = (a.textContent || '').trim();

        a.textContent = '';

        if (icon) a.appendChild(icon);

        text = document.createElement('span');

        text.textContent = label || tab.label;

        a.appendChild(text);

      } else {

        text.textContent = tab.label;

      }

    });

    return nav;

  }



  function findExisting() {

    return (

      document.getElementById('ipadMainTabBar') ||

      document.querySelector('.ipad-main-tabbar') ||

      document.querySelector('.profile-tabbar') ||

      document.getElementById('ipadGlobalTabBar') ||

      document.querySelector('.ipad-global-tabbar')

    );

  }



  function run() {
    /* 主流程已移除底部「工作台 / 检测 / 我的」Tab，入口改由顶栏头像进入个人中心 */
    return;

    var body = document.body;

    if (!body || !body.classList.contains('ipad-adapt')) return;

    if (body.classList.contains('ipad-login-page')) return;

    if (body.getAttribute('data-ipad-main-tabbar') === 'off') return;



    var active = detectActiveTab();

    var nav = findExisting();

    if (!nav && body.getAttribute('data-ipad-main-tabbar') !== 'auto') return;



    if (nav) {

      nav = upgradeExisting(nav, active);

    } else {

      nav = buildNav(active);

      body.appendChild(nav);

    }



    body.classList.add('ipad-has-tabbar');

  }



  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', run);

  } else {

    run();

  }

})();


