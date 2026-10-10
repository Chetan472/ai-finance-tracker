const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'wealth-demo-secret';
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'storage.json');
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const seededUsers = [
  {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@wealth.app',
    passwordHash: bcrypt.hashSync('password123', 10)
  }
];

const seededTransactions = [
  { id: 't1', userId: 'demo-user', type: 'income', category: 'Salary', amount: 5200, date: '2026-10-01', description: 'Monthly salary', paymentMethod: 'Bank transfer' },
  { id: 't2', userId: 'demo-user', type: 'expense', category: 'Housing', amount: 1800, date: '2026-10-02', description: 'Apartment rent', paymentMethod: 'Card' },
  { id: 't3', userId: 'demo-user', type: 'expense', category: 'Food', amount: 540, date: '2026-10-05', description: 'Groceries', paymentMethod: 'Debit card' },
  { id: 't4', userId: 'demo-user', type: 'expense', category: 'Transport', amount: 240, date: '2026-10-06', description: 'Fuel and rides', paymentMethod: 'Wallet' },
  { id: 't5', userId: 'demo-user', type: 'income', category: 'Freelance', amount: 950, date: '2026-10-11', description: 'Website design project', paymentMethod: 'Bank transfer' },
  { id: 't6', userId: 'demo-user', type: 'expense', category: 'Entertainment', amount: 360, date: '2026-10-14', description: 'Streaming and events', paymentMethod: 'Card' },
  { id: 't7', userId: 'demo-user', type: 'expense', category: 'Health', amount: 120, date: '2026-10-16', description: 'Pharmacy', paymentMethod: 'Card' }
];

const seededBudgets = [
  { id: 'b1', userId: 'demo-user', category: 'Housing', limit: 2200, spent: 1800 },
  { id: 'b2', userId: 'demo-user', category: 'Food', limit: 900, spent: 540 },
  { id: 'b3', userId: 'demo-user', category: 'Transport', limit: 500, spent: 240 },
  { id: 'b4', userId: 'demo-user', category: 'Entertainment', limit: 600, spent: 360 }
];

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function defaultStorage() {
  return {
    users: seededUsers,
    transactions: seededTransactions,
    budgets: seededBudgets
  };
}

function readStorage() {
  ensureDataDir();
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStorage(), null, 2));
    return defaultStorage();
  }

  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = seededUsers;
    if (!parsed.transactions) parsed.transactions = seededTransactions;
    if (!parsed.budgets) parsed.budgets = seededBudgets;
    return parsed;
  } catch (error) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStorage(), null, 2));
    return defaultStorage();
  }
}

function writeStorage(data) {
  ensureDataDir();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token expired or invalid.' });
  }
}

function getCurrentUser(req) {
  const state = readStorage();
  return state.users.find((user) => user.id === req.user.id) || null;
}

function getUserTransactions(userId) {
  return readStorage().transactions.filter((tx) => tx.userId === userId);
}

function getUserBudgets(userId) {
  return readStorage().budgets.filter((budget) => budget.userId === userId);
}

function calculateSummary(transactions) {
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const expenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0';

  const byCategory = {};
  transactions.filter((tx) => tx.type === 'expense').forEach((tx) => {
    byCategory[tx.category] = (byCategory[tx.category] || 0) + Number(tx.amount || 0);
  });

  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyTrend = monthLabels.map((month, index) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - index));
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    const monthIncome = transactions.filter((tx) => {
      if (tx.type !== 'income') return false;
      const txDate = new Date(tx.date);
      return `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}` === key;
    }).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const monthExpense = transactions.filter((tx) => {
      if (tx.type !== 'expense') return false;
      const txDate = new Date(tx.date);
      return `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}` === key;
    }).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return { month, income: monthIncome, expense: monthExpense };
  });

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalBalance: balance,
    savingsRate: Number(savingsRate),
    categoryBreakdown,
    monthlyTrend,
    recentTransactions: [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  };
}

