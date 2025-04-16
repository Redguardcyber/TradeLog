document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);

document.addEventListener('DOMContentLoaded', () => {
  const savedTrades = localStorage.getItem('trades');
  if (savedTrades) {
    const trades = JSON.parse(savedTrades);
    updateTradeTable(trades);
    calculatePerformance(trades);
  }
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const content = e.target.result;
    const rows = content.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    
    const trades = rows.slice(1).map(row => {
      const columns = row.split(',').map(col => col.trim());
      return {
        date: columns[0],
        instrument: columns[1],
        profitLoss: columns[2],
        strategy: columns[3]
      };
    });

    trades.forEach(trade => {
      trade.profitLoss = parseFloat(trade.profitLoss.replace('$', '').trim()) || 0;
    });

    localStorage.setItem('trades', JSON.stringify(trades));
    updateTradeTable(trades);
    calculatePerformance(trades);
  };

  reader.readAsText(file);
}

function updateTradeTable(trades) {
  const tableBody = document.querySelector('#tradeTable tbody');
  tableBody.innerHTML = '';

  trades.forEach(trade => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.date}</td>
      <td>${trade.instrument}</td>
      <td class="${trade.profitLoss >= 0 ? 'positive' : 'negative'}">${trade.profitLoss >= 0 ? '$' + trade.profitLoss : '$' + Math.abs(trade.profitLoss)}</td>
      <td>${trade.strategy}</td>
    `;
    tableBody.appendChild(row);
  });
}

function calculatePerformance(trades) {
  const totalProfit = trades.reduce((acc, trade) => acc + trade.profitLoss, 0);
  const totalTrades = trades.length;
  const totalWins = trades.filter(trade => trade.profitLoss > 0).length;
  const winRate = (totalWins / totalTrades) * 100;

  document.getElementById('monthly-performance').innerHTML = `
    <div class="month-box">
      <h3>Performance Totale</h3>
      <p>Profitti: $${totalProfit.toFixed(2)}</p>
      <p>Win Rate: ${winRate.toFixed(2)}%</p>
    </div>
  `;
}
