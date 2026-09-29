import React, { useState, useEffect } from 'react';
import type { MonthlySummary, Member } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/ProgressBar';

interface MonthlyPageProps {
  onOpenPaymentModal: (memberId?: number, month?: string) => void;
  members: Member[];
  initialMonth?: string;
}

export const MonthlyPage: React.FC<MonthlyPageProps> = ({
  onOpenPaymentModal,
  initialMonth = '2026-10',
}) => {
  const { isAdmin } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [monthlyData, setMonthlyData] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonth = async (m: string) => {
    setLoading(true);
    try {
      const res = await api.getMonthlySummary(m);
      setMonthlyData(res);
    } catch (err) {
      console.error('Failed to load monthly summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth(selectedMonth);
  }, [selectedMonth]);

  const monthsOptions = [
    { key: '2026-10', label: 'October 2026' },
    { key: '2026-11', label: 'November 2026' },
    { key: '2026-12', label: 'December 2026' },
    { key: '2027-01', label: 'January 2027' },
    { key: '2027-02', label: 'February 2027' },
    { key: '2027-03', label: 'March 2027' },
    { key: '2027-04', label: 'April 2027' },
    { key: '2027-05', label: 'May 2027' },
    { key: '2027-06', label: 'June 2027' },
    { key: '2027-07', label: 'July 2027' },
    { key: '2027-08', label: 'August 2027' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header & Month Selector */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Monthly Contributions</span>
          <h2 className="text-xl font-extrabold text-stone-900">
            {monthlyData?.monthName || 'Select Month'}
          </h2>
          <p className="text-xs text-stone-500">Member-by-member payment status breakdown</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-600">Select Month:</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer pr-8"
            >
              {monthsOptions.map((mo) => (
                <option key={mo.key} value={mo.key}>
                  {mo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading || !monthlyData ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-stone-600">Fetching monthly records...</p>
        </div>
      ) : (
        <>
          {/* Summary Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <span className="text-xs text-stone-500 font-semibold block">Expected</span>
                <span className="text-lg font-black text-stone-900">₹{monthlyData.expected.toLocaleString()}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-700 font-semibold block">Collected</span>
                <span className="text-lg font-black text-emerald-800">₹{monthlyData.collected.toLocaleString()}</span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-xs text-rose-700 font-semibold block">Pending</span>
                <span className="text-lg font-black text-rose-800">₹{monthlyData.pending.toLocaleString()}</span>
              </div>
            </div>

            <ProgressBar
              current={monthlyData.collected}
              total={monthlyData.expected}
              sublabel={`${monthlyData.paidCount} of ${monthlyData.members.length} members paid`}
              colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>

          {/* Members Matrix */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                Member Contribution List
              </span>
              <span className="text-xs font-bold text-stone-500">
                {monthlyData.paidCount} Paid / {monthlyData.pendingCount} Pending
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {monthlyData.members.map((m) => {
                const isPaid = m.status === 'Paid';
                return (
                  <div
                    key={m.memberId}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 text-base">{m.name}</h3>
                        <p className="text-xs text-stone-500">
                          Monthly Contribution: <span className="font-semibold text-stone-700">₹{m.monthlyContribution.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {isPaid ? '✅ Paid' : '❌ Pending'}
                          </span>
                          {isPaid && m.paymentMethod && (
                            <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                              {m.paymentMethod}
                            </span>
                          )}
                        </div>

                        {isPaid && m.paymentDate && (
                          <span className="text-[10px] text-stone-400 block mt-1 font-medium">
                            Paid on {m.paymentDate}
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => onOpenPaymentModal(m.memberId, selectedMonth)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm"
                        >
                          {isPaid ? 'Edit Payment' : 'Mark as Paid'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
