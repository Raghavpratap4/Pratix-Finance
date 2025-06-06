let isDark = false;
function toggleTheme() {
  document.body.classList.toggle('dark');
  isDark = !isDark;
}

function clearInput(id) {
  document.getElementById(id).value = '';
}

function resetFields() {
  ['loanAmount', 'interestRate', 'loanTenure'].forEach(clearInput);
  document.getElementById('tenureType').value = 'months';
  document.getElementById('monthlyEMI').innerText = 'Monthly EMI: ₹0';
  document.getElementById('totalInterest').innerText = 'Total Interest: ₹0';
  document.getElementById('totalPayment').innerText = 'Total Payment: ₹0';
  if (emiChart) emiChart.destroy();
}

let emiChart = null;
let barChart = null;

function calculateEMI() {
  const P = parseFloat(document.getElementById('loanAmount').value);
  const R = parseFloat(document.getElementById('interestRate').value) / 12 / 100;
  let N = parseFloat(document.getElementById('loanTenure').value);
  const type = document.getElementById('tenureType').value;
  if (type === 'years') N = N * 12;

  if (!P || !R || !N) return;

  const EMI = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  const total = EMI * N;
  const interest = total - P;

  document.getElementById('monthlyEMI').innerText = 'Monthly EMI: ₹' + EMI.toFixed(2);
  document.getElementById('totalInterest').innerText = 'Total Interest: ₹' + interest.toFixed(2);
  document.getElementById('totalPayment').innerText = 'Total Payment: ₹' + total.toFixed(2);

  if (emiChart) emiChart.destroy();
  const ctx = document.getElementById('emiChart').getContext('2d');
  emiChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [P, interest],
        backgroundColor: ['#00c6ff', '#ffd200']
      }]
    }
  });

  if (barChart) barChart.destroy();
  const barCtx = document.getElementById('barChart').getContext('2d');
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Principal', 'Interest', 'Total Payment'],
      datasets: [{
        label: 'Amount (₹)',
        data: [P, interest, total],
        backgroundColor: ['#00c6ff', '#ffd200', '#4caf50']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}
