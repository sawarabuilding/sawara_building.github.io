// This is a route placeholder only. The FREE PAPER catalogue follows design review.
window.Sawara.floors.filter(f => f.zone === 'archives').forEach(floor => {
  const section = document.createElement('section'); section.id = floor.id;
  const heading = document.createElement('h2'); heading.textContent = `${floor.label} / ${floor.english}`;
  const text = document.createElement('p'); text.textContent = `${floor.name} — 資料未登録`;
  section.append(heading, text); document.getElementById('archive-placeholders').append(section);
});
