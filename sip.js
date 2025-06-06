
let currentExportType = "";
let exportedCanvasDataURL = "";

function calculateSIP() {
  const monthlyInvestment = parseFloat(document.getElementById("monthlyInvestment").value);
  const expectedReturn = parseFloat(document.getElementById("expectedReturn").value);
  const investmentPeriod = parseFloat(document.getElementById("investmentPeriod").value);

  if (isNaN(monthlyInvestment) || isNaN(expectedReturn) || isNaN(investmentPeriod)) {
    alert("Please fill all fields correctly.");
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

  renderChart(investedAmount, returns);
}

function renderChart(investedAmount, returns) {
  const ctx = document.getElementById("sipChart").getContext("2d");
  if (window.sipChart) window.sipChart.destroy();
  window.sipChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Invested Amount", "Returns"],
      datasets: [{
        data: [investedAmount, returns],
        backgroundColor: ["#36A2EB", "#4BC0C0"],
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

function resetCalculator() {
  document.getElementById("monthlyInvestment").value = "";
  document.getElementById("expectedReturn").value = "";
  document.getElementById("investmentPeriod").value = "";

  document.getElementById("investedAmount").innerText = "0";
  document.getElementById("returns").innerText = "0";
  document.getElementById("totalValue").innerText = "0";

  if (window.sipChart) window.sipChart.destroy();
}

function previewExport(type) {
  currentExportType = type;
  const exportArea = document.getElementById("export-area");
  html2canvas(exportArea).then(canvas => {
    exportedCanvasDataURL = canvas.toDataURL("image/png");

    const previewArea = document.getElementById("previewArea");
    previewArea.innerHTML = "";
    const img = document.createElement("img");
    img.src = exportedCanvasDataURL;
    img.style.maxWidth = "100%";
    previewArea.appendChild(img);

    document.getElementById("previewModal").style.display = "flex";
  });
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

function downloadFinalExport() {
  if (currentExportType === "pdf") {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(exportedCanvasDataURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(exportedCanvasDataURL, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("sip-calculation.pdf");
  } else {
    const link = document.createElement("a");
    link.href = exportedCanvasDataURL;
    link.download = "sip-calculation.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function shareExportedImage() {
  if (navigator.canShare && navigator.canShare({ files: [] })) {
    fetch(exportedCanvasDataURL)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "sip-calculation.png", { type: blob.type });
        navigator.share({
          files: [file],
          title: "SIP Calculation - Pratix Finance",
          text: "Here is my SIP result from Pratix Finance."
        });
      })
      .catch(console.error);
  } else {
    alert("Sharing is not supported on this device/browser.");
  }
}
