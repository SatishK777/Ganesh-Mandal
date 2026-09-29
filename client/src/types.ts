export interface Member {
  id: number;
  name: string;
  phone?: string;
  monthlyContribution: number;
  joinedAt: string;
  isActive: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contribution {
  id?: number;
  memberId: number;
  memberName?: string;
  contributionMonth: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paymentDate?: string | null;
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other' | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  description?: string;
  receipt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberMonthlyStatus {
  memberId: number;
  name: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paymentDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
}

export interface DashboardSummary {
  members: {
    total: number;
    active: number;
  };
  currentMonth: {
    month: string;
    monthName: string;
    expected: number;
    collected: number;
    pending: number;
    paidMembers: number;
    pendingMembers: number;
    eligibleMembers: number;
    memberStatusList: MemberMonthlyStatus[];
  };
  overall: {
    expected: number;
    collected: number;
    pending: number;
    totalExpenses: number;
    balance: number;
    paidSlotsCount: number;
    totalSlotsExpected: number;
  };
  recentExpenses: Expense[];
  monthsList: { key: string; label: string }[];
}

export interface MonthlySummaryMember {
  memberId: number;
  name: string;
  monthlyContribution: number;
  status: 'Paid' | 'Pending';
  paidAmount: number;
  paymentDate: string | null;
  paymentMethod: string | null;
  contributionId: number | null;
}

export interface MonthlySummary {
  month: string;
  monthName: string;
  expected: number;
  collected: number;
  pending: number;
  paidCount: number;
  pendingCount: number;
  members: MonthlySummaryMember[];
}
