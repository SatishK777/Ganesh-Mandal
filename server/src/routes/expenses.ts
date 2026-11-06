import { Router } from 'express';
import {
  getDbData,
  createExpense,
  updateExpenseById,
  deleteExpenseById,
  Expense,
} from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

export const EXPENSE_CATEGORIES = [
  'Ganesh Idol',
  'Decoration',
  'Mandap',
  'Lighting',
  'Sound System',
  'Prasad',
  'Pooja Material',
  'Flowers',
  'Electricity',
  'Cleaning',
  'Transportation',
  'Other',
];

// GET /expenses
router.get('/', async (req, res) => {
  const dbData = await getDbData();
  const expenses = [...dbData.expenses].sort((a, b) => (b.expenseDate > a.expenseDate ? 1 : -1));
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    expenses,
    totalExpenses,
  });
});

// GET /expenses/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const dbData = await getDbData();
  const expense = dbData.expenses.find((e) => e.id === id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

// POST /expenses (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { title, category, amount, expenseDate, paymentMethod, description, receipt } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Expense title is required' });
  }

  const expAmount = parseInt(amount, 10);
  if (isNaN(expAmount) || expAmount <= 0) {
    return res.status(400).json({ error: 'Expense amount must be a positive number' });
  }

  const validCat = EXPENSE_CATEGORIES.includes(category) ? category : 'Other';
  const validMethod = ['Cash', 'UPI', 'Bank Transfer', 'Other'].includes(paymentMethod) ? paymentMethod : 'UPI';
  const expDate = expenseDate || new Date().toISOString().split('T')[0];

  const newExpense = await createExpense({
    title: title.trim(),
    category: validCat,
    amount: expAmount,
    expenseDate: expDate,
    paymentMethod: validMethod,
    description: description || '',
    receipt: receipt || '',
  });

  res.status(201).json(newExpense);
});

// PATCH /expenses/:id (Admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, category, amount, expenseDate, paymentMethod, description, receipt } = req.body;

  let newAmount = undefined;
  if (amount !== undefined) {
    newAmount = parseInt(amount, 10);
    if (newAmount <= 0) {
      return res.status(400).json({ error: 'Expense amount must be a positive number' });
    }
  }

  const updated = await updateExpenseById(id, {
    ...(title !== undefined && { title: title.trim() }),
    ...(category !== undefined && { category }),
    ...(newAmount !== undefined && { amount: newAmount }),
    ...(expenseDate !== undefined && { expenseDate }),
    ...(paymentMethod !== undefined && { paymentMethod }),
    ...(description !== undefined && { description }),
    ...(receipt !== undefined && { receipt }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json(updated);
});

// DELETE /expenses/:id (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const success = await deleteExpenseById(id);

  if (!success) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json({ message: 'Expense deleted successfully' });
});

export default router;
