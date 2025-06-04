
function calculateGST() {
  const amount = parseFloat(document.getElementById('amount').value);
  const gstRate = parseFloat(document.getElementById('gstRate').value);
  const resultDiv = document.getElementById('result');

  if (isNaN(amount) || isNaN(gstRate)) {
    resultDiv.innerHTML = "<p style='color:red;'>Please enter valid numbers.</p>";
    return;
  }

  const gstAmount = (amount * gstRate) / 100;
  const total = amount + gstAmount;

  resultDiv.innerHTML = `
    <p>GST Amount: ₹${gstAmount.toFixed(2)}</p>
    <p>Total with GST: ₹${total.toFixed(2)}</p>
  `;
}
