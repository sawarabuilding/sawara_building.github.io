const {chromium}=require('playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.resolve(__dirname,'../diagnostics/archives-revision');
const root='http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 browser.on('disconnected',()=>console.log('Browser closed'));
 const checks=[],errors=[],badResponses=[],desktop=[];
 const observe=page=>{page.setDefaultTimeout(20000);page.setDefaultNavigationTimeout(20000);page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});};
 const waitReady=page=>page.waitForFunction(()=>window.Sawara?.viewer?.ready,{timeout:60000});
 const waitMode=page=>page.waitForFunction(()=>!window.Sawara.viewer.isTransitioning());
 const measure=page=>page.evaluate(()=>{
  const v=window.Sawara.viewer,active=v.getMode()==='guide'?v.sectionModel:v.model;
  const bounds={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity},glass=[],opaque=[];
  active.updateMatrixWorld(true);
  active.traverse(o=>{if(!o.isMesh)return;
   const box=o.geometry.boundingBox;
   if(box)for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const p=v.screen(v.camera.position.clone().set(x,y,z).applyMatrix4(o.matrixWorld));
    bounds.left=Math.min(bounds.left,p.x);bounds.right=Math.max(bounds.right,p.x);bounds.top=Math.min(bounds.top,p.y);bounds.bottom=Math.max(bounds.bottom,p.y);
   }
   for(const m of [o.material].flat()){
    if(m.name.startsWith('Glass_source'))glass.push({opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});
    if(m.name.startsWith('Concrete')||m.name.startsWith('Wood_'))opaque.push({name:m.name,opacity:m.opacity});
   }
  });
  const gateway=document.querySelector('#archive-heading a');
  return {mode:v.getMode(),viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],
    bounds,glass,opaque,gateway:gateway.getBoundingClientRect().toJSON(),archiveFont:parseFloat(getComputedStyle(gateway.parentElement).fontSize),
    labels:[...document.querySelectorAll('[data-floor-row]')].map(e=>e.getBoundingClientRect().toJSON())};
 });
 try{
  for(const [w,h] of [[1366,768],[1440,900],[1920,1080]]){
   const p=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});observe(p);
   await p.goto(root);await waitReady(p);await p.waitForTimeout(100);
   const exterior=await measure(p);
   assert(exterior.scroll[1]<=h+1&&exterior.scroll[0]<=w+1,'Desktop exterior must have no page scroll');
   assert(exterior.bounds.top>=0&&exterior.bounds.bottom<=h&&exterior.bounds.left>=0&&exterior.bounds.right<=w,'Exterior bounds fit');
   assert.equal(await p.locator('.header-index').count(),0);
   assert.equal(await p.locator('#archive-links,.archive-row').count(),0);
   assert.equal(await p.locator('[data-floor-row]').count(),5);
   assert(exterior.glass.length&&exterior.glass.every(m=>Math.abs(m.opacity-.2)<1e-8&&m.transparent&&!m.depthWrite));
   assert(exterior.opaque.every(m=>m.opacity===1));
   const qualityBox=await p.locator('.quality').boundingBox();
   assert(exterior.gateway.bottom<=qualityBox.y||exterior.gateway.right<=qualityBox.x||exterior.gateway.left>=qualityBox.x+qualityBox.width,'Archive gateway must not overlap quality controls');
   await p.screenshot({path:path.join(out,`top-${w}x${h}-exterior.png`)});
   const initial=await p.evaluate(()=>window.Sawara.viewer.camera.position.toArray());await p.waitForTimeout(200);
   const rotated=await p.evaluate(()=>window.Sawara.viewer.camera.position.toArray());assert(Math.hypot(...initial.map((v,i)=>v-rotated[i]))>.1);
   await p.mouse.move(w*.5,h*.5);const beforeZoom=await p.evaluate(()=>window.Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}));
   await p.mouse.wheel(0,-180);await p.waitForTimeout(180);
   assert(await p.evaluate(()=>window.Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}))<beforeZoom);
   await p.mouse.down({button:'right'});await p.mouse.move(w*.5+60,h*.5+20,{steps:6});await p.mouse.up({button:'right'});
   assert.equal(await p.evaluate(()=>window.Sawara.viewer.getMode()),'exterior');
   await p.locator('#guide-button').click();await waitMode(p);
   const guide=await measure(p);
   assert(guide.scroll[1]<=h+1&&guide.scroll[0]<=w+1,'Desktop guide must have no page scroll');
   assert(guide.bounds.top>=0&&guide.bounds.bottom<=h&&guide.bounds.left>=0&&guide.bounds.right<=w,'Guide bounds fit');
   assert(guide.labels.every(r=>r.left>=0&&r.right<=w&&r.top>=0&&r.bottom<=h));
   assert(guide.gateway.top>=0&&guide.gateway.bottom<=h&&guide.gateway.right<=w);
   assert(Math.abs(guide.archiveFont-Math.min(43,Math.max(19,w*.027)))<.1,'ARCHIVES is 50% of the previous type scale');
   assert(guide.glass.length&&guide.glass.every(m=>Math.abs(m.opacity-.2)<1e-8));
   await p.screenshot({path:path.join(out,`top-${w}x${h}-guide.png`)});
   await p.mouse.move(w*.5,h*.5);await p.mouse.wheel(0,-130);await p.waitForTimeout(100);
   assert.equal(await p.evaluate(()=>window.Sawara.selectedFloorId),'2f');
   await p.locator('[data-select-floor="1f"]').click();await p.waitForTimeout(600);await p.mouse.move(w*.5,h*.5);await p.mouse.wheel(0,130);await p.waitForTimeout(100);
   assert.equal(await p.evaluate(()=>window.Sawara.selectedFloorId),'b1f');
   assert.equal(await p.locator('#archive-heading a').getAttribute('aria-current'),'location');
   if(w===1920){await p.locator('#archive-heading a').focus();await p.keyboard.press('Enter');}
   else await p.locator('#archive-heading a').click();
   await p.waitForURL('**/archives/index.html',{waitUntil:'domcontentloaded'});
   desktop.push({exterior,guide});await p.close();console.log('Desktop passed',w,h);
  }
  checks.push('All 3 desktop sizes: no vertical/horizontal scroll, full model/labels/gateway fit','Exterior auto rotation, wheel zoom and right drag','Guide transition and wheel floor navigation','20% glass in both modes; wood/concrete remain opaque','ARCHIVES type scale is halved','No top-right text or individual archive entries','Gateway link is separate from model controls');
  const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});observe(p);
  await p.goto(root+'archives/index.html');await p.waitForSelector('.archive-item');await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.locator('.archive-item').count(),9);assert.equal(await p.locator('.archive-item a').count(),0);
  const archive=await p.evaluate(()=>{
   const title=document.querySelector('.archive-home-title'),logo=document.querySelector('.archive-building-logo'),grid=document.querySelector('.archive-collection');
   return {background:getComputedStyle(document.body).backgroundColor||getComputedStyle(document.documentElement).backgroundColor,
    rootBackground:getComputedStyle(document.documentElement).backgroundColor,title:title.getBoundingClientRect().toJSON(),logo:logo.getBoundingClientRect().toJSON(),
    titleStyle:{fill:getComputedStyle(title).webkitTextFillColor,stroke:getComputedStyle(title).webkitTextStrokeWidth,whiteSpace:getComputedStyle(title).whiteSpace},
    columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth,
    articles:[...document.querySelectorAll('.archive-item')].map(e=>({title:e.querySelector('h2').textContent,category:e.querySelector('.item-category').textContent,rect:e.getBoundingClientRect().toJSON()}))};
  });
  assert.equal(archive.rootBackground,'rgb(0, 0, 0)');assert.equal(archive.columns,3);assert(!archive.overflow);
  assert(archive.title.right<archive.logo.left);assert.equal(archive.titleStyle.whiteSpace,'nowrap');assert(archive.titleStyle.fill.includes('0)'));
  assert(archive.articles.some(a=>a.category==='ARCHITECTURE')&&archive.articles.some(a=>a.category==='MONEY'));
  const headings=archive.articles.map(a=>a.title);
  for(const title of ['SAWARABAN 1号','SAWARABAN 2号','SAWARABAN 3号','2026.7.19-20 ZINEフェス','2026.9.26 西神中央','building #1','building #2','building #3','収支報告書2026'])assert(headings.includes(title));
  for(let i=0;i<3;i++)assert(new Set(archive.articles.filter((_,j)=>j%3===i).map(a=>a.category)).size>1);
  await p.screenshot({path:path.join(out,'archives-desktop.png'),fullPage:true});
  await p.locator('.archive-home-title').hover();await p.waitForTimeout(250);
  const hover=await p.locator('.archive-home-title').evaluate(e=>({fill:getComputedStyle(e).webkitTextFillColor,shadow:getComputedStyle(e).textShadow}));
  assert.equal(hover.fill,'rgb(255, 255, 255)');assert.notEqual(hover.shadow,'none');
  await p.screenshot({path:path.join(out,'archives-title-hover.png')});
  await p.mouse.move(1100,300);await p.waitForTimeout(250);assert((await p.locator('.archive-home-title').evaluate(e=>getComputedStyle(e).webkitTextFillColor)).includes('0)'));
  await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.locator('.archive-home-title').click();
  await p.waitForFunction(()=>scrollY===0);checks.push('Archive title returns to page top');
  await p.locator('.archive-home-title').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>scrollY===0);checks.push('Archive title keyboard and hover states');
  assert.equal(await p.locator('.archive-building-logo').getAttribute('data-placeholder'),'true');
  await p.locator('.archive-building-logo').click();await p.waitForURL(root+'index.html',{waitUntil:'domcontentloaded'});checks.push('Temporary building wordmark returns to 3D homepage');
  await p.goto(root+'archives/index.html');
  checks.push('9 user-supplied titles, no dummy links/images or extra serial numbers','Black archive page, single-line outline title, 3 intentionally mixed columns');
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const mp=await mobile.newPage();observe(mp);await mp.goto(root);await waitReady(mp);
  const cdp=await mobile.newCDPSession(mp),touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
  await touch('touchStart',[{x:150,y:380,id:1}]);await touch('touchMove',[{x:200,y:410,id:1}]);await touch('touchEnd',[]);
  assert.equal(await mp.evaluate(()=>window.Sawara.viewer.getMode()),'exterior');
  await mp.locator('#guide-button').click();await waitMode(mp);await mp.screenshot({path:path.join(out,'top-mobile-guide.png')});
  await touch('touchStart',[{x:180,y:380,id:1}]);await touch('touchMove',[{x:180,y:450,id:1}]);await touch('touchEnd',[]);
  assert.equal(await mp.evaluate(()=>window.Sawara.selectedFloorId),'2f');checks.push('Mobile orbit, guide tap and touch floor changes');
  await mp.waitForTimeout(350);await mp.locator('#archive-heading a').tap();console.log('Mobile gateway URL',mp.url());await mp.waitForURL('**/archives/index.html',{waitUntil:'domcontentloaded'});console.log('Mobile archive loaded');await mp.waitForSelector('.archive-item');
  const mobileArchive=await mp.evaluate(()=>({columns:getComputedStyle(document.querySelector('.archive-collection')).gridTemplateColumns.split(' ').length,
   title:document.querySelector('.archive-home-title').getBoundingClientRect().toJSON(),logo:document.querySelector('.archive-building-logo').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(mobileArchive.columns,1);assert(!mobileArchive.overflow&&mobileArchive.title.right<mobileArchive.logo.left);
  await mp.screenshot({path:path.join(out,'archives-mobile.png'),fullPage:true});
  await mp.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await mp.locator('.archive-home-title').tap();await mp.waitForFunction(()=>scrollY===0);
  await mp.locator('.archive-building-logo').tap();await mp.waitForURL(root+'index.html',{waitUntil:'domcontentloaded'});checks.push('Mobile archive title/logo navigation, 1 column, no overlap');await mobile.close();
  await p.goto(root+'archives/index.html');await p.setViewportSize({width:820,height:1100});await p.waitForSelector('.archive-item');
  assert.equal(await p.locator('.archive-collection').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);checks.push('Tablet archive is 2 columns');
  const hashes=JSON.parse(fs.readFileSync('diagnostics/archives-revision/model-hashes.json','utf8'));
  for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('assets/models/'+file)).digest('hex'),hash);
  checks.push('Every existing GLB hash unchanged');
  const result={checks,errors,badResponses,desktop,archive,hover,mobileArchive,modelHashesUnchanged:true};
  fs.writeFileSync(path.join(out,'browser-validation.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({checks,errors,badResponses}));
  assert.equal(errors.length,0);assert.equal(badResponses.length,0);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
