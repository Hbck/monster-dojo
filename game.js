'use strict';
/* ================= Monster Dojo prototype ================= */
const EL = {
  fire:  {name:'Fire',  icon:'🔥', c1:'#ffb36b', c2:'#f2602f'},
  water: {name:'Water', icon:'💧', c1:'#8fd0ff', c2:'#2f86e6'},
  leaf:  {name:'Leaf',  icon:'🍃', c1:'#9be89f', c2:'#2fa548'},
  normal:{name:'Normal',icon:'⭐', c1:'#d6d2e0', c2:'#8a84a0'}
};
const BEATS = {fire:'leaf', leaf:'water', water:'fire'}; // key beats value
const superVs = (atkEl, defEl) => BEATS[atkEl] === defEl;

// kind: atk | blk | heal | buff.  n = main number shown on the button.
const MOVES = {
  ember:       {name:'Ember',        el:'fire',  big:false, kind:'atk',  n:3, icon:'🔥', desc:'Throw a little flame for 3.', combo:'Combo: burns for 1 on the next 2 turns.'},
  flamedash:   {name:'Flame Dash',   el:'fire',  big:false, kind:'atk',  n:2, icon:'💨', desc:'Super fast! Hits before shields go up.', combo:'Combo: +2 damage.'},
  fireblast:   {name:'Fire Blast',   el:'fire',  big:true,  kind:'atk',  n:7, icon:'☄️', desc:'A huge fireball for 7. Then rest 1 turn.', combo:'Combo: burns for 1 on the next 3 turns.'},
  warmup:      {name:'Warm Up',      el:'fire',  big:false, kind:'buff', n:3, icon:'💪', desc:'Your next attack does 3 more.', combo:'Combo: also heal 2.'},
  bubble:      {name:'Bubble',       el:'water', big:false, kind:'atk',  n:2, icon:'🫧', desc:'Pop bubbles for 2.', combo:'Combo: the enemy\'s next hit does 2 less.'},
  splashshield:{name:'Splash Shield',el:'water', big:false, kind:'blk',  n:4, icon:'🌊', desc:'A water wall blocks 4.', combo:'Combo: blocks 6.'},
  tidalwave:   {name:'Tidal Wave',   el:'water', big:true,  kind:'atk',  n:6, icon:'🌊', desc:'A giant wave for 6. Then rest 1 turn.', combo:'Combo: also heal 3.'},
  raindance:   {name:'Rain Dance',   el:'water', big:true,  kind:'heal', n:6, icon:'🌧️', desc:'Happy rain heals 6. Then rest 1 turn.', combo:'Combo: also puts out burns.'},
  vinewhip:    {name:'Vine Whip',    el:'leaf',  big:false, kind:'atk',  n:3, icon:'🌿', desc:'Whip with a vine for 3.', combo:'Combo: hits two times!'},
  seedup:      {name:'Seed Up',      el:'leaf',  big:false, kind:'buff', n:1, icon:'🌱', desc:'All your attacks do +1 for this battle.', combo:'Combo: +2 instead.'},
  thornwall:   {name:'Thorn Wall',   el:'leaf',  big:false, kind:'blk',  n:3, icon:'🌵', desc:'Blocks 3. Attackers get poked for 2.', combo:'Combo: attackers get poked for 4.'},
  solarbeam:   {name:'Solar Beam',   el:'leaf',  big:true,  kind:'atk',  n:8, icon:'☀️', desc:'A sunny laser for 8. Then rest 1 turn.', combo:'Combo: goes right through shields.'},
  tackle:      {name:'Tackle',       el:'normal',big:false, kind:'atk',  n:3, icon:'💥', desc:'Bump into them for 3.', combo:''},
  scratch:     {name:'Scratch',      el:'normal',big:false, kind:'atk',  n:2, icon:'🐾', desc:'Scratch for 2.', combo:''},
  guard:       {name:'Guard',        el:'normal',big:false, kind:'blk',  n:5, icon:'🛡️', desc:'Hold still and block 5.', combo:''},
  megapunch:   {name:'Mega Punch',   el:'normal',big:true,  kind:'atk',  n:6, icon:'👊', desc:'A mighty punch for 6. Then rest 1 turn.', combo:''}
};
const POOL = {
  fire:['ember','flamedash','fireblast','warmup'], water:['bubble','splashshield','tidalwave','raindance'],
  leaf:['vinewhip','seedup','thornwall','solarbeam'], normal:['tackle','scratch','guard','megapunch']
};
const BUDDIES = {
  flarepup:  {id:'flarepup',  name:'Flarepup',  el:'fire',  moves:['ember','scratch','guard'],        art:'flarepup'},
  splashling:{id:'splashling',name:'Splashling',el:'water', moves:['bubble','splashshield','tackle'], art:'splashling'},
  sproutle:  {id:'sproutle',  name:'Sproutle',  el:'leaf',  moves:['vinewhip','seedup','tackle'],     art:'sproutle'}
};
const BY_EL = {fire:'flarepup', water:'splashling', leaf:'sproutle'};
const WILD = {
  fire: {name:'Cindermite', art:'cindermite'},
  water:{name:'Puddlefin',  art:'puddlefin'},
  leaf: {name:'Mossbun',    art:'mossbun'}
};
// Enemy patterns (base numbers; doubled when super effective vs the player). Shown one turn ahead.
const KAI_PATTERN = {
  fire: [{t:'atk',name:'Ember',b:1},{t:'atk',name:'Flame Dash',b:2},{t:'blk',name:'Fire Guard',b:3},{t:'atk',name:'Fire Blast',b:2,big:true,burn:2}],
  water:[{t:'atk',name:'Bubble',b:1},{t:'atk',name:'Splash',b:2},{t:'blk',name:'Splash Shield',b:3},{t:'atk',name:'Tidal Wave',b:2,big:true}],
  leaf: [{t:'atk',name:'Vine Whip',b:1},{t:'atk',name:'Leaf Slap',b:2},{t:'blk',name:'Thorn Wall',b:3},{t:'atk',name:'Solar Beam',b:2,big:true}]
};
const WILD_PATTERN = {
  fire: [{t:'atk',name:'Spark',b:2},{t:'blk',name:'Ash Cloud',b:2},{t:'atk',name:'Ember',b:2},{t:'atk',name:'Fire Blast',b:3,big:true}],
  water:[{t:'atk',name:'Squirt',b:2},{t:'blk',name:'Bubble Wall',b:2},{t:'atk',name:'Bubble',b:2},{t:'atk',name:'Tidal Wave',b:3,big:true}],
  leaf: [{t:'atk',name:'Leaf Toss',b:2},{t:'blk',name:'Thorn Wall',b:2},{t:'atk',name:'Vine Whip',b:2},{t:'atk',name:'Solar Beam',b:3,big:true}]
};

