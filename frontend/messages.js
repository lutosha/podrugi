const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

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

const token = localStorage.getItem('token');

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
    avatar.textContent = conv.user.name.charAt(0).toUpperCase();

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
