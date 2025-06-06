
function calculateEMI() {
  const principal = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const years = parseFloat(document.getElementById("loanTenure").value);

  if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate <= 0 || years <= 0) {
    alert("Please enter valid positive numbers for all fields.");
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
              (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  document.getElementById("emiResult").innerText = emi.toFixed(2);
  document.getElementById("interestResult").innerText = totalInterest.toFixed(2);
  document.getElementById("totalPayment").innerText = totalPayment.toFixed(2);
  document.getElementById("resultsContainer").style.display = "block";

  drawChart(principal, totalInterest);
}

function resetCalculator() {
  document.getElementById("loanAmount").value = "";
  document.getElementById("interestRate").value = "";
  document.getElementById("loanTenure").value = "";
  document.getElementById("resultsContainer").style.display = "none";
}

function drawChart(principal, interest) {
  const ctx = document.getElementById('emiChart').getContext('2d');

  if (window.emiChart) {
    window.emiChart.destroy();
  }

  const gradient1 = ctx.createLinearGradient(0, 0, 200, 0);
  gradient1.addColorStop(0, '#00c6ff');
  gradient1.addColorStop(1, '#0072ff');

  const gradient2 = ctx.createLinearGradient(0, 0, 200, 0);
  gradient2.addColorStop(0, '#ff6a00');
  gradient2.addColorStop(1, '#ee0979');

  window.emiChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [principal, interest],
        backgroundColor: [gradient1, gradient2],
        hoverOffset: 10,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      animation: {
        animateScale: true
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark') ? '#fff' : '#000',
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              let value = context.raw || 0;
              return `${label}: ₹${value.toLocaleString('en-IN')}`;
            }
          }
        }
      }
    }
  });
}
