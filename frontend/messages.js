const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.podrugi.co.uk';

const params = new URLSearchParams(location.search);
const otherId = params.get('to');
const otherName = params.get('name');

const pageTitle = document.getElementById('pageTitle');
const msgMessage = document.getElementById('msgMessage');
const conversationsList = document.getElementById('conversationsList');
const thread = document.getElementById('thread');
const threadMessages = document.getElementById('threadMessages');
const threadForm = document.getElementById('threadForm');
const threadInput = document.getElementById('threadInput');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');

const token = localStorage.getItem('token');

const AVATAR_GRAD = [
  'linear-gradient(155deg,#F0B8BA 0%,#C4636B 45%,#5C2E33 100%)',
  'linear-gradient(155deg,#C9D4B4 0%,#7E9169 45%,#33422A 100%)',
  'linear-gradient(155deg,#8FA5C7 0%,#4C6E8F 45%,#22344A 100%)',
  'linear-gradient(155deg,#E8C9A0 0%,#B9834A 45%,#5B3A1C 100%)',
  'linear-gradient(155deg,#D9B8DD 0%,#8E5F97 45%,#402B47 100%)',
  'linear-gradient(155deg,#B7C9C2 0%,#5C8A79 45%,#28433A 100%)',
];

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

function renderConversations(conversations) {
  conversationsList.innerHTML = '';
  if (conversations.length === 0) {
    msgMessage.textContent = 'Переписок пока нет.';
    return;
  }
  msgMessage.textContent = '';

  for (const conv of conversations) {
    const card = document.createElement('a');
    card.className = 'post-card';
    card.style.display = 'flex';
    card.style.textDecoration = 'none';
    card.href = `messages.html?to=${conv.user.id}&name=${encodeURIComponent(conv.user.name)}`;

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    setAvatarContent(avatar, conv.user);

    const body = document.createElement('div');
    body.className = 'post-body';
    const name = document.createElement('p');
    name.className = 'post-meta';
    name.textContent = conv.user.name;
    const preview = document.createElement('p');
    preview.className = 'post-content';
    preview.textContent = conv.lastMessage;
    body.append(name, preview);

    card.append(avatar, body);
    conversationsList.appendChild(card);
  }
}

function renderThread(messages) {
  threadMessages.innerHTML = '';
  for (const message of messages) {
    const bubble = document.createElement('p');
    bubble.className = 'comment';
    bubble.textContent = message.senderId === Number(otherId)
      ? `${otherName}: ${message.content}`
      : `Ты: ${message.content}`;
    threadMessages.appendChild(bubble);
  }
}

async function loadConversations() {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    msgMessage.textContent = 'Не удалось загрузить сообщения.';
    return;
  }
  const conversations = await res.json();
  renderConversations(conversations);
}

async function loadThread() {
  const res = await fetch(`${API_BASE_URL}/api/messages/${otherId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    msgMessage.textContent = 'Не удалось загрузить переписку.';
    return;
  }
  const messages = await res.json();
  renderThread(messages);
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
  document.getElementById('notificationsLink').classList.remove('hidden');
  const user = await res.json();
  bottomProfileLink.href = `profile.html?id=${user.id}`;
  setAvatarContent(bottomProfileAvatar, user);
  updateNavBadges();
}

if (!token) {
  msgMessage.textContent = 'Войди в аккаунт на главной странице, чтобы посмотреть сообщения.';
} else if (otherId) {
  pageTitle.textContent = `Переписка с ${otherName}`;
  thread.classList.remove('hidden');
  loadThread();

  threadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/messages/${otherId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: threadInput.value }),
    });
    if (res.ok) {
      threadInput.value = '';
      loadThread();
    } else {
      const data = await res.json();
      msgMessage.textContent = data.error || 'Не удалось отправить сообщение';
    }
  });
} else {
  loadConversations();
}

initBottomNav();

if (token) {
  fetch(`${API_BASE_URL}/api/messages/seen`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
