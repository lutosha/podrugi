const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.podrugi.co.uk';

const BOROUGHS = {
  BARKING_AND_DAGENHAM: 'Barking and Dagenham', BARNET: 'Barnet', BEXLEY: 'Bexley', BRENT: 'Brent',
  BROMLEY: 'Bromley', CAMDEN: 'Camden', CITY_OF_LONDON: 'City of London', CROYDON: 'Croydon',
  EALING: 'Ealing', ENFIELD: 'Enfield', GREENWICH: 'Greenwich', HACKNEY: 'Hackney',
  HAMMERSMITH_AND_FULHAM: 'Hammersmith and Fulham', HARINGEY: 'Haringey', HARROW: 'Harrow',
  HAVERING: 'Havering', HILLINGDON: 'Hillingdon', HOUNSLOW: 'Hounslow', ISLINGTON: 'Islington',
  KENSINGTON_AND_CHELSEA: 'Kensington and Chelsea', KINGSTON_UPON_THAMES: 'Kingston upon Thames',
  LAMBETH: 'Lambeth', LEWISHAM: 'Lewisham', MERTON: 'Merton', NEWHAM: 'Newham', REDBRIDGE: 'Redbridge',
  RICHMOND_UPON_THAMES: 'Richmond upon Thames', SOUTHWARK: 'Southwark', SUTTON: 'Sutton',
  TOWER_HAMLETS: 'Tower Hamlets', WALTHAM_FOREST: 'Waltham Forest', WANDSWORTH: 'Wandsworth',
  WESTMINSTER: 'Westminster',
};

const AVATAR_GRAD = [
  'linear-gradient(155deg,#F0B8BA 0%,#C4636B 45%,#5C2E33 100%)',
  'linear-gradient(155deg,#C9D4B4 0%,#7E9169 45%,#33422A 100%)',
  'linear-gradient(155deg,#8FA5C7 0%,#4C6E8F 45%,#22344A 100%)',
  'linear-gradient(155deg,#E8C9A0 0%,#B9834A 45%,#5B3A1C 100%)',
  'linear-gradient(155deg,#D9B8DD 0%,#8E5F97 45%,#402B47 100%)',
  'linear-gradient(155deg,#B7C9C2 0%,#5C8A79 45%,#28433A 100%)',
];
const COVER_GRAD = [
  'radial-gradient(120% 140% at 12% 0%, rgba(163,177,138,.9), transparent 55%), radial-gradient(110% 130% at 100% 100%, rgba(229,152,155,.65), transparent 55%), linear-gradient(160deg,#3F5A4C,#20302A)',
  'radial-gradient(120% 140% at 90% 0%, rgba(229,152,155,.85), transparent 55%), radial-gradient(110% 130% at 0% 100%, rgba(163,177,138,.7), transparent 55%), linear-gradient(160deg,#4A3B4E,#241B26)',
  'radial-gradient(120% 140% at 20% 100%, rgba(163,177,138,.85), transparent 55%), radial-gradient(110% 130% at 100% 0%, rgba(229,152,155,.65), transparent 55%), linear-gradient(160deg,#2F4A44,#17241F)',
];

const CAL_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const PIN_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>';
const PIN_SM_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const ICS_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 9.5h18" stroke="currentColor" stroke-width="1.7"/><path d="M8 2.5v4M16 2.5v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 12.5v5M9.5 15h5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const ADD_FRIEND_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3 19c.6-3 2.9-5 6-5s5.4 2 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M18 8v6M15 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const FRIEND_CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3 19c.6-3 2.9-5 6-5s5.4 2 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M15 11.5l2 2 3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const WRITE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21.5 2.5 11 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.5 2.5 15 21l-4-8-8-4 18.5-6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SHARE_SM_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="6" r="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18" r="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.8l7.6-4.2M8.2 13.2l7.6 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

const token = localStorage.getItem('token');
let currentUser = null;
let eventPost = null;

const heroPhoto = document.getElementById('heroPhoto');
const eventContent = document.getElementById('eventContent');
const eventMessage = document.getElementById('eventMessage');
const bottomBar = document.getElementById('bottomBar');
const goingCount = document.getElementById('goingCount');
const rsvpGoing = document.getElementById('rsvpGoing');
const rsvpMaybe = document.getElementById('rsvpMaybe');
const saveBtn = document.getElementById('saveBtn');
const toastEl = document.getElementById('toast');

