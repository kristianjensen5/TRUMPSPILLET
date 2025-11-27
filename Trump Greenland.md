<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Greenland Mini-Adventure (single-file)</title>
<style>
  :root{
    --sky-top:#eaf6ff; --sky-bot:#cfefff;
    --ice:#e8f6fb; --ice-stripe:#d9eef6;
    --ink:#111; --ui:#222; --ui-pill:rgba(0,0,0,.35);
    --accent:#e6007e;
  }
  html,body{margin:0;height:100%;font:16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--ink);background:
    linear-gradient(to bottom,var(--sky-top),var(--sky-bot)) fixed;overflow-x:hidden}
  /* Center the game area */
  .wrap{
    min-height:100dvh; display:grid; place-items:center;
    padding:24px;
  }
  .game{
    position:relative; width:1100px; height:460px;
    border-radius:16px; overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,.12);
    background:transparent;
  }
  /* Ground (ice stripes) */
  .ground{
    position:absolute; left:0; right:0; bottom:0; height:140px;
    background:
      repeating-linear-gradient(
        to bottom,
        var(--ice) 0, var(--ice) 10px,
        var(--ice-stripe) 10px, var(--ice-stripe) 14px
      );
    border-top:2px solid rgba(0,0,0,.05);
  }
  /* Scene layer that scrolls horizontally (logical world) */
  .scene{
    position:absolute; inset:0; overflow:hidden;
  }
  .world{
    position:absolute; left:0; top:0; height:100%;
    width:1400px; /* world wider than viewport */
  }

  /* Simple mountains/icebergs */
  .berg{ position:absolute; bottom:140px; width:300px; height:200px;
    background:rgba(255,255,255,.85); clip-path:polygon(50% 0,100% 100%,0 100%); opacity:.8}
  .berg.small{ width:240px; height:160px; opacity:.75 }

  /* Hotspots common */
  .hs{ position:absolute; bottom:140px; transform:translateY(2px); user-select:none }
  .hint{ position:absolute; left:50%; transform:translate(-50%, -6px);
    top:-26px; background:var(--ui-pill); color:#fff; font-size:12px;
    padding:4px 8px; border-radius:8px; opacity:0; transition:opacity .15s }
  .hs.near .hint{ opacity:1 }

  /* Objects (flat pixel-ish) */
  .mine{ width:120px; height:26px; background:#2f4756; border-radius:3px }
  .mine::after{ content:""; position:absolute; left:10px; right:10px; top:-8px; height:6px; background:#1b2c36 }
  .flag{ position:absolute; left:92px; top:-40px; width:0; height:0; border-left:2px solid #333 }
  .flag::after{ content:""; position:absolute; left:2px; top:0; width:20px; height:14px;
    background:linear-gradient(#b22234 0 100%), repeating-linear-gradient( to bottom,#fff 0 2px, #b22234 2px 4px);
    box-shadow:0 0 0 2px #3c3b6e inset; background-blend-mode:normal;
  }

  .phone{ width:16px; height:26px; background:#0b5; border:2px solid #111; border-radius:3px }
  .rock{ width:26px; height:16px; background:#444; border-radius:3px }

  .bear{ width:80px; height:24px; background:#fff; border-radius:5px }
  .bear::before{ content:""; position:absolute; left:60px; top:-10px; width:14px; height:14px; background:#fff; border-radius:50% }
  .bear::after{ content:""; position:absolute; left:68px; top:-5px; width:4px; height:4px; background:#111; border-radius:50% }
  .bear.down{ opacity:.6; transform:translateY(6px) rotate(6deg) }

  .mette{ width:16px; height:34px; background:#1b7; position:relative }
  .mette::before{ content:""; position:absolute; top:-8px; left:3px; width:10px; height:10px; background:#f2d2b6; border-radius:2px }
  .mette::after{ content:""; position:absolute; bottom:10px; left:0; right:0; height:10px; background:#0c5 }

  .heli{ width:120px; height:18px; background:#333; border-radius:3px }
  .heli::before{ content:""; position:absolute; left:-6px; right:-6px; top:-6px; height:4px; background:#111 }

  /* Player */
  .player{ position:absolute; bottom:140px; width:24px; height:38px; transform:translateY(-4px) }
  .p-legs{ position:absolute; bottom:0; left:3px; width:18px; height:8px; background:#222; border-radius:2px }
  .p-body{ position:absolute; bottom:8px; left:2px; width:20px; height:18px; background:#965; border-radius:3px; box-shadow:0 -6px 0 0 #c00 inset }
  .p-head{ --skin:#f2d2b6; position:absolute; bottom:26px; left:5px; width:14px; height:12px; background:var(--skin); border-radius:2px }
  .p-hair{ position:absolute; bottom:36px; left:4px; width:16px; height:6px; background:#e7b262; border-radius:2px 2px 0 0 }
  .p-cap{ display:none; position:absolute; bottom:36px; left:3px; width:18px; height:7px; background:#d00; border-radius:2px 2px 0 0 }
  .p-trophy{ display:none; position:absolute; left:-10px; bottom:16px; width:10px; height:14px; background:#d9c34b; border-radius:2px; box-shadow:0 -3px 0 0 #efde7a inset }

  /* HUD */
  .pill{
    position:absolute; left:12px; top:12px; background:var(--ui-pill); color:#fff;
    padding:8px 10px; border-radius:10px; font-size:14px; z-index:50; user-select:none
  }
  .prompt{
    position:absolute; left:50%; bottom:12px; transform:translateX(-50%);
    background:var(--ui-pill); color:#fff; font-size:13px;
    padding:6px 8px; border-radius:8px; z-index:40; opacity:0; transition:opacity .15s
  }
  .prompt.show{ opacity:1 }

  /* Inventory */
  .inventory{
    position:absolute; left:50%; top:12px; transform:translateX(-50%);
    background:#fff; border:1px solid rgba(0,0,0,.15); border-radius:10px;
    padding:6px 8px; display:flex; gap:8px; z-index:60; box-shadow:0 8px 20px rgba(0,0,0,.12);
    display:none;
  }
  .slot{ display:flex; align-items:center; gap:6px; padding:4px 8px; border-radius:8px; border:1px solid #eee; min-width:150px }
  .slot b{ background:#f4f4f4; padding:2px 6px; border-radius:6px; font:600 12px/1 system-ui }
  .slot.emph{ outline:2px solid var(--accent) }

  /* Speech bubble & tweet card */
  .bubble,.card{
    position:absolute; left:50%; top:20%; transform:translate(-50%,-50%);
    background:#fff; color:#111; border:1px solid rgba(0,0,0,.2); border-radius:12px;
    padding:12px 14px; width:min(520px,85%); z-index:70; box-shadow:0 12px 24px rgba(0,0,0,.18); display:none;
  }
  .card small{ color:#666 }
  .choices{ display:flex; gap:10px; margin-top:8px; flex-wrap:wrap }
  .btn{
    background:#111; color:#fff; border:0; border-radius:8px; padding:6px 10px; cursor:pointer; font-weight:700
  }
  .fade{ position:absolute; inset:0; background:#000; opacity:0; pointer-events:none; transition:opacity .3s; z-index:80 }

  /* Oval Office scene visuals (simple shapes) */
  .oval-bg{ position:absolute; inset:0; background:linear-gradient(#fdf8ef,#f2e7d6) }
  .desk{ position:absolute; left:50%; bottom:140px; transform:translateX(-50%); width:380px; height:70px; background:#6a3d22; border-radius:8px }
  .desk::before{ content:""; position:absolute; left:10px; right:10px; top:-40px; height:40px; background:#7b4a2c; border-radius:8px 8px 0 0 }
  .flagL,.flagR{ position:absolute; bottom:210px; width:16px; height:120px; background:#145; }
  .flagL{ left:20% } .flagR{ right:20% }
  .window{ position:absolute; top:30px; left:50%; transform:translateX(-50%); width:360px; height:160px; background:radial-gradient(ellipse at center, #fff 0 50%, #c9e6ff 60%); border-radius:16px; opacity:.7 }

  @media (prefers-reduced-motion:reduce){
    .fade{ transition:none }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="game" id="game">
      <div class="pill" id="help">←/→ gå • Space: interagér • I: inventory • 1–3: brug item<br>Helikopter: 1 bliv • 2 fly til Oval Office.</div>
      <div class="prompt" id="prompt">Tryk Mellemrum for at interagere</div>
      <div class="inventory" id="inv">
        <div class="slot" data-item="tanner"><b>1</b> Self-tanner</div>
        <div class="slot" data-item="trophy"><b>2</b> CL-pokal</div>
        <div class="slot" data-item="maga"><b>3</b> MAGA cap</div>
      </div>

      <div class="scene" id="scene">
        <div class="world" id="world"><!-- Greenland contents injected by JS --></div>
      </div>
      <div class="ground"></div>

      <div class="bubble" id="bubble"></div>
      <div class="card" id="card"></div>
      <div class="fade" id="fade"></div>
    </div>
  </div>

<script>
(() => {
  // ======= State =========
  const gs = {
    scene: 'GL',         // 'GL' | 'OVAL'
    player: { x: 220, facing: 1, speed: 2.0, tan: 0, cap:false, trophy:false },
    invOpen: false,
    inventory: ['tanner','trophy','maga'],
    flags: 0,
    bearDown: false,
    reduced: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    nonViolent: false,    // set true for selfie instead of “bang”
  };

  // ======= Elements =========
  const elScene = document.getElementById('scene');
  const elWorld = document.getElementById('world');
  const elPrompt = document.getElementById('prompt');
  const elInv = document.getElementById('inv');
  const elBubble = document.getElementById('bubble');
  const elCard = document.getElementById('card');
  const elFade = document.getElementById('fade');

  // ======= Helpers =========
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  function showPrompt(on){ elPrompt.classList.toggle('show', !!on); }
  function say(text, speaker='system', ms=1800){
    elBubble.textContent = text;
    elBubble.style.display='block';
    const t = setTimeout(()=>{ elBubble.style.display='none' }, ms);
    return { close:()=>{ clearTimeout(t); elBubble.style.display='none'; } };
  }
  function tweet(text){
    elCard.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Tweet</div><div style="margin-bottom:6px">${text}</div><small>Not really posted anywhere 😉</small><div class="choices" style="margin-top:10px"><button class="btn" id="okTweet">OK</button></div>`;
    elCard.style.display='block';
    document.getElementById('okTweet').onclick=()=>{elCard.style.display='none'}
  }
  async function fadeTo(sceneId){
    elFade.style.opacity='1';
    await new Promise(r=>setTimeout(r, gs.reduced?30:300));
    gs.scene = sceneId;
    buildScene();
    elFade.style.opacity='0';
  }

  // ======= Player =========
  let playerEl;
  function makePlayer(){
    playerEl = document.createElement('div');
    playerEl.className='player';
    playerEl.innerHTML = `
      <div class="p-legs"></div>
      <div class="p-body"></div>
      <div class="p-head" id="head"></div>
      <div class="p-hair"></div>
      <div class="p-cap" id="cap"></div>
      <div class="p-trophy" id="tro"></div>
    `;
    elWorld.appendChild(playerEl);
    updatePlayerAppearance();
  }
  function updatePlayerAppearance(){
    const head = playerEl.querySelector('#head');
    const cap = playerEl.querySelector('#cap');
    const tro = playerEl.querySelector('#tro');
    // Skin tone -> lerp base to orange
    const base = [242,210,182]; const orange=[255,160,80];
    const t = clamp(gs.player.tan,0,1);
    const mix = (a,b)=>Math.round(a+(b-a)*t);
    head.style.setProperty('--skin', `rgb(${mix(base[0],orange[0])},${mix(base[1],orange[1])},${mix(base[2],orange[2])})`);
    cap.style.display = gs.player.cap ? 'block':'none';
    tro.style.display = gs.player.trophy ? 'block':'none';
  }

  // ======= World objects & hotspots =========
  const HS = []; // {id,x,y,w,h, el, hint, near, onInteract}
  function makeHS(x, y, el, hint, onInteract, id){
    const wrap = document.createElement('div');
    wrap.className='hs';
    wrap.style.left = `${x}px`; wrap.style.bottom = `${y}px`;
    const h = document.createElement('div'); h.className='hint'; h.textContent=hint;
    wrap.appendChild(el); wrap.appendChild(h);
    elWorld.appendChild(wrap);
    const box = { id:(id||hint), x, y, w:el.offsetWidth||40, h:el.offsetHeight||20, el:wrap, hint:h, near:false, onInteract };
    HS.push(box);
    return box;
  }

  function clearWorld(){ elWorld.innerHTML=''; HS.length=0; }

  // ======= Build scenes =========
  function buildGL(){
    // Mountains
    const b1 = document.createElement('div'); b1.className='berg small'; b1.style.left='80px';
    const b2 = document.createElement('div'); b2.className='berg'; b2.style.left='360px';
    const b3 = document.createElement('div'); b3.className='berg small'; b3.style.left='880px';
    elWorld.appendChild(b1); elWorld.appendChild(b2); elWorld.appendChild(b3);

    // Objects
    const mine = document.createElement('div'); mine.className='mine';
    let flagPlaced = false;
    makeHS(140,140, mine, 'Space: Claim site', async () => {
      if(flagPlaced) return say('Already claimed!');
      // quick confirm
      const s = say('Claim this site? (Y/N)', 'system', 2000);
      const onKey = (e)=>{
        if(e.key.toLowerCase()==='y'){ placeFlag(); s.close(); window.removeEventListener('keydown', onKey); }
        if(e.key.toLowerCase()==='n'){ s.close(); window.removeEventListener('keydown', onKey); }
      };
      window.addEventListener('keydown', onKey, {once:false});
      function placeFlag(){
        const f = document.createElement('div'); f.className='flag';
        mine.appendChild(f);
        flagPlaced = true; gs.flags++;
        say('This is American land now!', 'player');
      }
    }, 'mine');

    const phone = document.createElement('div'); phone.className='phone';
    makeHS(380,140, phone, 'Space: Tweet', ()=> tweet('Greenland is ours now.'), 'phone');

    const rock = document.createElement('div'); rock.className='rock';
    makeHS(520,140, rock, 'A fine rock', ()=> say('Very fine rock. The best.'), 'rock');

    const bear = document.createElement('div'); bear.className='bear';
    function updateBear(){ bear.classList.toggle('down', gs.bearDown); }
    makeHS(760,140, bear, gs.nonViolent?'Space: Take selfie':'Space: Don\'t!', ()=>{
      if(gs.nonViolent){ say('Cheeeeese! 📸'); }
      else { gs.bearDown = !gs.bearDown; updateBear(); say(gs.bearDown?'Bang! (totally legal)':'Bear recovers…'); }
    }, 'bear'); updateBear();

    const mette = document.createElement('div'); mette.className='mette';
    makeHS(940,140, mette, 'Space: Talk', ()=>{
      if(gs.player.trophy)      say('Look at this beautiful trophy. Everyone loves me!','player');
      else if(gs.player.cap)    say('Nasty… but we’ll make Greenland great again!','player');
      else                      say('Awful woman!','player');
    }, 'mette');

    const heli = document.createElement('div'); heli.className='heli';
    makeHS(1180,140, heli, 'Space: Helicopter', ()=>{
      elCard.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Helikopter</div>
        <div>1 = Bliv · 2 = Flyv til Oval Office</div>
        <div class="choices" style="margin-top:10px"><button class="btn" id="b1">1</button><button class="btn" id="b2">2</button></div>`;
      elCard.style.display='block';
      const close=()=>elCard.style.display='none';
      document.getElementById('b1').onclick=close;
      document.getElementById('b2').onclick=()=>{ close(); fadeTo('OVAL'); };
      // also allow keyboard 1/2 while open
      const key=(e)=>{ if(e.key==='1'){close()} if(e.key==='2'){close();fadeTo('OVAL')} if(e.key==='Escape'){close()} };
      window.addEventListener('keydown',key,{once:true});
    }, 'heli');

    // Player
    makePlayer();
  }

  function buildOVAL(){
    // background
    const bg = document.createElement('div'); bg.className='oval-bg'; elWorld.appendChild(bg);
    const win = document.createElement('div'); win.className='window'; elWorld.appendChild(win);
    const fl = document.createElement('div'); fl.className='flagL'; elWorld.appendChild(fl);
    const fr = document.createElement('div'); fr.className='flagR'; elWorld.appendChild(fr);
    const desk = document.createElement('div'); desk.className='desk'; elWorld.appendChild(desk);

    // desk phone
    const dphone = document.createElement('div'); dphone.className='phone';
    makeHS(540,180, dphone, 'Space: Tweet', ()=>{
      let text = 'Working hard from the Oval Office.';
      if(gs.player.cap) text += ' #MAGA';
      tweet(text);
    }, 'deskphone');

    // exit marker
    const exit = document.createElement('div'); exit.className='rock'; // small door button
    makeHS(1040,160, exit, 'Space: Fly back', ()=> fadeTo('GL'), 'back');

    // seated player behind desk (simplified): reuse but place center
    makePlayer();
    gs.player.x = 520;
  }

  function buildScene(){
    clearWorld();
    gs.scene==='GL' ? buildGL() : buildOVAL();
    // reset camera
    update();
  }

  // ======= Camera & loop =========
  let left=false,right=false;
  function nearestHS(){
    // Player center projected to world coords
    const px = gs.player.x + 12;
    const py = 160; // approx baseline
    let best=null, bestd=1e9;
    for(const h of HS){
      const cx = h.x + h.w/2;
      const cy = h.y + h.h/2;
      const dx = Math.abs(cx - px);
      const dy = Math.abs(cy - py);
      const d = Math.hypot(dx, dy);
      const near = d < 90; // interaction radius
      h.el.classList.toggle('near', near);
      if(near && d<bestd){ best=h; bestd=d; }
    }
    return best;
  }

  function update(){
    // Move
    if(gs.scene==='GL'){
      if(left) gs.player.x -= gs.player.speed;
      if(right) gs.player.x += gs.player.speed;
      gs.player.x = clamp(gs.player.x, 0, 1370);
    }else{
      // Oval office is static; allow small wiggle
      if(left) gs.player.x = clamp(gs.player.x-1.2, 480, 560);
      if(right) gs.player.x = clamp(gs.player.x+1.2, 480, 560);
    }
    // Place player
    playerEl.style.left = `${gs.player.x}px`;

    // Camera follow (keep player near center)
    const viewW = elScene.clientWidth;
    const maxScroll = 1400 - viewW;
    const cam = clamp(gs.player.x - viewW*0.42, 0, maxScroll);
    elWorld.style.left = `${-cam}px`;

    // Prompt visibility
    const h = nearestHS();
    showPrompt(!!h);
    requestAnimationFrame(update);
  }

  // ======= Inventory =========
  function toggleInventory(){
    gs.invOpen = !gs.invOpen;
    elInv.style.display = gs.invOpen ? 'flex' : 'none';
  }
  function useItem(slotIndex){
    const id = ['tanner','trophy','maga'][slotIndex];
    if(!id) return;
    if(id==='tanner'){
      gs.player.tan = clamp(gs.player.tan + 0.25, 0, 1);
      updatePlayerAppearance();
      say('A healthy (orange) glow!');
    }
    if(id==='trophy'){
      gs.player.trophy = !gs.player.trophy;
      updatePlayerAppearance();
      say(gs.player.trophy ? 'Hoisting the big cup!' : 'Put the trophy away.');
    }
    if(id==='maga'){
      gs.player.cap = !gs.player.cap;
      updatePlayerAppearance();
      say(gs.player.cap ? 'Hat on.' : 'Hat off.');
    }
    // little flash on slot
    const slots = [...elInv.querySelectorAll('.slot')];
    slots.forEach(s=>s.classList.remove('emph'));
    slots[slotIndex]?.classList.add('emph');
    setTimeout(()=>slots[slotIndex]?.classList.remove('emph'), 450);
  }

  // ======= Input =========
  window.addEventListener('keydown', (e)=>{
    if(e.repeat) return;
    if(e.key==='ArrowLeft')  left=true;
    if(e.key==='ArrowRight') right=true;

    if(e.key==='i' || e.key==='I'){ toggleInventory(); }
    if(e.key==='1') useItem(0);
    if(e.key==='2') useItem(1);
    if(e.key==='3') useItem(2);

    if(e.key==='Escape'){ elCard.style.display='none'; elBubble.style.display='none'; elInv.style.display='none'; gs.invOpen=false; }

    if(e.key===' '){
      // interact with nearest
      const h = nearestHS();
      if(h && typeof h.onInteract === 'function'){ h.onInteract(); }
    }
  });
  window.addEventListener('keyup', (e)=>{
    if(e.key==='ArrowLeft')  left=false;
    if(e.key==='ArrowRight') right=false;
  });

  // ======= Boot =========
  buildScene();
  requestAnimationFrame(update);

  // Pause when offscreen (saves CPU in long pages)
  const io = new IntersectionObserver(entries=>{
    for(const ent of entries){
      if(ent.isIntersecting) requestAnimationFrame(update);
    }
  }, {threshold:.2});
  io.observe(document.getElementById('game'));
})();
</script>
</body>
</html>