
function calculateSIP() {
  const P = parseFloat(document.getElementById("monthlyInvestment").value);
  const r = parseFloat(document.getElementById("expectedReturn").value) / 100 / 12;
  const n = parseFloat(document.getElementById("investmentPeriod").value) * 12;

  const FV = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = P * n;
  const returns = FV - invested;

  document.getElementById("investedAmount").innerText = invested.toFixed(0);
  document.getElementById("returns").innerText = returns.toFixed(0);
  document.getElementById("totalValue").innerText = FV.toFixed(0);

  const ctx = document.getElementById("sipChart").getContext("2d");
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Invested", "Returns"],
      datasets: [{
        data: [invested, returns],
        backgroundColor: ["#3498db", "#2ecc71"]
      }]
    }
  });
}

function resetCalculator() {
  document.getElementById("monthlyInvestment").value = "";
  document.getElementById("expectedReturn").value = "";
  document.getElementById("investmentPeriod").value = "";
  document.getElementById("investedAmount").innerText = "0";
  document.getElementById("returns").innerText = "0";
  document.getElementById("totalValue").innerText = "0";
  if (window.chart) window.chart.destroy();
}

function previewExport(type) {
  alert("Preview for " + type + " would be shown here.");
}
