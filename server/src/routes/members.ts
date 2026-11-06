import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { getDbData, createMember, updateMemberById, deleteMemberById } from '../db.js';
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
router.get('/', async (req, res) => {
  const admin = isAdminRequest(req);
  const db = await getDbData();

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
router.get('/:id', async (req, res) => {
  const admin = isAdminRequest(req);
  const id = Number(req.params.id);
  const db = await getDbData();
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
router.post('/', requireAdmin, async (req, res) => {
  const { name, phone, monthlyContribution, joinedAt, notes, isActive } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Member name is required' });
  }

  const contribution = parseInt(monthlyContribution, 10);
  if (isNaN(contribution) || contribution <= 0) {
    return res.status(400).json({ error: 'Monthly contribution must be a positive number' });
  }

  const newMember = await createMember({
    name: name.trim(),
    phone: phone || '',
    monthlyContribution: contribution || 1000,
    joinedAt: joinedAt || '2026-10',
    isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
    notes: notes || '',
  });

  res.status(201).json(newMember);
});

// PATCH /members/:id (Admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
  const memberId = Number(req.params.id);
  const { name, phone, monthlyContribution, joinedAt, isActive, notes } = req.body;

  let newContribution = undefined;
  if (monthlyContribution !== undefined) {
    newContribution = parseInt(monthlyContribution, 10);
    if (newContribution <= 0) {
      return res.status(400).json({ error: 'Monthly contribution must be greater than 0' });
    }
  }

  const updated = await updateMemberById(memberId, {
    ...(name !== undefined && { name: name.trim() }),
    ...(phone !== undefined && { phone }),
    ...(newContribution !== undefined && { monthlyContribution: newContribution }),
    ...(joinedAt !== undefined && { joinedAt }),
    ...(isActive !== undefined && { isActive: isActive ? 1 : 0 }),
    ...(notes !== undefined && { notes }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Member not found' });
  }

  res.json(updated);
});

// DELETE /members/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const memberId = Number(req.params.id);
  const success = await deleteMemberById(memberId);

  if (!success) {
    return res.status(404).json({ error: 'Member not found' });
  }

  res.json({ message: 'Member deleted successfully' });
});

export default router;
