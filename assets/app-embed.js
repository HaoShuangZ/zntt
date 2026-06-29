(function () {
  try {
    if (new URLSearchParams(window.location.search).get('embed') === '1') {
      document.documentElement.classList.add('app-embed');
      if (document.body && document.body.classList.contains('ipad-adapt')) {
        document.documentElement.classList.add('ipad-embed');
      }
    }
  } catch (e) {}
})();
