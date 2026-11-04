const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'../diagnostics/section-review');
const data=JSON.parse(fs.readFileSync(path.join(root,'section-candidates.json'),'utf8'));
const img=name=>'data:image/png;base64,'+fs.readFileSync(path.join(root,name)).toString('base64');
const base=img('plan-base.png');
const p=point=>[40+point[0]*.7,140+point[1]*.7];
const a=data.candidates.A.screen_line.map(p),b=data.candidates.B.screen_line.map(p);
const oldX=a[0][0]-data.old_web_section.offset_to_A_m*(1600/26)*.7;
const line=(points,color,dash='')=>`<line x1="${points[0][0]}" y1="${points[0][1]}" x2="${points[1][0]}" y2="${points[1][1]}" stroke="${color}" stroke-width="3" stroke-dasharray="${dash}"/>`;
const plan=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1370" viewBox="0 0 1200 1370">
<rect width="1200" height="1370" fill="#f2f1eb"/>
<g font-family="Arial,sans-serif" fill="#222"><text x="40" y="55" font-size="27">SAWARA BUILDING / SECTION PLANE REVIEW</text><text x="40" y="90" font-size="16">PLAN AT Z +7.60m · SOURCE GEOMETRY UNCHANGED · +X RIGHT / +Y UP</text>
<image href="${base}" x="40" y="140" width="1120" height="980"/>
${line([[oldX,a[0][1]],[oldX,a[1][1]]],'#74726e','8 7')}${line(a,'#b74636')}${line(b,'#216f8b','12 8')}
<text x="${a[1][0]+12}" y="${a[1][1]+10}" font-size="24" fill="#b74636">A</text>
<text x="${b[1][0]-15}" y="${b[1][1]-15}" font-size="24" fill="#216f8b">B</text>
<text x="40" y="1180" font-size="20" fill="#b74636">A — EXISTING RHINO SECTION PLANE / X = ${data.source_plane.original_mm.toFixed(3)} mm</text>
<text x="40" y="1220" font-size="18" fill="#216f8b">B — ORTHOGONAL ALTERNATIVE / NOT CONFIRMED BY REFERENCE IMAGE</text>
<text x="40" y="1260" font-size="17" fill="#74726e">GRAY DASH — CURRENT WEB CUT / A IS ${data.old_web_section.offset_to_A_m.toFixed(3)} m AWAY</text>
<text x="40" y="1310" font-size="17">A1: FROM -X (LEFT) / A2: FROM +X (RIGHT) · B1: FROM -Y / B2: FROM +Y</text></g></svg>`;
const panels=[['A1','A / FROM -X'],['A2','A / FROM +X'],['B1','B / FROM -Y'],['B2','B / FROM +Y']];
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1650"><rect width="1600" height="1650" fill="#24272a"/><g font-family="Arial,sans-serif" fill="#eee"><text x="30" y="45" font-size="24">SECTION CANDIDATES / SHAPE REVIEW ONLY</text><text x="30" y="80" font-size="15">A: EXISTING RHINO PLANE · B: ORTHOGONAL ALTERNATIVE · VIEWING SIDE TO BE CONFIRMED</text>${panels.map(([id,title],i)=>{const x=(i%2)*800,y=115+Math.floor(i/2)*755;return `<text x="${x+24}" y="${y+25}" font-size="23">${id} — ${title}</text><image href="${img(id+'-candidate.png')}" x="${x}" y="${y+40}" width="800" height="700"/>`;}).join('')}</g></svg>`;
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    for(const [name,svg,w,h] of [['plan-with-candidates',plan,1200,1370],['candidate-sections',sheet,1600,1650]]){
      fs.writeFileSync(path.join(root,name+'.svg'),svg);
      const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
      await page.setContent(`<html><head><meta charset="utf-8"></head><body style="margin:0">${svg}</body></html>`);
      await page.screenshot({path:path.join(root,name+'.png')});await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
