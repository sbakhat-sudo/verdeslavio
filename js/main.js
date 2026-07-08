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

// prenotazione tavolo via WhatsApp — selettori a pillole
var pInvia = document.getElementById('p-invia');
if(pInvia){
  var selData = null, selOra = '12:00', selPers = '2';
  var settimana = ['dom','lun','mar','mer','gio','ven','sab'];
  var mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];

  // giorni: i prossimi 14 giorni di apertura (domenica esclusa)
  var contG = document.getElementById('p-giorni');
  var d = new Date(); var aggiunti = 0;
  while(aggiunti < 14){
    if(d.getDay() !== 0){ // 0 = domenica
      var chip = document.createElement('div');
      chip.className = 'giorno';
      chip.innerHTML = '<div class="g-sett">' + settimana[d.getDay()] + '</div>'
        + '<div class="g-num">' + d.getDate() + '</div>'
        + '<div class="g-mese">' + mesi[d.getMonth()] + '</div>';
      chip.dataset.v = ('0'+d.getDate()).slice(-2) + '/' + ('0'+(d.getMonth()+1)).slice(-2) + '/' + d.getFullYear();
      contG.appendChild(chip);
      if(aggiunti === 0){ chip.classList.add('sel'); selData = chip.dataset.v; }
      aggiunti++;
    }
    d.setDate(d.getDate() + 1);
  }
  contG.addEventListener('click', function(e){
    var c = e.target.closest('.giorno'); if(!c) return;
    contG.querySelectorAll('.giorno').forEach(function(x){ x.classList.remove('sel'); });
    c.classList.add('sel'); selData = c.dataset.v;
    aggiornaOccupati();
  });

  // orari
  var contO = document.getElementById('p-ore');
  var orari = [];
  for(var h=7; h<=19; h++){ orari.push(h+':00'); if(h<19) orari.push(h+':30'); }
  orari.forEach(function(o){
    var p = document.createElement('div');
    p.className = 'pillola' + (o === selOra ? ' sel' : '');
    p.textContent = o; p.dataset.v = o;
    contO.appendChild(p);
  });
  contO.addEventListener('click', function(e){
    var c = e.target.closest('.pillola'); if(!c) return;
    // il manager può liberare/occupare un orario cliccandolo
    if(document.body.classList.contains('manager')){
      var occ = c.classList.toggle('occupata');
      salvaOccupato(selData, c.dataset.v, occ);
      return;
    }
    if(c.classList.contains('occupata')) return;
    contO.querySelectorAll('.pillola').forEach(function(x){ x.classList.remove('sel'); });
    c.classList.add('sel'); selOra = c.dataset.v;
    aggiornaOccupati();
  });

  // ---- disponibilità reale dei tavoli, condivisa tra i clienti ----
  // il locale ha 14 tavoli: 9 da 2 persone, 2 da 3 persone, 3 da 6 persone
  var CAPACITA = { t2: 9, t3: 2, t6: 3 };
  var NOME_TAVOLO = { t2: 'tavolo da 2', t3: 'tavolo da 3', t6: 'tavolo da 6' };
  var storageOK = (typeof window.storage !== 'undefined');

  function catenaTavoli(p){
    // che tavolo serve per p persone (con ripiego su tavoli più grandi)
    if(p === '1' || p === '2') return ['t2','t3','t6'];
    if(p === '3') return ['t3','t6'];
    return ['t6']; // 4, 5, 6 e 7+
  }
  function tavoloDisponibile(slot, p){
    var catena = catenaTavoli(p);
    for(var i=0;i<catena.length;i++){
      var t = catena[i];
      if((slot[t]||0) < CAPACITA[t]) return t;
    }
    return null;
  }
  function chiaveGiorno(d){ return 'prenotazioni:' + String(d).replace(/\//g,'-'); }
  async function leggiGiorno(d){
    if(!storageOK) return {};
    try{
      var r = await window.storage.get(chiaveGiorno(d), true);
      var v = r && r.value ? JSON.parse(r.value) : {};
      return (v && !Array.isArray(v)) ? v : {};
    }catch(err){ return {}; }
  }
  async function aggiornaOccupati(){
    var giorno = await leggiGiorno(selData);
    if(typeof aggiornaPiantina === 'function' && document.getElementById('tav-T1')) aggiornaPiantina(giorno);
    contO.querySelectorAll('.pillola').forEach(function(p){
      var slot = giorno[p.dataset.v] || {};
      var isOcc = slot.chiuso === true || tavoloDisponibile(slot, selPers) === null;
      p.classList.toggle('occupata', isOcc);
      if(isOcc && p.classList.contains('sel')){
        p.classList.remove('sel');
        var libero = contO.querySelector('.pillola:not(.occupata)');
        if(libero){ libero.classList.add('sel'); selOra = libero.dataset.v; }
      }
    });
  }
  async function prenotaTavolo(d, ora, p){
    // ritorna il tipo di tavolo assegnato, oppure null se pieno
    var giorno = await leggiGiorno(d);
    var slot = giorno[ora] || {};
    if(slot.chiuso === true) return null;
    var t = tavoloDisponibile(slot, p);
    if(!t) return null;
    slot[t] = (slot[t]||0) + 1;
    giorno[ora] = slot;
    if(storageOK){
      try{ await window.storage.set(chiaveGiorno(d), JSON.stringify(giorno), true); }
      catch(err){ console.error('storage:', err); }
    }
    return t;
  }
  async function salvaOccupato(d, ora, occupato){
    // usato dal manager: blocca/sblocca completamente un orario
    if(!storageOK) return;
    try{
      var giorno = await leggiGiorno(d);
      var slot = giorno[ora] || {};
      slot.chiuso = occupato;
      giorno[ora] = slot;
      await window.storage.set(chiaveGiorno(d), JSON.stringify(giorno), true);
    }catch(err){ console.error('storage:', err); }
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
  var piantina = document.getElementById('piantina');
  TAVOLI.forEach(function(t){
    var el = document.createElement('div');
    el.className = 'tavolo ' + t.tipo;
    el.id = 'tav-' + t.id;
    el.style.left = t.x + '%';
    el.style.top = t.y + '%';
    el.innerHTML = '<span class="t-id">' + t.id + '</span><span class="t-posti">' + POSTI[t.tipo] + '</span>';
    piantina.appendChild(el);
  });
  function aggiornaPiantina(giorno){
    var slot = (giorno[selOra] || {});
    var chiuso = slot.chiuso === true;
    var tipoTuo = chiuso ? null : tavoloDisponibile(slot, selPers);
    var contatori = { t2:0, t3:0, t6:0 };
    var tuoAssegnato = false;
    TAVOLI.forEach(function(t){
      var el = document.getElementById('tav-' + t.id);
      var indice = contatori[t.tipo]++;
      var occupato = chiuso || indice < (slot[t.tipo] || 0);
      el.classList.toggle('occ', occupato);
      var tuo = !occupato && !tuoAssegnato && t.tipo === tipoTuo && indice === (slot[t.tipo] || 0);
      if(tuo) tuoAssegnato = true;
      el.classList.toggle('tuo', tuo);
    });
  }
  aggiornaOccupati();

  // persone
  var contP = document.getElementById('p-pers');
  ['1','2','3','4','5','6','7+'].forEach(function(n){
    var p = document.createElement('div');
    p.className = 'pillola' + (n === selPers ? ' sel' : '');
    p.textContent = n; p.dataset.v = n;
    contP.appendChild(p);
  });
  contP.addEventListener('click', function(e){
    var c = e.target.closest('.pillola'); if(!c) return;
    contP.querySelectorAll('.pillola').forEach(function(x){ x.classList.remove('sel'); });
    c.classList.add('sel'); selPers = c.dataset.v;
    aggiornaOccupati();
  });

  pInvia.addEventListener('click', async function(){
    var nome = document.getElementById('p-nome').value.trim();
    var note = document.getElementById('p-note').value.trim();
    if(!nome){ document.getElementById('p-nome').focus(); return; }
    // prenota davvero un tavolo: se qualcun altro ha appena preso l'ultimo, avvisa
    var tavolo = await prenotaTavolo(selData, selOra, selPers);
    if(!tavolo){
      await aggiornaOccupati();
      var confErr = document.getElementById('p-conferma');
      confErr.textContent = 'Ops, per questo orario i tavoli sono appena finiti — scegline un altro 🙏';
      confErr.classList.add('mostra');
      return;
    }
    var msg = 'Ciao! Vorrei prenotare un tavolo da verde salvia 🌿\n'
      + '• Nome: ' + nome + '\n'
      + '• Data: ' + selData + '\n'
      + '• Ora: ' + selOra + '\n'
      + '• Persone: ' + selPers + ' (' + NOME_TAVOLO[tavolo] + ')'
      + (note ? '\n• Note: ' + note : '');
    await aggiornaOccupati();
    var conf = document.getElementById('p-conferma');
    conf.textContent = 'Orario riservato! Si apre WhatsApp con il messaggio pronto — tocca solo Invia 🌿';
    conf.classList.add('mostra');
    window.open('https://wa.me/390108684171?text=' + encodeURIComponent(msg), '_blank');
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
  '.indirizzo','.stelle','.super-big','.super-sub','.super-card h3','.prenota-nota',
  '.marquee span','.editabile-footer','.login-card h3'];

function attivaManager(){
  document.body.classList.add('manager');
  SEL_EDITABILI.forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      el.setAttribute('contenteditable','true');
      el.classList.add('editabile');
    });
  });
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
  var cf = clone.querySelector('#p-conferma'); if(cf) cf.classList.remove('mostra');
  var fg = clone.querySelector('.foglie'); if(fg) fg.innerHTML='';
  ['#p-giorni','#p-ore','#p-pers'].forEach(function(s){
    var el = clone.querySelector(s); if(el) el.innerHTML='';
  });
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
