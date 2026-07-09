// scroll fluido dai pulsanti
document.querySelectorAll('[data-goto]').forEach(function(btn){
  btn.addEventListener('click', function(){
    var t = document.getElementById(this.getAttribute('data-goto'));
    if(t){ t.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});
// navbar che si compatta allo scroll
var nav = document.getElementById('navbar');
var scroller = document.scrollingElement || document.documentElement;
function aggiornaNav(){ nav.classList.toggle('scrolled', (window.scrollY||scroller.scrollTop) > 40); }
window.addEventListener('scroll', aggiornaNav, {passive:true});
document.addEventListener('scroll', aggiornaNav, {passive:true, capture:true});
aggiornaNav();
// reveal on scroll
function mostraTutto(){ document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visibile'); }); }
if('IntersectionObserver' in window){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visibile'); obs.unobserve(e.target); } });
  },{threshold:.08});
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  // rete di sicurezza: se dopo 2,5s nulla è apparso, mostra tutto
  setTimeout(function(){
    if(!document.querySelector('.reveal.visibile')) mostraTutto();
  }, 2500);
}else{
  mostraTutto();
}

// ---- effetti ----
var ridotto = false; // animazioni sempre attive

// barra di avanzamento
var progress = document.getElementById('progress');
function aggiornaProgress(){
  var st = window.scrollY || scroller.scrollTop;
  var h = scroller.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (st/h)*100 : 0) + '%';
}
window.addEventListener('scroll', aggiornaProgress, {passive:true});
document.addEventListener('scroll', aggiornaProgress, {passive:true, capture:true});
aggiornaProgress();

// foglioline fluttuanti
if(!ridotto){
  var contFoglie = document.querySelector('.foglie');
  for(var i=0;i<9;i++){
    var f = document.createElement('span');
    f.className = 'fogliolina';
    f.textContent = '🌿';
    f.style.left = (5 + Math.random()*90) + '%';
    f.style.animationDuration = (9 + Math.random()*9) + 's';
    f.style.animationDelay = (-Math.random()*14) + 's';
    f.style.fontSize = (14 + Math.random()*16) + 'px';
    f.style.opacity = .25 + Math.random()*.35;
    contFoglie.appendChild(f);
  }
}

// sfarfallio periodico del neon
var neonTitle = document.querySelector('h1.neon');
if(!ridotto && neonTitle){
  setInterval(function(){
    if(Math.random() < .5){
      neonTitle.classList.add('flicker');
      setTimeout(function(){ neonTitle.classList.remove('flicker'); }, 500);
    }
  }, 3000);
}

// parallasse hero
var hero = document.querySelector('header');
if(!ridotto && hero){
  window.addEventListener('scroll', function(){
    var st = window.scrollY || scroller.scrollTop;
    if(st < window.innerHeight){
      hero.style.backgroundPosition = 'center calc(32% + ' + st*0.25 + 'px)';
    }
  }, {passive:true});
}

// tilt 3D sulle card del menu (solo con mouse)
if(!ridotto && window.matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.piatto').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left)/r.width - .5;
      var y = (e.clientY - r.top)/r.height - .5;
      card.classList.add('tilt');
      card.style.transform = 'perspective(1100px) rotateY(' + (x*4) + 'deg) rotateX(' + (-y*4) + 'deg)';
    });
    card.addEventListener('mouseleave', function(){
      card.classList.remove('tilt');
      card.style.transform = '';
    });
  });
}

// lightbox gallery
var lb = document.getElementById('lightbox');
var lbImg = lb.querySelector('img');
var lbNome = lb.querySelector('.lb-nome');
var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
var corrente = 0;
function visibili(){ return items.filter(function(it){ return !it.classList.contains('nascosto'); }); }
function apriLB(i){
  corrente = (i + items.length) % items.length;
  if(items[corrente].classList.contains('nascosto')){
    var vis = visibili();
    if(!vis.length) return;
    corrente = items.indexOf(vis[0]);
  }
  lbImg.src = items[corrente].querySelector('img').src;
  lbImg.alt = items[corrente].querySelector('img').alt;
  lbNome.textContent = items[corrente].getAttribute('data-nome') || '';
  lb.classList.add('aperto');
  document.body.style.overflow = 'hidden';
}
function chiudiLB(){
  lb.classList.remove('aperto');
  document.body.style.overflow = '';
}
items.forEach(function(it, i){ it.addEventListener('click', function(){ apriLB(i); }); });

