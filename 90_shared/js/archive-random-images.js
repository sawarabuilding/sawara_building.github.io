// A fresh shuffled copy for each detail opening; never mutate the catalogue.
export function selectArchiveImages(candidates,count=5,random=Math.random){
 const images=[...candidates];
 for(let i=images.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[images[i],images[j]]=[images[j],images[i]];}
 return images.slice(0,count);
}
