
// SIP Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetTab) {
        navItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const activeNavItem = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        const activeTabContent = document.getElementById(targetTab);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Navigation functions
    window.goBack = function() {
        window.history.back();
    };

    window.goToHome = function() {
        window.location.href = 'index.html';
    };

    // SIP Calculator functionality
    let sipChart = null;
    let goalChart = null;
    let sipComparisonChart = null;

    // Initialize SIP Calculator with empty inputs
    function initSIPCalculator() {
        const monthlyAmountSlider = document.getElementById('monthlyAmountSlider');
        const monthlyAmountInput = document.getElementById('monthlyAmountInput');
        const monthlyAmountDisplay = document.getElementById('monthlyAmountDisplay');

        const returnRateSlider = document.getElementById('returnRateSlider');
        const returnRateInput = document.getElementById('returnRateInput');
        const returnRateDisplay = document.getElementById('returnRateDisplay');

        const investmentPeriodSlider = document.getElementById('investmentPeriodSlider');
        const investmentPeriodInput = document.getElementById('investmentPeriodInput');
        const investmentPeriodDisplay = document.getElementById('investmentPeriodDisplay');

        const calculateBtn = document.getElementById('calculateSIP');
        const refreshBtn = document.getElementById('refreshSIP');
        const chartTypeSelector = document.getElementById('sipChartType');

        // Keep inputs empty on load
        resetSIPInputs();

        // SIP Type radio buttons
        const sipTypeRadios = document.querySelectorAll('input[name="sipType"]');
        const stepUpGroup = document.getElementById('stepUpGroup');

        sipTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'stepup') {
                    stepUpGroup.style.display = 'block';
                } else {
                    stepUpGroup.style.display = 'none';
                }
                if (hasValidInputs()) calculateSIP();
            });
        });

        // Input validation and real-time updates
        if (monthlyAmountInput) {
            monthlyAmountInput.addEventListener('input', function() {
                if (this.value && hasValidInputs()) {
                    calculateSIP();
                }
            });
        }

        if (returnRateInput) {
            returnRateInput.addEventListener('input', function() {
                if (this.value && hasValidInputs()) {
                    calculateSIP();
                }
            });
        }

        if (investmentPeriodInput) {
            investmentPeriodInput.addEventListener('input', function() {
                if (this.value && hasValidInputs()) {
                    calculateSIP();
                }
            });
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                calculateSIP();
                showNotification('SIP calculated successfully!', 'success');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetSIPInputs();
                showNotification('SIP calculator refreshed!', 'info');
            });
        }

        // Chart type selector
        if (chartTypeSelector) {
            chartTypeSelector.addEventListener('change', function() {
                if (hasValidInputs()) {
                    calculateSIP();
                }
            });
        }

        // PDF download
        const downloadPDFBtn = document.getElementById('downloadSIPPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', generateSIPPDF);
        }

        // Initialize empty chart
        initSIPChart();
    }

    function resetSIPInputs() {
        const monthlyAmountInput = document.getElementById('monthlyAmountInput');
        const returnRateInput = document.getElementById('returnRateInput');
        const investmentPeriodInput = document.getElementById('investmentPeriodInput');

        if (monthlyAmountInput) {
            monthlyAmountInput.value = '';
        }

        if (returnRateInput) {
            returnRateInput.value = '';
        }

        if (investmentPeriodInput) {
            investmentPeriodInput.value = '';
        }

        // Hide results
        const resultsCard = document.getElementById('sipResults');
        if (resultsCard) {
            resultsCard.style.display = 'none';
        }

        // Reset chart
        if (sipChart) {
            sipChart.destroy();
            sipChart = null;
            initSIPChart();
        }
    }

    function hasValidInputs() {
        const monthlyAmount = document.getElementById('monthlyAmountInput')?.value;
        const returnRate = document.getElementById('returnRateInput')?.value;
        const period = document.getElementById('investmentPeriodInput')?.value;
        
        return monthlyAmount && returnRate && period;
    }

    function calculateSIP() {
        const monthlyAmount = parseInt(document.getElementById('monthlyAmountInput')?.value);
        const annualReturn = parseFloat(document.getElementById('returnRateInput')?.value);
        const years = parseInt(document.getElementById('investmentPeriodInput')?.value);
        const sipType = document.querySelector('input[name="sipType"]:checked')?.value || 'regular';
        const stepUpRate = parseFloat(document.getElementById('stepUpRate')?.value) || 10;

        if (!monthlyAmount || !annualReturn || !years) {
            return;
        }

        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;

        let totalInvestment = 0;
        let maturityValue = 0;

        if (sipType === 'regular') {
            totalInvestment = monthlyAmount * totalMonths;
            maturityValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
        } else {
            let currentAmount = monthlyAmount;
            let currentValue = 0;

            for (let year = 1; year <= years; year++) {
                const monthsInYear = 12;
                const yearInvestment = currentAmount * monthsInYear;
                totalInvestment += yearInvestment;

                const remainingMonths = (years - year) * 12 + 12;
                const yearMaturityValue = currentAmount * ((Math.pow(1 + monthlyReturn, monthsInYear) - 1) / monthlyReturn) * Math.pow(1 + monthlyReturn, remainingMonths - monthsInYear);
                currentValue += yearMaturityValue;

                if (year < years) {
                    currentAmount = currentAmount * (1 + stepUpRate / 100);
                }
            }
            maturityValue = currentValue;
        }

        const totalReturns = maturityValue - totalInvestment;

        // Update display
        const totalInvestmentElement = document.getElementById('totalInvestment');
        const totalReturnsElement = document.getElementById('totalReturns');
        const maturityValueElement = document.getElementById('maturityValue');
        const resultsCard = document.getElementById('sipResults');

        if (totalInvestmentElement) {
            totalInvestmentElement.textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        }
        if (totalReturnsElement) {
            totalReturnsElement.textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;
        }
        if (maturityValueElement) {
            maturityValueElement.textContent = `₹${Math.round(maturityValue).toLocaleString('en-IN')}`;
        }
        if (resultsCard) {
            resultsCard.style.display = 'block';
        }

        // Update chart
        updateSIPChart(totalInvestment, totalReturns);
    }

    function initSIPChart() {
        const ctx = document.getElementById('sipChart');
        if (!ctx) return;

        sipChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Total Investment', 'Returns Generated'],
                datasets: [{
                    data: [1, 1],
                    backgroundColor: [
                        'rgba(49, 65, 127, 0.8)',
                        'rgba(240, 147, 251, 0.8)'
                    ],
                    borderColor: [
                        'rgba(49, 65, 127, 1)',
                        'rgba(240, 147, 251, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderRadius: 8
                    }
                },
                cutout: '60%'
            }
        });
    }

    function updateSIPChart(investment, returns) {
        const chartType = document.getElementById('sipChartType')?.value || 'doughnut';
        
        if (sipChart) {
            sipChart.destroy();
        }

        const ctx = document.getElementById('sipChart');
        if (!ctx) return;

        if (chartType === 'doughnut') {
            sipChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Total Investment', 'Returns Generated'],
                    datasets: [{
                        data: [Math.round(investment), Math.round(returns)],
                        backgroundColor: [
                            'rgba(49, 65, 127, 0.8)',
                            'rgba(240, 147, 251, 0.8)'
                        ],
                        borderColor: [
                            'rgba(49, 65, 127, 1)',
                            'rgba(240, 147, 251, 1)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1
                        }
                    },
                    cutout: '60%'
                }
            });
        } else if (chartType === 'bar') {
            sipChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total Investment', 'Returns Generated'],
                    datasets: [{
                        data: [Math.round(investment), Math.round(returns)],
                        backgroundColor: [
                            'rgba(49, 65, 127, 0.8)',
                            'rgba(240, 147, 251, 0.8)'
                        ],
                        borderColor: [
                            'rgba(49, 65, 127, 1)',
                            'rgba(240, 147, 251, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'line') {
            const years = parseInt(document.getElementById('investmentPeriodInput')?.value) || 10;
            const monthlyAmount = parseInt(document.getElementById('monthlyAmountInput')?.value) || 5000;
            const annualReturn = parseFloat(document.getElementById('returnRateInput')?.value) || 12;
            
            const yearlyData = [];
            for (let year = 1; year <= years; year++) {
                const yearlyInvestment = monthlyAmount * 12 * year;
                const yearlyMaturity = calculateMaturityForYear(monthlyAmount, annualReturn, year);
                yearlyData.push({
                    year: year,
                    investment: yearlyInvestment,
                    maturity: yearlyMaturity
                });
            }

            sipChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Total Investment',
                            data: yearlyData.map(d => d.investment),
                            borderColor: 'rgba(49, 65, 127, 1)',
                            backgroundColor: 'rgba(49, 65, 127, 0.1)',
                            fill: true
                        },
                        {
                            label: 'Expected Value',
                            data: yearlyData.map(d => d.maturity),
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.1)',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: 'white' }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    function calculateMaturityForYear(monthlyAmount, annualReturn, years) {
        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;
        return monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
    }

    // Goal Based Planning
    function initGoalPlanning() {
        const calculateGoalBtn = document.getElementById('calculateGoal');
        const refreshGoalBtn = document.getElementById('refreshGoal');
        const chartTypeSelector = document.getElementById('goalChartType');
        const downloadPDFBtn = document.getElementById('downloadGoalPDF');

        if (calculateGoalBtn) {
            calculateGoalBtn.addEventListener('click', function() {
                calculateGoalBasedSIP();
                showNotification('Goal planning calculated!', 'success');
            });
        }

        if (refreshGoalBtn) {
            refreshGoalBtn.addEventListener('click', function() {
                resetGoalInputs();
                showNotification('Goal planning refreshed!', 'info');
            });
        }

        if (chartTypeSelector) {
            chartTypeSelector.addEventListener('change', function() {
                if (document.getElementById('goalResult').style.display !== 'none') {
                    calculateGoalBasedSIP();
                }
            });
        }

        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', generateGoalPDF);
        }
    }

    function resetGoalInputs() {
        document.getElementById('goalType').value = '';
        document.getElementById('targetAmount').value = '';
        document.getElementById('goalYears').value = '';
        document.getElementById('goalReturnRate').value = '';
        document.getElementById('goalResult').style.display = 'none';
        
        if (goalChart) {
            goalChart.destroy();
            goalChart = null;
        }
    }

    function calculateGoalBasedSIP() {
        const targetAmount = parseInt(document.getElementById('targetAmount')?.value);
        const years = parseInt(document.getElementById('goalYears')?.value);
        const annualReturn = parseFloat(document.getElementById('goalReturnRate')?.value);

        if (!targetAmount || !years || !annualReturn) {
            showNotification('Please fill all goal details', 'error');
            return;
        }

        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;

        const requiredSIP = (targetAmount * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
        const totalInvestment = requiredSIP * totalMonths;
        const totalReturns = targetAmount - totalInvestment;

        document.getElementById('requiredSIP').textContent = `₹${Math.round(requiredSIP).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;

        document.getElementById('goalResult').style.display = 'block';
        updateGoalChart(totalInvestment, totalReturns, years);
    }

    function updateGoalChart(investment, returns, years) {
        const chartType = document.getElementById('goalChartType')?.value || 'line';
        
        if (goalChart) {
            goalChart.destroy();
        }

        const ctx = document.getElementById('goalChart');
        if (!ctx) return;

        const yearlyData = [];
        const yearlyInvestment = investment / years;

        for (let i = 1; i <= years; i++) {
            yearlyData.push({
                year: i,
                investment: yearlyInvestment * i,
                maturity: (investment / years) * i * Math.pow(1.12, i)
            });
        }

        if (chartType === 'line') {
            goalChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Total Investment',
                            data: yearlyData.map(d => d.investment),
                            borderColor: 'rgba(49, 65, 127, 1)',
                            backgroundColor: 'rgba(49, 65, 127, 0.1)',
                            fill: true
                        },
                        {
                            label: 'Expected Value',
                            data: yearlyData.map(d => d.maturity),
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.1)',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'bar') {
            goalChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Total Investment',
                            data: yearlyData.map(d => d.investment),
                            backgroundColor: 'rgba(49, 65, 127, 0.8)',
                            borderColor: 'rgba(49, 65, 127, 1)',
                            borderWidth: 2
                        },
                        {
                            label: 'Expected Value',
                            data: yearlyData.map(d => d.maturity),
                            backgroundColor: 'rgba(240, 147, 251, 0.8)',
                            borderColor: 'rgba(240, 147, 251, 1)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'area') {
            goalChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Investment Growth',
                            data: yearlyData.map(d => d.maturity),
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.2)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    // SIP Comparison
    function initSIPComparison() {
        const sipCountSelector = document.getElementById('sipCount');
        const compareSIPsBtn = document.getElementById('compareSIPs');
        const refreshComparisonBtn = document.getElementById('refreshComparison');
        const chartTypeSelector = document.getElementById('comparisonChartType');
        const downloadPDFBtn = document.getElementById('downloadComparisonPDF');

        if (sipCountSelector) {
            sipCountSelector.addEventListener('change', function() {
                generateComparisonInputs(parseInt(this.value));
            });
        }

        if (compareSIPsBtn) {
            compareSIPsBtn.addEventListener('click', function() {
                compareSIPOptions();
                showNotification('SIPs compared successfully!', 'success');
            });
        }

        if (refreshComparisonBtn) {
            refreshComparisonBtn.addEventListener('click', function() {
                resetComparisonInputs();
                showNotification('SIP comparison refreshed!', 'info');
            });
        }

        if (chartTypeSelector) {
            chartTypeSelector.addEventListener('change', function() {
                if (document.getElementById('comparisonResults').style.display !== 'none') {
                    // Recalculate to update chart
                    compareSIPOptions();
                }
            });
        }

        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', generateComparisonPDF);
        }
    }

    function resetComparisonInputs() {
        document.getElementById('sipCount').value = '';
        document.getElementById('comparisonInputs').innerHTML = '';
        document.getElementById('comparisonResults').style.display = 'none';
        
        if (sipComparisonChart) {
            sipComparisonChart.destroy();
            sipComparisonChart = null;
        }
    }

    function generateComparisonInputs(count) {
        const container = document.getElementById('comparisonInputs');
        if (!container || !count) return;

        let html = '';
        for (let i = 1; i <= count; i++) {
            html += `
                <div class="comparison-card">
                    <h4>SIP Option ${i}</h4>
                    <div class="input-group">
                        <label>Monthly Amount</label>
                        <div class="input-wrapper">
                            <span class="currency">₹</span>
                            <input type="number" id="sip${i}Amount" placeholder="5,000" class="calc-input">
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Expected Return (%)</label>
                        <input type="number" id="sip${i}Return" placeholder="12" class="calc-input" step="0.5">
                    </div>
                    <div class="input-group">
                        <label>Period (Years)</label>
                        <input type="number" id="sip${i}Period" placeholder="10" class="calc-input">
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    function compareSIPOptions() {
        const sipCount = parseInt(document.getElementById('sipCount')?.value);
        if (!sipCount) {
            showNotification('Please select number of SIPs to compare', 'error');
            return;
        }

        const sipData = [];
        let allInputsValid = true;

        for (let i = 1; i <= sipCount; i++) {
            const amount = parseInt(document.getElementById(`sip${i}Amount`)?.value);
            const returnRate = parseFloat(document.getElementById(`sip${i}Return`)?.value);
            const period = parseInt(document.getElementById(`sip${i}Period`)?.value);

            if (!amount || !returnRate || !period) {
                allInputsValid = false;
                break;
            }

            // Calculate SIP
            const monthlyReturn = returnRate / 12 / 100;
            const totalMonths = period * 12;
            const investment = amount * totalMonths;
            const maturity = amount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
            const returns = maturity - investment;

            sipData.push({
                option: i,
                monthlyAmount: amount,
                investment: investment,
                maturity: maturity,
                returns: returns
            });
        }

        if (!allInputsValid) {
            showNotification('Please fill all SIP details', 'error');
            return;
        }

        // Update comparison table
        const tableBody = document.getElementById('comparisonTableBody');
        if (tableBody) {
            let tableHTML = '';
            sipData.forEach(sip => {
                tableHTML += `
                    <tr>
                        <td>SIP Option ${sip.option}</td>
                        <td>₹${sip.monthlyAmount.toLocaleString('en-IN')}</td>
                        <td>₹${Math.round(sip.investment).toLocaleString('en-IN')}</td>
                        <td>₹${Math.round(sip.maturity).toLocaleString('en-IN')}</td>
                        <td>₹${Math.round(sip.returns).toLocaleString('en-IN')}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = tableHTML;
        }

        document.getElementById('comparisonResults').style.display = 'block';
        updateSIPComparisonChart(sipData);
    }

    function updateSIPComparisonChart(sipData) {
        const chartType = document.getElementById('comparisonChartType')?.value || 'bar';
        
        if (sipComparisonChart) {
            sipComparisonChart.destroy();
        }

        const ctx = document.getElementById('sipComparisonChart');
        if (!ctx) return;

        const labels = sipData.map(sip => `SIP ${sip.option}`);
        const maturityValues = sipData.map(sip => sip.maturity);
        const colors = ['rgba(49, 65, 127, 0.8)', 'rgba(240, 147, 251, 0.8)', 'rgba(0, 255, 136, 0.8)', 'rgba(255, 0, 128, 0.8)'];

        if (chartType === 'bar') {
            sipComparisonChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Maturity Value',
                        data: maturityValues,
                        backgroundColor: colors.slice(0, sipData.length),
                        borderColor: colors.slice(0, sipData.length).map(color => color.replace('0.8', '1')),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'line') {
            sipComparisonChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Maturity Value',
                        data: maturityValues,
                        borderColor: 'rgba(0, 255, 136, 1)',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'radar') {
            // Normalize data for radar chart
            const maxValue = Math.max(...maturityValues);
            const normalizedData = maturityValues.map(value => (value / maxValue) * 100);

            sipComparisonChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Performance',
                        data: normalizedData,
                        borderColor: 'rgba(0, 255, 136, 1)',
                        backgroundColor: 'rgba(0, 255, 136, 0.2)',
                        pointBackgroundColor: 'rgba(0, 255, 136, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(0, 255, 136, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: 'white' },
                            ticks: { color: 'white', backdropColor: 'transparent' }
                        }
                    }
                }
            });
        }
    }

    // PDF Generation Functions
    function generateSIPPDF() {
        if (typeof jsPDF === 'undefined') {
            showNotification('PDF library not loaded', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 100, 200);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SIP Calculator Report', 20, 35);

        // Input Data
        doc.setFontSize(12);
        doc.text('Input Parameters:', 20, 55);
        
        const monthlyAmount = document.getElementById('monthlyAmountInput')?.value || '0';
        const returnRate = document.getElementById('returnRateInput')?.value || '0';
        const period = document.getElementById('investmentPeriodInput')?.value || '0';
        
        doc.text(`Monthly Investment: ₹${parseInt(monthlyAmount).toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Expected Return: ${returnRate}%`, 20, 85);
        doc.text(`Investment Period: ${period} years`, 20, 100);

        // Results
        doc.text('Calculated Results:', 20, 120);
        
        const totalInvestment = document.getElementById('totalInvestment')?.textContent || '₹0';
        const totalReturns = document.getElementById('totalReturns')?.textContent || '₹0';
        const maturityValue = document.getElementById('maturityValue')?.textContent || '₹0';
        
        doc.text(`Total Investment: ${totalInvestment}`, 20, 135);
        doc.text(`Total Returns: ${totalReturns}`, 20, 150);
        doc.text(`Maturity Value: ${maturityValue}`, 20, 165);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('SIP_Calculator_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    function generateGoalPDF() {
        if (typeof jsPDF === 'undefined') {
            showNotification('PDF library not loaded', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 100, 200);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SIP Calculator - Goal Based Planning', 20, 35);

        // Input Data
        doc.setFontSize(12);
        doc.text('Goal Parameters:', 20, 55);
        
        const targetAmount = document.getElementById('targetAmount')?.value || '0';
        const goalYears = document.getElementById('goalYears')?.value || '0';
        const goalReturn = document.getElementById('goalReturnRate')?.value || '0';
        
        doc.text(`Target Amount: ₹${parseInt(targetAmount).toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Time Period: ${goalYears} years`, 20, 85);
        doc.text(`Expected Return: ${goalReturn}%`, 20, 100);

        // Results
        doc.text('Required Investment:', 20, 120);
        
        const requiredSIP = document.getElementById('requiredSIP')?.textContent || '₹0';
        const goalTotalInvestment = document.getElementById('goalTotalInvestment')?.textContent || '₹0';
        const goalTotalReturns = document.getElementById('goalTotalReturns')?.textContent || '₹0';
        
        doc.text(`Required Monthly SIP: ${requiredSIP}`, 20, 135);
        doc.text(`Total Investment: ${goalTotalInvestment}`, 20, 150);
        doc.text(`Total Returns: ${goalTotalReturns}`, 20, 165);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('SIP_Goal_Planning_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    function generateComparisonPDF() {
        if (typeof jsPDF === 'undefined') {
            showNotification('PDF library not loaded', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 100, 200);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SIP Calculator - SIP Comparison', 20, 35);

        // Comparison Results
        doc.setFontSize(12);
        doc.text('SIP Comparison Results:', 20, 55);

        const tableRows = document.querySelectorAll('#comparisonTableBody tr');
        let yPosition = 70;
        
        tableRows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 5) {
                doc.text(`${cells[0].textContent}: Monthly ${cells[1].textContent}, Maturity ${cells[3].textContent}`, 20, yPosition);
                yPosition += 15;
            }
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('SIP_Comparison_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 6rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 1rem 1.5rem;
            color: white;
            z-index: 1000;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideInDown 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.borderColor = '#00ff88';
            notification.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.2)';
        } else if (type === 'error') {
            notification.style.borderColor = '#ff4757';
            notification.style.boxShadow = '0 8px 32px rgba(255, 71, 87, 0.2)';
        } else if (type === 'info') {
            notification.style.borderColor = '#00d4ff';
            notification.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.2)';
        }

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: 1rem;">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutUp 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Investment Analysis
    let analysisChart = null;

    function initInvestmentAnalysis() {
        const calculateAnalysisBtn = document.getElementById('calculateAnalysis');
        const refreshAnalysisBtn = document.getElementById('refreshAnalysis');
        const chartTypeSelector = document.getElementById('analysisChartType');
        const downloadPDFBtn = document.getElementById('downloadAnalysisPDF');

        if (calculateAnalysisBtn) {
            calculateAnalysisBtn.addEventListener('click', function() {
                calculateInvestmentAnalysis();
                showNotification('Investment analysis calculated!', 'success');
            });
        }

        if (refreshAnalysisBtn) {
            refreshAnalysisBtn.addEventListener('click', function() {
                resetAnalysisInputs();
                showNotification('Investment analysis refreshed!', 'info');
            });
        }

        if (chartTypeSelector) {
            chartTypeSelector.addEventListener('change', function() {
                if (document.getElementById('analysisResults').style.display !== 'none') {
                    calculateInvestmentAnalysis();
                }
            });
        }

        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', generateAnalysisPDF);
        }
    }

    function resetAnalysisInputs() {
        document.getElementById('analysisMonthlyAmount').value = '';
        document.getElementById('analysisReturnRate').value = '';
        document.getElementById('analysisPeriod').value = '';
        document.getElementById('inflationRate').value = '';
        document.getElementById('analysisResults').style.display = 'none';
        
        if (analysisChart) {
            analysisChart.destroy();
            analysisChart = null;
        }
    }

    function calculateInvestmentAnalysis() {
        const monthlyAmount = parseInt(document.getElementById('analysisMonthlyAmount')?.value);
        const annualReturn = parseFloat(document.getElementById('analysisReturnRate')?.value);
        const years = parseInt(document.getElementById('analysisPeriod')?.value);
        const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

        if (!monthlyAmount || !annualReturn || !years) {
            showNotification('Please fill all analysis details', 'error');
            return;
        }

        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;
        const totalInvestment = monthlyAmount * totalMonths;
        const nominalValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
        
        // Real value calculation (inflation adjusted)
        const realValue = nominalValue / Math.pow(1 + inflationRate / 100, years);
        const realReturns = realValue - totalInvestment;

        // Update display
        document.getElementById('nominalValue').textContent = `₹${Math.round(nominalValue).toLocaleString('en-IN')}`;
        document.getElementById('realValue').textContent = `₹${Math.round(realValue).toLocaleString('en-IN')}`;
        document.getElementById('analysisTotalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('realReturns').textContent = `₹${Math.round(realReturns).toLocaleString('en-IN')}`;

        document.getElementById('analysisResults').style.display = 'block';
        updateAnalysisChart(totalInvestment, nominalValue, realValue, years);
    }

    function updateAnalysisChart(investment, nominalValue, realValue, years) {
        const chartType = document.getElementById('analysisChartType')?.value || 'line';
        
        if (analysisChart) {
            analysisChart.destroy();
        }

        const ctx = document.getElementById('analysisChart');
        if (!ctx) return;

        const yearlyData = [];
        const monthlyAmount = parseInt(document.getElementById('analysisMonthlyAmount')?.value);
        const annualReturn = parseFloat(document.getElementById('analysisReturnRate')?.value);
        const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

        for (let year = 1; year <= years; year++) {
            const yearlyInvestment = monthlyAmount * 12 * year;
            const yearlyNominal = calculateMaturityForYear(monthlyAmount, annualReturn, year);
            const yearlyReal = yearlyNominal / Math.pow(1 + inflationRate / 100, year);
            
            yearlyData.push({
                year: year,
                investment: yearlyInvestment,
                nominal: yearlyNominal,
                real: yearlyReal
            });
        }

        if (chartType === 'line') {
            analysisChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Total Investment',
                            data: yearlyData.map(d => d.investment),
                            borderColor: 'rgba(49, 65, 127, 1)',
                            backgroundColor: 'rgba(49, 65, 127, 0.1)',
                            fill: false
                        },
                        {
                            label: 'Nominal Value',
                            data: yearlyData.map(d => d.nominal),
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.1)',
                            fill: false
                        },
                        {
                            label: 'Real Value (Inflation Adjusted)',
                            data: yearlyData.map(d => d.real),
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'bar') {
            analysisChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Investment', 'Nominal Value', 'Real Value'],
                    datasets: [{
                        data: [investment, nominalValue, realValue],
                        backgroundColor: [
                            'rgba(49, 65, 127, 0.8)',
                            'rgba(240, 147, 251, 0.8)',
                            'rgba(0, 255, 136, 0.8)'
                        ],
                        borderColor: [
                            'rgba(49, 65, 127, 1)',
                            'rgba(240, 147, 251, 1)',
                            'rgba(0, 255, 136, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'area') {
            analysisChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Nominal Growth',
                            data: yearlyData.map(d => d.nominal),
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.3)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Real Growth',
                            data: yearlyData.map(d => d.real),
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.3)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    // Lumpsum vs SIP Comparison
    let lumpsumChart = null;

    function initLumpsumComparison() {
        const compareInvestmentBtn = document.getElementById('compareInvestment');
        const refreshComparisonBtn = document.getElementById('refreshComparison2');
        const chartTypeSelector = document.getElementById('lumpsumChartType');
        const downloadPDFBtn = document.getElementById('downloadLumpsumPDF');

        if (compareInvestmentBtn) {
            compareInvestmentBtn.addEventListener('click', function() {
                calculateLumpsumComparison();
                showNotification('Investment comparison calculated!', 'success');
            });
        }

        if (refreshComparisonBtn) {
            refreshComparisonBtn.addEventListener('click', function() {
                resetLumpsumInputs();
                showNotification('Comparison refreshed!', 'info');
            });
        }

        if (chartTypeSelector) {
            chartTypeSelector.addEventListener('change', function() {
                if (document.getElementById('lumpsumResults').style.display !== 'none') {
                    calculateLumpsumComparison();
                }
            });
        }

        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', generateLumpsumPDF);
        }
    }

    function resetLumpsumInputs() {
        document.getElementById('investmentAmount').value = '';
        document.getElementById('alternativeSIP').value = '';
        document.getElementById('comparisonReturnRate').value = '';
        document.getElementById('comparisonPeriod').value = '';
        document.getElementById('lumpsumResults').style.display = 'none';
        
        if (lumpsumChart) {
            lumpsumChart.destroy();
            lumpsumChart = null;
        }
    }

    function calculateLumpsumComparison() {
        const lumpsumAmount = parseInt(document.getElementById('investmentAmount')?.value);
        const sipAmount = parseInt(document.getElementById('alternativeSIP')?.value);
        const annualReturn = parseFloat(document.getElementById('comparisonReturnRate')?.value);
        const years = parseInt(document.getElementById('comparisonPeriod')?.value);

        if (!lumpsumAmount || !sipAmount || !annualReturn || !years) {
            showNotification('Please fill all comparison details', 'error');
            return;
        }

        // Lumpsum calculation
        const lumpsumFinal = lumpsumAmount * Math.pow(1 + annualReturn / 100, years);
        const lumpsumReturns = lumpsumFinal - lumpsumAmount;

        // SIP calculation
        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;
        const sipTotalInvested = sipAmount * totalMonths;
        const sipFinalValue = sipAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
        const sipTotalReturns = sipFinalValue - sipTotalInvested;

        // Update display
        document.getElementById('lumpsumInitial').textContent = `₹${lumpsumAmount.toLocaleString('en-IN')}`;
        document.getElementById('lumpsumFinal').textContent = `₹${Math.round(lumpsumFinal).toLocaleString('en-IN')}`;
        document.getElementById('lumpsumReturns').textContent = `₹${Math.round(lumpsumReturns).toLocaleString('en-IN')}`;
        
        document.getElementById('sipTotalInvested').textContent = `₹${sipTotalInvested.toLocaleString('en-IN')}`;
        document.getElementById('sipFinalValue').textContent = `₹${Math.round(sipFinalValue).toLocaleString('en-IN')}`;
        document.getElementById('sipTotalReturns').textContent = `₹${Math.round(sipTotalReturns).toLocaleString('en-IN')}`;

        // Recommendation
        const recommendation = lumpsumFinal > sipFinalValue 
            ? `Lumpsum investment generates ₹${Math.round(lumpsumFinal - sipFinalValue).toLocaleString('en-IN')} more wealth`
            : `SIP investment generates ₹${Math.round(sipFinalValue - lumpsumFinal).toLocaleString('en-IN')} more wealth`;
        
        document.getElementById('investmentRecommendation').textContent = recommendation;

        document.getElementById('lumpsumResults').style.display = 'block';
        updateLumpsumChart(lumpsumAmount, lumpsumFinal, sipTotalInvested, sipFinalValue, years);
    }

    function updateLumpsumChart(lumpsumInitial, lumpsumFinal, sipInvested, sipFinal, years) {
        const chartType = document.getElementById('lumpsumChartType')?.value || 'line';
        
        if (lumpsumChart) {
            lumpsumChart.destroy();
        }

        const ctx = document.getElementById('lumpsumChart');
        if (!ctx) return;

        if (chartType === 'line') {
            const yearlyData = [];
            const annualReturn = parseFloat(document.getElementById('comparisonReturnRate')?.value);
            const sipAmount = parseInt(document.getElementById('alternativeSIP')?.value);

            for (let year = 1; year <= years; year++) {
                const lumpsumValue = lumpsumInitial * Math.pow(1 + annualReturn / 100, year);
                const sipValue = calculateMaturityForYear(sipAmount, annualReturn, year);
                
                yearlyData.push({
                    year: year,
                    lumpsum: lumpsumValue,
                    sip: sipValue
                });
            }

            lumpsumChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: yearlyData.map(d => `Year ${d.year}`),
                    datasets: [
                        {
                            label: 'Lumpsum Growth',
                            data: yearlyData.map(d => d.lumpsum),
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.1)',
                            fill: false
                        },
                        {
                            label: 'SIP Growth',
                            data: yearlyData.map(d => d.sip),
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'bar') {
            lumpsumChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Lumpsum Investment', 'SIP Investment'],
                    datasets: [
                        {
                            label: 'Final Value',
                            data: [lumpsumFinal, sipFinal],
                            backgroundColor: [
                                'rgba(240, 147, 251, 0.8)',
                                'rgba(0, 255, 136, 0.8)'
                            ],
                            borderColor: [
                                'rgba(240, 147, 251, 1)',
                                'rgba(0, 255, 136, 1)'
                            ],
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        } else if (chartType === 'area') {
            lumpsumChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Initial', 'Final Value'],
                    datasets: [
                        {
                            label: 'Lumpsum',
                            data: [lumpsumInitial, lumpsumFinal],
                            borderColor: 'rgba(240, 147, 251, 1)',
                            backgroundColor: 'rgba(240, 147, 251, 0.3)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'SIP',
                            data: [0, sipFinal],
                            borderColor: 'rgba(0, 255, 136, 1)',
                            backgroundColor: 'rgba(0, 255, 136, 0.3)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: 'white' } }
                    },
                    scales: {
                        x: {
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            ticks: {
                                color: 'white',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(0) + 'L';
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    // Navigation functions for Tools tab
    window.goToEmiCalculator = function() {
        window.location.href = 'emi-calculator.html';
    };

    window.goToGstCalculator = function() {
        window.location.href = 'gst-calculator.html';
    };

    window.goToFdCalculator = function() {
        window.location.href = 'fd-calculator.html';
    };

    window.goToTaxCalculator = function() {
        window.location.href = 'tax-calculator.html';
    };

    // PDF Generation Functions
    function generateAnalysisPDF() {
        if (typeof jsPDF === 'undefined') {
            showNotification('PDF library not loaded', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 100, 200);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SIP Calculator - Investment Analysis', 20, 35);

        // Input Data
        doc.setFontSize(12);
        doc.text('Analysis Parameters:', 20, 55);
        
        const monthlyAmount = document.getElementById('analysisMonthlyAmount')?.value || '0';
        const returnRate = document.getElementById('analysisReturnRate')?.value || '0';
        const period = document.getElementById('analysisPeriod')?.value || '0';
        const inflationRate = document.getElementById('inflationRate')?.value || '0';
        
        doc.text(`Monthly Investment: ₹${parseInt(monthlyAmount).toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Expected Return: ${returnRate}%`, 20, 85);
        doc.text(`Investment Period: ${period} years`, 20, 100);
        doc.text(`Inflation Rate: ${inflationRate}%`, 20, 115);

        // Results
        doc.text('Analysis Results:', 20, 135);
        
        const nominalValue = document.getElementById('nominalValue')?.textContent || '₹0';
        const realValue = document.getElementById('realValue')?.textContent || '₹0';
        const totalInvestment = document.getElementById('analysisTotalInvestment')?.textContent || '₹0';
        const realReturns = document.getElementById('realReturns')?.textContent || '₹0';
        
        doc.text(`Nominal Value: ${nominalValue}`, 20, 150);
        doc.text(`Real Value: ${realValue}`, 20, 165);
        doc.text(`Total Investment: ${totalInvestment}`, 20, 180);
        doc.text(`Real Returns: ${realReturns}`, 20, 195);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('SIP_Investment_Analysis_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    function generateLumpsumPDF() {
        if (typeof jsPDF === 'undefined') {
            showNotification('PDF library not loaded', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 100, 200);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('SIP Calculator - Lumpsum vs SIP Comparison', 20, 35);

        // Input Data
        doc.setFontSize(12);
        doc.text('Comparison Parameters:', 20, 55);
        
        const lumpsumAmount = document.getElementById('investmentAmount')?.value || '0';
        const sipAmount = document.getElementById('alternativeSIP')?.value || '0';
        const returnRate = document.getElementById('comparisonReturnRate')?.value || '0';
        const period = document.getElementById('comparisonPeriod')?.value || '0';
        
        doc.text(`Lumpsum Amount: ₹${parseInt(lumpsumAmount).toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Monthly SIP: ₹${parseInt(sipAmount).toLocaleString('en-IN')}`, 20, 85);
        doc.text(`Expected Return: ${returnRate}%`, 20, 100);
        doc.text(`Investment Period: ${period} years`, 20, 115);

        // Results
        doc.text('Comparison Results:', 20, 135);
        
        const lumpsumFinal = document.getElementById('lumpsumFinal')?.textContent || '₹0';
        const sipFinalValue = document.getElementById('sipFinalValue')?.textContent || '₹0';
        const recommendation = document.getElementById('investmentRecommendation')?.textContent || '';
        
        doc.text(`Lumpsum Final Value: ${lumpsumFinal}`, 20, 150);
        doc.text(`SIP Final Value: ${sipFinalValue}`, 20, 165);
        doc.text(`Recommendation: ${recommendation}`, 20, 180);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('SIP_Lumpsum_Comparison_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    // Initialize all components
    initSIPCalculator();
    initGoalPlanning();
    initSIPComparison();
    initInvestmentAnalysis();
    initLumpsumComparison();

    console.log('SIP Calculator initialized successfully!');
    showNotification('Welcome to SIP Calculator!', 'info');
});
