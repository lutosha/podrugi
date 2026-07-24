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
const postTitleInput = document.getElementById('postTitle');
const postEventDateInput = document.getElementById('postEventDate');
const postVenueInput = document.getElementById('postVenue');
const postAddressInput = document.getElementById('postAddress');
const postMaxParticipantsInput = document.getElementById('postMaxParticipants');
const postTagsInput = document.getElementById('postTags');
const eventTitleField = document.getElementById('eventTitleField');
const eventDateField = document.getElementById('eventDateField');
const eventVenueField = document.getElementById('eventVenueField');
const eventAddressField = document.getElementById('eventAddressField');
const eventLimitField = document.getElementById('eventLimitField');
const eventTagsField = document.getElementById('eventTagsField');
const typeTabs = document.querySelectorAll('.type-tab');
const postsList = document.getElementById('postsList');
const companyRow = document.getElementById('companyRow');
const companyLoadMore = document.getElementById('companyLoadMore');
const eventsRow = document.getElementById('eventsRow');
const eventsLoadMore = document.getElementById('eventsLoadMore');
const createEventBtn = document.getElementById('createEventBtn');
const createCompanyBtn = document.getElementById('createCompanyBtn');
const createPostBtn = document.getElementById('createPostBtn');
const viewPostModal = document.getElementById('viewPostModal');
const viewPostBody = document.getElementById('viewPostBody');
const closeViewPostModalBtn = document.getElementById('closeViewPostModal');
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
const heroSection = document.getElementById('heroSection');
const authTabLogin = document.getElementById('authTabLogin');
const authTabRegister = document.getElementById('authTabRegister');

const TYPE_LABELS = { POST: 'Пост', ANNOUNCEMENT: 'Ищу компанию', EVENT: 'Событие' };

// иконки карточек — как в мокапе, inline SVG
const HEART_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.6-10-9.3C.5 8 2 4 6 3.2c2.3-.4 4.3.7 6 2.8 1.7-2.1 3.7-3.2 6-2.8 4 .8 5.5 4.8 4 8.5-2.5 4.7-10 9.3-10 9.3Z" stroke="currentColor" stroke-width="1.7"/></svg>';
const COMMENT_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" stroke-width="1.7"/></svg>';
const ADD_FRIEND_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3 19c.6-3 2.9-5 6-5s5.4 2 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M18 8v6M15 11h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const FRIEND_CHECK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.3" stroke="currentColor" stroke-width="1.7"/><path d="M3 19c.6-3 2.9-5 6-5s5.4 2 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M15 11.5l2 2 3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const WRITE_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21.5 2.5 11 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.5 2.5 15 21l-4-8-8-4 18.5-6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PIN_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.7"/></svg>';
const CAL_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
const RSVP_GOING_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RSVP_MAYBE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.7"/><text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor">?</text></svg>';
const ICS_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 9.5h18" stroke="currentColor" stroke-width="1.7"/><path d="M8 2.5v4M16 2.5v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 12.5v5M9.5 15h5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const SHARE_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="6" r="2.4" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="18" r="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.8l7.6-4.2M8.2 13.2l7.6 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

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

function buildAvatarElement(user) {
  const el = document.createElement('div');
  el.className = 'post-avatar';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.style.background = avatarGradient(user.name);
    el.textContent = user.name.charAt(0).toUpperCase();
  }
  return el;
}

const POST_PLACEHOLDERS = {
  ANNOUNCEMENT: 'Ищете компанию для йоги, музея или соседку по квартире? Напишите здесь',
  EVENT: 'Планируете встречу, пикник или мастер-класс? Расскажите, когда и куда приходить',
  POST: 'Посоветуйте мастера, место или продайте/отдайте вещь — соседки увидят',
};

