const {chromium}=require('playwright-core'),fs=require('fs'),assert=require('node:assert/strict');
const out='99_development/diagnostics/contents-right/',root='http://127.0.0.1:4173/';
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[],errors=[];try{
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[390,844],[375,667]]){
 console.log('Checking',width,height);const p=await browser.newPage({viewport:{width,height}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(root);await p.waitForFunction(()=>Sawara.viewer?.ready,null,{timeout:90000});
 const read=()=>p.evaluate(()=>{const b=document.querySelector('#guide-button'),m=document.querySelector('.exterior-message');const style=e=>{const s=getComputedStyle(e);return [s.fontSize,s.fontFamily,s.fontWeight,s.color,s.borderBottomWidth]};return {button:style(b),message:style(m),b:b.getBoundingClientRect().toJSON(),m:m.getBoundingClientRect().toJSON(),scroll:document.documentElement.scrollHeight};});
 const current=await read();assert(current.b.left>width*.6);assert(Math.abs(current.b.right-current.m.right)<1);assert(current.m.bottom+12<=current.b.top);if(width>700)assert(current.scroll<=height);
 // Compare typography against the exact stylesheet saved before this change.
 await p.evaluate(css=>{document.querySelector('link[href="90_shared/css/style.css"]').disabled=true;const s=document.createElement('style');s.id='before-css';s.textContent=css;document.head.append(s);},fs.readFileSync('.local-backups/contents-right/style.css','utf8'));
 const before=await read();assert.deepEqual(current.button,before.button);assert.deepEqual(current.message,before.message);
 await p.evaluate(()=>{document.getElementById('before-css').remove();document.querySelector('link[href="90_shared/css/style.css"]').disabled=false;});
 await p.screenshot({path:out+width+'-exterior.png'});
 const camera=await p.evaluate(()=>Sawara.viewer.camera.position.toArray());await p.waitForTimeout(200);assert.notDeepEqual(await p.evaluate(()=>Sawara.viewer.camera.position.toArray()),camera);
 await p.mouse.move(width*.5,height*.4);const distance=await p.evaluate(()=>Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}));await p.mouse.wheel(0,-100);await p.waitForTimeout(120);assert(await p.evaluate(()=>Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}))<distance);
 await p.mouse.down({button:'right'});await p.mouse.move(width*.55,height*.45,{steps:4});await p.mouse.up({button:'right'});assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'exterior');
 await p.locator('#guide-button').click();await p.waitForFunction(()=>!Sawara.viewer.isTransitioning());assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'guide');assert(!await p.locator('.view-controls').isVisible());assert(await p.locator('#archives').isVisible());
 const guide=await p.locator('#archives').boundingBox();await p.evaluate(css=>{document.querySelector('link[href="90_shared/css/style.css"]').disabled=true;const s=document.createElement('style');s.textContent=css;document.head.append(s);},fs.readFileSync('.local-backups/contents-right/style.css','utf8'));assert.deepEqual(await p.locator('#archives').boundingBox(),guide);
 results.push({width,height,typographyUnchanged:true,rightAligned:true,gap:current.b.top-current.m.bottom,guideUnchanged:true});await p.close();
}assert.deepEqual(errors,[]);fs.writeFileSync(out+'results.json',JSON.stringify({passed:true,results,errors},null,2));console.log('PASS');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
