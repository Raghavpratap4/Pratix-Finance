function calculateGST() {
  const amount = parseFloat(document.getElementById("amount").value);
  const gstRate = parseFloat(document.getElementById("gstRate").value);

  if (isNaN(amount) || isNaN(gstRate)) {
    document.getElementById("result").innerHTML = "<p>Please enter valid inputs.</p>";
    return;
  }

  const gstAmount = amount * gstRate / 100;
  const totalAmount = amount + gstAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  document.getElementById("result").innerHTML = `
    <p><strong>GST Amount:</strong> ₹${gstAmount.toFixed(2)}</p>
    <p><strong>CGST (50%):</strong> ₹${cgst.toFixed(2)}</p>
    <p><strong>SGST (50%):</strong> ₹${sgst.toFixed(2)}</p>
    <p><strong>Total Amount (incl. GST):</strong> ₹${totalAmount.toFixed(2)}</p>
  `;
}