function setPostType(type) {
  selectedType = type;
  typeTabs.forEach((t) => t.classList.toggle('active', t.dataset.type === type));
  const isEvent = selectedType === 'EVENT';
  eventTitleField.classList.toggle('hidden', !isEvent);
  postTitleInput.required = isEvent;
  eventDateField.classList.toggle('hidden', !isEvent);
  postEventDateInput.required = isEvent;
  eventVenueField.classList.toggle('hidden', !isEvent);
  eventAddressField.classList.toggle('hidden', !isEvent);
  eventLimitField.classList.toggle('hidden', !isEvent);
  eventTagsField.classList.toggle('hidden', !isEvent);
  postContentInput.placeholder = POST_PLACEHOLDERS[type] || '';
}

typeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setPostType(tab.dataset.type));
});
setPostType(selectedType);

function openModal(newMode) {
  mode = newMode;
  authTabLogin.classList.toggle('active', mode === 'login');
  authTabRegister.classList.toggle('active', mode === 'register');
  nameInput.classList.toggle('hidden', mode === 'login');
  boroughInput.classList.toggle('hidden', mode === 'login');
  boroughInput.required = mode !== 'login';
  ageLabel.classList.toggle('hidden', mode === 'login');
  authMessage.textContent = '';
  modal.classList.remove('hidden');
}

authTabLogin.addEventListener('click', () => openModal('login'));
authTabRegister.addEventListener('click', () => openModal('register'));

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
  heroSection?.classList.add('hidden');
  feedHint.classList.add('hidden');
  feedScope.classList.remove('hidden');
  notificationsLink.classList.remove('hidden');
  bottomProfileLink.href = `profile.html?id=${user.id}`;
  bottomProfileAvatar.innerHTML = '';
  bottomProfileAvatar.style.background = '';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    bottomProfileAvatar.appendChild(img);
  } else {
    bottomProfileAvatar.style.background = avatarGradient(user.name);
    bottomProfileAvatar.textContent = user.name.charAt(0).toUpperCase();
  }
  updateNavBadges();
}

function showLoggedOut() {
  currentUser = null;
  guestNav.classList.remove('hidden');
  bottomNav.classList.add('hidden');
  heroSection?.classList.remove('hidden');
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
  section.className = 'post-comments hidden';

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

function buildRsvpRow(post) {
  const row = document.createElement('div');
  row.className = 'rsvp-row';

  const goingCount = post.rsvps.filter((r) => r.status === 'GOING').length;
  const maybeCount = post.rsvps.filter((r) => r.status === 'MAYBE').length;
  const myRsvp = currentUser ? post.rsvps.find((r) => r.userId === currentUser.id) : null;
  const isFull = post.maxParticipants != null && goingCount >= post.maxParticipants;

  const statuses = [
    {
      status: 'GOING',
      title: 'Иду',
      icon: RSVP_GOING_SVG,
      count: post.maxParticipants != null ? `${goingCount}/${post.maxParticipants}` : `${goingCount}`,
    },
    { status: 'MAYBE', title: 'Возможно', icon: RSVP_MAYBE_SVG, count: `${maybeCount}` },
  ];

  for (const { status, title, icon, count } of statuses) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rsvp-btn';
    button.title = title;
    button.setAttribute('aria-label', title);
    button.classList.toggle('active', myRsvp?.status === status);
    button.innerHTML = `${icon}<span>${count}</span>`;
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

    row.appendChild(button);
  }

  return row;
}

