import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Member, Contribution } from '../types';
import { CheckCircle2, XCircle, Grid, List } from 'lucide-react';

export const CONTRIBUTION_MONTHS = [
  '2026-10',
  '2026-11',
  '2026-12',
  '2027-01',
  '2027-02',
  '2027-03',
  '2027-04',
  '2027-05',
  '2027-06',
  '2027-07',
  '2027-08',
];

const MONTH_SHORT: Record<string, string> = {
  '2026-10': 'Oct',
  '2026-11': 'Nov',
  '2026-12': 'Dec',
  '2027-01': 'Jan',
  '2027-02': 'Feb',
  '2027-03': 'Mar',
  '2027-04': 'Apr',
  '2027-05': 'May',
  '2027-06': 'Jun',
  '2027-07': 'Jul',
  '2027-08': 'Aug',
};

export const YearlyPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    async function loadData() {
      try {
        const [memRes, conRes] = await Promise.all([api.getMembers(), api.getContributions()]);
        setMembers(memRes);
        setContributions(conRes);
      } catch (err) {
        console.error('Failed to fetch yearly overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-600">Loading yearly overview matrix...</p>
      </div>
    );
  }

  // Create a lookup map: `${memberId}_${month}` -> boolean (isPaid)
  const paidMap = new Map<string, boolean>();
  for (const c of contributions) {
    if (c.status === 'Paid') {
      paidMap.set(`${c.memberId}_${c.contributionMonth}`, true);
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            October 2026 – August 2027
          </span>
          <h2 className="text-xl font-extrabold text-stone-900">Yearly Contribution Matrix</h2>
          <p className="text-xs text-stone-500">12-month payment overview across all mandal members</p>
        </div>

        {/* View Switcher for Desktop/Mobile preference */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Card View</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Table Grid</span>
          </button>
        </div>
      </div>

      {/* Legend Banner */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/70 flex items-center justify-between text-xs font-semibold text-stone-700">
        <span className="text-stone-500">Legend:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✅ Paid
          </span>
          <span className="flex items-center gap-1 text-rose-800">
            <XCircle className="w-4 h-4 text-rose-600" /> ❌ Pending
          </span>
        </div>
      </div>

      {/* Mobile Card / List View */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {members.map((m) => {
            let paidCount = 0;
            CONTRIBUTION_MONTHS.forEach((month) => {
              if (paidMap.get(`${m.id}_${month}`)) paidCount++;
            });

            return (
              <div key={m.id} className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold text-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-base">{m.name}</h3>
                      <p className="text-[11px] text-stone-500 font-medium">
                        ₹{m.monthlyContribution.toLocaleString()} / month
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
                    {paidCount} / 11 Paid
                  </span>
                </div>

                {/* 12 Months Pill Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {CONTRIBUTION_MONTHS.map((month) => {
                    const isPaid = paidMap.get(`${m.id}_${month}`);
                    return (
                      <div
                        key={month}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isPaid
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-stone-500 uppercase block">
                          {MONTH_SHORT[month]}
                        </span>
                        <span className="text-sm font-black block mt-0.5">{isPaid ? '✅' : '❌'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Desktop Table View */
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-extrabold text-stone-600">
              <tr>
                <th className="p-3 sticky left-0 bg-stone-50 z-10">Member</th>
                {CONTRIBUTION_MONTHS.map((m) => (
                  <th key={m} className="p-3 text-center">
                    {MONTH_SHORT[m]}
                  </th>
                ))}
                <th className="p-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((m) => {
                let paidCount = 0;
                return (
                  <tr key={m.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-3 font-bold text-stone-900 sticky left-0 bg-white shadow-sm">
                      {m.name}
                    </td>
                    {CONTRIBUTION_MONTHS.map((month) => {
                      const isPaid = paidMap.get(`${m.id}_${month}`);
                      if (isPaid) paidCount++;
                      return (
                        <td key={month} className="p-3 text-center font-bold">
                          {isPaid ? <span className="text-emerald-600">✅</span> : <span className="text-rose-600">❌</span>}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-extrabold text-amber-900 bg-stone-50">
                      {paidCount}/11
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