// filtri gallery
var filtri = document.querySelectorAll('.filtro');
filtri.forEach(function(f){
  f.addEventListener('click', function(){
    filtri.forEach(function(x){ x.classList.remove('attivo'); });
    f.classList.add('attivo');
    var cat = f.getAttribute('data-cat');
    document.querySelectorAll('.g-item').forEach(function(it, idx){
      var mostra = (cat === 'tutti' || it.getAttribute('data-cat') === cat);
      it.classList.toggle('nascosto', !mostra);
      if(mostra){ it.style.animationDelay = (idx * 0.03) + 's'; }
    });
  });
});
lb.querySelector('.lb-chiudi').addEventListener('click', chiudiLB);
function saltaLB(dir){
  var vis = visibili();
  if(!vis.length) return;
  var pos = vis.indexOf(items[corrente]);
  var next = vis[(pos + dir + vis.length) % vis.length];
  apriLB(items.indexOf(next));
}
lb.querySelector('.lb-prev').addEventListener('click', function(e){ e.stopPropagation(); saltaLB(-1); });
lb.querySelector('.lb-next').addEventListener('click', function(e){ e.stopPropagation(); saltaLB(1); });
lb.addEventListener('click', function(e){ if(e.target === lb) chiudiLB(); });
document.addEventListener('keydown', function(e){
  if(!lb.classList.contains('aperto')) return;
  if(e.key === 'Escape') chiudiLB();
  if(e.key === 'ArrowLeft') saltaLB(-1);
  if(e.key === 'ArrowRight') saltaLB(1);
});

