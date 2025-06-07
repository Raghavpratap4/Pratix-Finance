let gstPieChart, gstBarChart;

const translations = {
  en: {
    title: "🧾 GST Calculator",
    labelAmount: "Amount (₹):",
    labelRate: "GST Rate (%):",
    reset: "🔁 Reset",
    calculate: "📊 Calculate",
    preview: "👁️ Preview",
    gstAmount: "GST Amount: ₹",
    totalAmount: "Total Amount: ₹"
  },
  hi: {
    title: "🧾 जीएसटी कैलकुलेटर",
    labelAmount: "राशि (₹):",
    labelRate: "जीएसटी दर (%):",
    reset: "🔁 रीसेट",
    calculate: "📊 कैलकुलेट",
    preview: "👁️ पूर्वावलोकन",
    gstAmount: "जीएसटी राशि: ₹",
    totalAmount: "कुल राशि: ₹"
  },
  bn: {
    title: "🧾 জিএসটি ক্যালকুলেটর",
    labelAmount: "পরিমাণ (₹):",
    labelRate: "জিএসটি হার (%):",
    reset: "🔁 রিসেট",
    calculate: "📊 হিসাব করুন",
    preview: "👁️ প্রিভিউ",
    gstAmount: "জিএসটি পরিমাণ: ₹",
    totalAmount: "মোট পরিমাণ: ₹"
  }
  // Add other languages as needed
};

function changeLanguage() {
  const lang = document.getElementById("language-select").value;
  const t = translations[lang] || translations.en;

  document.getElementById("gst-title").innerText = t.title;
  document.getElementById("label-amount").innerText = t.labelAmount;
  document.getElementById("label-rate").innerText = t.labelRate;
  document.getElementById("reset-btn").innerText = t.reset;
  document.getElementById("calculate-btn").innerText = t.calculate;
  document.getElementById("preview-btn").innerText = t.preview;
  calculateGST(); // refresh output with translated labels
}

function resetForm() {
  document.getElementById("amount").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("output-gst").innerText = "GST Amount: ₹0";
  document.getElementById("output-total").innerText = "Total Amount: ₹0";
  if (gstPieChart) gstPieChart.destroy();
  if (gstBarChart) gstBarChart.destroy();
}

function calculateGST() {
  const amount = parseFloat(document.getElementById("amount").value);
  const rate = parseFloat(document.getElementById("rate").value);
  const mode = document.getElementById("mode").value;
  const lang = document.getElementById("language-select").value;
  const t = translations[lang] || translations.en;

  if (isNaN(amount) || isNaN(rate)) return;

  let gst = 0, total = 0;
  if (mode === "exclusive") {
    gst = (amount * rate) / 100;
    total = amount + gst;
  } else {
    gst = (amount * rate) / (100 + rate);
    total = amount;
    amount = amount - gst;
  }

  document.getElementById("output-gst").innerText = `${t.gstAmount}${gst.toFixed(2)}`;
  document.getElementById("output-total").innerText = `${t.totalAmount}${total.toFixed(2)}`;

  drawCharts(amount, gst, total);
}

function drawCharts(amount, gst, total) {
  const pieCtx = document.getElementById("gstPieChart").getContext("2d");
  const barCtx = document.getElementById("gstBarChart").getContext("2d");

  if (gstPieChart) gstPieChart.destroy();
  if (gstBarChart) gstBarChart.destroy();

  gstPieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Base Amount", "GST"],
      datasets: [{
        data: [amount, gst],
        backgroundColor: ["#42a5f5", "#66bb6a"]
      }]
    }
  });

  gstBarChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Base", "GST", "Total"],
      datasets: [{
        label: "₹",
        data: [amount, gst, total],
        backgroundColor: ["#42a5f5", "#66bb6a", "#ef5350"]
      }]
    }
  });
}

function showPreview() {
  document.querySelector("header").style.display = "block";
  document.querySelector(".description").style.display = "none";
  document.querySelector("footer").style.display = "none";
  document.getElementById("preview-actions").style.display = "block";
}

function downloadAsImage() {
  html2canvas(document.getElementById("calculator-section")).then(canvas => {
    const link = document.createElement("a");
    link.download = "gst_calculator_result.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

function downloadAsPDF() {
  const element = document.getElementById("calculator-section");
  html2pdf().from(element).save("gst_calculator_result.pdf");
}

function shareResult() {
  const shareData = {
    title: "GST Calculation Result",
    text: document.getElementById("output-total").innerText,
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData);
  } else {
    alert("Share not supported on this device.");
  }
}
