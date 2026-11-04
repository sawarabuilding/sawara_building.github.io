// スクロールと現在階の管理。表示や将来の3Dモデルから独立させます。
window.Sawara.createFloorController = function (container, sections, floors) {
  let currentId = null;
  let scheduled = false;
  function update() {
    scheduled = false;
    const center = container.scrollTop + container.clientHeight / 2;
    const section = sections.reduce((nearest, candidate) =>
      Math.abs(candidate.offsetTop + candidate.offsetHeight / 2 - center) <
      Math.abs(nearest.offsetTop + nearest.offsetHeight / 2 - center) ? candidate : nearest);
    const id = section.dataset.floorId;
    if (id === currentId) return;
    currentId = id;
    // 将来の3D表示もこのイベントを購読して現在階に連動できます。
    container.dispatchEvent(new CustomEvent('floorchange', {
      bubbles: true,
      detail: { floor: floors.find((floor) => floor.id === id) },
    }));
  }
  function goToFloor(id, behavior = 'smooth') {
    const section = sections.find((item) => item.dataset.floorId === id);
    if (!section) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollTo({ top: section.offsetTop, behavior: reducedMotion ? 'instant' : behavior });
    if (behavior === 'instant' || reducedMotion) update();
  }
  container.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  new ResizeObserver(() => {
    if (currentId) goToFloor(currentId, 'instant');
  }).observe(container);
  return { goToFloor, getCurrentFloorId: () => currentId };
};
