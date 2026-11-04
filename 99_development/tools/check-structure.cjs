const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('C:/sawara_building/sawara_building.github.io/node_modules/playwright-core'));}
const cats={paper:'01_freepaper',architecture:'02_architecture',event:'03_exhibition',money:'04_money',magazine:'05_magazine'};
const expected={paper:3,architecture:3,event:2,money:1,magazine:1};
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf','.glb':'model/gltf-binary'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');let name=decodeURIComponent(u.pathname);if(name.startsWith('/preview/'))name=name.slice(8);if(name.endsWith('/'))name+='index.html';
 const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||name.split('/').some(x=>x.startsWith('.'))){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)){res.writeHead(404).end(name);return;}if(fs.statSync(file).isDirectory()){res.writeHead(301,{Location:u.pathname+'/'+u.search}).end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
const out=process.env.SAWARA_CHECK_OUTPUT||path.join(root,'99_development/diagnostics/structure');
const results=[],errors=[];let passed=false;
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function staticCheck(){
 let count=0;
 for(const file of [path.join(root,'index.html'),...['01_about','02_cafe','03_archives'].flatMap(d=>walk(path.join(root,d)).filter(f=>f.endsWith('.html'))) ]){
  assert.equal(path.basename(file),'index.html');const s=fs.readFileSync(file,'utf8');
  for(const m of s.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
   if(/^(?:[a-z]+:|\/\/|#)/i.test(m[1]))continue;
   const u=new URL(m[1],'http://local/'+path.relative(root,file).replaceAll('\\','/'));let f=path.join(root,u.pathname);if(u.pathname.endsWith('/'))f=path.join(f,'index.html');assert(fs.existsSync(f),`${file}: ${m[1]}`);count++;
  }
 }
 results.push({check:'static HTML references',count});
}
(async()=>{
 staticCheck();fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',acceptDownloads:true});
 p.setDefaultTimeout(20000);p.setDefaultNavigationTimeout(30000);
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const goto=async u=>{await p.goto(base+u,{waitUntil:'networkidle'});};
 await goto('03_archives/');await p.waitForSelector('.archive-category-nav');assert.equal(await p.locator('.archive-item').count(),10);
 const data=await p.evaluate(async()=>{const d=await import('../03_archives/data.js');return {items:d.ARCHIVE_ITEMS,categories:d.CATEGORY_URLS};});
 for(const item of data.items){assert(item.url.startsWith(base+'03_archives/'));for(const url of [item.cover?.url,...(item.images||[]).map(i=>i.url),...(item.randomImages?.candidates||[]).map(i=>i.url),...(item.freePaper?.pdfs||[])].filter(Boolean)){const r=await fetch(url,{method:'HEAD'});assert.equal(r.status,200,url);}}
 await p.screenshot({path:path.join(out,'1440-archives.png'),fullPage:true});results.push({check:'archive entries and all image/PDF references',count:data.items.length});
 for(const [cat,dir] of Object.entries(cats)){
  await goto(`03_archives/${dir}/`);await p.waitForSelector('.archive-category-nav');assert.equal(await p.locator('.archive-item:visible').count(),expected[cat],cat);
  assert.equal(await p.locator('.archive-category-nav a[aria-current]').getAttribute('data-category'),cat);
 }
 // Category navigation is full directory navigation, not a query-only filter.
 await p.locator('.archive-category-nav a[data-category="paper"]').click();await p.waitForURL('**/03_archives/01_freepaper/');assert.equal(await p.locator('.archive-item:visible').count(),3);
 await p.locator('.archive-home-title').click();await p.waitForURL('**/03_archives/');assert.equal(await p.locator('.archive-item:visible').count(),10);
 results.push({check:'five category pages and navigation',count:5});
 for(const item of data.items){await p.goto(item.url,{waitUntil:'networkidle'});await p.waitForSelector('.archive-work-info h1');assert.equal(await p.locator('.archive-work-info h1').textContent(),item.hoverTitle||item.title);assert.equal(new URL(await p.locator('.archive-home-title').getAttribute('href')).pathname,'/03_archives/');for(const im of await p.locator('.archive-work-images img').all()){await im.scrollIntoViewIfNeeded();await p.waitForFunction(img=>img.complete&&img.naturalWidth>0,await im.elementHandle());}}
 results.push({check:'all detail pages and loaded images',count:10});
 const paper=data.items.find(i=>i.id==='sawaraban-2');await p.goto(paper.url);await p.evaluate(()=>localStorage.removeItem('sawara:freepaper:downloaded:2'));await p.reload();const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'DOWNLOAD',exact:true}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'SAWARABAN_no02.pdf');assert.equal(await download.failure(),null);assert(await p.getByRole('button',{name:'DOWNLOADED',exact:true}).isDisabled());results.push({check:'PDF download and existing once-only behavior'});
 await goto('01_about/');await p.waitForSelector('#activity-images img');assert.equal(await p.locator('#activity-images img').count(),9);await p.screenshot({path:path.join(out,'1440-about.png'),fullPage:true});
 await goto('02_cafe/');await p.waitForSelector('.background-photo,.background-item,.background-collage img');await p.locator('#cafe-menu').click();await p.waitForSelector('#cafe-panel h1');assert.equal(await p.locator('#cafe-panel h1').textContent(),'MENU');
 results.push({check:'ABOUT images and cafe menu'});
 for(const item of data.items){const old=item.id==='magazine-1'?'archives/work.html?id=magazine-1':`archives/${item.id}.html`;await goto(old);assert.equal(p.url(),item.url);}
 for(const [old,dest] of [['about/','01_about/'],['cafe/','02_cafe/'],['archives/','03_archives/'],['archives.html','03_archives/'],['floors.html','']]){await goto(old);assert.equal(new URL(p.url()).pathname,new URL(dest,base).pathname);}
 await goto('archives/?category=paper#top');assert.equal(new URL(p.url()).search,'?category=paper');assert.equal(new URL(p.url()).hash,'#top');assert.equal(await p.locator('.archive-item:visible').count(),3);results.push({check:'legacy redirects, query and hash',count:16});
 await goto('');await p.waitForFunction(()=>window.Sawara?.viewer?.ready,null,{timeout:90000});await p.screenshot({path:path.join(out,'1440-top.png')});await p.locator('#guide-button').click();await p.waitForFunction(()=>!Sawara.viewer.isTransitioning());assert(await p.locator('#directory').isVisible());await p.screenshot({path:path.join(out,'1440-contents.png')});assert.equal(await p.locator('[data-tenant-id="cafe"]').getAttribute('href'),'./02_cafe/');results.push({check:'3D exterior, contents and cafe destination'});
 await p.setViewportSize({width:390,height:844});await goto('03_archives/01_freepaper/');await p.screenshot({path:path.join(out,'390-freepaper.png'),fullPage:true});await p.goto(paper.url);await p.waitForSelector('.archive-work-info h1');await p.screenshot({path:path.join(out,'390-detail.png'),fullPage:true});
 await goto('preview/03_archives/');await p.waitForSelector('.archive-category-nav');assert.equal(await p.locator('.archive-item').count(),10);await p.locator('.archive-category-nav a[data-category="paper"]').click();await p.waitForURL('**/preview/03_archives/01_freepaper/');assert.equal(await p.locator('.archive-item:visible').count(),3);await p.locator('.archive-item:not([hidden]) .archive-work').first().click();await p.waitForSelector('.archive-work-info h1');assert(new URL(p.url()).pathname.startsWith('/preview/03_archives/'));results.push({check:'mobile layout and subdirectory hosting'});
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});touch.setDefaultTimeout(20000);touch.on('pageerror',e=>errors.push(e.message));await touch.goto(base+'03_archives/01_freepaper/');const card=touch.locator('.archive-item:not([hidden]) .archive-work').first();await card.tap();assert(new URL(touch.url()).pathname.endsWith('/01_freepaper/'));await card.tap();await touch.waitForSelector('.archive-work-info h1');await touch.close();results.push({check:'touch preview and second-tap navigation'});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,results,errors},null,2));passed=true;console.log(JSON.stringify({passed:true,results,out},null,2));
 }finally{
  // Bound teardown even if a software-rendered WebGL process stalls on shutdown.
  const deadline=setTimeout(()=>process.exit(passed?0:1),10000);deadline.unref();
  server.closeAllConnections();server.close();await browser.close();
 }
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
