const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.GAME_URL||pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.clock.install();await page.locator('#start').click();
  for(let i=0;i<15&&await page.locator('#dialogue').isVisible();i++)await page.locator('#next').click();
  await page.evaluate(()=>{window.walkFrames=[];const original=Art.person;Art.person=function(ctx,x,y,kind,...args){if(ctx.canvas.id==='world'&&kind==='eli'){const m=ctx.getTransform();walkFrames.push({x:Math.round(x)+m.e,y:Math.round(y)+m.f,mapX:m.e,mapY:m.f});}return original(ctx,x,y,kind,...args);};});
  for(const key of ['d','a','s','w']){
   await page.evaluate(()=>walkFrames.length=0);await page.keyboard.down(key);await page.clock.runFor(500);await page.keyboard.up(key);
   const frames=await page.evaluate(()=>walkFrames);assert.ok(frames.length>10);
   assert.equal(new Set(frames.map(f=>`${f.x},${f.y}`)).size,1,'Player stays anchored while the map scrolls');
   const axis=['d','a'].includes(key)?'mapX':'mapY',sign=['d','s'].includes(key)?-1:1;
   for(let i=1;i<frames.length;i++)assert.ok((frames[i][axis]-frames[i-1][axis])*sign>=0,'Background never reverses during steady movement');
   const stopped=frames.at(-1);await page.evaluate(()=>walkFrames.length=0);await page.clock.runFor(250);
   assert.ok((await page.evaluate(()=>walkFrames)).every(f=>f.mapX===stopped.mapX&&f.mapY===stopped.mapY),'Camera stops with the player');
  }
  const torsoStable=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=40;const ctx=c.getContext('2d');const samples=[];for(let i=0;i<32;i++){ctx.clearRect(0,0,40,40);Art.person(ctx,20,30,'eli','down',i/32,true);samples.push(Array.from(ctx.getImageData(14,5,12,13).data).join(','));}return new Set(samples).size===1;});
  assert.ok(torsoStable,'Walking head does not bob');assert.deepEqual(errors,[]);
  console.log('PASS: four-direction camera stability, no stop drift, steady walking head, no browser errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
