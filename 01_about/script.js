import {ABOUT_CONTACT, ABOUT_IMAGES, ABOUT_NAV} from './data.js';
const contacts = document.querySelector('#contact-links');
contacts.replaceChildren();
for (const [label, value, href] of [
  ['E-MAIL', ABOUT_CONTACT.email, ABOUT_CONTACT.email ? `mailto:${ABOUT_CONTACT.email}` : ''],
  ['INSTAGRAM', ABOUT_CONTACT.instagram, /^https:\/\//.test(ABOUT_CONTACT.instagram) ? ABOUT_CONTACT.instagram : ''],
]) {
  const li = document.createElement('li');
  const text = document.createElement(href ? 'a' : 'span');
  text.textContent = label;
  if (href) text.href = href;
  if (href && label === 'INSTAGRAM') {
    text.target = '_blank';
    text.rel = 'noopener noreferrer';
  }
  li.append(text);
  if (href) {
    const detail = document.createElement('span');
    detail.className = 'contact-detail';
    detail.textContent = label === 'E-MAIL' ? value : '@' + new URL(value).pathname.split('/').filter(Boolean).pop();
    li.append(detail);
  }
  if (!href) { const note = document.createElement('small'); note.textContent = '未設定'; li.append(note); }
  contacts.append(li);
}
const grid = document.querySelector('#activity-images');
for (const item of ABOUT_IMAGES) {
  const wrapper = document.createElement(item.href ? 'a' : 'div');
  wrapper.className = 'activity';
  if (item.href) wrapper.href = item.href;
  wrapper.style.setProperty('--size', `${item.size ?? 100}%`);
  wrapper.style.setProperty('--offset', `${item.offset ?? 0}px`);
  const img = document.createElement('img');
  img.src = item.src; img.alt = item.alt; img.loading = 'lazy'; img.decoding = 'async';
  img.addEventListener('error', () => wrapper.remove(), {once:true});
  wrapper.append(img); grid.append(wrapper);
}
const nav = document.querySelector('#page-navigation');
nav.replaceChildren(...ABOUT_NAV.map(item => {
  const a = document.createElement('a'); a.href = item.href; a.textContent = item.label;
  if (location.pathname === new URL(item.href, location.href).pathname) a.setAttribute('aria-current', 'page');
  return a;
}));
