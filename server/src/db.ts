import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'db.json');

export interface Admin {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Member {
  id: number;
  name: string;
  phone?: string;
  monthlyContribution: number;
  joinedAt: string;
  isActive: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: number;
  memberId: number;
  contributionMonth: string;
  amount: number;
  status: 'Paid' | 'Pending';
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface DBData {
  admins: Admin[];
  members: Member[];
  contributions: Contribution[];
  expenses: Expense[];
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

export const MONTH_NAMES: Record<string, string> = {
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

// --- Mongoose Schemas & Models ---
const AdminSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const MemberSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  monthlyContribution: { type: Number, default: 1000 },
  joinedAt: { type: String, default: '2026-10' },
  isActive: { type: Number, default: 1 },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const ContributionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  memberId: { type: Number, required: true },
  contributionMonth: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  paymentDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  paymentMethod: { type: String, default: 'UPI' },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const ExpenseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: 'Other' },
  amount: { type: Number, required: true },
  expenseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  paymentMethod: { type: String, default: 'UPI' },
  description: { type: String, default: '' },
  receipt: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const MemberModel = mongoose.models.Member || mongoose.model('Member', MemberSchema);
export const ContributionModel = mongoose.models.Contribution || mongoose.model('Contribution', ContributionSchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

export let isMongoActive = false;

// --- Local File Storage Helpers ---
export function readLocalDb(): DBData {
  if (!fs.existsSync(dbFilePath)) {
    return seedInitialData();
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw) as DBData;
  } catch (err) {
    console.error('Error reading db.json, re-seeding...', err);
    return seedInitialData();
  }
}

export function writeLocalDb(data: DBData): void {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function seedInitialData(): DBData {
  const hash = bcrypt.hashSync('sat123@_', 10);
  const now = new Date().toISOString();

  const initialAdmins: Admin[] = [
    {
      id: 1,
      username: 'satish01',
      passwordHash: hash,
      createdAt: now,
    },
  ];

  const memberNames = ['Satish', 'Alok', 'Rohan', 'Govinda', 'Hardik', 'Keyur'];

  const initialMembers: Member[] = memberNames.map((name, index) => ({
    id: index + 1,
    name,
    phone: '',
    monthlyContribution: 1000,
    joinedAt: '2026-10',
    isActive: 1,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }));

  const initialContributions: Contribution[] = [];
  const initialExpenses: Expense[] = [];

  const data: DBData = {
    admins: initialAdmins,
    members: initialMembers,
    contributions: initialContributions,
    expenses: initialExpenses,
  };

  writeLocalDb(data);
  return data;
}

// --- MongoDB Seeding & Migration ---
async function seedMongoInitialData() {
  const adminCount = await AdminModel.countDocuments();
  const memberCount = await MemberModel.countDocuments();

  if (adminCount === 0 || memberCount === 0) {
    const local = readLocalDb();

    if (adminCount === 0) {
      if (local.admins && local.admins.length > 0) {
        await AdminModel.insertMany(local.admins);
      } else {
        const hash = bcrypt.hashSync('sat123@_', 10);
        await AdminModel.create({
          id: 1,
          username: 'satish01',
          passwordHash: hash,
          createdAt: new Date().toISOString(),
        });
      }
      console.log('✅ MongoDB: Seeded Admin accounts');
    }

    if (memberCount === 0) {
      if (local.members && local.members.length > 0) {
        await MemberModel.insertMany(local.members);
      } else {
        const memberNames = ['Satish', 'Alok', 'Rohan', 'Govinda', 'Hardik', 'Keyur'];
        const now = new Date().toISOString();
        const initialMembers = memberNames.map((name, index) => ({
          id: index + 1,
          name,
          phone: '',
          monthlyContribution: 1000,
          joinedAt: '2026-10',
          isActive: 1,
          notes: '',
          createdAt: now,
          updatedAt: now,
        }));
        await MemberModel.insertMany(initialMembers);
      }
      console.log('✅ MongoDB: Seeded Mandal Members');
    }

    const contribCount = await ContributionModel.countDocuments();
    if (contribCount === 0 && local.contributions && local.contributions.length > 0) {
      await ContributionModel.insertMany(local.contributions);
    }

    const expCount = await ExpenseModel.countDocuments();
    if (expCount === 0 && local.expenses && local.expenses.length > 0) {
      await ExpenseModel.insertMany(local.expenses);
    }
  }
}

// --- Initialize Database Connection ---
export async function initDb() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      console.log('🔄 Connecting to MongoDB...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoActive = true;
      console.log('🍃 Connected to MongoDB Atlas successfully! Payments will persist permanently.');
      await seedMongoInitialData();
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB, falling back to db.json:', err);
      isMongoActive = false;
      readLocalDb();
    }
  } else {
    console.log('📂 MONGODB_URI not set. Using local server/data/db.json storage.');
    isMongoActive = false;
    readLocalDb();
  }
}

// --- Unified Data Retrieval & Persistence API ---
export async function getDbData(): Promise<DBData> {
  if (isMongoActive) {
    const [admins, members, contributions, expenses] = await Promise.all([
      AdminModel.find().lean(),
      MemberModel.find().lean(),
      ContributionModel.find().lean(),
      ExpenseModel.find().lean(),
    ]);

    return {
      admins: admins.map((a: any) => ({
        id: a.id,
        username: a.username,
        passwordHash: a.passwordHash,
        createdAt: a.createdAt,
      })),
      members: members.map((m: any) => ({
        id: m.id,
        name: m.name,
        phone: m.phone || '',
        monthlyContribution: m.monthlyContribution,
        joinedAt: m.joinedAt,
        isActive: m.isActive,
        notes: m.notes || '',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      contributions: contributions.map((c: any) => ({
        id: c.id,
        memberId: c.memberId,
        contributionMonth: c.contributionMonth,
        amount: c.amount,
        status: c.status,
        paymentDate: c.paymentDate,
        paymentMethod: c.paymentMethod,
        notes: c.notes || '',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      expenses: expenses.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        amount: e.amount,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod,
        description: e.description || '',
        receipt: e.receipt || '',
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
    };
  } else {
    return readLocalDb();
  }
}

// --- Member Operations ---
export async function createMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const highest = await MemberModel.findOne().sort({ id: -1 }).lean() as any;
    const nextId = highest ? highest.id + 1 : 1;
    const doc = await MemberModel.create({
      id: nextId,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return doc.toObject() as Member;
  } else {
    const local = readLocalDb();
    const nextId = local.members.length > 0 ? Math.max(...local.members.map((m) => m.id)) + 1 : 1;
    const newMember: Member = {
      id: nextId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    local.members.push(newMember);
    writeLocalDb(local);
    return newMember;
  }
}

export async function updateMemberById(id: number, data: Partial<Member>): Promise<Member | null> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const doc = await MemberModel.findOneAndUpdate(
      { id },
      { ...data, updatedAt: now },
      { new: true }
    ).lean() as any;
    return doc ? (doc as Member) : null;
  } else {
    const local = readLocalDb();
    const index = local.members.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const updated: Member = {
      ...local.members[index],
      ...data,
      updatedAt: now,
    };
    local.members[index] = updated;
    writeLocalDb(local);
    return updated;
  }
}

export async function deleteMemberById(id: number): Promise<boolean> {
  if (isMongoActive) {
    const res = await MemberModel.deleteOne({ id });
    await ContributionModel.deleteMany({ memberId: id });
    return res.deletedCount > 0;
  } else {
    const local = readLocalDb();
    const index = local.members.findIndex((m) => m.id === id);
    if (index === -1) return false;
    local.members.splice(index, 1);
    local.contributions = local.contributions.filter((c) => c.memberId !== id);
    writeLocalDb(local);
    return true;
  }
}

// --- Contribution Operations ---
export async function saveOrUpdateContribution(data: Omit<Contribution, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contribution> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const existing = await ContributionModel.findOne({
      memberId: data.memberId,
      contributionMonth: data.contributionMonth,
    });

    if (existing) {
      existing.amount = data.amount;
      existing.status = data.status;
      existing.paymentDate = data.paymentDate;
      existing.paymentMethod = data.paymentMethod;
      existing.notes = data.notes || '';
      existing.updatedAt = now;
      await existing.save();
      return existing.toObject() as Contribution;
    } else {
      const highest = await ContributionModel.findOne().sort({ id: -1 }).lean() as any;
      const nextId = highest ? highest.id + 1 : 1;
      const doc = await ContributionModel.create({
        id: nextId,
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      return doc.toObject() as Contribution;
    }
  } else {
    const local = readLocalDb();
    const index = local.contributions.findIndex(
      (c) => c.memberId === data.memberId && c.contributionMonth === data.contributionMonth
    );

    if (index !== -1) {
      const updated: Contribution = {
        ...local.contributions[index],
        ...data,
        updatedAt: now,
      };
      local.contributions[index] = updated;
      writeLocalDb(local);
      return updated;
    } else {
      const nextId = local.contributions.length > 0 ? Math.max(...local.contributions.map((c) => c.id)) + 1 : 1;
      const newContrib: Contribution = {
        id: nextId,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      local.contributions.push(newContrib);
      writeLocalDb(local);
      return newContrib;
    }
  }
}

export async function updateContributionById(id: number, data: Partial<Contribution>): Promise<Contribution | null> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const doc = await ContributionModel.findOneAndUpdate(
      { id },
      { ...data, updatedAt: now },
      { new: true }
    ).lean() as any;
    return doc ? (doc as Contribution) : null;
  } else {
    const local = readLocalDb();
    const index = local.contributions.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated: Contribution = {
      ...local.contributions[index],
      ...data,
      updatedAt: now,
    };
    local.contributions[index] = updated;
    writeLocalDb(local);
    return updated;
  }
}

export async function deleteContributionById(id: number): Promise<boolean> {
  if (isMongoActive) {
    const res = await ContributionModel.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const local = readLocalDb();
    const index = local.contributions.findIndex((c) => c.id === id);
    if (index === -1) return false;
    local.contributions.splice(index, 1);
    writeLocalDb(local);
    return true;
  }
}

// --- Expense Operations ---
export async function createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const highest = await ExpenseModel.findOne().sort({ id: -1 }).lean() as any;
    const nextId = highest ? highest.id + 1 : 1;
    const doc = await ExpenseModel.create({
      id: nextId,
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return doc.toObject() as Expense;
  } else {
    const local = readLocalDb();
    const nextId = local.expenses.length > 0 ? Math.max(...local.expenses.map((e) => e.id)) + 1 : 1;
    const newExpense: Expense = {
      id: nextId,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    local.expenses.push(newExpense);
    writeLocalDb(local);
    return newExpense;
  }
}

export async function updateExpenseById(id: number, data: Partial<Expense>): Promise<Expense | null> {
  const now = new Date().toISOString();
  if (isMongoActive) {
    const doc = await ExpenseModel.findOneAndUpdate(
      { id },
      { ...data, updatedAt: now },
      { new: true }
    ).lean() as any;
    return doc ? (doc as Expense) : null;
  } else {
    const local = readLocalDb();
    const index = local.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const updated: Expense = {
      ...local.expenses[index],
      ...data,
      updatedAt: now,
    };
    local.expenses[index] = updated;
    writeLocalDb(local);
    return updated;
  }
}

export async function deleteExpenseById(id: number): Promise<boolean> {
  if (isMongoActive) {
    const res = await ExpenseModel.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const local = readLocalDb();
    const index = local.expenses.findIndex((e) => e.id === id);
    if (index === -1) return false;
    local.expenses.splice(index, 1);
    writeLocalDb(local);
    return true;
  }
}
