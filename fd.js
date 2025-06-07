let fdPieChart;
let fdBarChart;

function calculateFD() {
  const P = parseFloat(document.getElementById("principal").value);
  const r = parseFloat(document.getElementById("rate").value);
  const t = parseFloat(document.getElementById("time").value);
  const n = parseInt(document.getElementById("frequency").value);

  if (isNaN(P) || isNaN(r) || isNaN(t)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const maturity = P * Math.pow(1 + (r / (100 * n)), n * t);
  const interest = maturity - P;

  document.getElementById("maturity").innerText = maturity.toFixed(2);
  document.getElementById("interest").innerText = interest.toFixed(2);

  // Data for charts
  const pieData = {
    labels: ["Principal (₹)", "Interest Earned (₹)"],
    datasets: [{
      data: [P, interest],
      backgroundColor: ["#4caf50", "#ff9800"],
      hoverOffset: 10
    }]
  };

  const barData = {
    labels: ["Principal", "Interest", "Total"],
    datasets: [{
      label: 'Amount (₹)',
      data: [P, interest, maturity],
      backgroundColor: ["#4caf50", "#ff9800", "#2196f3"]
    }]
  };

  // PIE chart config with animation
const pieConfig = {
  type: "pie",
  data: pieData,
  options: {
    responsive: true,
    animation: {
      animateScale: true,
      duration: 1200,
      easing: "easeOutBounce"
    },
    plugins: {
      title: {
        display: true,
        text: "FD Composition (Pie Chart)"
      },
      legend: {
        position: 'bottom'
      }
    }
  }
};

// BAR chart config with animation
const barConfig = {
  type: "bar",
  data: barData,
  options: {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      title: {
        display: true,
        text: "FD Growth (Bar Chart)"
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
}
