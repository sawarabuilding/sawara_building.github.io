// Floor state and input mapping are independent of Three.js and of model geometry.
(() => {
  const app=window.Sawara;
  app.selectedFloorId=app.initialFloorId;
  app.selectFloor=id=>{
    const floor=app.floors.find(f=>f.id===id);
    if(!floor)return;
    app.selectedFloorId=id;
    document.querySelectorAll('[data-select-floor]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.selectFloor===id)));
    document.querySelectorAll('[data-archive-floor]').forEach(el=>{
      if(el.dataset.archiveFloor===id)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');
    });
    document.body.dataset.floorZone=floor.zone;
    document.getElementById('selected-floor').textContent=floor.zone==='archives'?`ARCHIVES / ${floor.label}`:`${floor.label} / ${floor.name}`;
    const gateway=document.querySelector('#archive-heading a');
    if(gateway){if(floor.zone==='archives')gateway.setAttribute('aria-current','location');else gateway.removeAttribute('aria-current');}
    document.dispatchEvent(new CustomEvent('floorchange',{detail:{floor}}));
  };
})();
