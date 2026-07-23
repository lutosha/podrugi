const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://api.podrugi.co.uk';

const modal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const nameInput = document.getElementById('name');
const boroughInput = document.getElementById('borough');
const ageLabel = document.getElementById('ageLabel');
const ageConfirmedInput = document.getElementById('ageConfirmed');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const guestNav = document.getElementById('guestNav');
const postModal = document.getElementById('postModal');
const closePostModalBtn = document.getElementById('closePostModal');
const postForm = document.getElementById('postForm');
const postContentInput = document.getElementById('postContent');
const postBoroughInput = document.getElementById('postBorough');
const postEventDateInput = document.getElementById('postEventDate');
const postMaxParticipantsInput = document.getElementById('postMaxParticipants');
const postTagsInput = document.getElementById('postTags');
const typeTabs = document.querySelectorAll('.type-tab');
const postsList = document.getElementById('postsList');
const companyRow = document.getElementById('companyRow');
const companyLoadMore = document.getElementById('companyLoadMore');
const eventsRow = document.getElementById('eventsRow');
const eventsLoadMore = document.getElementById('eventsLoadMore');
const createEventBtn = document.getElementById('createEventBtn');
const feedHint = document.getElementById('feedHint');
const districtSelect = document.getElementById('districtSelect');
const districtTrigger = document.getElementById('districtTrigger');
const districtMenu = document.getElementById('districtMenu');
const districtLabel = document.getElementById('districtLabel');
const feedScope = document.getElementById('feedScope');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');
const composeNavBtn = document.getElementById('composeNavBtn');
const notificationsLink = document.getElementById('notificationsLink');

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Объявление', EVENT: 'Событие' };

const FLAG_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>';

const HEART_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

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

function populateBoroughSelect(select, { placeholder } = {}) {
  for (const [value, label] of Object.entries(BOROUGHS).sort((a, b) => a[1].localeCompare(b[1]))) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

let mode = 'login';
let selectedType = 'POST';
let currentUser = null;
let selectedBorough = '';
let feedScopeValue = 'all';
let latestPosts = [];
let companyVisible = 3;
let eventsVisible = 3;
let districtMenuOpen = false;

const COVER_GRAD = [
  'radial-gradient(120% 140% at 12% 0%, rgba(163,177,138,.9), transparent 55%), radial-gradient(110% 130% at 100% 100%, rgba(229,152,155,.65), transparent 55%), linear-gradient(160deg,#3F5A4C,#20302A)',
  'radial-gradient(120% 140% at 90% 0%, rgba(229,152,155,.85), transparent 55%), radial-gradient(110% 130% at 0% 100%, rgba(163,177,138,.7), transparent 55%), linear-gradient(160deg,#4A3B4E,#241B26)',
  'radial-gradient(120% 140% at 20% 100%, rgba(163,177,138,.85), transparent 55%), radial-gradient(110% 130% at 100% 0%, rgba(229,152,155,.65), transparent 55%), linear-gradient(160deg,#2F4A44,#17241F)',
];

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

function setPostType(type) {
  selectedType = type;
  typeTabs.forEach((t) => t.classList.toggle('active', t.dataset.type === type));
  postEventDateInput.classList.toggle('hidden', selectedType !== 'EVENT');
  postEventDateInput.required = selectedType === 'EVENT';
  postMaxParticipantsInput.classList.toggle('hidden', selectedType !== 'EVENT');
  postTagsInput.classList.toggle('hidden', selectedType !== 'EVENT');
}

typeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setPostType(tab.dataset.type));
});

function openModal(newMode) {
  mode = newMode;
  modalTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
  nameInput.classList.toggle('hidden', mode === 'login');
  boroughInput.classList.toggle('hidden', mode === 'login');
  boroughInput.required = mode !== 'login';
  ageLabel.classList.toggle('hidden', mode === 'login');
  authMessage.textContent = '';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  authForm.reset();
}

function openPostModal(type) {
  if (type) setPostType(type);
  postModal.classList.remove('hidden');
}

