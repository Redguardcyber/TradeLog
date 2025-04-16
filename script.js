let darkMode = false;

function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
}

async function loadCSV() {
    const response = await fetch('trades.csv');
    const data = await response.text();
    const lines = data.trim().split('\n').slice(1);
    const tbody = document.querySelector('#trades-table tbody');
    tbody.innerHTML = '';

    let total = 0, win = 0;
    const monthlyProfit = {};
    const monthlyWins = {};
    const monthlyTrades = {};

    for (let line of lines) {
        const [date, simbol, strategy, result, profitStr] = line.split(',');
        const profit = parseFloat(profitStr);
        const tr = document.createElement('tr');
        
        // Colora i guadagni in verde e le perdite in rosso
        const profitColor = profit >= 0 ? 'green' : 'red';
        
        tr.innerHTML = `
            <td>${date}</td>
            <td>${simbol}</td>
            <td>${strategy}</td>
            <td>${result}</td>
            <td style="color: ${profitColor};">${profit >= 0 ? '$' + profit.toFixed(2) : '-$' + Math.abs(profit).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
        total++;
        if (result.toLowerCase() === 'win') win++;

        const month = date.slice(0, 7);
        if (!monthlyProfit[month]) monthlyProfit[month] = 0;
        if (!monthlyWins[month]) monthlyWins[month] = 0;
        if (!monthlyTrades[month]) monthlyTrades[month] = 0;

        monthlyProfit[month] += profit;
        if (result.toLowerCase() === 'win') monthlyWins[month]++;
        monthlyTrades[month]++;
    }

    document.getElementById('total-trades').textContent = total;
    document.getElementById('winning-trades').textContent = win;
    document.getElementById('win-rate').textContent = total > 0 ? ((win / total) * 100).toFixed(2) + '%' : '0%';

    // Visualizza statistiche mensili
    const monthlyStatsContainer = document.getElementById('monthlyStats');
    monthlyStatsContainer.innerHTML = '';

    for (let month in monthlyProfit) {
        const profit = monthlyProfit[month];
        const wins = monthlyWins[month];
        const trades = monthlyTrades[month];
        const winRate = ((wins / trades) * 100).toFixed(2);

        monthlyStatsContainer.innerHTML += `
            <div>
                <strong>${month}:</strong>
                <p>Profitto: $${profit.toFixed(2)}</p>
                <p>Win Rate: ${winRate}%</p>
                <p>Totale Trade: ${trades}</p>
                <p>Vincenti: ${wins}</p>
            </div>
        `;
    }

    // Grafico profitti mensili
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyProfit),
            datasets: [{
                label: 'Profitto Mensile ($)',
                data: Object.values(monthlyProfit),
                backgroundColor: '#0077cc',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

window.onload = loadCSV;
