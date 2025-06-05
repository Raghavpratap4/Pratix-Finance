
function calculateSIP() {
  const monthly = parseFloat(document.getElementById('monthly').value);
  const rate = parseFloat(document.getElementById('rate').value) / 100 / 12;
  const years = parseInt(document.getElementById('years').value);
  const months = years * 12;

  if (isNaN(monthly) || isNaN(rate) || isNaN(years)) {
    document.getElementById('result').innerText = "Please fill in all fields.";
    return;
  }

  const futureValue = monthly * ((Math.pow(1 + rate, months) - 1) * (1 + rate)) / rate;
  const invested = monthly * months;
  const gain = futureValue - invested;

  document.getElementById('result').innerHTML = `
    Invested Amount: ₹${invested.toFixed(2)}<br />
    Estimated Returns: ₹${gain.toFixed(2)}<br />
    Future Value: ₹${futureValue.toFixed(2)}
  `;
}
