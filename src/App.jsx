import React, { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, Target,
  HandCoins, LayoutDashboard, ArrowUpRight, ArrowDownRight, X,
} from "lucide-react";

/* ---------- design tokens ---------- */
const COLORS = {
  paper: "#FAF7F0",
  paperLine: "#E4DDCB",
  paperRaised: "#FFFFFF",
  ink: "#201C16",
  inkSoft: "#8A8071",
  income: "#3A6B54",
  expense: "#B54B32",
  gold: "#C08829",
  incomeSoft: "#E7EFE9",
  expenseSoft: "#F5E6E0",
  goldSoft: "#F3E7CF",
};

const CATEGORY_COLORS = ["#B54B32", "#3A6B54", "#C08829", "#5B6E8C", "#8A5A7A", "#6B7A4F", "#A0522D", "#4A6670"];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const today = () => new Date().toISOString().slice(0, 10);
const monthLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", { month: "short" });
};
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- seed data ---------- */
const seedIncome = [
  { id: uid(), source: "Salary", amount: 68000, date: today(), recurring: true },
  { id: uid(), source: "Freelance", amount: 9000, date: today(), recurring: false },
];
const seedExpenses = [
  { id: uid(), category: "Rent", amount: 18000, date: today(), note: "Monthly rent" },
  { id: uid(), category: "Food", amount: 6200, date: today(), note: "Groceries & dining" },
  { id: uid(), category: "Travel", amount: 2400, date: today(), note: "Cab + fuel" },
  { id: uid(), category: "Bills", amount: 3100, date: today(), note: "Electricity, internet" },
];
const seedDebts = [
  { id: uid(), person: "Rahul", type: "owe", amount: 4000, due: today(), status: "pending" },
  { id: uid(), person: "Priya", type: "owed", amount: 2500, due: today(), status: "pending" },
];
const seedGoals = [
  { id: uid(), name: "Emergency Fund", target: 100000, saved: 32000 },
  { id: uid(), name: "New Laptop", target: 60000, saved: 21000 },
];

const CATEGORIES = ["Food", "Travel", "Bills", "Rent", "Shopping", "Health", "Other"];

