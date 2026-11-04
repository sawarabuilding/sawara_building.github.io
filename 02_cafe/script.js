import {SECTIONS,TABLE_ITEMS,BACKGROUND_ITEMS} from './data.js';
import {enableTapNavigation} from '../90_shared/js/tap-link.js';

const body=document.body,nav=document.getElementById('navigation-items');
const home=document.getElementById('cafe-home'),area=document.getElementById('panel-area'),panel=document.getElementById('cafe-panel');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const buttons=new Map();let current=null,sequence=0;
enableTapNavigation(document.querySelector('.building-logo'));
const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
function imageSlot(src,alt){
  const placeholder=()=>element('div','content-image-placeholder','写真の掲載スペース／準備中');
  if(!src)return placeholder();
  const image=element('img','content-image');image.src=src;image.alt=alt||'';image.addEventListener('error',()=>image.replaceWith(placeholder()),{once:true});return image;
}
function render(section){
  const heading=element('h1','',section.title);heading.id='panel-heading';
  panel.replaceChildren(element('p','panel-eyebrow',section.eyebrow),heading);
  if(section.paragraphs){for(const text of section.paragraphs)panel.append(element('p','panel-copy',text));panel.append(imageSlot(section.image,section.imageAlt));}
  if(section.fields){
    const list=element('dl','contact-fields');
    for(const field of section.fields){
      const row=element('div','contact-field'),description=element('dd');
      if(field.url){const link=element('a','',field.text);link.href=field.url;description.append(link);}else description.textContent=field.text;
      row.append(element('dt','',field.label),description);list.append(row);
    }
    panel.append(list);
  }
  if(section.items){
    if(!section.items.length){
      const empty=element('div','menu-placeholder');empty.append(element('p','','メニューは準備中です。'));
      const fields=element('div','menu-fields');for(const label of ['料理名','説明文','価格','写真'])fields.append(element('span','',label+'／未設定'));
      empty.append(fields,imageSlot(null));panel.append(empty);
    }else for(const item of section.items){
      const article=element('article','menu-item');article.append(element('h2','',item.name));
      if(item.description)article.append(element('p','',item.description));if(item.price)article.append(element('p','',item.price));if(item.image)article.append(imageSlot(item.image,item.imageAlt||item.name));panel.append(article);
    }
  }
  area.scrollTop=0;
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,reduced.matches?0:ms));
async function openSection(id){
  if(current===id)return;
  const section=SECTIONS.find(item=>item.id===id);if(!section)return;
  const token=++sequence,wasOpen=Boolean(current);current=id;
  for(const [key,button] of buttons)button.setAttribute('aria-expanded',String(key===id));
  body.dataset.open=id;panel.classList.remove('is-visible');
  if(wasOpen)await delay(160);else await delay(120);
  if(token!==sequence)return;
  render(section);area.hidden=false;
  requestAnimationFrame(()=>{if(token!==sequence)return;panel.classList.add('is-visible');panel.focus({preventScroll:true});});
}
function closeSection(){
  ++sequence;current=null;panel.classList.remove('is-visible');
  // Keep the closing panel mounted for its fade; invalidate it on rapid reopening.
  const token=sequence;
  delay(420).then(()=>{if(token===sequence){area.hidden=true;panel.replaceChildren();}});
  delete body.dataset.open;for(const button of buttons.values())button.setAttribute('aria-expanded','false');
  home.focus({preventScroll:true});
}
for(const item of TABLE_ITEMS){
  const cell=element(item.section?'button':'span','table-cell',item.label);
  if(item.section){cell.type='button';cell.dataset.section=item.section;}
  nav.append(cell);
}
for(const button of document.querySelectorAll('[data-section]')){
  const id=button.dataset.section;
  button.setAttribute('aria-controls','cafe-panel');button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>openSection(id));buttons.set(id,button);
}
home.addEventListener('click',closeSection);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&current)closeSection();});

const collage=document.getElementById('background-collage');
const figures=BACKGROUND_ITEMS.map(item=>{
  const figure=element('figure','collage-item');figure.dataset.motif=item.id;
  for(const [key,value] of Object.entries({x:item.x+'%',y:item.y+'%',width:item.width+'px',angle:item.angle+'deg','mobile-x':(item.mobile?.x??item.x)+'%','mobile-y':(item.mobile?.y??item.y)+'%','mobile-width':(item.mobile?.width??item.width)+'px'}))figure.style.setProperty('--'+key,value);
  const placeholder=()=>element('div','photo-placeholder',item.image?'仮イラストの掲載枠':'写真／準備中');
  if(item.image){const image=element('img');image.src=item.image;image.alt='';image.decoding='async';image.addEventListener('error',()=>image.replaceWith(placeholder()),{once:true});figure.append(image);}else figure.append(placeholder());
  collage.append(figure);return {item,figure};
});
let frameId=0,last=performance.now(),elapsed=0,scrollTarget=scrollY,scrollNow=scrollY,pointerX=0,pointerY=0,x=0,y=0;
let tuning={speed:1,scroll:1,pointer:1};
function readTuning(){const css=getComputedStyle(document.documentElement);tuning={speed:parseFloat(css.getPropertyValue('--drift-speed'))||0,scroll:parseFloat(css.getPropertyValue('--scroll-amount'))||0,pointer:parseFloat(css.getPropertyValue('--pointer-amount'))||0};}
readTuning();addEventListener('resize',readTuning,{passive:true});
addEventListener('scroll',()=>{scrollTarget=scrollY;},{passive:true});
addEventListener('pointermove',event=>{if(event.pointerType==='mouse'){pointerX=(event.clientX/innerWidth-.5)*2;pointerY=(event.clientY/innerHeight-.5)*2;}},{passive:true});
document.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
function animate(now){
  frameId=0;const dt=Math.min((now-last)/1000,.1);last=now;
  if(!current)elapsed+=dt*tuning.speed;
  const ease=1-Math.exp(-dt*7);scrollNow+=(scrollTarget-scrollNow)*ease;x+=(pointerX-x)*ease;y+=(pointerY-y)*ease;
  for(const {item,figure} of figures){
    const phase=elapsed*.13*item.speed+BACKGROUND_ITEMS.indexOf(item)*1.7;
    const dx=Math.sin(phase)*item.drift+x*item.parallax*tuning.pointer;
    const dy=Math.cos(phase*.8)*item.drift-scrollNow*item.scroll*tuning.scroll+y*item.parallax*tuning.pointer;
    figure.style.setProperty('--move-x',dx.toFixed(2)+'px');figure.style.setProperty('--move-y',dy.toFixed(2)+'px');
  }
  if(!reduced.matches&&!document.hidden)frameId=requestAnimationFrame(animate);
}
function syncMotion(){
  cancelAnimationFrame(frameId);frameId=0;last=performance.now();
  if(reduced.matches){for(const {figure} of figures){figure.style.setProperty('--move-x','0px');figure.style.setProperty('--move-y','0px');}}
  else if(!document.hidden)frameId=requestAnimationFrame(animate);
}
reduced.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);syncMotion();
