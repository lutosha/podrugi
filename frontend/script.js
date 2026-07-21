const API_BASE_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://podrugi-production.up.railway.app';

const modal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const nameInput = document.getElementById('name');
const ageLabel = document.getElementById('ageLabel');
const ageConfirmedInput = document.getElementById('ageConfirmed');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const guestNav = document.getElementById('guestNav');
const userNav = document.getElementById('userNav');
const userGreeting = document.getElementById('userGreeting');

let mode = 'login';

function openModal(newMode) {
  mode = newMode;
  modalTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
  nameInput.classList.toggle('hidden', mode === 'login');
  ageLabel.classList.toggle('hidden', mode === 'login');
  authMessage.textContent = '';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  authForm.reset();
}

function showLoggedIn(user) {
  guestNav.classList.add('hidden');
  userNav.classList.remove('hidden');
  userGreeting.textContent = `Привет, ${user.name}!`;
}

function showLoggedOut() {
  guestNav.classList.remove('hidden');
  userNav.classList.add('hidden');
}

async function fetchProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    showLoggedOut();
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    localStorage.removeItem('token');
    showLoggedOut();
    return;
  }

  const user = await res.json();
  showLoggedIn(user);
}

document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  showLoggedOut();
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = nameInput.value;
  const endpoint = mode === 'login' ? '/api/login' : '/api/register';
  const body = mode === 'login'
    ? { email, password }
    : { email, password, name, ageConfirmed: ageConfirmedInput.checked };

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

fetchProfile();
