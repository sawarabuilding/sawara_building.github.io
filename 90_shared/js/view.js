// 設定から表示を生成する役割。スクロール処理は持ちません。
window.Sawara.renderFloors = function (container, navigation, floors) {
  const sections = floors.map((floor) => {
    const section = document.createElement('section');
    section.className = 'floor';
    section.id = `floor-${floor.id}`;
    section.dataset.floorId = floor.id;
    section.setAttribute('aria-labelledby', `title-${floor.id}`);

    const content = document.createElement('div');
    content.className = 'floor-content';
    const number = document.createElement('p');
    number.className = 'floor-number';
    number.textContent = floor.label;
    const heading = document.createElement('h2');
    heading.id = `title-${floor.id}`;
    heading.textContent = floor.name;
    content.append(number, heading);
    if (floor.url && floor.zone === 'archives') {
      const detail = document.createElement('a');
      detail.href = floor.url;
      detail.textContent = 'この階について';
      content.append(detail);
    }
    section.append(content);
    container.append(section);

    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.dataset.floorId = floor.id;
    link.textContent = floor.label;
    link.setAttribute('aria-label', `${floor.label} ${floor.name}`);
    item.append(link);
    navigation.append(item);
    return section;
  });
  return sections;
};