/* ---------------- state ---------------- */
const G = {
  buddy:null, moves:[], book:[], coins:0, stage:0, // stage 1 = Kai, 2 = wild
  voice:false, battle:null, lock:false, wildEl:null
};
window.__G = G; // for testing

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const app = $('#app');
const sleep = ms => new Promise(r => setTimeout(r, G.fast ? 0 : ms)); // G.fast is a test hook
const rnd = a => a[Math.floor(Math.random() * a.length)];
const cap = n => Math.max(0, Math.min(10, n));
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* ---------------- art slots ----------------
   Each slot tries art/sm/<name>.png (small, fast), then art/<name>.png, then an SVG placeholder. */
function placeholderSVG(name, el, human){
  if (human){
    const face = name === 'kai' ? '#f2c39b' : '#f7d6b5', hair = name === 'kai' ? '#3a2d4a' : '#d9d9e6', robe = name === 'kai' ? '#e0453a' : '#7a5bd6';
    return `<svg viewBox="0 0 120 160"><ellipse cx="60" cy="150" rx="48" ry="8" fill="#0001"/><path d="M20 150 Q20 95 60 92 Q100 95 100 150Z" fill="${robe}"/><circle cx="60" cy="58" r="32" fill="${face}"/><path d="M28 52 Q32 20 60 22 Q90 20 92 52 Q76 38 60 40 Q44 38 28 52Z" fill="${hair}"/><circle cx="48" cy="60" r="4" fill="#3a2d4a"/><circle cx="72" cy="60" r="4" fill="#3a2d4a"/><path d="M50 74 Q60 82 70 74" stroke="#3a2d4a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  }
  const e = EL[el] || EL.normal;
  const top = el === 'fire' ? `<path d="M45 34 Q50 8 60 22 Q66 2 74 26 Q82 14 80 38Z" fill="#ffd54a"/>`
            : el === 'water' ? `<path d="M60 6 Q78 30 60 40 Q42 30 60 6Z" fill="#bfe6ff"/>`
            : `<path d="M60 36 Q40 10 62 6 Q66 24 60 36Z" fill="#c8f7a8"/><path d="M62 36 Q84 18 88 30 Q76 40 62 36Z" fill="#7fd37f"/>`;
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 120 120"><defs><radialGradient id="${gid}" cx="40%" cy="35%"><stop offset="0" stop-color="${e.c1}"/><stop offset="1" stop-color="${e.c2}"/></radialGradient></defs><ellipse cx="60" cy="112" rx="40" ry="6" fill="#0002"/>${top}<path d="M18 80 Q14 34 60 32 Q106 34 102 80 Q100 110 60 110 Q20 110 18 80Z" fill="url(#${gid})"/><ellipse cx="46" cy="66" rx="9" ry="11" fill="#fff"/><ellipse cx="74" cy="66" rx="9" ry="11" fill="#fff"/><circle cx="48" cy="68" r="5" fill="#3a2d4a"/><circle cx="76" cy="68" r="5" fill="#3a2d4a"/><path d="M50 86 Q60 94 70 86" stroke="#3a2d4a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="82" rx="6" ry="4" fill="#ff8fb0" opacity=".6"/><ellipse cx="86" cy="82" rx="6" ry="4" fill="#ff8fb0" opacity=".6"/></svg>`;
}
const artFail = {}; // remember missing files so we don't retry every render
function artHTML(name, el, opts = {}){
  const cls = 'artbox ' + (opts.cls || '');
  const plat = opts.platform ? '<div class="platform"></div>' : '';
  if (artFail[name] === 2) return `<div class="${cls}" data-art="${name}">${plat}${placeholderSVG(name, el, opts.human)}</div>`;
  const src = artFail[name] === 1 ? `art/${name}.png` : `art/sm/${name}.png`;
  return `<div class="${cls}" data-art="${name}" data-el="${el||''}" data-human="${opts.human?1:''}">${plat}<img class="art" alt="${esc(name)}" src="${src}" onerror="artError(this)"></div>`;
}
window.artError = function(img){
  const box = img.parentNode, name = box.dataset.art;
  if (!artFail[name]) { artFail[name] = 1; img.src = `art/${name}.png`; return; }
  artFail[name] = 2;
  img.outerHTML = placeholderSVG(name, box.dataset.el, !!box.dataset.human);
};

/* ---------------- sound (WebAudio beeps) ---------------- */
let AC = null;
function ac(){ if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d = .12, type = 'square', vol = .08, when = 0, slide = 0){
  const a = ac(); if (!a) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
}
const SFX = {
  tap(){ tone(660, .06, 'sine', .07); },
  hit(){ tone(220, .15, 'square', .09, 0, -120); },
  ouch(){ tone(160, .2, 'sawtooth', .07, 0, -80); },
  block(){ tone(520, .1, 'triangle', .1); tone(780, .1, 'triangle', .08, .06); },
  heal(){ [523,659,784].forEach((f,i)=>tone(f,.12,'sine',.08,i*.07)); },
  super(){ [523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.07,i*.06)); },
  combo(){ tone(880,.08,'sine',.08); tone(1175,.12,'sine',.08,.07); },
  win(){ [523,659,784,1046,784,1046].forEach((f,i)=>tone(f,.16,'triangle',.1,i*.12)); },
  lose(){ [392,330,262].forEach((f,i)=>tone(f,.25,'triangle',.09,i*.2)); }
};

