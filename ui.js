(function(){
  var css=document.createElement('style');
  css.textContent='.owner{display:none!important}';
  document.head.appendChild(css);
})();
/* IRIS 35 — page chrome */
(function(){
"use strict";
function put(sel, src){
  var el=document.querySelector(sel);
  if(el) el.src=src;
}
put(".lock img","IMG_6698.jpeg");
put(".eye img","IMG_6697.jpeg");
document.querySelectorAll(".lock-mask,.lock-words").forEach(function(n){n.remove();});
var cs=document.createElement("script"); cs.src="/chrome.js?v=photos"; document.head.appendChild(cs);

var LANGS={en:"en",ar:"ar",ru:"ru",zh:"zh-Hans"};
var LANG_PATH={en:"/",ar:"/ar/",ru:"/ru/",zh:"/zh/"};

function langFromPath(){
  var m=location.pathname.match(/^\/(ar|ru|zh)\/?$/);
  return m?m[1]:null;
}

function setLang(l,opts){
  opts=opts||{};
  if(!LANGS[l])l="en";
  var target=LANG_PATH[l]||"/";
  if(!opts.skipNav&&location.pathname!==target&&!(l==="en"&&(location.pathname==="/"||location.pathname===""))){
    location.href=target;
    return;
  }
  try{localStorage.setItem("35-iris-lang",l);}catch(e){}
  var root=document.getElementById("root");
  root.lang=LANGS[l];
  root.dir=(l==="ar")?"rtl":"ltr";
  document.querySelectorAll("#langs .lang-btn").forEach(function(b){
    var on=b.getAttribute("data-lang")===l;
    b.classList.toggle("on",on);
    b.setAttribute("aria-pressed",on?"true":"false");
  });
  if(typeof refreshLang==="function")refreshLang();
  else if(typeof applyI18n==="function")applyI18n(document);
  if(typeof t==="function")document.title=t("page_title")||t("h1");
}

function initialLang(){
  if(typeof window.__IRIS_PAGE_LANG==="string"&&LANGS[window.__IRIS_PAGE_LANG]){
    return window.__IRIS_PAGE_LANG;
  }
  var fromPath=langFromPath();
  if(fromPath)return fromPath;
  var saved=null;
  try{saved=localStorage.getItem("35-iris-lang");}catch(e){}
  if(saved&&LANGS[saved])return saved;
  var list=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||"en"];
  for(var i=0;i<list.length;i++){
    var base=String(list[i]||"").toLowerCase().split("-")[0];
    if(LANGS[base])return base;
  }
  return "en";
}

document.querySelectorAll("#langs .lang-btn").forEach(function(b){
  b.addEventListener("click",function(){setLang(b.getAttribute("data-lang"));});
});
setLang(initialLang(),{skipNav:true});

function tt(id,fallback){
  if(typeof t!=="function")return fallback;
  var s=t(id);return s===id?fallback:s;
}
function replyAsk(text){
  var s=(text||"").toLowerCase();
  if(!s.trim())return tt("a_empty","Write what they said or what you see.");
  if(/seed|mnemonic|private key|12 words|24 words/.test(s))
    return tt("a_seed","Do not paste that here. Wipe the box. Change it on YOUR device.");
  if(/screen ?share|share (the |my )?screen|mirror|anydesk|teamviewer/.test(s))
    return tt("a_screen","Do not share the screen. Hang up.");
  if(/install|apk|cleaner|sideload|\.mobileconfig|profile/.test(s))
    return tt("a_install","Do not install. Open the phone tab.");
  if(/connect|wallet|approve|sign/.test(s))
    return tt("a_connect","Do not connect. Paste a public hash only.");
  if(/2fa|otp|code|verification/.test(s))
    return tt("a_code","Do not send the code. Hang up. Change the password on this phone.");
  if(/price|pay|cost|fee/.test(s))
    return tt("a_price","First pass is free. Extra only after work you asked for.");
  return tt("a_default","Pick a phone tab or paste a public hash.");
}
var askgo=document.getElementById("askgo");
if(askgo)askgo.addEventListener("click",function(){
  document.getElementById("askout").classList.add("on");
  document.getElementById("askrep").textContent=replyAsk(document.getElementById("askq").value);
});

function paintOnline(){
  var bar=document.getElementById("offline-bar");
  if(bar)bar.hidden=navigator.onLine;
  var run=document.getElementById("run");
  if(run)run.disabled=!navigator.onLine;
}
window.addEventListener("online",paintOnline);
window.addEventListener("offline",paintOnline);
paintOnline();

var deferred=null;
var row=document.getElementById("install-row");
var go=document.getElementById("install-go");
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault();deferred=e;
  if(row)row.hidden=false;
});
if(go)go.addEventListener("click",function(){
  if(!deferred)return;
  deferred.prompt();
  deferred.userChoice.then(function(){deferred=null;if(row)row.hidden=true;});
});
window.addEventListener("appinstalled",function(){if(row)row.hidden=true;});

var tabIds=["iphone","android","sig"];
document.querySelectorAll('#desk [role="tab"]').forEach(function(btn,i){
  btn.addEventListener("keydown",function(e){
    var step=(e.key==="ArrowRight")?1:(e.key==="ArrowLeft")?-1:0;
    if(!step)return;
    e.preventDefault();
    var rtl=document.getElementById("root").dir==="rtl";
    var next=(i+(rtl?-step:step)+tabIds.length)%tabIds.length;
    var el=document.getElementById("tab-"+tabIds[next]);
    el.click();el.focus();
  });
});

if("serviceWorker" in navigator&&window.isSecureContext){
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("/sw.js").catch(function(){});
  });
}
})();
