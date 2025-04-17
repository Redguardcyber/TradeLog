const sheetID = '1j7FXyH3R93cEGgnsq0pwmXTkBGaBLtcI772FKT1E_go';
const sheetName = 'Foglio1';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?sheet=${sheetName}`;
const query = encodeURIComponent('Select A, B, C, D');
const url = `${base}&tq=${query}`;

fetch(url)
  .then(res => res.text())
  .then(rep => {
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const table = document.getElementById('tradeTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // reset

    let total = 0;
    let winCount = 0;
    let totalCount = 0;
    let monthlyData = {};

    data.table.rows.forEach(row => {
      const date = row.c[0]?.f || '';
      const instrument = row.c[1]?.v || '';
      const profit = parseFloat(row.c[2]?.v || 0);
      const strategy = row.c[3]?.v || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td>${instrument}</td>
        <td style="color:${profit >= 0 ? 'green' : 'red'};">$${profit.toFixed(2)}</td>
        <td>${strategy}</td>
      `;
      tbody.appendChild(tr);

      if (!isNaN(profit)) {
        total += profit;
        totalCount++;
        if (profit > 0) winCount++;

        const month = date.split('/')[1] + '/' + date.split('/')[2]; // MM/YYYY
        if (!monthlyData[month]) {
          monthlyData[month] = { profit: 0, trades: 0, wins: 0 };
        }
        monthlyData[month].profit += profit;
        monthlyData[month].trades++;
        if (profit > 0) monthlyData[month].wins++;
      }
    });

    // Aggiorna riepilogo totale
    document.getElementById('totalProfit').textContent = `$${total.toFixed(2)}`;
    const winRate = totalCount > 0 ? ((winCount / totalCount) * 100).toFixed(1) : 0;
    document.getElementById('totalWinRate').textContent = `${winRate}%`;

    // Riepilogo mensile
    const monthlyEl = document.getElementById('monthlySummary');
    monthlyEl.innerHTML = '';
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      const winRate = ((data.wins / data.trades) * 100).toFixed(1);
      const div = document.createElement('div');
      div.innerHTML = `<strong>${month}</strong>: <span style="color:${data.profit >= 0 ? 'green' : 'red'};">$${data.profit.toFixed(2)}</span> – Win Rate: ${winRate}%`;
      monthlyEl.appendChild(div);
    });
  })
  .catch(err => {
    console.error('Errore nel caricamento dei dati:', err);
  });
