const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const modMessage = document.getElementById('modMessage');
const reportsList = document.getElementById('reportsList');
const bottomNav = document.getElementById('bottomNav');
const bottomProfileLink = document.getElementById('bottomProfileLink');
const bottomProfileAvatar = document.getElementById('bottomProfileAvatar');

function describeTarget(report) {
  if (report.reportedPost) return `Пост: «${report.reportedPost.content}»`;
  if (report.reportedUser) return `Пользователь: ${report.reportedUser.name} (${report.reportedUser.email})`;
  return 'Цель не найдена';
}

async function updateReportStatus(id, status) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (res.ok) loadReports();
}

function renderReports(reports) {
  reportsList.innerHTML = '';
  if (reports.length === 0) {
    modMessage.textContent = 'Жалоб пока нет.';
    return;
  }
  modMessage.textContent = '';

  for (const report of reports) {
    const card = document.createElement('div');
    card.className = 'post-card';

    const body = document.createElement('div');
    body.className = 'post-body';

    const from = document.createElement('p');
    from.className = 'post-meta';
    from.textContent = `От: ${report.reporter.name}`;

    const target = document.createElement('p');
    target.className = 'post-content';
    target.textContent = describeTarget(report);

    const reason = document.createElement('p');
    reason.className = 'post-content';
    reason.textContent = `Причина: ${report.reason}`;

    const actions = document.createElement('div');
    actions.className = 'post-actions';

    const resolveBtn = document.createElement('button');
    resolveBtn.type = 'button';
    resolveBtn.className = 'btn btn-secondary';
    resolveBtn.textContent = 'Решено';
    resolveBtn.addEventListener('click', () => updateReportStatus(report.id, 'RESOLVED'));

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'link-btn';
    dismissBtn.textContent = 'Отклонить';
    dismissBtn.addEventListener('click', () => updateReportStatus(report.id, 'DISMISSED'));

    actions.append(resolveBtn, dismissBtn);
    body.append(from, target, reason, actions);
    card.appendChild(body);
    reportsList.appendChild(card);
  }
}

async function loadReports() {
  const token = localStorage.getItem('token');
  if (!token) {
    modMessage.textContent = 'Войди в аккаунт модератора на главной странице.';
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) {
    modMessage.textContent = 'Эта страница доступна только модераторам.';
    return;
  }
  if (!res.ok) {
    modMessage.textContent = 'Не удалось загрузить жалобы.';
    return;
  }

  const reports = await res.json();
  renderReports(reports);
}

async function initBottomNav() {
  const token = localStorage.getItem('token');
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
  bottomProfileAvatar.innerHTML = '';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = '';
    bottomProfileAvatar.appendChild(img);
  } else {
    bottomProfileAvatar.textContent = user.name.charAt(0).toUpperCase();
  }

  const unreadRes = await fetch(`${API_BASE_URL}/api/unread`, { headers: { Authorization: `Bearer ${token}` } });
  if (unreadRes.ok) {
    const unread = await unreadRes.json();
    document.getElementById('friendsBadge')?.classList.toggle('hidden', !unread.friends);
    document.getElementById('messagesBadge')?.classList.toggle('hidden', !unread.messages);
  }
}

loadReports();
initBottomNav();
