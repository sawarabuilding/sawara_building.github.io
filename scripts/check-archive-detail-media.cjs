const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const out='diagnostics/archive-detail-media/';fs.mkdirSync(out,{recursive:true});const errors=[],results=[];
try{for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
const p=await b.newPage({viewport});p.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:4173/archives/';
const read=()=>p.locator('.archive-home-title').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform}));
await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.body.dataset.titleFontState==='arimo');const initial=await read();assert.equal(initial.transform,'matrix(0, -1, 1, 0, 0, 0)');assert(initial.rect.height/viewport.height>.85&&initial.rect.height/viewport.height<.9);assert.equal(await p.locator('.archive-category-nav a').count(),4);
const navBoxes=await p.locator('.archive-category-nav a').evaluateAll(es=>es.map(e=>({box:e.getBoundingClientRect().toJSON(),font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color})));
for(let i=0;i<navBoxes.length;i++){assert(navBoxes[i].box.bottom<=viewport.height);assert.equal(navBoxes[i].weight,'700');if(i)assert(navBoxes[i].box.top>navBoxes[i-1].box.bottom);}
const lineBox=await p.locator('.archive-category-line').boundingBox();assert.equal(lineBox.width,1);
if(viewport.height>=768)assert(lineBox.height>=180&&lineBox.height<=220);
const cdp=await p.context().newCDPSession(p);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
const renderedFonts=async selector=>{const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});return (await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts;};
const titleFonts=await renderedFonts('.archive-home-title');assert(titleFonts.some(f=>f.familyName.includes('Arimo')&&f.isCustomFont));
const hoverSize=await p.locator('.archive-hover-title').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(Math.abs(hoverSize-Math.min(26,Math.max(15,viewport.width*.015))*.8)<.05);

for(const img of await p.locator('.archive-work img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:out+viewport.width+'-list.png',fullPage:true});
await p.locator('.archive-home-title').hover();await p.waitForTimeout(100);const flash=await p.locator('.archive-home-title').evaluate(e=>getComputedStyle(e).color);assert.equal(flash,'rgb(255, 255, 255)');await p.waitForTimeout(800);assert.equal(await p.locator('.archive-home-title').evaluate(e=>getComputedStyle(e).color),'rgba(0, 0, 0, 0)');
const work=p.locator('[data-archive-id="sawaraban-1"] .archive-work');await work.hover();await p.waitForTimeout(350);assert.equal(await work.locator('.archive-work-overlay').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0.75)');
for(const [category,ids] of [['paper',['sawaraban-1','sawaraban-2','sawaraban-3']],['event',['zine-fes-2026','seishin-2026']],['architecture',['building-1','building-2','building-3']],['money',['money-2026']]]){
await p.locator(`.archive-category-nav [data-category="${category}"]`).click();const visible=await p.locator('.archive-item:not([hidden])').evaluateAll(es=>es.sort((a,b)=>Number(a.style.order)-Number(b.style.order)).map(e=>e.dataset.archiveId));assert.deepEqual(visible,ids);
if(category==='paper'){await p.waitForTimeout(400);await p.screenshot({path:out+viewport.width+'-category.png',fullPage:true});}}
await p.locator('.archive-home-title').click();assert.equal(await p.locator('.archive-item:not([hidden])').count(),9);
for(const slug of ['sawaraban-1','sawaraban-2','zine-fes-2026','seishin-2026','building-1','building-2','building-3','money-2026','sawaraban-3']){
 await p.goto(base+slug+'.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.body.dataset.titleFontState==='arimo');const detail=await read();assert(Math.abs(detail.rect.height-initial.rect.height)<1);assert(Math.abs(detail.rect.x-initial.rect.x)<1);assert(Math.abs(detail.rect.y-initial.rect.y)<1);assert.equal(await p.locator('.archive-work-info h1').count(),1);
 const expected={'sawaraban-1':2,'sawaraban-2':2,'zine-fes-2026':5,'seishin-2026':5};
 if(expected[slug])assert.equal(await p.locator('.archive-work-images img').count(),expected[slug]);
 if(['paper','event'].includes(await p.locator('body').getAttribute('data-archive-category')))assert.equal(await p.locator('.archive-related').count(),0);
 assert.equal(await p.locator('.archive-description').count(),0);
 assert(await p.locator('img').evaluateAll(es=>es.every(e=>new URL(e.src).pathname.endsWith('.webp'))));

 if(slug.startsWith('sawaraban')){assert.equal(await p.locator('.archive-related').count(),0);assert((await p.title()).includes('SAWARABAN no.'));}
 if(slug==='zine-fes-2026'){await p.evaluate(()=>document.fonts.load('700 15px "Noto Sans JP"','長田'));const fonts=await renderedFonts('.archive-work-info h1');assert(fonts.some(f=>f.familyName.includes('Noto Sans JP')&&f.isCustomFont));results.push({viewport,japaneseFonts:fonts});}

 for(const img of await p.locator('.archive-work-images img').all())await img.evaluate(e=>e.decode());
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(['sawaraban-1','sawaraban-2','zine-fes-2026','seishin-2026'].includes(slug))await p.screenshot({path:out+viewport.width+'-'+slug+'.png',fullPage:true});
}
await p.locator('.archive-category-nav [data-category="paper"]').click();await p.waitForURL('**/index.html?category=paper');assert.equal(await p.locator('.archive-item:not([hidden])').count(),3);await p.locator('.archive-home-title').click();assert.equal(await p.locator('.archive-item:not([hidden])').count(),9);
results.push({viewport,title:initial,titleFonts,navBoxes,lineBox,allNineDetails:true,categories:true,flash:true});await p.close();
}
const context=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const p=await context.newPage();await p.goto('http://127.0.0.1:4173/archives/',{waitUntil:'domcontentloaded'});await p.locator('.archive-category-nav [data-category="paper"]').tap();assert.equal(await p.locator('.archive-item:not([hidden])').count(),3);await p.locator('.archive-home-title').tap();await p.waitForFunction(()=>document.querySelectorAll('.archive-item:not([hidden])').length===9);const card=p.locator('[data-archive-id="sawaraban-1"] .archive-work');await card.tap();assert(await card.evaluate(e=>e.classList.contains('is-revealed')));await card.tap();await p.waitForURL('**/sawaraban-1.html');await p.locator('.archive-category-nav [data-category="event"]').tap();await p.waitForURL('**/index.html?category=event');await p.waitForFunction(()=>document.querySelectorAll('.archive-item:not([hidden])').length===2);await context.close();
const prose=await b.newPage({viewport:{width:390,height:844}});
for(const count of [150,300]){
 await prose.route('**/assets/js/archive-data.js',async route=>{const response=await route.fetch();const body=(await response.text()).replaceAll("description:''",`description:'${'検証用文章'.repeat(60).slice(0,count)}'`);await route.fulfill({response,body});});
 await prose.goto('http://127.0.0.1:4173/archives/zine-fes-2026.html',{waitUntil:'domcontentloaded'});const paragraph=prose.locator('.archive-description');assert.equal((await paragraph.textContent()).length,count);assert(await paragraph.evaluate(e=>e.scrollWidth<=e.clientWidth));assert.equal(await paragraph.evaluate(e=>getComputedStyle(e).lineHeight),'22.4px');await prose.unrouteAll();
}await prose.close();
assert.deepEqual(errors,[]);fs.writeFileSync(out+'results.json',JSON.stringify({passed:true,results,touchNavigation:true,reducedMotion:true,errors},null,2));console.log('PASS front/back, 5 photos per event, WebP, empty and 150/300-char descriptions, shared rails and touch');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
