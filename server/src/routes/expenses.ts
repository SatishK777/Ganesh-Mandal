import { Router } from 'express';
import { readDb, writeDb, Expense } from '../db.js';
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
router.get('/', (req, res) => {
  const dbData = readDb();
  const expenses = [...dbData.expenses].sort((a, b) => (b.expenseDate > a.expenseDate ? 1 : -1));
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    expenses,
    totalExpenses,
  });
});

// GET /expenses/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const dbData = readDb();
  const expense = dbData.expenses.find((e) => e.id === id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

// POST /expenses (Admin only)
router.post('/', requireAdmin, (req, res) => {
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
  const now = new Date().toISOString();

  const dbData = readDb();
  const nextId = dbData.expenses.length > 0 ? Math.max(...dbData.expenses.map((e) => e.id)) + 1 : 1;

  const newExpense: Expense = {
    id: nextId,
    title: title.trim(),
    category: validCat,
    amount: expAmount,
    expenseDate: expDate,
    paymentMethod: validMethod,
    description: description || '',
    receipt: receipt || '',
    createdAt: now,
    updatedAt: now,
  };

  dbData.expenses.push(newExpense);
  writeDb(dbData);

  res.status(201).json(newExpense);
});

// PATCH /expenses/:id (Admin only)
router.patch('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const dbData = readDb();
  const index = dbData.expenses.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const existing = dbData.expenses[index];
  const { title, category, amount, expenseDate, paymentMethod, description, receipt } = req.body;

  const newAmount = amount !== undefined ? parseInt(amount, 10) : existing.amount;
  if (newAmount <= 0) {
    return res.status(400).json({ error: 'Expense amount must be a positive number' });
  }

  const updated: Expense = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    category: category !== undefined ? category : existing.category,
    amount: newAmount,
    expenseDate: expenseDate !== undefined ? expenseDate : existing.expenseDate,
    paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
    description: description !== undefined ? description : existing.description,
    receipt: receipt !== undefined ? receipt : existing.receipt,
    updatedAt: new Date().toISOString(),
  };

  dbData.expenses[index] = updated;
  writeDb(dbData);
  res.json(updated);
});

// DELETE /expenses/:id (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const dbData = readDb();
  const index = dbData.expenses.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  dbData.expenses.splice(index, 1);
  writeDb(dbData);
  res.json({ message: 'Expense deleted successfully' });
});

export default router;
