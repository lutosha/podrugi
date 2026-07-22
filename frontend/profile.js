const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Объявление', EVENT: 'Событие' };
const AVATAR_SIZE = 160;

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

function populateBoroughSelect(select) {
  for (const [value, label] of Object.entries(BOROUGHS).sort((a, b) => a[1].localeCompare(b[1]))) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

const params = new URLSearchParams(location.search);
const profileId = Number(params.get('id'));
const token = localStorage.getItem('token');

const profileHeader = document.getElementById('profileHeader');
const profileMessage = document.getElementById('profileMessage');
const editProfileForm = document.getElementById('editProfileForm');
const editNameInput = document.getElementById('editName');
const editBoroughInput = document.getElementById('editBorough');
const editBioInput = document.getElementById('editBio');
const editAvatarInput = document.getElementById('editAvatar');
const avatarPreview = document.getElementById('avatarPreview');
const ownActions = document.getElementById('ownActions');
const profileActions = document.getElementById('profileActions');
const profilePosts = document.getElementById('profilePosts');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');

let currentUserId = null;
let currentUserRole = null;
let isFollowing = false;
let pendingAvatarData = null;

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

function renderProfileHeader(user) {
  profileHeader.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'profile-header';

  const avatar = document.createElement('div');
  avatar.className = 'post-avatar';
  setAvatarContent(avatar, user);

  const info = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.textContent = user.name;
  const boroughP = document.createElement('p');
  boroughP.textContent = BOROUGHS[user.borough];
  info.append(h1, boroughP);

  if (user.bio) {
    const bioP = document.createElement('p');
    bioP.className = 'post-content';
    bioP.textContent = user.bio;
    info.appendChild(bioP);
  }

  wrap.append(avatar, info);
  profileHeader.appendChild(wrap);
}

function buildOwnProfile(user) {
  renderProfileHeader(user);
  editNameInput.value = user.name;
  editBoroughInput.value = user.borough;
  editBioInput.value = user.bio || '';
  setAvatarContent(avatarPreview, user);
  editProfileForm.classList.remove('hidden');

  ownActions.innerHTML = '';
  ownActions.classList.remove('hidden');

  if (currentUserRole === 'MODERATOR' || currentUserRole === 'ADMIN') {
    const modLink = document.createElement('a');
    modLink.className = 'link-btn';
    modLink.textContent = 'Модерация';
    modLink.href = 'moderation.html';
    ownActions.appendChild(modLink);
  }

  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.className = 'link-btn';
  logoutBtn.textContent = 'Выйти';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.href = 'index.html';
  });
  ownActions.appendChild(logoutBtn);
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

  const flagWrap = document.createElement('div');
  flagWrap.className = 'flag-wrap';

  const flagBtn = document.createElement('button');
  flagBtn.type = 'button';
  flagBtn.className = 'flag-btn';
  flagBtn.title = 'Пожаловаться или заблокировать';
  flagBtn.textContent = '🚩';

  const flagMenu = document.createElement('div');
  flagMenu.className = 'flag-menu hidden';

  flagBtn.addEventListener('click', () => {
    flagMenu.classList.toggle('hidden');
  });

  const reportMenuBtn = document.createElement('button');
  reportMenuBtn.type = 'button';
  reportMenuBtn.textContent = 'Пожаловаться';
  reportMenuBtn.addEventListener('click', async () => {
    flagMenu.classList.add('hidden');
    const reason = prompt('Причина жалобы:');
    if (!reason) return;
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetType: 'USER', targetId: profileId, reason }),
    });
    if (res.ok) {
      reportMenuBtn.textContent = 'Жалоба отправлена';
      reportMenuBtn.disabled = true;
    }
  });

  const blockMenuBtn = document.createElement('button');
  blockMenuBtn.type = 'button';
  blockMenuBtn.textContent = 'Заблокировать';
  blockMenuBtn.addEventListener('click', async () => {
    flagMenu.classList.add('hidden');
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

  flagMenu.append(reportMenuBtn, blockMenuBtn);
  flagWrap.append(flagBtn, flagMenu);

  profileActions.append(followBtn, messageLink, flagWrap);
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
    setAvatarContent(avatar, post.author);

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

function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(AVATAR_SIZE / img.width, AVATAR_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (AVATAR_SIZE - w) / 2, (AVATAR_SIZE - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

editAvatarInput.addEventListener('change', async () => {
  const file = editAvatarInput.files[0];
  if (!file) return;
  pendingAvatarData = await resizeImageToDataUrl(file);
  setAvatarContent(avatarPreview, { name: editNameInput.value || '?', avatar: pendingAvatarData });
});

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
  const user = await res.json();
  bottomProfileLink.href = `profile.html?id=${user.id}`;
  setAvatarContent(bottomProfileAvatar, user);
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
      currentUserRole = me.role;
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
  const body = { name: editNameInput.value, borough: editBoroughInput.value, bio: editBioInput.value };
  if (pendingAvatarData) body.avatar = pendingAvatarData;

  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    profileMessage.textContent = data.error || 'Не удалось сохранить';
    return;
  }

  profileMessage.textContent = 'Сохранено!';
  pendingAvatarData = null;
  renderProfileHeader(data);
  setAvatarContent(bottomProfileAvatar, data);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.flag-wrap')) {
    document.querySelectorAll('.flag-menu').forEach((m) => m.classList.add('hidden'));
  }
});

populateBoroughSelect(editBoroughInput);
loadProfile();
initBottomNav();
