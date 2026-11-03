import {enableTapNavigation} from './tap-link.js';
import {ARCHIVE_NAV} from './archive-data.js';
import {prepareVerticalArchiveTitle} from './archive-title.js';
// Reusable on future detail pages; pass their own relative archive/building URLs.
export function mountArchiveHeader({container,archiveHref='./index.html',buildingHref='../index.html',isArchiveHome=false,logoUrl=null}){
  const title=container.querySelector('.archive-home-title');
  title.href=archiveHref;
  title.setAttribute('aria-label',isArchiveHome?'ARCHIVESの先頭へ':'ARCHIVESのトップへ');
  const logo=container.querySelector('.archive-building-logo');logo.href=buildingHref;
  logo.dataset.placeholder=String(!logoUrl);
  enableTapNavigation(title);enableTapNavigation(logo);
  if(logoUrl){
    const img=document.createElement('img');img.src=logoUrl;img.alt='SAWARA BUILDING';logo.replaceChildren(img);
  }
  if(!title.closest('.archive-title-rail')){const rail=document.createElement('div');rail.className='archive-title-rail';title.before(rail);rail.append(title);}
  const nav=document.createElement('nav');nav.className='archive-category-nav';nav.setAttribute('aria-label','アーカイブのカテゴリ');
  const selected=new URL(location.href).searchParams.get('category')||document.body.dataset.archiveCategory;
  const line=document.createElement('span');line.className='archive-category-line';line.setAttribute('aria-hidden','true');nav.append(line);
  for(const category of ARCHIVE_NAV){const slot=document.createElement('span');slot.className='archive-category-slot';const link=document.createElement('a');link.href=`${archiveHref}?category=${category.id}`;link.dataset.category=category.id;link.textContent=category.label;if(selected===category.id)link.setAttribute('aria-current','page');slot.append(link);nav.append(slot);}
  container.append(nav);prepareVerticalArchiveTitle();
  function fitCategories(){
    const top=logo.getBoundingClientRect().bottom+25;
    const gap=innerHeight<500?6:22;
    let length=0;
    for(const slot of nav.querySelectorAll('.archive-category-slot')){const width=slot.firstElementChild.scrollWidth;slot.style.setProperty('--category-length',`${width}px`);length+=width;}
    nav.style.setProperty('--nav-top',`${top}px`);
    nav.style.setProperty('--category-gap',`${gap}px`);
    nav.style.setProperty('--category-line-length',`${Math.max(12,Math.min(200,innerHeight-top-length-gap*4-20))}px`);
  }
  fitCategories();document.fonts.ready.then(fitCategories);addEventListener('resize',fitCategories,{passive:true});
}
