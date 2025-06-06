
function calculateEMI() {
    const loan = parseFloat(document.getElementById("loanAmount").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value);
    const tenureYears = parseFloat(document.getElementById("loanTenure").value);

    if (isNaN(loan) || isNaN(interestRate) || isNaN(tenureYears)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const interest = interestRate / 100 / 12;
    const tenure = tenureYears * 12;

    const emi = loan * interest * Math.pow(1 + interest, tenure) / (Math.pow(1 + interest, tenure) - 1);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - loan;

    document.getElementById("results").style.display = "block";
    document.getElementById("emiResult").innerText = "EMI: ₹" + emi.toFixed(2);
    document.getElementById("totalInterest").innerText = "Total Interest: ₹" + totalInterest.toFixed(2);
    document.getElementById("totalPayment").innerText = "Total Payment: ₹" + totalPayment.toFixed(2);

    setTimeout(() => {
        const ctx = document.getElementById("emiChart").getContext("2d");
        if (window.emiChart) window.emiChart.destroy();
        window.emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["Principal", "Interest"],
                datasets: [{
                    data: [loan, totalInterest],
                    backgroundColor: ["#00bcd4", "#ff5722"],
                    hoverOffset: 10
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
    }, 100);
}
