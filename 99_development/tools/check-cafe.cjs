const {chromium}=require('playwright-core'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cp=require('child_process');
const root='http://127.0.0.1:4173/',out=path.resolve(__dirname,'../diagnostics/cafe-prototype');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[],bad=[],results=[];
const observe=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)bad.push(r.url());});};
try{
for(const [width,height] of [[1440,900],[1366,768],[820,1180],[390,844],[375,667]]){
 const mobile=width<701;console.log('Checking cafe',width,height);
 const p=await b.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile});observe(p);await p.goto(root+'cafe/');await p.waitForFunction(()=>document.querySelectorAll('[data-section]').length===3);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
 const nav=p.locator('.cafe-navigation'),rect=await nav.boundingBox();assert(Math.abs(rect.x+rect.width/2-width/2)<2);assert(Math.abs(rect.y+rect.height/2-height*(mobile?.49:.5))<2);
 const picture=p.locator('[data-motif="plate"]'),first=await picture.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(250);assert.notEqual(await picture.evaluate(e=>getComputedStyle(e).transform),first,'Idle background motion');
 await p.mouse.wheel(0,340);await p.waitForTimeout(200);const scrolled=await nav.boundingBox();assert(Math.abs(rect.x-scrolled.x)<1&&Math.abs(rect.y-scrolled.y)<1,'Navigation fixed during scroll');assert.notEqual(await picture.evaluate(e=>getComputedStyle(e).transform),first);
 await p.screenshot({path:path.join(out,`${width}-home.png`)});
 const logoRect=await p.locator('.building-logo').boundingBox(),navigation=await p.evaluate(()=>performance.getEntriesByType('navigation').length);
 const click=locator=>mobile?locator.tap():locator.click();
 for(const id of ['contact','about','menu']){
  await click(p.locator(`[data-section="${id}"]`));await p.waitForFunction(id=>document.body.dataset.open===id&&document.querySelector('.cafe-panel.is-visible h1')?.textContent===id.toUpperCase(),id);await p.waitForTimeout(800);
  assert.equal(await p.locator('[aria-expanded="true"]').count(),1);
  const a=await nav.boundingBox(),content=await p.locator('.panel-area').boundingBox();
  if(mobile)assert(a.y+a.height+5<=content.y,'Mobile navigation above content');else assert(a.x+a.width+15<=content.x,'Desktop columns must not overlap');
  assert.deepEqual(await p.locator('.building-logo').boundingBox(),logoRect,'Logo stays fixed');assert.equal(await p.evaluate(()=>performance.getEntriesByType('navigation').length),navigation);
  assert(await p.evaluate(width=>document.documentElement.scrollWidth<=width+1,width));
  if(id==='contact'){assert.equal(await p.locator('.contact-field').count(),4);assert.equal(await p.locator('.contact-field a').count(),0);}
  if(id==='menu')assert.equal(await p.locator('.menu-fields span').count(),4);
  await p.screenshot({path:path.join(out,`${width}-${id}.png`)});
 }
 // Rapid changes must not allow stale transitions to overwrite the latest selection.
 await p.locator('[data-section="contact"]').click();await p.locator('[data-section="about"]').click();await p.locator('#cafe-home').click();await p.waitForTimeout(800);assert(!await p.locator('.panel-area').isVisible());
 const returned=await nav.boundingBox();assert(Math.abs(returned.x+returned.width/2-width/2)<2);
 await p.locator('[data-section="contact"]').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('.cafe-panel.is-visible h1')?.textContent==='CONTACT');await p.keyboard.press('Escape');await p.waitForTimeout(750);assert(!await p.locator('.panel-area').isVisible());
 await click(p.locator('.building-logo'));await p.waitForURL(root+'index.html');results.push({width,height,mobile,centered:true,backgroundMotion:true,fixedNavigation:true,splitPanels:true,logoStable:true,homeReturn:true,noReload:true,keyboard:true});await p.close();
}
const reduce=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});observe(reduce);await reduce.goto(root+'cafe/');await reduce.waitForFunction(()=>document.querySelectorAll('[data-section]').length===3);const still=await reduce.locator('[data-motif="plate"]').evaluate(e=>getComputedStyle(e).transform);await reduce.waitForTimeout(200);assert.equal(await reduce.locator('[data-motif="plate"]').evaluate(e=>getComputedStyle(e).transform),still);await reduce.locator('[data-section="contact"]').click();await reduce.waitForFunction(()=>document.querySelector('.cafe-panel.is-visible h1')?.textContent==='CONTACT');await reduce.close();
// Broken media should leave the cafe navigation and panels fully usable.
const failed=await b.newPage();await failed.route('**/cafe/90_shared/illustrations/*',route=>route.abort());await failed.goto(root+'cafe/');await failed.waitForFunction(()=>document.querySelectorAll('.photo-placeholder').length===5);await failed.locator('[data-section="about"]').click();await failed.waitForFunction(()=>document.querySelector('.cafe-panel.is-visible h1')?.textContent==='ABOUT');await failed.close();
const top=await b.newPage({viewport:{width:1440,height:900}});observe(top);await top.goto(root);await top.waitForFunction(()=>Sawara.viewer?.ready,null,{timeout:90000});await top.locator('#guide-button').click();await top.waitForFunction(()=>!Sawara.viewer.isTransitioning());assert.equal(await top.locator('[data-floor-row="1f"] .floor-english').innerText(),'CAFE');await top.locator('[data-floor-row="1f"] .floor-english').click();await top.waitForURL('**/cafe/index.html');await top.locator('.building-logo').click();await top.waitForURL(root+'index.html');await top.close();
const touch=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(touch);await touch.goto(root);await touch.waitForFunction(()=>Sawara.viewer?.ready,null,{timeout:90000});await touch.locator('#guide-button').tap();await touch.waitForFunction(()=>!Sawara.viewer.isTransitioning());await touch.locator('[data-floor-row="1f"] .floor-name').tap();await touch.waitForURL('**/cafe/index.html');await touch.waitForFunction(()=>document.querySelectorAll('[data-section]').length===3);await touch.locator('[data-section="contact"]').tap();await touch.waitForFunction(()=>document.querySelector('.cafe-panel.is-visible h1')?.textContent==='CONTACT');await touch.close();
const baseline='b4309fac1b70e8f95cf6f2a4e08baeff15138a1c';assert.equal(cp.execFileSync('git',['rev-parse','backup/top-page-v1-20261103'],{encoding:'utf8'}).trim(),baseline);const changed=cp.execFileSync('git',['diff','--name-only',baseline],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);assert.deepEqual(changed.sort(),['90_shared/js/directory.js','90_shared/js/floors.js']);
const old=JSON.parse(fs.readFileSync('.local-cache/cafe-prototype/prior-inventory.json','utf8').replace(/^\uFEFF/,''));for(const item of old.files)assert.equal(fs.statSync(item.file).size,item.bytes,'Existing untracked file changed: '+item.file);
assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);const report={passed:true,branch:cp.execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),results,reducedMotion:true,imageFailureFallback:true,cafeLinkFrom3D:true,backupCommitUnchanged:true,oldUntrackedFilesPreserved:old.files.length,jsErrors:errors,localHttpErrors:bad};fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log('PASS all cafe checks');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