function closePostModal() {
  postModal.classList.add('hidden');
}

async function updateNavBadges() {
  const token = localStorage.getItem('token');
  if (!token) return;
  const res = await fetch(`${API_BASE_URL}/api/unread`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return;
  const unread = await res.json();
  document.getElementById('friendsBadge')?.classList.toggle('hidden', !unread.friends);
  document.getElementById('messagesBadge')?.classList.toggle('hidden', !unread.messages);
  document.getElementById('notificationsBadge')?.classList.toggle('hidden', !unread.notifications);
}

function showLoggedIn(user) {
  currentUser = user;
  guestNav.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  document.body.classList.add('has-bottom-nav');
  feedHint.classList.add('hidden');
  feedScope.classList.remove('hidden');
  notificationsLink.classList.remove('hidden');
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
  updateNavBadges();
}

function showLoggedOut() {
  currentUser = null;
  guestNav.classList.remove('hidden');
  bottomNav.classList.add('hidden');
  document.body.classList.remove('has-bottom-nav');
  feedHint.classList.remove('hidden');
  feedScope.classList.add('hidden');
  feedScopeValue = 'all';
  notificationsLink.classList.add('hidden');
  closePostModal();
}

function formatEventDate(isoString) {
  const date = new Date(isoString);
  const options = { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleString('ru-RU', options);
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
  const isFull = post.maxParticipants != null && goingCount >= post.maxParticipants;

  const statuses = [
    { status: 'GOING', label: post.maxParticipants != null ? `Иду (${goingCount}/${post.maxParticipants})` : `Иду (${goingCount})` },
    { status: 'MAYBE', label: `Возможно (${maybeCount})` },
  ];

  for (const { status, label } of statuses) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rsvp-btn';
    button.classList.toggle('active', myRsvp?.status === status);
    button.textContent = label;
    button.disabled = !currentUser || (status === 'GOING' && isFull && myRsvp?.status !== 'GOING');

    button.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || 'Не удалось отправить RSVP');
      }
    });

    section.appendChild(button);
  }

  return section;
}

