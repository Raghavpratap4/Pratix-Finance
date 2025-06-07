function calculateGST() {
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;

  const gst = (amount * rate) / 100;
  const total = amount + gst;

  document.getElementById("gstAmount").textContent = gst.toFixed(2);
  document.getElementById("totalAmount").textContent = total.toFixed(2);

  drawCharts(amount, gst);
}

function drawCharts(amount, gst) {
  const ctxPie = document.getElementById("gstPieChart").getContext("2d");
  const ctxBar = document.getElementById("gstBarChart").getContext("2d");

  if (window.pieChart) window.pieChart.destroy();
  if (window.barChart) window.barChart.destroy();

  window.pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Amount', 'GST'],
      datasets: [{
        data: [amount, gst],
        backgroundColor: ['#4CAF50', '#FF9800'],
      }]
    }
  });

  window.barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Amount', 'GST'],
      datasets: [{
        label: 'Breakdown',
        data: [amount, gst],
        backgroundColor: ['#4CAF50', '#FF9800'],
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function changeLanguage() {
  const lang = document.getElementById("language-select").value;
  const t = translations[lang];

  document.getElementById("gstTitle").textContent = t.title;
  document.getElementById("label-amount").textContent = t.amount;
  document.getElementById("label-rate").textContent = t.rate;
  document.getElementById("calculateBtn").textContent = t.calculate;

  document.getElementById("gstInfoHeading").textContent = t.gstInfo;
  document.getElementById("gstInfoPara").textContent = t.gstDesc;
  document.getElementById("gstBenefitsHeading").textContent = t.gstWhy;
  document.getElementById("disclaimerText").textContent = t.disclaimer;

  // List items
  document.getElementById("li1").textContent = t.li1;
  document.getElementById("li2").textContent = t.li2;
  document.getElementById("li3").textContent = t.li3;
}
