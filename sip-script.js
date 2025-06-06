
function calculateSIP() {
  const monthly = parseFloat(document.getElementById("monthly").value);
  const years = parseFloat(document.getElementById("years").value);
  const rate = parseFloat(document.getElementById("rate").value);

  const months = years * 12;
  const r = rate / 12 / 100;
  const maturity = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const invested = monthly * months;
  const gain = maturity - invested;

  document.getElementById("result").innerHTML = 
    `<p>Total Invested: ₹${invested.toFixed(2)}</p>
     <p>Estimated Returns: ₹${gain.toFixed(2)}</p>
     <p>Total Value: ₹${maturity.toFixed(2)}</p>`;

  drawChart(invested, gain);
}

function drawChart(invested, gain) {
  const ctx = document.getElementById("sipChart").getContext("2d");
  if (window.sipChartInstance) {
    window.sipChartInstance.destroy();
  }
  window.sipChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Invested", "Returns"],
      datasets: [{
        data: [invested, gain],
        backgroundColor: ["#0077ff", "#ffa500"],
        hoverOffset: 10
      }]
    }
  });
}

function clearFields() {
  document.getElementById("monthly").value = "";
  document.getElementById("years").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("result").innerHTML = "";
  if (window.sipChartInstance) {
    window.sipChartInstance.destroy();
  }
}

document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
}
