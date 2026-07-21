const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const friendsMessage = document.getElementById('friendsMessage');
const friendsList = document.getElementById('friendsList');
const token = localStorage.getItem('token');

function renderFriends(friends) {
  friendsList.innerHTML = '';
  if (friends.length === 0) {
    friendsMessage.textContent = 'Пока нет подруг — добавляй со страниц постов кнопкой «Добавить в подруги».';
    return;
  }
  friendsMessage.textContent = '';

  for (const friend of friends) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.textContent = friend.name.charAt(0).toUpperCase();

    const body = document.createElement('div');
    body.className = 'post-body';
    const name = document.createElement('p');
    name.className = 'post-meta';
    const nameLink = document.createElement('a');
    nameLink.className = 'author-link';
    nameLink.href = `profile.html?id=${friend.id}`;
    nameLink.textContent = friend.city ? `${friend.name}, ${friend.city}` : friend.name;
    name.appendChild(nameLink);
    const messageLink = document.createElement('a');
    messageLink.className = 'link-btn';
    messageLink.textContent = 'Написать';
    messageLink.href = `messages.html?to=${friend.id}&name=${encodeURIComponent(friend.name)}`;
    body.append(name, messageLink);

    card.append(avatar, body);
    friendsList.appendChild(card);
  }
}

async function loadFriends() {
  if (!token) {
    friendsMessage.textContent = 'Войди в аккаунт на главной странице, чтобы посмотреть подруг.';
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    friendsMessage.textContent = 'Не удалось загрузить список подруг.';
    return;
  }
  const friends = await res.json();
  renderFriends(friends);
}

loadFriends();
