document.getElementById('csvFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const rows = e.target.result.split('\n').slice(1).filter(r => r.trim() !== '');
        const trades = rows.map(row => {
            const [date, instrument, profitLoss, strategy, notes] = row.split(',');
            return { date, instrument, profitLoss: parseFloat(profitLoss), strategy, notes };
        });
        displayTrades(trades);
        displayMonthlyPerformance(trades);
    };
    reader.readAsText(file);
});

function displayTrades(trades) {
    const tbody = document.querySelector('#tradeTable tbody');
    tbody.innerHTML = '';
    trades.forEach(trade => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${trade.date}</td>
            <td>${trade.instrument}</td>
            <td class="${trade.profitLoss >= 0 ? 'positive' : 'negative'}">${trade.profitLoss >= 0 ? '+' : ''}$${trade.profitLoss.toFixed(2)}</td>
            <td>${trade.strategy}</td>
            <td>${trade.notes}</td>
        `;
        tbody.appendChild(tr);
    });
}

function displayMonthlyPerformance(trades) {
    const summaryDiv = document.getElementById('monthly-performance');
    summaryDiv.innerHTML = '';
    const months = {};
    trades.forEach(trade => {
        const [year, month] = trade.date.split('-');
        const key = `${year}-${month}`;
        if (!months[key]) months[key] = { profit: 0, wins: 0, total: 0 };
        months[key].profit += trade.profitLoss;
        if (trade.profitLoss > 0) months[key].wins++;
        months[key].total++;
    });
    Object.entries(months).forEach(([month, data]) => {
        const box = document.createElement('div');
        box.className = 'month-box';
        const profitClass = data.profit >= 0 ? 'positive' : 'negative';
        const winRate = ((data.wins / data.total) * 100).toFixed(1);
        box.innerHTML = `
            <strong>${month}</strong><br>
            <span class="${profitClass}">${data.profit >= 0 ? '+' : ''}$${data.profit.toFixed(2)}</span><br>
            Win Rate: ${winRate}%
        `;
        summaryDiv.appendChild(box);
    });
}