import { Router } from 'express';
import {
  getDbData,
  saveOrUpdateContribution,
  updateContributionById,
  deleteContributionById,
  CONTRIBUTION_MONTHS,
} from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /contributions
router.get('/', async (req, res) => {
  const dbData = await getDbData();
  const memberMap = new Map(dbData.members.map((m) => [m.id, m.name]));

  const result = dbData.contributions.map((c) => ({
    ...c,
    memberName: memberMap.get(c.memberId) || 'Unknown',
  }));

  res.json(result);
});

// GET /contributions/month/:month
router.get('/month/:month', async (req, res) => {
  const { month } = req.params;
  const dbData = await getDbData();
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
router.get('/member/:memberId', async (req, res) => {
  const memberId = Number(req.params.memberId);
  const dbData = await getDbData();
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
router.post('/', requireAdmin, async (req, res) => {
  const { memberId, contributionMonth, amount, paymentDate, paymentMethod, notes, status } = req.body;
  const numericMemberId = Number(memberId);

  if (!numericMemberId || !contributionMonth) {
    return res.status(400).json({ error: 'memberId and contributionMonth are required' });
  }

  const dbData = await getDbData();
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

  const contrib = await saveOrUpdateContribution({
    memberId: numericMemberId,
    contributionMonth,
    amount: paymentAmount,
    status: payStatus,
    paymentDate: payDate,
    paymentMethod: method,
    notes: notes || '',
  });

  res.json(contrib);
});

// PATCH /contributions/:id (Admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
  const contribId = Number(req.params.id);
  const { amount, status, paymentDate, paymentMethod, notes } = req.body;

  let newAmount = undefined;
  if (amount !== undefined) {
    newAmount = parseInt(amount, 10);
    if (newAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
  }

  const updated = await updateContributionById(contribId, {
    ...(newAmount !== undefined && { amount: newAmount }),
    ...(status !== undefined && { status }),
    ...(paymentDate !== undefined && { paymentDate }),
    ...(paymentMethod !== undefined && { paymentMethod }),
    ...(notes !== undefined && { notes }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Contribution record not found' });
  }

  res.json(updated);
});

// DELETE /contributions/:id (Admin only - Reverts contribution to Pending)
router.delete('/:id', requireAdmin, async (req, res) => {
  const contribId = Number(req.params.id);
  const success = await deleteContributionById(contribId);

  if (!success) {
    return res.status(404).json({ error: 'Contribution record not found' });
  }

  res.json({ message: 'Contribution record removed (reverted to pending)' });
});

export default router;
