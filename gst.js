let pieChart, previewChart;

function calculateGST() {
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const rate = parseFloat(document.getElementById("gstRate").value) || 0;
  const gst = (amount * rate) / 100;
  const total = amount + gst;

  document.getElementById("gstAmount").textContent = gst.toFixed(2);
  document.getElementById("totalAmount").textContent = total.toFixed(2);

  renderPieChart(gst, amount);
}

function renderPieChart(gst, base) {
  const ctx = document.getElementById("gstPieChart").getContext("2d");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Base Amount', 'GST'],
      datasets: [{ data: [base, gst], backgroundColor: ['#36A2EB', '#FF6384'] }]
    }
  });
}

function resetCalculator() {
  document.getElementById("amount").value = "";
  document.getElementById("gstRate").value = "";
  document.getElementById("gstAmount").textContent = "0";
  document.getElementById("totalAmount").textContent = "0";
  if (pieChart) pieChart.destroy();
}

function showPreview() {
  const gst = document.getElementById("gstAmount").textContent;
  const total = document.getElementById("totalAmount").textContent;

  document.getElementById("previewGstAmount").textContent = gst;
  document.getElementById("previewTotalAmount").textContent = total;

  const base = parseFloat(document.getElementById("amount").value);
  const gstVal = parseFloat(gst);

  const ctx = document.getElementById("previewPieChart").getContext("2d");
  if (previewChart) previewChart.destroy();
  previewChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Base Amount', 'GST'],
      datasets: [{ data: [base, gstVal], backgroundColor: ['#36A2EB', '#FF6384'] }]
    }
  });

  document.getElementById("previewModal").style.display = "block";
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

function downloadPreviewAsImage() {
  html2canvas(document.getElementById("previewContent")).then(canvas => {
    const link = document.createElement("a");
    link.download = "gst-preview.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

function downloadPreviewAsPDF() {
  html2canvas(document.getElementById("previewContent")).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("gst-preview.pdf");
  });
}

function sharePreview() {
  const shareData = {
    title: "GST Calculator - Pratix Finance",
    text: "Check out this GST calculation result!",
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    alert("Sharing not supported on this device.");
  }
}
