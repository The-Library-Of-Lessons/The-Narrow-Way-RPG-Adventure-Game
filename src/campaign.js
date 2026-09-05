/* Connected regions, environmental encounters, exploration and the learning journal. */
window.Campaign = (() => {
  const D=CampaignData,$=id=>document.getElementById(id),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  let api,clock=0,selected='village',mapMode=null,lastReveal=0;
  const maps={},decor={};
  const fresh=()=>({step:0,flags:[],secrets:[],lessons:[],reviews:{},choices:{},tools:[],visited:['village'],fog:{village:[]},checkpoint:{region:'village',x:256,y:335}});
  const s=()=>api.state(),j=()=>s().journey,r=()=>s().region;
  const has=f=>j().flags.includes(f),set=f=>{if(!has(f))j().flags.push(f);};
  function validate(input,region,stage){
    if(input===undefined){if(region!=='village')throw Error('Missing campaign');return fresh();}
    const d=input,strings=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(x=>typeof x==='string'&&x.length<=80)&&new Set(a).size===a.length;
    if(!d||!Number.isInteger(d.step)||d.step<0||d.step>55||!strings(d.flags,256)||!strings(d.secrets,32)||!strings(d.lessons,16)||d.lessons.some(k=>!D.lessons[k])||!strings(d.tools,3)||d.tools.some(k=>!D.tools[k])||!strings(d.visited,9)||d.visited.some(k=>!D.regions[k])||!d.visited.includes(region)||!d.fog||typeof d.fog!=='object'||!d.choices||typeof d.choices!=='object'||!d.reviews||typeof d.reviews!=='object')throw Error('Invalid campaign');
    if((d.step>0||region!=='village')&&stage<8)throw Error('Unfinished prologue');
    if(D.regions[region].unlock>d.step)throw Error('Locked region');
    const fog={};for(const id of D.order){const cells=d.fog[id]||[];if(!Array.isArray(cells)||cells.length>384||cells.some(n=>!Number.isInteger(n)||n<0||n>=384)||new Set(cells).size!==cells.length)throw Error('Invalid exploration');fog[id]=cells;}
    const choices={},reviews={};for(const [k,v]of Object.entries(d.choices)){if(k.length>50||!Number.isInteger(v)||v<0||v>5)throw Error('Invalid choice');choices[k]=v;}for(const [k,v]of Object.entries(d.reviews)){if(!D.lessons[k]||!Number.isInteger(v)||v<0||v>1)throw Error('Invalid review');reviews[k]=v;}
    const cp=d.checkpoint;if(!cp||!D.regions[cp.region]||!d.visited.includes(cp.region)||!Number.isFinite(cp.x)||!Number.isFinite(cp.y)||cp.x<58||cp.x>900||cp.y<103||cp.y>587)throw Error('Invalid checkpoint');
    return {...fresh(),step:d.step,flags:[...d.flags],secrets:[...d.secrets],lessons:[...d.lessons],tools:[...d.tools],visited:[...d.visited],fog,choices,reviews,checkpoint:{region:cp.region,x:cp.x,y:cp.y}};
  }
  function lesson(id){if(!j().lessons.includes(id)){j().lessons.push(id);api.toast('Journal discovery · '+D.lessons[id].title+' · B to read');}}
  function advance(step){j().step=step;api.hud();api.save(true);Sound.fx('pick');}
  function grant(tool){if(!j().tools.includes(tool))j().tools.push(tool);}
  function say(name,text,done){api.talk([[name,'ROADS OF MERCY · ORIGINAL STORY',text]],done);}
  function lines(a,done){api.talk(a.map(([name,text])=>[name,'ROADS OF MERCY · ORIGINAL STORY',text]),done);}
  function choose(name,text,options,done){api.choose(name,text,options.map((o,i)=>({label:o[0],action:()=>{say(name,o[1],()=>done(i));}})));}
  function objects(region=r()){return D.objects[region];}
  function allowed(o){
    if(o.kind==='task')return has('accepted-'+o.id.slice(5))&&!has('found-'+o.id.slice(5));
    if(o.kind==='secret')return j().tools.includes('lantern')&&!j().secrets.includes(o.id)&&(o.id!=='secret-sanctuary2'||j().tools.includes('lens'));
    return true;
  }
  function nearby(){return objects().filter(allowed).filter(o=>distance(o,s())<29).sort((a,b)=>(a.kind==='task'?-1:0)-(b.kind==='task'?-1:0)||distance(a,s())-distance(b,s()))[0];}
  function title(){return s().stage===8?D.objectives[j().step]:null;}
  function travel(to){
    if(D.regions[to].unlock>j().step){api.toast('This road opens after the current region’s work is complete.');return;}
    const forward=D.order.indexOf(to)>D.order.indexOf(r());s().region=to;s().x=forward?114:843;s().y=320;
    if(!j().visited.includes(to))j().visited.push(to);j().fog[to]??=[];
    j().checkpoint={region:to,x:s().x,y:320};s().hp=6;api.transition();api.hud();api.save(true);api.toast(D.regions[to].name+' · Checkpoint reached');
  }
  function connect(){
    const reg=D.regions[r()];$('objective').querySelector('span').textContent='CHAPTER '+reg.chapter+' · '+reg.name.toUpperCase();$('minimap-name').textContent=reg.name.toUpperCase();$('area').querySelector('strong').textContent=reg.name;$('area').querySelector('span').textContent=reg.theme;$('minimap-button').hidden=false;
  }
  function sequence(o,ids,prefix,step,finish){
    if(j().step!==step){api.toast(j().step>step?'The way is restored.':D.objectives[j().step]);return;}
    if(has(prefix+o.id)){api.toast('Already set. Continue with the next marker.');return;}
    const progress=ids.filter(id=>has(prefix+id)).length;
    if(ids[progress]!==o.id){api.toast('The order is not right. Read the nearby inscription; your earlier steps are kept.');return;}
    set(prefix+o.id);Sound.fx('pick');api.toast(o.label+' · '+(progress+1)+' / '+ids.length);api.save(true);
    if(progress===ids.length-1)finish();
  }
  function interact(o){
    const q=j().step;
    if(NineRoads.interact(o))return true;
    if(o.kind==='exit'){
      if(s().stage<8){api.toast('Finish helping Jonah before leaving Willowbrook.');return true;}
      if(q===0){start();return true;}travel(o.to);return true;
    }
    if(o.kind==='camp'){s().hp=6;j().checkpoint={region:r(),x:o.x,y:o.y+12};api.hud();api.save(true);say('A sheltered lantern','You rest, drink clean water, and make room for silence. Progress is saved here. A stumble on the road will bring you back without losing your work.');return true;}
    if(o.kind==='secret'){
      j().secrets.push(o.id);api.save(true);say(o.label,o.text+'\n\nA quiet discovery has been kept in your journal.');return true;
    }
    if(r()==='village')return false;
    if(o.id==='clue'){say(o.label,o.text);return true;}
    if(r()==='orchard'){
      if(o.id==='tamar'){
        if(q===1)lines([['Tamar','Boaz closed the mill gate. Our young trees are drying while travelers wait for food. I think he wants the harvest for himself.'],['Jonah','People said things like that about me. Some of them were true. But perhaps we should ask him before deciding.'],['Tamar','You will find him by the southern mill. Then read the water steward’s sign on the main road.']],()=>advance(2));
        else say('Tamar',q>=7?'The new trees have water, and nobody was left out of the harvest. I will ask before I accuse next time.':'Boaz is south of the main road. Young roots, then the mill, then the old grove—that is how the water must flow.');
      }else if(o.id==='boaz'){
        if(q===2)choose('Boaz','The mill gate jammed during the storm. If it opens before the nursery channel, the small beds will wash away. Did Tamar tell you I was keeping the food?',[
          ['Ask what happened before repeating the accusation.','Thank you for asking. Open the nursery first, the mill second, and the old grove last. Then everyone can eat.'],
          ['Tell him what Tamar believes, and invite him to explain.','That hurts, but I can show you the broken channel. Please carry my explanation back as carefully as you carried her concern.']
        ],i=>{j().choices.orchard=i;advance(3);});else say('Boaz','The nursery cannot bear a full flood. Open its little gate first. The mill comes next; the deep-rooted grove can wait.');
      }else if(['nursery','mill','grove'].includes(o.id))sequence(o,['nursery','mill','grove'],'water-',3,()=>{advance(4);say('Water in the channels','The wheel turns. Water reaches the small roots before the deep ones. Three trees have ripe baskets ready for gathering.');});
      else if(o.id.startsWith('fruit-')){
        if(q!==4){api.toast(q>4?'This harvest is already gathered.':'The trees need water first.');return true;}set(o.id);const count=['fruit-a','fruit-b','fruit-c'].filter(has).length;api.save(true);api.toast('Harvest baskets · '+count+' / 3');if(count===3)advance(5);
      }else if(['ruth','travelers'].includes(o.id)){
        if(q===5&&!has('fed-'+o.id)){set('fed-'+o.id);say(o.id==='ruth'?'Ruth':'The travelers',o.id==='ruth'?'My children heard the mill stop and thought there would be no supper. Thank you for remembering a house you could easily have passed.':'We are not from Willowbrook. You could have said the harvest belonged only to your own people. We will help carry what is left.',()=>{if(has('fed-ruth')&&has('fed-travelers'))advance(6);else api.save(true);});}
        else say(o.label,has('fed-'+o.id)?'There is a place for you at our table.':'We are waiting for the water and the harvest.');
      }else if(o.id==='guardian'){
        if(q===6)choose('The Rootkeeper','Roots curl around the last basket. “You have fed your neighbors. Will you store this one where it cannot be lost—or trust it to tomorrow’s traveler?”',[
          ['Place the last basket at the open roadside table.','The roots uncurl. A guardian of growth has no use for a harvest nobody can reach.'],
          ['Ask Tamar to keep it for anyone who arrives hungry.','Tamar marks it “For the next traveler.” Stewardship can prepare a welcome as well as give one now.']
        ],i=>{j().choices.rootkeeper=i;set('guardian-orchard');grant('lantern');lesson('neighbor');advance(7);say('Tamar','Take this pilgrim lantern. Near old walls it reveals writing the weather has hidden. The eastern road leads to Stillwater Marsh.');});else say('The Rootkeeper',q<6?'Let the water and harvest reach those who need them. Then we will speak.':'Keep an open hand, and remember the needs that are easy to miss.');
      }
    }
    if(r()==='marsh'){
      if(o.id==='neri'){
        if(q===7)lines([['Neri','A passenger is stranded east of the floodgates. Dena says Oren caused the flood. Oren says he was trying to stop it.'],['Jonah','I could choose the story that sounds most like mine. But that would still be guessing.'],['Neri','Find Dena on the northern bank and Oren in the southern reeds. Listen to both before touching the sluices.']],()=>advance(8));else say('Neri',q>=12?'The ferry is running again. A clear account mattered as much as a strong rope.':'Listen on both banks. Then release the hill, the reeds, and the river.');
      }else if(['dena','oren'].includes(o.id)){
        const text=o.id==='dena'?'I saw Oren pull a lever, and then the water rose. But I was far uphill. I could not see the debris blocking the river gate.':'A branch blocked the river outlet before I reached the lever. Let the hill drain into the reeds first, then open the river. Opening the river first would trap the boat against the branch.';
        say(o.label,text,()=>{if(q===8){set('heard-'+o.id);if(has('heard-dena')&&has('heard-oren')){lesson('listening');advance(9);}else api.save(true);}});
      }else if(['hill','reed','river'].includes(o.id))sequence(o,['hill','reed','river'],'sluice-',9,()=>{advance(10);say('Neri','The water settles. A dry causeway now reaches the boat. I have the rope; you can carry the other end.');});
      else if(o.id==='boat'){
        if(q===10)lines([['The passenger','I heard people arguing on the banks. I was afraid they would finish deciding whose fault it was before anyone came.'],['Eli','We should have told you help was coming. Hold the rope. One step at a time.'],['Neri','The passenger is safe. Now the Mistkeeper needs a lighted route: shore, channel, home.']],()=>advance(11));else say('The passenger',q>10?'I am safe on this bank. Thank you for coming.':'The current is too strong. Clear the sluices before trying the causeway.');
      }else if(['shore','channel','home'].includes(o.id))sequence(o,['shore','channel','home'],'beacon-',11,()=>{set('guardian-marsh');grant('rope');advance(12);say('The Mistkeeper','Three lights become a route because someone considered the traveler’s next step. Take Neri’s rescue rope. The map now offers return shortcuts to visited rest lanterns.');});
      else if(o.id==='guardian')say('The Mistkeeper',q<11?'Hear the people on both banks, and bring the passenger to safety.':q===11?'I cannot follow three lights without a beginning. Shore, channel, home: lead me as you would lead someone who cannot see ahead.':'The mist remains, but a traveler no longer has to face it alone.');
    }
    if(r()==='tower'){
      if(o.id==='sela'){
        if(q===12)lines([['Sela','Jonah. Last winter you took the oil from this watch as well. Without the warning lamp, my crew could not see the broken bridge wheel.'],['Jonah','I knew I had stolen oil. I did not ask what happened after I left.'],['Sela','Read the winter ledger north of here. Inspect the old wheel to the south. I will hear you when you understand what needs repairing.']],()=>advance(13));
        else if(q===14)choose('Sela','You have seen the damage. What will you say now?',[
          ['Let Jonah name the harm and offer repair.','Jonah says, “I took the oil. Your crew paid for my choice. I cannot undo that night. I can help repair the warning system and return what I owe.”'],
          ['Explain Jonah’s fear, while still naming his responsibility.','Eli explains the fear of that winter. Jonah adds, “It explains why I was desperate. It does not make what I took yours to lose. I will help repair it.”']
        ],i=>{j().choices.accountability=i;advance(15);say('Sela','Gather sound timber in the southwest, fittings near the north wall, and cord by the eastern ruins. Repair is a beginning. Trust will take longer.');});
        else if(q===17)lines([['Sela','The warning bells work. Jonah, I will record what you returned. There is still work for you here next spring.'],['Jonah','Then I will come back. You do not have to call me trustworthy today.'],['Sela','Take this clear lens to Anna on the hill. It reveals the marks on her lamps. Go in peace, and keep your word.']],()=>{grant('lens');lesson('restitution');advance(18);});
        else say('Sela',q>=18?'The repairs are holding. I will be here when Jonah returns to finish what he promised.':D.objectives[q]);
      }else if(['ledger','wheel'].includes(o.id))say(o.label,o.id==='ledger'?o.text:'The wheel’s axle is split. Jonah kneels beside it. “I thought an empty lamp would only mean darkness. I did not think about who would have to walk in it.”',()=>{if(q===13){set('inspected-'+o.id);if(has('inspected-ledger')&&has('inspected-wheel'))advance(14);else api.save(true);}});
      else if(o.id.startsWith('repair-')){
        if(q!==15){api.toast(q>15?'These materials are already in the repaired watch.':D.objectives[q]);return true;}set(o.id);const n=['repair-a','repair-b','repair-c'].filter(has).length;api.save(true);api.toast('Repair materials · '+n+' / 3');if(n===3){advance(16);say('Jonah','The wheel is repaired. The Bellwarden still sounds the old alarm. Read the watchkeeper’s vow and sound the three bells when their warning rings fade.');}
      }else if(['low','middle','high'].includes(o.id)){
        if(q===16&&hazardActive()){api.toast('The warning ring is bright. Step back and wait for it to fade.');return true;}
        sequence(o,['low','middle','high'],'bell-',16,()=>{set('guardian-tower');advance(17);say('The Bellwarden','The alarm falls silent. A repaired promise sounds different from an excuse. Return to Sela and agree on what comes next.');});
      }else if(o.id==='guardian')say('The Bellwarden',q===16?'Do not answer noise with haste. Low, middle, high. Watch the warning rings, and sound each bell in the quiet.':q>16?'The watch keeps a promise to the road again.':'A bell cannot mend a wheel. Begin with the work that was left undone.');
    }
    if(r()==='sanctuary'){
      if(o.id==='anna'){
        if(q===18)lines([['Anna','Two travelers wait for food. One is a friend of your village. The other drove Jonah from the road before you found him.'],['Jonah','I know what he did. I do not know whether I can look at him without wanting him to suffer.'],['Anna','You need not be alone with him. I will stay here. Listen to what each person needs, and then decide how to help.']],()=>advance(19));
        else if(q===20)choose('Anna','The familiar pilgrim is tired but can help prepare supper. The rival has an injured hand and has not eaten. There is enough food; the question is how you begin.',[
          ['Bring food to the injured rival; invite the pilgrim to help.','The pilgrim carries water while Anna stays nearby. Jonah sets down the bread. “I am still angry. But I will not make hunger my answer.”'],
          ['Ask the pilgrim to join you in serving both places.','You set two places together. The pilgrim tears the bread while Anna assists the injured rival. Nobody has to earn a meal by being your friend.']
        ],i=>{j().choices.table=i;lesson('enemies');advance(21);say('Anna','The lens from Sela reveals four words on the lamps. Read the inscription on the central road. Let the pattern guide your next steps.');});
        else say('Anna',q>=23?'Carry what you learned home. Love will need practicing after the lamps are lit.':D.objectives[q]);
      }else if(['pilgrim','rival'].includes(o.id))say(o.label,o.id==='pilgrim'?'I am hungry, but I can wait while you help that man. I thought you might ask me to avoid him because of Jonah.':'I drove him away. I cannot make that right by pretending I was afraid for a good reason. My hand is injured. I need help, and I understand if Anna must stay.',()=>{if(q===19){set('listened-'+o.id);if(has('listened-pilgrim')&&has('listened-rival'))advance(20);else api.save(true);}});
      else if(['receive','listen','serve','forgive'].includes(o.id))sequence(o,['receive','listen','serve','forgive'],'lamp-',21,()=>{advance(22);say('The four lamps','Their light meets on the empty seat at the summit. The Crownless Keeper waits beside it.');});
      else if(o.id==='guardian'){
        if(q===22)choose('The Crownless Keeper','A person you helped has disappointed you again. Which road will you take?',[
          ['Seek their good, speak truthfully, and keep wise boundaries.','The empty seat remains empty. “You have no need to rule another heart. Continue in truthful love, with help and accountability.”'],
          ['Pause, seek counsel, and pray before deciding how to help.','The keeper lowers the lantern. “You need not answer pain alone or in haste. Let prayer, truth, and wise counsel guide your care.”']
        ],i=>{j().choices.keeper=i;set('guardian-sanctuary');lesson('love');advance(23);say('Jonah','We should go home. Sela has my promise, Mara has an empty oil flask, and Ada still wants her gate repaired. The map’s rope shortcuts will take us back.');});else say('The Crownless Keeper',q>22?'The journey continues wherever you practice what you have heard.':'No crown is waiting here. Only another opportunity to love.');
      }
    }
    return true;
  }
  function start(){lesson('mercy');lines([['Mara','The lantern is lit. But three roads beyond our bridge are still waiting for light. The orchard has food but a quarrel; the marsh has a flood; the watch has a broken promise.'],['Jonah','One of those promises is mine. I want to repair what I took, if anyone will let me try.'],['Mara','Then begin at the orchard to the east. Learn the people’s needs before deciding what to do. Your map remembers where you have walked; your journal remembers what you are learning.']],()=>advance(1));}
  function mara(){
    if(s().stage!==8)return false;
    if(j().step===0)start();
    else if(j().step===23)lines([['Mara','You returned with less oil and more names. Tell me about the people, not only the roads.'],['Jonah',j().choices.accountability===0?'I told Sela what I did. She has not forgotten. I will go back to finish the repairs.':'Eli helped explain, but I made the promise myself. Sela deserves more than my reasons.'],['Eli',j().choices.table===0?'We brought bread to the man Jonah feared. Anna stayed with us. Kindness did not erase the truth.':'We set two places at Anna’s table. Our friend helped us care for the man we would rather have avoided.'],['Mara','Then let tomorrow be ordinary and faithful. A repaired gate. A patient conversation. A meal shared. Love is not finished because a journey is.']],()=>{advance(24);complete();});
    else if(j().step===24)NineRoads.begin();
    else say('Mara',D.objectives[j().step]);return true;
  }
  function complete(){
    $('ending').querySelector('small').textContent='ROADS OF MERCY · THE FIRST FIVE ROADS';$('ending').querySelector('h2').textContent='A wider circle of light.';$('ending').querySelector('.menu-card > p').textContent='Five places. Many neighbors. Return to Mara when you are ready for the harbor road.';$('ending').querySelector('blockquote').replaceChildren(document.createTextNode('“'+D.lessons.love.quote+'”'));const cite=document.createElement('cite');cite.textContent='John 13:34 · KJV';$('ending').querySelector('blockquote').append(cite);$('explore').textContent='Continue the journey →';api.ending();$('ending-stats').replaceChildren();for(const text of [j().visited.length+' regions visited',j().secrets.length+' quiet discoveries',j().lessons.length+' journal pages']){const span=document.createElement('span');span.textContent=text;$('ending-stats').append(span);}
  }
  function hazardActive(){return clock%4<1.6;}
  function blocked(x,y){
    if(x<58||x>900||y<103||y>587)return true;
    if(NineRoads.blocked(x,y))return true;
    if(r()==='marsh'){
      if([[490,100,96,154],[132,394,123,67],[480,494,98,77]].some(([a,b,w,h])=>x>a-3&&x<a+w+3&&y>b-3&&y<b+h+3))return true;
      if(x>650&&x<749&&y>159&&y<269&&j().step<10)return true;
    }
    if(r()==='tower'&&x>464&&x<536&&y>137&&y<263)return true;
    return false;
  }
  function update(dt){
    NineRoads.update(dt);
    clock+=dt;if(api.mode()!=='title'){
      if(clock-lastReveal>.2){lastReveal=clock;reveal();drawMini();}
      if(s().stage===8&&!j().lessons.includes('mercy')){lesson('mercy');api.save(true);}
    }
    if(api.mode()!=='play')return;
    if(r()==='tower'&&j().step===16&&hazardActive()&&objects().some(o=>o.kind==='bell'&&distance(o,s())<17))api.hurt();
  }
  function reveal(){const cells=j().fog[r()]??(j().fog[r()]=[]);const cx=Math.floor(s().x/40),cy=Math.floor(s().y/40);for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++)if(x>=0&&x<24&&y>=0&&y<16&&(x-cx)**2+(y-cy)**2<=6){const n=y*24+x;if(!cells.includes(n))cells.push(n);}}
  function objectiveTarget(){
    if(s().stage<8)return null;const q=j().step;
    if(j().choices.guidance===1)return null;
    if(q>=25)return NineRoads.target();
    if([3,9,11,16,21].includes(q)&&(j().choices['hint-'+q]||0)<2)return objects().find(o=>o.id==='clue')||null;
    const questRegions=['village','orchard','orchard','orchard','orchard','orchard','orchard','marsh','marsh','marsh','marsh','marsh','tower','tower','tower','tower','tower','tower','sanctuary','sanctuary','sanctuary','sanctuary','sanctuary','village','village'];
    const want=questRegions[q];if(want!==r())return objects().find(o=>o.kind==='exit'&&(D.order.indexOf(want)>D.order.indexOf(r())?o.id==='east':o.id==='west'))||null;
    const id=[null,'tamar','boaz',['nursery','mill','grove'].find(x=>!has('water-'+x)),['fruit-a','fruit-b','fruit-c'].find(x=>!has(x)),['ruth','travelers'].find(x=>!has('fed-'+x)),'guardian','neri',['dena','oren'].find(x=>!has('heard-'+x)),['hill','reed','river'].find(x=>!has('sluice-'+x)),'boat',['shore','channel','home'].find(x=>!has('beacon-'+x)),'sela',['ledger','wheel'].find(x=>!has('inspected-'+x)),'sela',['repair-a','repair-b','repair-c'].find(x=>!has(x)),['low','middle','high'].find(x=>!has('bell-'+x)),'sela','anna',['pilgrim','rival'].find(x=>!has('listened-'+x)),'anna',['receive','listen','serve','forgive'].find(x=>!has('lamp-'+x)),'guardian',null,null][q];
    if(want==='village')return {x:321,y:291};
    return objects().find(o=>o.id===id)||null;
  }
  function buildMap(id){
    if(maps[id])return maps[id];if(id==='village')return maps[id]=Art.makeMap();
    const c=document.createElement('canvas');c.width=960;c.height=640;const g=c.getContext('2d'),A=Art;
    if(NineRoads.buildMap(id,c))return maps[id]=c;
    const pal=id==='orchard'?['#a4b86b','#afbf76','#d3bd87']:id==='marsh'?['#668e81','#71998a','#b4b38b']:id==='tower'?['#92978a','#9da293','#b9b39b']:['#a3b6a1','#b0c2a9','#dbd0b0'];
    for(let y=0;y<640;y+=16)for(let x=0;x<960;x+=16){A.rect(g,x,y,16,16,pal[A.hash(x,y)>.5?1:0]);if(A.hash(y,x)>.45)A.rect(g,x+5,y+9,2,3,id==='marsh'?'#527e73':'#809469');}
    const paths=[[65,299,831,43],[246,171,34,310],[265,174,447,29],[268,448,537,30],[437,183,29,285],[641,189,31,280],[770,190,29,320]];
    for(const [x,y,w,h]of paths){A.rect(g,x-3,y-3,w+6,h+6,pal[0]);A.rect(g,x,y,w,h,pal[2]);for(let i=0;i<w*h/100;i++)A.rect(g,x+A.hash(i,x)*w,y+A.hash(i,y)*h,2,1,'#998f7144');}
    if(id==='orchard'){
      for(let row=0;row<3;row++)for(let col=0;col<6;col++){const x=315+col*77,y=155+row*185;A.rect(g,x-14,y,28,9,'#887c53');A.flower(g,x-5,y-1);}
      for(const [x,y,w,h]of [[407,191,5,254],[410,431,201,5],[607,233,5,203]])A.rect(g,x,y,w,h,'#799a8a');
      A.house(g,179,159,86,65);A.fence(g,177,241,96);A.house(g,304,365,74,63,true);
      for(const [x,y]of [[330,177],[554,465],[704,207]])A.tree(g,x,y,1);
    }
    if(id==='marsh'){
      for(const [x,y,w,h]of [[490,100,96,154],[132,394,123,67],[656,161,91,105],[480,494,98,77]]){A.rect(g,x-4,y-4,w+8,h+8,'#8da491');A.rect(g,x,y,w,h,'#527e89');for(let i=0;i<25;i++)A.rect(g,x+A.hash(i,x)*w,y+A.hash(i,y)*h,9,1,'#9ac0b099');}
      A.rect(g,639,266,137,8,'#776d51');for(let x=640;x<776;x+=8)A.rect(g,x,267,6,5,'#bea87b');
      A.house(g,181,200,69,55,true);
    }
    if(id==='tower'){
      A.rect(g,459,134,83,127,'#646e70');A.rect(g,467,141,66,113,'#a8ad9f');for(let y=144;y<250;y+=12)for(let x=468;x<530;x+=18){A.rect(g,x,y,16,10,'#bcc1af');A.rect(g,x,y+9,16,1,'#8e9b94');}A.rect(g,486,164,22,35,'#52656a');A.rect(g,490,169,5,25,'#799493');for(let x=459;x<542;x+=18)A.rect(g,x,127,10,16,'#aeb6a6');
      for(let x=245;x<835;x+=47){A.rect(g,x,124,28,11,'#7f8981');A.rect(g,x+2,121,24,8,'#b6bbac');}
      A.rect(g,420,414,36,31,'#706e5b');A.ellipse(g,438,428,20,20,'#978e71');A.ellipse(g,438,428,14,14,'#bcc0a7');A.rect(g,436,409,4,38,'#7d7c64');A.rect(g,419,426,38,4,'#7d7c64');
    }
    if(id==='sanctuary'){
      for(let i=0;i<5;i++)A.rect(g,722-i*12,157+i*7,149+i*24,6,'#c4c9b5');
      for(const x of [743,847]){A.rect(g,x,110,10,83,'#9faea1');A.rect(g,x+2,112,5,78,'#dce0c9');A.rect(g,x-3,107,16,6,'#e0dfc5');}A.rect(g,741,99,120,10,'#cfd4bd');A.rect(g,764,113,72,12,'#b9c5b1');
      A.house(g,176,205,81,63,true);for(let i=0;i<35;i++)A.flower(g,450+A.hash(i,6)*399,365+A.hash(i,7)*190);
    }
    const ts=[];for(let x=25;x<940;x+=40){ts.push({x,y:83});ts.push({x:x+10,y:618});}for(let y=133;y<600;y+=46){ts.push({x:30,y});ts.push({x:931,y});}
    for(let i=0;i<12;i++)ts.push({x:120+A.hash(i,10)*720,y:i%2?540:140});
    ts.forEach(t=>A.tree(g,t.x,t.y,id==='orchard'?1:0));decor[id]=ts;
    maps[id]=c;return c;
  }
  function drawWorld(ctx,camera,clockNow,player){
    const A=Art;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,480,270);ctx.save();ctx.translate(-Math.round(camera.x),-Math.round(camera.y));ctx.drawImage(buildMap(r()),0,0);
    if(r()==='marsh'&&j().step>=10){A.rect(ctx,666,195,67,61,'#a79c76');for(let y=198;y<257;y+=8)A.rect(ctx,667,y,65,1,'#cec099');}
    NineRoads.effects(ctx,clockNow);
    const target=objectiveTarget(),things=[];
    for(const o of objects()){
      if(!allowed(o))continue;
      things.push({y:o.y,draw:()=>{
        if(o.kind==='npc')A.person(ctx,o.x,o.y,o.skin,'down',clockNow,false);
        if(o.kind==='exit'){A.sign(ctx,o.x,o.y);ctx.fillStyle='#f4e3aa';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(o.id==='west'?'←':'→',o.x,o.y-20);}
        if(o.kind==='camp'||o.kind==='beacon')A.lantern(ctx,o.x,o.y,clockNow,o.kind==='camp'||has('beacon-'+o.id)||has('lamp-'+o.id));
        if(o.kind==='sign')A.sign(ctx,o.x,o.y);
        if(o.kind==='deed'){A.person(ctx,o.x,o.y,o.skin,'down',clockNow,false);}
        if(o.kind==='task'){A.rect(ctx,o.x-5,o.y-8,10,8,'#d8ba7c');A.rect(ctx,o.x-3,o.y-11,6,3,'#f5e3ac');}
        if(o.kind==='basket'){A.rect(ctx,o.x-8,o.y-10,16,11,has(o.id)?'#817d5d':'#a98554');A.rect(ctx,o.x-7,o.y-7,14,2,'#d2b47a');if(!has(o.id)){A.rect(ctx,o.x-5,o.y-13,5,5,'#d9aa65');A.rect(ctx,o.x+1,o.y-12,5,5,'#d4c57d');}}
        if(o.kind==='switch'){A.rect(ctx,o.x-8,o.y-8,16,10,'#758681');A.rect(ctx,o.x-1,o.y-19,3,16,'#cec29c');A.rect(ctx,o.x-5,o.y-21,11,4,has('water-'+o.id)||has('sluice-'+o.id)?'#9ecb9e':'#bd9864');}
        if(o.kind==='bell'){A.rect(ctx,o.x-9,o.y-26,3,29,'#746d57');A.rect(ctx,o.x+8,o.y-26,3,29,'#746d57');A.rect(ctx,o.x-9,o.y-27,20,3,'#c2b887');A.rect(ctx,o.x-4,o.y-21,10,12,'#c3ad6c');A.rect(ctx,o.x-6,o.y-11,14,3,has('bell-'+o.id)?'#dfd9ab':'#e2c886');}
        if(o.kind==='guardian'){
          const calm=has('guardian-'+r());A.ellipse(ctx,o.x,o.y,20,7,'#31484755');A.rect(ctx,o.x-15,o.y-36,30,30,calm?'#819d83':'#667979');A.rect(ctx,o.x-12,o.y-40,24,30,calm?'#a8b798':'#8e9f98');A.rect(ctx,o.x-18,o.y-23,6,19,'#687c72');A.rect(ctx,o.x+12,o.y-23,6,19,'#687c72');A.rect(ctx,o.x-8,o.y-31,4,3,'#e7d99b');A.rect(ctx,o.x+5,o.y-31,4,3,'#e7d99b');A.rect(ctx,o.x-8,o.y-18,17,2,'#5c7569');A.rect(ctx,o.x-4,o.y-45,9,5,'#d3c289');
        }
        if(o.kind==='secret'){A.rect(ctx,o.x-3,o.y-7,7,7,'#cfbd91');ctx.fillStyle='#ffebae';ctx.font='10px monospace';ctx.textAlign='center';ctx.fillText('✧',o.x,o.y-12);}
        if(target?.id===o.id){ctx.fillStyle='#eed398';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('!',o.x,o.y-48);}
      }});
    }
    things.push({y:s().y,draw:()=>{A.person(ctx,s().x,s().y,'eli',player.dir,clockNow,player.moving,NineRoads.activity().kind);if(s().stage===8&&!(j().step===55&&j().choices.finale===0))A.person(ctx,s().x-17,s().y+10,'jonah',player.dir,clockNow,player.moving,NineRoads.activity().kind);}});
    things.sort((a,b)=>a.y-b.y).forEach(t=>t.draw());
    if(r()==='tower'&&j().step===16){for(const o of objects().filter(o=>o.kind==='bell')){ctx.strokeStyle=hazardActive()?'#f5cfa0':'#a5c7ac88';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y,19,9,0,0,Math.PI*2);ctx.stroke();}}
    if(!s().settings.reduced){for(let i=0;i<18;i++){const x=100+(i*79+clockNow*5)%750,y=135+(i*53)%405+Math.sin(clockNow+i)*3;A.rect(ctx,x,y,2,1,r()==='marsh'?'#bddec19a':'#f5e6b68a');}}
    ctx.restore();if(target){const x=target.x-camera.x,y=target.y-camera.y;if(x<15||x>465||y<40||y>245){ctx.fillStyle='#f1d793';ctx.font='12px monospace';ctx.fillText('◆',Math.max(12,Math.min(465,x)),Math.max(40,Math.min(245,y)));}}
  }
  function mapRender(canvas,id){
    const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,sx=w/960,sy=h/640;c.imageSmoothingEnabled=false;c.drawImage(buildMap(id),0,0,w,h);
    const fog=new Set(j().fog[id]||[]);for(let y=0;y<16;y++)for(let x=0;x<24;x++)if(!fog.has(y*24+x)){c.fillStyle='#182e2e';c.fillRect(x*40*sx,y*40*sy,40*sx+.5,40*sy+.5);}
    const visible=o=>fog.has(Math.floor(o.y/40)*24+Math.floor(o.x/40));
    const dot=(x,y,color,size,shape='circle')=>{c.fillStyle=color;c.strokeStyle='#18342c';c.lineWidth=1;c.beginPath();if(shape==='diamond'){c.moveTo(x,y-size);c.lineTo(x+size,y);c.lineTo(x,y+size);c.lineTo(x-size,y);c.closePath();}else if(shape==='square')c.rect(x-size,y-size,size*2,size*2);else c.arc(x,y,size,0,Math.PI*2);c.fill();c.stroke();};
    for(const o of objects(id)){if(!['exit','camp','npc'].includes(o.kind)||!visible(o))continue;dot(o.x*sx,o.y*sy,o.kind==='exit'?'#edcc86':o.kind==='camp'?'#8fd0b6':'#e5d1b1',w>200?4:1.7,o.kind==='exit'?'diamond':o.kind==='camp'?'square':'circle');}
    if(id==='village')for(const o of [{x:321,y:291},{x:398,y:263}])if(visible(o))dot(o.x*sx,o.y*sy,'#e5d1b1',w>200?4:1.7);
    if(id===r()){
      const target=j().choices.guidance===1?null:objectiveTarget()||(s().stage<8?api.target():null);if(target){c.fillStyle='#f7c96c';c.beginPath();c.arc(target.x*sx,target.y*sy,w>200?5:2.5,0,Math.PI*2);c.fill();}
      dot(s().x*sx,s().y*sy,'#fff7d6',w>200?5:2.5,'diamond');
    }
    c.fillStyle='#fff7d6';c.font='bold 10px monospace';c.fillText('N ↑',5,12);
  }
  function drawMini(){if(api&&api.mode()!=='title')mapRender($('minimap'),r());}
  function closePanels(){if(!mapMode)return;$('atlas').hidden=true;$('journal').hidden=true;api.mode(mapMode);mapMode=null;}
  function openPanel(id){if(!['play','menu'].includes(api.mode()))return;if(mapMode)return;mapMode=api.mode();api.clearInput();api.mode('atlas');$(id).hidden=false;if(id==='atlas'){selected=r();renderAtlas();}else renderJournal();}
  function renderAtlas(){
    $('region-tabs').replaceChildren();D.order.forEach(id=>{const b=document.createElement('button');b.textContent=j().visited.includes(id)?D.regions[id].name:'Unvisited road';b.disabled=!j().visited.includes(id);b.className=id===selected?'selected':'';b.onclick=()=>{selected=id;renderAtlas();};$('region-tabs').append(b);});mapRender($('large-map'),selected);$('map-caption').textContent=D.regions[selected].name+' · '+D.regions[selected].theme;$('fast-travel').replaceChildren();
    if(j().tools.includes('rope')&&selected!==r()){const b=document.createElement('button');b.textContent='Take the return shortcut →';b.onclick=()=>{closePanels();if(api.mode()==='menu'){$('menu').hidden=true;api.mode('play');}travel(selected);};$('fast-travel').append(b);}else $('fast-travel').textContent=j().tools.includes('rope')?'Select a visited region to take a shortcut.':'Return shortcuts unlock with Neri’s rescue rope.';
  }
  function renderJournal(){
    $('inventory').replaceChildren();const title=document.createElement('strong');title.textContent='SATCHEL · '+j().secrets.length+' quiet discoveries';$('inventory').append(title);
    for(const id of j().tools){const p=document.createElement('p');p.textContent=D.tools[id][0]+' — '+D.tools[id][1];$('inventory').append(p);}
    if(!j().tools.length){const p=document.createElement('p');p.textContent='A staff, lantern oil, and a willingness to begin.';$('inventory').append(p);}
    $('journal-pages').replaceChildren();
    const community=document.createElement('article');const heading=document.createElement('h3');heading.textContent='People and promises';community.append(heading);for(const row of D.community){const id=row[1];if(!has('accepted-'+id))continue;const p=document.createElement('p');p.textContent=row[2]+' — '+(has('done-'+id)?'Care completed; the community remembers.':has('found-'+id)?'Ready to return.':row[7]);community.append(p);}$('journal-pages').append(community);
    if(!j().lessons.length){const p=document.createElement('p');p.textContent='Help Jonah in Willowbrook to begin these pages. You can return here with B at any time.';$('journal-pages').append(p);}
    for(const id of j().lessons){const l=D.lessons[id],article=document.createElement('article');
      for(const [tag,text]of [['h3',l.title],['blockquote',l.quote],['small',l.ref+' · KJV'],['p',l.context],['p','Story reflection: '+l.reflection],['h4',l.question]]){const el=document.createElement(tag);el.textContent=text;article.append(el);}
      const a=document.createElement('a');a.textContent='Read the verse online ↗';a.href=l.url;a.target='_blank';a.rel='noopener noreferrer';article.append(a);
      const choices=document.createElement('div'),feedback=document.createElement('p');feedback.className='reflection-feedback';feedback.setAttribute('aria-live','polite');if(j().reviews[id]!==undefined)feedback.textContent=l.feedback[j().reviews[id]];
      l.answers.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.onclick=()=>{j().reviews[id]=i;feedback.textContent=l.feedback[i];api.save(true);};choices.append(b);});article.append(choices,feedback);$('journal-pages').append(article);
    }
    for(const id of j().secrets){const o=Object.values(D.objects).flat().find(o=>o.id===id);if(!o)continue;const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=o.label;p.textContent=o.text;a.append(h,p);$('journal-pages').append(a);}
  }
  function attach(a){api=a;NineRoads.attach({state:s,say,lines,choose,advance,lesson,save:api.save,toast:api.toast,ending:api.ending});$('minimap-button').onclick=()=>openPanel('atlas');$('journal-button').onclick=()=>openPanel('journal');$('atlas-close').onclick=closePanels;$('journal-close').onclick=closePanels;document.querySelector('.subtitle').textContent='ROADS OF MERCY';const host=$('fast-travel').parentElement;const guidance=document.createElement('button');guidance.id='map-guidance';guidance.textContent='Toggle objective guidance';guidance.onclick=()=>{j().choices.guidance=j().choices.guidance===1?0:1;guidance.textContent='Objective guidance: '+(j().choices.guidance===1?'off':'on');api.save(true);renderAtlas();};host.append(guidance);const hint=document.createElement('button');hint.textContent='Ask for a progressive hint (H)';hint.onclick=()=>{closePanels();NineRoads.hint();};host.append(hint);}
  function key(code){if(mapMode){if(['Escape','KeyM','KeyB'].includes(code)){closePanels();return true;}return false;}if(api.mode()==='play'&&code==='KeyH'){NineRoads.hint();return true;}if(api.mode()==='play'&&code==='KeyC'&&s().stage===8){NineRoads.companion();return true;}if(code==='KeyM'){openPanel('atlas');return true;}if(code==='KeyB'){openPanel('journal');return true;}return false;}
  return {fresh,validate,attach,nearby,interact,mara,blocked,update,drawWorld,drawMini,title,connect,target:objectiveTarget,key,complete,travel,objects,buildMap};
})();
