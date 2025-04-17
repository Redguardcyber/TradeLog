
const sheetID = "1j7FXyH3R93cEGgnsq0pwmXTkBGaBLtcI772FKT1E_go";
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

fetch(sheetURL)
    .then(res => res.text())
    .then(text => {
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        const tradeBody = document.getElementById("trade-body");
        const monthly = {};

        rows.forEach(row => {
            const [date, instrument, pl, strategy] = row.c.map(c => c?.v || "");
            const profit = parseFloat(pl);
            const rowEl = document.createElement("tr");

            const plClass = profit >= 0 ? "green" : "red";
            const plText = profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;

            rowEl.innerHTML = `
                <td>${date}</td>
                <td>${instrument}</td>
                <td class="${plClass}">${plText}</td>
                <td>${strategy}</td>
            `;
            tradeBody.appendChild(rowEl);

            const month = date.slice(0, 7);
            if (!monthly[month]) monthly[month] = { total: 0, wins: 0, trades: 0 };
            monthly[month].total += profit;
            if (profit > 0) monthly[month].wins++;
            monthly[month].trades++;
        });

        const summary = document.getElementById("monthly-summary");
        for (const [month, stats] of Object.entries(monthly)) {
            const winRate = ((stats.wins / stats.trades) * 100).toFixed(1);
            const totalClass = stats.total >= 0 ? "green" : "red";
            const totalText = stats.total >= 0 ? `+$${stats.total.toFixed(2)}` : `-$${Math.abs(stats.total).toFixed(2)}`;
            const p = document.createElement("p");
            p.innerHTML = `<strong>${month}:</strong> <span class="${totalClass}">${totalText}</span> – Win rate: ${winRate}%`;
            summary.appendChild(p);
        }
    });
