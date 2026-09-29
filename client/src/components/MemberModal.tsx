import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Member } from '../types';
import { X, UserPlus, UserCheck, IndianRupee, Phone, Calendar, FileText } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  memberToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [joinedAt, setJoinedAt] = useState('2026-10');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setPhone(memberToEdit.phone || '');
      setMonthlyContribution(memberToEdit.monthlyContribution || 1000);
      setJoinedAt(memberToEdit.joinedAt || '2026-10');
      setIsActive(memberToEdit.isActive === 1);
      setNotes(memberToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setMonthlyContribution(1000);
      setJoinedAt('2026-10');
      setIsActive(true);
      setNotes('');
    }
    setError('');
  }, [isOpen, memberToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (memberToEdit) {
        await api.updateMember(memberToEdit.id, {
          name,
          phone,
          monthlyContribution,
          joinedAt,
          isActive: isActive ? 1 : 0,
          notes,
        });
      } else {
        await api.addMember({
          name,
          phone,
          monthlyContribution,
          joinedAt,
          isActive: isActive ? 1 : 0,
          notes,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save member profile');
    } fontally: {
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
              {memberToEdit ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {memberToEdit ? 'Edit Mandal Member' : 'Add New Mandal Member'}
              </h2>
              <p className="text-xs text-amber-100">Configure contribution rate & joining date</p>
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

          {/* Member Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Member Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Ramesh Patil"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Mobile Number & Monthly Contribution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Mobile Number <span className="text-[10px] text-amber-700 font-normal">(Admin Only)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Monthly Contribution (₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-amber-900"
                />
              </div>
            </div>
          </div>

          {/* Joined Month */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Joining Contribution Month</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 z-10" />
              <select
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
              >
                {monthsOptions.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Member contributions will be calculated starting from their joined month.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-xs font-semibold text-stone-700 block">Member Active Status</span>
              <span className="text-[11px] text-stone-500 block">
                {isActive ? 'Active member in calculation matrix' : 'Inactive / Paused member'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isActive ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notes (Admin Only) */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Admin Notes <span className="text-[10px] text-amber-700 font-normal">(Admin Only)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Core organizer / Committee head"
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
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-md shadow-amber-600/20"
            >
              {loading ? 'Saving...' : memberToEdit ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
