function calculateEMI() {
  const loan = parseFloat(document.getElementById('loan').value);
  const annualRate = parseFloat(document.getElementById('interest').value);
  const months = parseInt(document.getElementById('tenure').value);
  const rate = annualRate / 12 / 100;

  const emi = loan * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
  document.getElementById('emi-result').innerText = 'Monthly EMI: ₹' + emi.toFixed(2);
}