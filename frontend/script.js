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
const userNav = document.getElementById('userNav');
const userGreeting = document.getElementById('userGreeting');
const postForm = document.getElementById('postForm');
const postContentInput = document.getElementById('postContent');
const postAreaInput = document.getElementById('postArea');
const postEventDateInput = document.getElementById('postEventDate');
const typeTabs = document.querySelectorAll('.type-tab');
const postsList = document.getElementById('postsList');
const feedHint = document.getElementById('feedHint');
const moderationLink = document.getElementById('moderationLink');

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Объявление', EVENT: 'Событие' };

let mode = 'login';
let selectedType = 'POST';
let currentUser = null;

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

function showLoggedIn(user) {
  currentUser = user;
  guestNav.classList.add('hidden');
  userNav.classList.remove('hidden');
  userGreeting.textContent = `Привет, ${user.name}!`;
  postForm.classList.remove('hidden');
  feedHint.classList.add('hidden');
  moderationLink.classList.toggle('hidden', user.role !== 'MODERATOR' && user.role !== 'ADMIN');
}

function showLoggedOut() {
  currentUser = null;
  guestNav.classList.remove('hidden');
  userNav.classList.add('hidden');
  postForm.classList.add('hidden');
  feedHint.classList.remove('hidden');
  moderationLink.classList.add('hidden');
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

  const reportBtn = document.createElement('button');
  reportBtn.type = 'button';
  reportBtn.className = 'link-btn';
  reportBtn.textContent = 'Пожаловаться';

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

  reportBtn.addEventListener('click', () => {
    reportForm.classList.toggle('hidden');
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
      reportBtn.textContent = 'Жалоба отправлена';
      reportBtn.disabled = true;
    }
  });

  section.append(reportBtn, reportForm);

  if (currentUser && currentUser.id !== post.author.id) {
    const messageLink = document.createElement('a');
    messageLink.className = 'link-btn';
    messageLink.textContent = 'Написать';
    messageLink.href = `messages.html?to=${post.author.id}&name=${encodeURIComponent(post.author.name)}`;
    section.appendChild(messageLink);

    const blockBtn = document.createElement('button');
    blockBtn.type = 'button';
    blockBtn.className = 'link-btn';
    blockBtn.textContent = 'Заблокировать';
    blockBtn.addEventListener('click', async () => {
      if (!confirm(`Заблокировать ${post.author.name}? Её посты перестанут показываться тебе.`)) return;
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/block/${post.author.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPosts();
    });
    section.appendChild(blockBtn);
  }

  return section;
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  for (const post of posts) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.textContent = post.author.name.charAt(0).toUpperCase();

    const body = document.createElement('div');
    body.className = 'post-body';

    const meta = document.createElement('p');
    meta.className = 'post-meta';
    meta.textContent = post.area ? `${post.author.name}, ${post.area}` : post.author.name;
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

  const res = await fetch(`${API_BASE_URL}/api/posts`, { headers });
  if (!res.ok) return;

  const posts = await res.json();
  renderPosts(posts);
}

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

document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  showLoggedOut();
  fetchPosts();
});

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

fetchProfile();
