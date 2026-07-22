const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { PrismaClient, Borough } = require('@prisma/client');
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
  borough: z.nativeEnum(Borough),
  ageConfirmed: z.literal(true),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

const postSchema = z.object({
  type: z.enum(['POST', 'ANNOUNCEMENT', 'EVENT']).default('POST'),
  content: z.string().trim().min(1).max(2000),
  borough: z.nativeEnum(Borough).optional().or(z.literal('')),
  eventDate: z.string().optional(),
  maxParticipants: z.coerce.number().int().min(1).max(1000).optional().or(z.literal('')),
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

const messageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  borough: z.nativeEnum(Borough),
  bio: z.string().trim().max(300).optional().or(z.literal('')),
  avatar: z.string().max(300000).optional().or(z.literal('')),
});

const BOROUGH_LABELS = {
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

const postInclude = {
  author: { select: { id: true, name: true, borough: true, avatar: true } },
  comments: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } },
  },
  rsvps: { select: { userId: true, status: true } },
  reactions: { select: { userId: true } },
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

async function getFollowingIds(userId) {
  if (!userId) return [];
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return follows.map((f) => f.followingId);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, borough: true, createdAt: true },
  });
  res.json(users);
});

app.post('/api/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь email, пароль (минимум 8 символов), имя, район и подтверждение возраста' });
  }
  const { email, password, name, borough, ageConfirmed } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email уже зарегистрирован' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, borough, ageConfirmed },
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
    select: { id: true, email: true, name: true, borough: true, avatar: true, bio: true, role: true, createdAt: true },
  });
  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден' });
  }
  res.json(user);
});

app.patch('/api/profile', requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь имя, район, фото и текст «о себе»' });
  }
  const { name, borough, bio, avatar } = parsed.data;

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      name,
      borough,
      bio: bio || null,
      ...(avatar !== undefined ? { avatar: avatar || null } : {}),
    },
    select: { id: true, email: true, name: true, borough: true, avatar: true, bio: true, role: true, createdAt: true },
  });
  res.json(user);
});

app.get('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Некорректный id' });

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, borough: true, avatar: true, bio: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(user);
});

app.post('/api/posts', requireAuth, async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь текст, тип и (для события) дату' });
  }
  const { type, content, borough, eventDate, maxParticipants } = parsed.data;

  const post = await prisma.post.create({
    data: {
      type,
      content,
      borough: borough || null,
      eventDate: type === 'EVENT' ? new Date(eventDate) : null,
      maxParticipants: type === 'EVENT' && maxParticipants ? maxParticipants : null,
      authorId: req.user.userId,
    },
    include: postInclude,
  });
  res.status(201).json(post);
});

app.get('/api/boroughs', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { borough: { not: null } },
    select: { borough: true },
    distinct: ['borough'],
    orderBy: { borough: 'asc' },
  });
  res.json(posts.map((p) => p.borough));
});

app.get('/api/posts', optionalAuth, async (req, res) => {
  const blockedIds = await getBlockedUserIds(req.user?.userId);
  const followingIds = await getFollowingIds(req.user?.userId);
  const { borough, authorId, following } = req.query;

  const where = { NOT: { type: 'EVENT', eventDate: { lt: new Date() } } };
  if (borough) where.borough = String(borough);

  if (authorId) {
    const authorIdNum = Number(authorId);
    if (blockedIds.includes(authorIdNum)) return res.json([]);
    where.authorId = authorIdNum;
  } else if (following === '1') {
    where.authorId = { in: followingIds.filter((id) => !blockedIds.includes(id)) };
  } else if (blockedIds.length) {
    where.authorId = { notIn: blockedIds };
  }

  const limit = req.user ? 50 : 3;
  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit * 4,
    include: postInclude,
  });

  const upcomingEvents = posts
    .filter((p) => p.type === 'EVENT')
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  const others = posts.filter((p) => p.type !== 'EVENT');
  const sortedPosts = [...upcomingEvents, ...others].slice(0, limit);

  const postsWithFollowInfo = sortedPosts.map((post) => ({
    ...post,
    authorIsFollowed: followingIds.includes(post.authorId),
  }));
  res.json(postsWithFollowInfo);
});

function icsEscape(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function icsFold(line) {
  if (line.length <= 75) return line;
  const chunks = [];
  let rest = line;
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75));
    rest = ' ' + rest.slice(75);
  }
  chunks.push(rest);
  return chunks.join('\r\n');
}

app.get('/api/posts/:id/ics', async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Некорректный id' });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { name: true } } },
  });
  if (!post || post.type !== 'EVENT') return res.status(404).json({ error: 'Событие не найдено' });

  const start = new Date(post.eventDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const location = post.borough ? BOROUGH_LABELS[post.borough] : '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Podrugi//RU',
    'BEGIN:VEVENT',
    `UID:post-${post.id}@podrugi.co.uk`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(post.content.slice(0, 100))}`,
    `DESCRIPTION:${icsEscape(`${post.author.name}: ${post.content}`)}`,
    location ? `LOCATION:${icsEscape(location)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).map(icsFold);

  res.set('Content-Type', 'text/calendar; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="event-${post.id}.ics"`);
  res.send(lines.join('\r\n'));
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

  if (parsed.data.status === 'GOING' && post.maxParticipants != null) {
    const goingCount = await prisma.rsvp.count({
      where: { postId, status: 'GOING', userId: { not: req.user.userId } },
    });
    if (goingCount >= post.maxParticipants) {
      return res.status(400).json({ error: 'Достигнут лимит участников' });
    }
  }

  const rsvp = await prisma.rsvp.upsert({
    where: { postId_userId: { postId, userId: req.user.userId } },
    update: { status: parsed.data.status },
    create: { postId, userId: req.user.userId, status: parsed.data.status },
  });
  res.status(201).json(rsvp);
});

