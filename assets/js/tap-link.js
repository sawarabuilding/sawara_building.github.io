// Some touch browsers suppress the next synthesized click after a canvas swipe.
// A stationary single touch activates the anchor; drags and keyboard/mouse retain
// their normal behavior. Cancel touchend's default click to avoid double activation.
export function enableTapNavigation(link){
  if(!link)return;
  let start=null;
  link.addEventListener('touchstart',event=>{
    start=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,moved:false}:null;
  },{passive:true});
  link.addEventListener('touchmove',event=>{
    if(start&&(event.touches.length!==1||Math.hypot(event.touches[0].clientX-start.x,event.touches[0].clientY-start.y)>8))start.moved=true;
  },{passive:true});
  link.addEventListener('touchcancel',()=>{start=null;},{passive:true});
  link.addEventListener('touchend',event=>{
    const activate=start&&!start.moved&&event.touches.length===0;start=null;
    if(activate){if(event.cancelable)event.preventDefault();link.click();}
  },{passive:false});
}
