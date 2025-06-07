let pieChart, barChart;

function calculateGST() {
  const amount = parseFloat(document.getElementById("amount").value);
  const rate = parseFloat(document.getElementById("rate").value);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  const gstAmount = (amount * rate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const finalAmount = amount + gstAmount;

  // Update results
  document.getElementById("cgst").innerText = cgst.toFixed(2);
  document.getElementById("sgst").innerText = sgst.toFixed(2);
  document.getElementById("totalGst").innerText = gstAmount.toFixed(2);
  document.getElementById("finalAmount").innerText = finalAmount.toFixed(2);

  // Chart Data
  const pieData = {
    labels: ['Original Amount', 'CGST', 'SGST'],
    datasets: [{
      label: 'GST Split',
      data: [amount, cgst, sgst],
      backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726'],
      borderWidth: 1
    }]
  };

  const barData = {
    labels: ['Original', 'CGST', 'SGST', 'Final'],
    datasets: [{
      label: 'Amount (₹)',
      data: [amount, cgst, sgst, finalAmount],
      backgroundColor: ['#42a5f5', '#66bb6a', '#ffa726', '#ab47bc']
    }]
  };

  const pieConfig = {
    type: 'pie',
    data: pieData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'GST Distribution'
        }
      }
    }
  };

  const barConfig = {
    type: 'bar',
    data: barData,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'GST Breakdown'
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  };

  // Destroy old charts if exist
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();

  pieChart = new Chart(document.getElementById('gstPieChart'), pieConfig);
  barChart = new Chart(document.getElementById('gstBarChart'), barConfig);
}


// Optional language translations (to be extended)
function changeLanguage() {
  const lang = document.getElementById("language").value;
  const titles = {
    en: "GST Calculator",
    hi: "जीएसटी कैलकुलेटर",
    fr: "Calculateur de GST",
    de: "GST-Rechner",
    ru: "Калькулятор НДС",
    ja: "GST計算機",
    bn: "GST ক্যালকুলেটর"
  };
  const disclaimers = {
    en: "This GST calculator provides an estimate for informational purposes only.",
    hi: "यह GST कैलकुलेटर केवल जानकारी के लिए एक अनुमान प्रदान करता है।",
    fr: "Ce calculateur de GST fournit une estimation à titre informatif.",
    de: "Dieser GST-Rechner dient nur zu Informationszwecken.",
    ru: "Этот калькулятор НДС предназначен только для информационных целей.",
    ja: "このGST計算機は参考用です。",
    bn: "এই GST ক্যালকুলেটর শুধুমাত্র তথ্যের জন্য একটি অনুমান প্রদান করে।"
  };

  document.getElementById("gstTitle").innerText = titles[lang] || titles["en"];
  document.getElementById("gstDisclaimer").innerText = disclaimers[lang] || disclaimers["en"];
}
