const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const modal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const nameInput = document.getElementById('name');
const ageLabel = document.getElementById('ageLabel');
const ageConfirmedInput = document.getElementById('ageConfirmed');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const guestNav = document.getElementById('guestNav');
const postModal = document.getElementById('postModal');
const closePostModalBtn = document.getElementById('closePostModal');
const postForm = document.getElementById('postForm');
const postContentInput = document.getElementById('postContent');
const postAreaInput = document.getElementById('postArea');
const postEventDateInput = document.getElementById('postEventDate');
const typeTabs = document.querySelectorAll('.type-tab');
const postsList = document.getElementById('postsList');
const feedHint = document.getElementById('feedHint');
const areaFilter = document.getElementById('areaFilter');
const feedScope = document.getElementById('feedScope');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');
const composeNavBtn = document.getElementById('composeNavBtn');

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Объявление', EVENT: 'Событие' };

let mode = 'login';
let selectedType = 'POST';
let currentUser = null;
let selectedArea = '';
let feedScopeValue = 'all';

function buildAvatarElement(user) {
  const el = document.createElement('div');
  el.className = 'post-avatar';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.textContent = user.name.charAt(0).toUpperCase();
  }
  return el;
}

typeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    selectedType = tab.dataset.type;
    typeTabs.forEach((t) => t.classList.toggle('active', t === tab));
    postEventDateInput.classList.toggle('hidden', selectedType !== 'EVENT');
    postEventDateInput.required = selectedType === 'EVENT';
  });
});

function openModal(newMode) {
  mode = newMode;
  modalTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
  nameInput.classList.toggle('hidden', mode === 'login');
  ageLabel.classList.toggle('hidden', mode === 'login');
  authMessage.textContent = '';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  authForm.reset();
}

function openPostModal() {
  postModal.classList.remove('hidden');
}

function closePostModal() {
  postModal.classList.add('hidden');
}

function showLoggedIn(user) {
  currentUser = user;
  guestNav.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  document.body.classList.add('has-bottom-nav');
  feedHint.classList.add('hidden');
  feedScope.classList.remove('hidden');
  bottomProfileLink.href = `profile.html?id=${user.id}`;
  bottomProfileAvatar.innerHTML = '';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    bottomProfileAvatar.appendChild(img);
  } else {
    bottomProfileAvatar.textContent = user.name.charAt(0).toUpperCase();
  }
}

function showLoggedOut() {
  currentUser = null;
  guestNav.classList.remove('hidden');
  bottomNav.classList.add('hidden');
  document.body.classList.remove('has-bottom-nav');
  feedHint.classList.remove('hidden');
  feedScope.classList.add('hidden');
  feedScopeValue = 'all';
  closePostModal();
}

function formatEventDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildCommentsSection(post) {
  const section = document.createElement('div');
  section.className = 'post-comments';

  for (const comment of post.comments) {
    const commentEl = document.createElement('p');
    commentEl.className = 'comment';
    const authorSpan = document.createElement('span');
    authorSpan.className = 'comment-author';
    authorSpan.textContent = comment.author.name;
    commentEl.append(authorSpan, document.createTextNode(comment.content));
    section.appendChild(commentEl);
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: input.value }),
      });
      if (res.ok) {
        fetchPosts();
      }
    });

    section.appendChild(form);
  }

  return section;
}

function buildRsvpSection(post) {
  const section = document.createElement('div');
  section.className = 'post-rsvp';

  const goingCount = post.rsvps.filter((r) => r.status === 'GOING').length;
  const maybeCount = post.rsvps.filter((r) => r.status === 'MAYBE').length;
  const myRsvp = currentUser ? post.rsvps.find((r) => r.userId === currentUser.id) : null;

  const statuses = [
    { status: 'GOING', label: `Иду (${goingCount})` },
    { status: 'MAYBE', label: `Возможно (${maybeCount})` },
  ];

  for (const { status, label } of statuses) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rsvp-btn';
    button.classList.toggle('active', myRsvp?.status === status);
    button.textContent = label;
    button.disabled = !currentUser;

    button.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchPosts();
      }
    });

    section.appendChild(button);
  }

  return section;
}

