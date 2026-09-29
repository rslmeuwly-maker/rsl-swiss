/* RSL — sélecteur de langue FR / EN / DE
   Ajouté sur chaque page avec : <script src="/js/lang.js" defer></script>
   Le site est écrit en français ; EN et DE sont traduits automatiquement. */
(function () {
  if (window.__rslLang) return;
  window.__rslLang = true;

  var LANGS = ["fr", "en", "de"];
  var host = location.hostname;
  var baseDomain = host.split(".").slice(-2).join(".");

  function getCookieLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/fr\/(en|de)/);
    return m ? m[1] : "fr";
  }
  function setCookie(value, expires) {
    var tail = ";path=/" + (expires ? ";expires=" + expires : "");
    document.cookie = "googtrans=" + value + tail;
    if (host.indexOf(".") > -1 && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      document.cookie = "googtrans=" + value + tail + ";domain=." + baseDomain;
      document.cookie = "googtrans=" + value + tail + ";domain=" + host;
    }
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function choose(lang, auto) {
    if (auto) {
      try { if (sessionStorage.getItem("rsl-lang-auto")) return false; sessionStorage.setItem("rsl-lang-auto", "1"); } catch (e) { return false; }
    }
    store("rsl-lang", lang);
    if (lang === "fr") setCookie("", "Thu, 01 Jan 1970 00:00:00 GMT");
    else setCookie("/fr/" + lang);
    location.reload();
    return true;
  }

  // Première visite : on suit la langue du téléphone / navigateur
  var current = getCookieLang();
  if (!read("rsl-lang")) {
    var nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    store("rsl-lang", LANGS.indexOf(nav) > -1 ? nav : "fr");
    if ((nav === "en" || nav === "de") && current === "fr" && choose(nav, true)) return;
  }
  var wanted = read("rsl-lang") || "fr";
  if (wanted !== current && choose(wanted, true)) return;

  // Style
  var css = document.createElement("style");
  css.textContent =
    ".rsl-lang{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147483000;" +
    "display:flex;background:rgba(0,0,0,.88);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:3px;" +
    "font:700 12px/1 system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.06em;box-shadow:0 4px 16px rgba(0,0,0,.35)}" +
    ".rsl-lang button{all:unset;cursor:pointer;color:#fff;padding:8px 11px;border-radius:999px;opacity:.7}" +
    ".rsl-lang button:hover{opacity:1}" +
    ".rsl-lang button[aria-pressed=true]{background:#e30613;opacity:1}" +
    ".rsl-lang button:focus-visible{outline:2px solid #fff;outline-offset:1px}" +
    "@media print{.rsl-lang{display:none}}" +
    /* cacher la barre Google */
    "iframe.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf{display:none!important}" +
    "body{top:0!important;position:static}" +
    ".goog-text-highlight{background:none!important;box-shadow:none!important}" +
    "#google_translate_element{display:none}";
  document.head.appendChild(css);

  function buildSwitcher() {
    var box = document.createElement("div");
    box.className = "rsl-lang notranslate";
    box.setAttribute("translate", "no");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Langue / Language / Sprache");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = l.toUpperCase();
      b.setAttribute("aria-pressed", l === current ? "true" : "false");
      b.setAttribute("lang", l);
      b.addEventListener("click", function () { if (l !== current) choose(l); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  }

  function loadTranslator() {
    var holder = document.createElement("div");
    holder.id = "google_translate_element";
    document.body.appendChild(holder);
    window.rslGoogleInit = function () {
      new google.translate.TranslateElement(
        { pageLanguage: "fr", includedLanguages: "fr,en,de", autoDisplay: false },
        "google_translate_element"
      );
    };
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=rslGoogleInit";
    s.async = true;
    document.body.appendChild(s);
    document.documentElement.lang = current;
  }

  function start() {
    buildSwitcher();
    if (current !== "fr") loadTranslator();
  }
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
