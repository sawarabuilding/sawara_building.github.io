const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const out=path.resolve(__dirname,'../diagnostics/revision4'),root='http://127.0.0.1:4173/';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[],errors=[];
 const ready=p=>p.waitForFunction(()=>window.Sawara?.viewer?.ready,null,{timeout:90000});
 const settled=p=>p.waitForFunction(()=>!window.Sawara.viewer.isTransitioning(),null,{timeout:20000});
 const observe=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});};
 try{
 for(const [w,h,mobile] of [[1366,768,false],[1440,900,false],[1920,1080,false],[390,844,true],[375,667,true]]){
  console.log('Checking',w,h);
  const p=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});observe(p);
  await p.goto(root);await ready(p);
  assert(!await p.locator('#directory').isVisible());
  assert.equal(await p.locator('#quality,#material-button,#guide-button span').count(),0);
  assert(!await p.locator('#archives').isVisible());
  assert(await p.locator('.exterior-logo img').isVisible());
  assert.equal(await p.locator('.exterior-logo a').count(),0);
  const ui=await p.locator('#guide-button').evaluate(e=>({weight:getComputedStyle(e).fontWeight,border:getComputedStyle(e).borderBottomWidth}));
  assert.equal(ui.weight,'700');assert.equal(ui.border,'0px');
  assert.equal(await p.locator('.exterior-message').innerText(),'友だちに\nならないか');
  assert.equal(await p.evaluate(()=>Sawara.viewer.renderer.getPixelRatio()),mobile?1:1);
  await p.locator('.exterior-logo').click();assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'exterior');
  await p.locator('.exterior-message').click();assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'exterior');assert.equal(await p.locator('#rotate-button,.legacy-floor-link').count(),0);
  assert.match(await p.locator('#guide-button').innerText(),/CONTENTS/);
  const before=await p.evaluate(()=>Sawara.viewer.camera.position.toArray());await p.waitForTimeout(250);
  assert.notDeepEqual(await p.evaluate(()=>Sawara.viewer.camera.position.toArray()),before);
  if(!mobile){
   const distance=await p.evaluate(()=>Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}));
   await p.mouse.move(w*.5,h*.5);await p.mouse.wheel(0,-160);await p.waitForTimeout(200);
   assert(await p.evaluate(()=>Sawara.viewer.camera.position.distanceTo({x:0,y:7.5,z:0}))<distance);
   await p.mouse.down({button:'right'});await p.mouse.move(w*.55,h*.55,{steps:5});await p.mouse.up({button:'right'});
   assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'exterior');
  }
  await p.screenshot({path:path.join(out,`${w}-exterior.png`)});
  await p.locator('#guide-button').click();await settled(p);
  assert(!await p.locator('.exterior-logo').isVisible());assert(!await p.locator('.exterior-message').isVisible());
  assert(await p.locator('#archives').isVisible());
  assert(!await p.locator('.view-controls').isVisible());assert.equal(await p.locator('[data-floor-row]:visible').count(),5);
  const floor=await p.evaluate(()=>Sawara.selectedFloorId);await p.mouse.wheel(0,200);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>Sawara.selectedFloorId),floor);
  await p.locator('.floor-label[data-select-floor="3f"]').click();assert.equal(await p.evaluate(()=>Sawara.selectedFloorId),'3f');
  await p.mouse.click(w*.38,h*.5);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'guide','Model clicks must not return');
  await p.mouse.click(w*.9,h*.95);assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'guide','Ground clicks must not return');
  const metrics=await p.evaluate(()=>{
   const v=Sawara.viewer,a=document.querySelector('#archive-heading a'),r=a.getBoundingClientRect(),glass=[];
   v.sectionModel.traverse(o=>{if(o.isMesh)for(const m of [o.material].flat())if(m.name.startsWith('Glass_source'))glass.push([m.color.getHexString(),m.opacity]);});
   return {scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],archive:r.toJSON(),ground:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ground-y')),transform:getComputedStyle(a).transform,glass};
  });
  if(!mobile)assert(metrics.scroll[0]<=w+1&&metrics.scroll[1]<=h+1,'PC must fit viewport');
  assert(metrics.archive.left>=0&&metrics.archive.bottom<=h+1&&metrics.archive.top>=metrics.ground,'Rotated ARCHIVES fits ground');
  assert.match(metrics.transform,/matrix\(0, -1, 1, 0/);
  assert(metrics.glass.length&&metrics.glass.every(([color,alpha])=>color==='afc5d2'&&Math.abs(alpha-.2)<1e-8));
  await p.screenshot({path:path.join(out,`${w}-guide.png`)});
  await p.mouse.click(w*.9,h*.15);await settled(p);assert.equal(await p.evaluate(()=>Sawara.viewer.getMode()),'exterior');
  const returned=await p.evaluate(()=>Sawara.viewer.camera.position.toArray());await p.waitForTimeout(200);assert.notDeepEqual(await p.evaluate(()=>Sawara.viewer.camera.position.toArray()),returned);
  await p.locator('#guide-button').click();await settled(p);
  await p.locator('#archive-heading a').click();await p.waitForURL('**/03_archives/index.html');
  await p.waitForFunction(()=>document.querySelectorAll('.archive-item h2 a').length===9);
  const links=await p.locator('.archive-item h2 a').evaluateAll(es=>es.map(e=>({href:e.href,title:e.textContent})));
  await p.screenshot({path:path.join(out,`${w}-archives.png`),fullPage:true});
  for(const link of (w===1366?links:links.slice(0,1))){
   await p.goto(link.href);await p.waitForFunction(()=>document.querySelector('.archive-building-logo img')?.complete);
   assert.equal(await p.locator('h1').innerText(),link.title);assert.equal(await p.locator('.detail-media,.detail-description,.detail-downloads').count(),3);
   assert(await p.locator('.archive-building-logo img').evaluate(img=>img.naturalWidth>0));
   assert(await p.evaluate(width=>document.documentElement.scrollWidth<=width+1,w));
   if(link===links[0])await p.screenshot({path:path.join(out,`${w}-detail.png`),fullPage:true});
   await p.locator('.archive-home-title').click();await p.waitForURL('**/03_archives/index.html');
  }
  await p.locator('.archive-building-logo').click();await p.waitForURL(root+'index.html');
  results.push({viewport:[w,h],mobile,checks:'Exterior, zoom/orbit, CONTENTS, direct floors, no wheel floors, model/ground exclusion, sky return, rotation resume, archives, official logo, detail navigation',metrics});
  await p.close();
 }
 const hashes=JSON.parse(fs.readFileSync(path.join(__dirname,'../diagnostics/archives-revision/model-hashes.json'),'utf8'));
 for(const [file,expected] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../../90_shared/models',file))).digest('hex'),expected);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,results,errors,modelsUnchanged:true},null,2));
 console.log('PASS: all sizes, 9 detail pages, navigation and model hashes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

