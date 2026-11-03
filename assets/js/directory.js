(() => {
  const app=window.Sawara;
  const tenants=document.getElementById('tenant-list');
  for(const floor of app.floors){
    if(floor.zone==='building'){
      const row=document.createElement('div');row.className='tenant-row';row.dataset.floorRow=floor.id;row.style.setProperty('--fallback-order',4-app.floors.filter(f=>f.zone==='building').indexOf(floor));
      const select=document.createElement('button');select.type='button';select.dataset.selectFloor=floor.id;
      select.textContent=floor.label;select.className='floor-label';select.setAttribute('aria-label',`${floor.label} ${floor.name}を選択`);
      select.addEventListener('click',()=>{
        app.selectFloor(floor.id);
        if(document.body.dataset.mode!=='guide')document.dispatchEvent(new CustomEvent('requestguide',{detail:{floorId:floor.id}}));
      });
      const name=document.createElement(floor.url?'a':'button');name.className='floor-name';name.textContent=floor.name;
      if(floor.url)name.href=floor.url;
      else {name.type='button';name.dataset.selectFloor=floor.id;name.title='テナントページは準備中です';name.addEventListener('click',()=>app.selectFloor(floor.id));}
      const english=document.createElement('span');english.className='floor-english';english.textContent=floor.english;
      row.append(select,name,english);tenants.append(row);
    }
  }
  app.selectFloor(app.initialFloorId);
})();
