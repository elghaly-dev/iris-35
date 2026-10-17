(function(){
  var KEY='house-theme';
  var THEMES={
    house:{bg:'#5a4fc0',ink:'#ffffff',dim:'#b9b3e6',accent:'#c9c2ff',card:'#0d0b1f',line:'#2e2856',dot:'#c9c2ff'}
  };
  var LABELS={house:'elghaly'};
  var ORDER=['house'];
  function apply(name){
    if(!(name in THEMES)) name='house';
    var t=THEMES[name];
    var r=document.documentElement;
    r.setAttribute('data-theme', name);
    r.style.setProperty('--bg',t.bg);
    r.style.setProperty('--ink',t.ink);
    r.style.setProperty('--dim',t.dim);
    r.style.setProperty('--p',t.accent);
    r.style.setProperty('--g',t.accent);
    r.style.setProperty('--c',t.accent);
    r.style.setProperty('--l',t.line);
    r.style.setProperty('--card',t.card);
    r.style.setProperty('--purple',t.accent);
    r.style.setProperty('--green',t.accent);
    r.style.setProperty('--cyan',t.accent);
    r.style.setProperty('--accent',t.accent);
    r.style.setProperty('--line',t.line);
    r.style.setProperty('--surface',t.card);
    if(document.body){document.body.style.background=t.bg;document.body.style.color=t.ink;}
    try{localStorage.setItem(KEY,name);}catch(e){}
    document.querySelectorAll('[data-theme-item]').forEach(function(el){
      el.classList.toggle('on', el.getAttribute('data-theme-item')===name);
    });
    var cur=document.getElementById('themeCur');
    if(cur) cur.textContent=LABELS[name];
  }
  function mount(){
    if(document.getElementById('themeMenu')) return;
    if(!document.getElementById('theme-css')){
      var css=document.createElement('style'); css.id='theme-css';
      css.textContent=[
        '.theme-wrap{position:relative;flex:0 0 auto}',
        '.theme-btn{display:flex;align-items:center;gap:6px;background:var(--card,#0d0b1f);color:var(--ink);border:1px solid var(--line,var(--l));border-radius:999px;padding:6px 10px;font:600 11px ui-sans-serif,system-ui;cursor:pointer}',
        '.theme-dot{width:10px;height:10px;border-radius:50%;background:#c9c2ff;flex:0 0 auto}',
        '.theme-panel{display:none;position:absolute;right:0;top:calc(100% + 8px);min-width:200px;background:#17142f;border:1px solid #2e2856;border-radius:16px;padding:10px;z-index:80;box-shadow:0 18px 40px rgba(0,0,0,.45)}',
        '.theme-wrap.open .theme-panel{display:block}',
        '.theme-panel p{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#b9b3e6;margin:0 8px 8px}',
        '.theme-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:#ffffff;padding:10px 10px;border-radius:12px;font:600 14px ui-sans-serif,system-ui;cursor:pointer;text-align:left}',
        '.theme-item.on{background:#2e2856;color:#c9c2ff}',
        '.theme-item i{width:14px;height:14px;border-radius:50%;flex:0 0 auto;display:block}',
        '.theme-item .ck{margin-left:auto;opacity:0}',
        '.theme-item.on .ck{opacity:1}'
      ].join('');
      document.head.appendChild(css);
    }
    var wrap=document.createElement('div');
    wrap.className='theme-wrap';
    wrap.id='themeMenu';
    wrap.innerHTML='<button type="button" class="theme-btn" id="themeOpen" title="Choose theme"><i class="theme-dot"></i><span id="themeCur">Midnight</span></button>';
    var panel=document.createElement('div');
    panel.className='theme-panel';
    panel.innerHTML='<p>Choose theme</p>';
    ORDER.forEach(function(k){
      var b=document.createElement('button');
      b.type='button';
      b.className='theme-item';
      b.setAttribute('data-theme-item',k);
      b.innerHTML='<i style="background:'+THEMES[k].dot+'"></i><span>'+LABELS[k]+'</span><span class="ck">\u2713</span>';
      b.onclick=function(){apply(k);wrap.classList.remove('open');};
      panel.appendChild(b);
    });
    wrap.appendChild(panel);
    var host=document.querySelector('.header-right')||document.querySelector('.lang')||document.querySelector('.langs')||document.querySelector('header')||document.querySelector('.top')||document.body;
    host.appendChild(wrap);
    document.getElementById('themeOpen').onclick=function(e){
      e.stopPropagation();
      wrap.classList.toggle('open');
    };
    document.addEventListener('click',function(){wrap.classList.remove('open');});
  }
  var start='midnight';
  try{start=localStorage.getItem(KEY)||'midnight';}catch(e){}
  if(!(start in THEMES)) start='midnight';
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){mount();apply(start);});
  }else{mount();apply(start);}
})();
