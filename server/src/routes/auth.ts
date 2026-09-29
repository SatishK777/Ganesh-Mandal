import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb } from '../db.js';
import { JWT_SECRET, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = readDb();
  const admin = db.admins.find((a) => a.username === username);

  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = bcrypt.compareSync(password, admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, username: admin.username });
});

router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  return res.json({ admin: req.admin });
});

export default router;
