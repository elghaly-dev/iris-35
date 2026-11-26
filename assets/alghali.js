/* «الغالي» — the house assistant button, in its own look: the old eye in a gold ring,
   a violet glow, the name in gold. Self-contained. Opens the chosen assistant with a
   product-specific question. Labels follow the page language and change with it. */
(function () {
  var tag = document.currentScript || (function () { var s = document.querySelectorAll('script[data-product]'); return s[s.length - 1]; })();
  var product = (tag && tag.getAttribute('data-product')) || document.title;
  var eyeSrc = new URL('alghali-eye.webp', (tag && tag.src) || location.href).href;
  var NAME = 'الغالي';

  var ASSISTANTS = [
    ['ChatGPT',    'https://chat.openai.com/?q='],
    ['Claude',     'https://claude.ai/new?q='],
    ['Gemini',     'https://gemini.google.com/app'],
    ['Grok',       'https://grok.com/?q='],
    ['Perplexity', 'https://www.perplexity.ai/search?q=']
  ];

  // ask = the word before the name on the button; sub = panel line; who/q/go = panel labels.
  var L = {
    en: { ask: 'Ask', sub: 'Questions about {p}', who: 'Assistant', q: 'Question', go: 'Ask', text: 'What is {p} by Elghaly and how does it work?' },
    ar: { ask: 'اسأل', sub: 'أسئلة عن {p}', who: 'المساعد', q: 'السؤال', go: 'اسأل', text: 'ما هو {p} من Elghaly وكيف يعمل؟' },
    ru: { ask: 'Спросить', sub: 'Вопросы о {p}', who: 'Помощник', q: 'Вопрос', go: 'Спросить', text: 'Что такое {p} от Elghaly и как это работает?' },
    zh: { ask: '问', sub: '关于 {p} 的问题', who: '助手', q: '问题', go: '提问', text: '什么是 Elghaly 的 {p}？它如何运作？' },
    de: { ask: 'Frag', sub: 'Fragen zu {p}', who: 'Assistent', q: 'Frage', go: 'Fragen', text: 'Was ist {p} von Elghaly und wie funktioniert es?' },
    es: { ask: 'Pregunta a', sub: 'Preguntas sobre {p}', who: 'Asistente', q: 'Pregunta', go: 'Preguntar', text: '¿Qué es {p} de Elghaly y cómo funciona?' }
  };
  function pack() { var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return L[l] || L.en; }
  function fill(s) { return s.split('{p}').join(product); }

  var css = document.createElement('style');
  css.textContent = [
    '.ag-btn{position:fixed;inset-inline-end:16px;bottom:16px;z-index:9998;display:inline-flex;align-items:center;gap:10px;',
    'min-height:50px;padding-block:6px;padding-inline:6px 18px;border-radius:999px;border:1px solid rgba(226,194,122,.6);',
    'background:radial-gradient(140% 160% at 0% 50%,rgba(138,108,255,.34),rgba(138,108,255,0) 62%),#07060d;color:#efe8d8;',
    'font:600 15px/1.1 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);',
    'box-shadow:0 10px 34px rgba(0,0,0,.5),0 0 26px rgba(138,108,255,.28)}',
    '[dir="rtl"] .ag-btn{background:radial-gradient(140% 160% at 100% 50%,rgba(138,108,255,.34),rgba(138,108,255,0) 62%),#07060d}',
    '.ag-btn:hover,.ag-btn:focus-visible{border-color:#e2c27a;box-shadow:0 10px 34px rgba(0,0,0,.5),0 0 34px rgba(138,108,255,.45)}',
    '.ag-btn:focus-visible{outline:2px solid #e2c27a;outline-offset:3px}',
    '.ag-eye{position:relative;flex:0 0 auto;width:40px;height:40px;border-radius:50%;background:#04040a;',
    'box-shadow:0 0 0 1.5px #e2c27a,0 0 16px rgba(138,108,255,.55)}',
    '.ag-eye img{position:absolute;inset:2px;width:36px;height:36px;border-radius:50%;mix-blend-mode:screen}',
    '.ag-eye::after{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px dashed rgba(226,194,122,.55);animation:ag-spin 18s linear infinite}',
    '@keyframes ag-spin{to{transform:rotate(360deg)}}',
    '@media (prefers-reduced-motion:reduce){.ag-eye::after{animation:none}}',
    '.ag-name{font-family:"Noto Kufi Arabic","Geeza Pro","Segoe UI",system-ui,sans-serif;font-weight:800;color:#e2c27a;letter-spacing:0}',
    '.ag-panel{position:fixed;inset-inline-end:16px;bottom:80px;z-index:9999;width:min(340px,calc(100vw - 32px));box-sizing:border-box;',
    'padding:16px;border-radius:20px;border:1px solid rgba(226,194,122,.4);',
    'background:radial-gradient(120% 90% at 50% 0%,rgba(138,108,255,.24),rgba(138,108,255,0) 58%),#07060d;color:#efe8d8;',
    'font:400 14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(138,108,255,.18)}',
    '.ag-panel[hidden]{display:none}',
    '.ag-head{display:flex;align-items:center;gap:12px;margin:0 0 14px}',
    '.ag-head .ag-eye{width:48px;height:48px}.ag-head .ag-eye img{width:44px;height:44px}',
    '.ag-head b{display:block;font-size:20px;line-height:1.2}',
    '.ag-head small{display:block;font-size:12px;color:#a39b88}',
    '.ag-panel label{display:block;font-size:12px;font-weight:600;text-transform:none;letter-spacing:0;color:#a39b88;margin:0 0 6px}',
    '.ag-panel select,.ag-panel textarea{width:100%;box-sizing:border-box;background:rgba(239,232,216,.05);color:#efe8d8;',
    'border:1px solid rgba(226,194,122,.28);border-radius:12px;padding:10px;font:inherit;margin-bottom:12px}',
    '.ag-panel textarea{min-height:78px;resize:vertical}',
    '.ag-go{width:100%;min-height:46px;border-radius:999px;border:0;background:#e2c27a;color:#04040a;font:700 15px/1 system-ui,sans-serif;cursor:pointer}',
    '.ag-go:focus-visible{outline:2px solid #c4a1ec;outline-offset:3px}'
  ].join('');
  document.head.appendChild(css);

  function eye() {
    var s = document.createElement('span'); s.className = 'ag-eye'; s.setAttribute('aria-hidden', 'true');
    var i = document.createElement('img'); i.src = eyeSrc; i.alt = ''; i.width = 34; i.height = 34; s.appendChild(i);
    return s;
  }

  var btn = document.createElement('button');
  btn.className = 'ag-btn'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false');
  var bAsk = document.createElement('span'), bName = document.createElement('span');
  bName.className = 'ag-name'; bName.lang = 'ar'; bName.textContent = NAME;
  btn.appendChild(eye()); btn.appendChild(bAsk); btn.appendChild(document.createTextNode(' ')); btn.appendChild(bName);

  var panel = document.createElement('div');
  panel.className = 'ag-panel'; panel.hidden = true; panel.id = 'ag-panel';
  btn.setAttribute('aria-controls', 'ag-panel');
  var head = document.createElement('div'); head.className = 'ag-head';
  var ht = document.createElement('div'), hn = document.createElement('b'), hs = document.createElement('small');
  hn.className = 'ag-name'; hn.lang = 'ar'; hn.textContent = NAME;
  ht.appendChild(hn); ht.appendChild(hs); head.appendChild(eye()); head.appendChild(ht);
  var lw = document.createElement('label'), sel = document.createElement('select');
  lw.htmlFor = sel.id = 'ag-who';
  var lq = document.createElement('label'), ta = document.createElement('textarea');
  lq.htmlFor = ta.id = 'ag-q';
  var go = document.createElement('button'); go.className = 'ag-go'; go.type = 'button';
  [head, lw, sel, lq, ta, go].forEach(function (n) { panel.appendChild(n); });
  ASSISTANTS.forEach(function (a, i) { var o = document.createElement('option'); o.value = String(i); o.textContent = a[0]; sel.appendChild(o); });
  document.body.appendChild(btn); document.body.appendChild(panel);

  var lastText = '';
  function label() {
    var t = pack();
    bAsk.textContent = t.ask; btn.setAttribute('aria-label', t.ask + ' ' + NAME);
    hs.textContent = fill(t.sub); lw.textContent = t.who; lq.textContent = t.q; go.textContent = t.go;
    // Swap the default question with the language, but never over what the person typed.
    if (!ta.value || ta.value === lastText) ta.value = fill(t.text);
    lastText = fill(t.text);
  }
  label();
  if (window.MutationObserver) new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  btn.addEventListener('click', function () {
    panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) ta.focus();
  });
  go.addEventListener('click', function () {
    var a = ASSISTANTS[Number(sel.value)] || ASSISTANTS[0];
    var url = a[1] + (a[1].indexOf('?q=') > -1 ? encodeURIComponent(ta.value) : '');
    window.open(url, '_blank', 'noopener');
  });
})();
