const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(path.join(__dirname,'index.html')).href;
  await page.goto(url);await page.waitForFunction(()=>!!window.Campaign);
  const fixture=await page.evaluate(()=>({version:1,stage:8,hp:1,x:681,y:390,flowers:[0,1,2],notes:[],time:600,choice:0,jonah:{x:409,y:328},settings:{reduced:true,gentle:true},finished:true,region:'tower',journey:{...Campaign.fresh(),step:16,flags:['repair-a','repair-b','repair-c','bell-low'],tools:['lantern','rope'],visited:['village','orchard','marsh','tower'],checkpoint:{region:'tower',x:165,y:357}}}));
  await page.evaluate(s=>localStorage.setItem('narrow-way-willowbrook-v1',JSON.stringify(s)),fixture);
  await page.reload();await page.clock.install();await page.locator('#continue').click();await page.clock.runFor(250);
  const restored=await page.evaluate(()=>Willowbrook.getState());
  assert.equal(restored.hp,6);assert.equal(restored.x,165);assert.equal(restored.y,357);assert.equal(restored.region,'tower');assert.equal(restored.journey.step,16);assert.ok(restored.journey.flags.includes('bell-low'));
  await page.reload();await page.locator('#continue').click();assert.equal(await page.evaluate(()=>Willowbrook.getState().hp),6);
  const rejected=await page.evaluate(()=>{const s=Willowbrook.getState();s.region='sanctuary';try{Willowbrook.validateSave(s);return false;}catch{return true;}});assert.ok(rejected,'Cannot import an unvisited or locked region');
  assert.deepEqual(errors,[]);console.log('PASS: hazard recovery, checkpoint save persistence, retained puzzle progress, locked-region validation, no browser errors.');await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exit(1);});