/* ---------- reusable bits ---------- */
function StampBalance({ value }) {
  const positive = value >= 0;
  return (
    <div className="stamp" style={{ borderColor: positive ? COLORS.income : COLORS.expense }}>
      <span className="stamp-label">Balance</span>
      <span className="stamp-value" style={{ color: positive ? COLORS.income : COLORS.expense }}>
        {fmt(value)}
      </span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const toneColor = tone === "income" ? COLORS.income : tone === "expense" ? COLORS.expense : COLORS.gold;
  const toneSoft = tone === "income" ? COLORS.incomeSoft : tone === "expense" ? COLORS.expenseSoft : COLORS.goldSoft;
  return (
    <div className="ledger-card stat-card">
      <div className="stat-icon" style={{ background: toneSoft, color: toneColor }}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{fmt(value)}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function EmptyRow({ text }) {
  return <div className="empty-row">{text}</div>;
}

/* ---------- tab: dashboard ---------- */
function Dashboard({ totalIncome, totalExpense, netOwed, balance, expenses, incomes }) {
  const catData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => (map[e.category] = (map[e.category] || 0) + Number(e.amount)));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const trendData = useMemo(() => {
    const map = {};
    [...incomes.map((i) => ({ ...i, kind: "income" })), ...expenses.map((e) => ({ ...e, kind: "expense" }))].forEach(
      (r) => {
        const m = monthLabel(r.date);
        map[m] = map[m] || { month: m, income: 0, expense: 0 };
        map[m][r.kind] += Number(r.amount);
      }
    );
    return Object.values(map);
  }, [incomes, expenses]);

  return (
    <div className="stack-lg">
      <div className="dash-top">
        <StampBalance value={balance} />
        <div className="stat-grid">
          <StatCard label="Income (total)" value={totalIncome} icon={TrendingUp} tone="income" />
          <StatCard label="Expenses (total)" value={totalExpense} icon={TrendingDown} tone="expense" />
          <StatCard label="Net owed to you" value={netOwed} icon={HandCoins} tone="gold" />
        </div>
      </div>

      <div className="grid-2">
        <div className="ledger-card">
          <h3 className="card-title">Spending by category</h3>
          {catData.length === 0 ? (
            <EmptyRow text="No expenses logged yet — add one in the Expenses tab." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {catData.map((entry, i) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: "var(--font-body)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="ledger-card">
          <h3 className="card-title">Income vs expenses</h3>
          {trendData.length === 0 ? (
            <EmptyRow text="Add income and expenses to see the trend." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.paperLine} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.paperLine }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.paperLine }} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: "var(--font-body)", fontSize: 12 }} />
                <Bar dataKey="income" fill={COLORS.income} radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill={COLORS.expense} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- tab: income ---------- */
function IncomeTab({ incomes, addIncome, removeIncome }) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [recurring, setRecurring] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!source || !amount) return;
    addIncome({ id: uid(), source, amount: Number(amount), date, recurring });
    setSource("");
    setAmount("");
    setRecurring(false);
  };

  return (
    <div className="stack-lg">
      <form className="ledger-card form-row" onSubmit={submit}>
        <Field label="Source">
          <input className="input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Salary, freelance…" />
        </Field>
        <Field label="Amount (₹)">
          <input className="input mono" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Date">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <label className="checkbox-row">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Recurring monthly
        </label>
        <button className="btn btn-income" type="submit">
          <Plus size={16} /> Add income
        </button>
      </form>

      <div className="ledger-card">
        <h3 className="card-title">Income entries</h3>
        {incomes.length === 0 ? (
          <EmptyRow text="No income logged yet." />
        ) : (
          <ul className="ledger-list">
            {incomes.map((i) => (
              <li key={i.id} className="ledger-row">
                <div className="row-icon" style={{ background: COLORS.incomeSoft, color: COLORS.income }}>
                  <ArrowUpRight size={14} />
                </div>
                <div className="row-main">
                  <span className="row-title">{i.source}{i.recurring && <span className="tag">monthly</span>}</span>
                  <span className="row-sub">{i.date}</span>
                </div>
                <span className="row-amount mono" style={{ color: COLORS.income }}>+{fmt(i.amount)}</span>
                <button className="icon-btn" onClick={() => removeIncome(i.id)} aria-label="Delete income entry">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- tab: expenses ---------- */
function ExpensesTab({ expenses, addExpense, removeExpense }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("All");

  const submit = (e) => {
    e.preventDefault();
    if (!amount) return;
    addExpense({ id: uid(), category, amount: Number(amount), date, note });
    setAmount("");
    setNote("");
  };

  const filtered = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);

  return (
    <div className="stack-lg">
      <form className="ledger-card form-row" onSubmit={submit}>
        <Field label="Category">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount (₹)">
          <input className="input mono" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Date">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Note (optional)">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was this for?" />
        </Field>
        <button className="btn btn-expense" type="submit">
          <Plus size={16} /> Add expense
        </button>
      </form>

      <div className="ledger-card">
        <div className="card-title-row">
          <h3 className="card-title">Expense entries</h3>
          <select className="input input-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyRow text="No expenses match this filter." />
        ) : (
          <ul className="ledger-list">
            {filtered.map((ex) => (
              <li key={ex.id} className="ledger-row">
                <div className="row-icon" style={{ background: COLORS.expenseSoft, color: COLORS.expense }}>
                  <ArrowDownRight size={14} />
                </div>
                <div className="row-main">
                  <span className="row-title">{ex.category}{ex.note && <span className="row-note"> — {ex.note}</span>}</span>
                  <span className="row-sub">{ex.date}</span>
                </div>
                <span className="row-amount mono" style={{ color: COLORS.expense }}>-{fmt(ex.amount)}</span>
                <button className="icon-btn" onClick={() => removeExpense(ex.id)} aria-label="Delete expense entry">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- tab: debts ---------- */
function DebtsTab({ debts, addDebt, removeDebt, toggleDebt }) {
  const [person, setPerson] = useState("");
  const [type, setType] = useState("owe");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(today());

  const submit = (e) => {
    e.preventDefault();
    if (!person || !amount) return;
    addDebt({ id: uid(), person, type, amount: Number(amount), due, status: "pending" });
    setPerson("");
    setAmount("");
  };

  return (
    <div className="stack-lg">
      <form className="ledger-card form-row" onSubmit={submit}>
        <Field label="Person">
          <input className="input" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Name" />
        </Field>
        <Field label="Direction">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="owe">I owe them</option>
            <option value="owed">They owe me</option>
          </select>
        </Field>
        <Field label="Amount (₹)">
          <input className="input mono" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Due date">
          <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <button className="btn btn-gold" type="submit">
          <Plus size={16} /> Add commitment
        </button>
      </form>

      <div className="ledger-card">
        <h3 className="card-title">Commitments</h3>
        {debts.length === 0 ? (
          <EmptyRow text="No debts or commitments tracked yet." />
        ) : (
          <ul className="ledger-list">
            {debts.map((d) => (
              <li key={d.id} className={`ledger-row ${d.status === "paid" ? "row-settled" : ""}`}>
                <div className="row-icon" style={{ background: COLORS.goldSoft, color: COLORS.gold }}>
                  <HandCoins size={14} />
                </div>
                <div className="row-main">
                  <span className="row-title">
                    {d.person}
                    <span className="tag">{d.type === "owe" ? "you owe" : "owes you"}</span>
                  </span>
                  <span className="row-sub">Due {d.due} · {d.status}</span>
                </div>
                <span className="row-amount mono" style={{ color: d.type === "owe" ? COLORS.expense : COLORS.income }}>
                  {d.type === "owe" ? "-" : "+"}{fmt(d.amount)}
                </span>
                <button className="text-btn" onClick={() => toggleDebt(d.id)}>
                  {d.status === "paid" ? "Reopen" : "Settle"}
                </button>
                <button className="icon-btn" onClick={() => removeDebt(d.id)} aria-label="Delete commitment">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- tab: goals ---------- */
function GoalsTab({ goals, addGoal, removeGoal, contribute }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [contribAmounts, setContribAmounts] = useState({});

  const submit = (e) => {
    e.preventDefault();
    if (!name || !target) return;
    addGoal({ id: uid(), name, target: Number(target), saved: 0 });
    setName("");
    setTarget("");
  };

  return (
    <div className="stack-lg">
      <form className="ledger-card form-row" onSubmit={submit}>
        <Field label="Goal name">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund, trip…" />
        </Field>
        <Field label="Target (₹)">
          <input className="input mono" type="number" min="0" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" />
        </Field>
        <button className="btn btn-gold" type="submit">
          <Plus size={16} /> Add goal
        </button>
      </form>

      <div className="goal-grid">
        {goals.length === 0 ? (
          <div className="ledger-card"><EmptyRow text="No savings goals yet." /></div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
            return (
              <div key={g.id} className="ledger-card goal-card">
                <div className="goal-head">
                  <span className="row-title">{g.name}</span>
                  <button className="icon-btn" onClick={() => removeGoal(g.id)} aria-label="Delete goal">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="goal-bar-track">
                  <div className="goal-bar-fill" style={{ width: `${pct}%`, background: COLORS.gold }} />
                </div>
                <div className="goal-meta">
                  <span className="mono">{fmt(g.saved)} / {fmt(g.target)}</span>
                  <span className="tag">{pct}%</span>
                </div>
                <div className="goal-contribute">
                  <input
                    className="input input-sm mono"
                    type="number"
                    min="0"
                    placeholder="Add ₹"
                    value={contribAmounts[g.id] || ""}
                    onChange={(e) => setContribAmounts({ ...contribAmounts, [g.id]: e.target.value })}
                  />
                  <button
                    className="btn btn-gold btn-sm"
                    onClick={() => {
                      const v = Number(contribAmounts[g.id]);
                      if (v > 0) {
                        contribute(g.id, v);
                        setContribAmounts({ ...contribAmounts, [g.id]: "" });
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------- app shell ---------- */
const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "income", label: "Income", icon: TrendingUp },
  { key: "expenses", label: "Expenses", icon: TrendingDown },
  { key: "debts", label: "Debts", icon: HandCoins },
  { key: "goals", label: "Goals", icon: Target },
];

export default function FinanceTracker() {
  const [tab, setTab] = useState("dashboard");
  const [incomes, setIncomes] = useState(seedIncome);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [debts, setDebts] = useState(seedDebts);
  const [goals, setGoals] = useState(seedGoals);

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const owedToMe = debts.filter((d) => d.type === "owed" && d.status !== "paid").reduce((s, d) => s + Number(d.amount), 0);
  const iOwe = debts.filter((d) => d.type === "owe" && d.status !== "paid").reduce((s, d) => s + Number(d.amount), 0);
  const netOwed = owedToMe - iOwe;
  const balance = totalIncome - totalExpense - iOwe;

  return (
    <div className="app-root">
      <style>{`
        :root {
          --font-display: Georgia, 'Times New Roman', serif;
          --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --font-mono: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
        }
        .app-root {
          background: ${COLORS.paper};
          background-image: repeating-linear-gradient(${COLORS.paperLine} 0 1px, transparent 1px 32px);
          color: ${COLORS.ink};
          font-family: var(--font-body);
          min-height: 100%;
          padding: 20px 16px 48px;
          box-sizing: border-box;
        }
        * { box-sizing: border-box; }
        .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }

        .header {
          max-width: 980px;
          margin: 0 auto 18px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .header h1 {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .header .sub {
          color: ${COLORS.inkSoft};
          font-size: 13px;
        }

        .tabs {
          max-width: 980px;
          margin: 0 auto 18px;
          display: flex;
          gap: 4px;
          border-bottom: 1px solid ${COLORS.paperLine};
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: ${COLORS.inkSoft};
          cursor: pointer;
          border-radius: 6px 6px 0 0;
          transition: color .15s, background .15s;
        }
        .tab-btn:hover { background: ${COLORS.paperRaised}; color: ${COLORS.ink}; }
        .tab-btn.active {
          color: ${COLORS.ink};
          border-bottom-color: ${COLORS.gold};
          background: ${COLORS.paperRaised};
        }

        .content { max-width: 980px; margin: 0 auto; }
        .stack-lg { display: flex; flex-direction: column; gap: 16px; }

        .ledger-card {
          background: ${COLORS.paperRaised};
          border: 1px solid ${COLORS.paperLine};
          border-radius: 10px;
          padding: 18px;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 12px;
        }
        .card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }

        .dash-top { display: flex; gap: 16px; flex-wrap: wrap; align-items: stretch; }
        .stamp {
          flex: 0 0 auto;
          border: 2px dashed;
          border-radius: 999px;
          width: 168px;
          height: 168px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(-4deg);
          background: ${COLORS.paperRaised};
        }
        .stamp-label {
          font-family: var(--font-body);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${COLORS.inkSoft};
          margin-bottom: 4px;
        }
        .stamp-value {
          font-family: var(--font-mono);
          font-variant-numeric: tabular-nums;
          font-size: 22px;
          font-weight: 700;
        }
        .stat-grid { flex: 1 1 320px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .stat-card { display: flex; align-items: center; gap: 10px; padding: 14px; }
        .stat-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-label { font-size: 11px; color: ${COLORS.inkSoft}; margin-bottom: 2px; }
        .stat-value { font-family: var(--font-mono); font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } .dash-top { flex-direction: column; align-items: center; } }

        .form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
        .field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; flex: 1 1 130px; }
        .field-label { color: ${COLORS.inkSoft}; font-weight: 600; }
        .input {
          border: 1px solid ${COLORS.paperLine};
          background: ${COLORS.paper};
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          font-family: var(--font-body);
          color: ${COLORS.ink};
        }
        .input:focus { outline: 2px solid ${COLORS.gold}; outline-offset: 1px; }
        .input-sm { padding: 6px 8px; font-size: 12px; flex: 0 0 110px; }
        .checkbox-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${COLORS.inkSoft}; padding-bottom: 8px; }

        .btn {
          display: flex; align-items: center; gap: 6px;
          border: none; border-radius: 6px;
          padding: 9px 14px;
          font-size: 13px; font-weight: 700;
          color: #fff; cursor: pointer;
          font-family: var(--font-body);
          white-space: nowrap;
        }
        .btn:hover { filter: brightness(1.08); }
        .btn-income { background: ${COLORS.income}; }
        .btn-expense { background: ${COLORS.expense}; }
        .btn-gold { background: ${COLORS.gold}; }
        .btn-sm { padding: 6px 10px; font-size: 12px; }

        .ledger-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .ledger-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 0;
          border-top: 1px solid ${COLORS.paperLine};
        }
        .ledger-row:first-child { border-top: none; }
        .row-settled { opacity: 0.5; }
        .row-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .row-main { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .row-title { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .row-note { font-weight: 400; color: ${COLORS.inkSoft}; }
        .row-sub { font-size: 11px; color: ${COLORS.inkSoft}; }
        .row-amount { font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .tag {
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
          background: ${COLORS.goldSoft}; color: ${COLORS.gold};
          padding: 2px 6px; border-radius: 999px;
        }
        .icon-btn, .text-btn {
          background: none; border: none; cursor: pointer; color: ${COLORS.inkSoft};
          padding: 4px; border-radius: 5px; flex-shrink: 0; font-family: var(--font-body);
        }
        .icon-btn:hover { color: ${COLORS.expense}; background: ${COLORS.expenseSoft}; }
        .text-btn { font-size: 11px; font-weight: 700; color: ${COLORS.gold}; }
        .text-btn:hover { text-decoration: underline; }

        .empty-row { color: ${COLORS.inkSoft}; font-size: 13px; padding: 12px 0; text-align: center; }

        .goal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
        .goal-card { display: flex; flex-direction: column; gap: 8px; }
        .goal-head { display: flex; justify-content: space-between; align-items: center; }
        .goal-bar-track { height: 8px; border-radius: 999px; background: ${COLORS.paper}; border: 1px solid ${COLORS.paperLine}; overflow: hidden; }
        .goal-bar-fill { height: 100%; border-radius: 999px; transition: width .3s; }
        .goal-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .goal-contribute { display: flex; gap: 6px; margin-top: 2px; }
      `}</style>

      <div className="header">
        <div>
          <h1>Ledger</h1>
          <div className="sub">A clear, running record of what comes in and what goes out.</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="content">
        {tab === "dashboard" && (
          <Dashboard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            netOwed={netOwed}
            balance={balance}
            expenses={expenses}
            incomes={incomes}
          />
        )}
        {tab === "income" && (
          <IncomeTab
            incomes={incomes}
            addIncome={(rec) => setIncomes([rec, ...incomes])}
            removeIncome={(id) => setIncomes(incomes.filter((i) => i.id !== id))}
          />
        )}
        {tab === "expenses" && (
          <ExpensesTab
            expenses={expenses}
            addExpense={(rec) => setExpenses([rec, ...expenses])}
            removeExpense={(id) => setExpenses(expenses.filter((e) => e.id !== id))}
          />
        )}
        {tab === "debts" && (
          <DebtsTab
            debts={debts}
            addDebt={(rec) => setDebts([rec, ...debts])}
            removeDebt={(id) => setDebts(debts.filter((d) => d.id !== id))}
            toggleDebt={(id) =>
              setDebts(debts.map((d) => (d.id === id ? { ...d, status: d.status === "paid" ? "pending" : "paid" } : d)))
            }
          />
        )}
        {tab === "goals" && (
          <GoalsTab
            goals={goals}
            addGoal={(rec) => setGoals([rec, ...goals])}
            removeGoal={(id) => setGoals(goals.filter((g) => g.id !== id))}
            contribute={(id, amt) =>
              setGoals(goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amt } : g)))
            }
          />
        )}
      </div>
    </div>
  );
}
