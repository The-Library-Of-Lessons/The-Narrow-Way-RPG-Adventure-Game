/* Additional authored content. Finale narrative is deliberately kept out of the public plan. */
(() => {
  const D=CampaignData;
  D.order.push('harbor','heights','refuge','crossing');
  Object.assign(D.regions,{
    harbor:{name:'Haven of Many Names',chapter:'VI',theme:'A harbor is made by those who welcome.',unlock:25,color:'#769da1'},
    heights:{name:'The Divided Heights',chapter:'VII',theme:'The same rain falls on both roofs.',unlock:32,color:'#b4a07d'},
    refuge:{name:'Hearthwinter Refuge',chapter:'VIII',theme:'Warmth travels from one hand to another.',unlock:39,color:'#b8cbce'},
    crossing:{name:'The Last Crossing',chapter:'IX',theme:'You do not have to face this alone.',unlock:47,color:'#718c93'}
  });
  D.objectives[3]='Read the water channels and restore the orchard';D.objectives[9]='Study the flood evidence and release the sluices safely';D.objectives[11]='Find a safe pattern for the ferry lights';D.objectives[16]='Listen to the watch and quiet its warning bells';D.objectives[21]='Discover the pattern hidden in the sanctuary lamps';
  D.objectives[24]='Speak with Mara about the harbor road';
  D.objectives.push(
    'Travel to the harbor beyond the sanctuary; meet Iona',
    'Study the tide board, passenger register, and cargo manifest',
    'Plan the first crossing with Iona',
    'Align the three tide wheels using the harbor evidence',
    'Carry the boarding plan to three waiting groups',
    'Guide the harbor lights while the signal is clear',
    'Share a quiet moment with Jonah at the harbor bench',
    'Travel to the Divided Heights; meet Reuben',
    'Hear the builder, teacher, and water carrier',
    'Turn the courtyard mirrors toward the shared basin',
    'Help the council choose where to begin rebuilding',
    'Bring the agreement to both neighborhoods and the workshop',
    'Help both sides restore their shared courtyard',
    'Open the meeting gate together with Jonah',
    'Enter Hearthwinter Refuge and speak with Esther',
    'Visit the infirmary, kitchen, and crowded sleeping hall',
    'Balance the hearth valves so every room receives warmth',
    'Make a shelter plan with Esther',
    'Bring appropriate supplies to all three rooms',
    'Follow the trail markers to the missing shepherd',
    'Ring the refuge bells in the pattern of its old song',
    'Read the letters with Jonah before taking the last road',
    'Reach the Last Crossing and meet the gathered neighbors',
    'Listen to the crews at the three assembly points',
    'Inspect the water gauge, old survey, and warning beacon',
    'Secure the three evacuation stations',
    'Return to Mara when you are ready to deliberate',
    'Walk the chosen road with Jonah',
    'Meet the neighbors at the shelter',
    'Sit beside the lantern and hear what remains',
    'Revisit the nine roads and the people who remember'
  );
  D.objects.sanctuary.push({id:'east',kind:'exit',x:877,y:320,label:'Haven of Many Names',to:'harbor'});
  const exit=(id,to,x=88)=>({id,kind:'exit',x,y:320,label:D.regions[to].name,to});
  const npc=(id,label,x,y,skin,role)=>({id,kind:'npc',label,x,y,skin,role:role||'A NEIGHBOR ON THE ROAD'});
  const prop=(id,kind,label,x,y,text)=>({id,kind,label,x,y,text});
  D.objects.harbor=[exit('west','sanctuary'),exit('east','heights',877),prop('camp','camp','Harbor rest lantern',162,338),
    npc('iona','Iona',270,298,'iona','HARBORMASTER'),
    prop('tide-board','sign','Tide observations',321,179,'The nursery ferry rides best at the lowest mark. The grain barge needs one mark more. The deep rescue boat needs one mark more again. Each wheel shows zero, one, or two notches.'),
    prop('passenger-list','sign','Passenger register',424,434,'The east shelter is ready for children and their carers. The west harbor can keep the grain dry for one tide. Everyone is counted; nobody is cargo.'),
    prop('manifest','sign','Cargo manifest',614,278,'There is enough room over two crossings. The first voyage can bring families to shelter, or bring grain to the kitchen preparing their meals. Both crews need a clear plan.'),
    prop('ferry-wheel','switch','Ferry draft wheel',499,305),prop('barge-wheel','switch','Barge draft wheel',614,315),prop('rescue-wheel','switch','Rescue draft wheel',732,305),
    npc('families','Waiting families',345,480,'ruth'),npc('porters','Grain porters',593,459,'boaz'),npc('carers','Shelter carers',818,278,'tamar'),
    prop('signal','beacon','Harbor signal',767,452),prop('bench','sign','The harbor bench',213,473),
    prop('clue','sign','Signal keeper’s note',696,414,'When the tide signal dims, light the next route marker. A bright ring means wait; a quiet ring means the way is clear. Three clear signals guide both crossings.'),
    prop('secret-harbor','secret','A ticket kept for a stranger',130,184,'Iona keeps one berth unassigned until the last moment. “Someone always arrives believing there is no place left.”'),
    prop('secret-harbor2','secret','Names on the quay',835,535,'The stone lists names instead of numbers. Someone took the time to ask each person how their name should be spelled.')];
  D.objects.heights=[exit('west','harbor'),exit('east','refuge',877),prop('camp','camp','Courtyard rest lantern',164,340),
    npc('reuben','Reuben',281,318,'reuben','COUNCIL KEEPER'),npc('builder','The builder',250,175,'boaz'),npc('teacher','The teacher',711,185,'tamar'),npc('water-carrier','The water carrier',383,482,'neri'),
    prop('west-mirror','switch','Western courtyard mirror',365,230),prop('center-mirror','switch','Basin mirror',509,377),prop('east-mirror','switch','Eastern courtyard mirror',664,246),
    prop('clue','sign','The old courtyard drawing',468,296,'The western mirror faces EAST. The basin mirror faces NORTH. The eastern mirror faces WEST. Their notches turn north, east, south, west. All three must face the shared basin, not their own homes.'),
    npc('west-house','Western neighbors',268,436,'ruth'),npc('east-house','Eastern neighbors',717,439,'sela'),npc('workshop','Workshop keeper',529,178,'oren'),
    prop('west-bed','basket','Western planting bed',375,410),prop('east-bed','basket','Eastern planting bed',633,410),prop('meeting-gate','switch','Meeting gate',809,323),
    prop('secret-heights','secret','A wall with two handwriting styles',129,509,'One family wrote “ours.” Another added “together.” The stone beneath both words is older than the quarrel.'),prop('secret-heights2','secret','The school slate',821,168,'The child’s map includes a path through the wall adults had called permanent.')];
  D.objects.refuge=[exit('west','heights'),exit('east','crossing',877),prop('camp','camp','Refuge rest hearth',164,340),
    npc('esther','Esther',279,309,'esther','KEEPER OF THE WINTER HOUSE'),npc('infirmary','Infirmary keeper',343,176,'mara'),npc('kitchen','Kitchen keeper',688,202,'boaz'),npc('hall','Sleeping hall steward',378,457,'reuben'),
    prop('north-valve','switch','Infirmary heat valve',452,195),prop('east-valve','switch','Kitchen heat valve',659,318),prop('south-valve','switch','Sleeping hall heat valve',473,447),
    prop('clue','sign','The heating diagram',563,322,'Four measures of warmth. The infirmary needs twice as much as either other room. The kitchen and hall need equal shares. A valve cycles through zero, one, and two measures.'),
    prop('medicine','basket','Clean linen and balm',239,472),prop('bread','basket','Grain and cooking oil',760,433),prop('blankets','basket','Dry blankets',214,185),
    prop('trail-a','sign','A shepherd’s red thread',583,468,'A red thread catches on the fence. A second marker glints north of the old pine.'),prop('trail-b','sign','A staff mark in the snow',736,357,'The mark bends toward the sheltered eastern bank. The shepherd was looking for shelter, not climbing higher.'),npc('shepherd','The missing shepherd',825,223,'jonah'),
    prop('winter-low','bell','Hearth bell',703,501),prop('winter-high','bell','Window bell',814,482),prop('letters','sign','Letters by the fire',326,358),
    prop('song','sign','The winter song',644,410,'Home calls twice in a low voice. The window answers once, high and clear. No speed is required. Sound all three notes to guide the shepherd’s flock.'),
    prop('secret-refuge','secret','A coat with many patches',122,514,'Each patch is a different color. Its owner remembers every person who helped keep the coat warm.'),prop('secret-refuge2','secret','A prayer on the doorpost',811,156,'“Teach me to love You with more than my words, and my neighbor with more than my spare time.” A fictional prayer, written by a traveler.')];
  D.objects.crossing=[exit('west','refuge'),prop('camp','camp','Assembly rest lantern',165,340),
    npc('mara-final','Mara',280,314,'mara','KEEPER OF THE GATHERED PEOPLE'),npc('food-crew','Food and shelter crew',333,183,'tamar'),npc('bridge-crew','Bridge crew',494,434,'sela'),npc('ferry-crew','Ferry crew',696,192,'iona'),
    prop('gauge','sign','Flood gauge',531,220),prop('survey','sign','The old water survey',735,371),prop('warning','beacon','Warning beacon',367,461),
    prop('station-a','switch','Western evacuation station',399,295),prop('station-b','switch','Central evacuation station',613,313),prop('station-c','switch','Eastern evacuation station',803,298),
    prop('memorial','sign','A box of things carried from home',203,466),prop('control','switch','The crossing controls',779,458),npc('shelter','The gathered neighbors',497,180,'esther'),prop('last-lantern','camp','A place beside the lantern',657,467),
    prop('secret-crossing','secret','A name sewn into a blanket',126,181,'Someone made sure a frightened child would not become an unnamed face in the crowd.'),prop('secret-crossing2','secret','A tiny wooden bird',838,526,'The repaired bird from the watchtower has traveled farther than its maker expected.')];
  D.lessons.commandments={title:'With all your heart',ref:'Matthew 22:37–40',url:'https://biblehub.com/kjv/matthew/22.htm',quote:'Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. This is the first and great commandment. And the second is like unto it, Thou shalt love thy neighbour as thyself. On these two commandments hang all the law and the prophets.',context:'Jesus answers a question about the greatest commandment. Read Matthew 22:34–40. The game’s crises are fictional applications; no branch is presented as a new divine command.',reflection:'The journey asks for a whole-hearted love of God expressed in truthful, practical care for neighbors. It does not promise that care will remove every cost.',question:'What can guide a difficult choice when you cannot preserve every good thing?',answers:['Prayer, truthful understanding, and care for the people affected','A promise that the right choice never costs anything'],feedback:['Seek wisdom and appropriate counsel. A costly situation does not mean someone has failed to love.','Love does not make every loss avoidable. The story invites faithfulness rather than certainty that nothing will hurt.']};
  // Optional community stories: a request, a meaningful visit, and a return conversation.
  D.community=[
    ['village','ada-gate','Ada’s gate',398,263,273,437,'Ada asks whether the old gate could open wide enough for a traveler’s cart.','At the bench you find a spare hinge and the marks of an older, wider gate.','Jonah fits the hinge. Ada opens the gate with both hands. “Now nobody has to leave their things outside.”'],
    ['orchard','seed-library','Seeds for next spring',214,247,814,540,'Tamar wants to keep a seed library for families who lost their plots.','The old basket contains labeled seed packets rather than a private hoard.','Tamar writes the names of the families who will plant them. “A gift can also be a beginning.”'],
    ['marsh','lost-name','A name remembered',256,367,812,154,'Neri knows a grave without a name. A traveler’s notebook may tell who is buried there.','A pressed reed marks a page: “Leah, who carried water to the strangers.”','A name is placed beside the lamp. The road has one fewer forgotten person.'],
    ['tower','toy-bird','The little wooden bird',304,352,824,541,'Sela asks you to find the toy a child left during the evacuation.','A mended wooden bird lies beneath a stone, protected from the rain.','Sela wraps the bird for the child. Jonah says, “I used to think only large repairs counted.”'],
    ['sanctuary','towel','An ordinary task',311,350,180,181,'Anna asks whether you can prepare the basin before the next travelers arrive.','You carry clean water and set out a fresh towel. Nobody is watching.','Anna thanks you by name. The next traveler sits down and exhales.'],
    ['harbor','pronunciation','Every name spoken',295,361,837,529,'Iona wants the passenger list to use the names people actually call themselves.','You listen as the waiting families pronounce their names, then mark the register carefully.','Iona reads the names slowly during boarding. People turn when they hear themselves welcomed.'],
    ['harbor','fishing-net','A net for tomorrow',190,419,594,460,'A fisher has lent the only spare net to the shelter kitchen.','The porters have cord left over and offer it for repairs.','The repaired net will feed both the fisher’s family and the shelter.'],
    ['heights','shared-story','The story on the wall',218,359,821,168,'A teacher asks what children think the new courtyard should become.','The slate shows a garden, a workshop, and a door wide enough for both.','The council hangs the drawing where everyone can see it. Their next conversation begins differently.'],
    ['heights','water-jar','The shared water jar',581,461,383,482,'A neighbor asks whether the common jar can be moved where older people can reach it.','The water carrier tests the path and finds a level place with room to rest.','Two neighbors carry the jar together. Neither calls it a victory over the other.'],
    ['refuge','warm-coat','A patched coat',265,371,122,514,'Esther asks you to find a coat for a traveler who keeps insisting someone else needs it more.','The coat has many repairs but every seam is sound.','The traveler accepts it. Esther says, “Receiving care can be difficult too.”'],
    ['refuge','home-letter','A letter carried safely',486,509,326,358,'A shepherd cannot write easily with cold hands. Will you carry a message to the fire?','The message says only: “I am safe. I am coming home.”','The reply is waiting: “There will be a place for you.”'],
    ['crossing','blanket-name','Room for a child',248,391,126,181,'A volunteer needs help matching a child’s blanket with the family register.','A stitched name and a familiar song bring the family together.','The child falls asleep before the volunteer finishes saying thank you.']
  ];
  for(const [region,id,label,x,y,tx,ty,request,find,returnText]of D.community){D.objects[region].push(prop('deed-'+id,'deed',label,x,y,request),prop('task-'+id,'task',label+' · follow-up',tx,ty,find));}
  D.objects.village.find(o=>o.id==='deed-ada-gate').x=425; // Separate the request from Ada's original interaction.
  for(const list of Object.values(D.objects))for(const o of list)if(['tamar','boaz','ruth','neri','oren','sela'].includes(o.id))o.skin=o.id;
  const neighbors=['child','tamar','neri','sela','esther','iona','boaz','tamar','reuben','ruth','oren','esther'];
  D.community.forEach((d,i)=>{D.objects[d[0]].find(o=>o.id==='deed-'+d[1]).skin=neighbors[i];});
})();
