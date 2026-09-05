const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 const fixture={version:1,stage:8,hp:6,x:343,y:306,flowers:[0,1,2],notes:[],time:400,choice:0,jonah:{x:410,y:328},settings:{reduced:true,gentle:true},finished:true,region:'village',journey:{step:24,flags:[],secrets:[],lessons:['mercy'],reviews:{},choices:{},tools:['lantern','rope','lens'],visited:['village','orchard','marsh','tower','sanctuary'],fog:{},checkpoint:{region:'village',x:343,y:306}}};
 const load=async s=>{await page.evaluate(s=>localStorage.setItem('narrow-way-willowbrook-v1',JSON.stringify(s)),s);await page.reload();await page.waitForFunction(()=>!!window.Willowbrook);await page.clock.install();await page.locator('#continue').click();};
 await load(fixture);
 const get=()=>page.evaluate(()=>Willowbrook.getState());
 const tick=(n=30)=>page.clock.runFor(n);
 const dialog=async()=>{for(let i=0;i<24;i++){if(!await page.locator('#dialogue').isVisible()||!await page.locator('#next').isVisible())break;await page.locator('#next').click();await tick();}};
 const q=async n=>assert.equal((await get()).journey.step,n,'Objective '+n);
 // WALK_ROADS=1 drives movement and E at every encounter; default is a faster story integration run.
 async function walkTo(id){
  const route=await page.evaluate(id=>{const s=Willowbrook.getState(),objects=Campaign.objects().filter(o=>o.kind==='task'?s.journey.flags.includes('accepted-'+o.id.slice(5))&&!s.journey.flags.includes('found-'+o.id.slice(5)):o.kind==='secret'?s.journey.tools.includes('lantern')&&!s.journey.secrets.includes(o.id):true),o=objects.find(o=>o.id===id);if(!o)throw Error('Missing '+id);const start=[Math.round(s.x/8),Math.round(s.y/8)],queue=[start],seen=new Map([[start.join(','),null]]);let end;
   for(let i=0;i<queue.length;i++){const p=queue[i],x=p[0]*8,y=p[1]*8;const near=objects.filter(o=>Math.hypot(o.x-x,o.y-y)<27).sort((a,b)=>(a.kind==='task'?-1:0)-(b.kind==='task'?-1:0)||Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));if(near[0]?.id===id&&Math.hypot(o.x-x,o.y-y)<22){end=p;break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[p[0]+dx,p[1]+dy],k=n.join(',');if(!seen.has(k)&&n[0]>=8&&n[0]<=112&&n[1]>=13&&n[1]<=73&&!Willowbrook.isBlocked(n[0]*8,n[1]*8)){seen.set(k,p);queue.push(n);}}}if(!end)throw Error('No approach '+id);const a=[];for(let p=end;p;p=seen.get(p.join(',')))a.push({x:p[0]*8,y:p[1]*8});return a.reverse();},id);
  const points=route.filter((p,i)=>!i||i===route.length-1||(route[i-1].x!==route[i+1].x&&route[i-1].y!==route[i+1].y));for(const p of points)for(let i=0;i<8;i++){const s=await get(),dx=p.x-s.x,dy=p.y-s.y;if(Math.hypot(dx,dy)<.8)break;const h=Math.abs(dx)>Math.abs(dy),key=h?(dx>0?'d':'a'):(dy>0?'s':'w');await page.keyboard.down(key);await tick(Math.min(4000,Math.abs(h?dx:dy)/76*1000));await page.keyboard.up(key);}
  const end=route.at(-1),at=await get();assert.ok(Math.hypot(at.x-end.x,at.y-end.y)<3,`Walking ${id}: expected ${end.x},${end.y}; actual ${at.x},${at.y}`);
 }
 const use=async id=>{if(process.env.WALK_ROADS==='1'){await walkTo(id);assert.equal(await page.evaluate(()=>Campaign.nearby()?.id),id,'Nearest '+id);await page.keyboard.press('e');}else await page.evaluate(id=>{const o=Campaign.objects().find(o=>o.id===id);if(!o)throw Error('Missing '+id);Campaign.interact(o);},id);await dialog();};
 const choice=async(i=0)=>{const buttons=page.locator('#choices button');assert.ok(await buttons.count()>i);for(let n=0;n<i;n++)await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>Array.from(document.querySelectorAll('#choices button')).indexOf(document.activeElement)),i);await page.keyboard.press('Enter');await dialog();};
 const reachability=async()=>page.evaluate(()=>{const s=Willowbrook.getState(),queue=[[112,320]],seen=new Set(['112,320']);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&nx>=58&&nx<=900&&ny>=103&&ny<=587&&!Willowbrook.isBlocked(nx,ny)){seen.add(k);queue.push([nx,ny]);}}}return Campaign.objects().filter(o=>!queue.some(([x,y])=>Math.hypot(x-o.x,y-o.y)<28)).map(o=>o.id);});
 await page.keyboard.press('e');await dialog();await q(25);
 assert.ok((await get()).journey.lessons.includes('commandments'));
 for(let i=0;i<5;i++)await use('east');assert.equal((await get()).region,'harbor');assert.deepEqual(await reachability(),[]);
 // Actual walking and interaction at harbor arrival.
 await page.keyboard.down('d');await tick(1700);await page.keyboard.up('d');assert.ok((await get()).x>220);
 await use('iona');await q(26);for(const id of ['tide-board','passenger-list','manifest'])await use(id);await q(27);
 await use('iona');await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#choices button').last().evaluate(e=>e===document.activeElement),true);await page.keyboard.press('ArrowRight');await choice(1);await q(28);
 await page.keyboard.press('h');await dialog();assert.equal((await get()).journey.choices['hint-28'],1);
 await use('barge-wheel');await use('rescue-wheel');await use('rescue-wheel');await q(29);
 for(const id of ['families','porters','carers'])await use(id);await q(30);
 for(let n=0;n<20&&(await get()).journey.step===30;n++){await tick(450);await use('signal');}await q(31);
 await use('deed-pronunciation');await use('task-pronunciation');await use('deed-pronunciation');assert.ok((await get()).journey.flags.includes('done-pronunciation'));
 fs.mkdirSync(path.join(__dirname,'test-results'),{recursive:true});await page.screenshot({path:path.join(__dirname,'test-results','nine-harbor.png')});
 await use('bench');await q(32);await use('east');assert.deepEqual(await reachability(),[]);await use('reuben');await q(33);
 for(const id of ['builder','teacher','water-carrier'])await use(id);await q(34);await use('west-mirror');for(let i=0;i<3;i++)await use('east-mirror');await q(35);
 await use('reuben');await choice(1);await q(36);for(const id of ['west-house','east-house','workshop'])await use(id);await q(37);await use('west-bed');await use('east-bed');await q(38);await use('meeting-gate');await q(39);
 await use('east');assert.deepEqual(await reachability(),[]);await use('esther');await q(40);for(const id of ['infirmary','kitchen','hall'])await use(id);await q(41);
 for(const id of ['north-valve','north-valve','east-valve','south-valve'])await use(id);await q(42);await use('esther');await choice();await q(43);
 await use('infirmary');await q(43);assert.ok(!(await get()).journey.flags.includes('supplied-infirmary'));
 for(const id of ['medicine','bread','blankets','infirmary','kitchen','hall'])await use(id);await q(44);await use('shepherd');await q(44);for(const id of ['trail-a','trail-b','shepherd'])await use(id);await q(45);
 await use('winter-high');assert.equal((await get()).journey.choices['winter-song'],0);for(const id of ['winter-low','winter-low','winter-high'])await use(id);await q(46);await use('letters');await q(47);
 await use('east');assert.deepEqual(await reachability(),[]);await use('mara-final');await q(48);for(const id of ['food-crew','bridge-crew','ferry-crew'])await use(id);await q(49);for(const id of ['gauge','survey','warning'])await use(id);await q(50);for(const id of ['station-a','station-b','station-c'])await use(id);await q(51);
 const before=await get();await use('mara-final');await choice(2);await q(51);await use('mara-final');await choice(0);await choice(0);await q(51);
 const titles=[];
 for(const branch of [0,1]){if(branch)await load(before);await use('mara-final');await choice(branch);await choice(1);await q(52);for(const id of ['control','shelter','last-lantern'])await use(id);await q(55);assert.ok(await page.locator('#ending').isVisible());titles.push(await page.locator('#ending h2').textContent());const saved=await get();assert.equal(await page.evaluate(s=>!!Willowbrook.validateSave(s),saved),true);await load(saved);await q(55);}
 assert.notEqual(titles[0],titles[1]);
 await page.keyboard.press('m');assert.equal(await page.locator('#region-tabs button').count(),9);await page.locator('#map-guidance').click();assert.equal((await get()).journey.choices.guidance,1);await page.keyboard.press('Escape');
 await page.keyboard.press('b');assert.ok((await page.locator('#journal-pages').textContent()).includes('Matthew 22:37'));await page.keyboard.press('Escape');
 await page.setViewportSize({width:844,height:390});await page.keyboard.press('m');await page.screenshot({path:path.join(__dirname,'test-results','nine-mobile-map.png')});assert.deepEqual(errors,[]);
 console.log('PASS: 31 expansion objectives, nine-region access, keyboard choice wrapping/Enter, progressive hints, community story, puzzle prerequisites, both endings, cancellation, save reload, map guidance, journal, mobile map, reachable objects.');
 await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exit(1);});