/* ---------------- read aloud ---------------- */
function say(text){
  if (!G.voice || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?'-]/gu, ' ')); u.rate = .95; u.pitch = 1.15; u.lang = 'en-US'; speechSynthesis.speak(u); } catch(e) {}
}
const vbtn = $('#voiceBtn');
function syncVoice(){ vbtn.textContent = G.voice ? '🔊' : '🔇'; vbtn.classList.toggle('on', G.voice); }
vbtn.addEventListener('click', () => { G.voice = !G.voice; syncVoice(); SFX.tap(); toast(G.voice ? 'Read aloud ON' : 'Read aloud OFF'); if (G.voice) say('Read aloud is on!'); });
if (!('speechSynthesis' in window)) vbtn.classList.add('hidden');
function toast(t){ const el = $('#toast'); el.textContent = t; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.add('hidden'), 1200); }

// prevent double-tap zoom / pinch / context menu
document.addEventListener('dblclick', e => e.preventDefault(), {passive:false});
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, {passive:false});
document.addEventListener('contextmenu', e => e.preventDefault());

/* ================= SCREENS ================= */
function startScreen(){
  G.stage = 0; G.coins = 0; G.book = []; G.moves = []; G.buddy = null;
  app.innerHTML = `<div class="screen">
    <h1>🥋 Monster Dojo</h1>
    <p class="sub">Pick your buddy!</p>
    <div class="pickgrid">
      ${Object.values(BUDDIES).map(b => `<button class="pick ${b.el}" data-id="${b.id}">
        ${artHTML(b.art, b.el)}
        <div><div class="nm">${b.name}</div>
        <span class="el bg-${b.el}">${EL[b.el].icon} ${EL[b.el].name}</span>
        <div class="mv">${b.moves.map(m => MOVES[m].name).join(' · ')}</div></div>
      </button>`).join('')}
    </div></div>`;
  app.querySelectorAll('.pick').forEach(btn => btn.addEventListener('click', () => {
    SFX.tap(); const b = BUDDIES[btn.dataset.id];
    G.buddy = b; G.moves = b.moves.slice(); say(b.name + '! Great pick!');
    introScreen();
  }));
  say('Monster Dojo! Pick your buddy!');
}

function rivalEl(){ return Object.keys(BEATS).find(k => BEATS[k] === G.buddy.el); }

function introScreen(){
  const kEl = rivalEl(), kb = BUDDIES[BY_EL[kEl]];
  const lines = [
    {who:'Sensei Momo', art:'sensei-momo', text:`Welcome to the Dojo! ${G.buddy.name} looks happy with you!`},
    {who:'Sensei Momo', art:'sensei-momo', text:`Tap a move to use it. Hold a move to learn what it does!`},
    {who:'Kai', art:'kai', buddy:kb, text:`I'm Kai! I pick ${kb.name}. ${EL[kEl].name} beats ${EL[G.buddy.el].name}! Let's battle!`}
  ];
  let i = 0;
  function show(){
    const L = lines[i];
    app.innerHTML = `<div class="screen" style="background:radial-gradient(circle at 50% 40%,#fffdf7,#ffeccc 70%,#ffd9a0)">
      <div class="scene">
        <div class="speaker">${L.who}</div>
        <div class="bubble">${esc(L.text)}</div>
        <div class="portrait">
          ${artHTML(L.art, null, {human:true, cls:'human'})}
          ${L.buddy ? artHTML(L.buddy.art, L.buddy.el, {cls:'buddy', platform:true}) : ''}
        </div>
      </div>
      <div class="introbar">
        <button class="smallbtn" id="skip">Skip ⏭️</button>
        <button class="bigbtn ${i === lines.length - 1 ? 'orange' : ''}" id="next">${i === lines.length - 1 ? 'Battle! ⚔️' : 'Next ▶'}</button>
      </div></div>`;
    say(L.text);
    $('#next').onclick = () => { SFX.tap(); i++; if (i >= lines.length) startBattle(1); else show(); };
    $('#skip').onclick = () => { SFX.tap(); startBattle(1); };
  }
  show();
}

