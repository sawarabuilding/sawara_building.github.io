import {ARCHIVE_ITEMS,ARCHIVE_BRAND,ARCHIVE_NAV,ARCHIVE_FACTS,DEFAULT_ARCHIVE_MEMO} from './archive-data.js';
import {selectArchiveImages} from './archive-random-images.js';
import {createPaperDownload} from './freepaper-download.js';
import {mountArchiveHeader} from './archive-header.js';
const main=document.querySelector('[data-archive-detail]');
const item=ARCHIVE_ITEMS.find(item=>item.id===(main.dataset.archiveDetail||new URL(location.href).searchParams.get('id')));
if(item){
 document.body.dataset.archiveCategory=item.category;
 document.title=`${item.hoverTitle||item.title} | SAWARA BUILDING ARCHIVES`;
 main.replaceChildren();
 const info=document.createElement('section');info.className='archive-work-info';info.setAttribute('aria-label','作品情報');
 const heading=document.createElement('h1');heading.textContent=item.hoverTitle||item.title;info.append(heading);
 const facts=ARCHIVE_FACTS[item.id]||{};
 const list=document.createElement('dl');
 for(const [label,value] of [['CATEGORY',facts.categoryLabel??ARCHIVE_NAV.find(c=>c.id===item.category)?.label],['PUBLICATION DATE',facts.publicationDate],['DATE',facts.date],['CREDIT',facts.credit],['PLACE',facts.place]]){
  if(!value)continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;list.append(dt,dd);
 }
 info.append(list);
 if(item.description?.trim()){const p=document.createElement('p');p.className='archive-description';p.textContent=item.description;info.append(p);}
 if(!['paper','event','magazine'].includes(item.category)){
 const related=document.createElement('nav');related.className='archive-related';related.setAttribute('aria-label','同じカテゴリの作品');
 for(const other of ARCHIVE_ITEMS.filter(i=>i.category===item.category).sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true}))){const a=document.createElement('a');a.href=other.url;a.textContent=other.hoverTitle||other.title;if(other.id===item.id)a.setAttribute('aria-current','page');related.append(a);}info.append(related);
 }
 if(item.pdf){const a=document.createElement('a');a.href=item.pdf;a.download='';a.textContent='PDF DOWNLOAD';info.append(a);}
 const media=document.createElement('section');media.className='archive-work-images';media.setAttribute('aria-label','作品画像');
 const images=(item.randomImages?selectArchiveImages(item.randomImages.candidates,item.randomImages.count):null)||item.images||(item.cover?[item.cover]:item.image?[{url:item.image,alt:item.title}]:[]);
 for(const image of images){const img=document.createElement('img');img.src=image.url;img.alt=image.alt||item.title;if(image.width){img.width=image.width;img.height=image.height;}img.loading='lazy';img.decoding='async';media.append(img);}
 if(!images.length){const p=document.createElement('p');p.className='detail-empty';p.textContent='画像・資料は準備中です。';media.append(p);}
 const download=item.category==='paper'&&createPaperDownload(item.freePaper);
 if(download)info.append(download);
 const memo=facts.memo??item.memo??DEFAULT_ARCHIVE_MEMO;
 function appendMemo(){if(memo.trim()){
  const label=document.createElement('dt'),body=document.createElement('dd');
  label.textContent='MEMO';body.className='archive-memo';body.textContent=memo;
  const memoList=download||item.pdf?document.createElement('dl'):list;
  memoList.append(label,body);
  if(memoList!==list)info.append(memoList);
 }}
 if(facts.memoPosition!=='last')appendMemo();
 for(const credit of facts.productionCredits||[]){
  const label=document.createElement('dt'),body=document.createElement('dd');
  label.textContent=credit.label;body.className='archive-production-credit';
  body.textContent=credit.names.join('\n');
  if(credit.note){const note=document.createElement('p');note.textContent=credit.note;body.append(note);}
  list.append(label,body);
 }
 if(facts.memoPosition==='last')appendMemo();
 main.append(info,media);
}
mountArchiveHeader({container:document.getElementById('archive-header'),logoUrl:ARCHIVE_BRAND.logoUrl});

// Browser back/forward cache must also count as a fresh magazine opening.
addEventListener('pageshow',event=>{if(event.persisted&&item?.randomImages)location.reload();});
