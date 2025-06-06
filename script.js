
function calculateEMI() {
  const P = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const years = parseFloat(document.getElementById("loanTenure").value);

  const R = annualRate / 12 / 100;
  const N = years * 12;

  const EMI = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
  const totalPayment = EMI * N;
  const totalInterest = totalPayment - P;

  document.getElementById("emi").innerText = EMI.toFixed(2);
  document.getElementById("totalInterest").innerText = totalInterest.toFixed(2);
  document.getElementById("totalPayment").innerText = totalPayment.toFixed(2);

  document.getElementById("resultsContainer").style.display = "block";

  renderCharts(P, totalInterest, EMI, N);
}

function renderCharts(principal, interest, emi, months) {
  const ctxPie = document.getElementById("emiPieChart").getContext("2d");
  const ctxLine = document.getElementById("emiLineChart").getContext("2d");

  if (window.pieChart) window.pieChart.destroy();
  if (window.lineChart) window.lineChart.destroy();

  window.pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [principal, interest],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  const labels = Array.from({length: months}, (_, i) => `Month ${i + 1}`);
  const emiData = Array(months).fill(emi);

  window.lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly EMI',
        data: emiData,
        borderColor: '#007BFF',
        backgroundColor: '#cce5ff',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function clearInput(id) {
  document.getElementById(id).value = '';
}

function resetCalculator() {
  ['loanAmount', 'interestRate', 'loanTenure'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById("resultsContainer").style.display = "none";
  if (window.pieChart) window.pieChart.destroy();
  if (window.lineChart) window.lineChart.destroy();
}

// Auto-hide results if user starts editing inputs
['loanAmount', 'interestRate', 'loanTenure'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById("resultsContainer").style.display = "none";
    if (window.pieChart) window.pieChart.destroy();
    if (window.lineChart) window.lineChart.destroy();
  });
});

function toggleTheme() {
  document.body.classList.toggle('dark');
}