// stato dei tavoli in tempo reale — sola lettura per il cliente,
// gestito manualmente dal proprietario (niente form, niente messaggi automatici)
var piantina = document.getElementById('piantina');
if(piantina){
  // ---- stato dei tavoli in tempo reale (solo per oggi) ----
  // ogni tavolo può avere al massimo una prenotazione attiva: il proprietario
  // la segna quando arriva una chiamata/messaggio, il tavolo diventa
  // "occupato" all'orario indicato e dopo 2 ore torna "libero" da solo
  // (o subito se il proprietario clicca "Libera tavolo").
  var LS_TAVOLI_OGGI = 'vs_tavoli_oggi';
  var DUE_ORE_MS = 2 * 60 * 60 * 1000;
  var statoPrecedente = null;

  function chiaveGiornoOggi(){ return new Date().toDateString(); }
  function orarioOraCorrente(){
    var d = new Date();
    return ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
  }
  function parseOggiOra(oraStr){
    var po = oraStr.split(':');
    var d = new Date();
    d.setHours(+po[0], +po[1]||0, 0, 0);
    return d.getTime();
  }
  function statoLiveTavolo(rec, now){
    if(!rec || !rec.inizio) return 'libero';
    if(now < rec.inizio) return 'prenotato';
    if(now < rec.inizio + DUE_ORE_MS) return 'occupato';
    return 'libero';
  }
  function leggiTavoliOggi(){
    var raw = null;
    try{ raw = JSON.parse(localStorage.getItem(LS_TAVOLI_OGGI) || 'null'); }catch(err){ raw = null; }
    var oggi = chiaveGiornoOggi();
    if(!raw || raw.giorno !== oggi || !raw.tavoli){
      raw = { giorno: oggi, tavoli: {} };
      TAVOLI.forEach(function(t){ raw.tavoli[t.id] = { ora: null, cliente: null, inizio: null }; });
    }
    var now = Date.now(), cambiato = false;
    Object.keys(raw.tavoli).forEach(function(id){
      var rec = raw.tavoli[id];
      if(rec.inizio && now >= rec.inizio + DUE_ORE_MS){
        raw.tavoli[id] = { ora: null, cliente: null, inizio: null };
        cambiato = true;
      }
    });
    if(cambiato) salvaTavoliOggi(raw);
    return raw;
  }
  function salvaTavoliOggi(raw){
    try{ localStorage.setItem(LS_TAVOLI_OGGI, JSON.stringify(raw)); }
    catch(err){ console.error('localStorage:', err); }
  }
  // usato dal proprietario: segna un tavolo come occupato/prenotato,
  // per una telefonata o un messaggio WhatsApp ricevuti fuori dal sito
  function occupaTavolo(id){
    var ora = prompt('A che ora? (HH:MM, lascia vuoto per adesso)', orarioOraCorrente());
    if(ora === null) return; // annullato
    ora = ora.trim() || orarioOraCorrente();
    if(!/^\d{1,2}:\d{2}$/.test(ora)) ora = orarioOraCorrente();
    var nome = prompt('Nome cliente (facoltativo):');
    var inizio = parseOggiOra(ora);
    var raw = leggiTavoliOggi();
    raw.tavoli[id] = { ora: ora, cliente: nome || null, inizio: inizio };
    salvaTavoliOggi(raw);
    mostraToast('Tavolo ' + id + (inizio > Date.now() ? ' prenotato per le ' + ora : ' segnato occupato') + ' 🌿');
    renderGestioneTavoli();
    disegnaPiantinaViva();
  }
  function liberaTavolo(id){
    var raw = leggiTavoliOggi();
    raw.tavoli[id] = { ora: null, cliente: null, inizio: null };
    salvaTavoliOggi(raw);
  }
  function mostraToast(msg){
    var el = document.getElementById('toast-tavoli');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('mostra');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('mostra'); }, 4200);
    if('Notification' in window && Notification.permission === 'granted'){
      try{ new Notification('verde salvia 🌿', { body: msg }); }catch(err){}
    }
  }
  var gtNotifiche = document.getElementById('gt-notifiche');
  if(gtNotifiche){
    if(!('Notification' in window)){ gtNotifiche.style.display = 'none'; }
    gtNotifiche.addEventListener('click', function(){
      Notification.requestPermission().then(function(perm){
        if(perm === 'granted') mostraToast('Notifiche attivate 🔔');
      });
    });
  }
  var gtLista = document.getElementById('gt-lista');
  function renderGestioneTavoli(){
    if(!gtLista) return;
    var raw = leggiTavoliOggi();
    var now = Date.now();
    gtLista.innerHTML = '';
    TAVOLI.forEach(function(t){
      var rec = raw.tavoli[t.id];
      var stato = statoLiveTavolo(rec, now);
      var riga = document.createElement('div');
      riga.className = 'gt-riga';
      var info = '<b>' + t.id + '</b> · ' + POSTI[t.tipo];
      if(stato !== 'libero') info += ' · ore ' + rec.ora + (rec.cliente ? ' · ' + rec.cliente : '');
      riga.innerHTML = '<div class="gt-info">' + info + '</div>'
        + '<span class="gt-stato ' + stato + '">' + stato + '</span>'
        + (stato === 'libero'
          ? '<button type="button" class="gt-occupa">Occupa tavolo</button>'
          : '<button type="button" class="gt-libera">Libera tavolo</button>');
      if(stato === 'libero'){
        riga.querySelector('.gt-occupa').addEventListener('click', function(){ occupaTavolo(t.id); });
      }else{
        riga.querySelector('.gt-libera').addEventListener('click', function(){
          liberaTavolo(t.id);
          mostraToast('Tavolo ' + t.id + ' è ora libero 🌿');
          renderGestioneTavoli();
          disegnaPiantinaViva();
        });
      }
      gtLista.appendChild(riga);
    });
  }
  function controllaScadenzeTavoli(){
    var raw = leggiTavoliOggi();
    var now = Date.now();
    var attuale = {};
    TAVOLI.forEach(function(t){ attuale[t.id] = statoLiveTavolo(raw.tavoli[t.id], now); });
    if(statoPrecedente && document.body.classList.contains('manager')){
      Object.keys(attuale).forEach(function(id){
        if(statoPrecedente[id] !== 'libero' && attuale[id] === 'libero'){
          mostraToast('Tavolo ' + id + ' è ora libero 🌿');
        }
      });
    }
    statoPrecedente = attuale;
    disegnaPiantinaViva();
    if(document.body.classList.contains('manager')) renderGestioneTavoli();
  }
  // ---- piantina dei tavoli ----
  var TAVOLI = [
    {id:'T1', tipo:'t2', x:10, y:22},
    {id:'T2', tipo:'t2', x:8,  y:50},
    {id:'T3', tipo:'t2', x:11, y:78},
    {id:'T4', tipo:'t2', x:30, y:26},
    {id:'T5', tipo:'t2', x:27, y:58},
    {id:'T6', tipo:'t2', x:44, y:82},
    {id:'T10',tipo:'t3', x:47, y:38},
    {id:'T12',tipo:'t6', x:59, y:64},
    {id:'T13',tipo:'t6', x:57, y:16},
    {id:'T7', tipo:'t2', x:76, y:24},
    {id:'T8', tipo:'t2', x:73, y:52},
    {id:'T9', tipo:'t2', x:77, y:80},
    {id:'T11',tipo:'t3', x:90, y:36},
    {id:'T14',tipo:'t6', x:91, y:68}
  ];
  var POSTI = { t2:'2p', t3:'3p', t6:'6p' };
  TAVOLI.forEach(function(t){
    var el = document.createElement('div');
    el.className = 'tavolo ' + t.tipo;
    el.id = 'tav-' + t.id;
    el.style.left = t.x + '%';
    el.style.top = t.y + '%';
    el.innerHTML = '<span class="t-id">' + t.id + '</span><span class="t-posti">' + POSTI[t.tipo] + '</span>';
    piantina.appendChild(el);
  });
  // in modalità manager, toccare un tavolo lo occupa/libera direttamente
  piantina.addEventListener('click', function(e){
    if(!document.body.classList.contains('manager')) return;
    var el = e.target.closest('.tavolo'); if(!el) return;
    var id = el.id.replace('tav-', '');
    var raw = leggiTavoliOggi();
    var stato = statoLiveTavolo(raw.tavoli[id], Date.now());
    if(stato === 'libero'){ occupaTavolo(id); }
    else{
      liberaTavolo(id);
      mostraToast('Tavolo ' + id + ' è ora libero 🌿');
      renderGestioneTavoli();
      disegnaPiantinaViva();
    }
  });
  function disegnaPiantinaViva(){
    var raw = leggiTavoliOggi();
    var now = Date.now();
    TAVOLI.forEach(function(t){
      var el = document.getElementById('tav-' + t.id);
      if(!el) return;
      var stato = statoLiveTavolo(raw.tavoli[t.id], now);
      el.classList.toggle('occ', stato === 'occupato');
      el.classList.toggle('prenotato', stato === 'prenotato');
      el.title = stato === 'libero' ? 'Libero'
        : (stato === 'prenotato' ? 'Prenotato per le ' + raw.tavoli[t.id].ora
          : 'Occupato (prenotato per le ' + raw.tavoli[t.id].ora + ')');
    });
  }
  controllaScadenzeTavoli();
  setInterval(controllaScadenzeTavoli, 20000);
  window.addEventListener('storage', controllaScadenzeTavoli);
  document.addEventListener('vs:manager-on', function(){
    renderGestioneTavoli();
    disegnaPiantinaViva();
  });
}

