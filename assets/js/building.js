import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {MODEL} from './model-config.js';
import {LAYOUT} from './scene-layout.js';
import {enableTapNavigation} from './tap-link.js';

const app=window.Sawara,stage=document.getElementById('stage'),hero=document.getElementById('hero');
const status=document.getElementById('load-status'),guideButton=document.getElementById('guide-button');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
enableTapNavigation(document.querySelector('#archive-heading a'));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(22,1,.1,500);
const target=new THREE.Vector3(...MODEL.target),up=new THREE.Vector3(0,1,0);
const cutPlane=new THREE.Plane(new THREE.Vector3(0,0,-1),20);
const lower=new THREE.Plane(up.clone(),-.1),upper=new THREE.Plane(new THREE.Vector3(0,-1,0),2.83);
const clock=new THREE.Clock(),raycaster=new THREE.Raycaster(),meshStates=new WeakMap();
let renderer,controls,model,sectionModel,overlay,tween,mode='exterior',mix=0;
let shapeView=false,autoRotate=!reduced.matches,interacting=false,savedExterior;
let radius=MODEL.radius,ready=false,baseDistance=80,guideDistance=80;
document.documentElement.style.setProperty('--archive-left',LAYOUT.archiveLeft);
document.documentElement.style.setProperty('--archive-title-size',LAYOUT.archiveTitleSize);
guideButton.disabled=true;
const announce=text=>{status.textContent=text;};

