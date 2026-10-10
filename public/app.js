const transactionForm = document.getElementById('transactionForm');
const transactionTableBody = document.getElementById('transactionTableBody');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

let expenseChart;
let trendChart;

async function fetchDashboard() {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('Failed to load dashboard data.');
  }

  return response.json();
}

function renderSummary(summary) {
  document.getElementById('incomeTotal').textContent = formatCurrency(summary.income);
  document.getElementById('expenseTotal').textContent = formatCurrency(summary.expenses);
  document.getElementById('netBalance').textContent = formatCurrency(summary.net);
  document.getElementById('savingsRate').textContent = `${summary.savingsRate}%`;
  document.getElementById('topCategory').textContent = summary.topCategory.category;
}

function renderInsights(insights) {
  const list = document.getElementById('insightsList');
  list.innerHTML = insights.map((item) => `<li>${item}</li>`).join('');
}

function renderTransactions(transactions) {
  if (!transactions.length) {
    transactionTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color: var(--muted); padding: 22px;">No transactions yet. Add your first entry.</td>
      </tr>
    `;
    return;
  }

  transactionTableBody.innerHTML = transactions
    .slice(0, 8)
    .map((transaction) => {
      const isIncome = transaction.type === 'income';
      return `
        <tr>
          <td><span class="badge ${isIncome ? 'income' : 'expense'}">${transaction.type}</span></td>
          <td>${transaction.category}</td>
          <td>${transaction.description}</td>
          <td>${new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}</td>
          <td class="${isIncome ? 'amount-positive' : 'amount-negative'}">
            ${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
          </td>
        </tr>
      `;
    })
    .join('');
}

function renderExpenseChart(expenseBreakdown) {
  const labels = expenseBreakdown.map((item) => item.category);
  const data = expenseBreakdown.map((item) => item.total);

  const colors = ['#7c9cff', '#2dd4bf', '#fb7185', '#fbbf24', '#a78bfa', '#38bdf8', '#f472b6', '#4ade80'];

  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = document.getElementById('expenseChart').getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#cbd5e1',
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
          }
        }
      }
    }
  });
}

function renderTrendChart(monthlyTrend) {
  const labels = monthlyTrend.map((item) => item.month);
  const incomeData = monthlyTrend.map((item) => item.income);
  const expenseData = monthlyTrend.map((item) => item.expense);

  if (trendChart) {
    trendChart.destroy();
  }

  const ctx = document.getElementById('trendChart').getContext('2d');
  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#2dd4bf',
          borderRadius: 8
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#fb7185',
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#cbd5e1'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: '#cbd5e1',
            callback: (value) => formatCurrency(value)
          },
          grid: { color: 'rgba(148, 163, 184, 0.12)' }
        }
      }
    }
  });
}

async function loadDashboard() {
  try {
    const dashboard = await fetchDashboard();
    renderSummary(dashboard.summary);
    renderInsights(dashboard.insights);
    renderTransactions(dashboard.transactions);
    renderExpenseChart(dashboard.charts.expenseBreakdown);
    renderTrendChart(dashboard.charts.monthlyTrend);
  } catch (error) {
    console.error(error);
    document.getElementById('insightsList').innerHTML = '<li>Unable to load dashboard data.</li>';
  }
}

transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(transactionForm);
  const payload = {
    type: formData.get('type'),
    category: formData.get('category'),
    amount: Number(formData.get('amount')),
    date: formData.get('date'),
    description: formData.get('description')
  };

  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.message || 'Unable to save transaction.');
    return;
  }

  transactionForm.reset();
  document.getElementById('date').valueAsDate = new Date();
  await loadDashboard();
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').valueAsDate = new Date();
  loadDashboard();
});
