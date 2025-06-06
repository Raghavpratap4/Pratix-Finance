
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

  const pieCtx = document.getElementById("sipChart").getContext("2d");
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: ["Invested", "Returns"],
      datasets: [{
        data: [invested, returns],
        backgroundColor: ["#3498db", "#2ecc71"]
      }]
    }
  });

  const lineCtx = document.getElementById("sipLineChart").getContext("2d");
  if (window.lineChart) window.lineChart.destroy();

  let lineData = [];
  for (let i = 1; i <= n; i++) {
    let fv = P * (((Math.pow(1 + r, i) - 1) / r) * (1 + r));
    lineData.push(fv.toFixed(0));
  }

  window.lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: Array.from({ length: n }, (_, i) => i + 1),
      datasets: [{
        label: "SIP Growth Over Time",
        data: lineData,
        borderColor: "#8e44ad",
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { display: false },
        y: { beginAtZero: true }
      }
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
  if (window.pieChart) window.pieChart.destroy();
  if (window.lineChart) window.lineChart.destroy();
}

function previewExport(type) {
  const exportArea = document.getElementById("export-area");
  html2canvas(exportArea).then(canvas => {
    if (type === "image") {
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "sip-summary.png";
      link.click();
    } else if (type === "pdf") {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("sip-summary.pdf");
    }
  });
}

function previewSIP() {
  const exportArea = document.getElementById("export-area");
  html2canvas(exportArea).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const previewArea = document.getElementById("previewArea");
    previewArea.innerHTML = "";  // Clear previous
    const img = new Image();
    img.src = imgData;
    previewArea.appendChild(img);
    document.getElementById("previewModal").style.display = "flex";
    window.lastPreviewCanvas = canvas;
  });
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

function downloadPreview(type) {
  if (!window.lastPreviewCanvas) return;
  const imgData = window.lastPreviewCanvas.toDataURL("image/png");
  if (type === "image") {
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "sip-summary.png";
    link.click();
  } else if (type === "pdf") {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("sip-summary.pdf");
  }
}

function updatePreviewInputs() {
  document.getElementById("previewMonthlyInvestment").innerText = document.getElementById("monthlyInvestment").value;
  document.getElementById("previewExpectedReturn").innerText = document.getElementById("expectedReturn").value;
  document.getElementById("previewInvestmentPeriod").innerText = document.getElementById("investmentPeriod").value;
}

function previewSIP() {
  updatePreviewInputs();
  const exportArea = document.getElementById("export-area");
  html2canvas(exportArea).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const previewArea = document.getElementById("previewArea");
    previewArea.innerHTML = "";
    const img = new Image();
    img.src = imgData;
    previewArea.appendChild(img);
    document.getElementById("previewModal").style.display = "flex";
    window.lastPreviewCanvas = canvas;
  });
}
