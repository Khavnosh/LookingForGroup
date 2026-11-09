const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign({ id: user.user_id, username: user.username }, JWT_SECRET, {
    expiresIn: '1d',
  });
}

function publicUser(row) {
  return {
    id: row.user_id,
    username: row.username,
    email: row.email,
    description: row.description ?? null,
    discordTag: row.discord_tag ?? null,
    availability: row.availability ?? null,
    tags: row.tags ?? [],
  };
}

const RECRUIT_SELECT = `
  SELECT u.user_id AS id, u.username, u.email, u.description,
         u.discord_tag AS "discordTag", u.availability,
         COALESCE(
           json_agg(json_build_object('id', t.tag_id, 'name', t.tag_name))
             FILTER (WHERE t.tag_id IS NOT NULL),
           '[]'
         ) AS tags
  FROM users u
  LEFT JOIN user_interest ui ON ui.user_id = u.user_id
  LEFT JOIN tags t ON t.tag_id = ui.tag_id
`;

const GROUP_SELECT = `
  SELECT g.id, g.name, g.description,
         json_build_object('id', u.user_id, 'username', u.username) AS owner,
         COALESCE(
           json_agg(json_build_object('id', t.tag_id, 'name', t.tag_name))
             FILTER (WHERE t.tag_id IS NOT NULL),
           '[]'
         ) AS tags,
         (SELECT count(*) FROM is_member m WHERE m.group_id = g.id)::int AS "memberCount"
  FROM game_groups g
  JOIN users u ON u.user_id = g.owner_id
  LEFT JOIN group_tags gt ON gt.group_id = g.id
  LEFT JOIN tags t ON t.tag_id = gt.tag_id
`;

async function findOrCreateTag(name) {
  const found = await db.query('SELECT tag_id AS id, tag_name AS name FROM tags WHERE tag_name = $1', [name]);
  if (found.rows[0]) return found.rows[0];
  return (
    await db.query('INSERT INTO tags (tag_name) VALUES ($1) RETURNING tag_id AS id, tag_name AS name', [name])
  ).rows[0];
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next();
}

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email, description, discord_tag, availability',
      // Plaintext storage was an explicit choice. Swap for bcrypt.hash() before anything real.
      [username, email, password]
    );
    res.status(201).json({ token: signToken(result.rows[0]), user: publicUser(result.rows[0]) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    throw err;
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const result = await db.query(
    'SELECT user_id, username, email, description, discord_tag, availability FROM users WHERE username = $1 AND password = $2',
    // Plaintext comparison was an explicit choice. Swap for bcrypt.compare() against a hashed column.
    [username, password]
  );
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.json({ token: signToken(result.rows[0]), user: publicUser(result.rows[0]) });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const result = await db.query(
    `${RECRUIT_SELECT} WHERE u.user_id = $1 GROUP BY u.user_id`,
    [req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'User no longer exists' });
  }
  res.json({ user: result.rows[0] });
});

app.put('/api/me', requireAuth, async (req, res) => {
  const { username, email, description, discordTag, availability } = req.body ?? {};
  if (!username || !email) {
    return res.status(400).json({ error: 'username and email are required' });
  }
  try {
    await db.query(
      `UPDATE users
       SET username = $1, email = $2, description = $3, discord_tag = $4, availability = $5
       WHERE user_id = $6`,
      [username, email, description ?? null, discordTag ?? null, availability ?? null, req.user.id]
    );
    const result = await db.query(
      `${RECRUIT_SELECT} WHERE u.user_id = $1 GROUP BY u.user_id`,
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    throw err;
  }
});

app.get('/api/tags', async (req, res) => {
  const result = await db.query('SELECT tag_id AS id, tag_name AS name FROM tags ORDER BY tag_name');
  res.json({ tags: result.rows });
});

app.post('/api/me/tags', requireAuth, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name is required' });

  const tag = await findOrCreateTag(name);  await db.query('INSERT INTO user_interest (user_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
    req.user.id,
    tag.id,
  ]);
  res.status(201).json({ tag });
});

