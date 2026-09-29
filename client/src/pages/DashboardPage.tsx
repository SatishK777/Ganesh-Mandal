import React from 'react';
import type { DashboardSummary, Member } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
  Wallet,
  Calendar,
  ChevronRight,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  loading: boolean;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onOpenPaymentModal: (memberId?: number, month?: string) => void;
  onNavigate: (tab: string) => void;
  members: Member[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  loading,
  selectedMonth,
  setSelectedMonth,
  onOpenPaymentModal,
  onNavigate,
}) => {
  const { isAdmin } = useAuth();

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-stone-600">Loading Mandal Financial Data...</p>
      </div>
    );
  }

  const { currentMonth, overall, recentExpenses, monthsList } = summary;

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Month Selector Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-4 sm:p-5 text-white shadow-xl shadow-amber-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-8xl sm:text-9xl font-black pointer-events-none">
          🙏
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/30 text-amber-100 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block truncate max-w-full">
                Active Period: Oct 2026 – Aug 2027
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Ganesh Chaturthi Mandal Fund
            </h2>
            <p className="text-xs text-amber-100 mt-0.5 font-medium">
              Transparent collection & expense tracking for 6 mandal members
            </p>
          </div>

          {/* Month Dropdown Selector */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-1.5 rounded-xl border border-white/20 self-start sm:self-auto shrink-0">
            <Calendar className="w-4 h-4 text-amber-200 ml-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer py-1 pr-3 border-none"
            >
              {monthsList.map((m) => (
                <option key={m.key} value={m.key} className="text-stone-800 font-semibold">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Month Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Selected Month</span>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900">{currentMonth.monthName}</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium block">Paid Status</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                {currentMonth.paidMembers} / {currentMonth.eligibleMembers} Members
              </span>
            </div>
          </div>

          <ProgressBar
            current={currentMonth.collected}
            total={currentMonth.expected}
            label={`Collection: ₹${currentMonth.collected.toLocaleString()} / ₹${currentMonth.expected.toLocaleString()}`}
            colorClass="bg-gradient-to-r from-emerald-500 to-teal-600"
          />

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="text-[10px] text-stone-500 font-medium block">Expected</span>
              <span className="text-xs sm:text-sm font-bold text-stone-800">₹{currentMonth.expected.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-semibold block">Collected</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800">₹{currentMonth.collected.toLocaleString()}</span>
            </div>
            <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 font-semibold block">Pending</span>
              <span className="text-xs sm:text-sm font-extrabold text-rose-800">₹{currentMonth.pending.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Overall Collection Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/70 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Full Year Target</span>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900">Overall Collection</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium block">Months Progress</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mt-0.5">
                {overall.paidSlotsCount} / {overall.totalSlotsExpected} Payments
              </span>
            </div>
          </div>

          <ProgressBar
            current={overall.collected}
            total={overall.expected}
            label={`Total: ₹${overall.collected.toLocaleString()} / ₹${overall.expected.toLocaleString()}`}
            colorClass="bg-gradient-to-r from-amber-500 to-orange-600"
          />

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="text-[10px] text-stone-500 font-medium block">Expected</span>
              <span className="text-xs sm:text-sm font-bold text-stone-800">₹{overall.expected.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-semibold block">Collected</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-800">₹{overall.collected.toLocaleString()}</span>
            </div>
            <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
              <span className="text-[10px] text-rose-700 font-semibold block">Pending</span>
              <span className="text-xs sm:text-sm font-extrabold text-rose-800">₹{overall.pending.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Key Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">Total Expected</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-stone-900">₹{overall.expected.toLocaleString()}</div>
            <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">6 Members × 11 Mos</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-emerald-800">₹{overall.collected.toLocaleString()}</div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 font-medium">Received in bank/cash</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/40">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Pending</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-rose-800">₹{overall.pending.toLocaleString()}</div>
            <p className="text-[10px] sm:text-[11px] text-rose-600 mt-0.5 font-medium">Remaining to collect</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/50">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Current Balance</span>
            <Wallet className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className={`text-lg sm:text-xl font-black ${overall.balance >= 0 ? 'text-amber-900' : 'text-rose-700'}`}>
              ₹{overall.balance.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">Collected − Expenses</p>
          </div>
        </div>
      </div>

      {/* Quick Transparency Overview Widget */}
      <div className="bg-amber-100/60 rounded-2xl p-4 border border-amber-300/70">
        <div className="flex items-center gap-2 mb-2.5">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800" />
          <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm">Quick Transparency Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-stone-500 font-medium block">Who has paid ({currentMonth.monthName}):</span>
            <span className="font-bold text-emerald-700">
              {currentMonth.memberStatusList.filter((m) => m.status === 'Paid').map((m) => m.name).join(', ') || 'None yet'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-200/60">
            <span className="text-stone-500 font-medium block">Who has NOT paid ({currentMonth.monthName}):</span>
            <span className="font-bold text-rose-700">
              {currentMonth.memberStatusList.filter((m) => m.status === 'Pending').map((m) => m.name).join(', ') || 'All Paid!'}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Contribution Matrix for Selected Month */}
      <div className="bg-white rounded-2xl border border-amber-200/70 shadow-sm overflow-hidden">
        <div className="festive-card-header p-4 border-b border-amber-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <span>Member Status</span>
              <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                {currentMonth.monthName}
              </span>
            </h3>
            <p className="text-xs text-stone-500">Live contribution matrix for all members</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onOpenPaymentModal(undefined, selectedMonth)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-stone-100">
          {currentMonth.memberStatusList.map((m) => {
            const isPaid = m.status === 'Paid';
            return (
              <div
                key={m.memberId}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-amber-50/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm shrink-0 ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{m.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] sm:text-xs text-stone-500 mt-0.5">
                      <span>Monthly: ₹{m.amount.toLocaleString()}</span>
                      {isPaid && m.paymentMethod && (
                        <span className="bg-stone-100 px-1.5 py-0.2 rounded font-medium text-stone-600">
                          {m.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-extrabold ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ✅ Paid
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> ❌ Pending
                        </>
                      )}
                    </span>
                    {isPaid && m.paymentDate && (
                      <span className="text-[10px] text-stone-400 block mt-0.5 font-medium">
                        Paid on {m.paymentDate}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onOpenPaymentModal(m.memberId, selectedMonth)}
                      className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors"
                    >
                      {isPaid ? 'Edit' : 'Pay'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Recent Mandal Expenses</span>
            </h3>
            <p className="text-xs text-stone-500">Total Spent: ₹{overall.totalExpenses.toLocaleString()}</p>
          </div>
          <button
            onClick={() => onNavigate('expenses')}
            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-3 text-center">No expenses logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs"
              >
                <div>
                  <h4 className="font-bold text-stone-800">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                      {exp.category}
                    </span>
                    <span>{exp.expenseDate}</span>
                  </div>
                </div>
                <div className="font-extrabold text-rose-700 text-sm">₹{exp.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
