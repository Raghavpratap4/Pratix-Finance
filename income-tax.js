
function calculateTax() {
    const income = parseFloat(document.getElementById("income").value);
    let tax = 0;

    if (isNaN(income) || income < 0) {
        document.getElementById("result").innerText = "Please enter a valid income.";
        return;
    }

    if (income <= 250000) {
        tax = 0;
    } else if (income <= 500000) {
        tax = (income - 250000) * 0.05;
    } else if (income <= 1000000) {
        tax = 12500 + (income - 500000) * 0.20;
    } else {
        tax = 112500 + (income - 1000000) * 0.30;
    }

    const cess = tax * 0.04;
    const total = tax + cess;

    document.getElementById("result").innerHTML = `
        <p><strong>Estimated Tax:</strong> ₹${tax.toFixed(2)}</p>
        <p><strong>Health & Education Cess (4%):</strong> ₹${cess.toFixed(2)}</p>
        <p><strong>Total Tax Payable:</strong> ₹${total.toFixed(2)}</p>
    `;
}
