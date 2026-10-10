const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'transactions.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        [
          {
            id: 'demo-1',
            type: 'income',
            category: 'Salary',
            amount: 5200,
            date: '2026-10-01',
            description: 'Monthly salary'
          },
          {
            id: 'demo-2',
            type: 'expense',
            category: 'Housing',
            amount: 1800,
            date: '2026-10-03',
            description: 'Apartment rent'
          },
          {
            id: 'demo-3',
            type: 'expense',
            category: 'Food',
            amount: 520,
            date: '2026-10-05',
            description: 'Groceries and dining'
          },
          {
            id: 'demo-4',
            type: 'expense',
            category: 'Transport',
            amount: 240,
            date: '2026-10-06',
            description: 'Fuel and rides'
          },
          {
            id: 'demo-5',
            type: 'income',
            category: 'Freelance',
            amount: 900,
            date: '2026-10-12',
            description: 'Website design project'
          },
          {
            id: 'demo-6',
            type: 'expense',
            category: 'Entertainment',
            amount: 340,
            date: '2026-10-14',
            description: 'Streaming and events'
          }
        ],
        null,
        2
      )
    );
  }
}

function readTransactions() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw);
}

function writeTransactions(transactions) {
  fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);
}

function safeNumber(value) {
  return Number(value) || 0;
}

function getMonthName(dateString) {
  return new Date(dateString + 'T00:00:00').toLocaleString('en-US', {
    month: 'short'
  });
}

function calculateExpenseBreakdown(transactions) {
  const expenseItems = transactions.filter((item) => item.type === 'expense');

  const grouped = expenseItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + safeNumber(item.amount);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function calculateMonthlyTrend(transactions) {
  const months = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: getMonthName(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`), income: 0, expense: 0 };
  }

  transactions.forEach((item) => {
    const date = new Date(item.date + 'T00:00:00');
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (months[key]) {
      if (item.type === 'income') {
        months[key].income += safeNumber(item.amount);
      } else {
        months[key].expense += safeNumber(item.amount);
      }
    }
  });

  return Object.values(months).map((monthData) => ({
    month: monthData.month,
    income: monthData.income,
    expense: monthData.expense
  }));
}

function buildInsights(transactions) {
  if (!transactions.length) {
    return [
      'Add your first transaction to unlock AI-powered insights.',
      'Your budget overview will appear here once income and expenses are recorded.'
    ];
  }

  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const net = totalIncome - totalExpense;
  const breakdown = calculateExpenseBreakdown(transactions);
  const topCategory = breakdown[0];
  const monthlyTrend = calculateMonthlyTrend(transactions);
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] || { income: 0, expense: 0 };
  const previousMonth = monthlyTrend[monthlyTrend.length - 2] || { income: 0, expense: 0 };

  const insights = [];

  if (topCategory) {
    const percent = totalExpense ? ((topCategory.total / totalExpense) * 100).toFixed(1) : 0;
    insights.push(`Your biggest spending category is ${topCategory.category}, accounting for ${percent}% of total expenses.`);
  }

  if (net >= 0) {
    insights.push(`Your current net cash flow is positive at ${formatCurrency(net)}. You are saving more than you are spending.`);
  } else {
    insights.push(`Your net cash flow is negative by ${formatCurrency(Math.abs(net))}. Consider reducing discretionary spending.`);
  }

  if (latestMonth.expense > previousMonth.expense) {
    const delta = latestMonth.expense - previousMonth.expense;
    insights.push(`Monthly spending increased by ${formatCurrency(delta)} compared to the previous month. Consider tightening non-essential spending.`);
  } else {
    const delta = previousMonth.expense - latestMonth.expense;
    insights.push(`Monthly spending is down by ${formatCurrency(delta)} versus the previous month. Your recent budget controls are working well.`);
  }

  if (breakdown.length >= 2) {
    const secondCategory = breakdown[1];
    insights.push(`You are heavily focused on ${topCategory.category} and ${secondCategory.category}. Keeping these two categories in check can improve savings.`);
  }

  return insights;
}

function buildDashboard() {
  const transactions = readTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));

  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0);

  const net = income - expenses;
  const expenseBreakdown = calculateExpenseBreakdown(transactions);
  const monthlyTrend = calculateMonthlyTrend(transactions);

  return {
    summary: {
      income,
      expenses,
      net,
      savingsRate: income ? ((net / income) * 100).toFixed(1) : 0,
      topCategory: expenseBreakdown[0] || { category: 'No data', total: 0 }
    },
    charts: {
      expenseBreakdown,
      monthlyTrend
    },
    insights: buildInsights(transactions),
    transactions
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Finance tracker running successfully.' });
});

app.get('/api/dashboard', (req, res) => {
  const dashboard = buildDashboard();
  res.json(dashboard);
});

app.get('/api/transactions', (req, res) => {
  const transactions = readTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const { type, category, amount, date, description } = req.body || {};

  if (!type || !category || !amount || !date || !description) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type must be income or expense.' });
  }

  const transactions = readTransactions();
  const newTransaction = {
    id: `${Date.now()}`,
    type,
    category,
    amount: Number(amount),
    date,
    description
  };

  transactions.push(newTransaction);
  writeTransactions(transactions);

  res.status(201).json({ message: 'Transaction added successfully.', transaction: newTransaction });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Finance tracker server is running on http://localhost:${PORT}`);
});