let toastTimer = null;
function toast(msg) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function avatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_GRAD.length;
  return AVATAR_GRAD[Math.abs(hash) % AVATAR_GRAD.length];
}

function buildAvatarElement(user) {
  const el = document.createElement('div');
  el.className = 'post-avatar';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.style.background = avatarGradient(user.name);
    el.textContent = user.name.charAt(0).toUpperCase();
  }
  return el;
}

function formatEventDate(isoString) {
  const date = new Date(isoString);
  const options = { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric';
  return date.toLocaleString('ru-RU', options);
}

function firstSentence(text) {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}

function pluralizeEvents(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} мероприятие`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} мероприятия`;
  return `${n} мероприятий`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function sectionBlock(titleText, countText) {
  const block = el('div', 'section-block');
  const heading = el('div', 'section-heading');
  heading.appendChild(document.createTextNode(titleText + ' '));
  if (countText != null) {
    const count = el('span', 'count', countText);
    heading.appendChild(count);
  }
  block.appendChild(heading);
  return block;
}

// ---------- render ----------
function renderEvent(post) {
  eventPost = post;
  eventContent.innerHTML = '';
  heroPhoto.style.background = COVER_GRAD[post.id % COVER_GRAD.length];

  // like (save) state
  const liked = currentUser ? post.reactions.some((r) => r.userId === currentUser.id) : false;
  saveBtn.classList.toggle('liked', liked);

  // title — новые события хранят его отдельным полем; у старых (созданных до этого поля)
  // берём первое предложение текста, как раньше
  const title = post.title || firstSentence(post.content);
  eventContent.appendChild(el('h1', 'event-title', title));

  // date + ics
  const dateRow = el('div', 'detail-row');
  dateRow.innerHTML = CAL_SVG;
  const dateInfo = el('div');
  dateInfo.appendChild(el('div', 'main', formatEventDate(post.eventDate)));
  dateInfo.appendChild(el('div', 'sub', 'по лондонскому времени'));
  dateRow.appendChild(dateInfo);
  const ics = document.createElement('a');
  ics.className = 'ics-link';
  ics.href = `${API_BASE_URL}/api/posts/${post.id}/ics`;
  ics.title = 'Добавить в календарь';
  ics.setAttribute('aria-label', 'Добавить в календарь');
  ics.innerHTML = ICS_SVG;
  dateRow.appendChild(ics);
  eventContent.appendChild(dateRow);

  // location — место (venue) и точный адрес, если автор их указал; иначе просто район
  const boroughLabel = post.borough ? BOROUGHS[post.borough] : null;
  if (post.venue || post.address || boroughLabel) {
    const locRow = el('div', 'detail-row');
    locRow.innerHTML = PIN_SVG;
    const locInfo = el('div');
    const mainText = post.venue || post.address || boroughLabel;
    const subText = post.venue
      ? [post.address, boroughLabel].filter(Boolean).join(' · ') || 'Лондон'
      : (post.address ? boroughLabel || 'Лондон' : 'Лондон');
    locInfo.appendChild(el('div', 'main', mainText));
    locInfo.appendChild(el('div', 'sub', subText));
    locRow.appendChild(locInfo);
    eventContent.appendChild(locRow);
  }

  // organizer card
  const org = el('div', 'organizer-card');
  const orgAvatarLink = document.createElement('a');
  orgAvatarLink.href = `profile.html?id=${post.author.id}`;
  orgAvatarLink.appendChild(buildAvatarElement(post.author));
  const orgInfo = el('div', 'organizer-info');
  const orgName = document.createElement('a');
  orgName.className = 'organizer-name';
  orgName.href = `profile.html?id=${post.author.id}`;
  orgName.textContent = post.author.name;
  orgInfo.appendChild(orgName);
  const orgSub = post.author.bio ? post.author.bio : 'Организатор мероприятия';
  const orgSubText = post.author.eventCount != null ? `${orgSub} · ${pluralizeEvents(post.author.eventCount)}` : orgSub;
  orgInfo.appendChild(el('div', 'organizer-sub', orgSubText));
  org.append(orgAvatarLink, orgInfo);

  if (currentUser && currentUser.id !== post.author.id) {
    const icons = el('div', 'icon-actions');
    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'icon-action-btn';
    followBtn.classList.toggle('on', post.authorIsFollowed);
    followBtn.title = post.authorIsFollowed ? 'В подругах' : 'Добавить в подруги';
    followBtn.innerHTML = post.authorIsFollowed ? FRIEND_CHECK_SVG : ADD_FRIEND_SVG;
    followBtn.addEventListener('click', async () => {
      const method = post.authorIsFollowed ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/follow/${post.author.id}`, {
        method, headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) loadEvent();
    });
    const writeLink = document.createElement('a');
    writeLink.className = 'icon-action-btn';
    writeLink.title = 'Написать в личку';
    writeLink.href = `messages.html?to=${post.author.id}&name=${encodeURIComponent(post.author.name)}`;
    writeLink.innerHTML = WRITE_SVG;
    icons.append(followBtn, writeLink);
    org.appendChild(icons);
  }
  eventContent.appendChild(org);

  // tags
  if (post.tags && post.tags.length) {
    const tagRow = el('div', 'tag-row');
    for (const t of post.tags) tagRow.appendChild(el('span', 'tag-pill', t));
    eventContent.appendChild(tagRow);
  }

  // description (only if content has more than the title sentence)
  if (post.content.trim() !== title.trim()) {
    const block = sectionBlock('Описание');
    const desc = el('p', 'desc-text clamped', post.content);
    block.appendChild(desc);
    const toggle = el('button', 'desc-toggle', 'Показать полностью');
    toggle.type = 'button';
    toggle.hidden = true;
    toggle.addEventListener('click', () => {
      const expanded = desc.classList.toggle('clamped') === false;
      toggle.textContent = expanded ? 'Свернуть' : 'Показать полностью';
    });
    block.appendChild(toggle);
    eventContent.appendChild(block);
    requestAnimationFrame(() => {
      if (desc.scrollHeight - desc.clientHeight > 2) toggle.hidden = false;
    });
  }

  // кто идёт
  const going = post.rsvps.filter((r) => r.status === 'GOING');
  const maybe = post.rsvps.filter((r) => r.status === 'MAYBE');
  if (going.length || maybe.length) {
    const block = sectionBlock('Кто идёт');
    if (going.length) block.appendChild(attendRow(going, 'идут'));
    if (maybe.length) block.appendChild(attendRow(maybe, 'возможно'));
    eventContent.appendChild(block);
  }

  // комментарии
  const commentsBlock = sectionBlock('Комментарии', String(post.comments.length));
  const list = el('div');
  for (const c of post.comments) list.appendChild(commentItem(c));
  commentsBlock.appendChild(list);
  if (currentUser) commentsBlock.appendChild(commentForm(post));
  eventContent.appendChild(commentsBlock);

  // похожие мероприятия — приходят с бэкенда уже отфильтрованными (район/теги, предстоящие)
  const similarBlock = sectionBlock('Похожие мероприятия');
  const row = el('div', 'other-row');
  if (post.similarEvents && post.similarEvents.length) {
    for (const o of post.similarEvents) row.appendChild(otherCard(o));
  } else {
    row.appendChild(el('div', 'other-going-text', 'Пока нет похожих мероприятий.'));
  }
  similarBlock.appendChild(row);
  eventContent.appendChild(similarBlock);

  // bottom bar
  goingCount.textContent = going.length ? `${going.length} идут` : 'Никто ещё не идёт';
  const myRsvp = currentUser ? post.rsvps.find((r) => r.userId === currentUser.id) : null;
  const isFull = post.maxParticipants != null && going.length >= post.maxParticipants;
  rsvpGoing.classList.toggle('on', myRsvp?.status === 'GOING');
  rsvpMaybe.classList.toggle('on', myRsvp?.status === 'MAYBE');
  rsvpGoing.disabled = !currentUser || (isFull && myRsvp?.status !== 'GOING');
  rsvpMaybe.disabled = !currentUser;
  bottomBar.hidden = false;
}

function attendRow(rsvps, label) {
  const row = el('div', 'attend-row');
  const avatars = el('div', 'attend-avatars');
  const shown = rsvps.slice(0, 4);
  for (const r of shown) avatars.appendChild(buildAvatarElement(r.user));
  if (rsvps.length > 4) {
    const overflow = el('div', 'post-avatar', `+${rsvps.length - 4}`);
    overflow.style.background = 'var(--heading)';
    avatars.appendChild(overflow);
  }
  row.appendChild(avatars);
  const text = el('div', 'attend-text');
  const b = el('b', null, String(rsvps.length));
  text.append(b, document.createTextNode(' ' + label));
  row.appendChild(text);
  return row;
}

function commentItem(comment) {
  const item = el('div', 'comment-item');
  item.appendChild(buildAvatarElement(comment.author));
  const body = el('div', 'comment-body');
  const head = el('div', 'comment-head');
  head.appendChild(el('span', 'comment-name', comment.author.name));
  body.appendChild(head);
  body.appendChild(el('p', 'comment-text', comment.content));
  item.appendChild(body);
  return item;
}

function commentForm(post) {
  const form = document.createElement('form');
  form.className = 'event-comment-form';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Написать комментарий';
  input.maxLength = 1000;
  input.required = true;
  const button = el('button', null, 'Ответить');
  button.type = 'submit';
  form.append(input, button);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: input.value }),
    });
    if (res.ok) loadEvent();
  });
  return form;
}

// карточка «похожего мероприятия»: фото — первый full-bleed дочерний элемент, текст — в .other-body
function otherCard(post) {
  const card = document.createElement('a');
  card.className = 'other-card';
  card.href = `event.html?id=${post.id}`;

  const photo = el('div', 'other-photo');
  photo.style.background = COVER_GRAD[post.id % COVER_GRAD.length];
  const initiator = el('div', 'other-pill other-initiator');
  initiator.appendChild(buildAvatarElement(post.author));
  initiator.appendChild(document.createTextNode(post.author.name));
  photo.appendChild(initiator);
  if (post.tags && post.tags.length) {
    const tags = el('div', 'other-tags');
    for (const t of post.tags.slice(0, 3)) tags.appendChild(el('span', 'other-tag', t));
    photo.appendChild(tags);
  }
  card.appendChild(photo);

  const body = el('div', 'other-body');
  if (post.borough) body.appendChild(el('div', 'other-distance', BOROUGHS[post.borough]));
  body.appendChild(el('div', 'other-title', post.title || firstSentence(post.content)));
  const meta = el('div', 'other-meta');
  meta.innerHTML = PIN_SM_SVG;
  meta.appendChild(el('span', null, formatEventDate(post.eventDate)));
  body.appendChild(meta);

  const going = post.rsvps.filter((r) => r.status === 'GOING');
  if (going.length) {
    const goingWrap = el('div', 'other-going');
    const avatars = el('div', 'other-going-avatars');
    for (const r of going.slice(0, 3)) avatars.appendChild(buildAvatarElement(r.user));
    const text = el('div', 'other-going-text');
    text.appendChild(el('b', null, going[0].user.name.split(' ')[0]));
    text.appendChild(document.createTextNode(going.length > 1 ? ` и ещё ${going.length - 1} идут` : ' идёт'));
    goingWrap.append(avatars, text);
    body.appendChild(goingWrap);
  }
  card.appendChild(body);
  return card;
}

// ---------- interactions ----------
async function sendRsvp(status) {
  if (!currentUser) { toast('Войди в аккаунт, чтобы ответить'); return; }
  const res = await fetch(`${API_BASE_URL}/api/posts/${eventPost.id}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (res.ok) loadEvent();
  else { const d = await res.json(); toast(d.error || 'Не удалось отправить'); }
}

rsvpGoing.addEventListener('click', () => sendRsvp('GOING'));
rsvpMaybe.addEventListener('click', () => sendRsvp('MAYBE'));

saveBtn.addEventListener('click', async () => {
  if (!currentUser) { toast('Войди, чтобы отметить'); return; }
  const liked = eventPost.reactions.some((r) => r.userId === currentUser.id);
  const res = await fetch(`${API_BASE_URL}/api/posts/${eventPost.id}/react`, {
    method: liked ? 'DELETE' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok || res.status === 204) {
    toast(liked ? 'Убрано из избранного' : 'Добавлено в избранное');
    loadEvent();
  }
});

document.getElementById('shareBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    toast('Ссылка на мероприятие скопирована');
  } catch {
    toast('Не удалось скопировать ссылку');
  }
});

// ---------- load ----------
async function loadEvent() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { eventMessage.textContent = 'Мероприятие не найдено.'; return; }
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, { headers, cache: 'no-store' });
  if (!res.ok) { eventMessage.textContent = 'Мероприятие не найдено или недоступно.'; return; }
  const post = await res.json();
  if (post.type !== 'EVENT') { location.replace(`post.html?id=${id}`); return; }
  renderEvent(post);
}

async function init() {
  if (token) {
    const res = await fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) currentUser = await res.json();
  }
  loadEvent();
}

init();
