/* Run with Node + Playwright available. Test output stays in test-results/. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const out=path.join(__dirname,'test-results');fs.mkdirSync(out,{recursive:true});
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.waitForFunction(()=>!!window.Willowbrook);
  await page.screenshot({path:path.join(out,'title-desktop.png')});
  await page.clock.install();
  const get=()=>page.evaluate(()=>Willowbrook.getState());
  const tick=async(ms=100)=>page.clock.runFor(ms);
  const key=async(k,ms)=>{await page.keyboard.down(k);await tick(ms);await page.keyboard.up(k);};
  const dialog=async()=>{for(let i=0;i<12;i++){if(!await page.locator('#dialogue').isVisible())break;if(!await page.locator('#next').isVisible())break;await page.locator('#next').click();await tick(40);}};
  async function walk(x,y){
    // Real keyboard input follows a collision-aware grid path to the requested landmark.
    const route=await page.evaluate(({x,y})=>{
      const s=Willowbrook.getState(),cell=8,start=[Math.round(s.x/cell),Math.round(s.y/cell)],goal=[Math.round(x/cell),Math.round(y/cell)];
      const queue=[start],seen=new Map([[start.join(','),null]]);let end=null;
      for(let i=0;i<queue.length;i++){const p=queue[i];if(Math.hypot(p[0]-goal[0],p[1]-goal[1])<1.5){end=p;break;}for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[p[0]+d[0],p[1]+d[1]],k=n.join(',');if(!seen.has(k)&&n[0]>=7&&n[0]<=113&&n[1]>=13&&n[1]<=73&&!Willowbrook.isBlocked(n[0]*cell,n[1]*cell)){seen.set(k,p);queue.push(n);}}}
      if(!end)throw Error('No route to '+x+','+y);const result=[];for(let p=end;p;p=seen.get(p.join(',')))result.push({x:p[0]*cell,y:p[1]*cell});return result.reverse();
    },{x,y});
    // Collapse collinear grid steps, then approach each waypoint.
    const points=route.filter((p,i)=>!i||i===route.length-1||(route[i-1].x!==route[i+1].x&&route[i-1].y!==route[i+1].y));
    for(const p of points){for(let tries=0;tries<5;tries++){const s=await get(),dx=p.x-s.x,dy=p.y-s.y;if(Math.hypot(dx,dy)<3)break;const horiz=Math.abs(dx)>Math.abs(dy),delta=horiz?dx:dy;await key(horiz?(dx>0?'d':'a'):(dy>0?'s':'w'),Math.min(1500,Math.abs(delta)/76*1000));}}
    const s=await get();assert.ok(Math.hypot(s.x-x,s.y-y)<20,`Reached ${x},${y}, got ${s.x},${s.y}`);
  }
  await page.locator('#start').click();await dialog();
  await walk(343,300);await page.keyboard.press('e');await dialog();assert.equal((await get()).stage,1);
  await walk(133,410);await page.keyboard.press('e');await tick();
  await walk(176,428);await page.keyboard.press('e');await tick();
  await walk(220,409);await page.keyboard.press('e');await tick();assert.equal((await get()).stage,2);
  await walk(343,300);await page.keyboard.press('e');await dialog();assert.equal((await get()).stage,3);
  await page.screenshot({path:path.join(out,'village-desktop.png')});
  await walk(686,320);await walk(718,370);assert.equal((await get()).stage,4);
  await page.screenshot({path:path.join(out,'combat-desktop.png')});
  // Fight using visible game inputs. Circle the clearing and strike toward approaching shadows.
  for(let i=0;i<100&&(await get()).stage===4;i++){
    for(const k of ['d','s','a','w']){await key(k,110);await page.keyboard.press('j');await tick(340);}
    if(await page.locator('#dialogue').isVisible())await dialog();
  }
  assert.equal((await get()).stage,5,'Combat can be completed using ordinary inputs');
  await walk(806,412);await page.keyboard.press('e');await dialog();
  await page.locator('#choices button').first().click();await dialog();assert.equal((await get()).stage,6);
  await walk(783,322);await tick(1500);await walk(650,320);await tick(1800);await walk(534,320);await tick(2000);await walk(433,320);await tick(1500);await walk(372,330);await tick(1800);
  console.log('Escort state',JSON.stringify(await get()));
  await page.screenshot({path:path.join(out,'escort-desktop.png')});
  assert.equal((await get()).stage,7,'Companion crosses bridge and reaches village');
  await page.keyboard.press('e');await dialog();await tick(1000);assert.equal((await get()).stage,8);assert.ok(await page.locator('#ending').isVisible());
  await page.screenshot({path:path.join(out,'ending-desktop.png')});
  await page.locator('#explore').click();await page.keyboard.press('Escape');
  const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;await download.saveAs(path.join(out,'exported-save.json'));
  const exported=JSON.parse(fs.readFileSync(path.join(out,'exported-save.json'),'utf8'));assert.equal(exported.stage,8);
  await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"stage":99}')});await tick();assert.equal((await get()).stage,8);
  await page.reload();await page.waitForFunction(()=>!!window.Willowbrook);await page.locator('#continue').click();assert.equal((await get()).stage,8);
  await page.setViewportSize({width:844,height:390});await page.screenshot({path:path.join(out,'landscape-mobile.png')});
  const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await mobile.locator('#start').click();assert.ok(await mobile.locator('#touch').isVisible());await mobile.screenshot({path:path.join(out,'touch-dialogue.png')});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['new journey','garden gathering','quest handoff','bridge collision path','combat','dialogue choice','escort bridge crossing','chapter ending','save export','invalid import preserves progress','reload continue','mobile touch UI'],screenshots:out},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