function buildActionsSection(post) {
  const section = document.createElement('div');
  section.className = 'post-actions';

  const flagWrap = document.createElement('div');
  flagWrap.className = 'flag-wrap';

  const flagBtn = document.createElement('button');
  flagBtn.type = 'button';
  flagBtn.className = 'flag-btn';
  flagBtn.title = 'Пожаловаться или заблокировать';
  flagBtn.textContent = '🚩';

  const flagMenu = document.createElement('div');
  flagMenu.className = 'flag-menu hidden';

  const reportForm = document.createElement('form');
  reportForm.className = 'report-form hidden';
  const reasonInput = document.createElement('input');
  reasonInput.type = 'text';
  reasonInput.placeholder = 'Причина жалобы...';
  reasonInput.maxLength = 500;
  reasonInput.required = true;
  const reportSubmit = document.createElement('button');
  reportSubmit.type = 'submit';
  reportSubmit.className = 'btn btn-secondary';
  reportSubmit.textContent = 'Отправить';
  reportForm.append(reasonInput, reportSubmit);

  const reportMenuBtn = document.createElement('button');
  reportMenuBtn.type = 'button';
  reportMenuBtn.textContent = 'Пожаловаться';
  reportMenuBtn.addEventListener('click', () => {
    flagMenu.classList.add('hidden');
    reportForm.classList.remove('hidden');
  });
  flagMenu.appendChild(reportMenuBtn);

  flagBtn.addEventListener('click', () => {
    document.querySelectorAll('.flag-menu').forEach((m) => {
      if (m !== flagMenu) m.classList.add('hidden');
    });
    flagMenu.classList.toggle('hidden');
  });

  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: 'POST', targetId: post.id, reason: reasonInput.value }),
    });
    if (res.ok) {
      reportForm.classList.add('hidden');
      reasonInput.value = '';
      reportMenuBtn.textContent = 'Жалоба отправлена';
      reportMenuBtn.disabled = true;
    }
  });

  flagWrap.append(flagBtn, flagMenu);
  section.append(flagWrap, reportForm);

  if (currentUser && currentUser.id !== post.author.id) {
    const blockMenuBtn = document.createElement('button');
    blockMenuBtn.type = 'button';
    blockMenuBtn.textContent = 'Заблокировать';
    blockMenuBtn.addEventListener('click', async () => {
      flagMenu.classList.add('hidden');
      if (!confirm(`Заблокировать ${post.author.name}? Её посты перестанут показываться тебе.`)) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/block/${post.author.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPosts();
    });
    flagMenu.appendChild(blockMenuBtn);

    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'link-btn';
    followBtn.textContent = post.authorIsFollowed ? 'В подругах ✓' : 'Добавить в подруги';
    followBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      const method = post.authorIsFollowed ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/follow/${post.author.id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) fetchPosts();
    });
    section.appendChild(followBtn);

    const messageLink = document.createElement('a');
    messageLink.className = 'link-btn';
    messageLink.textContent = 'Написать';
    messageLink.href = `messages.html?to=${post.author.id}&name=${encodeURIComponent(post.author.name)}`;
    section.appendChild(messageLink);
  }

  return section;
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  for (const post of posts) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const avatar = buildAvatarElement(post.author);

    const body = document.createElement('div');
    body.className = 'post-body';

    const meta = document.createElement('p');
    meta.className = 'post-meta';
    const authorLink = document.createElement('a');
    authorLink.className = 'author-link';
    authorLink.href = `profile.html?id=${post.author.id}`;
    authorLink.textContent = post.author.name;
    meta.appendChild(authorLink);
    if (post.area) {
      meta.appendChild(document.createTextNode(`, ${post.area}`));
    }
    if (post.type !== 'POST') {
      const badge = document.createElement('span');
      badge.className = 'post-type-badge';
      badge.textContent = TYPE_LABELS[post.type];
      meta.appendChild(badge);
    }

    const content = document.createElement('p');
    content.className = 'post-content';
    content.textContent = post.content;

    body.append(meta, content);

    if (post.type === 'EVENT') {
      const eventDate = document.createElement('p');
      eventDate.className = 'post-event-date';
      eventDate.textContent = formatEventDate(post.eventDate);
      body.appendChild(eventDate);
      body.appendChild(buildRsvpSection(post));
    }

    if (currentUser) {
      body.appendChild(buildActionsSection(post));
    }

    body.appendChild(buildCommentsSection(post));

    card.append(avatar, body);
    postsList.appendChild(card);
  }
}

