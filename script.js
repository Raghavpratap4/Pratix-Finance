
function calculateEMI() {
  const principal = parseFloat(document.getElementById('loanAmount').value);
  const rate = parseFloat(document.getElementById('interestRate').value) / 12 / 100;
  const tenure = parseInt(document.getElementById('loanTenure').value);

  if (!principal || !rate || !tenure) {
    document.getElementById('emiResult').innerText = "Please enter valid values.";
    return;
  }

  const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
  document.getElementById('emiResult').innerText = "EMI: ₹" + emi.toFixed(2);
}
