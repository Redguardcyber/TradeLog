let isAdmin = false;
const passwordCorrect = "Trionfo1992!";

document.getElementById("adminBtn").addEventListener("click", () => {
  document.getElementById("adminArea").classList.toggle("hidden");
});

function loadCSV() {
  const password = document.getElementById("password").value;
  if (password !== passwordCorrect) {
    alert("Password errata!");
    return;
  }

  const fileInput = document.getElementById("csvInput");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const rows = e.target.result.trim().split("\n");
    const data = rows.slice(1).map(row => {
      const [date, instrument, pl, strategy] = row.split(",");
      return { date, instrument, pl: parseFloat(pl.replace('$','')), strategy };
    });

    localStorage.setItem("tradeData", JSON.stringify(data));
    renderTrades(data);
  };
  reader.readAsText(file);
}

function renderTrades(data) {
  const tbody = document.querySelector("#tradeTable tbody");
  tbody.innerHTML = "";

  const monthly = {};

  data.forEach(({ date, instrument, pl, strategy }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${date}</td>
      <td>${instrument}</td>
      <td class="${pl >= 0 ? 'green' : 'red'}">$${pl.toFixed(2)}</td>
      <td>${strategy}</td>
    `;
    tbody.appendChild(tr);

    const month = date.slice(0, 7);
    if (!monthly[month]) monthly[month] = { profit: 0, win: 0, total: 0 };
    monthly[month].profit += pl;
    monthly[month].total += 1;
    if (pl > 0) monthly[month].win += 1;
  });

  const summaryDiv = document.getElementById("monthlySummary");
  summaryDiv.innerHTML = "";
  Object.entries(monthly).forEach(([month, { profit, win, total }]) => {
    const p = document.createElement("div");
    p.innerHTML = `<strong>${month}:</strong> Profitto: <span style="color:${profit >= 0 ? 'green':'red'}">$${profit.toFixed(2)}</span>, Win Rate: ${((win/total)*100).toFixed(1)}%`;
    summaryDiv.appendChild(p);
  });
}

window.onload = () => {
  const data = JSON.parse(localStorage.getItem("tradeData") || "[]");
  renderTrades(data);
};
