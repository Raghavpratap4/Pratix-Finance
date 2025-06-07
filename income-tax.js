function calculateTax() {
  const income = parseFloat(document.getElementById("income").value);
  const ageGroup = document.getElementById("age").value;
  const regime = document.querySelector('input[name="regime"]:checked').value;

  if (isNaN(income) || income < 0) {
    alert("Please enter a valid income.");
    return;
  }

  let tax = 0;
  let taxable = income;

  if (regime === "old") {
    if (ageGroup === "normal") {
      if (income <= 250000) tax = 0;
      else if (income <= 500000) tax = (income - 250000) * 0.05;
      else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
      else tax = 112500 + (income - 1000000) * 0.3;
    } else if (ageGroup === "senior") {
      if (income <= 300000) tax = 0;
      else if (income <= 500000) tax = (income - 300000) * 0.05;
      else if (income <= 1000000) tax = 10000 + (income - 500000) * 0.2;
      else tax = 110000 + (income - 1000000) * 0.3;
    } else if (ageGroup === "super") {
      if (income <= 500000) tax = 0;
      else if (income <= 1000000) tax = (income - 500000) * 0.2;
      else tax = 100000 + (income - 1000000) * 0.3;
    }
  } else if (regime === "new") {
    // New Regime FY 2024-25
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.1;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.2;
    else tax = 150000 + (income - 1500000) * 0.3;
  }

  document.getElementById("taxableIncome").innerText = taxable.toFixed(2);
  document.getElementById("taxAmount").innerText = tax.toFixed(2);

  // Update chart
  const chartData = {
    labels: ['Tax Payable', 'Remaining Income'],
    datasets: [{
      label: 'Tax vs Income',
      data: [tax, income - tax],
      backgroundColor: ['#ef5350', '#42a5f5']
    }]
  };

  const config = {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Income Tax Distribution'
        }
      }
    }
  };

  if (taxChart) taxChart.destroy();
  taxChart = new Chart(document.getElementById('taxChart'), config);
}

// Language Switching (basic)
function changeLanguage() {
  const lang = document.getElementById("language").value;
  const titles = {
    en: "Income Tax Calculator",
    hi: "आयकर कैलकुलेटर",
    fr: "Calculateur d'impôt sur le revenu",
    de: "Einkommensteuerrechner",
    ru: "Калькулятор подоходного налога",
    ja: "所得税計算機",
    bn: "আয়কর ক্যালকুলেটর"
  };
  const disclaimers = {
    en: "This calculator is for estimation only. Tax rates based on old regime for FY 2024-25.",
    hi: "यह कैलकुलेटर केवल अनुमान के लिए है। कर दरें FY 2024-25 के पुराने नियम पर आधारित हैं।",
    fr: "Ce calculateur est uniquement à titre indicatif. Basé sur l'ancien régime fiscal 2024-25.",
    de: "Nur Schätzung. Steuer nach altem Regime FY 2024-25.",
    ru: "Калькулятор для оценки. Ставки по старой системе за 2024-25 год.",
    ja: "これは推定用です。2024-25年旧制度に基づく税率です。",
    bn: "এটি একটি অনুমান। FY 2024-25 এর পুরানো নিয়মে কর।"
  };

  document.getElementById("taxTitle").innerText = titles[lang] || titles["en"];
  document.getElementById("taxDisclaimer").innerText = disclaimers[lang] || disclaimers["en"];
}