/* ---------------- battle ---------------- */
function startBattle(stage){
  G.stage = stage;
  let foe;
  if (stage === 1){
    const el = rivalEl(), b = BUDDIES[BY_EL[el]];
    foe = {name:`Kai's ${b.name}`, short:b.name, el, art:b.art, hp:14, max:14, pattern:KAI_PATTERN[el]};
  } else {
    const el = G.wildEl || (G.wildEl = rnd(['fire','water','leaf']));
    foe = {name:`Wild ${WILD[el].name}`, short:WILD[el].name, el, art:WILD[el].art, hp:12, max:12, pattern:WILD_PATTERN[el]};
  }
  Object.assign(foe, {block:0, burn:0, weaken:0, pi:0});
  G.battle = {
    turn:1, msg: stage === 1 ? `${foe.name} wants to battle!` : `A ${foe.name.toLowerCase()} jumps out!`,
    p:{hp:20, max:20, block:0, thorn:0, burn:0, seed:0, warm:0, lastEl:null, restOn:{}},
    e:foe, over:false
  };
  G.lock = false;
  renderBattle();
  say(G.battle.msg);
}

function intentOf(){
  const B = G.battle, it = B.e.pattern[B.e.pi % B.e.pattern.length];
  const sup = it.t === 'atk' && superVs(B.e.el, G.buddy.el);
  let n = it.b * (sup ? 2 : 1);
  if (it.t === 'atk') n = cap(n - B.e.weaken);
  return {...it, n, sup};
}

function moveNumber(id){
  const m = MOVES[id], P = G.battle.p;
  if (m.kind !== 'atk') return m.n;
  let d = m.n + P.seed + P.warm;
  if (superVs(m.el, G.battle.e.el)) d *= 2;
  return cap(d);
}

function renderBattle(){
  const B = G.battle, P = B.p, E = B.e, it = intentOf();
  const hpPct = (x) => Math.max(0, x.hp / x.max * 100);
  const pStatus = [P.block ? `🛡️${P.block}` : '', P.seed ? `🌱+${P.seed}` : '', P.warm ? `💪+${P.warm}` : '', P.burn ? `🔥burn ${P.burn}` : '', P.lastEl ? `${EL[P.lastEl].icon} combo ready` : ''].filter(Boolean);
  const eStatus = [E.block ? `🛡️${E.block}` : '', E.burn ? `🔥burn ${E.burn}` : '', E.weaken ? `💧weak -${E.weaken}` : ''].filter(Boolean);
  const slots = [0,1,2,3].map(i => G.moves[i]);
  app.innerHTML = `<div class="battle ${G.lock ? 'locked' : ''}" id="battle">
    <div class="topbar"><span>${G.stage === 1 ? '⚔️ Battle 1: Kai' : '🌳 Battle 2: Wild'}</span><span style="margin-left:auto">🪙 ${G.coins}</span></div>
    <div class="zone enemy" id="ezone">
      <div class="info">
        <div class="nameplate">${EL[E.el].icon} ${esc(E.name)}</div>
        <div class="hpbar"><div class="hpfill ${hpPct(E) < 35 ? 'low' : ''}" style="width:${hpPct(E)}%"></div></div>
        <div class="hptxt">❤️ ${Math.max(0,E.hp)} / ${E.max}</div>
        ${B.over ? '' : `<div class="intent ${it.t}" id="intent">${it.t === 'atk' ? '⚔️' : '🛡️'} ${it.n}${it.sup ? ' ⭐' : ''}${it.burn ? ' 🔥' : ''}<small>${esc(it.name)}</small></div>`}
        <div class="status">${eStatus.map(s => `<span>${s}</span>`).join('')}</div>
      </div>
      ${artHTML(E.art, E.el, {platform:true, cls:'sprite'})}
    </div>
    <div class="msg" id="msg">${esc(B.msg)}</div>
    <div class="zone player" id="pzone">
      <div class="info">
        <div class="nameplate">${EL[G.buddy.el].icon} ${G.buddy.name}</div>
        <div class="hpbar"><div class="hpfill ${hpPct(P) < 35 ? 'low' : ''}" style="width:${hpPct(P)}%"></div></div>
        <div class="hptxt">❤️ ${Math.max(0,P.hp)} / ${P.max}</div>
        <div class="status">${pStatus.map(s => `<span>${s}</span>`).join('')}</div>
      </div>
      ${artHTML(G.buddy.art, G.buddy.el, {platform:true, cls:'sprite'})}
    </div>
    <div class="moves" id="moves">
      ${slots.map((id, i) => {
        if (!id) return `<div class="move empty"><div class="ic">➕</div><div class="nm">Empty</div><div class="tag">Win to learn!</div></div>`;
        const m = MOVES[id], resting = P.restOn[id] === B.turn;
        const combo = m.el !== 'normal' && P.lastEl === m.el;
        const sup = m.kind === 'atk' && superVs(m.el, E.el);
        const sym = m.kind === 'atk' ? '⚔️' : m.kind === 'blk' ? '🛡️' : m.kind === 'heal' ? '❤️' : '⬆️';
        return `<button class="move bg-${m.el} ${resting ? 'resting' : ''}" data-id="${id}" data-i="${i}">
          ${combo ? '<span class="badge combo">COMBO!</span>' : sup ? '<span class="badge">⭐x2</span>' : ''}
          <span class="num">${sym}${moveNumber(id)}</span>
          <div class="ic">${m.icon}</div><div class="nm">${m.name}</div>
          <div class="tag">${m.big ? '💪 Big' : '⚡ Quick'} · ${EL[m.el].name}</div>
          ${resting ? '<div class="rest">💤 Resting</div>' : ''}
        </button>`;
      }).join('')}
    </div>
  </div>`;
  bindMoves();
}

