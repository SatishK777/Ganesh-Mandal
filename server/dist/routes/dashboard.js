import { Router } from 'express';
import { readDb, CONTRIBUTION_MONTHS, MONTH_NAMES } from '../db.js';
const router = Router();
router.get('/summary', (req, res) => {
    const dbData = readDb();
    // 1. Members count
    const activeMembers = dbData.members.filter((m) => m.isActive === 1);
    const totalMembers = dbData.members.length;
    // Expected overall collection calculation
    let expectedOverall = 0;
    let totalSlotsExpected = 0;
    for (const m of activeMembers) {
        const joinedIdx = CONTRIBUTION_MONTHS.indexOf(m.joinedAt);
        const startIndex = joinedIdx >= 0 ? joinedIdx : 0;
        const monthsCount = CONTRIBUTION_MONTHS.length - startIndex;
        expectedOverall += m.monthlyContribution * monthsCount;
        totalSlotsExpected += monthsCount;
    }
    // Overall collected
    const paidContributions = dbData.contributions.filter((c) => c.status === 'Paid');
    const collectedOverall = paidContributions.reduce((sum, c) => sum + c.amount, 0);
    const paidSlotsCount = paidContributions.length;
    const pendingOverall = Math.max(0, expectedOverall - collectedOverall);
    // Total expenses
    const totalExpenses = dbData.expenses.reduce((sum, e) => sum + e.amount, 0);
    // Current balance
    const balance = collectedOverall - totalExpenses;
    // Default current month or requested month
    const targetMonth = req.query.month || '2026-10';
    // Calculate month metrics
    let expectedMonth = 0;
    let eligibleMembersForMonth = 0;
    for (const m of activeMembers) {
        const joinedIdx = CONTRIBUTION_MONTHS.indexOf(m.joinedAt);
        const targetIdx = CONTRIBUTION_MONTHS.indexOf(targetMonth);
        if (joinedIdx === -1 || targetIdx === -1 || joinedIdx <= targetIdx) {
            expectedMonth += m.monthlyContribution;
            eligibleMembersForMonth++;
        }
    }
    const monthPaidContribs = dbData.contributions.filter((c) => c.contributionMonth === targetMonth && c.status === 'Paid');
    const monthCollected = monthPaidContribs.reduce((sum, c) => sum + c.amount, 0);
    const paidMembersCount = monthPaidContribs.length;
    const monthPending = Math.max(0, expectedMonth - monthCollected);
    // Contributions per member detailed status list for targetMonth
    const memberContributions = activeMembers.map((m) => {
        const contrib = dbData.contributions.find((c) => c.memberId === m.id && c.contributionMonth === targetMonth);
        return {
            memberId: m.id,
            name: m.name,
            amount: m.monthlyContribution,
            status: contrib && contrib.status === 'Paid' ? 'Paid' : 'Pending',
            paymentDate: contrib ? contrib.paymentDate : null,
            paymentMethod: contrib ? contrib.paymentMethod : null,
            notes: contrib ? contrib.notes : null,
        };
    });
    // Recent expenses
    const recentExpenses = [...dbData.expenses]
        .sort((a, b) => (b.expenseDate > a.expenseDate ? 1 : -1))
        .slice(0, 5);
    res.json({
        members: {
            total: totalMembers,
            active: activeMembers.length,
        },
        currentMonth: {
            month: targetMonth,
            monthName: MONTH_NAMES[targetMonth] || targetMonth,
            expected: expectedMonth,
            collected: monthCollected,
            pending: monthPending,
            paidMembers: paidMembersCount,
            pendingMembers: eligibleMembersForMonth - paidMembersCount,
            eligibleMembers: eligibleMembersForMonth,
            memberStatusList: memberContributions,
        },
        overall: {
            expected: expectedOverall,
            collected: collectedOverall,
            pending: pendingOverall,
            totalExpenses,
            balance,
            paidSlotsCount,
            totalSlotsExpected,
        },
        recentExpenses,
        monthsList: CONTRIBUTION_MONTHS.map((m) => ({ key: m, label: MONTH_NAMES[m] })),
    });
});
router.get('/monthly-summary', (req, res) => {
    const month = req.query.month || '2026-10';
    if (!CONTRIBUTION_MONTHS.includes(month)) {
        return res.status(400).json({ error: 'Invalid month parameter' });
    }
    const dbData = readDb();
    const activeMembers = [...dbData.members]
        .filter((m) => m.isActive === 1)
        .sort((a, b) => a.name.localeCompare(b.name));
    let expected = 0;
    const members = activeMembers.map((m) => {
        expected += m.monthlyContribution;
        const contrib = dbData.contributions.find((c) => c.memberId === m.id && c.contributionMonth === month);
        return {
            memberId: m.id,
            name: m.name,
            monthlyContribution: m.monthlyContribution,
            status: contrib && contrib.status === 'Paid' ? 'Paid' : 'Pending',
            paidAmount: contrib && contrib.status === 'Paid' ? contrib.amount : 0,
            paymentDate: contrib ? contrib.paymentDate : null,
            paymentMethod: contrib ? contrib.paymentMethod : null,
            contributionId: contrib ? contrib.id : null,
        };
    });
    const monthPaidContribs = dbData.contributions.filter((c) => c.contributionMonth === month && c.status === 'Paid');
    const collected = monthPaidContribs.reduce((sum, c) => sum + c.amount, 0);
    const pending = Math.max(0, expected - collected);
    res.json({
        month,
        monthName: MONTH_NAMES[month] || month,
        expected,
        collected,
        pending,
        paidCount: monthPaidContribs.length,
        pendingCount: activeMembers.length - monthPaidContribs.length,
        members,
    });
});
export default router;
