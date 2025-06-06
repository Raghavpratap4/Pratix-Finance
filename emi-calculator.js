
function clearInput(id) {
  document.getElementById(id).value = '';
}

function resetCalculator() {
  ['loanAmount', 'interestRate', 'loanTenure'].forEach(id => clearInput(id));
  document.getElementById('resultsContainer').style.display = 'none';
}

function animateValue(id, start, end, duration = 1000) {
  let obj = document.getElementById(id);
  let range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = timestamp - startTime;
    let value = Math.floor(start + (range * (progress / duration)));
    obj.innerText = "₹ " + (value > end ? end : value);
    if (progress < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function calculateEMI() {
  const P = parseFloat(document.getElementById("loanAmount").value);
  const R = parseFloat(document.getElementById("interestRate").value) / 100 / 12;
  const N = parseFloat(document.getElementById("loanTenure").value) * 12;

  if (isNaN(P) || isNaN(R) || isNaN(N)) return alert("Please fill all fields.");

  const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  document.getElementById("resultsContainer").style.display = 'block';
  animateValue("emi-result", 0, Math.round(emi));
  animateValue("total-payment", 0, Math.round(totalPayment));
  animateValue("total-interest", 0, Math.round(totalInterest));

  const ctx = document.getElementById('emiChart').getContext('2d');
  if (window.emiChart) window.emiChart.destroy();
  window.emiChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [P, totalInterest],
        backgroundColor: ['#4caf50', '#ff9800']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}