// ================= AREA MANAGER =================
var MANAGER_PASSWORD = 'salvia2026'; // ⚠️ cambia questa password prima di pubblicare

var overlay = document.getElementById('login-overlay');
var passInput = document.getElementById('login-pass');
function apriLogin(){
  overlay.classList.add('aperto'); passInput.value=''; setTimeout(function(){ passInput.focus(); },100);
}
document.getElementById('apri-login').addEventListener('click', apriLogin);
// QR manager: se l'indirizzo contiene #manager o ?manager, apri subito il login
// (alcuni lettori QR/browser perdono il frammento #, quindi controlliamo anche la query string)
function isLinkManager(){
  var hash = (window.location.hash || '').toLowerCase();
  var params = new URLSearchParams(window.location.search);
  return hash.indexOf('manager') !== -1 || params.has('manager');
}
if(isLinkManager()){ setTimeout(apriLogin, 600); }
document.getElementById('login-annulla').addEventListener('click', function(){ overlay.classList.remove('aperto'); });
overlay.addEventListener('click', function(e){ if(e.target === overlay) overlay.classList.remove('aperto'); });
function tentaLogin(){
  if(passInput.value === MANAGER_PASSWORD){
    overlay.classList.remove('aperto');
    attivaManager();
  }else{
    passInput.classList.add('errore');
    setTimeout(function(){ passInput.classList.remove('errore'); }, 450);
  }
}
document.getElementById('login-entra').addEventListener('click', tentaLogin);
passInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') tentaLogin(); });

