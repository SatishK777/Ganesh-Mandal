import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'db.json');
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
export const MONTH_NAMES = {
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
export function readDb() {
    if (!fs.existsSync(dbFilePath)) {
        return seedInitialData();
    }
    try {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch (err) {
        console.error('Error reading db.json, re-seeding...', err);
        return seedInitialData();
    }
}
export function writeDb(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}
export function seedInitialData() {
    const hash = bcrypt.hashSync('sat123@_', 10);
    const now = new Date().toISOString();
    const initialAdmins = [
        {
            id: 1,
            username: 'satish01',
            passwordHash: hash,
            createdAt: now,
        },
    ];
    const memberNames = ['Satish', 'Alok', 'Rohan', 'Govinda', 'Hardik', 'Keyur'];
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
    const initialContributions = [];
    const initialExpenses = [];
    const data = {
        admins: initialAdmins,
        members: initialMembers,
        contributions: initialContributions,
        expenses: initialExpenses,
    };
    writeDb(data);
    console.log('📂 Initialized & seeded clean JSON database file at server/data/db.json');
    return data;
}
export function initDb() {
    readDb();
}
