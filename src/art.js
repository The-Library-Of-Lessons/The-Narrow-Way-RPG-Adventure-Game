/* Original pixel artwork. Integer coordinates, a shared palette, no external assets. */
window.Art = (() => {
  const P={ink:'#263d36',grass:'#7caa60',grass2:'#87b46a',dark:'#456d49',leaf:'#47754d',leaf2:'#629351',leaf3:'#83aa5e',light:'#aac77c',bark:'#795d43',sand:'#ccbb87',water:'#608f9b',cream:'#f2dfac'};
  const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const hash=(x,y)=>{let n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,Math.PI*2);c.fill();}
  function tree(c,x,y,variant=0){
    ellipse(c,x+5,y+3,20,7,'#36553845');
    rect(c,x-4,y-23,8,26,P.bark);rect(c,x+1,y-22,3,23,'#554937');rect(c,x-7,y-2,14,4,'#6b573c');
    const layers=[[-17,-48,33,25],[-23,-38,45,24],[-17,-23,35,12]];
    for(const [dx,dy,w,h]of layers){rect(c,x+dx,y+dy,w,h,P.ink);rect(c,x+dx+2,y+dy-2,w-4,h,P.leaf);}
    rect(c,x-12,y-51,23,7,P.leaf2);rect(c,x-19,y-42,29,10,P.leaf2);rect(c,x-20,y-33,21,10,P.leaf2);rect(c,x-9,y-45,22,16,P.leaf2);rect(c,x-9,y-47,14,6,P.leaf3);rect(c,x-16,y-38,9,5,P.leaf3);rect(c,x+3,y-35,9,5,P.leaf3);rect(c,x-10,y-27,11,5,P.leaf3);rect(c,x+12,y-30,6,8,'#3a6546');rect(c,x-13,y-19,21,4,'#365d42');
    for(let i=0;i<7;i++){const a=hash(x+i,y);rect(c,x-14+Math.floor(a*28),y-43+Math.floor(hash(y,i)*22),3,2,i%2?P.leaf3:P.light);}
    if(variant===1){rect(c,x-9,y-33,3,3,'#d69b63');rect(c,x+9,y-39,3,3,'#d69b63');}
  }
  function house(c,x,y,w=90,h=68,blue=false){
    ellipse(c,x+w/2+5,y+h,w/2+8,8,'#36553844');
    rect(c,x,y+20,w,h-20,'#5e5945');rect(c,x+3,y+22,w-6,h-23,'#decba0');rect(c,x+8,y+24,w-16,h-27,'#eadbb3');
    for(let i=0;i<3;i++){rect(c,x+4,y+32+i*12,w-8,1,'#c8b78d');}
    rect(c,x+5,y+23,4,h-25,'#8d7450');rect(c,x+w-9,y+23,4,h-25,'#8d7450');
    const roof=blue?'#647f85':'#ab694e',roofLight=blue?'#81999a':'#c3865e';
    for(let i=0;i<7;i++){rect(c,x-8+i*2,y+18-i*4,w+16-i*4,5,roof);rect(c,x-8+i*2,y+18-i*4,w+16-i*4,1,roofLight);for(let j=0;j<w/12;j++)rect(c,x+j*12+(i%2)*6,y+16-i*4,1,3,blue?'#526d75':'#925942');}
    rect(c,x-7,y+22,w+14,4,'#504f3d');rect(c,x+13,y-15,9,17,'#b7ac8c');rect(c,x+12,y-17,11,3,'#d6c7a6');
    rect(c,x+w/2-10,y+h-30,20,30,'#786648');rect(c,x+w/2-7,y+h-27,14,27,'#4e5141');rect(c,x+w/2+3,y+h-15,2,2,'#e2c986');rect(c,x+w/2-14,y+h,28,4,'#b6a982');
    for(const a of [x+14,x+w-30]){rect(c,a,y+34,17,17,'#867650');rect(c,a+2,y+36,13,12,'#7e9e99');rect(c,a+3,y+37,5,5,'#c1d4be');rect(c,a+8,y+36,1,12,'#d7c297');rect(c,a,y+51,18,4,'#9c7750');rect(c,a+1,y+50,16,2,'#5b864e');rect(c,a+4,y+48,3,3,'#ddb18b');rect(c,a+11,y+49,3,2,'#e4d19c');}
  }
  function person(c,x,y,kind='eli',dir='down',time=0,moving=false,action='',scale=1){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    // Animate the limbs while keeping the head and torso at a stable height.
    const step=moving?[0,1,0,-1][Math.floor(time*8)%4]:0;
    ellipse(c,0,1,7,3,'#263f3644');
    const palettes={iona:['#4d7897','#b78361','#423e3b'],tamar:['#bd795e','#cf9b72','#584734'],ruth:['#987797','#b7805b','#493b35'],boaz:['#a58c57','#cb9972','#766b55'],reuben:['#71856b','#c29677','#c8c4b1'],neri:['#628f9c','#a87653','#493f35'],sela:['#92786c','#c8956d','#514136'],esther:['#97647b','#ad7956','#d0c5a9'],oren:['#8e9a65','#cda582','#6c4c37']};
    const pal=palettes[kind],coat=pal?pal[0]:kind==='mara'?'#bd866a':kind==='jonah'?'#869c9c':kind==='child'?'#d6b668':'#567f77';
    const trim=kind==='eli'?'#e7cc87':'#d9c79e',skin=pal?pal[1]:'#e1b486',hair=pal?pal[2]:kind==='mara'?'#b7b19a':kind==='jonah'?'#655547':'#614b3d';
    const left=dir==='left',side=left||dir==='right';if(left)c.scale(-1,1);
    rect(c,-5, -5,4,5+Math.round(step*1.5),P.ink);rect(c,1,-5,4,5-Math.round(step*1.5),P.ink);
    rect(c,-5,-12,10,9,P.ink);rect(c,-4,-12,8,7,coat);rect(c,-3,-10,3,4,kind==='eli'?'#739b8a':coat);rect(c,-5,-5,10,2,'#a28f62');
    rect(c,-7,-12,3,7,coat);rect(c,4,-12,3,7,coat);rect(c,-7,-6+Math.round(step),3,3,skin);rect(c,4,-6-Math.round(step),3,3,skin);
    rect(c,-5,-21,10,9,P.ink);rect(c,-4,-21,8,9,skin);rect(c,-5,-23,10,5,hair);rect(c,-6,-21,3,6,hair);rect(c,3,-21,3,4,hair);rect(c,-3,-24,6,2,hair);rect(c,-4,-22,4,2,'#89704d');
    if(dir==='up'){rect(c,-4,-20,8,7,hair);rect(c,-3,-12,6,8,'#a08b59');rect(c,-2,-11,4,5,'#bfad77');}
    else if(side){rect(c,2,-18,2,2,P.ink);rect(c,4,-16,2,2,skin);}
    else{rect(c,-3,-18,2,2,P.ink);rect(c,2,-18,2,2,P.ink);rect(c,-1,-14,2,1,'#b77e64');}
    if(kind==='eli'){rect(c,-5,-13,10,2,trim);rect(c,-5,-11,3,5,trim);rect(c,7,-14,2,17,'#8e7750');rect(c,7,-15,2,3,'#e4cea0');}
    if(kind==='mara'){rect(c,-5,-23,10,2,'#d9d0b6');rect(c,-6,-22,2,9,'#d9d0b6');rect(c,4,-22,2,9,'#d9d0b6');rect(c,-3,-10,6,7,'#dacaa1');}
    if(kind==='iona'){rect(c,-7,-24,14,3,'#dfc998');rect(c,-4,-27,8,3,'#667f8b');rect(c,4,-10,3,6,'#e4d4a9');}
    if(['boaz','oren'].includes(kind))rect(c,-3,-11,6,8,'#d0b891');
    if(['esther','ruth'].includes(kind)){rect(c,-6,-24,12,3,coat);rect(c,4,-22,3,10,coat);}
    if(kind==='reuben'){rect(c,-3,-14,6,3,hair);rect(c,7,-14,2,16,'#977851');}
    if(kind==='sela'){rect(c,-7,-24,14,3,'#c0b998');rect(c,5,-6,4,5,'#647b80');}
    if(!moving&&dir==='down'&&Math.floor(time*2+x)%13===0){rect(c,-3,-18,2,2,skin);rect(c,2,-18,2,2,skin);rect(c,-3,-17,2,1,P.ink);rect(c,2,-17,2,1,P.ink);}
    if(['work','give','kneel'].includes(action)){rect(c,4,-13+Math.round(Math.sin(time*9)*2),5,3,skin);if(action==='give')rect(c,8,-13,5,5,'#e2c88e');}
    if(action==='hurt'){c.globalAlpha=.3;rect(c,-7,-23,14,25,'#fff6d2');}
    c.restore();
  }
  function enemy(c,x,y,time,state,hp){
    const bob=Math.sin(time*4)*2;ellipse(c,x,y+1,10,4,'#2f414a44');
    rect(c,x-9,y-14+bob,18,12,'#343d50');rect(c,x-7,y-18+bob,14,15,'#4a5063');rect(c,x-5,y-20+bob,10,5,'#5e6374');rect(c,x-10,y-8+bob,3,6,'#4a5063');rect(c,x+7,y-8+bob,3,6,'#4a5063');
    rect(c,x-5,y-12+bob,3,2,state==='windup'?'#ffd38c':'#baadb0');rect(c,x+2,y-12+bob,3,2,state==='windup'?'#ffd38c':'#baadb0');
    if(hp<3){rect(c,x-8,y-26,16,2,'#344638');rect(c,x-8,y-26,16*Math.max(0,hp)/3,2,'#d6aa79');}
  }
  function flower(c,x,y,taken=false){rect(c,x,y-5,1,7,'#486d44');rect(c,x-3,y-2,3,2,'#608751');if(!taken){rect(c,x-3,y-7,7,3,'#f3edd0');rect(c,x-1,y-9,3,7,'#f3edd0');rect(c,x-1,y-7,3,3,'#dbbf77');}}
  function sign(c,x,y){rect(c,x-1,y-5,3,10,'#826c49');rect(c,x-10,y-15,21,12,'#655d40');rect(c,x-9,y-14,19,9,'#c2a776');rect(c,x-6,y-11,12,1,'#827049');rect(c,x-6,y-8,8,1,'#827049');}
  function fence(c,x,y,w){rect(c,x,y-8,w,3,'#b2a17a');rect(c,x,y-2,w,2,'#b2a17a');for(let n=0;n<=w;n+=12){rect(c,x+n,y-12,3,17,'#7f7756');rect(c,x+n,y-12,2,14,'#d2be8c');}}
  function lantern(c,x,y,time,lit=false){
    rect(c,x-3,y-33,6,36,'#776a49');rect(c,x-2,y-34,2,34,'#bca575');rect(c,x-13,y-36,25,3,'#756747');rect(c,x-10,y-34,1,5,'#645f42');
    rect(c,x-14,y-29,9,13,'#465245');rect(c,x-12,y-27,5,8,lit?'#f6d586':'#8a9881');rect(c,x-15,y-30,11,2,'#3d4b3e');rect(c,x-15,y-17,11,2,'#3d4b3e');
    if(lit){const g=c.createRadialGradient(x-10,y-23,2,x-10,y-23,48);g.addColorStop(0,'#ffd58144');g.addColorStop(1,'#ffd58100');c.fillStyle=g;c.fillRect(x-58,y-71,96,96);rect(c,x-10,y-24+Math.round(Math.sin(time*8)),2,4,'#fff1b0');}
  }
  function makeMap(existing){
    const c=existing||document.createElement('canvas');c.width=960;c.height=640;const g=c.getContext('2d',{willReadFrequently:true});
    // A restored canvas has empty storage; repaint the cached terrain itself.
    if(!existing)c.addEventListener('contextrestored',()=>makeMap(c));
    rect(g,0,0,960,640,P.grass);
    for(let y=0;y<640;y+=16)for(let x=0;x<960;x+=16){const r=hash(x,y);rect(g,x,y,16,16,r>.55?P.grass2:P.grass);if(r>.4){rect(g,x+4,y+8,1,3,'#709952');rect(g,x+5,y+10,2,1,'#709952');}if(r>.9){rect(g,x+11,y+4,2,2,'#b2c783');}}
    // Meandering river and earthy banks.
    for(let y=0;y<640;y+=4){const x=558+Math.round(Math.sin(y*.018)*12);rect(g,x-8,y,93,4,'#aeb18a');rect(g,x-3,y,83,4,'#547e87');rect(g,x+2,y,73,4,P.water);rect(g,x+6,y,2,4,'#87b1ae');}
    // Hand-shaped routes connect useful landmarks.
    const paths=[[110,302,445,42],[239,190,36,154],[374,224,36,100],[169,332,34,95],[641,298,224,42],[760,313,39,162]];
    for(const [x,y,w,h]of paths){rect(g,x-3,y-3,w+6,h+6,'#aab379');rect(g,x,y,w,h,P.sand);for(let i=0;i<w*h/95;i++){const a=hash(i+x,y),b=hash(i+y,x);rect(g,x+Math.floor(a*w),y+Math.floor(b*h),2,1,'#bca979');}}
    // Bridge, with rails above and below the walking surface.
    rect(g,535,299,112,42,'#645b45');rect(g,535,303,112,33,'#b59b6a');for(let x=536;x<647;x+=8){rect(g,x,303,1,33,'#82734f');rect(g,x+2,304,5,1,'#d0b682');}rect(g,534,298,114,4,'#d1b684');rect(g,534,337,114,4,'#d1b684');for(const x of [537,568,608,640]){rect(g,x,293,4,10,'#7e6d4e');rect(g,x,333,4,11,'#7e6d4e');}
    // Garden beds and village flagstones.
    rect(g,114,386,120,65,'#8b7950');for(let y=393;y<449;y+=14){rect(g,119,y,108,2,'#6c6945');for(let x=123;x<226;x+=13){rect(g,x,y-4,3,5,'#5d8449');rect(g,x-2,y-2,7,2,'#719950');}}
    fence(g,107,378,132);fence(g,107,454,132);
    for(let y=277;y<352;y+=12)for(let x=292;x<351;x+=14){rect(g,x,y,12,10,hash(x,y)>.5?'#b8b69a':'#c8c2a2');rect(g,x,y+9,12,1,'#9caa84');}
    // Little stepping stones, reeds, flowers, mushrooms.
    for(let i=0;i<85;i++){const x=45+hash(i,51)*865,y=55+hash(i,75)*530;if(x>105&&x<860&&y>280&&y<350)continue;if(x>530&&x<650)continue;if(i%3===0){rect(g,x,y,2,3,'#ead7a0');rect(g,x-1,y+1,4,1,'#ead7a0');}else if(i%3===1){rect(g,x,y,3,2,'#c4a494');}else{rect(g,x,y,4,2,'#6f9a54');}}
    for(let y=70;y<600;y+=37){const x=551+Math.sin(y*.018)*12;rect(g,x-6,y,1,7,'#537c54');rect(g,x-9,y+2,1,5,'#537c54');rect(g,x-6,y-2,2,3,'#bda56b');}
    return c;
  }
  return {P,rect,ellipse,hash,tree,house,person,enemy,flower,sign,fence,lantern,makeMap};
})();