// elementi modificabili in modalità manager
var SEL_EDITABILI = ['.hero-badge','.hero-sub','.hero-dati','.eyebrow','h2','.sotto-titolo',
  '.piatto h3','.piatto .quando','.voce b','.voce span','#chisiamo p','.citazione','.citazione-fonte',
  '.indirizzo','.stelle','.super-big','.super-sub','.super-card h3',
  '.marquee span','.editabile-footer','.login-card h3','.recensione-testo','.recensione-nome'];

function attivaManager(){
  document.body.classList.add('manager');
  SEL_EDITABILI.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      el.setAttribute('contenteditable','true');
      el.classList.add('editabile');
    });
  });
  document.dispatchEvent(new Event('vs:manager-on'));
}
function disattivaManager(){
  document.body.classList.remove('manager');
  document.querySelectorAll('[contenteditable]').forEach(function(el){
    el.removeAttribute('contenteditable');
    el.classList.remove('editabile');
  });
}
document.getElementById('mb-esci').addEventListener('click', disattivaManager);

// sostituzione immagini: in modalità manager, clic sulla foto → scegli file
var imgInput = document.getElementById('img-input');
var imgTarget = null;
document.addEventListener('click', function(e){
  if(!document.body.classList.contains('manager')) return;
  var img = e.target.closest('img');
  if(img && !e.target.closest('.manager-bar')){
    e.preventDefault(); e.stopPropagation();
    imgTarget = img;
    imgInput.click();
  }
}, true);
imgInput.addEventListener('change', function(){
  var file = imgInput.files[0];
  if(!file || !imgTarget) return;
  var reader = new FileReader();
  reader.onload = function(){ imgTarget.src = reader.result; };
  reader.readAsDataURL(file);
  imgInput.value = '';
});

// blocca il lightbox mentre si è manager (il clic serve a sostituire la foto)
// (gestito sopra con stopPropagation in fase di capture)

// salva: genera il file HTML aggiornato e lo scarica
document.getElementById('mb-salva').addEventListener('click', function(){
  var clone = document.documentElement.cloneNode(true);
  // pulizia dello stato manager e dinamico
  clone.querySelectorAll('[contenteditable]').forEach(function(el){
    el.removeAttribute('contenteditable'); el.classList.remove('editabile');
  });
  var b = clone.querySelector('body');
  b.classList.remove('manager'); b.style.overflow='';
  var ov = clone.querySelector('#login-overlay'); if(ov) ov.classList.remove('aperto');
  var lbx = clone.querySelector('#lightbox'); if(lbx) lbx.classList.remove('aperto');
  var nv = clone.querySelector('nav'); if(nv) nv.classList.remove('scrolled');
  var pg = clone.querySelector('#progress'); if(pg) pg.style.width='0';
  var fg = clone.querySelector('.foglie'); if(fg) fg.innerHTML='';
  clone.querySelectorAll('.reveal').forEach(function(el){ el.classList.remove('visibile'); });
  clone.querySelectorAll('.g-item').forEach(function(el){ el.style.animationDelay=''; el.classList.remove('nascosto'); });
  clone.querySelectorAll('.filtro').forEach(function(f,i){ f.classList.toggle('attivo', i===0); });
  var neonEl = clone.querySelector('h1.neon'); if(neonEl) neonEl.classList.remove('flicker');
  var heroEl = clone.querySelector('header'); if(heroEl) heroEl.style.backgroundPosition='';
  clone.querySelectorAll('.piatto').forEach(function(p){ p.style.transform=''; p.classList.remove('tilt'); });

  var contenuto = '<!DOCTYPE html>\n' + clone.outerHTML;
  var blob = new Blob([contenuto], {type:'text/html'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'verdesalvia.html';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
});
