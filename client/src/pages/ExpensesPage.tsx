import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Expense } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Receipt, Calendar, CreditCard, Edit3, Trash2 } from 'lucide-react';

interface ExpensesPageProps {
  onOpenExpenseModal: (expense?: Expense | null) => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenExpenseModal }) => {
  const { isAdmin } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getExpenses();
      setExpenses(res.expenses);
      setTotalExpenses(res.totalExpenses);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      await api.deleteExpense(id);
      loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const categoriesList = ['All', ...Array.from(new Set(expenses.map((e) => e.category)))];

  const filteredExpenses =
    selectedCategory === 'All' ? expenses : expenses.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Financial Transparency</span>
          <h2 className="text-xl font-extrabold text-stone-900">Mandal Expenses History</h2>
          <p className="text-xs text-stone-500">Itemized audit of all Ganesh Chaturthi festival expenditures</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-rose-700 font-bold uppercase block">Total Spent</span>
            <span className="text-lg font-black text-rose-900">₹{totalExpenses.toLocaleString()}</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => onOpenExpenseModal(null)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      {categoriesList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-600">Loading expense logs...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-2">
          <Receipt className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-700 text-sm">No expenses found</h3>
          <p className="text-xs text-stone-400">No expense records match the selected category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-stone-900 text-base">{exp.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      {exp.category}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-stone-600 mt-1 font-medium">{exp.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.expenseDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {exp.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="text-right">
                  <span className="text-lg font-black text-rose-800 block">
                    ₹{exp.amount.toLocaleString()}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenExpenseModal(exp)}
                      className="p-2 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Edit expense"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
