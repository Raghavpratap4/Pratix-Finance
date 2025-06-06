
document.getElementById("emi-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100 / 12;
    const loanTenure = parseInt(document.getElementById("loanTenure").value) * 12;

    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTenure)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    const emi = (loanAmount * interestRate * Math.pow(1 + interestRate, loanTenure)) /
                (Math.pow(1 + interestRate, loanTenure) - 1);
    const totalPayment = emi * loanTenure;
    const totalInterest = totalPayment - loanAmount;

    document.getElementById("emi-result").innerHTML = `
        <h3>EMI Result</h3>
        <p><strong>Monthly EMI:</strong> ₹${emi.toFixed(2)}</p>
        <p><strong>Total Interest:</strong> ₹${totalInterest.toFixed(2)}</p>
        <p><strong>Total Payment:</strong> ₹${totalPayment.toFixed(2)}</p>
        <canvas id="emiChart" width="400" height="300"></canvas>
    `;

    setTimeout(() => {
        const ctx = document.getElementById("emiChart").getContext("2d");
        if (window.emiChart) window.emiChart.destroy();

        window.emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [loanAmount, totalInterest],
                    backgroundColor: ['#2196f3', '#ff9800']
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
});