// ряд действий под постом/событием: лайк, комментарии (тумблер), иконки справа.
// isEvent=true → вместо «написать в личку» показываем «добавить в календарь».
function buildActionRow(post, commentsSection, isEvent = false) {
  const row = document.createElement('div');
  row.className = 'action-row';

  const heartBtn = document.createElement('button');
  heartBtn.type = 'button';
  heartBtn.className = 'heart-btn';
  const myReaction = currentUser ? post.reactions.some((r) => r.userId === currentUser.id) : false;
  heartBtn.classList.toggle('liked', myReaction);
  heartBtn.disabled = !currentUser;
  heartBtn.innerHTML = `${HEART_SVG}<span>${post.reactions.length}</span>`;
  heartBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const method = myReaction ? 'DELETE' : 'POST';
    const res = await fetch(`${API_BASE_URL}/api/posts/${post.id}/react`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) fetchPosts();
  });
  row.appendChild(heartBtn);

  const commentBtn = document.createElement('button');
  commentBtn.type = 'button';
  commentBtn.className = 'comment-btn';
  commentBtn.title = 'Комментарии';
  commentBtn.innerHTML = `${COMMENT_SVG}<span>${post.comments.length}</span>`;
  commentBtn.addEventListener('click', () => {
    commentsSection.classList.toggle('hidden');
  });
  row.appendChild(commentBtn);

  const iconActions = document.createElement('div');
  iconActions.className = 'icon-actions';
  let hasIcon = false;

  if (currentUser && currentUser.id !== post.author.id) {
    const followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'icon-action-btn';
    followBtn.classList.toggle('on', post.authorIsFollowed);
    followBtn.title = post.authorIsFollowed ? 'В подругах' : 'Добавить в подруги';
    followBtn.setAttribute('aria-label', followBtn.title);
    followBtn.innerHTML = post.authorIsFollowed ? FRIEND_CHECK_SVG : ADD_FRIEND_SVG;
    followBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      const method = post.authorIsFollowed ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/follow/${post.author.id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) fetchPosts();
    });
    iconActions.appendChild(followBtn);
    hasIcon = true;

    // «написать в личку» — только у постов (у мероприятий на этом месте календарь)
    if (!isEvent) {
      const writeLink = document.createElement('a');
      writeLink.className = 'icon-action-btn';
      writeLink.title = 'Написать в личку';
      writeLink.setAttribute('aria-label', 'Написать в личку');
      writeLink.href = `messages.html?to=${post.author.id}&name=${encodeURIComponent(post.author.name)}`;
      writeLink.innerHTML = WRITE_SVG;
      iconActions.appendChild(writeLink);
    }
  }

  // «добавить в календарь» — у мероприятий, доступно всем (включая гостя и автора)
  if (isEvent) {
    const calLink = document.createElement('a');
    calLink.className = 'icon-action-btn';
    calLink.title = 'Добавить в календарь';
    calLink.setAttribute('aria-label', 'Добавить в календарь');
    calLink.href = `${API_BASE_URL}/api/posts/${post.id}/ics`;
    calLink.innerHTML = ICS_SVG;
    iconActions.appendChild(calLink);
    hasIcon = true;
  }

  if (hasIcon) row.appendChild(iconActions);

  return row;
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
    const card = document.createElement('article');
    card.className = 'card';

    const top = document.createElement('div');
    top.className = 'card-top';

    const avatar = buildAvatarElement(post.author);

    const body = document.createElement('div');
    body.className = 'card-body';

    const authorRow = document.createElement('div');
    authorRow.className = 'card-author-row';
    const authorLink = document.createElement('a');
    authorLink.className = 'author-name';
    authorLink.href = `profile.html?id=${post.author.id}`;
    authorLink.textContent = post.author.name;
    authorRow.appendChild(authorLink);
    body.appendChild(authorRow);

    if (post.borough) {
      const metaRow = document.createElement('div');
      metaRow.className = 'event-meta-row';
      metaRow.innerHTML = PIN_SVG;
      const boroughSpan = document.createElement('span');
      boroughSpan.textContent = BOROUGHS[post.borough];
      metaRow.appendChild(boroughSpan);
      body.appendChild(metaRow);
    }

    const content = document.createElement('p');
    content.className = 'card-text';
    content.textContent = post.content;
    body.appendChild(content);

    const postUrl = `post.html?id=${post.id}`;

    const comments = buildCommentsSection(post);
    body.appendChild(buildActionRow(post, comments));
    body.appendChild(comments);

    top.append(avatar, body);
    card.appendChild(top);

    postsList.appendChild(card);

    // если текст обрезан (>5 строк) — по клику открываем пост целиком на отдельной странице
    requestAnimationFrame(() => {
      if (content.scrollHeight - content.clientHeight > 2) {
        content.classList.add('truncated');
        content.addEventListener('click', () => { window.location.href = postUrl; });
        const more = document.createElement('a');
        more.className = 'read-more';
        more.href = postUrl;
        more.textContent = 'Читать дальше';
        content.after(more);
      }
    });
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
    const card = document.createElement('div');
    card.className = 'human-card';

    // кружок аватара ведёт на профиль автора
    const avatarWrap = document.createElement('a');
    avatarWrap.className = 'human-avatar-wrap';
    avatarWrap.href = `profile.html?id=${post.author.id}`;
    avatarWrap.appendChild(buildAvatarElement(post.author));
    const dot = document.createElement('span');
    dot.className = 'human-status-dot';
    avatarWrap.appendChild(dot);

    // текст + район открывают сообщение в модалке
    const info = document.createElement('button');
    info.type = 'button';
    info.className = 'human-info';

    const status = document.createElement('div');
    status.className = 'human-status';
    status.textContent = post.content;
    info.appendChild(status);

    if (post.borough) {
      const meta = document.createElement('div');
      meta.className = 'human-meta';
      meta.textContent = BOROUGHS[post.borough];
      info.appendChild(meta);
    }

    info.addEventListener('click', () => openViewPostModal(post));

    card.append(avatarWrap, info);
    companyRow.appendChild(card);

    // обрезаем превью до 2 строк с чистым «…» (без пробела перед троеточием).
    // чтение scrollHeight форсирует синхронный layout, поэтому меряем сразу после вставки.
    clampToLines(status, post.content, 2);
  }

  companyLoadMore.classList.toggle('hidden', posts.length <= companyVisible);
}

