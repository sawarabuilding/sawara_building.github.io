import {ARCHIVE_ITEMS,ARCHIVE_CATEGORIES,ARCHIVE_BRAND} from './archive-data.js';
import {mountArchiveHeader} from './archive-header.js';

mountArchiveHeader({container:document.getElementById('archive-header'),isArchiveHome:true,logoUrl:ARCHIVE_BRAND.logoUrl});
const collection=document.getElementById('archive-collection');
function titleContent(container,title){
  for(const part of title.split(/(\s+)/)){
    if(/^\s+$/.test(part))container.append(document.createTextNode(part));
    else{const word=document.createElement('span');word.className='title-part';word.textContent=part;container.append(word);}
  }
}
for(const item of ARCHIVE_ITEMS){
  const article=document.createElement('article');article.className=`archive-item size-${item.layout?.size||'medium'}`;
  article.dataset.archiveId=item.id;
  article.style.setProperty('--offset',`${item.layout?.offset||0}px`);
  article.style.setProperty('--measure',item.layout?.width||'100%');
  if(item.layout?.italic)article.classList.add('is-italic');
  const category=document.createElement('p');category.className='item-category';category.textContent=ARCHIVE_CATEGORIES[item.category]||'';
  const heading=document.createElement('h2');
  if(item.url){const link=document.createElement('a');link.href=item.url;titleContent(link,item.title);heading.append(link);}
  else titleContent(heading,item.title);
  if(item.image){
    const image=document.createElement('img');image.src=item.image;image.alt=item.imageAlt||item.title;image.loading='lazy';image.decoding='async';
    if(item.url){const link=document.createElement('a');link.href=item.url;link.tabIndex=-1;link.setAttribute('aria-hidden','true');link.append(image);article.append(link);}
    else article.append(image);
  }
  article.append(category,heading);collection.append(article);
}
