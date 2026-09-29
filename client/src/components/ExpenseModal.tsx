import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Expense } from '../types';
import { X, Receipt, IndianRupee, Calendar, FileText, Tag } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
}

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

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ganesh Idol');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title || '');
      setCategory(expenseToEdit.category || 'Ganesh Idol');
      setAmount(expenseToEdit.amount || '');
      setExpenseDate(expenseToEdit.expenseDate || new Date().toISOString().split('T')[0]);
      setPaymentMethod(expenseToEdit.paymentMethod || 'UPI');
      setDescription(expenseToEdit.description || '');
      setReceipt(expenseToEdit.receipt || '');
    } else {
      setTitle('');
      setCategory('Ganesh Idol');
      setAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
      setReceipt('');
    }
    setError('');
  }, [isOpen, expenseToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    setLoading(true);

    try {
      if (expenseToEdit) {
        await api.updateExpense(expenseToEdit.id, {
          title,
          category,
          amount: numericAmount,
          expenseDate,
          paymentMethod,
          description,
          receipt,
        });
      } else {
        await api.addExpense({
          title,
          category,
          amount: numericAmount,
          expenseDate,
          paymentMethod,
          description,
          receipt,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200">
        <div className="festive-gradient p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {expenseToEdit ? 'Edit Expense Record' : 'Add Mandal Expense'}
              </h2>
              <p className="text-xs text-amber-100">Transparent financial expense logging</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-medium">
              {error}
            </div>
          )}

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Expense Title / Item *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Ganesh Idol / Mandap Lights / Prasad"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Expense Category</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 z-10" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Amount (₹) *</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="3500"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-rose-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Expense Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Paid Via</label>
            <div className="grid grid-cols-4 gap-2">
              {['UPI', 'Cash', 'Bank Transfer', 'Other'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                    paymentMethod === method
                      ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Receipt */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Description / Notes</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of vendor or purpose"
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-md shadow-rose-600/20"
            >
              {loading ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