function frame(){
  const vertical=THREE.MathUtils.degToRad(camera.fov/2),horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
  baseDistance=(radius+.6)/Math.sin(Math.min(vertical,horizontal))*(innerWidth<700?1.01:1.18);
  const widthFraction=innerWidth<700&&innerHeight<740?.62:LAYOUT.mobileModelWidthFraction;
  const height=Math.max(LAYOUT.guideFrameHeight,15/(widthFraction*camera.aspect));
  guideDistance=height/(2*Math.tan(vertical));
  controls.minDistance=baseDistance*.72;controls.maxDistance=baseDistance*1.65;
}
function projection(){
  const w=stage.clientWidth,h=stage.clientHeight;
  camera.setViewOffset(w,h,w*LAYOUT.guideHorizontalOffset*mix,0,w,h);
  camera.updateProjectionMatrix();
}
function resize(){
  if(!renderer||!stage.clientHeight)return;
  camera.aspect=stage.clientWidth/stage.clientHeight;
  renderer.setSize(stage.clientWidth,stage.clientHeight,false);frame();projection();
  if(tween)tween.toLength=mode==='guide'?guideDistance:Math.max(baseDistance,tween.toLength);
  if(!tween){
    if(mode==='guide')camera.position.copy(target).add(new THREE.Vector3(0,0,guideDistance));
    else camera.position.copy(target).add(new THREE.Vector3(...MODEL.exteriorDirection).normalize().multiplyScalar(baseDistance));
    camera.lookAt(target);controls.target.copy(target);
    if(mode==='exterior')controls.update();
  }
}
function screen(point){
  camera.updateMatrixWorld();const p=point.clone().project(camera);
  return {x:(p.x+1)*stage.clientWidth/2,y:(1-p.y)*stage.clientHeight/2};
}
function layout(){
  if(mix<=0)return;
  const ground=screen(new THREE.Vector3(0,MODEL.groundY,MODEL.sectionZ));
  hero.style.setProperty('--ground-y',`${ground.y}px`);
  document.documentElement.style.setProperty('--ground-y',`${ground.y}px`);
  for(const floor of app.floors.filter(f=>f.zone==='building')){
    const labelOffset=innerWidth<700?LAYOUT.mobileLabelOffsetMeters:LAYOUT.labelOffsetMeters;
    const p=screen(new THREE.Vector3(8.1,floor.elevation+labelOffset,MODEL.sectionZ));
    const row=document.querySelector(`[data-floor-row="${floor.id}"]`);
    row.style.setProperty('--floor-y',`${p.y}px`);
    row.style.setProperty('--floor-x',`${Math.min(p.x,innerWidth-(innerWidth<700?90:265))}px`);
  }
}
function configureMaterials(root){
  root.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const originals=[mesh.material].flat();
    for(const mat of originals){
      mat.userData.baseOpacity=mat.opacity;mat.userData.baseTransparent=mat.transparent;
      mat.userData.baseDepthWrite=mat.depthWrite;
      if(mat.name.startsWith('Glass_source')){
        mat.transparent=true;mat.opacity=.20;mat.depthWrite=false;mat.alphaTest=0;
        mat.color.set('#AFC5D2');mat.transmission=0;mat.forceSinglePass=true;
        mat.userData.baseOpacity=.20;mat.userData.baseTransparent=true;mat.userData.baseDepthWrite=false;
      }
    }
    const shapes=originals.map(mat=>{
      if(mat.name==='Section_cut_charcoal')return mat;
      const shape=new THREE.MeshStandardMaterial({color:0xa4a7aa,roughness:.95,side:THREE.DoubleSide});
      if(mat.name.startsWith('Glass_source')){shape.color.set('#AFC5D2');shape.transparent=true;shape.opacity=.20;shape.depthWrite=false;shape.forceSinglePass=true;}
      shape.userData={baseOpacity:shape.opacity,baseTransparent:shape.transparent,baseDepthWrite:shape.depthWrite};
      return shape;
    });
    meshStates.set(mesh,{original:Array.isArray(mesh.material)?originals:originals[0],shape:Array.isArray(mesh.material)?shapes:shapes[0]});
  });
}
function eachMaterial(root,callback){
  const seen=new Set();root?.traverse(mesh=>{if(mesh.isMesh)for(const mat of [mesh.material].flat())if(!seen.has(mat)){seen.add(mat);callback(mat);}});
}
function appearance(){
  for(const root of [model,sectionModel])root?.traverse(mesh=>{
    if(mesh.isMesh){const state=meshStates.get(mesh);mesh.material=shapeView?state.shape:state.original;}
  });
  visualMix();
}
function visualMix(){
  document.documentElement.style.setProperty('--guide-mix',mix.toFixed(4));
  const ink=new THREE.Color('#e5e2d9').lerp(new THREE.Color('#293540'),mix);
  hero.style.setProperty('--hero-ink',`#${ink.getHexString()}`);
  const weights=[1-mix,mix];
  [model,sectionModel].forEach((root,i)=>{
    if(!root)return;const weight=weights[i];root.visible=weight>.001;
    eachMaterial(root,mat=>{
      const fading=weight>0&&weight<.999;
      const transparent=fading||mat.userData.baseTransparent;
      if(mat.transparent!==transparent){mat.transparent=transparent;mat.needsUpdate=true;}
      mat.opacity=mat.userData.baseOpacity*weight;
      mat.depthWrite=!fading&&mat.userData.baseDepthWrite;
      if(root===model){
        const clips=mix>0?[cutPlane]:[];
        if(mat.clippingPlanes?.length!==clips.length){mat.clippingPlanes=clips;mat.needsUpdate=true;}
      }
    });
  });
  cutPlane.constant=THREE.MathUtils.lerp(14,MODEL.sectionZ,THREE.MathUtils.smoothstep(mix,.15,.95));
  if(overlay)overlay.visible=mix>.999&&app.floors.find(f=>f.id===app.selectedFloorId)?.zone==='building';
}
function selectFloor(floor){
  if(floor.modelRange){lower.constant=-floor.modelRange[0];upper.constant=floor.modelRange[1];}
  if(overlay)overlay.visible=mode==='guide'&&!tween&&floor.zone==='building';
}
function changeMode(next,requestedFloor){
  if(tween||next===mode)return;
  if(!ready){announce('断面模型を準備しています。少しお待ちください。');return;}
  if(next==='guide'){
    savedExterior=camera.position.clone();autoRotate=false;
    app.selectFloor('1f');
    window.scrollTo({top:0,behavior:'instant'});
  }
  const from=camera.position.clone().sub(target),to=next==='guide'?new THREE.Vector3(0,0,guideDistance):(savedExterior?.clone().sub(target)||new THREE.Vector3(...MODEL.exteriorDirection).normalize().multiplyScalar(baseDistance));
  const fromDirection=from.clone().normalize(),toDirection=to.clone().normalize();
  tween={start:performance.now(),duration:reduced.matches?0:MODEL.transitionSeconds*1000,
    fromDirection,rotation:new THREE.Quaternion().setFromUnitVectors(fromDirection,toDirection),
    fromLength:from.length(),toLength:to.length(),fromMix:mix,toMix:next==='guide'?1:0,requestedFloor};
  mode=next;document.body.dataset.mode=mode;document.getElementById('sky').tabIndex=mode==='guide'?0:-1;controls.enabled=false;overlay.visible=false;
  guideButton.setAttribute('aria-pressed',String(mode==='guide'));

}
guideButton.addEventListener('click',()=>changeMode('guide'));
document.getElementById('sky').addEventListener('keydown',event=>{if(mode==='guide'&&['Enter',' '].includes(event.key)){event.preventDefault();changeMode('exterior');}});
document.addEventListener('requestguide',event=>changeMode('guide',event.detail?.floorId));
document.addEventListener('floorchange',event=>selectFloor(event.detail.floor));
reduced.addEventListener('change',()=>{if(reduced.matches){autoRotate=false;if(tween)tween.duration=0;}});

