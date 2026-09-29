import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardSummary, Expense, Contribution } from '../types';
import { PieChart } from 'lucide-react';

export const SummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummaryData() {
      try {
        const [sumRes, expRes, conRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getExpenses(),
          api.getContributions(),
        ]);
        setSummary(sumRes);
        setExpenses(expRes.expenses);
        setContributions(conRes);
      } catch (err) {
        console.error('Failed to load summary data', err);
      } finally {
        setLoading(false);
      }
    }
    loadSummaryData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-600">Generating financial summary report...</p>
      </div>
    );
  }

  const { overall } = summary;

  // Breakdown by Payment Method
  const methodMap: Record<string, number> = {};
  contributions
    .filter((c) => c.status === 'Paid')
    .forEach((c) => {
      const m = c.paymentMethod || 'Other';
      methodMap[m] = (methodMap[m] || 0) + c.amount;
    });

  // Expense Category Breakdown
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
          Complete Financial Audit
        </span>
        <h2 className="text-xl font-extrabold text-stone-900">Mandal Fund Summary Report</h2>
        <p className="text-xs text-stone-500">
          Full breakdown of member contributions, pending amounts, and festival expenses
        </p>
      </div>

      {/* Main Financial Report Cards (Matching Section 12) */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-md p-6 space-y-6">
        <h3 className="font-black text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-3">
          <PieChart className="w-5 h-5 text-amber-600" />
          <span>Core Balance Sheet</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 uppercase block mb-1">
              Expected Collection
            </span>
            <span className="text-2xl font-black text-stone-900">
              ₹{overall.expected.toLocaleString()}
            </span>
            <p className="text-[11px] text-stone-400 mt-1">6 members × 12 months @ ₹1,000</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
              Total Collected
            </span>
            <span className="text-2xl font-black text-emerald-900">
              ₹{overall.collected.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-700 mt-1">Actual bank & cash received</p>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
            <span className="text-xs font-bold text-rose-800 uppercase block mb-1">
              Total Pending
            </span>
            <span className="text-2xl font-black text-rose-900">
              ₹{overall.pending.toLocaleString()}
            </span>
            <p className="text-[11px] text-rose-700 mt-1">Expected − Collected</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
            <span className="text-xs font-bold text-orange-800 uppercase block mb-1">
              Total Expenses
            </span>
            <span className="text-2xl font-black text-orange-900">
              ₹{overall.totalExpenses.toLocaleString()}
            </span>
            <p className="text-[11px] text-orange-700 mt-1">Sum of all festival expenses</p>
          </div>

          <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 sm:col-span-2">
            <span className="text-xs font-bold text-amber-900 uppercase block mb-1">
              Current Available Balance
            </span>
            <span
              className={`text-3xl font-black ${
                overall.balance >= 0 ? 'text-amber-950' : 'text-rose-700'
              }`}
            >
              ₹{overall.balance.toLocaleString()}
            </span>
            <p className="text-xs text-amber-800 mt-1 font-medium">
              Formula: Total Collected (₹{overall.collected.toLocaleString()}) − Total Expenses (₹
              {overall.totalExpenses.toLocaleString()})
            </p>
          </div>
        </div>
      </div>

      {/* Section 12 Slot Ratio Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
            ✅
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase block">Paid Contributions</span>
            <div className="text-2xl font-black text-emerald-900">
              {overall.paidSlotsCount} / {overall.totalSlotsExpected}
            </div>
            <p className="text-xs text-emerald-700 font-semibold">Monthly payment slots completed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xl">
            ❌
          </div>
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase block">Pending Contributions</span>
            <div className="text-2xl font-black text-rose-900">
              {overall.totalSlotsExpected - overall.paidSlotsCount} / {overall.totalSlotsExpected}
            </div>
            <p className="text-xs text-rose-700 font-semibold">Remaining payment slots</p>
          </div>
        </div>
      </div>

      {/* Payment Method & Expense Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
          <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
            Collections by Payment Method
          </h4>
          {Object.keys(methodMap).length === 0 ? (
            <p className="text-xs text-stone-400 italic">No payments logged yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(methodMap).map(([method, amt]) => (
                <div
                  key={method}
                  className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl text-xs"
                >
                  <span className="font-bold text-stone-700">{method}</span>
                  <span className="font-extrabold text-emerald-800">₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
          <h4 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
            Expenses by Category
          </h4>
          {Object.keys(expenseCatMap).length === 0 ? (
            <p className="text-xs text-stone-400 italic">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(expenseCatMap).map(([cat, amt]) => (
                <div
                  key={cat}
                  className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl text-xs"
                >
                  <span className="font-bold text-stone-700">{cat}</span>
                  <span className="font-extrabold text-rose-800">₹{amt.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
