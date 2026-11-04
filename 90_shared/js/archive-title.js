// Fit the actual font's unrotated width to 87.5% of the viewport height.
export async function prepareVerticalArchiveTitle(){
  const title=document.querySelector('.archive-home-title');
  if(!title)return;
  function fit(){
    const base=100;
    document.body.style.setProperty('--vertical-title-size',`${base}px`);
    const width=title.scrollWidth;
    if(width)document.body.style.setProperty('--vertical-title-size',`${base*innerHeight*.875/width}px`);
  }
  fit();addEventListener('resize',fit,{passive:true});
  document.fonts.ready.then(fit);
  try{
    await document.fonts.load('700 100px "Arimo"',title.textContent);
    fit();document.body.dataset.titleFontState='arimo';
  }catch(error){
    document.body.dataset.titleFontState='load-failed';
    console.warn('Arimo could not be loaded; vertical layout is retained.',error);
  }
}