// подрезать текст элемента до maxLines строк, добавив «…» вплотную к последнему слову
function clampToLines(el, fullText, maxLines) {
  el.textContent = fullText;
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 16;
  const maxHeight = lineHeight * maxLines + 1;
  if (el.scrollHeight <= maxHeight) return;
  const words = fullText.split(/\s+/);
  while (words.length > 1 && el.scrollHeight > maxHeight) {
    words.pop();
    el.textContent = words.join(' ') + '…';
  }
}

function closeViewPostModal() {
  viewPostModal.classList.add('hidden');
  viewPostBody.innerHTML = '';
}

// показать полное сообщение «Ищу компанию» в модалке + переписка в личке
function openViewPostModal(post) {
  viewPostBody.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'view-post-header';
  const avatarLink = document.createElement('a');
  avatarLink.href = `profile.html?id=${post.author.id}`;
  avatarLink.appendChild(buildAvatarElement(post.author));
  const nameLink = document.createElement('a');
  nameLink.className = 'view-post-name';
  nameLink.href = `profile.html?id=${post.author.id}`;
  nameLink.textContent = post.author.name;
  header.append(avatarLink, nameLink);
  viewPostBody.appendChild(header);

  if (post.borough) {
    const borough = document.createElement('div');
    borough.className = 'view-post-borough';
    borough.innerHTML = PIN_SVG;
    const span = document.createElement('span');
    span.textContent = BOROUGHS[post.borough];
    borough.appendChild(span);
    viewPostBody.appendChild(borough);
  }

  const text = document.createElement('p');
  text.className = 'view-post-text';
  text.textContent = post.content;
  viewPostBody.appendChild(text);

  viewPostBody.appendChild(buildDmSection(post.author));

  viewPostModal.classList.remove('hidden');
}

// личная переписка с автором объявления (тянется из /api/messages)
function buildDmSection(author) {
  const wrap = document.createElement('div');
  wrap.className = 'view-post-dm';

  if (!currentUser) {
    const hint = document.createElement('p');
    hint.className = 'dm-hint';
    hint.textContent = 'Войди, чтобы написать в личку.';
    wrap.appendChild(hint);
    return wrap;
  }
  if (currentUser.id === author.id) {
    const hint = document.createElement('p');
    hint.className = 'dm-hint';
    hint.textContent = 'Это твоё объявление.';
    wrap.appendChild(hint);
    return wrap;
  }

  const thread = document.createElement('div');
  thread.className = 'dm-thread';
  wrap.appendChild(thread);
  loadDmThread(author.id, thread);

  const form = document.createElement('form');
  form.className = 'comment-form';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Написать в личку…';
  input.maxLength = 2000;
  input.required = true;
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'btn btn-primary';
  button.textContent = 'Отправить';
  form.append(input, button);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/messages/${author.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: input.value }),
    });
    if (res.ok) {
      input.value = '';
      loadDmThread(author.id, thread);
      updateNavBadges();
    }
  });
  wrap.appendChild(form);

  return wrap;
}

