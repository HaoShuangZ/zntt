/**
 * 检测子页「返回」：优先回到进入来源（history / iframe），否则回检测填报主页并带上 order、embed。
 * 页面内为返回链接设置 data-app-inspect-back，href 为相对「填报主页」的路径（与页面深度一致）。
 *
 * 同文件：含 #appNavBar + data-app-inspect-back 的检测子页仅整理顶栏布局（返回左 / 标题中），
 * 不再注入「备忘录」「拍照」；底栏 [data-app-flow-footer] 保持页面原有「下一步」全宽展示。
 * iPad 填报主页 iframe（?embed=1）：子页不改顶栏结构。
 */
(function () {
  /** 检测录入子页：不再注入模块级「备忘录」「拍照」 */
  var ENABLE_MODULE_MEMO_PHOTO = false;

  function orderId() {
    try {
      return (sessionStorage.getItem('tower_app_active_inspect_order') || '').trim();
    } catch (e) {
      return '';
    }
  }
  function isEmbedPage() {
    try {
      return new URLSearchParams(window.location.search).get('embed') === '1';
    } catch (e2) {
      return false;
    }
  }
  function useEmbedOnReturn() {
    if (isEmbedPage()) return true;
    try {
      return window.parent !== window;
    } catch (e) {
      return false;
    }
  }
  function applyHref(a) {
    var raw = a.getAttribute('href');
    if (!raw) return;
    try {
      var u = new URL(raw, window.location.href);
      var oid = orderId();
      if (oid) u.searchParams.set('order', oid);
      if (useEmbedOnReturn()) u.searchParams.set('embed', '1');
      a.href = u.href;
    } catch (e3) {}
  }
  function inspectHomeFallback(a) {
    try {
      window.location.href = a.href;
    } catch (e) {}
  }
  function bind(a) {
    applyHref(a);
    a.addEventListener('click', function (e) {
      if (window.parent !== window) {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          inspectHomeFallback(a);
        }
        return;
      }
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  }

  var MODULE_BY_FILE = {
    'app_inspect_tower.html': { id: 'tower', name: '铁塔信息' },
    'app_inspect_tower_photos.html': { id: 'tower_photos', name: '上传铁塔照片' },
    'app_inspect_vertical.html': { id: 'vertical', name: '垂直度' },
    'app_inspect_foundation.html': { id: 'foundation', name: '基础及地锚' },
    'app_inspect_segment.html': { id: 'segment', name: '塔段检测' },
    'app_inspect_platform.html': { id: 'platform', name: '平台及设备' },
    'app_inspect_diagram.html': { id: 'diagram', name: '结构简图' },
    'app_inspect_connection.html': { id: 'connection', name: '连接质量' },
    'app_inspect_coating.html': { id: 'coating', name: '防腐层质量' },
    'app_inspect_weld.html': { id: 'weld', name: '焊接' },
    'app_inspect_feed.html': { id: 'feed', name: '馈线检测' },
    'app_inspect_ground.html': { id: 'ground', name: '接地' },
    'app_inspect_rebound.html': { id: 'rebound', name: '回弹' },
    'app_inspect_validate.html': { id: 'validate', name: '校验与提交' },
    'app_inspect_note.html': { id: 'note', name: '快捷手记' },
    'app_sync_index.html': { id: 'sync', name: '数据同步' },
    'app_inspect_upload.html': { id: 'upload', name: '上传数据' }
  };

  function taskRelPrefix() {
    var segs = (location.pathname || '').replace(/\\/g, '/').split('/').filter(Boolean);
    var i = segs.indexOf('检测');
    if (i === -1) return '../../任务';
    return segs.length - i - 1 >= 2 ? '../../任务' : '../任务';
  }

  function appendOrderToUrl(href) {
    try {
      var u = new URL(href, window.location.href);
      var oid = orderId();
      if (oid) u.searchParams.set('order', oid);
      if (useEmbedOnReturn()) u.searchParams.set('embed', '1');
      return u.pathname + u.search + u.hash;
    } catch (e) {
      return href;
    }
  }

  function injectToolbarStyle() {
    var full =
      '#appNavBar.inspect-app-nav-toolbar{display:grid !important;grid-template-columns:1fr auto 1fr;align-items:center;width:100%;box-sizing:border-box;column-gap:6px;min-height:44px;position:relative}' +
      '#appNavBar.inspect-app-nav-toolbar .inspect-nav-left{justify-self:start;min-width:0;display:flex;align-items:center;z-index:1}' +
      '#appNavBar.inspect-app-nav-toolbar .inspect-nav-title{grid-column:2;justify-self:center;text-align:center;font-size:16px;font-weight:600;max-width:min(56vw,240px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none !important}' +
      '#appNavBar.inspect-app-nav-toolbar .inspect-nav-right{grid-column:3;justify-self:end;display:flex;align-items:center;gap:4px;flex-shrink:0;z-index:1}' +
      '#appNavBar.inspect-app-nav-toolbar .inspect-nav-spacer{grid-column:3;justify-self:end;z-index:1}' +
      '.inspect-nav-left{display:flex;align-items:center;gap:4px;min-width:0}' +
      '.inspect-nav-right{display:flex;align-items:center;justify-content:flex-end;gap:4px;flex-shrink:0}' +
      '.inspect-nav-title{font-size:16px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.inspect-mod-btn{border:none;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;-webkit-tap-highlight-color:transparent;line-height:1.2}' +
      '.inspect-mod-btn--memo{background:#FFF7E8;color:#FF7D00}' +
      '.inspect-mod-btn--memo:active{opacity:.88}' +
      '.inspect-mod-btn--cam{background:#E8F3FF;color:#165DFF}' +
      '.inspect-mod-btn--cam:active{opacity:.88}' +
      '.inspect-mod-btn i{font-size:11px}' +
      '.inspect-nav-spacer{width:40px;min-width:40px;height:1px;flex-shrink:0}' +
      '[data-app-flow-footer].inspect-app-flow-footer{display:flex;flex-direction:row;align-items:center;gap:10px;box-sizing:border-box;padding-bottom:calc(12px + env(safe-area-inset-bottom, 0px))}' +
      '.inspect-flow-footer-side{flex:0 0 auto;display:flex;flex-direction:row;align-items:center;gap:8px;padding:0 2px;min-width:0}' +
      '.inspect-flow-footer-main{flex:1;min-width:0;display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;gap:10px;justify-content:stretch}' +
      '.inspect-flow-footer-main > *{flex:1 1 0;min-width:0;box-sizing:border-box}' +
      '.inspect-mod-btn--footer{min-height:56px;padding:6px 10px;border-radius:10px;font-size:12px;font-weight:600;justify-content:center;box-sizing:border-box;text-decoration:none;line-height:1.25;flex-direction:column;align-items:center;gap:4px;white-space:nowrap;border:1px solid #E5E6EB;background:#fff;color:#4E5969}' +
      '.inspect-mod-btn--footer.inspect-mod-btn--memo i,.inspect-mod-btn--footer.inspect-mod-btn--cam i{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;font-size:16px}' +
      '.inspect-mod-btn--footer.inspect-mod-btn--memo i{background:linear-gradient(145deg,#FFF7E8 0%,#FFE8CC 100%);color:#FF7D00}' +
      '.inspect-mod-btn--footer.inspect-mod-btn--cam i{background:linear-gradient(145deg,#E8F3FF 0%,#D6E8FF 100%);color:#165DFF}';
    var st = document.getElementById('inspect-mod-toolbar-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'inspect-mod-toolbar-style';
      document.head.appendChild(st);
    }
    st.textContent = full;
  }

  function skipMemoToolbar(mod) {
    if (!mod) return true;
    try {
      var b = document.body;
      if (b && b.getAttribute('data-inspect-no-memo-toolbar') === '1') return true;
    } catch (eM) {}
    return mod.id === 'note' || mod.id === 'sync' || mod.id === 'validate';
  }

  function skipPhotoRecognize(mod) {
    if (!mod) return true;
    try {
      var b = document.body;
      if (b && b.getAttribute('data-inspect-no-photo-recognize') === '1') return true;
    } catch (e0) {}
    return mod.id === 'tower_photos' || mod.id === 'note' || mod.id === 'sync' || mod.id === 'validate';
  }

  function isIpadEmbedShell() {
    try {
      if (new URLSearchParams(window.location.search).get('embed') !== '1') return false;
      return document.body && document.body.classList.contains('ipad-adapt');
    } catch (e) {
      return false;
    }
  }

  /** 底栏已写死「备忘录 / 拍照」时不再由脚本注入第二套 */
  function footerHasBuiltInMemoPhoto(footer) {
    if (!footer) return false;
    if (footer.querySelector('.btn-memo, .btn-photo')) return true;
    var memoLink = footer.querySelector('a[href*="备忘录"], a[href*="memo"]');
    var photoBtn = footer.querySelector('.btn-photo, button[id*="Photo"], button[id*="photo"]');
    return !!(memoLink && photoBtn);
  }

  function enhanceFooterMemoLink(footer, mod) {
    if (!footer || !mod) return;
    var link = footer.querySelector('a.btn-memo, a[href*="备忘录"], a[href*="memo"]');
    if (!link) return;
    try {
      var u = new URL(link.href, window.location.href);
      u.searchParams.set('scope', 'module');
      u.searchParams.set('moduleId', mod.id);
      u.searchParams.set('moduleName', mod.name);
      u.searchParams.set('return', window.location.href);
      var oid = orderId();
      if (oid) u.searchParams.set('order', oid);
      if (useEmbedOnReturn()) u.searchParams.set('embed', '1');
      link.href = u.pathname + u.search + u.hash;
    } catch (e) {}
  }

  function resolveModule() {
    var fn = (location.pathname || '').split(/[/\\]/).pop() || '';
    if (fn.indexOf('ipad_') === 0) fn = 'app_' + fn.slice(5);
    var fromBody = (function () {
      try {
        var b = document.body;
        if (!b) return null;
        var id = b.getAttribute('data-inspect-module-id');
        var nm = b.getAttribute('data-inspect-module-name');
        if (id && nm) return { id: id, name: nm };
      } catch (e) {}
      return null;
    })();
    if (fromBody) return fromBody;
    return MODULE_BY_FILE[fn] || null;
  }

  function injectModuleToolbar() {
    var nav = document.getElementById('appNavBar');
    if (!nav || nav.getAttribute('data-inspect-toolbar') === '1') return;
    var back = nav.querySelector('a[data-app-inspect-back]');
    if (!back) return;
    var mod = resolveModule();
    if (!mod) return;

    /* 快捷手记 / 数据同步 / 数据校验：不注入「备忘录」「拍照识别」，也不改顶栏 DOM 结构 */
    if (mod.id === 'note' || mod.id === 'sync' || mod.id === 'validate') {
      try {
        nav.setAttribute('data-inspect-toolbar', '1');
      } catch (eNote) {}
      return;
    }

    /* iPad 填报主页 iframe 嵌入：备忘/拍照/下一步由父页承载，子页不注入 */
    if (isIpadEmbedShell()) {
      try {
        nav.setAttribute('data-inspect-toolbar', '1');
      } catch (eEmb) {}
      return;
    }

    var footer = document.querySelector('[data-app-flow-footer]');
    var footerBuiltIn = footerHasBuiltInMemoPhoto(footer);
    if (footerBuiltIn) {
      footer.setAttribute('data-inspect-module-actions', '1');
      enhanceFooterMemoLink(footer, mod);
    }

    var allowInjectMemo =
      ENABLE_MODULE_MEMO_PHOTO && !skipMemoToolbar(mod) && !footerBuiltIn;
    var allowInjectPhoto =
      ENABLE_MODULE_MEMO_PHOTO && !skipPhotoRecognize(mod) && !footerBuiltIn;
    var useFooterActions =
      !!footer &&
      footer.getAttribute('data-inspect-module-actions') !== '1' &&
      !footerBuiltIn &&
      (allowInjectMemo || allowInjectPhoto);

    injectToolbarStyle();
    nav.classList.add('inspect-app-nav-toolbar');
    try {
      nav.style.setProperty('display', 'grid', 'important');
    } catch (eNav) {}

    var titleSpan = null;
    var ch = nav.children;
    for (var j = 0; j < ch.length; j++) {
      if (ch[j].tagName !== 'SPAN') continue;
      var st = ch[j].getAttribute('style') || '';
      var isSpacer =
        (st.indexOf('40px') !== -1 || st.indexOf('width:40px') !== -1 || st.indexOf('width: 40px') !== -1) &&
        st.indexOf('flex:1') === -1 &&
        st.indexOf('flex: 1') === -1;
      if (isSpacer) continue;
      if (
        st.indexOf('flex:1') !== -1 ||
        st.indexOf('flex: 1') !== -1 ||
        st.indexOf('text-align:center') !== -1 ||
        st.indexOf('text-align: center') !== -1
      ) {
        titleSpan = ch[j];
        break;
      }
    }

    var left = document.createElement('div');
    left.className = 'inspect-nav-left';
    nav.insertBefore(left, back);
    left.appendChild(back);

    var pageFn = (location.pathname || '').split(/[/\\]/).pop() || '';
    var memoFile =
      pageFn.indexOf('ipad_') === 0 || (document.body && document.body.classList.contains('ipad-adapt'))
        ? 'ipad_task_memo.html'
        : 'app_task_memo.html';
    var memoRel = taskRelPrefix() + '/备忘录/' + memoFile;
    var memo = null;
    if (allowInjectMemo) {
      memo = document.createElement('a');
      memo.className = 'inspect-mod-btn inspect-mod-btn--memo';
      memo.href = memoRel;
      memo.setAttribute('aria-label', '本模块备忘录');
      memo.innerHTML = '<i class="fa-solid fa-microphone" aria-hidden="true"></i>备忘录';
      try {
        var mu = new URL(memo.href, window.location.href);
        mu.searchParams.set('scope', 'module');
        mu.searchParams.set('moduleId', mod.id);
        mu.searchParams.set('moduleName', mod.name);
        mu.searchParams.set('return', window.location.href);
        var oid = orderId();
        if (oid) mu.searchParams.set('order', oid);
        if (useEmbedOnReturn()) mu.searchParams.set('embed', '1');
        memo.href = mu.pathname + mu.search + mu.hash;
      } catch (e2) {}
    }

    var cam = null;
    if (allowInjectPhoto) {
      cam = document.createElement('button');
      cam.type = 'button';
      cam.className = 'inspect-mod-btn inspect-mod-btn--cam';
      cam.setAttribute('aria-label', '本模块拍照识别');
      cam.innerHTML = '<i class="fa-solid fa-camera" aria-hidden="true"></i>拍照';
      cam.addEventListener('click', function () {
        alert(
          '拍照：上传或拍摄照片 → OCR 映射到可填字段草稿 → 须人工确认后落库（与填报主页一致）。\n\n' +
            '当前作用域：「' +
            mod.name +
            '」模块，仅识别并预填本页模板字段，不影响其它模块。'
        );
      });
    }

    if (titleSpan) {
      var sp0 = titleSpan.nextSibling;
      if (sp0 && sp0.tagName === 'SPAN') {
        var sst0 = sp0.getAttribute('style') || '';
        if (
          sst0.indexOf('40px') !== -1 ||
          sst0.indexOf('width:40px') !== -1 ||
          sst0.indexOf('width: 40px') !== -1
        ) {
          try {
            nav.removeChild(sp0);
          } catch (e4) {}
        }
      }
    }

    if (useFooterActions && (memo || cam)) {
      if (memo) memo.classList.add('inspect-mod-btn--footer');
      if (cam) cam.classList.add('inspect-mod-btn--footer');
      footer.classList.add('inspect-app-flow-footer');
      footer.setAttribute('data-inspect-module-actions', '1');
      var main = document.createElement('div');
      main.className = 'inspect-flow-footer-main';
      while (footer.firstChild) {
        main.appendChild(footer.firstChild);
      }
      var side = document.createElement('div');
      side.className = 'inspect-flow-footer-side';
      if (memo) side.appendChild(memo);
      if (cam) side.appendChild(cam);
      footer.appendChild(side);
      footer.appendChild(main);

      var spacer = document.createElement('div');
      spacer.className = 'inspect-nav-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      nav.appendChild(spacer);
    } else {
      if (memo || cam) {
        var right = document.createElement('div');
        right.className = 'inspect-nav-right';
        if (memo) right.appendChild(memo);
        if (cam) right.appendChild(cam);
        nav.appendChild(right);
      } else {
        var navSp = document.createElement('div');
        navSp.className = 'inspect-nav-spacer';
        navSp.setAttribute('aria-hidden', 'true');
        nav.appendChild(navSp);
      }
    }

    if (titleSpan) {
      titleSpan.classList.add('inspect-nav-title');
      try {
        titleSpan.style.setProperty('flex', 'none', 'important');
      } catch (eT) {}
    }

    nav.setAttribute('data-inspect-toolbar', '1');
  }

  function run() {
    document.querySelectorAll('a[data-app-inspect-back]').forEach(bind);
    injectModuleToolbar();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