app.delete('/api/me/tags/:tagId', requireAuth, async (req, res) => {
  await db.query('DELETE FROM user_interest WHERE user_id = $1 AND tag_id = $2', [
    req.user.id,
    req.params.tagId,
  ]);
  res.json({ ok: true });
});

app.get('/api/recruits', async (req, res) => {
  const search = String(req.query.search || '').trim();
  const result = await db.query(
    `${RECRUIT_SELECT}
     WHERE ($1 = ''
        OR u.username ILIKE '%' || $1 || '%'
        OR EXISTS (
          SELECT 1 FROM user_interest ui2
          JOIN tags t2 ON t2.tag_id = ui2.tag_id
          WHERE ui2.user_id = u.user_id AND t2.tag_name ILIKE '%' || $1 || '%'
        ))
     GROUP BY u.user_id
     ORDER BY u.username`,
    [search]
  );
  res.json({ recruits: result.rows });
});

app.get('/api/recruits/:id', async (req, res) => {
  const result = await db.query(
    `${RECRUIT_SELECT} WHERE u.user_id = $1 GROUP BY u.user_id`,
    [req.params.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Recruit not found' });
  }
  res.json({ recruit: result.rows[0] });
});

app.get('/api/my-groups', requireAuth, async (req, res) => {
  const owned = await db.query(
    `${GROUP_SELECT} WHERE g.owner_id = $1 GROUP BY g.id, u.user_id, u.username ORDER BY g.name`,
    [req.user.id]
  );
  const joined = await db.query(
    `${GROUP_SELECT}
     WHERE g.owner_id <> $1
       AND EXISTS (SELECT 1 FROM is_member m WHERE m.group_id = g.id AND m.user_id = $1)
     GROUP BY g.id, u.user_id, u.username
     ORDER BY g.name`,
    [req.user.id]
  );
  res.json({ owned: owned.rows, joined: joined.rows });
});

app.get('/api/groups', async (req, res) => {
  const search = String(req.query.search || '').trim();
  const result = await db.query(
    `${GROUP_SELECT}
     WHERE ($1 = ''
        OR g.name ILIKE '%' || $1 || '%'
        OR EXISTS (
          SELECT 1 FROM group_tags gt2
          JOIN tags t2 ON t2.tag_id = gt2.tag_id
          WHERE gt2.group_id = g.id AND t2.tag_name ILIKE '%' || $1 || '%'
        ))
     GROUP BY g.id, u.user_id, u.username
     ORDER BY g.name`,
    [search]
  );
  res.json({ groups: result.rows });
});

app.get('/api/groups/:id', async (req, res) => {
  const result = await db.query(
    `${GROUP_SELECT} WHERE g.id = $1 GROUP BY g.id, u.user_id, u.username`,
    [req.params.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Group not found' });
  }
  res.json({ group: result.rows[0] });
});

app.post('/api/groups', requireAuth, async (req, res) => {
  const { name, description, tags } = req.body ?? {};
  if (!name || !description) {
    return res.status(400).json({ error: 'name and description are required' });
  }
  const created = await db.query(
    'INSERT INTO game_groups (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id',
    [name, description, req.user.id]
  );
  const groupId = created.rows[0].id;

  await db.query('INSERT INTO is_member (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
    groupId,
    req.user.id,
  ]);

  for (const raw of tags ?? []) {
    const tagName = String(raw).trim();
    if (!tagName) continue;
    const tag = await findOrCreateTag(tagName);
    await db.query('INSERT INTO group_tags (group_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      groupId,
      tag.id,
    ]);
  }

  const result = await db.query(
    `${GROUP_SELECT} WHERE g.id = $1 GROUP BY g.id, u.user_id, u.username`,
    [groupId]
  );
  res.status(201).json({ group: result.rows[0] });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
});

app.listen(port, () => {
  console.log(`Auth API listening on port ${port}`);
});
