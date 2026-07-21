const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Объявление', EVENT: 'Событие' };

const params = new URLSearchParams(location.search);
const profileId = Number(params.get('id'));
const token = localStorage.getItem('token');

const profileHeader = document.getElementById('profileHeader');
const profileMessage = document.getElementById('profileMessage');
const editProfileForm = document.getElementById('editProfileForm');
const editNameInput = document.getElementById('editName');
const editCityInput = document.getElementById('editCity');
const profileActions = document.getElementById('profileActions');
const profilePosts = document.getElementById('profilePosts');

let currentUserId = null;
let isFollowing = false;

function renderProfileHeader(user) {
  profileHeader.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'profile-header';

  const avatar = document.createElement('div');
  avatar.className = 'post-avatar';
  avatar.textContent = user.name.charAt(0).toUpperCase();

  const info = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.textContent = user.name;
  const cityP = document.createElement('p');
  cityP.textContent = user.city || 'Район не указан';
  info.append(h1, cityP);

  wrap.append(avatar, info);
  profileHeader.appendChild(wrap);
}

function buildOwnProfile(user) {
  renderProfileHeader(user);
  editNameInput.value = user.name;
  editCityInput.value = user.city || '';
  editProfileForm.classList.remove('hidden');
}

function buildOtherProfile(user) {
  renderProfileHeader(user);
  profileActions.innerHTML = '';
  if (!token) return;

  const followBtn = document.createElement('button');
  followBtn.type = 'button';
  followBtn.className = 'link-btn';
  followBtn.textContent = isFollowing ? 'В подругах ✓' : 'Добавить в подруги';
  followBtn.addEventListener('click', async () => {
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`${API_BASE_URL}/api/follow/${profileId}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) {
      isFollowing = !isFollowing;
      followBtn.textContent = isFollowing ? 'В подругах ✓' : 'Добавить в подруги';
    }
  });

  const messageLink = document.createElement('a');
  messageLink.className = 'link-btn';
  messageLink.textContent = 'Написать';
  messageLink.href = `messages.html?to=${profileId}&name=${encodeURIComponent(user.name)}`;

  const reportBtn = document.createElement('button');
  reportBtn.type = 'button';
  reportBtn.className = 'link-btn';
  reportBtn.textContent = 'Пожаловаться';
  reportBtn.addEventListener('click', async () => {
    const reason = prompt('Причина жалобы:');
    if (!reason) return;
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: 'USER', targetId: profileId, reason }),
    });
    if (res.ok) {
      reportBtn.textContent = 'Жалоба отправлена';
      reportBtn.disabled = true;
    }
  });

  const blockBtn = document.createElement('button');
  blockBtn.type = 'button';
  blockBtn.className = 'link-btn';
  blockBtn.textContent = 'Заблокировать';
  blockBtn.addEventListener('click', async () => {
    if (!confirm(`Заблокировать ${user.name}? Её посты перестанут показываться тебе.`)) return;
    const res = await fetch(`${API_BASE_URL}/api/block/${profileId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      profileMessage.textContent = 'Пользователь заблокирован.';
      profileActions.innerHTML = '';
      profilePosts.innerHTML = '';
    }
  });

  profileActions.append(followBtn, messageLink, reportBtn, blockBtn);
}

function renderPosts(posts) {
  profilePosts.innerHTML = '';
  if (posts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'post-content';
    empty.textContent = 'Пока нет постов.';
    profilePosts.appendChild(empty);
    return;
  }

  for (const post of posts) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.textContent = post.author.name.charAt(0).toUpperCase();

    const body = document.createElement('div');
    body.className = 'post-body';

    if (post.type !== 'POST') {
      const badge = document.createElement('span');
      badge.className = 'post-type-badge';
      badge.textContent = TYPE_LABELS[post.type];
      body.appendChild(badge);
    }

    const content = document.createElement('p');
    content.className = 'post-content';
    content.textContent = post.content;
    body.appendChild(content);

    card.append(avatar, body);
    profilePosts.appendChild(card);
  }
}

async function loadProfile() {
  if (!profileId || !Number.isInteger(profileId)) {
    profileMessage.textContent = 'Профиль не найден.';
    return;
  }

  const userRes = await fetch(`${API_BASE_URL}/api/users/${profileId}`);
  if (!userRes.ok) {
    profileMessage.textContent = 'Профиль не найден.';
    return;
  }
  const user = await userRes.json();

  if (token) {
    const meRes = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (meRes.ok) {
      const me = await meRes.json();
      currentUserId = me.id;
    }
  }

  const isOwn = currentUserId === profileId;

  if (isOwn) {
    buildOwnProfile(user);
  } else {
    if (token) {
      const friendsRes = await fetch(`${API_BASE_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (friendsRes.ok) {
        const friends = await friendsRes.json();
        isFollowing = friends.some((f) => f.id === profileId);
      }
    }
    buildOtherProfile(user);
  }

  const postsRes = await fetch(`${API_BASE_URL}/api/posts?authorId=${profileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (postsRes.ok) {
    renderPosts(await postsRes.json());
  }
}

editProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: editNameInput.value, city: editCityInput.value }),
  });
  const data = await res.json();

  if (!res.ok) {
    profileMessage.textContent = data.error || 'Не удалось сохранить';
    return;
  }

  profileMessage.textContent = 'Сохранено!';
  renderProfileHeader(data);
});

loadProfile();
