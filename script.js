document.getElementById('taxForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const income = parseFloat(document.getElementById('income').value) || 0;
  const ageGroup = document.getElementById('age').value;
  const deductions = parseFloat(document.getElementById('deductions').value) || 0;

  let taxableIncome = income - deductions;
  if (taxableIncome < 0) taxableIncome = 0;

  let tax = 0;
  if (ageGroup === 'below60') {
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.2;
    else tax = 112500 + (taxableIncome - 1000000) * 0.3;
  } else if (ageGroup === 'between60and80') {
    if (taxableIncome <= 300000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 300000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 10000 + (taxableIncome - 500000) * 0.2;
    else tax = 110000 + (taxableIncome - 1000000) * 0.3;
  } else if (ageGroup === 'above80') {
    if (taxableIncome <= 500000) tax = 0;
    else if (taxableIncome <= 1000000) tax = (taxableIncome - 500000) * 0.2;
    else tax = 100000 + (taxableIncome - 1000000) * 0.3;
  }

  document.getElementById('result').innerText = `Estimated Income Tax: ₹${tax.toFixed(2)}`;
});
