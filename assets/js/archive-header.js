import {enableTapNavigation} from './tap-link.js';
// Reusable on future detail pages; pass their own relative archive/building URLs.
export function mountArchiveHeader({container,archiveHref='./index.html',buildingHref='../index.html',isArchiveHome=false,logoUrl=null}){
  const title=container.querySelector('.archive-home-title');
  title.href=isArchiveHome?'#top':archiveHref;
  title.setAttribute('aria-label',isArchiveHome?'ARCHIVESの先頭へ':'ARCHIVESのトップへ');
  const logo=container.querySelector('.archive-building-logo');logo.href=buildingHref;
  logo.dataset.placeholder=String(!logoUrl);
  enableTapNavigation(title);enableTapNavigation(logo);
  if(logoUrl){
    const img=document.createElement('img');img.src=logoUrl;img.alt='SAWARA BUILDING';logo.replaceChildren(img);
  }
}
