/* The Narrow Way: Willowbrook — dependency-free canvas game. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), canvas=$('world'), ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const W=480,H=270,SAVE='narrow-way-willowbrook-v1',BACKUP=SAVE+'-backup';
  const fresh=()=>({version:1,stage:0,hp:6,x:256,y:335,flowers:[],notes:[],time:0,choice:null,jonah:{x:806,y:426},settings:{reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,gentle:false},finished:false,region:'village',journey:Campaign.fresh()});
  let state=fresh(),mode='title',clock=0,last=0,toastUntil=0,areaUntil=0,attack=0,dodge=0,invincible=0,hitPause=0,stepClock=0,shake=0;
  let camera={x:210,y:150},direction={x:0,y:1},dialogueQueue=[],dialogueEnd=null,choiceMode=false,choiceIndex=0,nearest=null,particles=[],enemies=[];
  const keys=new Set(),stick={x:0,y:0},player={dir:'down',moving:false},map=Art.makeMap();
  const herbs=[{x:133,y:402},{x:176,y:428},{x:220,y:401}];
  const npcs=[{x:321,y:291,kind:'mara'},{x:398,y:263,kind:'child'}];
  const trees=[];
  for(let x=25;x<940;x+=35){trees.push({x,y:72+Art.hash(x,1)*15});trees.push({x:x+12,y:609+Art.hash(x,3)*20});}
  for(let y=103;y<610;y+=37){trees.push({x:35+Art.hash(y,1)*12,y});trees.push({x:920+Art.hash(y,2)*12,y});}
  for(const [x,y] of [[83,209],[110,185],[463,202],[494,229],[443,420],[480,449],[298,489],[330,515],[79,497],[665,193],[704,175],[826,206],[865,233],[673,444],[698,479],[856,489],[898,433],[371,135],[425,122],[508,143],[744,549],[800,570]])trees.push({x,y});
  const solids=[{x:166,y:143,w:105,h:72},{x:367,y:173,w:89,h:64},{x:304,y:284,w:23,h:17},{x:107,y:370,w:135,h:9},{x:107,y:448,w:135,h:10},...trees.map(t=>({x:t.x-7,y:t.y-8,w:14,h:12}))];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function blocked(x,y){if(state.region!=='village')return Campaign.blocked(x,y);return x<58||x>900||y<103||y>587||(x>549+Math.sin(y*.018)*12&&x<638+Math.sin(y*.018)*12&&!(y>306&&y<333))||solids.some(r=>x>r.x-5&&x<r.x+r.w+5&&y>r.y-3&&y<r.y+r.h+4);}
  function move(body,dx,dy){if(!blocked(body.x+dx,body.y))body.x+=dx;if(!blocked(body.x,body.y+dy))body.y+=dy;}
  function spawnEnemies(){enemies=state.stage===4?[{x:744,y:393},{x:854,y:396},{x:794,y:468}].map((p,i)=>({...p,hp:3,phase:'idle',timer:.6+i*.35,dx:0,dy:0,hurt:0})):[];}
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastUntil=clock+3.3;}
  function save(silent=false){
    try{const old=localStorage.getItem(SAVE);if(old)localStorage.setItem(BACKUP,old);localStorage.setItem(SAVE,JSON.stringify(state));if(!silent)toast('Journey saved. Your light will be here.');return true;}
    catch{if(!silent)toast('Browser saving is unavailable. Use Export save to keep your journey.');return false;}
  }
  function validate(s){
    if(!s||s.version!==1||!Number.isInteger(s.stage)||s.stage<0||s.stage>8||!Number.isFinite(s.hp)||s.hp<1||s.hp>6||!Number.isFinite(s.x)||!Number.isFinite(s.y)||s.x<58||s.x>900||s.y<103||s.y>587||!Array.isArray(s.flowers)||s.flowers.some(n=>!Number.isInteger(n)||n<0||n>2)||new Set(s.flowers).size!==s.flowers.length||!Array.isArray(s.notes)||s.notes.some(n=>!Number.isInteger(n)||n<0||n>1)||!Number.isFinite(s.time)||s.time<0||!s.jonah||!Number.isFinite(s.jonah.x)||!Number.isFinite(s.jonah.y)||s.jonah.x<58||s.jonah.x>900||s.jonah.y<103||s.jonah.y>587)throw Error('Invalid save');
    if(s.stage>=2&&s.flowers.length!==3)throw Error('Incomplete quest data');
    const region=s.region??'village';if(!CampaignData.regions[region])throw Error('Unknown region');
    const journey=Campaign.validate(s.journey,region,s.stage);
    const d=fresh();return {...d,stage:s.stage,hp:s.hp,x:s.x,y:s.y,flowers:s.flowers,notes:s.notes,time:s.time,choice:typeof s.choice==='number'?s.choice:null,jonah:{x:s.jonah.x,y:s.jonah.y},finished:s.stage===8,region,journey,settings:{reduced:typeof s.settings?.reduced==='boolean'?s.settings.reduced:d.settings.reduced,gentle:!!s.settings?.gentle}};
  }
  function applySettings(){document.body.classList.toggle('reduced',state.settings.reduced);$('motion').textContent='Reduced motion: '+(state.settings.reduced?'on':'off');$('assist').textContent='Gentle combat: '+(state.settings.gentle?'on':'off');const size=state.journey.choices.touchSize||0;document.body.style.setProperty('--touch-size',[1,1.15,1.3][size]||1);if($('touch-size'))$('touch-size').textContent='Touch controls: '+(['standard','large','extra large'][size]||'standard');}
  function updateHUD(){
    $('objective-text').textContent=Campaign.title()||Story.objectives[state.stage]+(state.stage===1?` (${state.flowers.length}/3)`:'');
    $('hearts').replaceChildren(...Array.from({length:6},(_,i)=>{const s=document.createElement('span');s.textContent='♥';if(i>=state.hp)s.className='empty';return s;}));
    $('hearts').setAttribute('aria-label',`${state.hp} of 6 health`);
    $('menu-objective').textContent=Campaign.title()||Story.objectives[state.stage];applySettings();Campaign.connect();
  }
  function stage(n){state.stage=n;updateHUD();save(true);Sound.fx('pick');}
  function clearInput(){keys.clear();stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';player.moving=false;}
  function talk(lines,done){clearInput();mode='dialogue';dialogueQueue=lines.map(x=>[...x]);dialogueEnd=done||null;choiceMode=false;$('dialogue').hidden=false;$('prompt').hidden=true;showLine();}
  function showLine(){
    const l=dialogueQueue[0];$('speaker').textContent=l[0];$('speaker-role').textContent=l[1];$('dialogue-text').textContent=l[2];$('choices').replaceChildren();$('next').hidden=false;
    const f=$('face').getContext('2d');f.clearRect(0,0,48,56);f.imageSmoothingEnabled=false;const face=l[0].toLowerCase().replace('captain ','');Art.person(f,24,52,['mara','jonah','iona','tamar','ruth','boaz','reuben','neri','sela','esther','oren'].includes(face)?face:'eli','down',0,false,'',2);Sound.fx('talk');
  }
  function next(){if(mode!=='dialogue'||choiceMode)return;dialogueQueue.shift();if(dialogueQueue.length)showLine();else{$('dialogue').hidden=true;mode='play';const f=dialogueEnd;dialogueEnd=null;if(f)f();}}
  function choose(){
    talk([['Jonah','A STRANGER BY THE ROAD','Why would you help me?']]);choiceMode=true;$('next').hidden=true;
    Story.answers.forEach((a,i)=>{const b=document.createElement('button');b.textContent=a.label;b.onclick=()=>{state.choice=i;choiceMode=false;talk([['The river road','AN UNEXPECTED KINDNESS',a.reply],['Eli','LANTERN COURIER','Come on. Keep close, and we will take it slowly. There is a warm lantern waiting for us.']],()=>{stage(6);toast('Jonah follows you. Stay close and cross the bridge together.');});};$('choices').append(b);});selectChoice(0);
  }
  function selectChoice(index){const buttons=[...$('choices').querySelectorAll('button')];if(!buttons.length)return;choiceIndex=(index+buttons.length)%buttons.length;buttons.forEach((b,i)=>{b.classList.toggle('choice-selected',i===choiceIndex);b.tabIndex=i===choiceIndex?0:-1;b.onfocus=()=>{choiceIndex=i;buttons.forEach((x,k)=>x.classList.toggle('choice-selected',k===i));};});buttons[choiceIndex].focus({preventScroll:true});}
  function choicesFor(name,text,options){
    talk([[name,'ROADS OF MERCY · A CHOICE',text]]);choiceMode=true;$('next').hidden=true;
    for(const option of options){const b=document.createElement('button');b.textContent=option.label;b.onclick=()=>{choiceMode=false;option.action();};$('choices').append(b);}selectChoice(0);
  }
  function transition(){clearInput();attack=dodge=invincible=0;enemies=[];camera.x=clamp(state.x-W/2,0,960-W);camera.y=clamp(state.y-H/2,0,640-H);$('area').hidden=false;areaUntil=clock+3;Campaign.connect();}
  function begin(loaded=false){
    clearInput();mode='play';attack=dodge=invincible=0;particles=[];spawnEnemies();applySettings();updateHUD();$('title').hidden=true;$('hud').hidden=false;$('desktop-help').hidden=false;$('touch').hidden=!matchMedia('(pointer:coarse)').matches;$('area').hidden=false;areaUntil=clock+4.5;camera.x=clamp(state.x-W/2,0,960-W);camera.y=clamp(state.y-H/2,0,640-H);Sound.start();
    if(!loaded)talk(Story.intro,()=>{toast('Find Mara at the village well. Press E to speak.');save(true);});
  }
  function nearby(){
    const extra=Campaign.nearby();if(state.region!=='village')return extra?{...extra,type:'campaign',text:extra.kind==='exit'?'Travel to '+extra.label:extra.label}:null;
    const p={x:state.x,y:state.y};const options=[];
    if(extra)options.push({...extra,type:'campaign',text:extra.kind==='exit'?'Travel to '+extra.label:extra.label});
    if(dist(p,npcs[0])<32)options.push({type:'mara',text:state.stage===2?'Give Mara the yarrow':'Speak with Mara',x:321,y:291});
    if(dist(p,npcs[1])<25)options.push({type:'child',text:'Speak with Ada',x:398,y:263});
    herbs.forEach((h,i)=>{if(!state.flowers.includes(i)&&dist(p,h)<22)options.push({type:'herb',index:i,text:state.stage===1?'Gather yarrow':'Examine yarrow',...h});});
    [{x:455,y:320},{x:273,y:437}].forEach((s,i)=>{if(dist(p,s)<24)options.push({type:'sign',index:i,text:'Read inscription',...s});});
    if(state.stage>=3&&state.stage<=6&&dist(p,state.jonah)<30)options.push({type:'jonah',text:state.stage===5?'Help the stranger':'Speak with Jonah',...state.jonah});
    if(dist(p,{x:359,y:331})<27)options.push({type:'lantern',text:state.stage===7?'Light the village lantern':'Village lantern',x:359,y:331});
    return options.sort((a,b)=>dist(p,a)-dist(p,b))[0]||null;
  }
  function interact(){
    if(mode==='dialogue'){next();return;}if(mode!=='play')return;const n=nearby();if(!n)return;
    if(n.type==='campaign'){Campaign.interact(n);return;}
    if(n.type==='mara'){
      if(Campaign.mara())return;
      if(state.stage===0)talk(Story.mara,()=>stage(1));
      else if(state.stage===2)talk(Story.medicine,()=>{stage(3);toast('Follow the eastern path across the bridge.');});
      else if(state.stage===1)talk([['Mara','KEEPER OF WILLOWBROOK','White flowers, in the garden southwest of the well. Three sprigs will be enough.']]);
      else if(state.stage===8)talk([['Mara','KEEPER OF WILLOWBROOK','Look at the lantern. It shines on everyone who passes. It does not ask who deserves the light.']]);
      else talk([['Mara','KEEPER OF WILLOWBROOK','The traveler is southeast of the old bridge. I will keep the kettle warm.']]);
    }
    if(n.type==='herb'){
      if(state.stage!==1){talk([['Yarrow','THE VILLAGE GARDEN','Little white stars among the green. Mara would know what they are good for.']]);return;}
      state.flowers.push(n.index);burst(n.x,n.y,'#f3e6b5',10);Sound.fx('pick');if(state.flowers.length===3){stage(2);toast('Three sprigs gathered. Bring them to Mara.');}else{updateHUD();save(true);toast(`Yarrow gathered · ${state.flowers.length} of 3`);}
    }
    if(n.type==='sign'){if(!state.notes.includes(n.index)){state.notes.push(n.index);save(true);}talk([Story.signs[n.index]]);}
    if(n.type==='child')talk([['Ada','A CHILD OF WILLOWBROOK',state.stage===8?'Jonah said he will mend our gate tomorrow. Do you think he knows how to build a swing?':'I put a flower by the bridge. So people coming home know somebody was waiting.']]);
    if(n.type==='jonah'){
      if(state.stage===5)talk(Story.jonah.slice(0,2),choose);
      else if(state.stage===6)talk([['Jonah','ONE STEP AT A TIME','I can walk. Just… do not go too far ahead.']]);
      else toast('Drive away the shadows first. J to strike; Space to dodge.');
    }
    if(n.type==='lantern'){
      if(state.stage===7)talk(Story.home,()=>{state.finished=true;stage(8);Sound.fx('win');burst(349,308,'#ffe5a3',30);setTimeout(showEnding,900);});
      else talk([['The village lantern','A LIGHT FOR THE ROAD',state.stage===8?'Its light reaches the bridge. A traveler pauses, then takes another step toward home.':'An empty lantern. You still have the oil—but someone on the road needs you first.']]);
    }
  }
  function burst(x,y,color,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*65,vy:-20-Math.random()*40,life:.35+Math.random()*.5,color});}
  function strike(){
    if(mode!=='play'||attack>0||dodge>0)return;attack=.32;Sound.fx('swing');
    for(const e of enemies){const dx=e.x-state.x,dy=e.y-state.y,d=Math.hypot(dx,dy);if(e.hp>0&&d<39&&(dx*direction.x+dy*direction.y>0||d<15)){
      e.hp--;e.hurt=.18;e.phase='idle';e.timer=.8;move(e,direction.x*9,direction.y*9);burst(e.x,e.y-9,'#e4d6ac',9);Sound.fx('hit');hitPause=.035;if(!state.settings.reduced)shake=2;
      if(e.hp<=0)burst(e.x,e.y-8,'#8c9ca0',16);
    }}
    if(state.stage===4&&enemies.every(e=>e.hp<=0)){stage(5);state.hp=6;updateHUD();toast('The shadows scatter. The stranger still needs your help.');}
  }
  function dash(){if(mode!=='play'||dodge>0||attack>0)return;dodge=.42;invincible=.3;Sound.fx('swing');}
  function hurt(){if(invincible>0)return;state.hp--;invincible=1.2;if(!state.settings.reduced)shake=4;Sound.fx('hurt');updateHUD();if(state.hp<=0){state.hp=6;if(state.region!=='village'){const cp=state.journey.checkpoint;state.region=cp.region;state.x=cp.x;state.y=cp.y;transition();invincible=2;updateHUD();save(true);toast('Restored at your checkpoint. All quest and puzzle progress is kept.');return;}state.x=686;state.y=327;spawnEnemies();updateHUD();talk([['Eli','A MOMENT TO BREATHE','I stumbled, but the path is still here. Watch their eyes. Step aside, then strike.']],()=>toast('Try again. Gentle combat is available in the pause menu.'));}}
  function showEnding(){if(state.stage!==8)return;mode='ending';clearInput();$('menu').hidden=true;$('prompt').hidden=true;$('toast').classList.remove('show');$('ending').hidden=false;$('ending-stats').innerHTML=`<span><strong>${Math.max(1,Math.round(state.time/60))}</strong>MINUTES ON THE PATH</span><span><strong>${state.notes.length}/2</strong>QUIET DISCOVERIES</span>`;}
  function pause(){if(mode==='play'){mode='menu';clearInput();$('menu').hidden=false;updateHUD();}else if(mode==='menu'){mode='play';$('menu').hidden=true;}}
  function update(dt){
    Campaign.update(mode==='play'?dt:0);
    clock+=dt;if(clock>toastUntil)$('toast').classList.remove('show');if(clock>areaUntil)$('area').hidden=true;
    particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;}
    if(mode==='title'){camera.x=355+Math.sin(clock*.035)*55;camera.y=192+Math.sin(clock*.05)*20;return;}
    if(mode!=='play')return;
    state.time+=dt;attack=Math.max(0,attack-dt);dodge=Math.max(0,dodge-dt);invincible=Math.max(0,invincible-dt);shake=Math.max(0,shake-dt*18);if(hitPause>0){hitPause-=dt;return;}
    let dx=stick.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dy=stick.y+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
    player.moving=len>.12;if(player.moving){direction={x:dx/(Math.hypot(dx,dy)||1),y:dy/(Math.hypot(dx,dy)||1)};player.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
    if(dodge>.22){dx=direction.x*2.6;dy=direction.y*2.6;}
    const speed=attack>0?33:76;move(state,dx*speed*dt,dy*speed*dt);
    if(player.moving){stepClock+=dt;if(stepClock>.27){stepClock=0;Sound.fx('step');}}
    if(state.stage===3&&state.x>689&&state.y>355){stage(4);spawnEnemies();toast('Shadows! Strike with J. Dodge when their eyes flash.');}
    for(const e of enemies){
      if(e.hp<=0)continue;e.hurt=Math.max(0,e.hurt-dt);e.timer-=dt;const d=dist(e,state);
      if(e.phase==='idle'){
        if(d<140&&d>26){const s=state.settings.gentle?15:23;move(e,(state.x-e.x)/d*s*dt,(state.y-e.y)/d*s*dt);}
        if(d<76&&e.timer<=0){e.phase='windup';e.timer=state.settings.gentle?1.1:.75;e.dx=(state.x-e.x)/(d||1);e.dy=(state.y-e.y)/(d||1);}
      }else if(e.phase==='windup'&&e.timer<=0){e.phase='charge';e.timer=.34;}
      else if(e.phase==='charge'){move(e,e.dx*130*dt,e.dy*130*dt);if(dist(e,state)<15)hurt();if(e.timer<=0){e.phase='recover';e.timer=1.1;}}
      else if(e.phase==='recover'&&e.timer<=0){e.phase='idle';e.timer=.3;}
    }
    if(state.stage===6){
      const j=state.jonah,d=dist(j,state);if(d>22&&d<150){
        // Cross at the bridge center before following on the western bank.
        let target=state;
        if(j.x>649&&state.x<660)target={x:642,y:320};
        else if(j.x>532&&j.x<=650&&state.x<j.x)target={x:530,y:320};
        const dd=dist(j,target);if(dd>1)move(j,(target.x-j.x)/dd*57*dt,(target.y-j.y)/dd*57*dt);
      }
      if(dist(j,{x:365,y:330})<45&&dist(state,j)<75){stage(7);toast('You made it home together. Light the village lantern.');}
    }
    const tx=clamp(state.x-W/2,0,960-W),ty=clamp(state.y-H/2,0,640-H);camera.x+=(tx-camera.x)*Math.min(1,dt*8);camera.y+=(ty-camera.y)*Math.min(1,dt*8);
    nearest=nearby();$('prompt').hidden=!nearest;$('prompt').querySelector('span').textContent=nearest?nearest.text:'';const verb=!nearest?'LOOK':nearest.kind==='exit'?'TRAVEL':nearest.kind==='camp'?'REST':nearest.kind==='basket'||nearest.type==='herb'?'GATHER':nearest.kind==='sign'||nearest.kind==='secret'||nearest.type==='sign'?'READ':nearest.kind==='switch'?'USE':nearest.kind==='beacon'?'LIGHT':nearest.kind==='bell'?'RING':'TALK';$('touch-interact').textContent=verb;$('touch-interact').setAttribute('aria-label',nearest?verb+': '+nearest.text:'Look for something nearby');
  }
  function marker(x,y,type='!'){
    const bob=state.settings.reduced?0:Math.sin(clock*3)*2;Art.rect(ctx,x-6,y-36+bob,13,12,'#263e33');Art.rect(ctx,x-5,y-37+bob,11,12,'#f0d595');ctx.fillStyle='#435444';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(type,Math.round(x+1),Math.round(y-28+bob));Art.rect(ctx,x,y-25+bob,3,3,'#f0d595');
  }
  function draw(){
    if(mode!=='title'&&state.region!=='village'){Campaign.drawWorld(ctx,camera,clock,player);return;}
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.save();const sx=state.settings.reduced?0:(Math.random()-.5)*shake;ctx.translate(-Math.round(camera.x+sx),-Math.round(camera.y));ctx.drawImage(map,0,0);if(mode!=='title')NineRoads.effects(ctx,clock);
    // Animated water highlights.
    for(let i=0;i<40;i++){const y=(i*47+clock*6)%640,x=570+Math.sin(y*.018)*12+(i%4)*14;if(y>292&&y<347)continue;Art.rect(ctx,x,y,7+(i%3)*3,1,'#a1c4bb66');Art.rect(ctx,x+4,y+3,4,1,'#a1c4bb33');}
    herbs.forEach((p,i)=>Art.flower(ctx,p.x,p.y,state.flowers.includes(i)));
    // Wells, signs, lanterns, buildings and characters use depth sorting.
    const things=trees.map(t=>({y:t.y,draw:()=>Art.tree(ctx,t.x,t.y,Math.round(t.x)%3===0?1:0)}));
    things.push({y:215,draw:()=>Art.house(ctx,164,143,109,72)}, {y:237,draw:()=>Art.house(ctx,365,173,93,64,true)});
    things.push({y:303,draw:()=>{Art.ellipse(ctx,317,300,16,6,'#516a5044');Art.rect(ctx,303,284,28,16,'#8e947b');Art.rect(ctx,305,283,24,6,'#d3ccb0');Art.rect(ctx,308,285,18,6,'#466a70');Art.rect(ctx,306,292,22,7,'#afb69a');Art.rect(ctx,305,275,3,15,'#8c7754');Art.rect(ctx,326,275,3,15,'#8c7754');Art.rect(ctx,304,274,25,3,'#b6a274');}});
    things.push({y:320,draw:()=>Art.sign(ctx,455,320)},{y:437,draw:()=>{Art.rect(ctx,257,432,30,4,'#ae9567');Art.rect(ctx,261,435,3,6,'#786b4d');Art.rect(ctx,281,435,3,6,'#786b4d');Art.sign(ctx,273,427);}}, {y:331,draw:()=>Art.lantern(ctx,359,331,clock,state.stage===8||mode==='title')});
    npcs.forEach(n=>things.push({y:n.y,draw:()=>Art.person(ctx,n.x,n.y,n.kind,'down',clock,false)}));
    const j=state.jonah;
    things.push({y:j.y,draw:()=>{if(state.stage<6){ctx.save();ctx.translate(j.x,j.y);ctx.rotate(-.25);Art.person(ctx,0,0,'jonah','down',clock,false);ctx.restore();}else Art.person(ctx,j.x,j.y,'jonah',state.x<j.x?'left':'right',clock,mode==='play'&&state.stage===6&&dist(j,state)>25);}});
    enemies.filter(e=>e.hp>0).forEach(e=>{
      if(e.phase==='windup'){ctx.strokeStyle='#efd497aa';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+e.dx*52,e.y+e.dy*52);ctx.stroke();ctx.setLineDash([]);Art.ellipse(ctx,e.x,e.y,14,6,'#e9c78c44');}
      things.push({y:e.y,draw:()=>{ctx.globalAlpha=e.hurt>0?.5:1;Art.enemy(ctx,e.x,e.y,clock,e.phase,e.hp);ctx.globalAlpha=1;}});
    });
    if(mode!=='title')things.push({y:state.y,draw:()=>{ctx.globalAlpha=invincible>0&&Math.floor(clock*12)%2?.45:1;Art.person(ctx,state.x,state.y,'eli',player.dir,clock,player.moving,invincible>.9?'hurt':'');ctx.globalAlpha=1;
      if(attack>0){const a=Math.atan2(direction.y,direction.x),p=1-attack/.32;ctx.strokeStyle='#fff0be';ctx.lineWidth=3;ctx.beginPath();ctx.arc(state.x,state.y-9,23,a-1.05+p*.65,a+.55+p*.65);ctx.stroke();ctx.strokeStyle='#dcc69188';ctx.lineWidth=1;ctx.beginPath();ctx.arc(state.x,state.y-9,27,a-.85+p*.65,a+.45+p*.65);ctx.stroke();}
    }});
    things.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    for(const o of Campaign.objects('village')){if(o.kind==='deed')Art.person(ctx,o.x,o.y,o.skin,'down',clock,false);if(o.kind==='task'&&state.journey.flags.includes('accepted-'+o.id.slice(5))&&!state.journey.flags.includes('found-'+o.id.slice(5)))Art.rect(ctx,o.x-4,o.y-8,8,8,'#edce91');}
    for(const o of Campaign.objects('village')){if(o.kind==='exit'){Art.sign(ctx,o.x,o.y);ctx.fillStyle='#f4dfa5';ctx.font='10px monospace';ctx.textAlign='center';ctx.fillText('→',o.x,o.y-20);}if(o.kind==='secret'&&state.journey.tools.includes('lantern')&&!state.journey.secrets.includes(o.id)){ctx.fillStyle='#f4dfa5';ctx.fillText('✧',o.x,o.y);}}
    if(mode!=='title'){
      if(state.stage===0||state.stage===2)marker(321,291);
      if(state.stage===1)herbs.forEach((h,i)=>{if(!state.flowers.includes(i))marker(h.x,h.y,'·');});
      if(state.stage===3||state.stage===5)marker(j.x,j.y,'!');
      if(state.stage===7)marker(359,331,'!');
    }
    for(const p of particles){ctx.globalAlpha=clamp(p.life*2,0,1);Art.rect(ctx,p.x,p.y,2,2,p.color);}ctx.globalAlpha=1;
    // Drifting motes and butterflies keep the scenery gently alive.
    if(!state.settings.reduced)for(let i=0;i<13;i++){const x=90+(i*71+clock*4)%790,y=140+(i*89)%370+Math.sin(clock+i)*5;Art.rect(ctx,x,y,2,1,'#fff4be99');if(i%3===0)Art.rect(ctx,x+2,y+Math.sin(clock*8)*2,2,1,'#fff4be99');}
    ctx.restore();
    if(state.stage===8){ctx.fillStyle='#e8b86a0b';ctx.fillRect(0,0,W,H);}
    // A restrained directional guide appears only when the objective is offscreen.
    if(mode==='play'){
      let target=Campaign.target()||(state.stage===0||state.stage===2?npcs[0]:state.stage===1?herbs.find((_,i)=>!state.flowers.includes(i)):state.stage>=3&&state.stage<=5?j:state.stage===6||state.stage===7?{x:359,y:331}:null);
      if(target){const x=target.x-camera.x,y=target.y-camera.y;if(x<15||x>W-15||y<35||y>H-22){const a=Math.atan2(y-H/2,x-W/2),px=clamp(x,14,W-14),py=clamp(y,43,H-28);ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.fillStyle='#f1d793';ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-4,-4);ctx.lineTo(-2,0);ctx.lineTo(-4,4);ctx.fill();ctx.restore();}}
    }
  }
  function frame(ms){const dt=Math.min(.04,(ms-last)/1000||.016);last=ms;update(dt);draw();requestAnimationFrame(frame);}
  $('start').onclick=()=>{let existing=false;try{existing=!!localStorage.getItem(SAVE);}catch{}if(existing&&!confirm('Begin a new journey? The current save will be kept as a backup.'))return;state=fresh();begin();};
  $('continue').onclick=()=>{try{state=validate(JSON.parse(localStorage.getItem(SAVE)));begin(true);}catch{toast('This save could not be loaded. It has been preserved. Import a backup or begin a new journey.');}};
  $('next').onclick=next;$('pause').onclick=pause;$('resume').onclick=pause;$('objective').onclick=pause;
  $('sound').onclick=()=>{Sound.start();const on=Sound.toggle();$('sound').textContent=on?'♪':'×';$('sound').setAttribute('aria-label',on?'Mute sound':'Enable sound');};
  $('save').onclick=()=>save();
  $('motion').onclick=()=>{state.settings.reduced=!state.settings.reduced;applySettings();save(true);};
  $('assist').onclick=()=>{state.settings.gentle=!state.settings.gentle;applySettings();save(true);};
  const settingsHost=$('resume').parentElement;
  const touchSize=document.createElement('button');touchSize.id='touch-size';touchSize.textContent='Touch controls: standard';touchSize.onclick=()=>{state.journey.choices.touchSize=((state.journey.choices.touchSize||0)+1)%3;applySettings();save(true);};settingsHost.append(touchSize);
  for(const [label,fn]of [['Talk with Jonah (C)',()=>{if(state.stage===8)NineRoads.companion();else toast('Jonah will join you after the first chapter.');}],['Ask for a puzzle hint (H)',()=>NineRoads.hint()]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{pause();fn();};settingsHost.append(b);}
  const snapshot=document.createElement('button');snapshot.textContent='Export pre-decision save';snapshot.onclick=()=>{try{const raw=localStorage.getItem('narrow-way-before-final-choice');if(!raw){toast('This becomes available when you reach the final decision.');return;}validate(JSON.parse(raw));const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='narrow-way-before-decision.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{toast('No valid pre-decision save is available.');}};settingsHost.append(snapshot);
  $('menu').querySelector('.quiet').textContent='WASD / arrows: move · E: interact · M: map · B: journal · C: Jonah · H: hint. Dialogue choices: arrows to cycle, Enter to select. Autosaves stay in this browser; export a copy for safekeeping.';
  $('restart').onclick=()=>{if(confirm('Start again? Export your save first if you want to keep this journey.')){state=fresh();$('menu').hidden=true;begin();}};
  $('export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='willowbrook-journey.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Save exported. Keep this file to restore your journey.');};
  $('import').onclick=()=>$('import-file').click();
  $('import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>100000)throw Error('Too large');const loaded=validate(JSON.parse(await f.text()));state=loaded;$('menu').hidden=true;begin(true);save(true);toast('Journey restored. Welcome back.');}catch{toast('That save is invalid or from a different game version. Your journey is unchanged.');}e.target.value='';};
  $('explore').onclick=()=>{$('ending').hidden=true;mode='play';};
  window.addEventListener('keydown',e=>{
    if(['play','dialogue'].includes(mode)&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','KeyE','KeyJ','Escape'].includes(e.code))e.preventDefault();
    if(Campaign.key(e.code)){e.preventDefault();return;}
    if(e.repeat)return;if(mode==='dialogue'){if(choiceMode){if(['ArrowDown','ArrowRight'].includes(e.code)){selectChoice(choiceIndex+1);e.preventDefault();}else if(['ArrowUp','ArrowLeft'].includes(e.code)){selectChoice(choiceIndex-1);e.preventDefault();}else if(e.code==='Enter'){e.preventDefault();$('choices').querySelectorAll('button')[choiceIndex]?.click();}return;}if(e.code==='KeyE'||e.code==='Enter'||e.code==='Space')next();return;}
    if(e.code==='Escape'){pause();return;}if(mode!=='play')return;keys.add(e.code);if(e.code==='KeyE')interact();if(e.code==='KeyJ')strike();if(e.code==='Space')dash();
  });window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{clearInput();if(mode==='play')pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='play')pause();}});
  for(const [id,fn]of [['touch-attack',strike],['touch-dodge',dash],['touch-interact',interact]])$(id).addEventListener('pointerdown',e=>{e.preventDefault();Sound.start();fn();});
  let stickPointer=null;
  function stickMove(e){const r=$('stick').getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/38,dy=(e.clientY-r.top-r.height/2)/38,n=Math.max(1,Math.hypot(dx,dy));stick.x=dx/n;stick.y=dy/n;$('stick').firstElementChild.style.transform=`translate(${stick.x*29}px,${stick.y*29}px)`;}
  $('stick').addEventListener('pointerdown',e=>{if(mode!=='play'||stickPointer!==null)return;stickPointer=e.pointerId;$('stick').setPointerCapture(e.pointerId);stickMove(e);});
  $('stick').addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)stickMove(e);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(event,e=>{if(e.pointerId===stickPointer){stickPointer=null;stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';}});
  try{const s=localStorage.getItem(SAVE);if(s){$('continue').hidden=false;try{validate(JSON.parse(s));}catch{$('save-warning').textContent='A saved journey needs recovery. It has not been overwritten.';}}}catch{$('save-warning').textContent='Browser saves are unavailable. You can export your progress from the menu.';}
  // Read-only diagnostics for regression checks; no gameplay dependency.
  Campaign.attach({state:()=>state,mode:value=>{if(value)mode=value;return mode;},clearInput,talk,choose:choicesFor,toast,save,hud:updateHUD,transition,hurt,ending:showEnding,target:()=>state.stage===0||state.stage===2?npcs[0]:state.stage===1?herbs.find((_,i)=>!state.flowers.includes(i)):state.stage>=3&&state.stage<=5?state.jonah:state.stage===6||state.stage===7?{x:359,y:331}:null});
  window.Willowbrook={getState:()=>JSON.parse(JSON.stringify(state)),getMode:()=>mode,validateSave:validate,isBlocked:blocked};
  requestAnimationFrame(frame);
})();
