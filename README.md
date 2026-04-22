# Budget Tracker

A clean, browser-based personal finance tracker built with vanilla JavaScript, HTML, and CSS. No frameworks, no dependencies — just open `index.html` and go.

## Features

- Add income and expense transactions with descriptions, amounts, categories, and dates
- Live summary cards showing total income, total expenses, current balance, and savings rate
- Donut chart showing spending breakdown by category
- Filter transactions by category
- Data persists in `localStorage` — your entries survive page refreshes
- Fully responsive — works on mobile and desktop
- Sample data loaded on first run so you can see it in action immediately

## Categories

| Category | Type |
|---|---|
| Income | Income |
| Housing | Expense |
| Food & Dining | Expense |
| Transport | Expense |
| Education | Expense |
| Entertainment | Expense |
| Health | Expense |
| Other | Expense |

## How to run

No install needed.

```bash
git clone https://github.com/YOUR_USERNAME/budget-tracker.git
cd budget-tracker
open index.html   # macOS
# or just double-click index.html in your file explorer
```

## Project structure

```
budget-tracker/
├── index.html   # App shell and markup
├── style.css    # All styling
├── app.js       # All logic — transactions, chart, localStorage
└── README.md
```

## Tech used

- **HTML5** — semantic markup
- **CSS3** — CSS variables, grid, flexbox, responsive design
- **Vanilla JavaScript (ES6+)** — no libraries or frameworks
- **Canvas API** — custom donut chart drawn without Chart.js
- **localStorage API** — client-side data persistence
- **Intl.NumberFormat** — proper currency formatting

## What I learned building this

- How to structure a single-page app without a framework
- Working with the Canvas 2D API to draw custom charts
- Managing application state with `localStorage`
- Handling user input validation and error messages
- Building responsive layouts with CSS Grid and Flexbox

## Future improvements

- [ ] Monthly view / date range filter
- [ ] Budget goals per category with progress bars
- [ ] CSV export of transactions
- [ ] Dark mode toggle
- [ ] Recurring transaction support

## Author

Built by [Your Name] — Informatics & Managerial Economics, UMass Amherst
