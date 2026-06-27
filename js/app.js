(function(){
  'use strict';

  function pre(){ return location.pathname.includes('/calculator-types/') ? '../' : ''; }

  function buildHeader(){
    var p = pre();
    return '<header class="site-header">'
      +'<a href="'+p+'index.html" class="logo">'
      +'<span class="logo-mark">Calc<em style="font-style:normal;font-family:var(--font-sans)">Hub</em></span>'
      +'<span class="logo-tag">Free Calculators</span>'
      +'</a>'
      +'<div class="theme-pill">'
      +'<button class="theme-btn" id="light-btn" onclick="setTheme(\'light\')">☀ Light</button>'
      +'<button class="theme-btn" id="dark-btn"  onclick="setTheme(\'dark\')">◑ Dark</button>'
      +'</div>'
      +'</header>';
  }

  function buildFooter(){
    var p = pre();
    return '<footer class="site-footer">'
      +'<span>&copy; '+new Date().getFullYear()+' CalcHub — Free online calculators</span>'
      +'<a href="https://play.google.com/store/apps/details?id=com.happyappsforyou.convertpro" target="_blank" rel="noopener" class="footer-app-link" aria-label="Unit Convert Pro on Google Play">'
      +'<span class="footer-app-icon" aria-hidden="true">'
      +'<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">'
      +'<defs><clipPath id="ucpFooterClip"><rect x="0" y="0" width="300" height="300" rx="48"/></clipPath></defs>'
      +'<g clip-path="url(#ucpFooterClip)">'
      +'<rect x="0" y="0" width="150" height="150" fill="#F0524A"/>'
      +'<rect x="150" y="0" width="150" height="150" fill="#1FAE8E"/>'
      +'<rect x="0" y="150" width="150" height="150" fill="#F2C230"/>'
      +'<rect x="150" y="150" width="150" height="150" fill="#6B4FE0"/>'
      +'</g>'
      +'<circle cx="75" cy="75" r="36" fill="none" stroke="#ffffff" stroke-width="6"/>'
      +'<text x="75" y="91" text-anchor="middle" font-size="38" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">$</text>'
      +'<circle cx="225" cy="75" r="36" fill="none" stroke="#ffffff" stroke-width="6"/>'
      +'<line x1="225" y1="75" x2="225" y2="54" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>'
      +'<line x1="225" y1="75" x2="241" y2="86" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>'
      +'<g transform="translate(75,225)">'
      +'<rect x="-9" y="-58" width="18" height="70" rx="9" fill="#ffffff"/>'
      +'<circle cx="0" cy="22" r="20" fill="#ffffff"/>'
      +'<rect x="-5" y="-50" width="10" height="55" rx="5" fill="#F2C230"/>'
      +'<circle cx="0" cy="22" r="13" fill="#F2C230"/>'
      +'</g>'
      +'<g transform="translate(225,225)" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none">'
      +'<line x1="-38" y1="-12" x2="30" y2="-12"/>'
      +'<polyline points="18,-24 30,-12 18,0"/>'
      +'<line x1="38" y1="12" x2="-30" y2="12"/>'
      +'<polyline points="-18,24 -30,12 -18,0"/>'
      +'</g>'
      +'</svg>'
      +'</span>'
      +'<span class="footer-app-copy">'
      +'<span class="footer-app-title">Unit Convert Pro</span>'
      +'<span class="footer-app-desc">Every unit, every currency, instant conversions on the go</span>'
      +'</span>'
      +'<img class="footer-app-badge" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" loading="lazy">'
      +'</a>'
      +'<div class="footer-links">'
      +'<a href="'+p+'index.html">Home</a>'
      +'<a href="'+p+'pages/privacy.html">Privacy</a>'
      +'<a href="'+p+'pages/terms.html">Terms</a>'
      +'<a href="'+p+'pages/contact.html">Contact</a>'
      +'</div>'
      +'</footer>'
      +'<div id="toast"></div>';
  }

  function injectHeroBg(){
    var hero = document.querySelector('.hero');
    if(!hero) return;
    // Don't inject on the homepage (it already has it)
    if(document.querySelector('.hero-bg')) return;
    var css = '<style id="hero-bg-style">'
      +'.hero-bg{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}'
      +'.hero-bg svg{width:100%;height:100%;display:block}'
      +'.hero>*:not(.hero-bg){position:relative;z-index:1}'
      +'.hero-bg .hb-blob-1{fill:var(--accent-mid,#5b5bf0);opacity:.34}'
      +'.hero-bg .hb-blob-2{fill:#ffb86b;opacity:.28}'
      +'.hero-bg .hb-blob-3{fill:var(--accent-mid,#5b5bf0);opacity:.20}'
      +'.hero-bg .hb-blob-4{fill:#7CFA9C;opacity:.26}'
      +'.hero-bg .hb-blob-5{fill:#FFD76A;opacity:.20}'
      +'.hero-bg .hb-keys rect{fill:none;stroke:var(--accent-mid,#5b5bf0);stroke-width:2;opacity:.26}'
      +'.hero-bg .hb-symbol{font-family:var(--font-sans);font-weight:700;fill:var(--accent-mid,#5b5bf0);opacity:.17}'
      +'.hero-bg .hb-frame{fill:none;stroke:var(--accent-mid,#5b5bf0);stroke-width:2;opacity:.10}'
      +'[data-theme="dark"] .hero-bg .hb-blob-1{opacity:.42}'
      +'[data-theme="dark"] .hero-bg .hb-blob-2{opacity:.34}'
      +'[data-theme="dark"] .hero-bg .hb-blob-3{opacity:.26}'
      +'[data-theme="dark"] .hero-bg .hb-blob-4{opacity:.32}'
      +'[data-theme="dark"] .hero-bg .hb-blob-5{opacity:.26}'
      +'[data-theme="dark"] .hero-bg .hb-keys rect{opacity:.32}'
      +'[data-theme="dark"] .hero-bg .hb-symbol{opacity:.22}'
      +'[data-theme="dark"] .hero-bg .hb-frame{opacity:.16}'
      +'</style>';
    var svg = '<div class="hero-bg" aria-hidden="true">'
      +'<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
      +'<defs><filter id="heroBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="55"/></filter></defs>'
      +'<rect class="hb-frame" x="250" y="-60" width="720" height="420" rx="64" transform="rotate(-5 610 150)"/>'
      +'<ellipse class="hb-blob-1" cx="980" cy="40" rx="260" ry="180" filter="url(#heroBlur)"/>'
      +'<ellipse class="hb-blob-2" cx="140" cy="280" rx="230" ry="140" filter="url(#heroBlur)"/>'
      +'<ellipse class="hb-blob-3" cx="600" cy="20" rx="170" ry="100" filter="url(#heroBlur)"/>'
      +'<ellipse class="hb-blob-4" cx="260" cy="70" rx="150" ry="90" filter="url(#heroBlur)"/>'
      +'<ellipse class="hb-blob-5" cx="880" cy="290" rx="150" ry="90" filter="url(#heroBlur)"/>'
      +'<g class="hb-keys" transform="translate(55,20) rotate(-9)">'
      +'<rect x="0" y="0" width="32" height="32" rx="9"/><rect x="44" y="0" width="32" height="32" rx="9"/><rect x="88" y="0" width="32" height="32" rx="9"/>'
      +'<rect x="0" y="44" width="32" height="32" rx="9"/><rect x="44" y="44" width="32" height="32" rx="9"/><rect x="88" y="44" width="32" height="32" rx="9"/>'
      +'</g>'
      +'<g class="hb-keys" transform="translate(1015,200) rotate(11)">'
      +'<rect x="0" y="0" width="26" height="26" rx="7"/><rect x="36" y="0" width="26" height="26" rx="7"/>'
      +'<rect x="0" y="36" width="26" height="26" rx="7"/><rect x="36" y="36" width="26" height="26" rx="7"/>'
      +'</g>'
      +'<text class="hb-symbol" x="110" y="180" font-size="74" transform="rotate(-11 110 180)">÷</text>'
      +'<text class="hb-symbol" x="1075" y="140" font-size="64" transform="rotate(9 1075 140)">×</text>'
      +'<text class="hb-symbol" x="970" y="285" font-size="58" transform="rotate(-7 970 285)">%</text>'
      +'<text class="hb-symbol" x="55" y="260" font-size="60" transform="rotate(8 55 260)">=</text>'
      +'<text class="hb-symbol" x="690" y="290" font-size="68" transform="rotate(-5 690 290)">+</text>'
      +'<text class="hb-symbol" x="330" y="285" font-size="52" transform="rotate(6 330 285)">√</text>'
      +'<text class="hb-symbol" x="1140" y="180" font-size="56" transform="rotate(-8 1140 180)">π</text>'
      +'</svg></div>';
    // Inject CSS once into head
    if(!document.getElementById('hero-bg-style')){
      document.head.insertAdjacentHTML('beforeend', css);
    }
    // Make hero position:relative if not already
    hero.style.position = 'relative';
    hero.insertAdjacentHTML('afterbegin', svg);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if(h) h.outerHTML = buildHeader();
    if(f) f.outerHTML = buildFooter();
    injectHeroBg();

    // Apply saved theme
    var saved = localStorage.getItem('calchub_theme') || 'light';
    applyTheme(saved);

    // FAQ
    document.querySelectorAll('.faq-q').forEach(function(q){
      q.addEventListener('click', function(){ q.closest('.faq-item').classList.toggle('open'); });
    });

    // Radio pills
    document.querySelectorAll('.radio-pill').forEach(function(pill){
      pill.addEventListener('click', function(){
        var name = pill.querySelector('input').name;
        document.querySelectorAll('.radio-pill input[name="'+name+'"]').forEach(function(inp){
          inp.closest('.radio-pill').classList.remove('checked');
        });
        pill.classList.add('checked');
        pill.querySelector('input').checked = true;
      });
    });
  });

  window.setTheme = function(t){
    applyTheme(t);
    localStorage.setItem('calchub_theme', t);
  };

  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-btn').forEach(function(b){ b.classList.remove('on'); });
    var btn = document.getElementById(t+'-btn');
    if(btn) btn.classList.add('on');
  }

  window.showToast = function(msg){
    var t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 2500);
  };

  window.fmt = function(n, decimals){
    if(isNaN(n)||!isFinite(n)) return '—';
    decimals = decimals !== undefined ? decimals : 2;
    return n.toLocaleString('en-US', {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
  };
  window.fmtCur = function(n){ return '$'+window.fmt(n,2); };
  window.fmtPct = function(n){ return window.fmt(n,2)+'%'; };
  window.fmtYrs = function(n){
    var y=Math.floor(n), m=Math.round((n-y)*12);
    if(m===12){y++;m=0;}
    if(y===0) return m+'m';
    if(m===0) return y+'yr';
    return y+'yr '+m+'m';
  };

  window.v = function(id){ return parseFloat(document.getElementById(id).value)||0; };
  window.vs = function(id){ return document.getElementById(id).value; };
  window.setEl = function(id, val){ var el=document.getElementById(id); if(el) el.textContent=val; };
  window.showRes = function(id){ var el=document.getElementById(id); if(el){ el.classList.add('show'); el.scrollIntoView({behavior:'smooth', block:'nearest'}); }};
})();