function buildReactionButton(post) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reaction-btn';
  const myReaction = currentUser ? post.reactions.some((r) => r.userId === currentUser.id) : false;
  button.classList.toggle('active', myReaction);
  button.disabled = !currentUser;
  button.innerHTML = `${HEART_ICON_SVG}<span>${post.reactions.length}</span>`;

  button.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const method = myReaction ? 'DELETE' : 'POST';
    const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/react`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) fetchPosts();
  });

  return button;
}

function buildActionsSection(post) {
  const section = document.createElement('div');
  section.className = 'post-actions';

  const flagWrap = document.createElement('div');
  flagWrap.className = 'flag-wrap flag-corner';

  const flagBtn = document.createElement('button');
  flagBtn.type = 'button';
  flagBtn.className = 'flag-btn';
  flagBtn.title = 'Пожаловаться или заблокировать';
  flagBtn.innerHTML = FLAG_ICON_SVG;

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
  section.appendChild(reportForm);

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

  return { section, flagWrap };
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Пока нет постов в этом районе.';
    postsList.appendChild(empty);
    return;
  }

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
    if (post.borough) {
      meta.appendChild(document.createTextNode(`, ${BOROUGHS[post.borough]}`));
    }

    const content = document.createElement('p');
    content.className = 'post-content';
    content.textContent = post.content;

    body.append(meta, content);
    body.appendChild(buildReactionButton(post));

    if (currentUser) {
      const { section, flagWrap } = buildActionsSection(post);
      card.appendChild(flagWrap);
      body.appendChild(section);
    }

    body.appendChild(buildCommentsSection(post));

    card.append(avatar, body);
    postsList.appendChild(card);
  }
}

function renderCompanyGrid(posts) {
  companyRow.innerHTML = '';
  const visible = posts.slice(0, companyVisible);

  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Пока никого нет рядом в этом районе.';
    companyRow.appendChild(empty);
    companyLoadMore.classList.add('hidden');
    return;
  }

  for (const post of visible) {
    const card = document.createElement('a');
    card.className = 'human-card';
    card.href = `profile.html?id=${post.author.id}`;

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'human-avatar-wrap';
    avatarWrap.appendChild(buildAvatarElement(post.author));
    const dot = document.createElement('span');
    dot.className = 'human-status-dot';
    avatarWrap.appendChild(dot);

    const status = document.createElement('div');
    status.className = 'human-status';
    status.textContent = post.content;

    const meta = document.createElement('div');
    meta.className = 'human-meta';
    meta.textContent = post.borough ? BOROUGHS[post.borough] : post.author.name;

    card.append(avatarWrap, status, meta);
    companyRow.appendChild(card);
  }

  companyLoadMore.classList.toggle('hidden', posts.length <= companyVisible);
}

function firstSentence(text) {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : text;
}

function renderEventCards(posts) {
  eventsRow.innerHTML = '';
  const visible = posts.slice(0, eventsVisible);

  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Пока нет мероприятий в этом районе.';
    eventsRow.appendChild(empty);
    eventsLoadMore.classList.add('hidden');
    return;
  }

  for (const post of visible) {
    const card = document.createElement('div');
    card.className = 'discover-card';

    const photo = document.createElement('div');
    photo.className = 'discover-photo';
    photo.style.background = COVER_GRAD[post.id % COVER_GRAD.length];

    const initiator = document.createElement('a');
    initiator.className = 'discover-pill discover-initiator';
    initiator.href = `profile.html?id=${post.author.id}`;
    initiator.appendChild(buildAvatarElement(post.author));
    initiator.appendChild(document.createTextNode(post.author.name));
    photo.appendChild(initiator);

    if (post.tags && post.tags.length) {
      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'discover-tags';
      for (const tag of post.tags) {
        const tagEl = document.createElement('span');
        tagEl.className = 'discover-tag';
        tagEl.textContent = tag;
        tagsWrap.appendChild(tagEl);
      }
      photo.appendChild(tagsWrap);
    }

    const bodyEl = document.createElement('div');
    bodyEl.className = 'discover-body';

    if (post.borough) {
      const distance = document.createElement('div');
      distance.className = 'discover-distance';
      distance.textContent = BOROUGHS[post.borough];
      bodyEl.appendChild(distance);
    }

    const headline = document.createElement('div');
    headline.className = 'discover-headline';
    headline.textContent = firstSentence(post.content);
    bodyEl.appendChild(headline);

    const eventDate = document.createElement('p');
    eventDate.className = 'post-event-date';
    eventDate.textContent = formatEventDate(post.eventDate);
    bodyEl.appendChild(eventDate);

    bodyEl.appendChild(buildRsvpSection(post));

    const icsLink = document.createElement('a');
    icsLink.className = 'ics-link';
    icsLink.title = 'Добавить в календарь';
    icsLink.href = `${API_BASE_URL}/api/posts/${post.id}/ics`;
    icsLink.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    bodyEl.appendChild(icsLink);

    const footer = document.createElement('div');
    footer.className = 'discover-footer';

    const going = post.rsvps.filter((r) => r.status === 'GOING');
    if (going.length) {
      const goingWrap = document.createElement('div');
      goingWrap.className = 'discover-going';
      const avatars = document.createElement('div');
      avatars.className = 'discover-going-avatars';
      for (const r of going.slice(0, 3)) {
        avatars.appendChild(buildAvatarElement(r.user));
      }
      const text = document.createElement('div');
      text.className = 'discover-going-text';
      const first = document.createElement('b');
      first.textContent = going[0].user.name;
      text.appendChild(first);
      text.appendChild(document.createTextNode(going.length > 1 ? ` и ещё ${going.length - 1} идут` : ' идёт'));
      goingWrap.append(avatars, text);
      footer.appendChild(goingWrap);
    }

    footer.appendChild(buildReactionButton(post));

    if (currentUser) {
      const { section, flagWrap } = buildActionsSection(post);
      card.appendChild(flagWrap);
      footer.appendChild(section);
    }

    bodyEl.appendChild(footer);
    bodyEl.appendChild(buildCommentsSection(post));

    card.append(photo, bodyEl);
    eventsRow.appendChild(card);
  }

  eventsLoadMore.classList.toggle('hidden', posts.length <= eventsVisible);
}

function renderFeed(posts) {
  latestPosts = posts;
  renderCompanyGrid(posts.filter((p) => p.type === 'ANNOUNCEMENT'));
  renderEventCards(posts.filter((p) => p.type === 'EVENT'));
  renderPosts(posts.filter((p) => p.type === 'POST'));
}

async function fetchPosts() {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();
  if (selectedBorough) params.set('borough', selectedBorough);
  if (feedScopeValue === 'following') params.set('following', '1');
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE_URL}/api/posts${query}`, { headers });
  if (!res.ok) return;

  const posts = await res.json();
  renderFeed(posts);
}

