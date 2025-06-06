function calculateSIP() {
  const monthlyInvestment = parseFloat(document.getElementById("monthlyInvestment").value);
  const expectedReturn = parseFloat(document.getElementById("expectedReturn").value);
  const investmentPeriod = parseFloat(document.getElementById("investmentPeriod").value);

  if (isNaN(monthlyInvestment) || isNaN(expectedReturn) || isNaN(investmentPeriod)) {
    alert("Please fill all fields.");
    return;
  }

  const n = investmentPeriod * 12;
  const r = expectedReturn / 12 / 100;
  const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
  const investedAmount = monthlyInvestment * n;
  const returns = futureValue - investedAmount;

  document.getElementById("investedAmount").innerText = investedAmount.toFixed(2);
  document.getElementById("returns").innerText = returns.toFixed(2);
  document.getElementById("totalValue").innerText = futureValue.toFixed(2);

  renderPieChart("sipPieChart", investedAmount, returns);
  renderLineChart("sipLineChart", monthlyInvestment, r, n);
}

function renderPieChart(canvasId, invested, returns) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (window[canvasId + "Chart"]) window[canvasId + "Chart"].destroy();
  window[canvasId + "Chart"] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Invested Amount", "Returns"],
      datasets: [{
        data: [invested, returns],
        backgroundColor: ["#42A5F5", "#66BB6A"]
      }]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

function renderLineChart(canvasId, monthly, rate, months) {
  const values = [];
  let total = 0;
  for (let i = 1; i <= months; i++) {
    total = (total + monthly) * (1 + rate);
    values.push(total.toFixed(2));
  }

  const ctx = document.getElementById(canvasId).getContext("2d");
  if (window[canvasId + "Chart"]) window[canvasId + "Chart"].destroy();
  window[canvasId + "Chart"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: Array.from({ length: months }, (_, i) => `M${i + 1}`),
      datasets: [{
        label: "Wealth Over Time",
        data: values,
        fill: false,
        borderColor: "#42A5F5",
        tension: 0.1
      }]
    },
    options: { responsive: true }
  });
}

function showPreview() {
  const mi = parseFloat(document.getElementById("monthlyInvestment").value);
  const er = parseFloat(document.getElementById("expectedReturn").value);
  const ip = parseFloat(document.getElementById("investmentPeriod").value);
  if (isNaN(mi) || isNaN(er) || isNaN(ip)) {
    alert("Please calculate SIP first.");
    return;
  }

  const n = ip * 12;
  const r = er / 12 / 100;
  const fv = mi * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
  const invested = mi * n;
  const ret = fv - invested;

  document.getElementById("previewMonthlyInvestment").innerText = mi;
  document.getElementById("previewExpectedReturn").innerText = er;
  document.getElementById("previewInvestmentPeriod").innerText = ip;
  document.getElementById("previewInvestedAmount").innerText = invested.toFixed(2);
  document.getElementById("previewReturns").innerText = ret.toFixed(2);
  document.getElementById("previewTotalValue").innerText = fv.toFixed(2);

  renderPieChart("sipPreviewPieChart", invested, ret);
  renderLineChart("sipPreviewLineChart", mi, r, n);

  document.getElementById("previewModal").style.display = "flex";
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

function resetCalculator() {
  document.getElementById("monthlyInvestment").value = "";
  document.getElementById("expectedReturn").value = "";
  document.getElementById("investmentPeriod").value = "";
  document.getElementById("investedAmount").innerText = "0";
  document.getElementById("returns").innerText = "0";
  document.getElementById("totalValue").innerText = "0";
}
