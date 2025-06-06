
function clearField(id) {
  document.getElementById(id).value = "";
}

function resetForm() {
  ['monthlyInvestment', 'investmentPeriod', 'annualReturn'].forEach(id => clearField(id));
  document.getElementById("results").innerHTML = "";
  if (window.sipChart) window.sipChart.destroy();
  if (window.barChart) window.barChart.destroy();
}

function calculateSIP() {
  const P = parseFloat(document.getElementById("monthlyInvestment").value);
  const Y = parseFloat(document.getElementById("investmentPeriod").value);
  const R = parseFloat(document.getElementById("annualReturn").value);

  if (!P || !Y || !R) {
    alert("Please fill in all fields!");
    return;
  }

  const n = Y * 12;
  const r = R / 12 / 100;
  const maturityValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const invested = P * n;
  const gain = maturityValue - invested;

  document.getElementById("results").innerHTML = `
    <b>Total Invested:</b> ₹${invested.toFixed(2)}<br>
    <b>Estimated Returns:</b> ₹${gain.toFixed(2)}<br>
    <b>Maturity Amount:</b> ₹${maturityValue.toFixed(2)}
  `;

  if (window.sipChart) window.sipChart.destroy();
  if (window.barChart) window.barChart.destroy();

  const ctx1 = document.getElementById("sipChart").getContext("2d");
  window.sipChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: ["Invested", "Gains"],
      datasets: [{
        data: [invested, gain],
        backgroundColor: ["#007bff", "#28a745"]
      }]
    }
  });

  const ctx2 = document.getElementById("barChart").getContext("2d");
  window.barChart = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Invested", "Gains"],
      datasets: [{
        label: "₹ Amount",
        data: [invested, gain],
        backgroundColor: ["#007bff", "#28a745"]
      }]
    }
  });
}

document.getElementById("modeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
