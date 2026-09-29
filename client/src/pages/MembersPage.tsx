import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Member, Contribution } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Phone, FileText, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { getMemberAvatarGradient } from '../utils/avatar';

interface MembersPageProps {
  onOpenMemberModal: (member?: Member | null) => void;
}

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

const MONTH_LABEL: Record<string, string> = {
  '2026-10': 'October 2026',
  '2026-11': 'November 2026',
  '2026-12': 'December 2026',
  '2027-01': 'January 2027',
  '2027-02': 'February 2027',
  '2027-03': 'March 2027',
  '2027-04': 'April 2027',
  '2027-05': 'May 2027',
  '2027-06': 'June 2027',
  '2027-07': 'July 2027',
  '2027-08': 'August 2027',
};

export const MembersPage: React.FC<MembersPageProps> = ({ onOpenMemberModal }) => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, conRes] = await Promise.all([api.getMembers(), api.getContributions()]);
      setMembers(memRes);
      setContributions(conRes);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member? All their payment records will be removed.')) {
      return;
    }
    try {
      await api.deleteMember(id);
      if (selectedMember?.id === id) setSelectedMember(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-stone-600">Loading mandal member directory...</p>
      </div>
    );
  }

  // Calculate stats for a specific member (Section 8 Individual Summary)
  const getMemberSummary = (m: Member) => {
    const memContribs = contributions.filter((c) => c.memberId === m.id && c.status === 'Paid');
    const paidMonthKeys = new Set(memContribs.map((c) => c.contributionMonth));

    // Calculate expected starting from joinedAt month
    const joinedIdx = CONTRIBUTION_MONTHS.indexOf(m.joinedAt);
    const startIdx = joinedIdx >= 0 ? joinedIdx : 0;
    const totalExpectedMonths = CONTRIBUTION_MONTHS.length - startIdx;
    
    let paidCount = 0;
    let paidAmount = 0;

    memContribs.forEach((c) => {
      paidCount++;
      paidAmount += c.amount;
    });

    const expectedAmount = totalExpectedMonths * m.monthlyContribution;
    const pendingCount = totalExpectedMonths - paidCount;
    const pendingAmount = Math.max(0, expectedAmount - paidAmount);

    return {
      totalExpectedMonths,
      paidCount,
      pendingCount: Math.max(0, pendingCount),
      paidAmount,
      pendingAmount,
      expectedAmount,
      paidMonthKeys,
      contribsList: memContribs,
    };
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Mandal Directory</span>
          <h2 className="text-xl font-extrabold text-stone-900">Mandal Members ({members.length})</h2>
          <p className="text-xs text-stone-500">Track individual contribution history & member profiles</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onOpenMemberModal(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Member List, Right Individual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Members Directory List */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-600">
              Select Member for Detail
            </div>
            <div className="divide-y divide-stone-100">
              {members.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                const summary = getMemberSummary(m);
                const avatarGradient = getMemberAvatarGradient(m.name);

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-100/70 border-l-4 border-amber-600' : 'hover:bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${avatarGradient}`}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">{m.name}</h4>
                        <p className="text-[11px] text-stone-500">
                          ₹{m.monthlyContribution.toLocaleString()} / mo • Joined {m.joinedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {summary.paidCount}/{summary.totalExpectedMonths} Paid
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 8: Individual Member Summary */}
        <div className="md:col-span-2">
          {selectedMember ? (
            (() => {
              const summary = getMemberSummary(selectedMember);
              const avatarGradient = getMemberAvatarGradient(selectedMember.name);
              return (
                <div className="bg-white rounded-2xl border border-amber-200/90 shadow-md p-5 space-y-5 animate-fadeIn">
                  {/* Member Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${avatarGradient}`}>
                        {selectedMember.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-stone-900">{selectedMember.name}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              selectedMember.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {selectedMember.isActive ? 'Active Member' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-medium">
                          Monthly Contribution Rate: <span className="font-bold text-stone-800">₹{selectedMember.monthlyContribution.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenMemberModal(selectedMember)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 font-bold rounded-xl text-xs hover:bg-amber-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMember(selectedMember.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-xl text-xs hover:bg-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Private Info Banner for Admin */}
                  {isAdmin && (selectedMember.phone || selectedMember.notes) && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1">
                      <span className="font-bold text-amber-900 block">🔒 Admin Private Info</span>
                      {selectedMember.phone && (
                        <p className="text-stone-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-700" />
                          Mobile: <span className="font-semibold">{selectedMember.phone}</span>
                        </p>
                      )}
                      {selectedMember.notes && (
                        <p className="text-stone-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-700" />
                          Notes: <span>{selectedMember.notes}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summary Metric Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">Paid Months</span>
                      <span className="text-lg font-black text-emerald-800">{summary.paidCount} months</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">Pending Months</span>
                      <span className="text-lg font-black text-rose-800">{summary.pendingCount} months</span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">Paid Amount</span>
                      <span className="text-lg font-black text-emerald-800">₹{summary.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                      <span className="text-[10px] text-rose-700 font-bold uppercase block">Pending Amount</span>
                      <span className="text-lg font-black text-rose-800">₹{summary.pendingAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* 12 Months Breakdown List */}
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm mb-3">12 Month Contribution Ledger</h4>
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                      {CONTRIBUTION_MONTHS.map((monthKey) => {
                        const paidRecord = summary.contribsList.find((c) => c.contributionMonth === monthKey);
                        const isPaid = !!paidRecord;

                        return (
                          <div key={monthKey} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50">
                            <span className="font-bold text-stone-800">{MONTH_LABEL[monthKey]}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-stone-700">₹{selectedMember.monthlyContribution.toLocaleString()}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                                  isPaid
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {isPaid ? '✅ Paid' : '❌ Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                👥
              </div>
              <h3 className="font-extrabold text-stone-800">Select a Member</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Click any member on the left directory to view their complete 12-month contribution breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
