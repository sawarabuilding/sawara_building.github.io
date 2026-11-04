import {enableTapNavigation} from './tap-link.js';
import {ARCHIVE_NAV,ARCHIVE_HOME,SITE_HOME,CATEGORY_URLS} from './archive-data.js';
import {prepareVerticalArchiveTitle} from './archive-title.js';
// Reusable on future detail pages; pass their own relative archive/building URLs.
export function mountArchiveHeader({container,archiveHref=ARCHIVE_HOME,buildingHref=SITE_HOME,isArchiveHome=false,logoUrl=null}){
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
  const selected=document.body.dataset.archiveCategory||new URL(location.href).searchParams.get('category');
  const line=document.createElement('span');line.className='archive-category-line';line.setAttribute('aria-hidden','true');nav.append(line);
  const menuCategories=[...ARCHIVE_NAV.filter(c=>c.id==='magazine'),...ARCHIVE_NAV.filter(c=>c.id!=='magazine')];
  for(const category of menuCategories){const slot=document.createElement('span');slot.className='archive-category-slot';const link=document.createElement('a');link.href=CATEGORY_URLS[category.id];link.dataset.category=category.id;link.textContent=category.id==='magazine'?'Magazine':category.label;if(selected===category.id)link.setAttribute('aria-current','page');slot.append(link);nav.append(slot);}
  container.append(nav);prepareVerticalArchiveTitle();
  function fitCategories(){
    const top=logo.getBoundingClientRect().bottom+25;
    const gap=innerHeight<500?6:22;
    let length=0;
    for(const slot of nav.querySelectorAll('.archive-category-slot')){const width=slot.firstElementChild.scrollWidth;slot.style.setProperty('--category-length',`${width}px`);length+=width;}
    nav.style.setProperty('--nav-top',`${top}px`);
    nav.style.setProperty('--category-gap',`${gap}px`);
    nav.style.setProperty('--category-line-length',`${Math.max(12,Math.min(200,innerHeight-top-length-gap*ARCHIVE_NAV.length-20))}px`);
  }
  fitCategories();document.fonts.ready.then(fitCategories);addEventListener('resize',fitCategories,{passive:true});
}
