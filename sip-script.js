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

    window.goToEMI = function() {
        window.location.href = 'emi-calculator.html';
    };

    window.goToGST = function() {
        window.location.href = 'gst-calculator.html';
    };

    window.goToTax = function() {
        window.location.href = '/tax-calculator.html';
    }

    function goToFD() {
        window.location.href = '/fd-calculator.html';
    }

    // SIP Calculator functionality
    let sipChart = null;
    let goalChart = null;
    let sipComparisonChart = null;
    let analysisChart = null;
    let lumpsumChart = null;

    // Initialize SIP Calculator
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

        // Initialize with empty values
        initializeEmptyValues();

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
                if (validateSIPInputs()) {
                    calculateSIP();
                }
            });
        });

        // Sync sliders with inputs
        if (monthlyAmountSlider && monthlyAmountInput) {
            monthlyAmountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                monthlyAmountInput.value = value;
                monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                if (validateSIPInputs()) {
                    calculateSIP();
                }
            });

            monthlyAmountInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 500 && value <= 100000) {
                        monthlyAmountSlider.value = value;
                        monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                    } else {
                        monthlyAmountDisplay.textContent = 'Enter valid amount (₹500 - ₹1L)';
                    }
                } else {
                    monthlyAmountDisplay.textContent = 'Enter monthly SIP amount';
                }
            });
        }

        if (returnRateSlider && returnRateInput) {
            returnRateSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                returnRateInput.value = value;
                returnRateDisplay.textContent = `${value}%`;
                if (validateSIPInputs()) {
                    calculateSIP();
                }
            });

            returnRateInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (value >= 1 && value <= 30) {
                        returnRateSlider.value = value;
                        returnRateDisplay.textContent = `${value}%`;
                    } else {
                        returnRateDisplay.textContent = 'Enter valid return (1% - 30%)';
                    }
                } else {
                    returnRateDisplay.textContent = 'Enter expected returns';
                }
            });
        }

        if (investmentPeriodSlider && investmentPeriodInput) {
            investmentPeriodSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                investmentPeriodInput.value = value;
                investmentPeriodDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                if (validateSIPInputs()) {
                    calculateSIP();
                }
            });

            investmentPeriodInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 1 && value <= 40) {
                        investmentPeriodSlider.value = value;
                        investmentPeriodDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                    } else {
                        investmentPeriodDisplay.textContent = 'Enter valid period (1-40 years)';
                    }
                } else {
                    investmentPeriodDisplay.textContent = 'Enter investment tenure';
                }
            });
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                if (!validateSIPInputs()) {
                    return;
                }

                this.classList.add('loading');
                this.querySelector('.btn-text').textContent = 'Calculating...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.querySelector('.btn-text').textContent = 'Calculate SIP';
                    calculateSIP();
                    showNotification('SIP calculation completed!', 'success');
                }, 800);
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                initializeEmptyValues();
                showNotification('SIP calculator refreshed!', 'info');
            });
        }

        // Initialize chart
        initSIPChart();
    }

    function initializeEmptyValues() {
        // Clear all input fields
        if (document.getElementById('monthlyAmountInput')) document.getElementById('monthlyAmountInput').value = '';
        if (document.getElementById('returnRateInput')) document.getElementById('returnRateInput').value = '';
        if (document.getElementById('investmentPeriodInput')) document.getElementById('investmentPeriodInput').value = '';
        if (document.getElementById('stepUpRate')) document.getElementById('stepUpRate').value = '';

        // Reset sliders to default values
        if (document.getElementById('monthlyAmountSlider')) document.getElementById('monthlyAmountSlider').value = '5000';
        if (document.getElementById('returnRateSlider')) document.getElementById('returnRateSlider').value = '12';
        if (document.getElementById('investmentPeriodSlider')) document.getElementById('investmentPeriodSlider').value = '10';

        // Update displays
        if (document.getElementById('monthlyAmountDisplay')) document.getElementById('monthlyAmountDisplay').textContent = 'Enter monthly SIP amount';
        if (document.getElementById('returnRateDisplay')) document.getElementById('returnRateDisplay').textContent = 'Enter expected returns';
        if (document.getElementById('investmentPeriodDisplay')) document.getElementById('investmentPeriodDisplay').textContent = 'Enter investment tenure';

        // Reset radio buttons
        if (document.getElementById('regularSIP')) document.getElementById('regularSIP').checked = true;
        if (document.getElementById('stepUpGroup')) document.getElementById('stepUpGroup').style.display = 'none';

        // Clear results
        if (document.getElementById('totalInvestment')) document.getElementById('totalInvestment').textContent = '₹0';
        if (document.getElementById('totalReturns')) document.getElementById('totalReturns').textContent = '₹0';
        if (document.getElementById('maturityValue')) document.getElementById('maturityValue').textContent = '₹0';

        // Reset chart
        if (sipChart) {
            sipChart.data.datasets[0].data = [0, 0];
            sipChart.update();
        }
    }

    function validateSIPInputs() {
        const monthlyAmount = document.getElementById('monthlyAmountInput')?.value;
        const returnRate = document.getElementById('returnRateInput')?.value;
        const period = document.getElementById('investmentPeriodInput')?.value;

        if (!monthlyAmount || monthlyAmount <= 0) {
            showNotification('Please enter a valid monthly SIP amount', 'error');
            return false;
        }

        if (!returnRate || returnRate <= 0) {
            showNotification('Please enter a valid expected return rate', 'error');
            return false;
        }

        if (!period || period <= 0) {
            showNotification('Please enter a valid investment period', 'error');
            return false;
        }

        return true;
    }

    function calculateSIP() {
        const monthlyAmount = parseFloat(document.getElementById('monthlyAmountInput')?.value) || 0;
        const annualReturnRate = parseFloat(document.getElementById('returnRateInput')?.value) || 0;
        const years = parseInt(document.getElementById('investmentPeriodInput')?.value) || 0;
        const sipType = document.querySelector('input[name="sipType"]:checked')?.value || 'regular';
        const stepUpRate = parseFloat(document.getElementById('stepUpRate')?.value) || 0;

        if (monthlyAmount <= 0 || annualReturnRate <= 0 || years <= 0) {
            document.getElementById('totalInvestment').textContent = '₹0';
            document.getElementById('totalReturns').textContent = '₹0';
            document.getElementById('maturityValue').textContent = '₹0';
            return;
        }

        const monthlyReturnRate = annualReturnRate / 12 / 100;
        const totalMonths = years * 12;

        let totalInvestment = 0;
        let maturityValue = 0;

        if (sipType === 'regular') {
            // Regular SIP calculation
            totalInvestment = monthlyAmount * totalMonths;
            maturityValue = monthlyAmount * (((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate));
        } else {
            // Step-up SIP calculation
            let currentAmount = monthlyAmount;
            let currentValue = 0;

            for (let year = 1; year <= years; year++) {
                const monthsInYear = 12;
                const yearlyInvestment = currentAmount * monthsInYear;
                totalInvestment += yearlyInvestment;

                // Calculate future value for this year's investments
                const remainingMonths = (years - year + 1) * 12;
                const yearlyMaturityValue = currentAmount * (((Math.pow(1 + monthlyReturnRate, remainingMonths) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate));
                currentValue += yearlyMaturityValue;

                // Step up amount for next year
                currentAmount = currentAmount * (1 + stepUpRate / 100);
            }
            maturityValue = currentValue;
        }

        const totalReturns = maturityValue - totalInvestment;

        // Update display
        document.getElementById('totalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('totalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;
        document.getElementById('maturityValue').textContent = `₹${Math.round(maturityValue).toLocaleString('en-IN')}`;

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
                    data: [600000, 1400000],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(240, 147, 251, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 212, 255, 1)',
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
        if (sipChart) {
            sipChart.data.datasets[0].data = [Math.round(investment), Math.round(returns)];
            sipChart.update('active');
        }
    }

    // Goal Based Planning
    function initGoalPlanning() {
        const calculateGoalBtn = document.getElementById('calculateGoal');
        const refreshGoalBtn = document.getElementById('refreshGoal');

        if (calculateGoalBtn) {
            calculateGoalBtn.addEventListener('click', function() {
                calculateGoalBasedSIP();
                showNotification('Goal-based SIP calculated!', 'success');
            });
        }

        if (refreshGoalBtn) {
            refreshGoalBtn.addEventListener('click', function() {
                // Clear goal inputs
                if (document.getElementById('targetAmount')) document.getElementById('targetAmount').value = '';
                if (document.getElementById('goalYears')) document.getElementById('goalYears').value = '';
                if (document.getElementById('goalReturnRate')) document.getElementById('goalReturnRate').value = '';
                if (document.getElementById('goalType')) document.getElementById('goalType').value = 'custom';

                // Hide results
                const resultsSection = document.getElementById('goalResult');
                if (resultsSection) resultsSection.style.display = 'none';

                showNotification('Goal planning refreshed!', 'info');
            });
        }
    }

    function calculateGoalBasedSIP() {
        const targetAmount = parseFloat(document.getElementById('targetAmount')?.value) || 0;
        const years = parseInt(document.getElementById('goalYears')?.value) || 0;
        const annualReturnRate = parseFloat(document.getElementById('goalReturnRate')?.value) || 0;

        if (targetAmount <= 0 || years <= 0 || annualReturnRate <= 0) {
            showNotification('Please enter valid goal details', 'error');
            return;
        }

        const monthlyReturnRate = annualReturnRate / 12 / 100;
        const totalMonths = years * 12;

        // Calculate required monthly SIP
        const requiredSIP = targetAmount / (((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate));
        const totalInvestment = requiredSIP * totalMonths;
        const totalReturns = targetAmount - totalInvestment;

        // Update display
        document.getElementById('requiredSIP').textContent = `₹${Math.round(requiredSIP).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;

        // Show results
        document.getElementById('goalResult').style.display = 'block';

        // Update goal chart
        updateGoalChart(years, requiredSIP, monthlyReturnRate);
    }

    function updateGoalChart(years, monthlySIP, monthlyRate) {
        const ctx = document.getElementById('goalChart');
        if (!ctx) return;

        if (goalChart) {
            goalChart.destroy();
        }

        const labels = [];
        const investmentData = [];
        const valueData = [];

        let cumulativeInvestment = 0;
        let cumulativeValue = 0;

        for (let year = 1; year <= years; year++) {
            labels.push(`Year ${year}`);
            cumulativeInvestment += monthlySIP * 12;

            // Calculate value at end of year
            const months = year * 12;
            cumulativeValue = monthlySIP * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

            investmentData.push(Math.round(cumulativeInvestment));
            valueData.push(Math.round(cumulativeValue));
        }

        goalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Investment',
                        data: investmentData,
                        borderColor: 'rgba(0, 212, 255, 1)',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Value',
                        data: valueData,
                        borderColor: 'rgba(240, 147, 251, 1)',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // SIP Comparison
    function initSIPComparison() {
        const compareSIPsBtn = document.getElementById('compareSIPs');
        const refreshComparisonBtn = document.getElementById('refreshComparison');

        if (compareSIPsBtn) {
            compareSIPsBtn.addEventListener('click', function() {
                calculateSIPComparison();
                showNotification('SIP comparison completed!', 'success');
            });
        }

        if (refreshComparisonBtn) {
            refreshComparisonBtn.addEventListener('click', function() {
                // Clear comparison inputs
                ['sip1Amount', 'sip1Return', 'sip1Period', 'sip2Amount', 'sip2Return', 'sip2Period'].forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = '';
                });

                // Hide results
                const resultsSection = document.getElementById('comparisonResults');
                if (resultsSection) resultsSection.style.display = 'none';

                showNotification('SIP comparison refreshed!', 'info');
            });
        }
    }

    function calculateSIPComparison() {
        const sip1 = {
            amount: parseFloat(document.getElementById('sip1Amount')?.value) || 0,
            returnRate: parseFloat(document.getElementById('sip1Return')?.value) || 0,
            period: parseInt(document.getElementById('sip1Period')?.value) || 0
        };

        const sip2 = {
            amount: parseFloat(document.getElementById('sip2Amount')?.value) || 0,
            returnRate: parseFloat(document.getElementById('sip2Return')?.value) || 0,
            period: parseInt(document.getElementById('sip2Period')?.value) || 0
        };

        if (sip1.amount <= 0 || sip1.returnRate <= 0 || sip1.period <= 0 ||
            sip2.amount <= 0 || sip2.returnRate <= 0 || sip2.period <= 0) {
            showNotification('Please enter valid details for both SIP options', 'error');
            return;
        }

        const sips = [sip1, sip2];
        const results = [];

        sips.forEach((sip, index) => {
            const monthlyRate = sip.returnRate / 12 / 100;
            const totalMonths = sip.period * 12;
            const totalInvestment = sip.amount * totalMonths;
            const maturityValue = sip.amount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
            const totalReturns = maturityValue - totalInvestment;

            results.push({
                name: `SIP Option ${index + 1}`,
                monthlyAmount: sip.amount,
                totalInvestment: totalInvestment,
                maturityValue: maturityValue,
                totalReturns: totalReturns
            });
        });

        // Find best SIP
        const bestSIP = results.reduce((best, current) => 
            current.maturityValue > best.maturityValue ? current : best
        );

        updateComparisonTable(results, bestSIP.name);
        updateSIPComparisonChart(results, bestSIP.name);

        document.getElementById('comparisonResults').style.display = 'block';
    }

    function updateComparisonTable(results, bestSIPName) {
        const tableBody = document.getElementById('comparisonTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');
            const isBest = result.name === bestSIPName;

            if (isBest) {
                row.classList.add('best-loan');
            }

            row.innerHTML = `
                <td>
                    ${result.name}
                    ${isBest ? '<div class="best-loan-indicator">Best Option</div>' : ''}
                </td>
                <td>₹${Math.round(result.monthlyAmount).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(result.totalInvestment).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(result.maturityValue).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(result.totalReturns).toLocaleString('en-IN')}</td>
            `;

            tableBody.appendChild(row);
        });
    }

    function updateSIPComparisonChart(results, bestSIPName) {
        const ctx = document.getElementById('sipComparisonChart');
        if (!ctx) return;

        if (sipComparisonChart) {
            sipComparisonChart.destroy();
        }

        const labels = results.map(result => result.name);
        const investmentData = results.map(result => Math.round(result.totalInvestment));
        const maturityData = results.map(result => Math.round(result.maturityValue));

        const backgroundColors = results.map(result => 
            result.name === bestSIPName ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 212, 255, 0.8)'
        );

        sipComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Investment',
                        data: investmentData,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                        borderWidth: 2
                    },
                    {
                        label: 'Maturity Value',
                        data: maturityData,
                        backgroundColor: results.map(result => 
                            result.name === bestSIPName ? 'rgba(240, 147, 251, 0.8)' : 'rgba(240, 147, 251, 0.6)'
                        ),
                        borderColor: results.map(result => 
                            result.name === bestSIPName ? 'rgba(240, 147, 251, 1)' : 'rgba(240, 147, 251, 0.8)'
                        ),
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Investment Analysis
    function initInvestmentAnalysis() {
        const analyzeBtn = document.getElementById('analyzeInvestment');
        const refreshAnalysisBtn = document.getElementById('refreshAnalysis');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', function() {
                calculateInvestmentAnalysis();
                showNotification('Investment analysis completed!', 'success');
            });
        }

        if (refreshAnalysisBtn) {
            refreshAnalysisBtn.addEventListener('click', function() {
                // Clear analysis inputs
                ['currentAge', 'retirementAge', 'analysisAmount', 'analysisReturn', 'inflationRate'].forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = '';
                });

                // Hide results
                const resultsSection = document.getElementById('analysisResults');
                if (resultsSection) resultsSection.style.display = 'none';

                showNotification('Investment analysis refreshed!', 'info');
            });
        }
    }

    function calculateInvestmentAnalysis() {
        const currentAge = parseInt(document.getElementById('currentAge')?.value) || 0;
        const retirementAge = parseInt(document.getElementById('retirementAge')?.value) || 0;
        const monthlyAmount = parseFloat(document.getElementById('analysisAmount')?.value) || 0;
        const annualReturn = parseFloat(document.getElementById('analysisReturn')?.value) || 0;
        const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 0;

        if (currentAge <= 0 || retirementAge <= currentAge || monthlyAmount <= 0 || annualReturn <= 0) {
            showNotification('Please enter valid analysis details', 'error');
            return;
        }

        const years = retirementAge - currentAge;
        const monthlyReturnRate = annualReturn / 12 / 100;
        const totalMonths = years * 12;

        const totalInvestment = monthlyAmount * totalMonths;
        const nominalValue = monthlyAmount * (((Math.pow(1 + monthlyReturnRate, totalMonths) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate));

        // Calculate real value (inflation adjusted)
        const realValue = nominalValue / Math.pow(1 + inflationRate / 100, years);
        const wealthMultiple = nominalValue / totalInvestment;

        // Update display
        document.getElementById('nominalValue').textContent = `₹${Math.round(nominalValue).toLocaleString('en-IN')}`;
        document.getElementById('realValue').textContent = `₹${Math.round(realValue).toLocaleString('en-IN')}`;
        document.getElementById('analysisInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('wealthMultiple').textContent = `${wealthMultiple.toFixed(1)}x`;

        // Show results
        document.getElementById('analysisResults').style.display = 'block';

        // Update analysis chart
        updateAnalysisChart(years, monthlyAmount, monthlyReturnRate, inflationRate);
    }

    function updateAnalysisChart(years, monthlySIP, monthlyRate, inflationRate) {
        const ctx = document.getElementById('analysisChart');
        if (!ctx) return;

        if (analysisChart) {
            analysisChart.destroy();
        }

        const labels = [];
        const nominalData = [];
        const realData = [];
        const investmentData = [];

        for (let year = 1; year <= years; year++) {
            labels.push(`Year ${year}`);

            const months = year * 12;
            const investment = monthlySIP * months;
            const nominal = monthlySIP * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
            const real = nominal / Math.pow(1 + inflationRate / 100, year);

            investmentData.push(Math.round(investment));
            nominalData.push(Math.round(nominal));
            realData.push(Math.round(real));
        }

        analysisChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Investment',
                        data: investmentData,
                        borderColor: 'rgba(0, 212, 255, 1)',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Nominal Value',
                        data: nominalData,
                        borderColor: 'rgba(240, 147, 251, 1)',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Real Value',
                        data: realData,
                        borderColor: 'rgba(0, 255, 136, 1)',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, ```text
0.1)'
                        }
                    }
                }
            }
        });
    }

    // Lumpsum vs SIP
    function initLumpsumVsSIP() {
        const compareBtn = document.getElementById('compareLumpsumSIP');
        const refreshBtn = document.getElementById('refreshLumpsumComparison');

        if (compareBtn) {
            compareBtn.addEventListener('click', function() {
                calculateLumpsumVsSIP();
                showNotification('Lumpsum vs SIP comparison completed!', 'success');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                // Clear inputs
                ['lumpsumAmount', 'lumpsumReturn', 'sipVsAmount', 'sipVsReturn', 'comparisonPeriod'].forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = '';
                });

                // Hide results
                const resultsSection = document.getElementById('lumpsumResults');
                if (resultsSection) resultsSection.style.display = 'none';

                showNotification('Lumpsum vs SIP comparison refreshed!', 'info');
            });
        }
    }

    function calculateLumpsumVsSIP() {
        const lumpsumAmount = parseFloat(document.getElementById('lumpsumAmount')?.value) || 0;
        const lumpsumReturn = parseFloat(document.getElementById('lumpsumReturn')?.value) || 0;
        const sipAmount = parseFloat(document.getElementById('sipVsAmount')?.value) || 0;
        const sipReturn = parseFloat(document.getElementById('sipVsReturn')?.value) || 0;
        const years = parseInt(document.getElementById('comparisonPeriod')?.value) || 0;

        if (lumpsumAmount <= 0 || lumpsumReturn <= 0 || sipAmount <= 0 || sipReturn <= 0 || years <= 0) {
            showNotification('Please enter valid comparison details', 'error');
            return;
        }

        // Lumpsum calculation
        const lumpsumMaturity = lumpsumAmount * Math.pow(1 + lumpsumReturn / 100, years);
        const lumpsumReturns = lumpsumMaturity - lumpsumAmount;

        // SIP calculation
        const sipMonthlyRate = sipReturn / 12 / 100;
        const totalMonths = years * 12;
        const sipTotalInvestment = sipAmount * totalMonths;
        const sipMaturity = sipAmount * (((Math.pow(1 + sipMonthlyRate, totalMonths) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
        const sipTotalReturns = sipMaturity - sipTotalInvestment;

        // Update display
        document.getElementById('lumpsumInitial').textContent = `₹${Math.round(lumpsumAmount).toLocaleString('en-IN')}`;
        document.getElementById('lumpsumMaturity').textContent = `₹${Math.round(lumpsumMaturity).toLocaleString('en-IN')}`;
        document.getElementById('lumpsumTotalReturns').textContent = `₹${Math.round(lumpsumReturns).toLocaleString('en-IN')}`;

        document.getElementById('sipVsTotalInvestment').textContent = `₹${Math.round(sipTotalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('sipVsMaturity').textContent = `₹${Math.round(sipMaturity).toLocaleString('en-IN')}`;
        document.getElementById('sipVsTotalReturns').textContent = `₹${Math.round(sipTotalReturns).toLocaleString('en-IN')}`;

        // Comparison verdict
        const difference = sipMaturity - lumpsumMaturity;
        const verdictElement = document.getElementById('comparisonVerdict');

        if (difference > 0) {
            verdictElement.textContent = `SIP investment generates ₹${Math.round(difference).toLocaleString('en-IN')} more than Lumpsum investment`;
            verdictElement.style.color = 'var(--success-color)';
        } else {
            verdictElement.textContent = `Lumpsum investment generates ₹${Math.round(Math.abs(difference)).toLocaleString('en-IN')} more than SIP investment`;
            verdictElement.style.color = 'var(--accent-color)';
        }

        // Show results
        document.getElementById('lumpsumResults').style.display = 'block';

        // Update chart
        updateLumpsumChart(years, lumpsumAmount, lumpsumReturn, sipAmount, sipMonthlyRate);
    }

    function updateLumpsumChart(years, lumpsumAmount, lumpsumReturn, sipAmount, sipMonthlyRate) {
        const ctx = document.getElementById('lumpsumChart');
        if (!ctx) return;

        if (lumpsumChart) {
            lumpsumChart.destroy();
        }

        const labels = [];
        const lumpsumData = [];
        const sipData = [];

        for (let year = 1; year <= years; year++) {
            labels.push(`Year ${year}`);

            const lumpsumValue = lumpsumAmount * Math.pow(1 + lumpsumReturn / 100, year);
            const months = year * 12;
            const sipValue = sipAmount * (((Math.pow(1 + sipMonthlyRate, months) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));

            lumpsumData.push(Math.round(lumpsumValue));
            sipData.push(Math.round(sipValue));
        }

        lumpsumChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Lumpsum Investment',
                        data: lumpsumData,
                        borderColor: 'rgba(0, 212, 255, 1)',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'SIP Investment',
                        data: sipData,
                        borderColor: 'rgba(240, 147, 251, 1)',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

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

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    // Initialize all components
    initSIPCalculator();
    initGoalPlanning();
    initSIPComparison();
    initInvestmentAnalysis();
    initLumpsumVsSIP();

    console.log('SIP Calculator initialized successfully!');
    showNotification('Welcome to SIP Calculator!', 'info');
});