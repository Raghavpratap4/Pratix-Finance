function calculateSIP() {
  const P = parseFloat(document.getElementById("monthlyInvestment").value);
  const r = parseFloat(document.getElementById("annualReturn").value) / 12 / 100;
  const n = parseFloat(document.getElementById("years").value) * 12;

  if (isNaN(P) || isNaN(r) || isNaN(n)) {
    document.getElementById("result").innerHTML = "<p>Please enter valid values.</p>";
    return;
  }

  const totalInvested = P * n;
  const futureValue = P * ((Math.pow(1 + r, n) - 1) * (1 + r)) / r;
  const gain = futureValue - totalInvested;

  document.getElementById("result").innerHTML = `
    <p>Total Invested: ₹${totalInvested.toFixed(2)}</p>
    <p>Estimated Returns: ₹${gain.toFixed(2)}</p>
    <p>Total Value: ₹${futureValue.toFixed(2)}</p>
  `;
}
