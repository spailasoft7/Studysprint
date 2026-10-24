(()=>{
'use strict';
const VER='0.1.0', $=s=>document.querySelector(s);
const SUBJECTS=['Mathematics','Physical Sciences','Life Sciences'];
const PH='https://phet.colorado.edu/sims/html/';
const SIMS=[
{id:'proj',t:'Projectile Motion',s:'Physical Sciences',d:'Fire objects and see how angle and speed change the path.',u:PH+'projectile-motion/latest/projectile-motion_en.html'},
{id:'ckt',t:'Circuit Construction Kit: DC',s:'Physical Sciences',d:'Build circuits with batteries, bulbs and resistors.',u:PH+'circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html'},
{id:'som',t:'States of Matter',s:'Physical Sciences',d:'Watch particles in solids, liquids and gases.',u:PH+'states-of-matter/latest/states-of-matter_en.html'},
{id:'bce',t:'Balancing Chemical Equations',s:'Physical Sciences',d:'Balance equations by counting atoms.',u:PH+'balancing-chemical-equations/latest/balancing-chemical-equations_en.html'},
{id:'gl',t:'Graphing Lines',s:'Mathematics',d:'Explore gradient and intercepts of straight lines.',u:PH+'graphing-lines/latest/graphing-lines_en.html'},
{id:'ns',t:'Natural Selection',s:'Life Sciences',d:'See how traits spread through a population.',u:PH+'natural-selection/latest/natural-selection_en.html'}];

/* ---------- storage ---------- */
const LS={get(k,d){try{const v=localStorage.getItem('ss_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ss_'+k,JSON.stringify(v))}catch(e){}}};
const DB={db:null,
open(){return new Promise((ok,no)=>{const r=indexedDB.open('studysprint',1);r.onupgradeneeded=()=>{r.result.createObjectStore('questions',{keyPath:'id'});r.result.createObjectStore('sessions',{keyPath:'date'})};r.onsuccess=()=>{this.db=r.result;ok()};r.onerror=()=>no(r.error)})},
tx(st,m,fn){return new Promise((ok,no)=>{const t=this.db.transaction(st,m);const q=fn(t.objectStore(st));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})},
all(st){return this.tx(st,'readonly',s=>s.getAll())},get(st,k){return this.tx(st,'readonly',s=>s.get(k))},put(st,v){return this.tx(st,'readwrite',s=>s.put(v))},clear(st){return this.tx(st,'readwrite',s=>s.clear())}};

/* ---------- question providers (swap the source here) ---------- */
const Providers={
 sample:{label:'Built-in sample bank',async fetch(){return window.SAMPLE_QUESTIONS}},
 remote:{label:'Remote server',url:null, // set to your own verified HTTPS endpoint returning a JSON array
  async fetch(){if(!this.url)throw new Error('No question server is set up yet.');
   const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);
   try{const r=await fetch(this.url,{signal:c.signal});if(!r.ok)throw new Error('Server error '+r.status);return await r.json()}finally{clearTimeout(t)}}}};
const valid=q=>q&&typeof q.id==='string'&&typeof q.q==='string'&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length&&typeof q.explain==='string'&&q.subject&&q.topic&&Array.isArray(q.grades)&&q.difficulty;
async function importQ(list){if(!Array.isArray(list))return 0;const have=new Set((await DB.all('questions')).map(q=>q.id));let n=0;for(const q of list)if(valid(q)&&!have.has(q.id)){await DB.put('questions',q);have.add(q.id);n++}return n}

/* ---------- helpers ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>fmt(new Date());
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const cfg=()=>({name:LS.get('name',''),grade:LS.get('grade',10),subjects:LS.get('subjects',SUBJECTS)});
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,3500)}
function streak(sess){const done=new Set(sess.filter(s=>s.done).map(s=>s.date));const d=new Date();if(!done.has(fmt(d)))d.setDate(d.getDate()-1);let n=0;while(done.has(fmt(d))){n++;d.setDate(d.getDate()-1)}return n}

/* ---------- pixel icons (8x8 grids) ---------- */
const G={
home:['...##...','..####..','.######.','########','.##..##.','.##..##.','.##..##.','.######.'],
star:['...##...','...##...','########','.######.','..####..','.######.','.##..##.','##....##'],
flask:['..####..','...##...','...##...','..####..','.######.','########','########','.######.'],
chart:['......##','......##','...##.##','...##.##','##.##.##','##.##.##','########','########'],
gear:['..#..#..','.######.','###..###','#......#','#......#','###..###','.######.','..#..#..'],
flame:['...#....','...##...','..###.#.','.######.','########','########','.######.','..####..'],
bolt:['....###.','...###..','..###...','.######.','...###..','..##....','.##.....','.#......'],
check:['........','......##','.....##.','##..##..','.####...','..##....','........','........'],
cross:['##....##','.##..##.','..####..','...##...','..####..','.##..##.','##....##','........'],
book:['.######.','##.##.##','##.##.##','##.##.##','##.##.##','##.##.##','.######.','........'],
back:['...#....','..##....','.#######','########','.#######','..##....','...#....','........'],
expand:['###..###','#......#','#......#','........','........','#......#','#......#','###..###'],
globe:['..####..','.#.##.#.','#..##..#','########','########','#..##..#','.#.##.#.','..####..'],
trophy:['########','#.####.#','#.####.#','.######.','..####..','...##...','..####..','.######.']};
const ico=(n,s=24)=>{let r='';G[n].forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='#')r+=`<rect x="${x}" y="${y}" width="1" height="1"/>`}));return `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 8 8" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`};
const SPR=['....cc....','...aaaa...','..abbbba..','.abbbbbba.','abwwbbwwba','abwabbwaba','abbbbbbbba','abbaaaabba','.abbbbbba.','..aaaaaa..','..a....a..'];
const COL={a:'#0A1F4C',b:'#5FBFEA',c:'#1F51FF',w:'#fff'};
const mascot=s=>{let r='';SPR.forEach((row,y)=>[...row].forEach((c,x)=>{if(COL[c])r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${COL[c]}"/>`}));return `<svg class="mascot" width="${s}" height="${s*1.1}" viewBox="0 0 10 11" shape-rendering="crispEdges" role="img" aria-label="Sprint the mascot">${r}</svg>`};

/* ---------- state ---------- */
let tab='home',ob={step:0,name:'',grade:10,subjects:[...SUBJECTS]},reveal=false,resetArm=false,sess=null;
const view=h=>{$('#view').innerHTML=h;window.scrollTo(0,0)};

/* ---------- daily session ---------- */
async function getSession(){
 const date=today();let s=await DB.get('sessions',date);if(s)return s;
 const c=cfg(),all=await DB.all('questions');
 const pool=all.filter(q=>q.grades.includes(c.grade)&&c.subjects.includes(q.subject));
 if(!pool.length)return null;
 const used=new Set((await DB.all('sessions')).flatMap(x=>x.qids));
 const rank=a=>a.sort((x,y)=>hash(date+x.id)-hash(date+y.id));
 const fresh=rank(pool.filter(q=>!used.has(q.id))),old=rank(pool.filter(q=>used.has(q.id)));
 const pick=[...fresh,...old].slice(0,5);
 s={date,qids:pick.map(q=>q.id),picks:[],done:false,xp:0,score:0,
  note:pick.length<5?`Only ${pick.length} question(s) match your grade and subjects, so today's set is shorter.`:(fresh.length<5?'You have used most questions in your bank, so some are repeats. Refresh in Settings when online.':'')};
 await DB.put('sessions',s);return s}

/* ---------- screens ---------- */
function onboarding(){
 $('#nav').hidden=true;const o=ob;
 const dots=`<div class="dots">${[0,1,2].map(i=>`<i class="${i<=o.step?'on':''}"></i>`).join('')}</div>`;
 if(o.step===0)view(`${mascot(110)}<h1 style="text-align:center">Welcome to StudySprint</h1><p class="sub" style="text-align:center">Hi, I'm Sprint. What should I call you?</p>${dots}
 <div class="card"><label for="nm">Your name</label><input id="nm" type="text" maxlength="24" autocomplete="given-name" value="${esc(o.name)}" placeholder="Type your name">
 <label>Your grade</label><div class="chips">${[8,9,10,11,12].map(g=>`<button class="chip ${o.grade===g?'on':''}" data-act="obGrade" data-v="${g}">${g}</button>`).join('')}</div></div>
 <button class="btn" data-act="obNext">Next ${ico('back',20).replace('<svg','<svg style="transform:scaleX(-1)"')}</button>`);
 if(o.step===1)view(`${mascot(80)}<h1 style="text-align:center">Pick your subjects</h1><p class="sub" style="text-align:center">Your Daily Five comes from these. You can change them later.</p>${dots}
 <div class="card"><div class="chips">${SUBJECTS.map(s=>`<button class="chip ${o.subjects.includes(s)?'on':''}" data-act="obSubj" data-v="${s}">${s}</button>`).join('')}</div></div>
 <button class="btn" data-act="obNext">Next</button><button class="btn alt" data-act="obBack">Back</button>`);
 if(o.step===2)view(`${mascot(80)}<h1 style="text-align:center">Nice to meet you, ${esc(o.name||'friend')}!</h1><p class="sub" style="text-align:center">Here is how StudySprint works.</p>${dots}
 <div class="card"><div class="row"><span style="color:var(--blue)">${ico('star',40)}</span><div><h3>Daily Five</h3><p>Answer 5 questions once a day. No timer, no pressure.</p></div></div></div>
 <div class="card"><div class="row"><span style="color:var(--blue)">${ico('flame',40)}</span><div><h3>Build a streak</h3><p>Finish every day to grow your streak and earn XP.</p></div></div></div>
 <div class="card"><div class="row"><span style="color:var(--blue)">${ico('flask',40)}</span><div><h3>Simulators</h3><p>Play with real science experiments. Turn your phone sideways for more room.</p></div></div></div>
 <div class="card"><div class="row"><span style="color:var(--blue)">${ico('chart',40)}</span><div><h3>Progress</h3><p>See which topics are strong and which need practice.</p></div></div></div>
 <button class="btn" data-act="obDone">Let's go</button><button class="btn alt" data-act="obBack">Back</button>`)}

function navBar(){const n=$('#nav');n.hidden=false;
 const T=[['home','Home','home'],['daily','Daily','star'],['sims','Sims','flask'],['progress','Progress','chart'],['settings','Settings','gear']];
 n.innerHTML=T.map(([k,l,i])=>`<button class="${tab===k?'on':''}" data-act="go" data-v="${k}" aria-label="${l}">${ico(i,24)}${l}</button>`).join('')}

async function render(){
 if(!LS.get('onboarded',false))return onboarding();
 navBar();const c=cfg(),all=await DB.all('questions'),ss=await DB.all('sessions');
 const map=Object.fromEntries(all.map(q=>[q.id,q]));
 if(tab==='home'){
  const ts=ss.find(s=>s.date===today()),xp=ss.reduce((a,s)=>a+s.xp,0),done=ss.filter(s=>s.done).length,st=streak(ss);
  const prog=ts?(ts.done?5:ts.picks.length):0;
  view(`<div class="row"><div class="grow"><p class="sub">${new Date().toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})}</p><h1>Hi, ${esc(c.name)}</h1></div>${mascot(48)}</div>
  <div class="card hero"><h2>Daily Five</h2><p>${ts&&ts.done?'Done for today. Come back tomorrow to keep your streak.':prog?`${prog} of 5 answered. Pick up where you left off.`:'Five questions are waiting for you.'}</p>
  <div class="bar" style="background:#fff"><i style="width:${prog*20}%"></i></div><button class="btn" data-act="go" data-v="daily">${ico('star',22)}${ts&&ts.done?'Review answers':prog?'Continue':'Start'}</button></div>
  <div class="grid2"><div class="card stat"><span style="color:var(--blue)">${ico('flame',32)}</span><b>${st}</b><span>Day streak</span></div><div class="card stat"><span style="color:var(--blue)">${ico('bolt',32)}</span><b>${xp}</b><span>Total XP</span></div></div>
  <div class="card" style="margin-top:14px"><div class="row"><span style="color:var(--blue)">${ico('globe',28)}</span><div class="grow"><h3>Offline questions</h3><p style="margin:0">${all.length?`${all.length} questions saved on this phone. Daily Five works without internet.`:'No questions saved yet. Open Settings and refresh.'}</p></div></div></div>
  <div class="card"><h3>Summary</h3><p style="margin:0">${done} quiz${done===1?'':'zes'} finished. Grade ${c.grade}.</p></div>
  <button class="btn sky" data-act="go" data-v="sims">${ico('flask',22)}Open simulators</button>`);
 }
 if(tab==='daily'){
  sess=await getSession();
  if(!sess)return view(`<h1>Daily Five</h1><div class="card"><p>No questions match Grade ${c.grade} and your subjects yet.</p><button class="btn" data-act="go" data-v="settings">Change settings</button></div>`);
  const s=sess,n=s.qids.length;
  if(s.done){
   const wrong=s.picks.map((p,i)=>({q:map[s.qids[i]],p})).filter(x=>x.q&&x.p!==x.q.answer);
   return view(`<h1>Daily Five</h1><div class="card dark"><div class="row"><span style="color:var(--sky)">${ico('trophy',44)}</span><div><h2>${s.score} of ${n} correct</h2><p style="margin:0">+${s.xp} XP earned. Next set unlocks tomorrow.</p></div></div></div>
   ${wrong.length?`<div class="note">Practise: ${[...new Set(wrong.map(x=>x.q.topic))].map(esc).join(', ')}</div>`:'<div class="note">Perfect score. Great work!</div>'}
   ${s.qids.map((id,i)=>{const q=map[id];if(!q)return'';const ok=s.picks[i]===q.answer;return `<div class="card"><span class="tag">${esc(q.subject)}</span><span class="tag">${esc(q.topic)}</span><p>${esc(q.q)}</p><p style="color:${ok?'var(--ok)':'var(--bad)'}" class="row">${ico(ok?'check':'cross',20)} You: ${esc(q.options[s.picks[i]])}</p>${ok?'':`<p>Answer: ${esc(q.options[q.answer])}</p>`}<p class="sub">${esc(q.explain)}</p></div>`}).join('')}`)}
  if(s.picks.length>=n&&!reveal){s.done=true;s.xp=s.score*10+20;await DB.put('sessions',s);return render()}
  const i=s.picks.length,q=map[s.qids[i]],last=reveal?s.picks[i-1]:null,qq=reveal?map[s.qids[i-1]]:q;
  const shown=reveal?i-1:i;
  view(`<h1>Daily Five</h1>${s.note&&i===0&&!reveal?`<div class="note">${esc(s.note)}</div>`:''}<p class="sub">Question ${shown+1} of ${n}</p><div class="bar"><i style="width:${(reveal?i:i)/n*100}%"></i></div>
  <div class="card"><span class="tag">${esc(qq.subject)}</span><span class="tag">${esc(qq.topic)}</span><span class="tag">${esc(qq.difficulty)}</span><h2 style="text-transform:none;line-height:1.4">${esc(qq.q)}</h2></div>
  ${qq.options.map((o,k)=>`<button class="opt ${reveal?(k===qq.answer?'ok':k===last?'no':''):''}" ${reveal?'disabled':`data-act="pick" data-v="${k}"`}><b>${'ABCD'[k]||k+1}</b>${esc(o)}</button>`).join('')}
  ${reveal?`<div class="note">${last===qq.answer?'Correct! ':'Not quite. '}${esc(qq.explain)}</div><button class="btn" data-act="next">${i>=n?'See results':'Next question'}</button>`:''}`);
 }
 if(tab==='sims')view(`<h1>Simulators</h1><p class="sub">Interactive science from PhET (University of Colorado Boulder). Internet needed.</p>${SIMS.map(m=>`<div class="card"><span class="tag">${m.s}</span><h2>${m.t}</h2><p>${m.d}</p><p class="sub row">${ico('globe',16)} Needs internet</p><button class="btn" data-act="sim" data-v="${m.id}">Launch</button></div>`).join('')}`);
 if(tab==='progress'){
  const dn=ss.filter(s=>s.done).sort((a,b)=>b.date.localeCompare(a.date)),xp=ss.reduce((a,s)=>a+s.xp,0),st=streak(ss);
  const sub={},top={};dn.forEach(s=>s.picks.forEach((p,i)=>{const q=map[s.qids[i]];if(!q)return;for(const [o,k] of [[sub,q.subject],[top,q.topic]]){o[k]=o[k]||[0,0];o[k][1]++;if(p===q.answer)o[k][0]++}}));
  const weak=Object.entries(top).filter(([,v])=>v[0]/v[1]<.6);
  const B=[['First sprint',dn.length>=1,'star'],['3-day streak',st>=3,'flame'],['100 XP',xp>=100,'bolt']];
  view(`<h1>Progress</h1><p class="sub">Saved on this phone only. No account, no cloud sync yet.</p>
  <div class="grid2"><div class="card stat"><span style="color:var(--blue)">${ico('bolt',32)}</span><b>${xp}</b><span>Total XP</span></div><div class="card stat"><span style="color:var(--blue)">${ico('flame',32)}</span><b>${st}</b><span>Streak</span></div></div>
  <div class="card" style="margin-top:14px"><h3>Badges</h3><div class="chips" style="margin:0">${B.map(([l,on,i])=>`<span class="chip ${on?'on':''}" style="opacity:${on?1:.45}">${ico(i,18)} ${l}</span>`).join('')}</div></div>
  <div class="card"><h3>Recent scores (${dn.length} total)</h3>${dn.slice(0,5).map(s=>`<p class="row" style="margin:0 0 6px"><span class="grow">${s.date}</span>${s.score}/${s.qids.length}</p>`).join('')||'<p>Finish a Daily Five to see scores.</p>'}</div>
  <div class="card"><h3>By subject</h3>${Object.entries(sub).map(([k,v])=>`<p style="margin:0">${esc(k)}: ${Math.round(v[0]/v[1]*100)}%</p><div class="bar"><i style="width:${v[0]/v[1]*100}%"></i></div>`).join('')||'<p>No data yet.</p>'}</div>
  <div class="card"><h3>Practise more</h3><p style="margin:0">${weak.length?weak.map(([k])=>esc(k)).join(', '):'Nothing flagged yet.'}</p></div>`);
 }
 if(tab==='settings'){
  let est='';try{const e=await navigator.storage.estimate();est=`${(e.usage/1048576).toFixed(1)} MB used`}catch(e){est='Not available'}
  view(`<h1>Settings</h1><div class="card"><label for="nm">Name</label><input id="nm" type="text" maxlength="24" value="${esc(c.name)}"><button class="btn sky" data-act="saveName">Save name</button>
  <label>Grade</label><div class="chips">${[8,9,10,11,12].map(g=>`<button class="chip ${c.grade===g?'on':''}" data-act="setGrade" data-v="${g}">${g}</button>`).join('')}</div>
  <label>Subjects</label><div class="chips">${SUBJECTS.map(s=>`<button class="chip ${c.subjects.includes(s)?'on':''}" data-act="setSubj" data-v="${s}">${s}</button>`).join('')}</div><p class="sub">Changes apply from tomorrow's Daily Five.</p></div>
  <div class="card"><h3>Question bank</h3><p>${all.length} saved questions (sample bank, not from a live server).<br>Storage: ${est}</p><button class="btn" data-act="refresh">Refresh questions</button></div>
  <div class="card"><h3>Reset</h3><p>Deletes your name, progress and saved questions.</p><button class="btn bad" data-act="reset">${resetArm?'Tap again to confirm':'Reset app data'}</button></div>
  <p class="sub">StudySprint v${VER}</p>`);
 }
}

/* ---------- simulator viewer ---------- */
function openSim(id){
 const m=SIMS.find(x=>x.id===id),v=document.createElement('div');v.id='sv';
 v.innerHTML=`<header><button data-act="closeSim" aria-label="Back">${ico('back',24)}</button><h2>${m.t}</h2><button data-act="fs" aria-label="Fullscreen">${ico('expand',24)}</button></header><div class="sbody"><div id="sl"><p>Loading simulation...</p></div><iframe title="${m.t}" allow="fullscreen" allowfullscreen></iframe></div>`;
 document.body.appendChild(v);
 const f=v.querySelector('iframe'),err=()=>{const l=$('#sl');if(l)l.innerHTML=`<h2>Can't load this simulation</h2><p>Check your internet, or open it in your browser instead.</p><button class="btn" data-act="ext" data-v="${m.id}">Open in browser</button><button class="btn alt" data-act="closeSim">Back</button>`};
 f.onload=()=>{const l=$('#sl');if(l)l.remove()};
 if(!navigator.onLine)err();else{f.src=m.u;v.timer=setTimeout(()=>{if($('#sl'))err()},15000)}}
async function closeSim(){const v=$('#sv');if(!v)return;clearTimeout(v.timer);try{if(document.fullscreenElement)await document.exitFullscreen()}catch(e){}
 try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}v.remove()}
async function fs(){const v=$('#sv');
 try{if(document.fullscreenElement){await document.exitFullscreen();return}await v.requestFullscreen()}catch(e){return toast('Fullscreen is not available here. Rotate your phone to landscape yourself.')}
 try{await screen.orientation.lock('landscape')}catch(e){toast('Could not lock landscape. Rotate your phone yourself.')}}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}});

