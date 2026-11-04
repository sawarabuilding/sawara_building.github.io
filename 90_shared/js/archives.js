import {ARCHIVE_ITEMS,ARCHIVE_CATEGORIES,ARCHIVE_BRAND} from './archive-data.js';
import {mountArchiveHeader} from './archive-header.js';


mountArchiveHeader({container:document.getElementById('archive-header'),isArchiveHome:true,logoUrl:ARCHIVE_BRAND.logoUrl});

const collection=document.getElementById('archive-collection');
function clearPreview(except){
  collection.querySelectorAll('.is-revealed').forEach(link=>{if(link!==except)link.classList.remove('is-revealed');});
}
for(const item of ARCHIVE_ITEMS){
  const article=document.createElement('article');article.className=`archive-item size-${item.layout?.size||'medium'}`;
  article.dataset.archiveId=item.id;article.dataset.category=item.category;
  article.style.setProperty('--offset',`${item.layout?.offset||0}px`);
  article.style.setProperty('--measure',item.layout?.width||'100%');
  article.style.setProperty('--media-width',item.cover?.displayWidth||'18vw');
  if(item.layout?.italic)article.classList.add('is-italic');
  const category=document.createElement('p');category.className='item-category visually-hidden';category.textContent=ARCHIVE_CATEGORIES[item.category]||'';
  const heading=document.createElement('h2');heading.className='visually-hidden';heading.textContent=item.title;
  const title=item.hoverTitle||item.title;
  const work=document.createElement(item.url?'a':'div');work.className='archive-work';
  if(item.url)work.href=item.url;else work.tabIndex=0;
  work.setAttribute('aria-label',title);
  const media=document.createElement('div');media.className='archive-work-media';
  if(item.cover||item.image){
    work.classList.add('has-image');
    const image=document.createElement('img');image.src=item.cover?.url||item.image;image.alt=item.cover?.alt||item.imageAlt||item.title;image.loading='lazy';image.decoding='async';
    if(item.cover){image.width=item.cover.width;image.height=item.cover.height;}
    image.addEventListener('error',()=>{work.classList.remove('has-image');work.classList.add('no-image');image.remove();},{once:true});
    media.append(image);
  }else work.classList.add('no-image');
  const overlay=document.createElement('span');overlay.className='archive-work-overlay';overlay.setAttribute('aria-hidden','true');
  const caption=document.createElement('span');caption.className='archive-hover-title';caption.textContent=title;overlay.append(caption);
  work.append(media,overlay);article.append(category,heading,work);collection.append(article);
  let touch=false,moved=false,start;
  work.addEventListener('pointerdown',event=>{touch=event.pointerType==='touch';moved=false;start={x:event.clientX,y:event.clientY};});
  work.addEventListener('pointermove',event=>{if(touch&&start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)moved=true;});
  work.addEventListener('pointercancel',()=>{touch=false;start=null;});
  work.addEventListener('click',event=>{
    if(event.detail===0)return; // Keyboard focus reveals the title; Enter follows the link.
    if(touch){
      if(moved){event.preventDefault();return;}
      if(!work.classList.contains('is-revealed')){event.preventDefault();clearPreview(work);work.classList.add('is-revealed');}
    }
  });
}
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.archive-work'))clearPreview();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')clearPreview();});

function filterCategory(){
 const category=document.body.dataset.archiveCategory||new URL(location.href).searchParams.get('category');
 const valid=Object.hasOwn(ARCHIVE_CATEGORIES,category);
 collection.classList.toggle('is-filtered',valid);
 const ordered=ARCHIVE_ITEMS.filter(i=>i.category===category).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
 // Dates are explicit for exhibition entries; other IDs contain issue/year numbers.
 if(category==='event')ordered.sort((a,b)=>a.title.localeCompare(b.title));
 collection.querySelectorAll('.archive-item').forEach(article=>{
  article.hidden=valid&&article.dataset.category!==category;
  article.style.order=valid?ordered.findIndex(i=>i.id===article.dataset.archiveId):'';
 });
 document.querySelectorAll('.archive-category-nav a').forEach(a=>{
  if(a.dataset.category===category)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 clearPreview();
}
filterCategory();
addEventListener('popstate',filterCategory);
document.addEventListener('click',event=>{
 const link=event.target.closest('.archive-category-nav a,.archive-home-title');
 if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
 if(new URL(link.href).pathname!==location.pathname)return;
 event.preventDefault();history.pushState({},'',link.href);filterCategory();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
