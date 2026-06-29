/**
 * iPad 端适配：Tab 栏、页面类型、embed、视口密度
 */
(function () {
  function run() {
    var body = document.body;
    var html = document.documentElement;
    if (!body || !body.classList.contains("ipad-adapt")) return;

    html.classList.add("ipad-env");

    var path = (location.pathname || "").replace(/\\/g, "/");
    if (/ipad_login|登录/.test(document.title) || path.indexOf("ipad_login") !== -1) {
      body.classList.add("ipad-login-page");
    }
    if (path.indexOf("ipad_task_memo") !== -1 || path.indexOf("task_memo") !== -1) {
      body.classList.add("ipad-memo-page");
    }
    if (path.indexOf("ipad_inspect_shell") !== -1) {
      body.classList.add("ipad-shell-page", "ipad-inspect-shell-page");
    }
    if (path.indexOf("ipad_task_inspect_home") !== -1 || path.indexOf("task_inspect_home") !== -1) {
      body.classList.add("ipad-task-home");
    }

    try {
      if (new URLSearchParams(location.search).get("embed") === "1") {
        html.classList.add("ipad-embed", "task-embed");
      }
    } catch (e) {}
    if (html.classList.contains("task-embed")) {
      body.classList.add("ipad-embed-view");
    }

    if (window.matchMedia("(orientation: portrait)").matches) {
      body.classList.add("ipad-portrait");
    } else {
      body.classList.add("ipad-landscape");
    }

    if (body.classList.contains("inspect-app-layout")) {
      loadInspectBasicAssets();
    }
  }

  function loadInspectBasicAssets() {
    var base = assetBase();
    if (!base) return;
    if (!document.querySelector('link[data-ipad-inspect-basic-css]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = base + "ipad-inspect-basic.css";
      link.setAttribute("data-ipad-inspect-basic-css", "1");
      document.head.appendChild(link);
    }
  }

  function assetBase() {
    var s = document.querySelector('script[src*="ipad-adapt.js"]');
    if (!s || !s.src) return "";
    return s.src.replace(/ipad-adapt\.js(\?.*)?$/i, "");
  }

  function loadMainTabbarAssets() {
    var base = assetBase();
    if (!base) return;
    if (!document.querySelector('link[data-ipad-main-tabbar-css]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = base + "ipad-main-tabbar.css";
      link.setAttribute("data-ipad-main-tabbar-css", "1");
      document.head.appendChild(link);
    }
    if (document.querySelector('script[data-ipad-main-tabbar-js]')) return;
    var script = document.createElement("script");
    script.src = base + "ipad-main-tabbar.js";
    script.defer = true;
    script.setAttribute("data-ipad-main-tabbar-js", "1");
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("orientationchange", function () {
    setTimeout(run, 100);
  });
})();
