# Podrugi

Социальная сеть для девушек Лондона (домен `podrugi.co.uk`). Основательница — нетехнический человек, весь проект собирается через Claude Code по учебному курсу (вайбкодинг). Объясняй шаги просто, без лишнего жаргона.

## Стек

- **Frontend**: чистые HTML/CSS/JS, без сборщика и фреймворка. `frontend/index.html`, `frontend/style.css`, `frontend/script.js`.
- **Backend**: Node.js + Express, `backend/index.js`. Один файл, без роутеров/контроллеров — не разбивать на файлы, пока проект маленький.
- **База данных**: PostgreSQL через Prisma (`backend/prisma/schema.prisma`). Модель `User` пока единственная.
- **Auth**: bcrypt (хеш пароля) + JWT (7 дней). Middleware `requireAuth` в `backend/index.js`.

## Хостинг и деплой

- Репозиторий: github.com/lutosha/podrugi (владелец аккаунта — пользователь, лично).
- **Frontend** — Netlify, publish directory `frontend`, автодеплой при пуше в `main`. Живой адрес: https://podrugi.netlify.app
- **Backend** — Railway, Root Directory `backend`, автодеплой при пуше в `main`. Живой адрес: https://podrugi-production.up.railway.app
- **База** — Postgres в том же Railway-проекте, что и backend.
- Прямой `git push` из терминала не работает — на компьютере не настроена авторизация GitHub. Пуши делаются через подключённый GitHub MCP-инструмент (`push_files` и т.д.), не через `git push`.
- Домен `podrugi.co.uk` ещё не подключён к Netlify/Railway (это Урок 11 — в процессе).

## Переменные окружения

- Локально: `backend/.env` (в Git не попадает) — `DATABASE_URL` (публичный адрес Railway-базы, не `.railway.internal`, иначе не подключится с компьютера), `JWT_SECRET`.
- На Railway: те же переменные заданы напрямую в Variables сервиса (не через файл). `DATABASE_URL` там — ссылка на переменную сервиса Postgres, `JWT_SECRET` — сгенерирован Railway отдельно, **отличается** от локального, и это нормально.

## Известные грабли (уже наступили и исправлены — не повторять)

- **Prisma 7** требует явный driver adapter (`@prisma/adapter-pg`) — `new PrismaClient()` без него падает.
- `prisma` и `dotenv` должны быть в `dependencies`, а не `devDependencies` — иначе на Railway (production install) не выполнится `prisma generate` и деплой упадёт с `Cannot find module '.prisma/client/default'`. Есть скрипт `postinstall: prisma generate` для подстраховки.
- Скрипт `start` в `backend/package.json` НЕ должен использовать `--env-file=.env` (падает на Railway, там нет .env-файла, только переменные окружения). Флаг `--env-file` оставлен только в `dev`.
- CORS в `backend/index.js` — список `ALLOWED_ORIGINS` нужно обновлять руками при добавлении нового домена (сейчас: `podrugi.co.uk`, `www.podrugi.co.uk`, `podrugi.netlify.app`, плюс localhost любого порта — для разработки).
- `frontend/script.js`: `API_BASE_URL` сам переключается между локальным бэкендом и Railway в зависимости от `location.hostname` — не хардкодить один адрес.

## Дизайн

- Стиль — вдохновлён Clubhouse: кремовый фон, карточки, круглые аватары-инициалы, крупные скруглённые кнопки.
- Палитра «Warm blush»: фон `#faf6f1`, текст `#241f1c`, акцент `#c6597a` — заданы как CSS-переменные в начале `frontend/style.css`, менять там.
- Шрифт — Nunito (Google Fonts, подключён в `index.html`).
- Логотип — векторный `frontend/assets/logo.svg` (сделан не мной, прислан пользователем).
- Дизайн бэклог: правки лучше собирать пачками (несколько замечаний сразу), а не по одному свойству — так дешевле и быстрее.

## Как проверять локально

```bash
cd backend && npm run dev     # http://localhost:3000/api/health
cd frontend && python3 -m http.server 8765   # http://localhost:8765
```
Оба нужно оставлять открытыми в терминале, пока тестируешь — это не разовые команды.

## Курс/прогресс

Идём по уроку `uroki_server_i_backend_podrugi.pdf` (15 уроков про бэкенд, продолжение курса из 15 фронтенд-уроков). Пройдено: 1-10 (структура, Git, backend, БД, auth, CORS, деплой на Railway и Netlify). Следующий: Урок 11 (подключение домена podrugi.co.uk).