try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0,0);
  // Fixed standard quality; retain the existing mobile pixel-ratio cap.
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:MODEL.pixelRatio.standard));
  renderer.localClippingEnabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  const canvas=renderer.domElement;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','鰆ビルヂングの操作できる建築模型');stage.append(canvas);
  controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableDamping=true;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
  controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_ROTATE};
  controls.target.copy(target);controls.addEventListener('start',()=>{interacting=true;});controls.addEventListener('end',()=>{interacting=false;});
  scene.add(new THREE.HemisphereLight(0xf2f1ed,0x596475,2));
  for(const [position,color,intensity] of [[[-20,30,15],0xffefdb,2.9],[[15,22,-18],0xdce8f5,2],[[0,12,25],0xffffff,1.4]]){
    const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);
  }
  let down;const pointers=new Set();
  canvas.addEventListener('pointerdown',event=>{
    pointers.add(event.pointerId);if(pointers.size>1){down=null;return;}
    down={x:event.clientX,y:event.clientY,pointerId:event.pointerId,button:event.button,moved:false,touch:event.pointerType==='touch'};
  });
  // Keep a drag classified as a drag even if it returns to its starting point.
  const trackDrag=event=>{if(down&&event.pointerId===down.pointerId&&Math.hypot(event.clientX-down.x,event.clientY-down.y)>(down.touch?7:5))down.moved=true;};
  canvas.addEventListener('pointermove',trackDrag);
  canvas.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);down=null;interacting=false;});
  canvas.addEventListener('pointerup',event=>{
    trackDrag(event);
    pointers.delete(event.pointerId);const start=down;down=null;if(!start||tween)return;

    if(start.moved||start.button!==0)return;
    if(mode==='exterior'){changeMode('guide');return;}
    const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);
    const hit=raycaster.intersectObject(sectionModel,true)[0];
    if(!hit){const ground=screen(new THREE.Vector3(0,MODEL.groundY,MODEL.sectionZ));if(event.clientY-rect.top<ground.y)changeMode('exterior');return;}
    const floor=app.floors.find(f=>f.modelRange&&hit.point.y>=f.modelRange[0]&&hit.point.y<f.modelRange[1]);if(floor)app.selectFloor(floor.id);
  });
  canvas.addEventListener('contextmenu',event=>event.preventDefault());
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stage.classList.remove('has-webgl');announce('3D表示を中断しました。フロア案内をご利用ください。');});
  new ResizeObserver(resize).observe(stage);
  const loader=new GLTFLoader();
  loader.load(MODEL.url,gltf=>{
    model=gltf.scene;radius=new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere()).radius;
    configureMaterials(model);
    scene.add(model);resize();appearance();stage.classList.add('has-webgl');
    announce('外観を表示しました。断面模型を準備しています…');
    loader.load(MODEL.sectionUrl,async cut=>{
      sectionModel=cut.scene;configureMaterials(sectionModel);scene.add(sectionModel);
      const highlight=new THREE.MeshBasicMaterial({color:0xc4a676,opacity:.18,transparent:true,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:[lower,upper],polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
      overlay=sectionModel.clone(true);overlay.traverse(mesh=>{if(mesh.isMesh){mesh.material=highlight;mesh.renderOrder=4;}});scene.add(overlay);overlay.visible=false;
      // Prepare the clipping/fade shader variants and texture uploads before the
      // first interaction, so their compilation does not consume the transition.
      overlay.visible=true;
      for(const root of [model,sectionModel]){
        root.visible=true;
        eachMaterial(root,mat=>{
          mat.transparent=true;mat.depthWrite=false;
          if(root===model)mat.clippingPlanes=[cutPlane];
          for(const value of Object.values(mat))if(value?.isTexture)renderer.initTexture(value);
          mat.needsUpdate=true;
        });
      }
      const warmShaders=renderer.compileAsync(scene,camera);
      overlay.visible=false;sectionModel.visible=false;visualMix();
      await warmShaders;
      ready=true;guideButton.disabled=false;appearance();announce('');selectFloor(app.floors.find(f=>f.id===app.selectedFloorId));
      app.viewer={ready:true,getMode:()=>mode,isTransitioning:()=>Boolean(tween),getMix:()=>mix,goToGuide:()=>changeMode('guide'),model,sectionModel,camera,renderer,screen};
    },undefined,error=>{console.error(error);announce('断面模型を読み込めません。外観と下の案内をご利用ください。');});
  },progress=>announce(progress.total?`模型を読み込んでいます ${Math.round(progress.loaded/progress.total*100)}%`:'模型を読み込んでいます…'),error=>{console.error(error);announce('模型を読み込めません。画像と下の案内をご利用ください。');});
  function animate(now){
    requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.1);if(document.hidden)return;
    if(tween){
      const t=tween.duration?Math.min((now-tween.start)/tween.duration,1):1,ease=t*t*(3-2*t);
      const q=new THREE.Quaternion().slerp(tween.rotation,ease);
      const offset=tween.fromDirection.clone().applyQuaternion(q).multiplyScalar(THREE.MathUtils.lerp(tween.fromLength,tween.toLength,ease));
      camera.position.copy(target).add(offset);camera.lookAt(target);mix=THREE.MathUtils.lerp(tween.fromMix,tween.toMix,ease);
      projection();visualMix();
      if(t===1){
        const requested=tween.requestedFloor,durationMs=now-tween.start;tween=null;controls.enabled=mode==='exterior';controls.target.copy(target);
        if(mode==='exterior'){controls.update();autoRotate=!reduced.matches;}
        if(requested)app.selectFloor(requested);else selectFloor(app.floors.find(f=>f.id===app.selectedFloorId));

        document.dispatchEvent(new CustomEvent('modechange',{detail:{mode,durationMs}}));
      }
    }else if(mode==='exterior'){
      if(autoRotate&&!interacting&&model){const offset=camera.position.clone().sub(target).applyAxisAngle(up,MODEL.rotationRadiansPerSecond*delta);camera.position.copy(target).add(offset);}
      controls.update();
    }
    layout();renderer.render(scene,camera);
  }
  requestAnimationFrame(animate);
}catch(error){console.error('3D unavailable',error);announce('この環境では3Dを表示できません。断面画像とフロア案内をご利用ください。');guideButton.disabled=false;
  document.body.classList.add('no-webgl');guideButton.addEventListener('click',()=>{document.body.dataset.mode='guide';document.documentElement.style.setProperty('--guide-mix',1);});}