async function fetchPosts() {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();
  if (selectedArea) params.set('area', selectedArea);
  if (feedScopeValue === 'following') params.set('following', '1');
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE_URL}/api/posts${query}`, { headers });
  if (!res.ok) return;

  const posts = await res.json();
  renderPosts(posts);
}

async function fetchAreas() {
  const res = await fetch(`${API_BASE_URL}/api/areas`);
  if (!res.ok) return;

  const areas = await res.json();
  for (const area of areas) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'area-chip';
    chip.dataset.area = area;
    chip.textContent = area;
    areaFilter.appendChild(chip);
  }
}

areaFilter.addEventListener('click', (e) => {
  const chip = e.target.closest('.area-chip');
  if (!chip) return;
  selectedArea = chip.dataset.area;
  areaFilter.querySelectorAll('.area-chip').forEach((c) => {
    c.classList.toggle('active', c === chip);
  });
  fetchPosts();
});

feedScope.addEventListener('click', (e) => {
  const btn = e.target.closest('.scope-btn');
  if (!btn) return;
  feedScopeValue = btn.dataset.scope;
  feedScope.querySelectorAll('.scope-btn').forEach((b) => {
    b.classList.toggle('active', b === btn);
  });
  fetchPosts();
});

async function fetchProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    showLoggedOut();
    fetchPosts();
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    localStorage.removeItem('token');
    showLoggedOut();
    fetchPosts();
    return;
  }

  const user = await res.json();
  showLoggedIn(user);
  fetchPosts();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.post-actions')) {
    document.querySelectorAll('.flag-menu').forEach((m) => m.classList.add('hidden'));
  }
});

composeNavBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openPostModal();
});

closePostModalBtn.addEventListener('click', closePostModal);

document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
document.getElementById('closeModal').addEventListener('click', closeModal);

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const postMessage = document.getElementById('postMessage');

  const body = {
    type: selectedType,
    content: postContentInput.value,
    area: postAreaInput.value,
  };
  if (selectedType === 'EVENT') {
    body.eventDate = postEventDateInput.value;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      postMessage.textContent = data.error || 'Не удалось опубликовать пост';
      return;
    }

    postMessage.textContent = '';
    postForm.reset();
    selectedType = 'POST';
    typeTabs.forEach((t) => t.classList.toggle('active', t.dataset.type === 'POST'));
    postEventDateInput.classList.add('hidden');
    closePostModal();
    fetchPosts();
  } catch {
    postMessage.textContent = 'Не удалось связаться с сервером';
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = nameInput.value;
  const endpoint = mode === 'login' ? '/api/login' : '/api/register';
  const body = mode === 'login'
    ? { email, password }
    : { email, password, name, ageConfirmed: ageConfirmedInput.checked };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      authMessage.textContent = data.error || 'Что-то пошло не так';
      return;
    }

    if (mode === 'register') {
      authMessage.textContent = 'Готово! Теперь войди со своим email и паролем.';
      mode = 'login';
      modalTitle.textContent = 'Вход';
      nameInput.classList.add('hidden');
      ageLabel.classList.add('hidden');
      return;
    }

    localStorage.setItem('token', data.token);
    closeModal();
    fetchProfile();
  } catch {
    authMessage.textContent = 'Не удалось связаться с сервером';
  }
});

fetchProfile().then(() => {
  if (new URLSearchParams(location.search).get('compose') === '1' && currentUser) {
    openPostModal();
    history.replaceState(null, '', 'index.html');
  }
});
fetchAreas();
