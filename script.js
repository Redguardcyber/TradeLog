
const SHEET_ID = '1j7FXyH3R93cEGgnsq0pwmXTkBGaBLtcI772FKT1E_go';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(data => {
    const json = JSON.parse(data.substr(47).slice(0, -2));
    const rows = json.table.rows.map(r => ({
      date: r.c[0].v,
      instrument: r.c[1].v,
      profitLoss: parseFloat(r.c[2].v),
      strategy: r.c[3].v
    }));

    renderTrades(rows);
    renderMonthlySummary(rows);
  });

function renderTrades(trades) {
  const tbody = document.querySelector("#tradeTable tbody");
  tbody.innerHTML = "";
  trades.forEach(t => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.instrument}</td>
      <td class="${t.profitLoss >= 0 ? 'profit' : 'loss'}">$${t.profitLoss.toFixed(2)}</td>
      <td>${t.strategy}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderMonthlySummary(trades) {
  const summary = {};

  trades.forEach(t => {
    const month = new Date(t.date).toLocaleString("default", { year: 'numeric', month: 'long' });
    if (!summary[month]) {
      summary[month] = { total: 0, win: 0, count: 0 };
    }
    summary[month].total += t.profitLoss;
    if (t.profitLoss > 0) summary[month].win++;
    summary[month].count++;
  });

  const summaryTable = document.getElementById("monthlySummary");
  summaryTable.innerHTML = `
    <tr><th>Mese</th><th>Profitto Totale</th><th>Win Rate</th></tr>
  `;

  Object.entries(summary).forEach(([month, data]) => {
    const profit = data.total.toFixed(2);
    const winRate = ((data.win / data.count) * 100).toFixed(0);
    const color = data.total >= 0 ? "profit" : "loss";

    summaryTable.innerHTML += `
      <tr>
        <td>${month}</td>
        <td class="${color}">$${profit}</td>
        <td>${winRate}%</td>
      </tr>
    `;
  });
}
