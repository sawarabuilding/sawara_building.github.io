// 設定・表示・制御の接続だけを担当します。
(() => {
  const app = window.Sawara;
  const building = document.getElementById('building');
  const navigation = document.getElementById('floor-links');
  const status = document.getElementById('current-floor');
  const sections = app.renderFloors(building, navigation, app.floors);
  building.addEventListener('floorchange', (event) => {
    const floor = event.detail.floor;
    navigation.querySelectorAll('a').forEach((link) => {
      if (link.dataset.floorId === floor.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    status.textContent = `${floor.label} ${floor.name}`;
  });
  app.controller = app.createFloorController(building, sections, app.floors);
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    app.controller.goToFloor(link.dataset.floorId);
  });
  // URLのハッシュやブラウザの復元位置にかかわらず1Fから開始。
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function start() {
    const requested = new URLSearchParams(location.search).get('floor');
    app.controller.goToFloor(app.floors.some(f => f.id === requested) ? requested : app.initialFloorId, 'instant');
    building.classList.add('is-ready');
  }
  start();
  window.addEventListener('pageshow', start);
})();