let tipEl = null;
function hideTip(){ if (tipEl) { tipEl.remove(); tipEl = null; } }
function showTip(id){
  hideTip(); const m = MOVES[id];
  tipEl = document.createElement('div'); tipEl.className = 'tip';
  tipEl.innerHTML = `<div class="t">${m.icon} ${m.name} <small>(${m.big ? 'Big: rests 1 turn after' : 'Quick: use any time'})</small></div><div>${esc(m.desc)}</div>${m.combo ? `<div class="c">🔁 ${esc(m.combo)}</div>` : '<div class="c" style="color:#777">Normal moves never combo.</div>'}`;
  $('#battle').appendChild(tipEl);
  say(m.name + '. ' + m.desc + ' ' + m.combo);
}
function bindMoves(){
  app.querySelectorAll('.move[data-id]').forEach(btn => {
    let timer = null, long = false, active = false;
    btn.addEventListener('pointerdown', e => {
      if (G.lock) return;
      active = true; long = false; btn.classList.add('pressing'); hideTip();
      timer = setTimeout(() => { long = true; showTip(btn.dataset.id); SFX.tap(); }, 450);
    });
    const end = (fire) => {
      clearTimeout(timer); btn.classList.remove('pressing');
      if (active && fire && !long) useMove(btn.dataset.id);
      active = false;
    };
    btn.addEventListener('pointerup', () => end(true));
    btn.addEventListener('pointerleave', () => end(false));
    btn.addEventListener('pointercancel', () => end(false));
  });
  const bt = $('#battle');
  if (bt) bt.addEventListener('pointerdown', e => { if (!e.target.closest('.move')) hideTip(); });
}

/* ----- fx ----- */
function zone(who){ return $(who === 'p' ? '#pzone' : '#ezone'); }
function sprite(who){ return zone(who) && zone(who).querySelector('.sprite'); }
function floatText(who, text, cls){
  const z = zone(who); if (!z) return;
  const s = sprite(who), r = s.getBoundingClientRect(), zr = z.getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'float ' + cls; f.textContent = text;
  f.style.left = (r.left - zr.left + r.width / 2 + (Math.random() * 30 - 15)) + 'px';
  f.style.top = (r.top - zr.top + r.height * .25) + 'px';
  z.appendChild(f); setTimeout(() => f.remove(), 1000);
}
function fx(who, cls){ const s = sprite(who); if (!s) return; s.classList.remove(cls); void s.offsetWidth; s.classList.add(cls); setTimeout(() => s.classList.remove(cls), 450); }
function starBurst(who){
  const z = zone(who), s = sprite(who); if (!z || !s) return;
  const r = s.getBoundingClientRect(), zr = z.getBoundingClientRect();
  const pts = []; for (let i = 0; i < 16; i++){ const a = i * Math.PI / 8, rad = i % 2 ? 40 : 88; pts.push((90 + Math.cos(a) * rad).toFixed(1) + ',' + (90 + Math.sin(a) * rad).toFixed(1)); }
  const b = document.createElement('div'); b.className = 'burst';
  b.style.left = (r.left - zr.left + r.width / 2) + 'px'; b.style.top = (r.top - zr.top + r.height / 2) + 'px';
  b.innerHTML = `<svg viewBox="0 0 180 180"><polygon points="${pts.join(' ')}" fill="#ffe066" stroke="#ff9a1f" stroke-width="6" stroke-linejoin="round"/></svg><b>SUPER!</b>`;
  z.appendChild(b); setTimeout(() => b.remove(), 950);
}
function shieldFx(who){ const s = sprite(who); if (!s) return; const d = document.createElement('div'); d.className = 'shieldfx'; s.appendChild(d); }
function setMsg(t){ G.battle.msg = t; const m = $('#msg'); if (m) m.textContent = t; say(t); }
function refreshHP(){
  // light refresh without rebuilding (keeps fx alive)
  const B = G.battle;
  [['p', B.p], ['e', B.e]].forEach(([w, x]) => {
    const z = zone(w); if (!z) return;
    const pct = Math.max(0, x.hp / x.max * 100);
    const f = z.querySelector('.hpfill'); f.style.width = pct + '%'; f.classList.toggle('low', pct < 35);
    z.querySelector('.hptxt').textContent = `❤️ ${Math.max(0, x.hp)} / ${x.max}`;
  });
}

/* ----- damage ----- */
// returns damage dealt
function hit(who, amount, {ignoreBlock = false, sup = false} = {}){
  const B = G.battle, T = who === 'p' ? B.p : B.e;
  amount = cap(amount);
  let absorbed = 0;
  if (!ignoreBlock && T.block > 0){ absorbed = Math.min(T.block, amount); T.block -= absorbed; }
  const dmg = amount - absorbed;
  T.hp = Math.max(0, T.hp - dmg);
  if (absorbed){ floatText(who, `🛡️-${absorbed}`, 'blk'); SFX.block(); }
  if (dmg > 0){ setTimeout(() => floatText(who, `-${dmg}`, 'dmg'), absorbed ? 150 : 0); fx(who, 'shake'); fx(who, 'flash'); (who === 'p' ? SFX.ouch : SFX.hit)(); }
  if (sup && dmg > 0){ starBurst(who); SFX.super(); }
  refreshHP();
  return dmg;
}
function heal(who, n){
  const T = who === 'p' ? G.battle.p : G.battle.e;
  const h = Math.min(n, T.max - T.hp); T.hp += h;
  floatText(who, `+${h}`, 'heal'); SFX.heal(); refreshHP();
}