app.post('/api/posts/:id/react', requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Некорректный id' });

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: 'Пост не найден' });

  const reaction = await prisma.reaction.upsert({
    where: { postId_userId: { postId, userId: req.user.userId } },
    update: {},
    create: { postId, userId: req.user.userId },
  });
  res.status(201).json(reaction);
});

app.delete('/api/posts/:id/react', requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) return res.status(400).json({ error: 'Некорректный id' });

  await prisma.reaction.deleteMany({ where: { postId, userId: req.user.userId } });
  res.status(204).send();
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

app.post('/api/messages/seen', requireAuth, async (req, res) => {
  await prisma.user.update({ where: { id: req.user.userId }, data: { lastSeenMessagesAt: new Date() } });
  res.status(204).send();
});

app.post('/api/messages/:userId', requireAuth, async (req, res) => {
  const recipientId = Number(req.params.userId);
  if (!Number.isInteger(recipientId)) return res.status(400).json({ error: 'Некорректный id' });
  if (recipientId === req.user.userId) return res.status(400).json({ error: 'Нельзя написать самой себе' });

  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Проверь текст сообщения (1-2000 символов)' });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return res.status(404).json({ error: 'Пользователь не найден' });

  const blockedIds = await getBlockedUserIds(req.user.userId);
  if (blockedIds.includes(recipientId)) {
    return res.status(403).json({ error: 'Нельзя отправить сообщение (блокировка)' });
  }

  const message = await prisma.message.create({
    data: { content: parsed.data.content, senderId: req.user.userId, recipientId },
  });
  res.status(201).json(message);
});

app.get('/api/messages/:userId', requireAuth, async (req, res) => {
  const otherId = Number(req.params.userId);
  if (!Number.isInteger(otherId)) return res.status(400).json({ error: 'Некорректный id' });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.userId, recipientId: otherId },
        { senderId: otherId, recipientId: req.user.userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
});

app.get('/api/conversations', requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: req.user.userId }, { recipientId: req.user.userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      recipient: { select: { id: true, name: true, avatar: true } },
    },
  });

  const conversations = new Map();
  for (const message of messages) {
    const other = message.senderId === req.user.userId ? message.recipient : message.sender;
    if (!conversations.has(other.id)) {
      conversations.set(other.id, { user: other, lastMessage: message.content, lastAt: message.createdAt });
    }
  }
  res.json([...conversations.values()]);
});

app.post('/api/follow/:userId', requireAuth, async (req, res) => {
  const followingId = Number(req.params.userId);
  if (!Number.isInteger(followingId)) return res.status(400).json({ error: 'Некорректный id' });
  if (followingId === req.user.userId) return res.status(400).json({ error: 'Нельзя подписаться на себя' });

  const user = await prisma.user.findUnique({ where: { id: followingId } });
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const follow = await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: req.user.userId, followingId } },
    update: {},
    create: { followerId: req.user.userId, followingId },
  });
  res.status(201).json(follow);
});

app.delete('/api/follow/:userId', requireAuth, async (req, res) => {
  const followingId = Number(req.params.userId);
  if (!Number.isInteger(followingId)) return res.status(400).json({ error: 'Некорректный id' });

  await prisma.follow.deleteMany({
    where: { followerId: req.user.userId, followingId },
  });
  res.status(204).send();
});

app.get('/api/friends', requireAuth, async (req, res) => {
  const follows = await prisma.follow.findMany({
    where: { followerId: req.user.userId },
    include: { followingUser: { select: { id: true, name: true, borough: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(follows.map((f) => f.followingUser));
});

app.get('/api/nearby', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { borough: true } });
  const blockedIds = await getBlockedUserIds(req.user.userId);
  const followingIds = await getFollowingIds(req.user.userId);
  const excludeIds = [req.user.userId, ...blockedIds, ...followingIds];

  const users = await prisma.user.findMany({
    where: { borough: me.borough, id: { notIn: excludeIds } },
    select: { id: true, name: true, borough: true, avatar: true, bio: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json(users);
});

app.get('/api/unread', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { lastSeenMessagesAt: true, lastSeenFriendsAt: true },
  });

  const unreadMessages = await prisma.message.count({
    where: { recipientId: req.user.userId, createdAt: { gt: user.lastSeenMessagesAt } },
  });
  const unreadFriends = await prisma.follow.count({
    where: { followingId: req.user.userId, createdAt: { gt: user.lastSeenFriendsAt } },
  });

  res.json({ messages: unreadMessages > 0, friends: unreadFriends > 0 });
});

app.post('/api/friends/seen', requireAuth, async (req, res) => {
  await prisma.user.update({ where: { id: req.user.userId }, data: { lastSeenFriendsAt: new Date() } });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
