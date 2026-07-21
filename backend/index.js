const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'https://podrugi.co.uk',
  'https://www.podrugi.co.uk',
  'https://podrugi.netlify.app',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Не разрешено CORS-политикой'));
    }
  },
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток, попробуй позже' },
});

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(100),
  ageConfirmed: z.literal(true),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

const postSchema = z.object({
  type: z.enum(['POST', 'ANNOUNCEMENT', 'EVENT']).default('POST'),
  content: z.string().trim().min(1).max(2000),
  area: z.string().trim().max(100).optional().or(z.literal('')),
  eventDate: z.string().optional(),
}).refine(
  (data) => data.type !== 'EVENT' || (data.eventDate && !isNaN(Date.parse(data.eventDate))),
  { message: 'Для события нужна корректная дата', path: ['eventDate'] },
);

const commentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

const rsvpSchema = z.object({
  status: z.enum(['GOING', 'MAYBE']),
});

const reportSchema = z.object({
  targetType: z.enum(['POST', 'USER']),
  targetId: z.number().int(),
  reason: z.string().trim().min(1).max(500),
});

const reportStatusSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
});

const postInclude = {
  author: { select: { id: true, name: true, city: true } },
  comments: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } },
  },
  rsvps: { select: { userId: true, status: true } },
};

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нужна авторизация' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Неверный или истёкший токен' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

async function requireModerator(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Доступно только модераторам' });
  }
  next();
}

async function getBlockedUserIds(userId) {
  if (!userId) return [];
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  return blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, city: true, createdAt: true },
  });
  res.json(users);
});

app.post('/api/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь email, пароль (минимум 8 символов), имя и подтверждение возраста' });
  }
  const { email, password, name, ageConfirmed } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email уже зарегистрирован' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, ageConfirmed },
  });
  res.status(201).json({ id: user.id, email: user.email });
});

app.post('/api/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь email и пароль' });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

app.get('/api/profile', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, name: true, city: true, role: true, createdAt: true },
  });
  res.json(user);
});

app.get('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Некорректный id' });

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, city: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

app.post('/api/posts', requireAuth, async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь текст, тип и (для события) дату' });
  }
  const { type, content, area, eventDate } = parsed.data;

  const post = await prisma.post.create({
    data: {
      type,
      content,
      area: area || null,
      eventDate: type === 'EVENT' ? new Date(eventDate) : null,
      authorId: req.user.userId,
    },
    include: postInclude,
  });
  res.status(201).json(post);
});

app.get('/api/posts', optionalAuth, async (req, res) => {
  const blockedIds = await getBlockedUserIds(req.user?.userId);

  const posts = await prisma.post.findMany({
    where: blockedIds.length ? { authorId: { notIn: blockedIds } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: req.user ? 50 : 3,
    include: postInclude,
  });
  res.json(posts);
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Некорректный id' });

  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь текст комментария (1-1000 символов)' });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: 'Пост не найден' });

  const comment = await prisma.comment.create({
    data: { content: parsed.data.content, postId, authorId: req.user.userId },
    include: { author: { select: { id: true, name: true } } },
  });
  res.status(201).json(comment);
});

app.post('/api/posts/:id/rsvp', requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Некорректный id' });

  const parsed = rsvpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Статус должен быть GOING или MAYBE' });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: 'Пост не найден' });
  if (post.type !== 'EVENT') return res.status(400).json({ error: 'RSVP доступен только для событий' });

  const rsvp = await prisma.rsvp.upsert({
    where: { postId_userId: { postId, userId: req.user.userId } },
    update: { status: parsed.data.status },
    create: { postId, userId: req.user.userId, status: parsed.data.status },
  });
  res.status(201).json(rsvp);
});

app.post('/api/reports', requireAuth, async (req, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь тип цели, id и причину жалобы' });
  }
  const { targetType, targetId, reason } = parsed.data;

  if (targetType === 'POST') {
    const post = await prisma.post.findUnique({ where: { id: targetId } });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
  } else {
    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const report = await prisma.report.create({
    data: {
      reason,
      reporterId: req.user.userId,
      reportedPostId: targetType === 'POST' ? targetId : null,
      reportedUserId: targetType === 'USER' ? targetId : null,
    },
  });
  res.status(201).json(report);
});

app.get('/api/reports', requireAuth, requireModerator, async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, name: true } },
      reportedPost: true,
      reportedUser: { select: { id: true, name: true, email: true } },
    },
  });
  res.json(reports);
});

app.patch('/api/reports/:id', requireAuth, requireModerator, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Некорректный id' });

  const parsed = reportStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Статус должен быть RESOLVED или DISMISSED' });
  }

  const report = await prisma.report.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  res.json(report);
});

app.post('/api/block/:userId', requireAuth, async (req, res) => {
  const blockedId = Number(req.params.userId);
  if (!Number.isInteger(blockedId)) return res.status(400).json({ error: 'Некорректный id' });
  if (blockedId === req.user.userId) return res.status(400).json({ error: 'Нельзя заблокировать себя' });

  const block = await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId } },
    update: {},
    create: { blockerId: req.user.userId, blockedId },
  });
  res.status(201).json(block);
});

app.delete('/api/block/:userId', requireAuth, async (req, res) => {
  const blockedId = Number(req.params.userId);
  if (!Number.isInteger(blockedId)) return res.status(400).json({ error: 'Некорректный id' });

  await prisma.block.deleteMany({
    where: { blockerId: req.user.userId, blockedId },
  });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