async function playerAttack(id, base, opts = {}){
  const B = G.battle, P = B.p, m = MOVES[id];
  let d = base + P.seed + P.warm; P.warm = 0;
  const sup = superVs(m.el, B.e.el);
  if (sup) d *= 2;
  fx('p', 'lunge-r'); await sleep(180);
  const dealt = hit('e', d, {sup, ignoreBlock: !!opts.ignoreBlock});
  return {dealt, sup};
}

async function playerAct(id, combo){
  const B = G.battle, P = B.p, E = B.e, m = MOVES[id];
  const nm = G.buddy.name;
  if (combo){ floatText('p', 'COMBO!', 'info'); SFX.combo(); await sleep(250); }
  let r, text = `${nm} used ${m.name}!`;
  switch (id){
    case 'ember': r = await playerAttack(id, 3); if (combo){ E.burn = Math.max(E.burn, 2); text += ' It\'s burning!'; } break;
    case 'flamedash': r = await playerAttack(id, combo ? 4 : 2); break;
    case 'fireblast': r = await playerAttack(id, 7); if (combo){ E.burn = Math.max(E.burn, 3); text += ' Big burn!'; } break;
    case 'warmup': P.warm = 3; floatText('p', '💪+3', 'info'); SFX.combo(); if (combo){ await sleep(200); heal('p', 2); } text += ' Next hit is stronger!'; break;
    case 'bubble': r = await playerAttack(id, 2); if (combo){ E.weaken = 2; text += ' Enemy is soggy!'; } break;
    case 'splashshield': P.block += combo ? 6 : 4; shieldFx('p'); SFX.block(); text += ` Block ${combo ? 6 : 4}!`; break;
    case 'tidalwave': r = await playerAttack(id, 6); if (combo){ await sleep(200); heal('p', 3); } break;
    case 'raindance': heal('p', 6); if (combo && P.burn){ P.burn = 0; text += ' Burn is gone!'; } break;
    case 'vinewhip': r = await playerAttack(id, 3); if (combo && E.hp > 0){ await sleep(350); const r2 = await playerAttack(id, 3); r.dealt += r2.dealt; text += ' Two hits!'; } break;
    case 'seedup': P.seed += combo ? 2 : 1; floatText('p', `🌱+${combo ? 2 : 1}`, 'info'); SFX.combo(); text += ' All attacks are stronger!'; break;
    case 'thornwall': P.block += 3; P.thorn = combo ? 4 : 2; shieldFx('p'); SFX.block(); text += ' Pokey thorns!'; break;
    case 'solarbeam': r = await playerAttack(id, 8, {ignoreBlock: combo}); if (combo) text += ' Right through shields!'; break;
    case 'tackle': r = await playerAttack(id, 3); break;
    case 'scratch': r = await playerAttack(id, 2); break;
    case 'guard': P.block += 5; shieldFx('p'); SFX.block(); text += ' Block 5!'; break;
    case 'megapunch': r = await playerAttack(id, 6); break;
  }
  if (r && r.sup) text += ' Super effective!';
  setMsg(text);
  await sleep(r ? 650 : 500);
}

async function enemyAct(it){
  const B = G.battle, P = B.p, E = B.e;
  fx('e', 'lunge-l'); await sleep(180);
  const dealt = hit('p', it.n, {sup: it.sup});
  E.weaken = 0;
  let text = `${E.short} used ${it.name}!`;
  if (it.sup && dealt) text += ' Super effective!';
  if (!dealt) text += ' Blocked!';
  if (it.burn && dealt){ P.burn = Math.max(P.burn, it.burn); text += ' You are burning!'; }
  setMsg(text);
  if (P.thorn && E.hp > 0){ await sleep(450); hit('e', P.thorn); setMsg(`Ouch! Thorns poke ${E.short} for ${P.thorn}!`); }
  await sleep(650);
}

async function useMove(id){
  const B = G.battle;
  if (G.lock || B.over) return;
  const P = B.p, E = B.e, m = MOVES[id];
  if (P.restOn[id] === B.turn){ toast(`${m.name} is resting 💤`); SFX.tap(); say(m.name + ' is resting. Pick another move!'); return; }
  G.lock = true; hideTip(); $('#battle').classList.add('locked');
  const combo = m.el !== 'normal' && P.lastEl === m.el;
  const it = intentOf();
  P.block = 0; P.thorn = 0; E.block = 0;

  // 1) Flame Dash strikes before any shields go up
  if (id === 'flamedash') await playerAct(id, combo);
  // 2) enemy shield goes up
  if (E.hp > 0 && it.t === 'blk'){ E.block = it.n; shieldFx('e'); SFX.block(); setMsg(`${E.short} used ${it.name}! Block ${it.n}!`); await sleep(550); }
  // 3) player move
  if (id !== 'flamedash') await playerAct(id, combo);
  if (E.hp <= 0) return winBattle();
  // 4) enemy attack
  if (it.t === 'atk') await enemyAct(it);
  if (E.hp <= 0) return winBattle();
  if (P.hp <= 0) return loseBattle();
  // 5) burns tick
  if (E.burn > 0){ E.burn--; hit('e', 1, {ignoreBlock:true}); setMsg(`${E.short} is hurt by the burn!`); await sleep(600); if (E.hp <= 0) return winBattle(); }
  if (P.burn > 0){ P.burn--; hit('p', 1, {ignoreBlock:true}); setMsg(`${G.buddy.name} is hurt by the burn!`); await sleep(600); if (P.hp <= 0) return loseBattle(); }

  P.lastEl = m.el === 'normal' ? null : m.el;
  if (m.big) P.restOn[id] = B.turn + 1;
  E.pi++; B.turn++;
  P.block = 0; P.thorn = 0; E.block = 0;
  const nx = intentOf();
  B.msg = nx.t === 'atk' ? `${E.short} will attack for ${nx.n}! Your turn.` : `${E.short} will block ${nx.n}. Your turn!`;
  G.lock = false;
  renderBattle();
  say(B.msg);
}

