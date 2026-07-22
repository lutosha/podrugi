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

const friendsMessage = document.getElementById('friendsMessage');
const friendsList = document.getElementById('friendsList');
const nearbyMessage = document.getElementById('nearbyMessage');
const nearbyList = document.getElementById('nearbyList');
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
    setAvatarContent(avatar, friend);

    const body = document.createElement('div');
    body.className = 'post-body';
    const name = document.createElement('p');
    name.className = 'post-meta';
    const nameLink = document.createElement('a');
    nameLink.className = 'author-link';
    nameLink.href = `profile.html?id=${friend.id}`;
    nameLink.textContent = `${friend.name}, ${BOROUGHS[friend.borough]}`;
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

  await fetch(`${API_BASE_URL}/api/friends/seen`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

function renderNearby(users) {
  nearbyList.innerHTML = '';
  if (users.length === 0) {
    nearbyMessage.textContent = 'Пока никого не нашлось в твоём районе.';
    return;
  }
  nearbyMessage.textContent = '';

  for (const user of users) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    setAvatarContent(avatar, user);

    const body = document.createElement('div');
    body.className = 'post-body';
    const name = document.createElement('p');
    name.className = 'post-meta';
    const nameLink = document.createElement('a');
    nameLink.className = 'author-link';
    nameLink.href = `profile.html?id=${user.id}`;
    nameLink.textContent = `${user.name}, ${BOROUGHS[user.borough]}`;
    name.appendChild(nameLink);

    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'link-btn';
    followBtn.textContent = 'Добавить в подруги';
    followBtn.addEventListener('click', async () => {
      const res = await fetch(`${API_BASE_URL}/api/follow/${user.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        card.remove();
        if (!nearbyList.children.length) {
          nearbyMessage.textContent = 'Пока никого не нашлось в твоём районе.';
        }
        loadFriends();
      }
    });

    body.appendChild(name);
    if (user.bio) {
      const content = document.createElement('p');
      content.className = 'post-content';
      content.textContent = user.bio;
      body.appendChild(content);
    }
    body.appendChild(followBtn);
    card.append(avatar, body);
    nearbyList.appendChild(card);
  }
}

async function loadNearby() {
  if (!token) {
    nearbyMessage.textContent = 'Войди в аккаунт на главной странице, чтобы увидеть людей рядом.';
    return;
  }
  const res = await fetch(`${API_BASE_URL}/api/nearby`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const users = await res.json();
  renderNearby(users);
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

loadFriends();
loadNearby();
initBottomNav();
