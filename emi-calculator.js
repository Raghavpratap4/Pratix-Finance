
document.getElementById("emi-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const interestRate = parseFloat(document.getElementById("interestRate").value);
  const tenure = parseFloat(document.getElementById("tenure").value);

  const monthlyRate = interestRate / 12 / 100;
  const numPayments = tenure * 12;

  const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

  const totalPayment = emi * numPayments;
  const totalInterest = totalPayment - loanAmount;

  document.getElementById("emiValue").textContent = emi.toFixed(2);
  document.getElementById("totalInterestValue").textContent = totalInterest.toFixed(2);
  document.getElementById("totalPaymentValue").textContent = totalPayment.toFixed(2);

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Principal", "Interest"],
      datasets: [{
        data: [loanAmount, totalInterest],
        backgroundColor: ["#4CAF50", "#FF5722"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  if (window.lineChart) window.lineChart.destroy();

  const monthlyEMIs = Array.from({ length: numPayments }, () => emi.toFixed(2));

  window.lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: Array.from({ length: numPayments }, (_, i) => i + 1),
      datasets: [{
        label: "Monthly EMI (₹)",
        data: monthlyEMIs,
        borderColor: "#3f51b5",
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: false }
      }
    }
  });
});
