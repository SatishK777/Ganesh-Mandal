import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Member } from '../types';
import { X, CheckCircle2, IndianRupee, Calendar, FileText } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  members: Member[];
  initialMemberId?: number;
  initialMonth?: string;
  existingData?: {
    id?: number;
    amount?: number;
    paymentDate?: string;
    paymentMethod?: string;
    notes?: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  members,
  initialMemberId,
  initialMonth = '2026-10',
  existingData,
}) => {
  const [memberId, setMemberId] = useState<number>(initialMemberId || (members[0]?.id || 1));
  const [month, setMonth] = useState<string>(initialMonth);
  const [amount, setAmount] = useState<number>(1000);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialMemberId) setMemberId(initialMemberId);
    if (initialMonth) setMonth(initialMonth);
    
    // Set default amount based on selected member's monthly contribution
    const selectedMem = members.find((m) => m.id === (initialMemberId || memberId));
    if (selectedMem) {
      setAmount(existingData?.amount || selectedMem.monthlyContribution || 1000);
    }

    if (existingData) {
      if (existingData.paymentDate) setPaymentDate(existingData.paymentDate);
      if (existingData.paymentMethod) setPaymentMethod(existingData.paymentMethod);
      if (existingData.notes) setNotes(existingData.notes);
    } else {
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
    }
  }, [isOpen, initialMemberId, initialMonth, existingData, members, memberId]);

  if (!isOpen) return null;

  const handleMemberChange = (id: number) => {
    setMemberId(id);
    const m = members.find((mem) => mem.id === id);
    if (m) {
      setAmount(m.monthlyContribution || 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.markContributionPaid({
        memberId,
        contributionMonth: month,
        amount,
        paymentDate,
        paymentMethod,
        notes,
        status: 'Paid',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment record');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200">
        <div className="festive-gradient p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Record Monthly Payment</h2>
              <p className="text-xs text-amber-100">Mark member contribution as Paid ✅</p>
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

          {/* Member Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Mandal Member</label>
            <select
              value={memberId}
              onChange={(e) => handleMemberChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Default ₹{m.monthlyContribution.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Contribution Month */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Contribution Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
            >
              {monthsOptions.map((mo) => (
                <option key={mo.key} value={mo.key}>
                  {mo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Payment Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {['UPI', 'Cash', 'Bank Transfer', 'Other'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                    paymentMethod === method
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Notes (Optional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid via GPay / Receipt #12"
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
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Saving...' : 'Mark as Paid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
