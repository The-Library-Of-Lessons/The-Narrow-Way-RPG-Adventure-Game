/* New-region interactions, visible consequences, optional stories and final resolutions. */
window.NineRoads=(()=>{
  const D=CampaignData,$=id=>document.getElementById(id);
  let A,activity={until:0,kind:'',x:0,y:0},t=0,lastAmbient=0;
  const s=()=>A.state(),j=()=>s().journey,r=()=>s().region,has=f=>j().flags.includes(f),set=f=>{if(!has(f))j().flags.push(f);},say=(n,x,f)=>A.say(n,x,f),q=()=>j().step;
  const intro=[['Mara','The harbor has sent for help. People are arriving faster than the ferries can carry them onward. We have learned to care for one traveler. Now we must learn to care when there are many.'],['Jonah','I said I would come back. I did. Now I would like to go with you again—not to hide from this place, but to carry something good from it.'],['Mara','Remember what Jesus said about loving God with all your heart, soul, and mind, and loving your neighbor as yourself. We will need both devotion and attention on this road.']];
  const choose=(name,text,options,done)=>A.choose(name,text,options,done);
  function begin(){A.lines(intro,()=>{A.lesson('commandments');A.advance(25);});}
  function act(kind){activity={kind,x:s().x,y:s().y,until:t+1.4};}
  function setChoice(k,v){j().choices[k]=v;A.save(true);}
  function mark(id,next,ids,text){if(has(id)){A.toast('Already done. '+D.objectives[q()]);return;}set(id);act('work');Sound.fx('pick');if(ids.every(has))say('A task shared',text,()=>A.advance(next));else{A.toast('Completed · '+ids.filter(has).length+' / '+ids.length);A.save(true);}}
  function dial(o,ids,values,count,next,message){
    const key='dial-'+o.id;j().choices[key]=((j().choices[key]||0)+1)%count;act('work');Sound.fx('pick');A.toast(o.label+' · '+(['north','east','south','west'][j().choices[key]]&&count===4?['north','east','south','west'][j().choices[key]]:j().choices[key])+' · H for a hint');A.save(true);
    if(ids.every((id,i)=>(j().choices['dial-'+id]||0)===values[i])){set('mechanism-'+r());say(o.label,message,()=>A.advance(next));}
  }
  function community(o){
    if(!['deed','task'].includes(o.kind))return false;const id=o.id.replace(/^(deed|task)-/,''),d=D.community.find(x=>x[1]===id);if(!d)return false;
    if(s().stage<8){say(d[2],'First help Mara and the wounded traveler. This neighbor’s request will be here when you return.');return true;}
    if(o.kind==='deed'){
      if(has('done-'+id))say(d[2],d[9]);
      else if(has('found-'+id))say(d[2],d[9],()=>{set('done-'+id);act('give');A.save(true);A.toast('Community story completed · '+d[2]);});
      else say(d[2],d[7],()=>{set('accepted-'+id);A.save(true);A.toast('A community request is recorded in your journal.');});
    }else if(has('accepted-'+id)&&!has('found-'+id))say(d[2],d[8],()=>{set('found-'+id);act('kneel');A.save(true);A.toast('Return to the neighbor who asked for help.');});
    else say(d[2],has('found-'+id)?'You have already followed up. Return to the person who asked.':'A small detail of someone else’s story. A nearby neighbor may know why it matters.');return true;
  }
  function interact(o){
    if(community(o))return true;
    if(o.id==='companion-talk'){companion();return true;}
    if(q()===24&&r()==='village'&&o.kind==='exit'){begin();return true;}
    if(!['harbor','heights','refuge','crossing'].includes(r()))return false;
    const step=q(),id=o.id;
    if(['exit','secret','camp'].includes(o.kind)&&id!=='last-lantern')return false;
    if(id==='clue'||id==='song'){say(o.label,o.text,()=>{set('clue-'+r());A.save(true);});return true;}
    if(r()==='harbor'){
      if(id==='iona'){
        if(step===25)A.lines([['Iona','We can carry everyone across two tides. A frightened crowd hears “two tides” and thinks it means “some of us will be left.” Help me make a plan people can understand.'],['Jonah','Could we just take whoever shouts loudest first?'],['Iona','Then the quietest would pay for our haste. Read the tide board, the passenger register, and the cargo manifest. Come back with the people in mind.']],()=>A.advance(26));
        else if(step===27)choose('Iona','Both crossings can be safe. Which first voyage will you organize?',[
          ['Take families to the ready shelter first.','Carers board with the children. Porters agree to keep the grain dry until the next tide.'],
          ['Take the grain and kitchen crew first to prepare hot meals.','The kitchen crew goes ahead. Families wait under Iona’s shelter, with carers and clear information.']
        ],i=>{setChoice('harbor-plan',i);A.advance(28);say('Iona','The draft wheels now need setting. Use the vessel measurements on the tide board. Their notches cycle from zero to two.');});
        else say('Iona',step>30?'Everyone crossed. The harbor remembers a plan explained with care.':D.objectives[step]);
      }else if(['tide-board','passenger-list','manifest'].includes(id))say(o.label,o.text,()=>{if(step===26){set('read-'+id);if(['tide-board','passenger-list','manifest'].every(x=>has('read-'+x)))A.advance(27);else A.save(true);}});
      else if(['ferry-wheel','barge-wheel','rescue-wheel'].includes(id)){if(step===28)dial(o,['ferry-wheel','barge-wheel','rescue-wheel'],[0,1,2],3,29,'The hull marks match the harbor depth. You can now explain the plan to the families, porters, and carers.');else A.toast(D.objectives[step]);}
      else if(['families','porters','carers'].includes(id)){
        if(step===29)say(o.label,j().choices['harbor-plan']===0?'We understand. Families go with carers, and grain follows on the next tide. Thank you for telling us what will happen.':'We understand. The kitchen goes ahead, and families wait here with Iona until the next tide. Nobody is being forgotten.',()=>mark('briefed-'+id,30,['briefed-families','briefed-porters','briefed-carers'],'A crowd becomes three cooperating crews. The harbor signal is ready.'));
        else say(o.label,'Knowing the plan made waiting easier than guessing what was happening.');
      }else if(id==='signal'){
        if(step!==30){A.toast(D.objectives[step]);return true;}if(t%3<1){A.toast('The signal ring is bright. Wait for the quiet part of the tide.');return true;}j().choices.signals=(j().choices.signals||0)+1;A.save(true);act('give');if(j().choices.signals>=3){set('guardian-harbor');say('Iona','The ferries are across. A place has been kept for every name. Before you leave, Jonah is waiting by the harbor bench.',()=>A.advance(31));}else A.toast('Clear signal · '+j().choices.signals+' / 3');
      }else if(id==='bench'){
        if(step===31)A.lines([['Jonah','I used to wait near harbors because it was easy to disappear into a crowd. Today Iona asked me to read the names. She trusted me with people, not just things.'],['Eli','How did that feel?'],['Jonah','Frightening. Good. I kept checking that I had not missed anyone. I think I would rather be known than disappear.']],()=>A.advance(32));else say('The harbor bench','Two empty places overlook a road made of water.');
      }
    }
    if(r()==='heights'){
      if(id==='reuben'){
        if(step===32)A.lines([['Reuben','The storm damaged both neighborhoods. Each believes the other will take all the repairs. We have enough hands, but not enough trust to begin.'],['Jonah','I know what it is to ask for trust before doing the work. Perhaps we should listen first.'],['Reuben','Hear the builder, the teacher, and the water carrier. Each sees a part the others miss.']],()=>A.advance(33));
        else if(step===35)choose('Reuben','The common basin works again. Which shared building should both neighborhoods repair first?',[
          ['Repair the workshop so tools can support the remaining work.','The teacher agrees to hold lessons outdoors for now. Builders promise to repair the school next.'],
          ['Repair the school so children have a sheltered meeting place.','Builders lend portable tools while the workshop waits. Families offer a place to store them.']
        ],i=>{setChoice('heights-plan',i);A.advance(36);});else say('Reuben',step>38?'Both doors are open now. We still disagree sometimes, but we know how to begin a conversation.':D.objectives[step]);
      }else if(['builder','teacher','water-carrier'].includes(id)){
        const text=id==='builder'?'I need a dry workshop to repair tools. I am not asking the children to stop learning. I want to build something that helps their school last.':id==='teacher'?'The children need shelter, but they also need to see us work together. A repaired school surrounded by angry adults would teach its own lesson.':'The shared basin is blocked because the mirrors point at private doorways. Turn them toward the courtyard according to the old drawing.';
        say(o.label,text,()=>{if(step===33){set('heard-'+id);if(['builder','teacher','water-carrier'].every(x=>has('heard-'+x)))A.advance(34);else A.save(true);}});
      }else if(['west-mirror','center-mirror','east-mirror'].includes(id)){if(step===34)dial(o,['west-mirror','center-mirror','east-mirror'],[1,0,3],4,35,'The light meets above the common basin. Water runs where both neighborhoods can reach it. Return to Reuben.');else A.toast(D.objectives[step]);}
      else if(['west-house','east-house','workshop'].includes(id)){
        if(step===36)say(o.label,j().choices['heights-plan']===0?'We will bring tools to the workshop first, and keep our promise to the school. Please tell the other side we are coming.':'We will shelter the children first, and lend our tools until the workshop is repaired. Please tell the other side we are coming.',()=>mark('agreement-'+id,37,['agreement-west-house','agreement-east-house','agreement-workshop'],'Now plant both sides of the shared courtyard. Let the first visible change belong to everyone.'));
        else say(o.label,'A shared plan gave us something to do besides protect our own side.');
      }else if(['west-bed','east-bed'].includes(id)){if(step===37)mark('planted-'+id,38,['planted-west-bed','planted-east-bed'],'Jonah has taken his place at the meeting gate. Hold the other handle with him.');else A.toast(D.objectives[step]);}
      else if(id==='meeting-gate'){
        if(step===38)A.lines([['Jonah','This handle holds only while the other person keeps holding theirs. I cannot promise never to let anyone down. I can keep holding now.'],['Eli','Then we will open it together.'],['Reuben','The winter road is open. Take the work of both neighborhoods with you.']],()=>{set('guardian-heights');act('work');A.advance(39);});else say('The meeting gate',step>38?'The two handles rest beside an open passage.':'The gate needs two people who are ready to work together.');
      }
    }
    if(r()==='refuge'){
      if(id==='esther'){
        if(step===39)A.lines([['Esther','The house is full. Nobody needs to prove they deserve warmth. But every room needs something different, and I am too tired to see all of it clearly.'],['Jonah','Tell us where to begin.'],['Esther','Visit the infirmary, kitchen, and sleeping hall. Ask what would actually help before carrying things to them.']],()=>A.advance(40));
        else if(step===42)choose('Esther','There is space to shelter everyone. How will you organize the next part of the night?',[
          ['Keep households together; send carers between rooms.','Children settle beside familiar faces. Carers agree on a quiet route so nobody is overlooked.'],
          ['Group people by immediate need, with family visits.','The infirmary receives those needing closer attention. Volunteers help families stay in contact.']
        ],i=>{setChoice('refuge-plan',i);A.advance(43);say('Esther','Bring linen and balm to the infirmary, grain to the kitchen, and blankets to the hall. We will keep a place for the shepherd still outside.');});else say('Esther',step>46?'There is still work, but the house is no longer carrying it alone.':D.objectives[step]);
      }else if(['infirmary','kitchen','hall'].includes(id)){
        const text=id==='infirmary'?'Our patients need twice as much warmth as either other room. Clean linen matters more here than another bundle of firewood.':id==='kitchen'?'We need a steady share of heat, equal to the hall. Grain and oil will become meals for everyone.':'We need the same share of heat as the kitchen, and dry blankets. Some people are too proud to ask for one.';
        say(o.label,text,()=>{if(step===40){set('need-'+id);if(['infirmary','kitchen','hall'].every(x=>has('need-'+x)))A.advance(41);else A.save(true);}else if(step===43){const item={infirmary:'medicine',kitchen:'bread',hall:'blankets'}[id];if(!has('packed-'+item)){A.toast('Find the requested supplies first.');return;}mark('supplied-'+id,44,['supplied-infirmary','supplied-kitchen','supplied-hall'],'All three rooms have what they need. A red thread marks the missing shepherd’s trail outside.');}});
      }else if(['north-valve','east-valve','south-valve'].includes(id)){if(step===41)dial(o,['north-valve','east-valve','south-valve'],[2,1,1],3,42,'Warmth reaches all three rooms without starving the infirmary. Esther is ready to plan the shelter.');else A.toast(D.objectives[step]);}
      else if(['medicine','bread','blankets'].includes(id)){if(step===43){set('packed-'+id);act('gather');A.save(true);A.toast('Packed · '+o.label+'. Bring it to the room that needs it.');}else A.toast(D.objectives[step]);}
      else if(['trail-a','trail-b'].includes(id)){say(o.label,o.text,()=>{if(step===44){set(id);A.save(true);}});}
      else if(id==='shepherd'){
        if(step===44&&has('trail-a')&&has('trail-b'))A.lines([['The shepherd','I kept going uphill because I was afraid to admit I had lost the way. Then I saw the thread my daughter tied to my staff.'],['Jonah','You found shelter. That was a good decision. We can go back together.'],['The shepherd','The flock follows our old three-note song. Read it near the bells. You do not have to ring quickly; only clearly.']],()=>A.advance(45));else say('The shepherd',step>44?'I am warm enough to help someone else now.':'Follow the trail evidence so you can show me a safe route home.');
      }else if(['winter-low','winter-high'].includes(id)){
        if(step!==45){A.toast(D.objectives[step]);return true;}const n=j().choices['winter-song']||0,expected=['winter-low','winter-low','winter-high'][n];if(id!==expected){j().choices['winter-song']=0;A.toast('The song begins again. Listen to the old verse; there is no penalty.');}else{j().choices['winter-song']=n+1;Sound.fx('pick');if(n===2){set('guardian-refuge');say('The winter house','One by one, small shapes appear beyond the lanterns. The flock has followed the song home. Jonah has letters waiting by the fire.',()=>A.advance(46));}}A.save(true);
      }else if(id==='letters'){
        if(step===46)A.lines([['Jonah','Ada sent a drawing of the gate. Sela wrote a date for next spring. They expect me to be somewhere. I did not know a promise could feel like a place to live.'],['Eli','You could stay here until the storm passes.'],['Jonah','I could. But I want to walk the last road with you. Not because you saved me. Because we are friends.']],()=>A.advance(47));else say('Letters by the fire','The ink smells faintly of smoke and home.');
      }
    }
    if(r()==='crossing')finalInteract(o);
    return true;
  }
  function finalInteract(o){
    const step=q(),id=o.id;
    if(id==='mara-final'){
      if(step===47)A.lines([['Mara','Everyone has reached the high bank. The road brought back the people you met—not as a reward, but because they have learned to work together.'],['Jonah','What is left to do?'],['Mara','Listen to the three crews. Then inspect the crossing before we decide anything. The people are safe. We have time to tell the truth.']],()=>A.advance(48));
      else if(step===51)deliberate();else say('Mara',step>=52?'Stay with the people. We will carry what comes together.':D.objectives[step]);
    }else if(['food-crew','bridge-crew','ferry-crew'].includes(id)){
      const text=id==='food-crew'?(j().choices.rootkeeper===0?'Tamar brought food from the open roadside table. The travelers who shared it returned to help carry supplies.':'Tamar’s reserved baskets reached the families waiting here. A planned welcome became a store for this night.'):
        id==='bridge-crew'?(j().choices['heights-plan']===0?'The repaired workshop sent tools. Sela has enough fittings to secure every evacuation line.':'The school sheltered the arriving children. Sela can work knowing they have a warm place to wait.'):
        j().choices['harbor-plan']===0?'Iona’s carers know the families by name. They can keep everyone together while the ferries move.':'Iona’s kitchen crew has meals ready. Waiting will not mean going hungry tonight.';
      say(o.label,text,()=>{if(step===48)mark('crew-'+id,49,['crew-food-crew','crew-bridge-crew','crew-ferry-crew'],'All crews are accounted for. Read the gauge, survey, and warning beacon before choosing a response.');});
    }else if(['gauge','survey','warning'].includes(id)){
      const text=id==='gauge'?'The storm water will reach the fork. The people have been evacuated. The controls can protect the village buildings or the orchard terraces, but the old channel cannot protect both.':id==='survey'?'Diverting water toward the terraces protects Willowbrook’s homes but destroys the coming harvest. Opening the village channel preserves the food-growing terraces but floods the empty homes. Both routes lead away from the high bank.':'There is no hidden third gate. The crews have checked. Extra hands can save belongings and care for families; they cannot change the shape of this valley.';
      say(o.label,text,()=>{if(step===49)mark('survey-'+id,50,['survey-gauge','survey-survey','survey-warning'],'Secure every evacuation station first. No decision about buildings should endanger the people.');});
    }else if(id.startsWith('station-')){if(step===50)mark('secured-'+id,51,['secured-station-a','secured-station-b','secured-station-c'],'The last person is on the high bank. Return to Mara. The next decision has no timer.');else A.toast(step>50?'The people are safe.':D.objectives[step]);}
    else if(id==='memorial')say('Things carried from home','Ada’s gate drawing. A bowl from Mara’s kitchen. The first empty oil flask Eli carried here. The box is small. The things that make a place home are not.');
    else if(id==='control'){
      if(step===52)A.lines([['Jonah',j().choices.finale===0?'The homes will stand. I will go with Tamar when she finds land to plant again. I cannot ask her to carry that loss alone.':'The terraces will feed the people. I will help Mara build a new room around her old table. We can carry home even when we cannot carry the walls.'],['Eli','I wanted a way that would not hurt anyone.'],['Jonah','I know. Stay with me while we do the thing we chose.']],()=>{set('final-controls');act('work');A.advance(53);});else say('The controls',step<52?'First account for the people, inspect the crossing, and speak with Mara.':'The water has taken its course. The work now is with the people.');
    }else if(id==='shelter'){
      if(step===53)A.lines([['Mara',j().choices.finale===0?'Tomorrow we will open the standing homes to those whose fields are gone. No one will be told this loss is small.':'Tomorrow we will eat from the terraces while we make homes again. No one will be told not to grieve the old ones.'],['A neighbor',has('done-warm-coat')?'The traveler in the patched coat is giving out blankets now.':has('done-seed-library')?'Tamar has kept the seed names, even as people gather around her.':'Someone passes a cup along the row. The next person fills it again.'],['Jonah','There is a place by the lantern. Will you sit with me before tomorrow comes?']],()=>A.advance(54));else say('The gathered neighbors','Everyone is accounted for. Some are talking. Some are quiet. Both are welcome here.');
    }else if(id==='last-lantern'){
      if(step===54)A.lines([['Jonah','When you found me, I thought the road ended wherever I fell. You stopped. That did not fix everything. It changed who had to face it alone.'],['Eli','Will we see each other again?'],['Jonah',j().choices.finale===0?'I will write from the new fields. I cannot tell you when I will come back. But this time, leaving is a promise to someone—not a way to disappear.':'When the first new door opens, I want you to bring the oil. The road will take you away sometimes. You will still have a place at the table.'],['The high bank','For a while, neither of them speaks. The lantern needs no answer.']],()=>{A.advance(55);finish();});else if(step===55)finish();else say('A place beside the lantern','A quiet place is waiting. Finish caring for the people before resting here.');
    }
  }
  function deliberate(){
    try{localStorage.setItem('narrow-way-before-final-choice',JSON.stringify(s()));}catch{/* Export remains available. */}
    choose('Mara','The people are safe. We must choose what the valley will lose. Neither option makes the loss deserved. Neither is presented as a command from God. You can take time, ask Jonah, or export a save before deciding.',[
      ['Consider protecting Willowbrook’s homes.','The village buildings will stand; the orchard terraces and harvest will be lost. The community will need food and new ground to plant.'],
      ['Consider protecting the orchard terraces.','The food-growing terraces will remain; Willowbrook’s evacuated homes will flood. The community will need shelter and a place to rebuild.'],
      ['I need time to think and speak with Jonah.','Take that time. No clock is running against you. A pre-decision save is preserved in this browser; you can export your current journey from the pause menu.']
    ],i=>{if(i===2)return;choose('Jonah','This choice will shape the remaining story. Are you ready to commit to the road you have considered?',[
      ['Not yet. Return to the crossing.','We can walk and talk a little longer.'],
      ['Yes. We will carry this cost together.','Then let us go to the controls together. Nobody should have to make the next step alone.']
    ],confirm=>{if(confirm===1){setChoice('finale',i);A.advance(52);}});});
  }
  function finish(){
    const home=j().choices.finale===0;
    $('ending').querySelector('small').textContent='NINE ROADS · A JOURNEY REMEMBERED';$('ending').querySelector('h2').textContent=home?'Where the letters will find us.':'A table before there are walls.';
    $('ending').querySelector('.menu-card > p').textContent=home?'The homes remain. The fields must begin again. Jonah’s first letter arrives with a seed pressed into its fold.':'The terraces remain. The homes must begin again. On the first new table, Mara sets a place for a courier.';
    const quote=$('ending').querySelector('blockquote');quote.replaceChildren(document.createTextNode('“And the second is like unto it, Thou shalt love thy neighbour as thyself.”'));const cite=document.createElement('cite');cite.textContent='Matthew 22:39 · KJV · Read 22:37–40 for both commandments';quote.append(cite);
    let pages=$('epilogue-pages');if(!pages){pages=document.createElement('div');pages.id='epilogue-pages';$('ending-stats').before(pages);}pages.replaceChildren();
    const details=[home?'Tamar leaves with Jonah to find new planting ground. The door Ada helped widen now welcomes families from the terraces.':'Jonah stays to help Mara rebuild. Ada carries her gate drawing to the builders, who ask where the new entrance should go.',j().choices['heights-plan']===0?'Tools from the shared workshop pass from crew to crew.':'The repaired school becomes a place to rest and tell the children what happened.',j().choices['refuge-plan']===0?'Esther keeps households together as they settle into the shelters.':'Esther organizes care by need and makes time for families to visit.',has('done-toy-bird')?'A child holds the repaired wooden bird through the first night.':'Sela records the work that remains beside the names of those who promised to return.','No one calls the loss a victory. No one has to carry it alone.'];
    for(const text of details){const p=document.createElement('p');p.textContent=text;pages.append(p);}$('explore').textContent='Walk the roads that remember →';A.ending();$('ending-stats').textContent='Nine regions · '+D.community.filter(d=>has('done-'+d[1])).length+' community stories completed';
  }
  function companion(){
    const id='companion-'+r();let text;
    if(q()===55&&j().choices.finale===0){say('A letter from Jonah','The first planting rows are marked. Tamar says we must wait before we can know what will grow. I have kept your place in the story I tell about the road. Write when you can.');return;}
    if(r()==='crossing'&&q()>=49)text='I cannot tell you which loss you should bear. I can remind you that the people are safe, that both goods matter, and that I will walk beside you afterward. Love God with your whole heart. Love the neighbor who is actually here. Ask for wisdom; do not pretend you have certainty you do not have.';
    else text={village:'I used to notice doors only when they were locked. Ada showed me a gate she wanted to open wider.',orchard:'You asked Boaz before deciding who he was. I noticed. I think people can feel when they are being treated as a story already finished.',marsh:'Being listened to is not the same as being believed without question. Oren needed both patience and careful questions.',tower:'Sela did not say everything was fine. I am beginning to understand why that made her kindness easier to trust.',sanctuary:'I am still angry sometimes. Giving that man bread did not make the anger disappear. It gave me something else to do with my hands.',harbor:'Iona let me read the names. I checked every one twice.',heights:'Holding the other handle was a small job. Someone depended on me staying there. I liked that.',refuge:'The letters have dates in them. People expect me to return. It feels like being given a future.'}[r()]||'I am here.';
    say('Jonah',text,()=>{set(id);A.save(true);});
  }
  const hints={3:['Look at which roots are shallow and which are deep.','Small beds need a gentle supply before the mill opens.','Nursery → mill → old grove.'],9:['Compare what the witnesses could actually see.','Drain the uphill water before releasing the outlet.','Hill → reed → river.'],11:['Imagine following the route from the water.','Find land, then a navigable route, then a destination.','Shore → channel → home.'],16:['Listen from lower to higher; wait out bright warning rings.','The watchkeeper’s vow describes an upward pattern.','Low → middle → high.'],21:['Look for the beginning of love before its outward acts.','Receive, then attend to someone; action and release follow.','Receive → listen → serve → forgive.'],28:['Compare the three vessels on the tide board.','Each vessel needs one more notch than the previous one.','Ferry 0 · barge 1 · rescue 2.'],34:['The courtyard drawing gives directions, not a sequence.','The two outside mirrors point inward; the basin mirror points up.','West mirror east (1) · basin north (0) · east mirror west (3).'],41:['Ask each room what it needs.','The patients need double; the other rooms need equal shares.','Infirmary 2 · kitchen 1 · hall 1.'],45:['Read the winter song near the bells.','Home calls twice before the window answers.','Hearth bell, hearth bell, window bell.']};
  function hint(){const a=hints[q()];if(!a){A.toast(D.objectives[q()]);return;}const k='hint-'+q(),n=j().choices[k]||0;j().choices[k]=Math.min(2,n+1);say('A little guidance',a[n]+'\n\nAsk again for a clearer hint. No progress or reward is lost.');A.save(true);}
  function target(){const step=q(),region=step<=31?'harbor':step<=38?'heights':step<=46?'refuge':'crossing';if(step<25)return null;if(step>=55)return null;if(r()!==region)return D.objects[r()].find(o=>o.kind==='exit'&&(D.order.indexOf(region)>D.order.indexOf(r())?o.id==='east':o.id==='west'));
    const ids={25:'iona',26:['tide-board','passenger-list','manifest'].find(x=>!has('read-'+x)),27:'iona',28:'tide-board',29:['families','porters','carers'].find(x=>!has('briefed-'+x)),30:'signal',31:'bench',32:'reuben',33:['builder','teacher','water-carrier'].find(x=>!has('heard-'+x)),34:'clue',35:'reuben',36:['west-house','east-house','workshop'].find(x=>!has('agreement-'+x)),37:['west-bed','east-bed'].find(x=>!has('planted-'+x)),38:'meeting-gate',39:'esther',40:['infirmary','kitchen','hall'].find(x=>!has('need-'+x)),41:'clue',42:'esther',43:['infirmary','kitchen','hall'].find(x=>!has('supplied-'+x)),44:!has('trail-a')?'trail-a':!has('trail-b')?'trail-b':'shepherd',45:'song',46:'letters',47:'mara-final',48:['food-crew','bridge-crew','ferry-crew'].find(x=>!has('crew-'+x)),49:['gauge','survey','warning'].find(x=>!has('survey-'+x)),50:['station-a','station-b','station-c'].find(x=>!has('secured-'+x)),51:'mara-final',52:'control',53:'shelter',54:'last-lantern'};return D.objects[region].find(o=>o.id===ids[step]);}
  function buildMap(id,c){
    if(!['harbor','heights','refuge','crossing'].includes(id))return false;const g=c.getContext('2d'),P=Art;const colors={harbor:['#7da096','#8bab9c','#c3b287'],heights:['#a39d75','#b3ac80','#d5c196'],refuge:['#bdcdd0','#d0dcda','#b0bdb7'],crossing:['#718b81','#83988a','#bab59a']}[id];
    for(let y=0;y<640;y+=16)for(let x=0;x<960;x+=16){P.rect(g,x,y,16,16,colors[P.hash(x,y)>.5?1:0]);if(P.hash(y,x)>.7)P.rect(g,x+6,y+7,3,1,'#e3e5cb44');}
    const paths={harbor:[[65,296,832,48],[280,165,44,332],[300,426,509,44],[592,179,40,260],[770,168,34,301]],heights:[[65,298,833,46],[220,180,50,299],[246,169,500,38],[369,199,37,239],[506,167,40,329],[697,183,41,292],[248,422,494,40]],refuge:[[64,300,833,47],[276,177,40,295],[285,167,432,32],[371,326,34,143],[470,431,344,36],[690,203,34,271],[721,345,110,32]],crossing:[[64,298,833,49],[306,169,40,300],[325,172,401,37],[477,303,37,177],[345,439,469,41],[689,198,37,276]]}[id];
    for(const [x,y,w,h]of paths){P.rect(g,x,y,w,h,colors[2]);for(let i=0;i<w*h/120;i++)P.rect(g,x+P.hash(i,x)*w,y+P.hash(i,y)*h,2,1,'#8a917455');}
    if(id==='harbor'){
      P.rect(g,441,90,387,170,'#628e9c');for(let y=95;y<258;y+=12)for(let x=448;x<824;x+=28)P.rect(g,x,y,12,1,'#bad2c466');for(const x of [480,598,716]){P.rect(g,x,231,26,80,'#a78a60');for(let y=233;y<311;y+=7)P.rect(g,x,y,26,1,'#d5bd86');P.ellipse(g,x+42,209,30,12,'#5b6964');P.rect(g,x+15,190,52,17,'#b18d61');P.rect(g,x+23,181,35,10,'#e1c897');}P.house(g,166,188,94,70,true);P.house(g,305,375,72,57);
    }else if(id==='heights'){
      for(const [x,y]of [[172,120],[620,119],[172,365],[656,365]])P.house(g,x,y,88,65,x>400);P.ellipse(g,488,300,30,13,'#7a8b7f');P.ellipse(g,488,296,24,8,'#719f9c');P.rect(g,798,270,12,37,'#938a6d');P.rect(g,820,270,12,37,'#938a6d');P.rect(g,798,267,34,6,'#d5c79e');
    }else if(id==='refuge'){
      for(const [x,y,w,h]of [[226,217,84,68],[301,103,109,65],[617,125,110,64],[310,376,109,63]]){P.house(g,x,y,w,h,true);P.rect(g,x-5,y+12,w+10,5,'#eef0df');}for(let i=0;i<12;i++){const x=510+i*24,y=474-Math.floor(i/4)*44;P.rect(g,x,y,3,2,'#869d9b');P.rect(g,x+5,y+4,3,2,'#869d9b');}
    }else{
      P.rect(g,540,93,81,197,'#577b89');P.rect(g,540,348,81,248,'#577b89');P.rect(g,527,294,107,58,'#8c8064');for(let x=530;x<634;x+=8)P.rect(g,x,298,1,49,'#c0ac82');P.house(g,428,104,114,65,true);for(const x of [291,410,685,799])P.lantern(g,x,276,0,true);
    }
    for(let x=29;x<934;x+=45){P.tree(g,x,82);P.tree(g,x+12,623);}for(let y=135;y<604;y+=45){P.tree(g,31,y);P.tree(g,934,y);}return true;
  }
  function blocked(x,y){if(r()==='harbor'&&x>438&&x<832&&y>93&&y<259&&!(y>231&&[480,598,716].some(a=>x>a+3&&x<a+23)))return true;if(r()==='crossing'&&x>537&&x<624&&(y<293||y>353))return true;const houses={harbor:[[166,188,94,70],[305,375,72,57]],heights:[[172,120,88,65],[620,119,88,65],[172,365,88,65],[656,365,88,65]],refuge:[[226,217,84,68],[301,103,109,65],[617,125,110,64],[310,376,109,63]],crossing:[[428,104,114,65]]}[r()]||[];return houses.some(([a,b,w,h])=>x>a-3&&x<a+w+3&&y>b+20&&y<b+h+2);}
  function effects(ctx,clock){const P=Art;
    if(r()==='village'&&has('done-ada-gate')){P.rect(ctx,423,257,3,18,'#d9c59a');P.rect(ctx,426,266,21,3,'#bda36b');}
    if(q()>=53&&r()==='village'){if(j().choices.finale===1){ctx.fillStyle='#6c939033';ctx.fillRect(120,200,350,80);for(let i=0;i<14;i++)P.rect(ctx,150+i*21,273+(i%3)*4,10,1,'#a0b8aa');}P.rect(ctx,290,354,34,5,'#b28f65');for(let i=0;i<3;i++)P.rect(ctx,293+i*10,350,7,4,'#dec99b');}
    if(q()>=53&&r()==='orchard'&&j().choices.finale===0){for(let i=0;i<18;i++){const x=310+(i%6)*77,y=157+Math.floor(i/6)*185;P.rect(ctx,x-13,y-4,30,12,'#7c8070');P.rect(ctx,x,y-9,2,10,'#8e7655');}}
    if(r()==='orchard'){
      const channels=[['nursery',407,191,5,254],['mill',410,431,201,5],['grove',607,233,5,203]];for(const [id,x,y,w,h]of channels)if(has('water-'+id)){P.rect(ctx,x,y,w,h,'#659faa');for(let i=0;i<7;i++)P.rect(ctx,x+(w>h?(clock*18+i*25)%w:1),y+(h>w?(clock*18+i*25)%h:1),w>h?5:2,h>w?5:2,'#c0dac2');}
      if(has('water-grove'))for(let i=0;i<18;i++)P.flower(ctx,310+(i%6)*77,157+Math.floor(i/6)*185);
      if(has('fed-ruth')){P.rect(ctx,209,479,30,5,'#b98c59');P.rect(ctx,214,475,8,4,'#e0c186');}
    }
    if(r()==='tower'&&j().step>=16){ctx.save();ctx.translate(438,428);ctx.rotate(s().settings.reduced?0:clock*.8);P.rect(ctx,-19,-2,38,4,'#807e5e');P.rect(ctx,-2,-19,4,38,'#807e5e');ctx.restore();}
    if(r()==='heights'){
      if(has('mechanism-heights')){ctx.strokeStyle='#eee1a58a';ctx.lineWidth=2;for(const o of D.objects.heights.filter(o=>o.id.endsWith('mirror'))){ctx.beginPath();ctx.moveTo(o.x,o.y-15);ctx.lineTo(488,296);ctx.stroke();}}
      for(const id of ['west-bed','east-bed'])if(has('planted-'+id)){const o=D.objects.heights.find(x=>x.id===id);for(let i=0;i<5;i++)P.flower(ctx,o.x-14+i*7,o.y);}
      if(has('guardian-heights'))P.rect(ctx,810,273,10,32,'#d3c098');
    }
    if(r()==='refuge'&&has('mechanism-refuge'))for(const [x,y]of [[380,170],[700,200],[375,453]]){ctx.fillStyle='#edc58a33';ctx.fillRect(x-28,y-38,56,40);}
    if(r()==='crossing'&&q()>=53){ctx.fillStyle=j().choices.finale===0?'#a7bda822':'#769ca933';ctx.fillRect(65,100,831,485);}
    for(const o of D.objects[r()]||[]){if(o.kind==='switch'&&o.id.includes('wheel')||o.id.includes('mirror')||o.id.includes('valve')){ctx.fillStyle='#fff0bf';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText(String(j().choices['dial-'+o.id]||0),o.x,o.y-25);}}
    if(r()==='harbor'&&q()===30){ctx.strokeStyle=t%3<1?'#f2c878':'#b8d8c1';ctx.beginPath();ctx.ellipse(767,452,16,8,0,0,7);ctx.stroke();}
    if(!s().settings.reduced&&r()==='refuge')for(let i=0;i<40;i++)P.rect(ctx,(i*47+t*8)%950,100+(i*29+t*14)%500,1,1,'#f2f4e3');
    if(!s().settings.reduced&&r()==='crossing'&&q()<53)for(let i=0;i<50;i++)P.rect(ctx,(i*37+t*20)%950,100+(i*53+t*140)%500,1,5,'#c1d4cc66');
  }
  function update(dt){t+=dt;if(activity.until<t)activity.kind='';if(t-lastAmbient>12){lastAmbient=t;Sound.ambience?.(r());}}
  function attach(api){A=api;}
  return{attach,begin,interact,target,buildMap,blocked,effects,update,hint,companion,finish,activity:()=>activity,act};
})();
