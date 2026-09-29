/* RSL — sélecteur de langue FR / EN / DE
   Sur chaque page : <script src="/js/lang.js" defer></script>
   Le site est écrit en français. Les traductions sont dans /js/lang-dict.js
   (clé = texte français exact → [anglais, allemand]). */
(function () {
  if (window.__rslLang) return;
  window.__rslLang = true;

  var LANGS = ["fr", "en", "de"];
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Langue : ?lang=xx dans l'URL > choix mémorisé > langue du téléphone
  var q = (location.search.match(/[?&]lang=(fr|en|de)\b/) || [])[1];
  var lang = q || read("rsl-lang");
  if (!lang) {
    var nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    lang = LANGS.indexOf(nav) > -1 ? nav : "fr";
  }
  if (LANGS.indexOf(lang) < 0) lang = "fr";
  store("rsl-lang", lang);
  var IDX = lang === "en" ? 0 : 1;

  /* ---------- sélecteur ---------- */
  var css = document.createElement("style");
  css.textContent =
    ".rsl-lang{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147483000;" +
    "display:flex;background:rgba(0,0,0,.88);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:3px;" +
    "font:700 12px/1 system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.06em;box-shadow:0 4px 16px rgba(0,0,0,.35)}" +
    ".rsl-lang button{all:unset;cursor:pointer;color:#fff;padding:8px 11px;border-radius:999px;opacity:.7}" +
    ".rsl-lang button:hover{opacity:1}" +
    ".rsl-lang button[aria-pressed=true]{background:#e30613;opacity:1}" +
    ".rsl-lang button:focus-visible{outline:2px solid #fff;outline-offset:1px}" +
    "@media print{.rsl-lang{display:none}}";
  document.head.appendChild(css);

  var box = null;
  function buildSwitcher() {
    box = document.createElement("div");
    box.className = "rsl-lang";
    box.setAttribute("translate", "no");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Langue / Language / Sprache");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = l.toUpperCase();
      b.setAttribute("lang", l);
      b.addEventListener("click", function () { setLang(l, true); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
    paintSwitcher();
  }
  function paintSwitcher() {
    if (!box) return;
    var bs = box.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].getAttribute("lang") === lang ? "true" : "false");
  }

  /* ---------- traduction ---------- */
  var DICT = null;
  var MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  var MONTHS = [
    ["January","February","March","April","May","June","July","August","September","October","November","December"],
    ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]
  ];
  var JOURS = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];
  var DAYS = [
    ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"]
  ];
  function keepCase(src, out) {
    return (src === src.toUpperCase() && src !== src.toLowerCase()) ? out.toUpperCase() : out;
  }
  var reDate = new RegExp("\\b(?:(" + JOURS.join("|") + ")\\s+)?(\\d{1,2})(?:er)?\\s+(" + MOIS.join("|") + ")(?:\\s+(\\d{4}))?", "gi");
  var RULES = [
    [reDate, function (m, j, d, mo, y) {
      var mi = MOIS.indexOf(mo.toLowerCase()), di = j ? JOURS.indexOf(j.toLowerCase()) : -1;
      var day = di > -1 ? keepCase(j, DAYS[IDX][di]) : "";
      var month = keepCase(mo, MONTHS[IDX][mi]);
      var out = IDX === 0 ? d + " " + month : d + ". " + month;
      if (y) out += " " + y;
      if (day) out = day + (IDX === 1 ? ", " : " ") + out;
      return out;
    }],
    [/Payé ✓ samedi (\S+)/g, function (m, d) { return IDX === 0 ? "Paid ✓ Saturday " + d : "Bezahlt ✓ Samstag " + d; }],
    [/(\d+) \/ 15 gratuits/g, function (m, n) { return n + (IDX === 0 ? " / 15 free" : " / 15 gratis"); }],
    [/(\d+) payés?\b/g, function (m, n) { return n + (IDX === 0 ? " paid" : " bezahlt"); }],
    [/(\d+) cours restants? sur (\d+)/g, function (m, n, t) {
      return IDX === 0 ? n + " class" + (n > 1 ? "es" : "") + " left out of " + t : n + " von " + t + " Kursen übrig";
    }],
    [/^Cours collectif RSL\. Contacte-nous pour réserver ta place ou rejoins directement le groupe WhatsApp de (.+)\.$/, function (m, l) {
      return IDX === 0 ? "RSL group class. Contact us to book your spot or join the " + l + " WhatsApp group directly."
                       : "RSL-Gruppenkurs. Kontaktiere uns, um deinen Platz zu reservieren, oder tritt direkt der WhatsApp-Gruppe " + l + " bei.";
    }],
    [/^Photos (m\d+ → m\d+)$/, function (m, r) { return IDX === 0 ? "Photos " + r : "Fotos " + r; }]
  ];

  function tr(text) {
    if (lang === "fr") return null;
    var key = text.replace(/\s+/g, " ").trim();
    if (!key) return null;
    var hit = DICT[key];
    var out;
    if (hit) out = hit[IDX];
    else {
      out = key;
      for (var i = 0; i < RULES.length; i++) out = out.replace(RULES[i][0], RULES[i][1]);
      if (out === key) return null;
    }
    var lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0];
    return lead + out + tail;
  }

  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };
  var ORIG = new WeakMap();   // noeud texte -> texte français d'origine
  var MINE = new WeakMap();   // noeud texte -> dernier texte écrit par ce script
  var TEXTS = [];             // noeuds touchés (pour changer de langue sans recharger)
  function skipped(el) {
    for (; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP[el.nodeName]) return true;
      if (el.getAttribute("translate") === "no" || el.classList.contains("notranslate")) return true;
      if (el.isContentEditable) return true;
    }
    return false;
  }
  function doText(node) {
    var v = node.nodeValue;
    if (v == null) return;
    if (MINE.get(node) !== v) {            // texte nouveau ou changé par la page : c'est du français
      if (!/[A-Za-zÀ-ÿ]/.test(v) || skipped(node.parentNode)) { MINE.set(node, v); return; }
      if (!ORIG.has(node)) TEXTS.push(node);
      ORIG.set(node, v);
    }
    if (!ORIG.has(node)) return;
    var fr = ORIG.get(node);
    var t = tr(fr);
    var want = t === null ? fr : t;
    if (node.nodeValue !== want) node.nodeValue = want;
    MINE.set(node, want);
  }
  var ATTRS = ["placeholder", "alt", "title", "aria-label"];
  var ELS = [];
  function doAttrs(el) {
    if (el.nodeType !== 1 || skipped(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var n = ATTRS[i], a = el.getAttribute(n);
      if (a == null) continue;
      var mk = "data-rsl-" + n, ok = "data-rsl-fr-" + n;
      if (el.getAttribute(mk) !== a) { el.setAttribute(ok, a); if (ELS.indexOf(el) < 0) ELS.push(el); }
      var fr = el.getAttribute(ok);
      var t = tr(fr);
      var want = t === null ? fr : t;
      if (a !== want) el.setAttribute(n, want);
      el.setAttribute(mk, want);
    }
    if (el.nodeName === "INPUT" && /^(submit|button|reset)$/i.test(el.type) && el.value) {
      if (el.__rslMine !== el.value) el.__rslFr = el.value;
      var tv = tr(el.__rslFr);
      el.value = tv === null ? el.__rslFr : tv;
      el.__rslMine = el.value;
      if (ELS.indexOf(el) < 0) ELS.push(el);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || (root.classList && root.classList.contains("rsl-lang"))) return;
    doAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else doAttrs(n);
    }
  }
  var HEAD = null;
  function doHead() {
    if (!HEAD) {
      HEAD = { title: document.title, metas: [] };
      var ms = document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]');
      for (var i = 0; i < ms.length; i++) HEAD.metas.push([ms[i], ms[i].getAttribute("content") || ""]);
    } else if (document.title !== HEAD.mine) HEAD.title = document.title;
    var t = tr(HEAD.title);
    document.title = t === null ? HEAD.title : t;
    HEAD.mine = document.title;
    HEAD.metas.forEach(function (m) { var c = tr(m[1]); m[0].setAttribute("content", c === null ? m[1] : c); });
  }

  var observing = false;
  function translatePage() {
    document.documentElement.lang = lang;
    doHead();
    walk(document.body);
    for (var i = 0; i < TEXTS.length; i++) doText(TEXTS[i]);
    for (var j = 0; j < ELS.length; j++) doAttrs(ELS[j]);
    document.documentElement.classList.remove("rsl-lang-wait");
    if (observing) return;
    observing = true;
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") doText(m.target);
        else if (m.type === "attributes") doAttrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    var tEl = document.querySelector("title");
    if (tEl) new MutationObserver(function () { if (document.title !== HEAD.mine) doHead(); }).observe(tEl, { childList: true, characterData: true, subtree: true });
  }

  function loadDict(cb) {
    if (DICT) return cb();
    if (window.RSL_DICT) { DICT = window.RSL_DICT; return cb(); }
    var s = document.createElement("script");
    var me = document.querySelector('script[src*="lang.js"]');
    s.src = me ? me.src.replace(/lang\.js(\?.*)?$/, "lang-dict.js$1") : "/js/lang-dict.js";
    s.onload = function () { DICT = window.RSL_DICT || {}; cb(); };
    s.onerror = function () { DICT = {}; document.documentElement.classList.remove("rsl-lang-wait"); };
    document.head.appendChild(s);
  }

  // Change de langue tout de suite, sans recharger la page
  function setLang(l, save) {
    if (LANGS.indexOf(l) < 0) return;
    if (save) store("rsl-lang", l);
    if (l === lang && DICT) return;
    lang = l; IDX = lang === "en" ? 0 : 1;
    paintSwitcher();
    if (lang === "fr" && !DICT) { document.documentElement.lang = "fr"; return; }
    loadDict(translatePage);
  }

  function start() {
    buildSwitcher();
    if (lang !== "fr") loadDict(translatePage);
  }

  // Retour arrière / autre onglet : on suit la dernière langue choisie
  window.addEventListener("pageshow", function () { var l = read("rsl-lang"); if (l && l !== lang) setLang(l, false); });
  window.addEventListener("storage", function (e) { if (e.key === "rsl-lang" && e.newValue && e.newValue !== lang) setLang(e.newValue, false); });

  // Évite de voir le français une fraction de seconde
  if (lang !== "fr") {
    var hide = document.createElement("style");
    hide.textContent = "html.rsl-lang-wait body{opacity:0}";
    document.head.appendChild(hide);
    document.documentElement.classList.add("rsl-lang-wait");
    setTimeout(function () { document.documentElement.classList.remove("rsl-lang-wait"); }, 2500);
  }
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
