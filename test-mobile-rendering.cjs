const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:3});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.GAME_URL||pathToFileURL(path.join(__dirname,'index.html')).href);await page.clock.install();await page.locator('#start').click();
 for(let i=0;i<15&&await page.locator('#dialogue').isVisible();i++)await page.locator('#next').click();
 const state=await page.evaluate(()=>Willowbrook.getState());
 for(const [width,height]of [[844,390],[393,852],[740,280],[640,320],[844,390]]){
  await page.setViewportSize({width,height});await page.clock.runFor(100);
  for(const size of [1,1.15,1.3]){
   await page.evaluate(size=>document.body.style.setProperty('--touch-size',size),String(size));
   const result=await page.evaluate(()=>{const map=document.querySelector('#minimap-button').getBoundingClientRect(),buttons=[...document.querySelectorAll('.touch-actions button')];return buttons.map(b=>{const r=b.getBoundingClientRect();return{id:b.id,overlap:r.left<map.right&&r.right>map.left&&r.top<map.bottom&&r.bottom>map.top,onScreen:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,clickable:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b};});});
   assert.ok(result.every(x=>!x.overlap&&x.onScreen&&x.clickable),JSON.stringify({width,height,size,result}));
  }
 }
 // Simulate loss of the cached bitmap contents, then browser restoration.
 for(const region of ['village','orchard','harbor']){
  const restored=await page.evaluate(region=>{const before=Campaign.buildMap(region),ctx=before.getContext('2d');const expected=[...ctx.getImageData(400,350,1,1).data];ctx.clearRect(0,0,before.width,before.height);before.dispatchEvent(new Event('contextrestored'));const after=Campaign.buildMap(region);return{expected,actual:[...after.getContext('2d').getImageData(400,350,1,1).data]};},region);
  assert.deepEqual(restored.actual,restored.expected,'Cached terrain repainted for '+region);assert.equal(restored.actual[3],255);
 }
 await page.evaluate(()=>{const c=document.querySelector('#world');c.getContext('2d').clearRect(0,0,c.width,c.height);c.dispatchEvent(new Event('contextrestored'));});await page.clock.runFor(50);
 const rendered=await page.evaluate(()=>{const c=document.querySelector('#world'),a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let colored=0;for(let i=0;i<a.length;i+=4)if(a[i]+a[i+1]+a[i+2]>80&&a[i+3]===255)colored++;return colored/(c.width*c.height);});assert.ok(rendered>.8,'World is painted after restoration');
 assert.equal((await page.evaluate(()=>Willowbrook.getState())).stage,state.stage);assert.deepEqual(errors,[]);
 console.log('PASS: touch hit targets at three sizes, five rotated viewports, cached terrain restoration in three regions, world restoration, quest preservation.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
