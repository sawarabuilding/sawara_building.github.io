const {chromium}=require('playwright-core'),fs=require('fs'),assert=require('node:assert/strict');
const out='99_development/diagnostics/archives-media/';
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[],errors=[];try{
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[820,1180],[390,844],[375,667],[844,390]]){
 const p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173/archives/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.body.dataset.titleFontState==='archivo-black');
 const title=await p.locator('.archive-home-title').evaluate(e=>({rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform,font:getComputedStyle(e).fontFamily}));
 assert.equal(title.transform,'matrix(0, -1, 1, 0, 0, 0)');assert(title.rect.height/height>.85&&title.rect.height/height<.9);assert(Math.abs(title.rect.y+title.rect.height/2-height/2)<1);assert(title.rect.x>=20);
 assert.equal(await p.locator('.archive-work').count(),9);assert.equal(await p.locator('.has-image img').count(),4);
 for(const img of await p.locator('.has-image img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}
 assert(await p.locator('.archive-work-overlay').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='0')));
 const logo=await p.locator('.archive-building-logo img').boundingBox();assert.equal(logo.y,width<701?29:43);
 await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);
 if(width===1440||width===390)await p.screenshot({path:out+`${width}-normal.png`,fullPage:true});
 const cover=p.locator('[data-archive-id="sawaraban-1"] .archive-work');await cover.hover();await p.waitForTimeout(350);assert.equal(await cover.locator('.archive-work-overlay').evaluate(e=>getComputedStyle(e).opacity),'1');
 assert.equal(await p.locator('.archive-work-overlay').evaluateAll(es=>es.filter(e=>getComputedStyle(e).opacity==='1').length),1);
 if(width===1440)await p.screenshot({path:out+'1440-hover.png'});
 await p.mouse.move(width-1,1);await p.evaluate(()=>scrollTo(0,600));await p.waitForTimeout(400);const fixed=await p.locator('.archive-home-title').boundingBox();assert(Math.abs(fixed.y-title.rect.y)<1);await p.locator('.archive-home-title').click();await p.waitForFunction(()=>scrollY<1);
 const blank=p.locator('[data-archive-id="building-1"] .archive-work');await p.keyboard.press('Tab');await blank.focus();await p.waitForTimeout(350);assert.equal(await blank.locator('.archive-work-overlay').evaluate(e=>getComputedStyle(e).opacity),'1');
 results.push({width,height,title,logo,imagesLoaded:4,hoverAndFocus:true,fixedAndTopLink:true});await p.close();
}
const context=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await context.newPage();await p.goto('http://127.0.0.1:4173/archives/',{waitUntil:'domcontentloaded'});const card=p.locator('[data-archive-id="sawaraban-1"] .archive-work');await card.tap();await p.waitForTimeout(350);assert(p.url().endsWith('/archives/'));assert(await card.evaluate(e=>e.classList.contains('is-revealed')));await p.screenshot({path:out+'390-tap.png'});await card.tap();await p.waitForURL('**/sawaraban-1.html');await p.locator('.archive-building-logo').click();await p.waitForURL('**/index.html');await context.close();
assert.deepEqual(errors,[]);fs.writeFileSync(out+'browser-results.json',JSON.stringify({passed:true,results,mobileFirstTapRevealsSecondTapNavigates:true,logoReturnsHome:true,errors},null,2));console.log('PASS: 7 viewport sizes, 4 images, hover/focus, fixed title, top link, mobile two-tap and logo');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
