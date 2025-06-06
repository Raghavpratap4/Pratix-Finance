
document.getElementById("emi-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value);
    const tenure = parseFloat(document.getElementById("tenure").value);

    const monthlyRate = interestRate / 12 / 100;
    const numPayments = tenure * 12;

    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = emi * numPayments;
    const totalInterest = totalPayment - loanAmount;

    document.getElementById("emiValue").textContent = emi.toFixed(2);
    document.getElementById("totalInterestValue").textContent = totalInterest.toFixed(2);
    document.getElementById("totalPaymentValue").textContent = totalPayment.toFixed(2);

    const ctx = document.getElementById("emiChart").getContext("2d");
    if (window.emiChart) {
        window.emiChart.destroy();
    }
    window.emiChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal Amount", "Total Interest"],
            datasets: [{
                data: [loanAmount, totalInterest],
                backgroundColor: ["#4CAF50", "#FF5722"],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
});
