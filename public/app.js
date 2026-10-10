const app = {
  formatCurrency: (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value || 0),

  renderSummary: (summary) => {
    document.getElementById('incomeTotal').textContent = app.formatCurrency(summary.income);
    document.getElementById('expenseTotal').textContent = app.formatCurrency(summary.expenses);
    document.getElementById('netBalance').textContent = app.formatCurrency(summary.net);
    document.getElementById('savingsRate').textContent = `${summary.savingsRate}%`;
    document.getElementById('topCategory').textContent = summary.topCategory.category;
  },

  renderInsights: (insights) => {
    const list = document.getElementById('insightsList');
    list.innerHTML = insights.map((item) => `<li>${item}</li>`).join('');
  },

  renderTransactions: (transactions) => {
    const tableBody = document.getElementById('transactionTableBody');

    if (!transactions.length) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #cbd5e1; padding: 24px;">No transactions yet. Add your first entry.</td></tr>';
      return;
    }

    tableBody.innerHTML = transactions
      .slice(0, 8)
      .map((transaction) => {
        const isIncome = transaction.type === 'income';
        return `
          <tr>
            <td><span class="badge ${isIncome ? 'income' : 'expense'}">${transaction.type}</span></td>
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td>${new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td class="${isIncome ? 'amount-positive' : 'amount-negative'}">${isIncome ? '+' : '-'}${app.formatCurrency(transaction.amount)}</td>
          </tr>
        `;
      })
      .join('');
  },

  renderExpenseChart: (expenseBreakdown) => {
    const labels = expenseBreakdown.map((item) => item.category);
    const data = expenseBreakdown.map((item) => item.total);
    const colors = ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#38bdf8', '#f472b6', '#4ade80'];

    if (window.expenseChart) {
      window.expenseChart.destroy();
    }

    const ctx = document.getElementById('expenseChart').getContext('2d');
    window.expenseChart = new Chart(ctx, {
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
              color: '#dbeafe',
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${app.formatCurrency(context.parsed)}`
            }
          }
        }
      }
    });
  },

  renderTrendChart: (monthlyTrend) => {
    const labels = monthlyTrend.map((item) => item.month);
    const incomeData = monthlyTrend.map((item) => item.income);
    const expenseData = monthlyTrend.map((item) => item.expense);

    if (window.trendChart) {
      window.trendChart.destroy();
    }

    const ctx = document.getElementById('trendChart').getContext('2d');
    window.trendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#34d399',
            borderRadius: 8
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: '#f87171',
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#dbeafe' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#dbeafe' },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: '#dbeafe',
              callback: (value) => app.formatCurrency(value)
            },
            grid: { color: 'rgba(148, 163, 184, 0.12)' }
          }
        }
      }
    });
  },

  fetchDashboard: async () => {
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
      throw new Error('Failed to load dashboard data.');
    }
    return response.json();
  },

  loadDashboard: async () => {
    try {
      const dashboard = await app.fetchDashboard();
      app.renderSummary(dashboard.summary);
      app.renderInsights(dashboard.insights);
      app.renderTransactions(dashboard.transactions);
      app.renderExpenseChart(dashboard.charts.expenseBreakdown);
      app.renderTrendChart(dashboard.charts.monthlyTrend);
    } catch (error) {
      console.error(error);
      document.getElementById('insightsList').innerHTML = '<li>Unable to load dashboard data.</li>';
    }
  },

  setupForm: () => {
    const form = document.getElementById('transactionForm');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const payload = {
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        amount: Number(document.getElementById('amount').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
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

      form.reset();
      document.getElementById('date').valueAsDate = new Date();
      await app.loadDashboard();
    });
  },

  init: () => {
    document.getElementById('date').valueAsDate = new Date();
    app.setupForm();
    app.loadDashboard();
  }
};

window.addEventListener('DOMContentLoaded', app.init);