function districtLabelFor(borough) {
  return borough ? BOROUGHS[borough] : 'Все районы';
}

function closeDistrictMenu() {
  districtMenuOpen = false;
  districtMenu.hidden = true;
  districtTrigger.classList.remove('open');
  districtTrigger.setAttribute('aria-expanded', 'false');
}

function renderDistrictMenu(boroughs) {
  districtMenu.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.dataset.borough = '';
  allBtn.textContent = 'Все районы';
  allBtn.className = selectedBorough === '' ? 'active' : '';
  districtMenu.appendChild(allBtn);

  for (const borough of boroughs) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.borough = borough;
    btn.textContent = BOROUGHS[borough];
    btn.className = selectedBorough === borough ? 'active' : '';
    districtMenu.appendChild(btn);
  }
  districtLabel.textContent = districtLabelFor(selectedBorough);
}

async function fetchBoroughs() {
  const res = await fetch(`${API_BASE_URL}/api/boroughs`);
  if (!res.ok) return;
  const boroughs = await res.json();
  renderDistrictMenu(boroughs);
}

districtTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  districtMenuOpen = !districtMenuOpen;
  districtMenu.hidden = !districtMenuOpen;
  districtTrigger.classList.toggle('open', districtMenuOpen);
  districtTrigger.setAttribute('aria-expanded', String(districtMenuOpen));
});

districtMenu.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-borough]');
  if (!btn) return;
  selectedBorough = btn.dataset.borough;
  companyVisible = 3;
  eventsVisible = 3;
  closeDistrictMenu();
  districtMenu.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b === btn);
  });
  districtLabel.textContent = districtLabelFor(selectedBorough);
  fetchPosts();
});

document.addEventListener('click', (e) => {
  if (districtMenuOpen && !e.target.closest('.district-select')) closeDistrictMenu();
});

companyLoadMore.addEventListener('click', () => {
  companyVisible = Infinity;
  renderCompanyGrid(latestPosts.filter((p) => p.type === 'ANNOUNCEMENT'));
});

eventsLoadMore.addEventListener('click', () => {
  eventsVisible = Infinity;
  renderEventCards(latestPosts.filter((p) => p.type === 'EVENT'));
});

createEventBtn.addEventListener('click', () => {
  if (!currentUser) { openModal('login'); return; }
  openPostModal('EVENT');
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
  if (!e.target.closest('.flag-wrap')) {
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
    borough: postBoroughInput.value,
  };
  if (selectedType === 'EVENT') {
    body.eventDate = postEventDateInput.value;
    body.maxParticipants = postMaxParticipantsInput.value;
    body.tags = postTagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
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
    setPostType('POST');
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
    : { email, password, name, borough: boroughInput.value, ageConfirmed: ageConfirmedInput.checked };

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
fetchBoroughs();
populateBoroughSelect(boroughInput);
populateBoroughSelect(postBoroughInput);