/* ---------- actions ---------- */
const A={
 go(v){tab=v;reveal=false;render()},
 obGrade(v){ob.name=$('#nm').value;ob.grade=+v;onboarding()},
 obSubj(v){const a=ob.subjects;ob.subjects=a.includes(v)?a.filter(x=>x!==v):[...a,v];onboarding()},
 obNext(){if(ob.step===0){ob.name=$('#nm').value.trim();if(!ob.name)return toast('Please type your name first.')}
  if(ob.step===1&&!ob.subjects.length)return toast('Pick at least one subject.');ob.step++;onboarding()},
 obBack(){ob.step--;onboarding()},
 obDone(){LS.set('name',ob.name);LS.set('grade',ob.grade);LS.set('subjects',ob.subjects);LS.set('onboarded',true);tab='home';render()},
 async pick(v){const s=sess;s.picks.push(+v);const q=(await DB.get('questions',s.qids[s.picks.length-1]));if(+v===q.answer)s.score++;await DB.put('sessions',s);reveal=true;render()},
 async next(){const s=sess;reveal=false;if(s.picks.length>=s.qids.length){s.done=true;s.xp=s.score*10+20;await DB.put('sessions',s)}render()},
 sim:openSim,closeSim,fs,
 ext(v){window.open(SIMS.find(x=>x.id===v).u,'_blank')},
 saveName(){const n=$('#nm').value.trim();if(!n)return toast('Name cannot be empty.');LS.set('name',n);toast('Saved.')},
 setGrade(v){LS.set('grade',+v);render()},
 setSubj(v){const a=cfg().subjects,n=a.includes(v)?a.filter(x=>x!==v):[...a,v];if(!n.length)return toast('Keep at least one subject.');LS.set('subjects',n);render()},
 async refresh(){toast('Checking for new questions...');
  try{const n=await importQ(await Providers.remote.fetch());toast(n+' new questions saved.')}
  catch(e){const n=await importQ(await Providers.sample.fetch());toast(`${e.message} Using the sample bank (${n} new).`)}render()},
 async reset(){if(!resetArm){resetArm=true;render();setTimeout(()=>{resetArm=false},4000);return}
  resetArm=false;await DB.clear('sessions');await DB.clear('questions');try{Object.keys(localStorage).filter(k=>k.startsWith('ss_')).forEach(k=>localStorage.removeItem(k))}catch(e){}
  ob={step:0,name:'',grade:10,subjects:[...SUBJECTS]};await importQ(window.SAMPLE_QUESTIONS);render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&A[b.dataset.act])A[b.dataset.act](b.dataset.v)});

/* ---------- start ---------- */
(async()=>{
 try{await DB.open();await importQ(window.SAMPLE_QUESTIONS)}
 catch(e){return view('<div class="card"><h2>Storage unavailable</h2><p>This browser blocked local storage, so StudySprint cannot save questions or progress.</p></div>')}
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
 render()})();
})();
