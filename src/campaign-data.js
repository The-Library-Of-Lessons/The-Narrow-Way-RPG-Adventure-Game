/* Roads of Mercy: original fiction; quoted Scripture is explicitly identified. */
window.CampaignData = {
  order:['village','orchard','marsh','tower','sanctuary'],
  regions:{
    village:{name:'Willowbrook',chapter:'I',theme:'A small light is still a light.',unlock:0,color:'#86ad67'},
    orchard:{name:'The Openhand Orchard',chapter:'II',theme:'Enough becomes abundance when it is shared.',unlock:1,color:'#a8ae66'},
    marsh:{name:'Stillwater Marsh',chapter:'III',theme:'Listen beneath the noise.',unlock:7,color:'#659391'},
    tower:{name:'The Broken Watch',chapter:'IV',theme:'A promise needs hands and feet.',unlock:12,color:'#9295a0'},
    sanctuary:{name:'The Hill of Many Lamps',chapter:'V',theme:'Let the light reach beyond your friends.',unlock:18,color:'#a6b5ac'}
  },
  objectives:[
    'Speak with Mara about the road beyond Willowbrook',
    'Travel east to the orchard; meet Tamar',
    'Hear Boaz’s side before judging the orchard dispute',
    'Water the nursery, the mill, then the old grove',
    'Gather three ripe baskets from the restored trees',
    'Share the harvest with Ruth and the roadside travelers',
    'Meet the Rootkeeper in the eastern orchard',
    'Enter Stillwater Marsh and speak with Neri',
    'Listen to both witnesses: Dena and Oren',
    'Open the hill, reed, and river sluices in that order',
    'Reach the stranded boat and help its passenger',
    'Guide the Mistkeeper: light shore, channel, then home',
    'Travel to the Broken Watch; meet Captain Sela',
    'Find the old ledger and inspect the broken wheel',
    'Speak with Sela about what Jonah discovered',
    'Recover three repair bundles around the watchtower',
    'Quiet the Bellwarden: sound low, middle, then high',
    'Return to Sela and finish Jonah’s restitution',
    'Climb to the sanctuary and speak with Anna',
    'Listen to both the waiting pilgrim and the injured rival',
    'Return to Anna and decide whom to help first',
    'Light the lamps: receive, listen, serve, forgive',
    'Meet the Crownless Keeper and answer the final trial',
    'Return to Mara in Willowbrook with Jonah',
    'Explore the restored roads and revisit your journal'
  ],
  lessons:{
    mercy:{title:'Become a neighbor',ref:'Luke 10:37',url:'https://biblehub.com/kjv/luke/10-37.htm',quote:'And he said, He that shewed mercy on him. Then said Jesus unto him, Go, and do thou likewise.',context:'Jesus ends the Good Samaritan parable by turning the question toward the person who showed mercy. Read Luke 10:25–37 for the whole conversation.',reflection:'Eli stopped for a stranger. In this fictional journey, the first lesson of love was an interruption he chose to accept.',question:'Who might you overlook because helping would interrupt your plans?',answers:['Someone whose need is inconvenient','Only people who can repay me'],feedback:['Notice a real person and a practical, appropriate way to help.','The Samaritan’s care was not an exchange for repayment. Read the story again and consider who needed help.']},
    neighbor:{title:'Make room at the table',ref:'Mark 12:31',url:'https://biblehub.com/kjv/mark/12-31.htm',quote:'And the second is like, namely this, Thou shalt love thy neighbour as thyself. There is none other commandment greater than these.',context:'In Mark 12:28–34, Jesus joins love for God with love for neighbor. The orchard is an invented application, not a biblical event.',reflection:'Water and food reached people outside Eli’s own circle. Fairness began by learning who depended on the orchard.',question:'What should you consider before dividing a shared resource?',answers:['People’s needs, including those not present','Who praises me most'],feedback:['Listening to those affected helps turn good intentions into useful care.','Praise is a poor guide to need. Think about the people who have little influence.']},
    listening:{title:'Be swift to hear',ref:'James 1:19',url:'https://biblehub.com/kjv/james/1-19.htm',quote:'Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to wrath:',context:'This is an instruction in the letter of James, not a direct quotation spoken by Jesus. Read James 1:19–27 alongside the marsh story.',reflection:'Two witnesses saw different parts of the flood. Listening to both changed the action Eli could take.',question:'What can you do when an angry account seems convincing?',answers:['Listen carefully and seek relevant facts','Repeat it before asking anyone else'],feedback:['Patience can protect both truth and the people involved.','Repeating an untested account may spread harm. You can pause and ask.']},
    restitution:{title:'Let change become action',ref:'Luke 19:8',url:'https://biblehub.com/kjv/luke/19-8.htm',quote:'And Zacchaeus stood, and said unto the Lord; Behold, Lord, the half of my goods I give to the poor; and if I have taken any thing from any man by false accusation, I restore him fourfold.',context:'Zacchaeus speaks these words during his encounter with Jesus. They are not a command by Jesus setting a universal repayment formula. Read Luke 19:1–10.',reflection:'Jonah named what he had done and helped repair the watch. Sela offered a path forward without pretending trust was already restored.',question:'What can a sincere apology include?',answers:['Naming the harm and taking appropriate steps to repair it','Demanding immediate trust'],feedback:['Repair and patient accountability can give an apology substance.','Trust is not something another person owes on demand. Change can be shown over time.']},
    enemies:{title:'Love beyond your circle',ref:'Matthew 5:44',url:'https://biblehub.com/kjv/matthew/5-44.htm',quote:'But I say unto you, Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute you;',context:'Jesus teaches love for enemies in the Sermon on the Mount. Read Matthew 5:43–48. This game’s supervised aid scene is one fictional application.',reflection:'Eli gave practical help to an injured rival. Anna stayed nearby. Kindness did not require ignoring harm or surrendering wise boundaries.',question:'Can you refuse revenge while keeping appropriate boundaries?',answers:['Yes: seek the good without enabling further harm','No: love means pretending nothing happened'],feedback:['The scene invites truthful kindness and safe, appropriate help.','Pretending can leave harm unaddressed. The story keeps truth, care, and accountability together.']},
    love:{title:'As I have loved you',ref:'John 13:34',url:'https://biblehub.com/kjv/john/13-34.htm',quote:'A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.',context:'Jesus gives this command to his disciples. Read John 13, including his washing of their feet, for the setting.',reflection:'The roads lead home, where love must continue in ordinary service. The journal is an invitation to read and practice, not proof of spiritual maturity.',question:'Where can learning become action after this journey?',answers:['In a small, concrete act of love today','Only in dramatic heroic moments'],feedback:['Ordinary faithfulness matters. Choose something specific and appropriate to your situation.','Much of love is practiced in ordinary moments, long after an adventure ends.']}
  },
  tools:{lantern:['Pilgrim lantern','Reveals hidden inscriptions when you approach. Revisit earlier roads.'],rope:['Rescue rope','Opens the return shortcuts between visited regions.'],lens:['Clear glass lens','Reveals the sanctuary’s lamp markings and deeper secrets.']},
  objects:{
    village:[{id:'east',kind:'exit',x:880,y:320,label:'Openhand Orchard',to:'orchard'},{id:'secret-village',kind:'secret',x:95,y:520,label:'A letter beneath the ivy',text:'Mara kept a list of travelers who never learned her name. Beside each: a meal, a bed, a place by the fire.'}],
    orchard:[
      {id:'west',kind:'exit',x:88,y:320,label:'Willowbrook',to:'village'}, {id:'east',kind:'exit',x:877,y:320,label:'Stillwater Marsh',to:'marsh'},
      {id:'camp',kind:'camp',x:165,y:345,label:'Orchard rest lantern'},
      {id:'tamar',kind:'npc',x:270,y:278,label:'Tamar',role:'ORCHARD STEWARD',skin:'mara'},
      {id:'boaz',kind:'npc',x:340,y:459,label:'Boaz',role:'KEEPER OF THE MILL',skin:'jonah'},
      {id:'nursery',kind:'switch',x:410,y:190,label:'Nursery gate'}, {id:'mill',kind:'switch',x:460,y:435,label:'Mill gate'}, {id:'grove',kind:'switch',x:610,y:235,label:'Old grove gate'},
      {id:'fruit-a',kind:'basket',x:330,y:187,label:'Ripe harvest'}, {id:'fruit-b',kind:'basket',x:554,y:475,label:'Ripe harvest'}, {id:'fruit-c',kind:'basket',x:704,y:217,label:'Ripe harvest'},
      {id:'ruth',kind:'npc',x:230,y:470,label:'Ruth',role:'A NEIGHBOR WITH EMPTY CUPBOARDS',skin:'mara'}, {id:'travelers',kind:'npc',x:661,y:365,label:'The travelers',role:'FAR FROM HOME',skin:'child'},
      {id:'guardian',kind:'guardian',x:780,y:454,label:'The Rootkeeper'},
      {id:'clue',kind:'sign',x:365,y:320,label:'Water steward’s instructions',text:'First the young roots that cannot wait. Then the mill that feeds the households. Last the old trees with their deep roots. Every gate matters.'},
      {id:'secret-orchard',kind:'secret',x:122,y:170,label:'A seed packet in the stone wall',text:'“For whoever plants after me.” The gardener left no name. Love can work for a harvest it will never see.'},
      {id:'secret-orchard2',kind:'secret',x:814,y:540,label:'The empty basket',text:'The oldest basket bears many repairs. Beside it: “Return it when you can. Keep it if you must.”'}
    ],
    marsh:[
      {id:'west',kind:'exit',x:88,y:320,label:'Openhand Orchard',to:'orchard'}, {id:'east',kind:'exit',x:877,y:320,label:'The Broken Watch',to:'tower'}, {id:'camp',kind:'camp',x:165,y:345,label:'Reedbank rest lantern'},
      {id:'neri',kind:'npc',x:261,y:300,label:'Neri',role:'FERRY KEEPER',skin:'jonah'}, {id:'dena',kind:'npc',x:302,y:184,label:'Dena',role:'A WITNESS ON THE HILL',skin:'mara'}, {id:'oren',kind:'npc',x:370,y:469,label:'Oren',role:'A WITNESS AMONG THE REEDS',skin:'child'},
      {id:'hill',kind:'switch',x:440,y:187,label:'Hill sluice'}, {id:'reed',kind:'switch',x:478,y:463,label:'Reed sluice'}, {id:'river',kind:'switch',x:601,y:315,label:'River sluice'},
      {id:'boat',kind:'npc',x:710,y:209,label:'The stranded passenger',role:'WAITING ON THE WATER',skin:'mara'},
      {id:'guardian',kind:'guardian',x:777,y:455,label:'The Mistkeeper'},
      {id:'shore',kind:'beacon',x:663,y:390,label:'Shore beacon'}, {id:'channel',kind:'beacon',x:729,y:501,label:'Channel beacon'}, {id:'home',kind:'beacon',x:824,y:393,label:'Home beacon'},
      {id:'clue',kind:'sign',x:576,y:422,label:'The ferry song',text:'A lost traveler finds the SHORE, follows the CHANNEL, and reaches HOME. Light the way in the order a traveler needs it.'},
      {id:'secret-marsh',kind:'secret',x:180,y:510,label:'A reed-wrapped notebook',text:'One page says “He broke the gate.” The next says “I had not yet heard his story.” Someone crossed out the first sentence, but kept the page.'},
      {id:'secret-marsh2',kind:'secret',x:812,y:154,label:'A lamp on a nameless grave',text:'Fresh oil. No footprints left in the rain. Someone remembers a person the road has forgotten.'}
    ],
    tower:[
      {id:'west',kind:'exit',x:88,y:320,label:'Stillwater Marsh',to:'marsh'}, {id:'east',kind:'exit',x:877,y:320,label:'Hill of Many Lamps',to:'sanctuary'}, {id:'camp',kind:'camp',x:163,y:345,label:'Watchtower rest lantern'},
      {id:'sela',kind:'npc',x:277,y:298,label:'Captain Sela',role:'KEEPER OF THE BROKEN WATCH',skin:'mara'},
      {id:'ledger',kind:'sign',x:350,y:179,label:'The winter ledger',text:'The oil store was empty on the night of the storm. The warning light failed. The bridge crew could not see the broken wheel.'},
      {id:'wheel',kind:'switch',x:441,y:456,label:'The broken warning wheel'},
      {id:'repair-a',kind:'basket',x:225,y:493,label:'Sound timber'}, {id:'repair-b',kind:'basket',x:548,y:191,label:'Iron fittings'}, {id:'repair-c',kind:'basket',x:652,y:449,label:'A coil of good cord'},
      {id:'guardian',kind:'guardian',x:780,y:460,label:'The Bellwarden'},
      {id:'low',kind:'bell',x:681,y:390,label:'Low bell'}, {id:'middle',kind:'bell',x:744,y:500,label:'Middle bell'}, {id:'high',kind:'bell',x:833,y:390,label:'High bell'},
      {id:'clue',kind:'sign',x:595,y:320,label:'The watchkeeper’s vow',text:'Listen from the earth toward the sky: LOW, MIDDLE, HIGH. Wait for the warning ring to fade before sounding a bell.'},
      {id:'secret-tower',kind:'secret',x:128,y:166,label:'An unfinished apology',text:'“I am sorry you were upset” has been crossed out. Under it: “I took what was yours. Here is what I will do to repair the harm.”'},
      {id:'secret-tower2',kind:'secret',x:824,y:541,label:'A child’s repaired toy',text:'A tiny wooden bird, mended with watchtower wire. Repair can matter even when nobody writes it in a ledger.'}
    ],
    sanctuary:[
      {id:'west',kind:'exit',x:88,y:320,label:'The Broken Watch',to:'tower'}, {id:'camp',kind:'camp',x:163,y:345,label:'Sanctuary rest lantern'},
      {id:'anna',kind:'npc',x:282,y:301,label:'Anna',role:'KEEPER OF THE OPEN TABLE',skin:'mara'},
      {id:'pilgrim',kind:'npc',x:341,y:187,label:'The waiting pilgrim',role:'A FRIEND OF WILLOWBROOK',skin:'child'}, {id:'rival',kind:'npc',x:399,y:468,label:'The injured rival',role:'SOMEONE JONAH FEARS',skin:'jonah'},
      {id:'receive',kind:'beacon',x:517,y:194,label:'Receive'}, {id:'listen',kind:'beacon',x:624,y:278,label:'Listen'}, {id:'serve',kind:'beacon',x:539,y:462,label:'Serve'}, {id:'forgive',kind:'beacon',x:710,y:440,label:'Forgive'},
      {id:'guardian',kind:'guardian',x:791,y:225,label:'The Crownless Keeper'},
      {id:'clue',kind:'sign',x:443,y:320,label:'The pilgrim’s pattern',text:'RECEIVE a love you did not earn. LISTEN to the person before you. SERVE the need you now understand. FORGIVE rather than feeding revenge.'},
      {id:'secret-sanctuary',kind:'secret',x:180,y:181,label:'The basin and towel',text:'No crown rests on this table. Only a basin and a towel. Read John 13:1–17: Jesus washes his disciples’ feet.'},
      {id:'secret-sanctuary2',kind:'secret',x:830,y:518,label:'A lamp without a name',text:'Its inscription faces away from the road. “Let the light be seen. The keeper need not be.”'}
    ]
  }
};
