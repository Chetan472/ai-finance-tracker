* {
  box-sizing: border-box;
}

:root {
  --bg: #07111f;
  --bg-panel: rgba(15, 23, 42, 0.9);
  --bg-soft: rgba(17, 24, 39, 0.8);
  --card: rgba(15, 23, 42, 0.7);
  --border: rgba(148, 163, 184, 0.16);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --primary: #60a5fa;
  --primary-strong: #7c3aed;
  --green: #34d399;
  --red: #f87171;
  --purple: #a78bfa;
  --yellow: #fbbf24;
  --shadow: 0 18px 45px rgba(0, 0, 0, 0.2);
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 26%),
    radial-gradient(circle at bottom right, rgba(96, 165, 250, 0.14), transparent 30%),
    var(--bg);
  color: var(--text);
  font-family: Inter, 'Segoe UI', sans-serif;
}

button, input, select {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  padding: 28px 16px;
  background: rgba(15, 23, 42, 0.72);
  border-right: 1px solid var(--border);
  backdrop-filter: blur(14px);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 18px;
  margin-bottom: 22px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  font-weight: 800;
  color: white;
  box-shadow: var(--shadow);
}

.logo-area span {
  display: block;
  font-weight: 700;
}

.logo-area small {
  color: var(--muted);
}

.nav-menu {
  display: grid;
  gap: 8px;
}

.nav-item {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: 0.2s ease;
}

.nav-item.active {
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.06);
}

.content-shell {
  flex: 1;
  padding: 24px 26px 40px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ghost-button,
.primary-btn,
.tab,
.table-button {
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 600;
  transition: 0.2s ease;
}

.ghost-button {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
  border: 1px solid var(--border);
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  box-shadow: var(--shadow);
}

.small-btn {
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ghost-button:hover,
.primary-btn:hover,
.tab:hover,
.table-button:hover {
  transform: translateY(-1px);
}

.profile-badge {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(124, 58, 237, 0.3));
  border: 1px solid rgba(144, 202, 249, 0.26);
  font-weight: 700;
}

.page-content {
  display: grid;
  gap: 22px;
}

.grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 18px;
}

.stat-card,
.panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.stat-card {
  padding: 18px 20px;
}

.stat-card.primary { border-top: 3px solid var(--primary); }
.stat-card.danger { border-top: 3px solid var(--red); }
.stat-card.success { border-top: 3px solid var(--green); }
.stat-card.purple { border-top: 3px solid var(--purple); }

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.stat-card h3 {
  margin: 16px 0 8px;
  font-size: clamp(1.8rem, 2vw, 2.4rem);
  letter-spacing: -0.04em;
}

.stat-card small {
  color: var(--muted);
}

.charts-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.large-panel {
  padding: 18px 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.eyebrow-small {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.chip.success { background: rgba(52, 211, 153, 0.12); color: var(--green); }
.chip.primary { background: rgba(96, 165, 250, 0.12); color: var(--primary); }
.chip.neutral { background: rgba(148, 163, 184, 0.12); color: var(--muted); }

.chart-box {
  height: 280px;
}

.insight-list {
  display: grid;
  gap: 12px;
}

.insight-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(96,165,250,0.08);
  border: 1px solid rgba(96,165,250,0.12);
}

.insight-card p {
  margin: 0;
  line-height: 1.6;
  color: #dbeafe;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

th {
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.badge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  text-transform: capitalize;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge.income { background: rgba(52, 211, 153, 0.12); color: var(--green); }
.badge.expense { background: rgba(248, 113, 113, 0.12); color: var(--red); }

.amount-positive { color: var(--green); font-weight: 700; }
.amount-negative { color: var(--red); font-weight: 700; }

.table-button {
  background: rgba(248, 113, 113, 0.12);
  color: var(--red);
}

.transaction-form,
.budget-form,
.auth-form,
.receipt-form {
  display: grid;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  color: var(--muted);
}

input, select {
  width: 100%;
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.82);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
}

input:focus, select:focus {
  outline: none;
  border-color: rgba(96,165,250,0.9);
  box-shadow: 0 0 0 3px rgba(96,165,250,0.15);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--muted);
}

.search-box input {
  background: transparent;
  border: none;
  padding: 0;
  width: 140px;
}

.budget-list {
  display: grid;
  gap: 16px;
}

.budget-item {
  display: grid;
  gap: 10px;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.95rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #60a5fa, #34d399);
}

.auth-shell {
  min-height: 80vh;
  display: grid;
  place-items: center;
}

.auth-card {
  width: min(100%, 500px);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.auth-header h2 {
  margin: 4px 0 0;
  font-size: 2rem;
}

.eyebrow-auth {
  margin: 0;
  color: var(--muted);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.switch-row {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  gap: 8px;
  background: rgba(148, 163, 184, 0.06);
  padding: 6px;
  border-radius: 12px;
  margin-bottom: 18px;
}

.tab {
  background: transparent;
  color: var(--muted);
}

.tab.selected {
  background: rgba(96, 165, 250, 0.12);
  color: white;
}

.demo-box {
  margin-top: 20px;
  display: grid;
  gap: 6px;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96,165,250,0.12);
  border-radius: 16px;
  padding: 14px 16px;
  color: #dbeafe;
}

.auth-submit {
  width: 100%;
}

.file-picker {
  display: block;
  padding: 18px 16px;
  border: 1px dashed rgba(148, 163, 184, 0.26);
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.04);
}

.file-picker input {
  display: none;
}

.receipt-result {
  margin-top: 18px;
  display: grid;
  gap: 16px;
}

.receipt-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid var(--border);
}

.receipt-result pre {
  margin: 0;
  white-space: pre-wrap;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  color: #dbeafe;
}

.profile-box {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.profile-box .avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  font-weight: 800;
}

.profile-box p {
  margin: 6px 0 0;
  color: var(--muted);
}

.danger-btn {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.empty-state {
  color: var(--muted);
  margin: 0;
}

@media (max-width: 980px) {
  .app-shell { flex-direction: column; }
  .sidebar { width: 100%; }
  .nav-menu { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .charts-grid, .bottom-grid, .grid-two { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .content-shell { padding: 18px 16px 28px; }
  .stats-grid, .field-row { grid-template-columns: 1fr; }
  .nav-menu { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .topbar { align-items: flex-start; flex-direction: column; }
  .topbar-actions { width: 100%; justify-content: space-between; }
}