async function loadDmThread(userId, thread) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const messages = await res.json();
  thread.innerHTML = '';
  if (messages.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'dm-hint';
    empty.textContent = 'Начните переписку — напишите первое сообщение.';
    thread.appendChild(empty);
    return;
  }
  for (const m of messages) {
    const bubble = document.createElement('div');
    bubble.className = m.senderId === currentUser.id ? 'dm-msg dm-msg-mine' : 'dm-msg';
    bubble.textContent = m.content;
    thread.appendChild(bubble);
  }
  thread.scrollTop = thread.scrollHeight;
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

    const eventUrl = `event.html?id=${post.id}`;

    const photo = document.createElement('div');
    photo.className = 'discover-photo';
    photo.style.cursor = 'pointer';
    photo.style.background = COVER_GRAD[post.id % COVER_GRAD.length];
    // клик по фото (мимо пилюл автора/поделиться) открывает страницу мероприятия
    photo.addEventListener('click', (e) => {
      if (!e.target.closest('.discover-pill')) window.location.href = eventUrl;
    });

    const initiator = document.createElement('a');
    initiator.className = 'discover-pill discover-initiator';
    initiator.href = `profile.html?id=${post.author.id}`;
    initiator.appendChild(buildAvatarElement(post.author));
    initiator.appendChild(document.createTextNode(post.author.name));
    photo.appendChild(initiator);

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'discover-pill discover-share';
    shareBtn.setAttribute('aria-label', 'Поделиться');
    shareBtn.innerHTML = SHARE_SVG;
    shareBtn.addEventListener('click', async () => {
      const text = `${post.title || firstSentence(post.content)} — ${location.origin}${location.pathname}`;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard недоступен (например, без HTTPS) — молча игнорируем
      }
      shareBtn.innerHTML = RSVP_GOING_SVG;
      setTimeout(() => { shareBtn.innerHTML = SHARE_SVG; }, 1500);
    });
    photo.appendChild(shareBtn);

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

    const headline = document.createElement('a');
    headline.className = 'card-headline';
    headline.href = eventUrl;
    headline.textContent = post.title || firstSentence(post.content);
    bodyEl.appendChild(headline);

    const eventDate = document.createElement('div');
    eventDate.className = 'event-meta-row';
    eventDate.innerHTML = CAL_SVG;
    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatEventDate(post.eventDate);
    eventDate.appendChild(dateSpan);
    bodyEl.appendChild(eventDate);

    bodyEl.appendChild(buildRsvpRow(post));

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

    const comments = buildCommentsSection(post);
    footer.appendChild(buildActionRow(post, comments, true));

    bodyEl.appendChild(footer);
    bodyEl.appendChild(comments);

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

createCompanyBtn.addEventListener('click', () => {
  if (!currentUser) { openModal('login'); return; }
  openPostModal('ANNOUNCEMENT');
});

createPostBtn.addEventListener('click', () => {
  if (!currentUser) { openModal('login'); return; }
  openPostModal('POST');
});

closeViewPostModalBtn.addEventListener('click', closeViewPostModal);
viewPostModal.addEventListener('click', (e) => {
  if (e.target === viewPostModal) closeViewPostModal();
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
    body.title = postTitleInput.value;
    body.eventDate = postEventDateInput.value;
    body.venue = postVenueInput.value;
    body.address = postAddressInput.value;
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
      openModal('login');
      authMessage.textContent = 'Готово! Теперь войди со своим email и паролем.';
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
