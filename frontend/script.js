const modal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const nameInput = document.getElementById('name');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');

let mode = 'login';

function openModal(newMode) {
  mode = newMode;
  modalTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
  nameInput.classList.toggle('hidden', mode === 'login');
  authMessage.textContent = '';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  authForm.reset();
}

document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
document.getElementById('closeModal').addEventListener('click', closeModal);

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  authMessage.textContent = 'Бэкенда пока нет — подключим его на следующих уроках.';
});
