import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, Member } from '../db.js';
import { requireAdmin, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

function isAdminRequest(req: any): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// GET /members (Public view hides phone and notes unless admin)
router.get('/', (req, res) => {
  const admin = isAdminRequest(req);
  const db = readDb();

  const sanitized = db.members.map((m) => {
    if (!admin) {
      const { phone, notes, ...rest } = m;
      return rest;
    }
    return m;
  });

  res.json(sanitized);
});

// GET /members/:id
router.get('/:id', (req, res) => {
  const admin = isAdminRequest(req);
  const id = Number(req.params.id);
  const db = readDb();
  const member = db.members.find((m) => m.id === id);

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const copy = { ...member };
  if (!admin) {
    delete copy.phone;
    delete copy.notes;
  }

  res.json(copy);
});

// POST /members (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const { name, phone, monthlyContribution, joinedAt, notes, isActive } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Member name is required' });
  }

  const contribution = parseInt(monthlyContribution, 10);
  if (isNaN(contribution) || contribution <= 0) {
    return res.status(400).json({ error: 'Monthly contribution must be a positive number' });
  }

  const dbData = readDb();
  const nextId = dbData.members.length > 0 ? Math.max(...dbData.members.map((m) => m.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newMember: Member = {
    id: nextId,
    name: name.trim(),
    phone: phone || '',
    monthlyContribution: contribution || 1000,
    joinedAt: joinedAt || '2026-09',
    isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
  };

  dbData.members.push(newMember);
  writeDb(dbData);

  res.status(201).json(newMember);
});

// PATCH /members/:id (Admin only)
router.patch('/:id', requireAdmin, (req, res) => {
  const memberId = Number(req.params.id);
  const dbData = readDb();
  const memberIndex = dbData.members.findIndex((m) => m.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const existing = dbData.members[memberIndex];
  const { name, phone, monthlyContribution, joinedAt, isActive, notes } = req.body;

  const newContribution =
    monthlyContribution !== undefined ? parseInt(monthlyContribution, 10) : existing.monthlyContribution;

  if (newContribution <= 0) {
    return res.status(400).json({ error: 'Monthly contribution must be greater than 0' });
  }

  const updatedMember: Member = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    phone: phone !== undefined ? phone : existing.phone,
    monthlyContribution: newContribution,
    joinedAt: joinedAt !== undefined ? joinedAt : existing.joinedAt,
    isActive: isActive !== undefined ? (isActive ? 1 : 0) : existing.isActive,
    notes: notes !== undefined ? notes : existing.notes,
    updatedAt: new Date().toISOString(),
  };

  dbData.members[memberIndex] = updatedMember;
  writeDb(dbData);

  res.json(updatedMember);
});

// DELETE /members/:id (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const memberId = Number(req.params.id);
  const dbData = readDb();
  const memberIndex = dbData.members.findIndex((m) => m.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  dbData.members.splice(memberIndex, 1);
  // Remove related contributions
  dbData.contributions = dbData.contributions.filter((c) => c.memberId !== memberId);
  writeDb(dbData);

  res.json({ message: 'Member deleted successfully' });
});

export default router;