async function winBattle(){
  const B = G.battle; B.over = true;
  setMsg(`${B.e.short} fainted! You win!`);
  fx('e', 'shake'); const s = sprite('e'); if (s){ s.style.transition = 'opacity .6s, transform .6s'; s.style.opacity = '0'; s.style.transform = 'translateY(30px) scale(.6)'; }
  SFX.win(); await sleep(1000);
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="huge">🏆</div><h2>You win!</h2><p class="sub">${G.buddy.name} is so proud!</p><button class="bigbtn" id="toReward">Get a reward 🎁</button>`;
  $('#battle').appendChild(ov); say('You win! ' + G.buddy.name + ' is so proud!');
  $('#toReward').onclick = () => { SFX.tap(); rewardScreen(); };
  G.lock = false;
}
async function loseBattle(){
  const B = G.battle; B.over = true;
  setMsg(`${G.buddy.name} is too tired to fight.`); SFX.lose(); await sleep(900);
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="huge">💫</div><h2>So close!</h2><p class="sub">Tip: when you see ⚔️ a big number, use a 🛡️ shield move!</p><button class="bigbtn orange" id="retry" style="font-size:30px;padding:22px 34px">🔄 Try Again</button>`;
  $('#battle').appendChild(ov); say('So close! Try again!');
  $('#retry').onclick = () => { SFX.tap(); startBattle(G.stage); };
  G.lock = false;
}

