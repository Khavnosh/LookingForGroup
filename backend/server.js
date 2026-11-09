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
  return { id: row.user_id, username: row.username, email: row.email };
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
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email',
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
    'SELECT user_id, username, email FROM users WHERE username = $1 AND password = $2',
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
    'SELECT user_id, username, email FROM users WHERE user_id = $1',
    [req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'User no longer exists' });
  }
  res.json({ user: publicUser(result.rows[0]) });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message });
});

app.listen(port, () => {
  console.log(`Auth API listening on port ${port}`);
});