function buildFallbackInsights(transactions) {
  const totalIncome = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const totalExpense = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const balance = totalIncome - totalExpense;
  const byCategory = {};
  transactions.filter((tx) => tx.type === 'expense').forEach((tx) => {
    byCategory[tx.category] = (byCategory[tx.category] || 0) + Number(tx.amount || 0);
  });
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const insights = [];
  if (topCategory) {
    insights.push(`Your largest expense category is ${topCategory[0]} with ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(topCategory[1])}.`);
  }
  if (balance >= 0) {
    insights.push(`Your net cash flow is positive at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(balance)}. This is a healthy saving pattern.`);
  } else {
    insights.push(`Your spending exceeds income by ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(balance))}. Reduce discretionary spending to improve savings.`);
  }
  insights.push('Automate a fixed percentage of income into savings and set a weekly review for recurring subscriptions.');
  return insights;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Wealth API is running.' });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const state = readStorage();
  const exists = state.users.some((user) => user.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }

  const user = {
    id: `user-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10)
  };

  state.users.push(user);
  state.transactions.push(
    {
      id: `seed-${Date.now()}`,
      userId: user.id,
      type: 'income',
      category: 'Salary',
      amount: 4200,
      date: new Date().toISOString().slice(0, 10),
      description: 'Starter income',
      paymentMethod: 'Bank transfer'
    },
    {
      id: `seed-${Date.now() + 1}`,
      userId: user.id,
      type: 'expense',
      category: 'Housing',
      amount: 1500,
      date: new Date().toISOString().slice(0, 10),
      description: 'Sample rent',
      paymentMethod: 'Card'
    }
  );
  state.budgets.push(
    { id: `budget-${Date.now()}`, userId: user.id, category: 'Housing', limit: 1800, spent: 1500 },
    { id: `budget-${Date.now() + 1}`, userId: user.id, category: 'Food', limit: 700, spent: 360 }
  );

  writeStorage(state);
  const token = signToken(user);

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const state = readStorage();
  const user = state.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const transactions = getUserTransactions(user.id);
  const budgets = getUserBudgets(user.id);
  const summary = calculateSummary(transactions);

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    summary,
    budgets,
    transactions: [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  });
});

app.get('/api/transactions', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const tx = getUserTransactions(user.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.json(tx);
});

app.post('/api/transactions', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { type, category, amount, date, description, paymentMethod } = req.body || {};
  if (!type || !category || !amount || !date || !description) {
    return res.status(400).json({ message: 'Required transaction fields are missing.' });
  }

  const state = readStorage();
  const tx = {
    id: `tx-${Date.now()}`,
    userId: user.id,
    type,
    category,
    amount: Number(amount),
    date,
    description,
    paymentMethod: paymentMethod || 'Card'
  };
  state.transactions.push(tx);
  writeStorage(state);
  return res.status(201).json(tx);
});

app.put('/api/transactions/:id', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const state = readStorage();
  const txIndex = state.transactions.findIndex((tx) => tx.id === req.params.id && tx.userId === user.id);
  if (txIndex === -1) return res.status(404).json({ message: 'Transaction not found.' });

  state.transactions[txIndex] = { ...state.transactions[txIndex], ...req.body };
  writeStorage(state);
  return res.json(state.transactions[txIndex]);
});

app.delete('/api/transactions/:id', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const state = readStorage();
  const originalLength = state.transactions.length;
  state.transactions = state.transactions.filter((tx) => !(tx.id === req.params.id && tx.userId === user.id));
  if (state.transactions.length === originalLength) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }

  writeStorage(state);
  return res.json({ success: true });
});

app.get('/api/budgets', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  return res.json(getUserBudgets(user.id));
});

app.post('/api/budgets', authMiddleware, (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const { category, limit } = req.body || {};
  if (!category || !limit) {
    return res.status(400).json({ message: 'Category and limit are required.' });
  }

  const state = readStorage();
  const budget = {
    id: `budget-${Date.now()}`,
    userId: user.id,
    category,
    limit: Number(limit),
    spent: 0
  };
  state.budgets.push(budget);
  writeStorage(state);
  return res.status(201).json(budget);
});

app.post('/api/ai/insights', authMiddleware, async (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const transactions = getUserTransactions(user.id);
  const fallback = buildFallbackInsights(transactions);

  if (!process.env.GEMINI_API_KEY) {
    return res.json({ insights: fallback, mode: 'fallback' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a personal finance advisor. Analyze this user financial data and provide only 4 short actionable insights in bullet list format. Data: ${JSON.stringify(transactions.slice(0, 20))}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const insights = text.split('\n').filter(Boolean).slice(0, 4);
    return res.json({ insights: insights.length ? insights : fallback, mode: 'gemini' });
  } catch (error) {
    return res.json({ insights: fallback, mode: 'fallback' });
  }
});

app.post('/api/receipt/analyze', authMiddleware, upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Receipt image is required.' });
  }

  try {
    const { data } = await Tesseract.recognize(req.file.buffer, 'eng');
    const text = data.text || '';

    const merchantMatch = text.match(/(?:merchant|store|shop|restaurant|grocery)[\s:]*([A-Za-z0-9 &.'-]+)/i) ||
      text.match(/([A-Za-z0-9 &.'-]{3,30})\s*\n\s*\d{2}\/\d{2}\/\d{2}/);
    const totalMatch = text.match(/(?:total|amount|due|balance)[^\d]*(\d+\.\d{2}|\d+)/i) ||
      text.match(/(\d+\.\d{2}|\d+)\s*$/m);
    const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/);

    return res.json({
      text,
      extracted: {
        merchant: merchantMatch ? merchantMatch[1].trim() : 'Unknown merchant',
        total: totalMatch ? Number(totalMatch[1].replace(/[^0-9.]/g, '')) : 0,
        date: dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'OCR could not process the receipt image.', error: error.message });
  }
});

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Wealth API running on http://localhost:${PORT}`);
});