/* ---------------- rewards ---------------- */
function moveCard(id, extra = ''){
  const m = MOVES[id];
  return `<div class="ic">${m.icon}</div><div><div class="nm">${m.name}</div><div class="d">${esc(m.desc)}</div><div class="k">${m.big ? '💪 Big' : '⚡ Quick'} · ${EL[m.el].icon} ${EL[m.el].name}${m.combo ? ' · 🔁 ' + esc(m.combo.replace('Combo: ', '')) : ''}</div>${extra}</div>`;
}
function makeOffers(){
  const known = new Set(G.moves);
  const pickFrom = list => { const c = list.filter(x => !known.has(x)); return c.length ? rnd(c) : null; };
  const own = pickFrom(POOL[G.buddy.el]);
  const others = ['fire','water','leaf'].filter(e => e !== G.buddy.el);
  let other = pickFrom(POOL[rnd(others)]) || pickFrom(POOL[others[0]]) || pickFrom(POOL[others[1]]);
  const norm = pickFrom(POOL.normal);
  return [own, other, norm].filter(Boolean);
}
function rewardScreen(){
  const offers = makeOffers();
  app.innerHTML = `<div class="screen">
    <h2>🎁 Pick a new move!</h2>
    <p class="sub">${G.moves.length < 4 ? 'It goes in your empty slot.' : 'Your slots are full. You will swap one out.'}</p>
    <div class="cards">${offers.map(id => `<button class="card bg-${MOVES[id].el}" data-id="${id}">${moveCard(id)}</button>`).join('')}</div>
    <div class="row"><button class="smallbtn" id="skip">Skip: +2 🪙</button><button class="smallbtn" id="book">📖 Move Book</button></div>
    <div class="coins">🪙 ${G.coins} coins</div>
  </div>`;
  say('Pick a new move! Or skip for 2 coins.');
  app.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
    SFX.tap(); const id = c.dataset.id;
    if (G.moves.length < 4){ G.moves.push(id); toast(`Learned ${MOVES[id].name}!`); say(`${G.buddy.name} learned ${MOVES[id].name}!`); afterReward(); }
    else replaceScreen(id);
  }));
  $('#skip').onclick = () => { SFX.heal(); G.coins += 2; toast('+2 coins!'); afterReward(); };
  $('#book').onclick = () => { SFX.tap(); bookScreen(rewardScreen); };
}
function afterReward(){
  if (G.stage === 1) nextBattleScreen(); else endScreen();
}
function nextBattleScreen(){
  G.wildEl = rnd(['fire','water','leaf']);
  const w = WILD[G.wildEl];
  app.innerHTML = `<div class="screen" style="background:radial-gradient(circle at 50% 40%,#f8fff0,#dff3c9 70%,#c4e8a6)">
    <h2>🌳 Something is in the grass...</h2>
    <div class="portrait" style="flex:1">${artHTML(w.art, G.wildEl, {cls:'buddy', platform:true})}</div>
    <p class="sub">A wild ${EL[G.wildEl].name} monster: ${w.name}!</p>
    <button class="bigbtn orange" id="go">Battle! ⚔️</button><div style="height:12px"></div></div>`;
  app.querySelector('.portrait .artbox').style.maxHeight = '40vh';
  say(`Something is in the grass! A wild ${w.name}!`);
  $('#go').onclick = () => { SFX.tap(); startBattle(2); };
}
function replaceScreen(newId){
  let sel = null;
  const n = MOVES[newId];
  app.innerHTML = `<div class="screen">
    <h2>Learn ${n.icon} ${n.name}?</h2>
    <p class="sub">Drag it onto a move to forget. Or tap a move.</p>
    <div class="card bg-${n.el} newcard" id="newcard" style="width:100%">${moveCard(newId)}</div>
    <div style="font-size:30px">⬇️</div>
    <div class="slots">${G.moves.map((id, i) => `<button class="card bg-${MOVES[id].el}" data-i="${i}"><div class="ic">${MOVES[id].icon}</div><div class="nm">${MOVES[id].name}</div><div class="k">${MOVES[id].big ? 'Big' : 'Quick'} · ${EL[MOVES[id].el].name}</div></button>`).join('')}</div>
    <div class="row"><button class="bigbtn hidden" id="confirm">Swap! ✅</button></div>
    <div class="row" style="margin-top:auto"><button class="smallbtn" id="back">◀ Keep my moves</button><button class="smallbtn" id="book">📖 Move Book</button></div>
  </div>`;
  say(`Drag ${n.name} onto a move to forget it.`);
  const slots = [...app.querySelectorAll('.slots .card')];
  const doSwap = i => {
    const old = G.moves[i]; G.moves[i] = newId; if (!G.book.includes(old)) G.book.push(old);
    SFX.heal(); toast(`Forgot ${MOVES[old].name}. Learned ${n.name}!`); say(`${G.buddy.name} forgot ${MOVES[old].name} and learned ${n.name}!`);
    afterReward();
  };
  slots.forEach(s => s.addEventListener('click', () => {
    SFX.tap(); slots.forEach(x => x.classList.remove('sel')); s.classList.add('sel'); sel = +s.dataset.i;
    const c = $('#confirm'); c.classList.remove('hidden'); c.textContent = `Forget ${MOVES[G.moves[sel]].name} ✅`;
    say(`Forget ${MOVES[G.moves[sel]].name}? Tap the green button.`);
  }));
  $('#confirm').onclick = () => { if (sel !== null) doSwap(sel); };
  $('#back').onclick = () => { SFX.tap(); rewardScreen(); };
  $('#book').onclick = () => { SFX.tap(); bookScreen(() => replaceScreen(newId)); };
  // drag
  const nc = $('#newcard'); let ghost = null, over = null;
  const slotAt = (x, y) => { const el = document.elementFromPoint(x, y); const s = el && el.closest('.slots .card'); return s ? +s.dataset.i : null; };
  nc.addEventListener('pointerdown', e => {
    e.preventDefault(); nc.setPointerCapture(e.pointerId);
    ghost = nc.cloneNode(true); ghost.removeAttribute('id'); ghost.className = nc.className.replace('newcard', '') + ' ghost';
    ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; document.body.appendChild(ghost); SFX.tap();
  });
  nc.addEventListener('pointermove', e => {
    if (!ghost) return; ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
    over = slotAt(e.clientX, e.clientY); slots.forEach((s, i) => s.classList.toggle('drop', i === over));
  });
  const drop = e => {
    if (!ghost) return; ghost.remove(); ghost = null; slots.forEach(s => s.classList.remove('drop'));
    const i = slotAt(e.clientX, e.clientY); if (i !== null) doSwap(i);
  };
  nc.addEventListener('pointerup', drop);
  nc.addEventListener('pointercancel', () => { if (ghost){ ghost.remove(); ghost = null; } slots.forEach(s => s.classList.remove('drop')); });
}
function bookScreen(back){
  app.innerHTML = `<div class="screen">
    <h2>📖 Move Book</h2><p class="sub">Moves your buddy forgot live here.</p>
    <div class="book">${G.book.length ? G.book.map(id => `<div class="card bg-${MOVES[id].el}">${moveCard(id)}</div>`).join('') : '<p class="sub" style="margin-top:30px">No forgotten moves yet!</p>'}</div>
    <h2 style="font-size:20px">Your moves now</h2>
    <div class="row">${G.moves.map(id => `<span class="el card bg-${MOVES[id].el}" style="min-height:0;padding:6px 12px">${MOVES[id].icon} ${MOVES[id].name}</span>`).join('')}</div>
    <button class="bigbtn" id="back">◀ Back</button><div style="height:8px"></div></div>`;
  say(G.book.length ? 'Your Move Book has ' + G.book.map(id => MOVES[id].name).join(', ') : 'No forgotten moves yet!');
  $('#back').onclick = () => { SFX.tap(); back(); };
}
function endScreen(){
  app.innerHTML = `<div class="screen">
    <h1>🎉 Prototype complete!</h1>
    <div class="portrait" style="flex:1">${artHTML(G.buddy.art, G.buddy.el, {cls:'buddy', platform:true})}</div>
    <p class="sub">${G.buddy.name} won 2 battles! 🪙 ${G.coins} coins</p>
    <div class="row">${G.moves.map(id => `<span class="card bg-${MOVES[id].el}" style="min-height:0;padding:6px 12px;font-weight:bold">${MOVES[id].icon} ${MOVES[id].name}</span>`).join('')}</div>
    <button class="smallbtn" id="book">📖 Move Book (${G.book.length})</button>
    <button class="bigbtn orange" id="again">🔄 Play again</button><div style="height:10px"></div></div>`;
  app.querySelector('.portrait .artbox').style.maxHeight = '34vh';
  SFX.win(); say(`Prototype complete! ${G.buddy.name} won 2 battles!`);
  $('#book').onclick = () => { SFX.tap(); bookScreen(endScreen); };
  $('#again').onclick = () => { SFX.tap(); G.wildEl = null; startScreen(); };
}

/* ---------------- boot ---------------- */
syncVoice();
startScreen();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
