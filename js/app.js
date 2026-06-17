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
      +'<div class="footer-links">'
      +'<a href="'+p+'index.html">Home</a>'
      +'<a href="'+p+'pages/privacy.html">Privacy</a>'
      +'<a href="'+p+'pages/terms.html">Terms</a>'
      +'<a href="'+p+'pages/contact.html">Contact</a>'
      +'</div>'
      +'</footer>'
      +'<div id="toast"></div>';
  }

  document.addEventListener('DOMContentLoaded', function(){
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if(h) h.outerHTML = buildHeader();
    if(f) f.outerHTML = buildFooter();

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