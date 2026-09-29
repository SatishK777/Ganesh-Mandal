import type { DashboardSummary, MonthlySummary, Member, Contribution, Expense } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mandal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<{ token: string; username: string }>(res);
  },

  async verifyMe(): Promise<{ admin: { id: number; username: string } }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse<{ admin: { id: number; username: string } }>(res);
  },

  // Dashboard
  async getDashboardSummary(month?: string): Promise<DashboardSummary> {
    const url = month ? `${API_BASE}/dashboard/summary?month=${month}` : `${API_BASE}/dashboard/summary`;
    const res = await fetch(url, { headers: getAuthHeader() });
    return handleResponse<DashboardSummary>(res);
  },

  async getMonthlySummary(month: string): Promise<MonthlySummary> {
    const res = await fetch(`${API_BASE}/dashboard/monthly-summary?month=${month}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<MonthlySummary>(res);
  },

  // Members
  async getMembers(): Promise<Member[]> {
    const res = await fetch(`${API_BASE}/members`, { headers: getAuthHeader() });
    return handleResponse<Member[]>(res);
  },

  async getMember(id: number): Promise<Member> {
    const res = await fetch(`${API_BASE}/members/${id}`, { headers: getAuthHeader() });
    return handleResponse<Member>(res);
  },

  async addMember(member: Partial<Member>): Promise<Member> {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(member),
    });
    return handleResponse<Member>(res);
  },

  async updateMember(id: number, member: Partial<Member>): Promise<Member> {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(member),
    });
    return handleResponse<Member>(res);
  },

  async deleteMember(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Contributions
  async getContributions(): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/contributions`, { headers: getAuthHeader() });
    return handleResponse<Contribution[]>(res);
  },

  async getMemberContributions(memberId: number): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/contributions/member/${memberId}`, { headers: getAuthHeader() });
    return handleResponse<Contribution[]>(res);
  },

  async markContributionPaid(contributionData: {
    memberId: number;
    contributionMonth: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes?: string;
    status?: 'Paid' | 'Pending';
  }): Promise<Contribution> {
    const res = await fetch(`${API_BASE}/contributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(contributionData),
    });
    return handleResponse<Contribution>(res);
  },

  async deleteContribution(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/contributions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Expenses
  async getExpenses(): Promise<{ expenses: Expense[]; totalExpenses: number }> {
    const res = await fetch(`${API_BASE}/expenses`, { headers: getAuthHeader() });
    return handleResponse<{ expenses: Expense[]; totalExpenses: number }>(res);
  },

  async addExpense(expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(expense),
    });
    return handleResponse<Expense>(res);
  },

  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(expense),
    });
    return handleResponse<Expense>(res);
  },

  async deleteExpense(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },
};
