// Equal intervals give each PDF the same probability.
export function selectPaperPdf(pdfs,random=Math.random){
 return pdfs[Math.floor(random()*pdfs.length)];
}

export function createPaperDownload(paper){
 if(!paper||paper.pdfs?.length!==3||!paper.pdfs.every(Boolean)||!paper.downloadName)return null;
 const group=document.createElement('div');group.className='freepaper-download';
 const button=document.createElement('button');button.type='button';button.className='freepaper-download-button';button.textContent='DOWNLOAD';
 const note=document.createElement('p');note.className='freepaper-download-note';note.textContent='3 COLORS / RANDOM DOWNLOAD';
 const key=`sawara:freepaper:downloaded:${paper.number}`;
 const markDownloaded=()=>{button.disabled=true;button.textContent='DOWNLOADED';};
 const storageUnavailable=()=>{button.disabled=true;note.textContent='ブラウザの保存設定を確認してください';};
 try{if(localStorage.getItem(key))markDownloaded();}catch{storageUnavailable();}
 window.addEventListener('storage',event=>{if(event.key===key&&event.newValue)markDownloaded();});
 button.addEventListener('click',()=>{
  if(button.disabled)return;
  // Reserve before dispatch to prevent duplicate clicks and downloads when
  // persistent storage is blocked. This records initiation, not completion.
  try{
   if(localStorage.getItem(key)){markDownloaded();return;}
   localStorage.setItem(key,'1');
  }catch{storageUnavailable();return;}
  markDownloaded();
  const link=document.createElement('a');
  link.href=selectPaperPdf(paper.pdfs);link.download=paper.downloadName;
  link.hidden=true;document.body.append(link);link.click();link.remove();
 });
 group.append(button,note);return group;
}
