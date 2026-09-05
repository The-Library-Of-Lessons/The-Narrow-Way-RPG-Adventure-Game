/* Original story and progression data, independent of rendering. */
window.Story = {
  objectives: [
    'Speak to Mara by the village well',
    'Gather three sprigs of yarrow',
    'Bring the yarrow back to Mara',
    'Find the stranger beyond the bridge',
    'Drive the shadows away from the stranger',
    'Help the wounded stranger',
    'Walk with Jonah to the village lantern',
    'Light the village lantern',
    'Willowbrook remembers your kindness'
  ],
  intro: [
    ['Eli', 'A COURIER, NOT YET A HERO', 'Mara said the lantern oil would last until morning. Deliver it, take the west road, be home before dark.'],
    ['Eli', 'A DISTANT CRY', 'Then I heard someone across the river. And suddenly, the road home felt a little less important.']
  ],
  mara: [
    ['Mara', 'KEEPER OF WILLOWBROOK', 'Eli. You heard him too? A traveler fell beyond the old bridge. I cannot leave the children, and he cannot make it back alone.'],
    ['Eli', 'LANTERN COURIER', 'I only brought oil. I am not a healer.'],
    ['Mara', 'KEEPER OF WILLOWBROOK', 'You do not have to be everything. Find three white yarrow sprigs in the village garden. I will make a bandage. We can each do our part.']
  ],
  medicine: [
    ['Mara', 'KEEPER OF WILLOWBROOK', 'Good. A clean bandage, a little yarrow, and someone willing to stay. Take these.'],
    ['Mara', 'KEEPER OF WILLOWBROOK', 'The bridge is narrow, but the boards still hold. Shadows gather where people are afraid. Use your staff to drive them back; step aside when their eyes flash.'],
    ['Eli', 'LANTERN COURIER', 'And if I am afraid?'],
    ['Mara', 'KEEPER OF WILLOWBROOK', 'Then you will be in good company. Courage rarely travels alone.']
  ],
  jonah: [
    ['Jonah', 'A STRANGER BY THE ROAD', 'You should go. I am the one who took the lantern oil last winter. Your village owes me nothing.'],
    ['Eli', 'LANTERN COURIER', 'You are right. It does not. Hold still; this might sting.'],
    ['Jonah', 'A STRANGER BY THE ROAD', 'Why would you help me?']
  ],
  answers: [
    {label: 'Because you are here, and you need help.', reply: 'Jonah looks away. For a moment, the river is the only thing speaking.'},
    {label: 'Someone once stopped for me, too.', reply: '“Then perhaps,” Jonah says, “the kindness does not have to end with us.”'}
  ],
  home: [
    ['Jonah', 'A TRAVELER BROUGHT HOME', 'I thought she would turn me away.'],
    ['Mara', 'KEEPER OF WILLOWBROOK', 'We will speak of last winter. First, you need a meal. Both things can be true.'],
    ['Eli', 'LANTERN COURIER', 'The oil is still here. Shall we light it?'],
    ['Jonah', 'A TRAVELER BROUGHT HOME', 'Let me help. I remember how dark this road can get.']
  ],
  signs: [
    ['Willowbrook', 'WAYFARER’S SIGN', 'WEST · The village garden\nEAST · Old bridge & the pilgrim road\nA bell means there is room at the table.'],
    ['A small inscription', 'THE ROADSIDE BENCH', '“Let us not love in word, neither in tongue; but in deed and in truth.”\n1 John 3:18 · KJV']
  ]
};
