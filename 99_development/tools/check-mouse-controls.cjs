const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const errors=[];
  try{
    const page=await browser.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    page.on('pageerror',error=>errors.push(error.message));
    const load=async()=>{
      await page.goto('http://127.0.0.1:4173/');
      await page.waitForFunction(()=>window.Sawara?.viewer?.ready,null,{timeout:90000});
    };
    const position=()=>page.evaluate(()=>Sawara.viewer.camera.position.toArray());
    const mode=()=>page.evaluate(()=>Sawara.viewer.getMode());
    const drag=async(button,back=false)=>{
      await page.mouse.move(680,380);await page.mouse.down({button});
      await page.mouse.move(780,430,{steps:10});
      if(back)await page.mouse.move(680,380,{steps:10});
      await page.mouse.up({button});await page.waitForTimeout(1200);
      assert.equal(await mode(),'exterior','Dragging must not activate the section');
    };
    const outcomes=[];
    for(const button of ['left','right']){
      await load();const before=await position();await drag(button);
      const after=await position();assert.notDeepEqual(after,before,`${button} drag rotates`);
      outcomes.push(after);
    }
    assert(outcomes[0].every((value,i)=>Math.abs(value-outcomes[1][i])<0.1),'Left and right rotation match');
    await drag('left',true);
    // A displacement just above the threshold must suppress activation, too.
    await page.mouse.move(680,380);await page.mouse.down();await page.mouse.move(686,380);await page.mouse.up();
    assert.equal(await mode(),'exterior');
    const distance=()=>page.evaluate(()=>Sawara.viewer.camera.position.length());
    const beforeZoom=await distance();await page.mouse.wheel(0,-160);await page.waitForTimeout(400);
    assert(await distance()<beforeZoom,'Wheel zoom works');
    for(const [movement,hold] of [[0,0],[3,0],[0,650]]){
      await load();await page.mouse.move(680,380);await page.mouse.down();
      if(hold)await page.waitForTimeout(hold);
      await page.mouse.move(680+movement,380);await page.mouse.up();
      await page.waitForFunction(()=>!Sawara.viewer.isTransitioning());
      assert.equal(await mode(),'guide',`Click with ${movement}px movement and ${hold}ms hold`);
    }
    await page.emulateMedia({reducedMotion:'no-preference'});await load();
    const beforeAuto=await position();await page.waitForTimeout(250);assert.notDeepEqual(await position(),beforeAuto);
    await drag('left');const afterDrag=await position();await page.waitForTimeout(300);
    assert.notDeepEqual(await position(),afterDrag,'Automatic rotation resumes after manual interaction');
    assert.deepEqual(errors,[]);
    console.log('PASS: left/right rotation, matching response, drag return, 5px threshold, click, slight movement, stationary hold, wheel zoom, automatic rotation, no browser errors');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
