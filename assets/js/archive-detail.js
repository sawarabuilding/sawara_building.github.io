import {ARCHIVE_ITEMS,ARCHIVE_BRAND} from './archive-data.js';
import {mountArchiveHeader} from './archive-header.js';
mountArchiveHeader({container:document.getElementById('archive-header'),logoUrl:ARCHIVE_BRAND.logoUrl});
const item=ARCHIVE_ITEMS.find(item=>item.id===document.querySelector('[data-archive-detail]').dataset.archiveDetail);
if(item){
  document.querySelector('h1').textContent=item.title;
  document.title=`${item.title} | SAWARA BUILDING ARCHIVES`;
  if(item.image){
    const img=document.createElement('img');img.src=item.image;img.alt=item.imageAlt||item.title;
    document.querySelector('.detail-media').replaceChildren(img);
  }
  if(item.description)document.querySelector('.detail-description p').textContent=item.description;
  if(item.pdf){
    const link=document.createElement('a');link.href=item.pdf;link.download='';link.textContent='PDFをダウンロード';
    document.querySelector('.detail-downloads p').replaceChildren(link);
  }
}
