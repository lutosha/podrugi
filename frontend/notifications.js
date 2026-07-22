const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.podrugi.co.uk';

const NOTIFICATION_TEXT = {
  FOLLOW: (actor) => `${actor} подписалась на тебя`,
  COMMENT: (actor) => `${actor} прокомментировала твой пост`,
  REACTION: (actor) => `${actor} отреагировала на твой пост`,
  RSVP: (actor) => `${actor} записалась на твоё событие`,
};

const notificationsMessage = document.getElementById('notificationsMessage');
const notificationsList = document.getElementById('notificationsList');
const notificationsLink = document.getElementById('notificationsLink');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');
const token = localStorage.getItem('token');

function setAvatarContent(el, user) {
  el.innerHTML = '';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.textContent = user.name.charAt(0).toUpperCase();
  }
}

function renderNotifications(notifications) {
  notificationsList.innerHTML = '';
  if (notifications.length === 0) {
    notificationsMessage.textContent = 'Пока нет уведомлений.';
    return;
  }
  notificationsMessage.textContent = '';

  for (const n of notifications) {
    const card = document.createElement('a');
    card.className = 'post-card';
    card.style.display = 'flex';
    card.style.textDecoration = 'none';
    card.href = `profile.html?id=${n.actor.id}`;

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    setAvatarContent(avatar, n.actor);

    const body = document.createElement('div');
    body.className = 'post-body';
    const text = document.createElement('p');
    text.className = 'post-meta';
    text.textContent = NOTIFICATION_TEXT[n.type](n.actor.name);
    body.appendChild(text);

    if (n.post) {
      const preview = document.createElement('p');
      preview.className = 'post-content';
      preview.textContent = n.post.content;
      body.appendChild(preview);
    }

    card.append(avatar, body);
    notificationsList.appendChild(card);
  }
}

async function loadNotifications() {
  if (!token) {
    notificationsMessage.textContent = 'Войди в аккаунт на главной странице, чтобы посмотреть уведомления.';
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    notificationsMessage.textContent = 'Не удалось загрузить уведомления.';
    return;
  }
  const notifications = await res.json();
  renderNotifications(notifications);

  await fetch(`${API_BASE_URL}/api/notifications/seen`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  document.getElementById('notificationsBadge')?.classList.add('hidden');
}

async function updateNavBadges() {
  const res = await fetch(`${API_BASE_URL}/api/unread`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return;
  const unread = await res.json();
  document.getElementById('friendsBadge')?.classList.toggle('hidden', !unread.friends);
  document.getElementById('messagesBadge')?.classList.toggle('hidden', !unread.messages);
  document.getElementById('notificationsBadge')?.classList.toggle('hidden', !unread.notifications);
}

async function initBottomNav() {
  if (!token) {
    bottomNav.classList.add('hidden');
    document.body.classList.remove('has-bottom-nav');
    return;
  }
  document.body.classList.add('has-bottom-nav');
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    bottomNav.classList.add('hidden');
    document.body.classList.remove('has-bottom-nav');
    return;
  }
  bottomNav.classList.remove('hidden');
  notificationsLink.classList.remove('hidden');
  const user = await res.json();
  bottomProfileLink.href = `profile.html?id=${user.id}`;
  setAvatarContent(bottomProfileAvatar, user);
  updateNavBadges();
}

loadNotifications();
initBottomNav();
