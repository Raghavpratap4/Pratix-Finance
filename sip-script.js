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

        // Initialize with default values
        if (monthlyAmountSlider && monthlyAmountInput && monthlyAmountDisplay) {
            monthlyAmountSlider.value = '5000';
            monthlyAmountInput.value = '5000';
            monthlyAmountDisplay.textContent = '₹5,000';
        }

        if (returnRateSlider && returnRateInput && returnRateDisplay) {
            returnRateSlider.value = '12';
            returnRateInput.value = '12';
            returnRateDisplay.textContent = '12%';
        }

        if (investmentPeriodSlider && investmentPeriodInput && investmentPeriodDisplay) {
            investmentPeriodSlider.value = '10';
            investmentPeriodInput.value = '10';
            investmentPeriodDisplay.textContent = '10 Years';
        }

        // Calculate initial SIP
        calculateSIP();

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
                calculateSIP();
            });
        });

        // Sync sliders with inputs
        if (monthlyAmountSlider && monthlyAmountInput) {
            monthlyAmountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                monthlyAmountInput.value = value;
                monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                calculateSIP();
            });

            monthlyAmountInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 500 && value <= 100000) {
                        monthlyAmountSlider.value = value;
                        monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                        calculateSIP();
                    }
                }
            });
        }

        if (returnRateSlider && returnRateInput) {
            returnRateSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                returnRateInput.value = value;
                returnRateDisplay.textContent = `${value}%`;
                calculateSIP();
            });

            returnRateInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (value >= 1 && value <= 30) {
                        returnRateSlider.value = value;
                        returnRateDisplay.textContent = `${value}%`;
                        calculateSIP();
                    }
                }
            });
        }

        if (investmentPeriodSlider && investmentPeriodInput) {
            investmentPeriodSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                investmentPeriodInput.value = value;
                investmentPeriodDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                calculateSIP();
            });

            investmentPeriodInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 1 && value <= 40) {
                        investmentPeriodSlider.value = value;
                        investmentPeriodDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                        calculateSIP();
                    }
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
                // Reset to default values
                if (monthlyAmountSlider && monthlyAmountInput && monthlyAmountDisplay) {
                    monthlyAmountSlider.value = '5000';
                    monthlyAmountInput.value = '5000';
                    monthlyAmountDisplay.textContent = '₹5,000';
                }

                if (returnRateSlider && returnRateInput && returnRateDisplay) {
                    returnRateSlider.value = '12';
                    returnRateInput.value = '12';
                    returnRateDisplay.textContent = '12%';
                }

                if (investmentPeriodSlider && investmentPeriodInput && investmentPeriodDisplay) {
                    investmentPeriodSlider.value = '10';
                    investmentPeriodInput.value = '10';
                    investmentPeriodDisplay.textContent = '10 Years';
                }

                calculateSIP();
                showNotification('SIP calculator refreshed!', 'info');
            });
        }

        // Initialize chart
        initSIPChart();
    }

    function calculateSIP() {
        const monthlyAmount = parseInt(document.getElementById('monthlyAmountInput')?.value) || 5000;
        const annualReturn = parseFloat(document.getElementById('returnRateInput')?.value) || 12;
        const years = parseInt(document.getElementById('investmentPeriodInput')?.value) || 10;
        const sipType = document.querySelector('input[name="sipType"]:checked')?.value || 'regular';
        const stepUpRate = parseFloat(document.getElementById('stepUpRate')?.value) || 10;

        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;

        let totalInvestment = 0;
        let maturityValue = 0;

        if (sipType === 'regular') {
            // Regular SIP calculation
            totalInvestment = monthlyAmount * totalMonths;
            maturityValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
        } else {
            // Step-up SIP calculation
            let currentAmount = monthlyAmount;
            let currentValue = 0;

            for (let year = 1; year <= years; year++) {
                const monthsInYear = 12;
                const yearInvestment = currentAmount * monthsInYear;
                totalInvestment += yearInvestment;

                // Calculate future value of this year's investment
                const remainingMonths = (years - year) * 12 + 12;
                const yearMaturityValue = currentAmount * ((Math.pow(1 + monthlyReturn, monthsInYear) - 1) / monthlyReturn) * Math.pow(1 + monthlyReturn, remainingMonths - monthsInYear);
                currentValue += yearMaturityValue;

                // Increase amount for next year
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

        if (totalInvestmentElement) {
            totalInvestmentElement.textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        }
        if (totalReturnsElement) {
            totalReturnsElement.textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;
        }
        if (maturityValueElement) {
            maturityValueElement.textContent = `₹${Math.round(maturityValue).toLocaleString('en-IN')}`;
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
                    data: [600000, 521568],
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
                showNotification('Goal planning calculated!', 'success');
            });
        }

        if (refreshGoalBtn) {
            refreshGoalBtn.addEventListener('click', function() {
                document.getElementById('targetAmount').value = '';
                document.getElementById('goalYears').value = '';
                document.getElementById('goalReturnRate').value = '';
                document.getElementById('goalResult').style.display = 'none';
                showNotification('Goal planning refreshed!', 'info');
            });
        }
    }

    function calculateGoalBasedSIP() {
        const targetAmount = parseInt(document.getElementById('targetAmount')?.value) || 1000000;
        const years = parseInt(document.getElementById('goalYears')?.value) || 10;
        const annualReturn = parseFloat(document.getElementById('goalReturnRate')?.value) || 12;

        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = years * 12;

        // Calculate required monthly SIP
        const requiredSIP = (targetAmount * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
        const totalInvestment = requiredSIP * totalMonths;
        const totalReturns = targetAmount - totalInvestment;

        // Update display
        document.getElementById('requiredSIP').textContent = `₹${Math.round(requiredSIP).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('goalTotalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;

        // Show results
        document.getElementById('goalResult').style.display = 'block';

        // Update goal chart
        updateGoalChart(totalInvestment, totalReturns, years);
    }

    function updateGoalChart(investment, returns, years) {
        const ctx = document.getElementById('goalChart');
        if (!ctx) return;

        if (goalChart) {
            goalChart.destroy();
        }

        const yearlyData = [];
        const yearlyInvestment = investment / years;

        for (let i = 1; i <= years; i++) {
            yearlyData.push({
                year: i,
                investment: yearlyInvestment * i,
                maturity: (investment / years) * i * Math.pow(1.12, i) // Simplified calculation
            });
        }

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
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
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
                compareSIPOptions();
                showNotification('SIPs compared successfully!', 'success');
            });
        }

        if (refreshComparisonBtn) {
            refreshComparisonBtn.addEventListener('click', function() {
                document.getElementById('sip1Amount').value = '';
                document.getElementById('sip1Return').value = '';
                document.getElementById('sip1Period').value = '';
                document.getElementById('sip2Amount').value = '';
                document.getElementById('sip2Return').value = '';
                document.getElementById('sip2Period').value = '';
                document.getElementById('comparisonResults').style.display = 'none';
                showNotification('SIP comparison refreshed!', 'info');
            });
        }
    }

    function compareSIPOptions() {
        const sip1Amount = parseInt(document.getElementById('sip1Amount')?.value);
        const sip1Return = parseFloat(document.getElementById('sip1Return')?.value);
        const sip1Period = parseInt(document.getElementById('sip1Period')?.value);

        const sip2Amount = parseInt(document.getElementById('sip2Amount')?.value);
        const sip2Return = parseFloat(document.getElementById('sip2Return')?.value);
        const sip2Period = parseInt(document.getElementById('sip2Period')?.value);

        if (!sip1Amount || !sip1Return || !sip1Period || !sip2Amount || !sip2Return || !sip2Period) {
            showNotification('Please fill all SIP details', 'error');
            return;
        }

        // Calculate SIP 1
        const sip1MonthlyReturn = sip1Return / 12 / 100;
        const sip1TotalMonths = sip1Period * 12;
        const sip1Investment = sip1Amount * sip1TotalMonths;
        const sip1Maturity = sip1Amount * ((Math.pow(1 + sip1MonthlyReturn, sip1TotalMonths) - 1) / sip1MonthlyReturn);
        const sip1Returns = sip1Maturity - sip1Investment;

        // Calculate SIP 2
        const sip2MonthlyReturn = sip2Return / 12 / 100;
        const sip2TotalMonths = sip2Period * 12;
        const sip2Investment = sip2Amount * sip2TotalMonths;
        const sip2Maturity = sip2Amount * ((Math.pow(1 + sip2MonthlyReturn, sip2TotalMonths) - 1) / sip2MonthlyReturn);
        const sip2Returns = sip2Maturity - sip2Investment;

        // Update comparison table
        const tableBody = document.getElementById('comparisonTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td>SIP Option 1</td>
                    <td>₹${sip1Amount.toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip1Investment).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip1Maturity).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip1Returns).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td>SIP Option 2</td>
                    <td>₹${sip2Amount.toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip2Investment).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip2Maturity).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(sip2Returns).toLocaleString('en-IN')}</td>
                </tr>
            `;
        }

        // Show results
        document.getElementById('comparisonResults').style.display = 'block';

        // Update comparison chart
        updateSIPComparisonChart([sip1Maturity, sip2Maturity]);
    }

    function updateSIPComparisonChart(values) {
        const ctx = document.getElementById('sipComparisonChart');
        if (!ctx) return;

        if (sipComparisonChart) {
            sipComparisonChart.destroy();
        }

        sipComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['SIP Option 1', 'SIP Option 2'],
                datasets: [{
                    label: 'Maturity Value',
                    data: values,
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
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
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
                analyzeInvestment();
                showNotification('Investment analysis completed!', 'success');
            });
        }

        if (refreshAnalysisBtn) {
            refreshAnalysisBtn.addEventListener('click', function() {
                document.getElementById('currentAge').value = '';
                document.getElementById('retirementAge').value = '';
                document.getElementById('analysisAmount').value = '';
                document.getElementById('analysisReturn').value = '';
                document.getElementById('inflationRate').value = '';
                document.getElementById('analysisResults').style.display = 'none';
                showNotification('Investment analysis refreshed!', 'info');
            });
        }
    }

    function analyzeInvestment() {
        const currentAge = parseInt(document.getElementById('currentAge')?.value) || 30;
        const retirementAge = parseInt(document.getElementById('retirementAge')?.value) || 60;
        const monthlyAmount = parseInt(document.getElementById('analysisAmount')?.value) || 10000;
        const annualReturn = parseFloat(document.getElementById('analysisReturn')?.value) || 12;
        const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

        const investmentYears = retirementAge - currentAge;
        const monthlyReturn = annualReturn / 12 / 100;
        const totalMonths = investmentYears * 12;

        // Calculate nominal value
        const totalInvestment = monthlyAmount * totalMonths;
        const nominalValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

        // Calculate real value (inflation adjusted)
        const realValue = nominalValue / Math.pow(1 + inflationRate / 100, investmentYears);

        // Calculate wealth multiple
        const wealthMultiple = nominalValue / totalInvestment;

        // Update display
        document.getElementById('nominalValue').textContent = `₹${Math.round(nominalValue).toLocaleString('en-IN')}`;
        document.getElementById('realValue').textContent = `₹${Math.round(realValue).toLocaleString('en-IN')}`;
        document.getElementById('analysisInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('wealthMultiple').textContent = `${wealthMultiple.toFixed(1)}x`;

        // Show results
        document.getElementById('analysisResults').style.display = 'block';
    }

    // Lumpsum vs SIP
    function initLumpsumComparison() {
        const compareLumpsumSIPBtn = document.getElementById('compareLumpsumSIP');
        const refreshLumpsumBtn = document.getElementById('refreshLumpsumComparison');

        if (compareLumpsumSIPBtn) {
            compareLumpsumSIPBtn.addEventListener('click', function() {
                compareLumpsumVsSIP();
                showNotification('Lumpsum vs SIP comparison completed!', 'success');
            });
        }

        if (refreshLumpsumBtn) {
            refreshLumpsumBtn.addEventListener('click', function() {
                document.getElementById('lumpsumAmount').value = '';
                document.getElementById('lumpsumReturn').value = '';
                document.getElementById('sipVsAmount').value = '';
                document.getElementById('sipVsReturn').value = '';
                document.getElementById('comparisonPeriod').value = '';
                document.getElementById('lumpsumResults').style.display = 'none';
                showNotification('Lumpsum comparison refreshed!', 'info');
            });
        }
    }

    function compareLumpsumVsSIP() {
        const lumpsumAmount = parseInt(document.getElementById('lumpsumAmount')?.value);
        const lumpsumReturn = parseFloat(document.getElementById('lumpsumReturn')?.value);
        const sipAmount = parseInt(document.getElementById('sipVsAmount')?.value);
        const sipReturn = parseFloat(document.getElementById('sipVsReturn')?.value);
        const period = parseInt(document.getElementById('comparisonPeriod')?.value);

        if (!lumpsumAmount || !lumpsumReturn || !sipAmount || !sipReturn || !period) {
            showNotification('Please fill all investment details', 'error');
            return;
        }

        // Calculate Lumpsum
        const lumpsumMaturity = lumpsumAmount * Math.pow(1 + lumpsumReturn / 100, period);
        const lumpsumReturns = lumpsumMaturity - lumpsumAmount;

        // Calculate SIP
        const sipMonthlyReturn = sipReturn / 12 / 100;
        const sipTotalMonths = period * 12;
        const sipTotalInvestment = sipAmount * sipTotalMonths;
        const sipMaturity = sipAmount * ((Math.pow(1 + sipMonthlyReturn, sipTotalMonths) - 1) / sipMonthlyReturn);
        const sipTotalReturns = sipMaturity - sipTotalInvestment;

        // Update display
        document.getElementById('lumpsumInitial').textContent = `₹${lumpsumAmount.toLocaleString('en-IN')}`;
        document.getElementById('lumpsumMaturity').textContent = `₹${Math.round(lumpsumMaturity).toLocaleString('en-IN')}`;
        document.getElementById('lumpsumTotalReturns').textContent = `₹${Math.round(lumpsumReturns).toLocaleString('en-IN')}`;

        document.getElementById('sipVsTotalInvestment').textContent = `₹${Math.round(sipTotalInvestment).toLocaleString('en-IN')}`;
        document.getElementById('sipVsMaturity').textContent = `₹${Math.round(sipMaturity).toLocaleString('en-IN')}`;
        document.getElementById('sipVsTotalReturns').textContent = `₹${Math.round(sipTotalReturns).toLocaleString('en-IN')}`;

        // Determine verdict
        const verdict = sipMaturity > lumpsumMaturity ? 
            `SIP generates ₹${Math.round(sipMaturity - lumpsumMaturity).toLocaleString('en-IN')} more than Lumpsum` :
            `Lumpsum generates ₹${Math.round(lumpsumMaturity - sipMaturity).toLocaleString('en-IN')} more than SIP`;

        document.getElementById('comparisonVerdict').textContent = verdict;

        // Show results
        document.getElementById('lumpsumResults').style.display = 'block';
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
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
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
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