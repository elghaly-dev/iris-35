/* ✦ Ask the Faithful Servant — self-contained button, styled to the site.
   No "ChatGPT"/"AI" label. Opens the chosen assistant with a product-specific question. */
(function () {
  var tag = document.currentScript || (function(){var s=document.querySelectorAll('script[data-product]');return s[s.length-1];})();
  var product = (tag && tag.getAttribute('data-product')) || document.title;
  var q = 'What is ' + product + ' by Elghaly and how does it work?';

  var ASSISTANTS = [
    ['ChatGPT',    'https://chat.openai.com/?q='],
    ['Claude',     'https://claude.ai/new?q='],
    ['Gemini',     'https://gemini.google.com/app'],
    ['Grok',       'https://grok.com/?q='],
    ['Perplexity', 'https://www.perplexity.ai/search?q=']
  ];

  var css = document.createElement('style');
  css.textContent = [
    '.fs-btn{position:fixed;right:18px;bottom:18px;z-index:9998;display:inline-flex;align-items:center;gap:8px;',
    'padding:12px 18px;border-radius:999px;border:1px solid rgba(212,175,55,.45);background:rgba(10,10,12,.92);',
    'color:#efe8d8;font:500 14px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(8px);',
    'box-shadow:0 8px 30px rgba(0,0,0,.45)}',
    '.fs-btn:hover{border-color:#d4af37;color:#fff}',
    '.fs-panel{position:fixed;right:18px;bottom:74px;z-index:9999;width:min(340px,calc(100vw - 36px));',
    'padding:16px;border-radius:16px;border:1px solid rgba(212,175,55,.35);background:rgba(10,10,12,.97);',
    'color:#efe8d8;font:400 14px/1.5 ui-sans-serif,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6)}',
    '.fs-panel[hidden]{display:none}',
    '.fs-panel label{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.7;margin:0 0 6px}',
    '.fs-panel select,.fs-panel textarea{width:100%;background:rgba(255,255,255,.04);color:#efe8d8;border:1px solid rgba(212,175,55,.25);border-radius:10px;padding:9px 10px;font:inherit;margin-bottom:12px}',
    '.fs-panel textarea{min-height:74px;resize:vertical}',
    '.fs-go{width:100%;padding:11px;border-radius:10px;border:1px solid #d4af37;background:#d4af37;color:#0a0a0c;font:600 14px/1 inherit;cursor:pointer}'
  ].join('');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.className = 'fs-btn'; btn.type = 'button'; btn.textContent = '✦ Ask the Faithful Servant';
  var panel = document.createElement('div');
  panel.className = 'fs-panel'; panel.hidden = true;
  panel.innerHTML = '<label for="fs-who">Assistant</label><select id="fs-who"></select>' +
                    '<label for="fs-q">Question</label><textarea id="fs-q"></textarea>' +
                    '<button class="fs-go" type="button">Ask</button>';
  document.body.appendChild(btn); document.body.appendChild(panel);
  var sel = panel.querySelector('#fs-who'), ta = panel.querySelector('#fs-q');
  ASSISTANTS.forEach(function (a, i) {
    var o = document.createElement('option'); o.value = String(i); o.textContent = a[0]; sel.appendChild(o);
  });
  ta.value = q;
  btn.addEventListener('click', function () { panel.hidden = !panel.hidden; if (!panel.hidden) ta.focus(); });
  panel.querySelector('.fs-go').addEventListener('click', function () {
    var a = ASSISTANTS[Number(sel.value)] || ASSISTANTS[0];
    var url = a[1] + (a[1].indexOf('?q=') > -1 ? encodeURIComponent(ta.value) : '');
    window.open(url, '_blank', 'noopener');
  });
})();
