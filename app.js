'use strict';

const CATEGORY_COLORS = {
  income:        '#1D9E75',
  housing:       '#185FA5',
  food:          '#BA7517',
  transport:     '#534AB7',
  education:     '#0F6E56',
  entertainment: '#D4537E',
  health:        '#D85A30',
  other:         '#888780',
};

const CATEGORY_LABELS = {
  income:        'Income',
  housing:       'Housing',
  food:          'Food & Dining',
  transport:     'Transport',
  education:     'Education',
  entertainment: 'Entertainment',
  health:        'Health',
  other:         'Other',
};

let transactions = JSON.parse(localStorage.getItem('budget_transactions') || '[]');

function saveToStorage() {
  localStorage.setItem('budget_transactions', JSON.stringify(transactions));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function computeSummary(txns) {
  let income = 0, expenses = 0;
  txns.forEach(t => {
    if (t.category === 'income') income += t.amount;
    else expenses += t.amount;
  });
  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  return { income, expenses, balance, savingsRate };
}

function renderSummary() {
  const { income, expenses, balance, savingsRate } = computeSummary(transactions);
  document.getElementById('total-income').textContent = formatCurrency(income);
  document.getElementById('total-expenses').textContent = formatCurrency(expenses);
  const balEl = document.getElementById('balance');
  balEl.textContent = formatCurrency(balance);
  balEl.style.color = balance >= 0 ? 'var(--income)' : 'var(--expense)';
  document.getElementById('savings-rate').textContent = savingsRate + '%';
}

function renderTransactions() {
  const filterCat = document.getElementById('filter-category').value;
  const filtered = filterCat === 'all'
    ? transactions
    : transactions.filter(t => t.category === filterCat);

  const list = document.getElementById('transaction-list');

  if (filtered.length === 0) {
    list.innerHTML = '<p class="empty-state">No transactions yet. Add one above.</p>';
    return;
  }

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  list.innerHTML = sorted.map(t => {
    const isIncome = t.category === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const color = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.other;
    const label = CATEGORY_LABELS[t.category] || t.category;
    return `
      <div class="transaction-item" data-id="${t.id}">
        <div class="transaction-left">
          <div class="category-dot" style="background:${color}"></div>
          <div class="transaction-info">
            <div class="transaction-desc">${escapeHTML(t.description)}</div>
            <div class="transaction-meta">${label} &middot; ${formatDate(t.date)}</div>
          </div>
        </div>
        <div class="transaction-right">
          <span class="transaction-amount ${amountClass}">${sign}${formatCurrency(t.amount)}</span>
          <button class="delete-btn" data-id="${t.id}" title="Delete">&times;</button>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
  });
}

function renderChart() {
  const canvas = document.getElementById('category-chart');
  const ctx = canvas.getContext('2d');
  const legend = document.getElementById('chart-legend');

  const expenseTotals = {};
  transactions.forEach(t => {
    if (t.category !== 'income') {
      expenseTotals[t.category] = (expenseTotals[t.category] || 0) + t.amount;
    }
  });

  const categories = Object.keys(expenseTotals);
  const values = categories.map(c => expenseTotals[c]);
  const total = values.reduce((a, b) => a + b, 0);
  const colors = categories.map(c => CATEGORY_COLORS[c] || CATEGORY_COLORS.other);

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth || 300;
  const h = 220;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  if (total === 0) {
    ctx.fillStyle = '#aaa';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No expense data yet', w / 2, h / 2);
    legend.innerHTML = '';
    return;
  }

  const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 20;
  let startAngle = -Math.PI / 2;

  values.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '500 13px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Expenses', cx, cy - 6);
  ctx.font = '600 16px -apple-system, sans-serif';
  ctx.fillText(formatCurrency(total), cx, cy + 14);

  legend.innerHTML = categories.map((c, i) => {
    const pct = Math.round((values[i] / total) * 100);
    return `<div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]}"></div>
      ${CATEGORY_LABELS[c] || c} (${pct}%)
    </div>`;
  }).join('');
}

function render() {
  renderSummary();
  renderTransactions();
  renderChart();
}

function addTransaction() {
  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (!description) { alert('Please enter a description.'); return; }
  if (!amount || amount <= 0) { alert('Please enter a valid amount.'); return; }
  if (!date) { alert('Please select a date.'); return; }

  const transaction = {
    id: Date.now().toString(),
    description,
    amount,
    category,
    date,
  };

  transactions.unshift(transaction);
  saveToStorage();
  render();

  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('date').value = '';
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  render();
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function seedSampleData() {
  if (transactions.length > 0) return;
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

  transactions = [
    { id: '1', description: 'Monthly salary', amount: 2500, category: 'income', date: daysAgo(0) },
    { id: '2', description: 'Rent', amount: 850, category: 'housing', date: daysAgo(1) },
    { id: '3', description: 'Grocery run', amount: 62.40, category: 'food', date: daysAgo(2) },
    { id: '4', description: 'Bus pass', amount: 30, category: 'transport', date: daysAgo(3) },
    { id: '5', description: 'Textbooks', amount: 120, category: 'education', date: daysAgo(5) },
    { id: '6', description: 'Netflix', amount: 15.99, category: 'entertainment', date: daysAgo(6) },
    { id: '7', description: 'Freelance project', amount: 400, category: 'income', date: daysAgo(7) },
    { id: '8', description: 'Dinner out', amount: 38, category: 'food', date: daysAgo(8) },
  ];
  saveToStorage();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  document.getElementById('add-btn').addEventListener('click', addTransaction);
  document.getElementById('filter-category').addEventListener('change', renderTransactions);
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Clear all transactions?')) {
      transactions = [];
      saveToStorage();
      render();
    }
  });

  document.getElementById('description').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTransaction();
  });

  seedSampleData();
  render();

  window.addEventListener('resize', renderChart);
});
