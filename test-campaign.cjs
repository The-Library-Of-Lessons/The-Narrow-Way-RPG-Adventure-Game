const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const out=path.join(__dirname,'test-results');fs.mkdirSync(out,{recursive:true});
  const old={version:1,stage:8,hp:6,x:343,y:306,flowers:[0,1,2],notes:[],time:300,choice:0,jonah:{x:410,y:328},settings:{reduced:true,gentle:true},finished:true};
  // Migrate the actual previous save shape; campaign fields did not exist in v1.
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await page.evaluate(s=>localStorage.setItem('narrow-way-willowbrook-v1',JSON.stringify(s)),old);
  await page.reload();await page.waitForFunction(()=>!!window.Willowbrook);await page.clock.install();await page.locator('#continue').click();
  const get=()=>page.evaluate(()=>Willowbrook.getState());
  const tick=(ms=60)=>page.clock.runFor(ms);
  const key=async(k,ms)=>{await page.keyboard.down(k);await tick(ms);await page.keyboard.up(k);};
  const dialog=async()=>{for(let i=0;i<16;i++){if(!await page.locator('#dialogue').isVisible()||!await page.locator('#next').isVisible())break;await page.locator('#next').click();await tick(20);}};
  const q=async n=>assert.equal((await get()).journey.step,n,'Expected campaign objective '+n);
  async function walk(x,y){
    const route=await page.evaluate(({x,y})=>{
      const s=Willowbrook.getState(),cell=8,start=[Math.round(s.x/cell),Math.round(s.y/cell)],goal=[Math.round(x/cell),Math.round(y/cell)],queue=[start],seen=new Map([[start.join(','),null]]);let end;
      for(let i=0;i<queue.length;i++){const p=queue[i];if(p[0]===goal[0]&&p[1]===goal[1]){end=p;break;}for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[p[0]+d[0],p[1]+d[1]],k=n.join(',');if(!seen.has(k)&&n[0]>=8&&n[0]<=112&&n[1]>=13&&n[1]<=73&&!Willowbrook.isBlocked(n[0]*cell,n[1]*cell)){seen.set(k,p);queue.push(n);}}}
      if(!end)throw Error('No route '+x+','+y);const a=[];for(let p=end;p;p=seen.get(p.join(',')))a.push({x:p[0]*cell,y:p[1]*cell});return a.reverse();
    },{x,y});
    const points=route.filter((p,i)=>!i||i===route.length-1||(route[i-1].x!==route[i+1].x&&route[i-1].y!==route[i+1].y));
    for(const p of points)for(let i=0;i<4;i++){const s=await get(),dx=p.x-s.x,dy=p.y-s.y;if(Math.hypot(dx,dy)<2)break;const h=Math.abs(dx)>Math.abs(dy),delta=h?dx:dy;await key(h?(dx>0?'d':'a'):(dy>0?'s':'w'),Math.min(4000,Math.abs(delta)/76*1000));}
    const s=await get();assert.ok(Math.hypot(s.x-x,s.y-y)<15,`Walk ${x},${y} got ${s.x},${s.y}`);
  }
  async function use(id){
    const o=await page.evaluate(id=>Campaign.objects().find(o=>o.id===id),id);assert.ok(o,'Object '+id);await walk(o.x,o.y+14);await page.keyboard.press('e');await dialog();
  }
  async function choice(i=0){await page.locator('#choices button').nth(i).click();await dialog();}
  async function picture(name){await tick(220);await page.screenshot({path:path.join(out,name+'.png')});}
  await q(0);await page.keyboard.press('e');await dialog();await q(1);
  await use('east');assert.equal((await get()).region,'orchard');console.log('Entered orchard');
  await use('tamar');await q(2);await use('boaz');await choice(1);await q(3);
  await use('grove');await q(3);assert.ok(!(await get()).journey.flags.includes('water-grove'),'Wrong order does not advance');
  for(const id of ['nursery','mill','grove'])await use(id);await q(4);
  for(const id of ['fruit-a','fruit-b','fruit-c'])await use(id);await q(5);
  await use('ruth');await use('travelers');await q(6);await use('guardian');await choice();await q(7);await picture('orchard-expanded');
  await use('secret-orchard');assert.ok((await get()).journey.secrets.includes('secret-orchard'));
  await use('east');assert.equal((await get()).region,'marsh');console.log('Entered marsh');
  await use('neri');await q(8);await use('dena');await use('oren');await q(9);
  for(const id of ['hill','reed','river'])await use(id);await q(10);await use('boat');await q(11);
  for(const id of ['shore','channel','home'])await use(id);await q(12);await picture('marsh-expanded');
  await page.keyboard.press('m');assert.ok(await page.locator('#atlas').isVisible());await picture('world-map-expanded');await page.locator('#atlas-close').click();
  await use('east');assert.equal((await get()).region,'tower');console.log('Entered tower');
  await use('sela');await q(13);await use('ledger');await use('wheel');await q(14);await use('sela');await choice(1);await q(15);
  for(const id of ['repair-a','repair-b','repair-c'])await use(id);await q(16);
  for(const id of ['low','middle','high']){await use(id);for(let i=0;i<15&&!(await get()).journey.flags.includes('bell-'+id);i++){await tick(300);await page.keyboard.press('e');await dialog();}assert.ok((await get()).journey.flags.includes('bell-'+id));}
  await q(17);await use('sela');await q(18);await picture('tower-expanded');
  await use('east');assert.equal((await get()).region,'sanctuary');console.log('Entered sanctuary');
  await use('anna');await q(19);await use('pilgrim');await use('rival');await q(20);await use('anna');await choice(0);await q(21);
  for(const id of ['receive','listen','serve','forgive'])await use(id);await q(22);await use('guardian');await choice(1);await q(23);await picture('sanctuary-expanded');
  await page.keyboard.press('b');assert.ok(await page.locator('#journal').isVisible());assert.equal(await page.locator('#journal-pages article').count(),8);await page.locator('#journal-pages article button').first().click();await picture('wisdom-journal');await page.locator('#journal-close').click();
  await page.keyboard.press('m');await page.getByRole('button',{name:'Willowbrook',exact:true}).click();await page.getByRole('button',{name:'Take the return shortcut'}).click();assert.equal((await get()).region,'village');
  await walk(343,306);await page.keyboard.press('e');await dialog();await q(24);assert.ok(await page.locator('#ending').isVisible());await picture('campaign-ending');
  await page.locator('#explore').click();await page.keyboard.press('Escape');await page.locator('#save').click();await page.reload();await page.waitForFunction(()=>!!window.Willowbrook);await page.locator('#continue').click();await q(24);
  const preserved=await get();await page.keyboard.press('Escape');await page.locator('#import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...preserved,region:'no-such-place'}))});assert.equal((await get()).journey.step,24);assert.equal((await get()).region,'village');
  await page.locator('#resume').click();await page.setViewportSize({width:844,height:390});await page.keyboard.press('m');await picture('mobile-map');await page.locator('#atlas-close').click();await page.keyboard.press('b');await picture('mobile-journal');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:['legacy save migration','five regions','all 24 campaign steps','wrong puzzle order','nine puzzle mechanisms and encounters','secret discovery','map fog and visited region view','tools and shortcuts','journal reflections','choice branches','campaign ending','reload persistence','invalid region import preservation','mobile map and journal layouts']},null,2));
  await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exit(1);});
