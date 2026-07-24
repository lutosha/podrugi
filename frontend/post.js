const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.podrugi.co.uk';

const BOROUGHS = {
  BARKING_AND_DAGENHAM: 'Barking and Dagenham',
  BARNET: 'Barnet',
  BEXLEY: 'Bexley',
  BRENT: 'Brent',
  BROMLEY: 'Bromley',
  CAMDEN: 'Camden',
  CITY_OF_LONDON: 'City of London',
  CROYDON: 'Croydon',
  EALING: 'Ealing',
  ENFIELD: 'Enfield',
  GREENWICH: 'Greenwich',
  HACKNEY: 'Hackney',
  HAMMERSMITH_AND_FULHAM: 'Hammersmith and Fulham',
  HARINGEY: 'Haringey',
  HARROW: 'Harrow',
  HAVERING: 'Havering',
  HILLINGDON: 'Hillingdon',
  HOUNSLOW: 'Hounslow',
  ISLINGTON: 'Islington',
  KENSINGTON_AND_CHELSEA: 'Kensington and Chelsea',
  KINGSTON_UPON_THAMES: 'Kingston upon Thames',
  LAMBETH: 'Lambeth',
  LEWISHAM: 'Lewisham',
  MERTON: 'Merton',
  NEWHAM: 'Newham',
  REDBRIDGE: 'Redbridge',
  RICHMOND_UPON_THAMES: 'Richmond upon Thames',
  SOUTHWARK: 'Southwark',
  SUTTON: 'Sutton',
  TOWER_HAMLETS: 'Tower Hamlets',
  WALTHAM_FOREST: 'Waltham Forest',
  WANDSWORTH: 'Wandsworth',
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

const PIN_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>';
const CAL_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

const token = localStorage.getItem('token');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');
const postDetail = document.getElementById('postDetail');
const postMessage = document.getElementById('postMessage');

let currentUser = null;

function avatarGradient(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_GRAD.length;
  return AVATAR_GRAD[Math.abs(hash) % AVATAR_GRAD.length];
}

function setAvatarContent(el, user) {
  el.innerHTML = '';
  el.style.background = '';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.style.background = avatarGradient(user.name);
    el.textContent = user.name.charAt(0).toUpperCase();
  }
}

function buildAvatarElement(user) {
  const el = document.createElement('div');
  el.className = 'post-avatar';
  setAvatarContent(el, user);
  return el;
}

function formatEventDate(isoString) {
  const date = new Date(isoString);
  const options = { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric';
  return date.toLocaleString('ru-RU', options);
}

function metaRow(icon, text) {
  const row = document.createElement('div');
  row.className = 'event-meta-row';
  row.innerHTML = icon;
  const span = document.createElement('span');
  span.textContent = text;
  row.appendChild(span);
  return row;
}

function renderPost(post) {
  postDetail.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'view-post-header';
  const avatarLink = document.createElement('a');
  avatarLink.href = `profile.html?id=${post.author.id}`;
  avatarLink.appendChild(buildAvatarElement(post.author));
  const nameLink = document.createElement('a');
  nameLink.className = 'view-post-name';
  nameLink.href = `profile.html?id=${post.author.id}`;
  nameLink.textContent = post.author.name;
  header.append(avatarLink, nameLink);
  postDetail.appendChild(header);

  if (post.borough) postDetail.appendChild(metaRow(PIN_SVG, BOROUGHS[post.borough]));
  if (post.type === 'EVENT' && post.eventDate) postDetail.appendChild(metaRow(CAL_SVG, formatEventDate(post.eventDate)));

  const text = document.createElement('p');
  text.className = 'view-post-text';
  text.textContent = post.content;
  postDetail.appendChild(text);

  if (post.type === 'EVENT') {
    const cal = document.createElement('a');
    cal.className = 'btn btn-secondary';
    cal.href = `${API_BASE_URL}/api/posts/${post.id}/ics`;
    cal.textContent = 'Добавить в календарь';
    postDetail.appendChild(cal);
  }

  postDetail.appendChild(buildComments(post));
}

function buildComments(post) {
  const section = document.createElement('div');
  section.className = 'post-comments';

  for (const comment of post.comments) {
    const el = document.createElement('p');
    el.className = 'comment';
    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = comment.author.name;
    el.append(author, document.createTextNode(comment.content));
    section.appendChild(el);
  }

  if (currentUser) {
    const form = document.createElement('form');
    form.className = 'comment-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Написать комментарий...';
    input.maxLength = 1000;
    input.required = true;
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn btn-secondary';
    button.textContent = 'Ответить';
    form.append(input, button);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: input.value }),
      });
      if (res.ok) loadPost();
    });
    section.appendChild(form);
  }

  return section;
}

async function loadPost() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    postMessage.textContent = 'Пост не найден.';
    return;
  }
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, { headers });
  if (!res.ok) {
    postMessage.textContent = 'Пост не найден или недоступен.';
    return;
  }
  postMessage.textContent = '';
  renderPost(await res.json());
}

async function updateNavBadges() {
  if (!token) return;
  const res = await fetch(`${API_BASE_URL}/api/unread`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return;
  const unread = await res.json();
  document.getElementById('friendsBadge')?.classList.toggle('hidden', !unread.friends);
  document.getElementById('messagesBadge')?.classList.toggle('hidden', !unread.messages);
  document.getElementById('notificationsBadge')?.classList.toggle('hidden', !unread.notifications);
}

async function init() {
  if (token) {
    const res = await fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      currentUser = await res.json();
      bottomNav.classList.remove('hidden');
      document.body.classList.add('has-bottom-nav');
      document.getElementById('notificationsLink').classList.remove('hidden');
      bottomProfileLink.href = `profile.html?id=${currentUser.id}`;
      setAvatarContent(bottomProfileAvatar, currentUser);
      updateNavBadges();
    }
  }
  loadPost();
}

init();
