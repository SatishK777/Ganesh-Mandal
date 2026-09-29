import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PaymentModal } from './components/PaymentModal';
import { MemberModal } from './components/MemberModal';
import { ExpenseModal } from './components/ExpenseModal';
import { DashboardPage } from './pages/DashboardPage';
import { MonthlyPage } from './pages/MonthlyPage';
import { YearlyPage } from './pages/YearlyPage';
import { MembersPage } from './pages/MembersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { api } from './api/client';
import type { DashboardSummary, Member, Expense } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalMemberId, setPaymentModalMemberId] = useState<number | undefined>(undefined);
  const [paymentModalMonth, setPaymentModalMonth] = useState<string>('2026-10');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, memRes] = await Promise.all([
        api.getDashboardSummary(selectedMonth),
        api.getMembers(),
      ]);
      setSummary(sumRes);
      setMembers(memRes);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [selectedMonth]);

  const handleOpenPaymentModal = (memberId?: number, month?: string) => {
    setPaymentModalMemberId(memberId);
    setPaymentModalMonth(month || selectedMonth);
    setIsPaymentModalOpen(true);
  };

  const handleOpenMemberModal = (member?: Member | null) => {
    setMemberToEdit(member || null);
    setIsMemberModalOpen(true);
  };

  const handleOpenExpenseModal = (expense?: Expense | null) => {
    setExpenseToEdit(expense || null);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/50 text-stone-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-20 sm:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            summary={summary}
            loading={loading}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onOpenPaymentModal={handleOpenPaymentModal}
            onNavigate={setActiveTab}
            members={members}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyPage
            onOpenPaymentModal={handleOpenPaymentModal}
            members={members}
            initialMonth={selectedMonth}
          />
        )}

        {activeTab === 'yearly' && <YearlyPage />}

        {activeTab === 'members' && (
          <MembersPage onOpenMemberModal={handleOpenMemberModal} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage onOpenExpenseModal={handleOpenExpenseModal} />
        )}
      </main>

      {/* Admin Login Dialog */}
      <AdminLoginModal />

      {/* Action Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={refreshAllData}
        members={members}
        initialMemberId={paymentModalMemberId}
        initialMonth={paymentModalMonth}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSuccess={refreshAllData}
        memberToEdit={memberToEdit}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={refreshAllData}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
