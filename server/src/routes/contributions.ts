import { Router } from 'express';
import { readDb, writeDb, CONTRIBUTION_MONTHS, Contribution } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /contributions
router.get('/', (req, res) => {
  const dbData = readDb();
  const memberMap = new Map(dbData.members.map((m) => [m.id, m.name]));

  const result = dbData.contributions.map((c) => ({
    ...c,
    memberName: memberMap.get(c.memberId) || 'Unknown',
  }));

  res.json(result);
});

// GET /contributions/month/:month
router.get('/month/:month', (req, res) => {
  const { month } = req.params;
  const dbData = readDb();
  const memberMap = new Map(dbData.members.map((m) => [m.id, m.name]));

  const result = dbData.contributions
    .filter((c) => c.contributionMonth === month)
    .map((c) => ({
      ...c,
      memberName: memberMap.get(c.memberId) || 'Unknown',
    }));

  res.json(result);
});

// GET /contributions/member/:memberId
router.get('/member/:memberId', (req, res) => {
  const memberId = Number(req.params.memberId);
  const dbData = readDb();
  const memberMap = new Map(dbData.members.map((m) => [m.id, m.name]));

  const result = dbData.contributions
    .filter((c) => c.memberId === memberId)
    .map((c) => ({
      ...c,
      memberName: memberMap.get(c.memberId) || 'Unknown',
    }));

  res.json(result);
});

// POST /contributions (Admin only - Mark contribution as paid)
router.post('/', requireAdmin, (req, res) => {
  const { memberId, contributionMonth, amount, paymentDate, paymentMethod, notes, status } = req.body;
  const numericMemberId = Number(memberId);

  if (!numericMemberId || !contributionMonth) {
    return res.status(400).json({ error: 'memberId and contributionMonth are required' });
  }

  const dbData = readDb();
  const member = dbData.members.find((m) => m.id === numericMemberId);
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  if (!CONTRIBUTION_MONTHS.includes(contributionMonth)) {
    return res.status(400).json({ error: `Invalid contribution month. Allowed months: ${CONTRIBUTION_MONTHS.join(', ')}` });
  }

  const paymentAmount = parseInt(amount, 10);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const validMethods = ['Cash', 'UPI', 'Bank Transfer', 'Other'];
  const method = validMethods.includes(paymentMethod) ? paymentMethod : 'UPI';
  const payDate = paymentDate || new Date().toISOString().split('T')[0];
  const payStatus = status || 'Paid';
  const now = new Date().toISOString();

  // Check unique constraint (memberId + contributionMonth)
  const existingIndex = dbData.contributions.findIndex(
    (c) => c.memberId === numericMemberId && c.contributionMonth === contributionMonth
  );

  if (existingIndex !== -1) {
    const existing = dbData.contributions[existingIndex];
    const updated: Contribution = {
      ...existing,
      amount: paymentAmount,
      status: payStatus,
      paymentDate: payDate,
      paymentMethod: method,
      notes: notes || '',
      updatedAt: now,
    };
    dbData.contributions[existingIndex] = updated;
    writeDb(dbData);
    return res.json(updated);
  } else {
    const nextId = dbData.contributions.length > 0 ? Math.max(...dbData.contributions.map((c) => c.id)) + 1 : 1;
    const newContrib: Contribution = {
      id: nextId,
      memberId: numericMemberId,
      contributionMonth,
      amount: paymentAmount,
      status: payStatus,
      paymentDate: payDate,
      paymentMethod: method,
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
    };
    dbData.contributions.push(newContrib);
    writeDb(dbData);
    return res.status(201).json(newContrib);
  }
});

// PATCH /contributions/:id (Admin only)
router.patch('/:id', requireAdmin, (req, res) => {
  const contribId = Number(req.params.id);
  const dbData = readDb();
  const index = dbData.contributions.findIndex((c) => c.id === contribId);

  if (index === -1) {
    return res.status(404).json({ error: 'Contribution record not found' });
  }

  const existing = dbData.contributions[index];
  const { amount, status, paymentDate, paymentMethod, notes } = req.body;

  const newAmount = amount !== undefined ? parseInt(amount, 10) : existing.amount;
  if (newAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  const updated: Contribution = {
    ...existing,
    amount: newAmount,
    status: status !== undefined ? status : existing.status,
    paymentDate: paymentDate !== undefined ? paymentDate : existing.paymentDate,
    paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
    notes: notes !== undefined ? notes : existing.notes,
    updatedAt: new Date().toISOString(),
  };

  dbData.contributions[index] = updated;
  writeDb(dbData);
  res.json(updated);
});

// DELETE /contributions/:id (Admin only - Reverts contribution to Pending)
router.delete('/:id', requireAdmin, (req, res) => {
  const contribId = Number(req.params.id);
  const dbData = readDb();
  const index = dbData.contributions.findIndex((c) => c.id === contribId);

  if (index === -1) {
    return res.status(404).json({ error: 'Contribution record not found' });
  }

  dbData.contributions.splice(index, 1);
  writeDb(dbData);
  res.json({ message: 'Contribution record removed (reverted to pending)' });
});

export default router;
