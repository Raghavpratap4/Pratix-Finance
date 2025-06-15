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

    // SIP Calculator JavaScript

    let sipChart = null;

    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        switch(type) {
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Validation functions
    function validateSIPInputs() {
        const monthlyAmount = parseFloat(document.getElementById('monthlyAmountInput')?.value);
        const returnRate = parseFloat(document.getElementById('returnRateInput')?.value);
        const investmentPeriod = parseFloat(document.getElementById('investmentPeriodInput')?.value);

        const errors = [];

        if (!monthlyAmount || monthlyAmount < 500) {
            errors.push('Monthly SIP amount must be at least ₹500');
        }
        if (monthlyAmount > 100000) {
            errors.push('Monthly SIP amount cannot exceed ₹1,00,000');
        }

        if (!returnRate || returnRate < 1) {
            errors.push('Expected return rate must be at least 1%');
        }
        if (returnRate > 30) {
            errors.push('Expected return rate cannot exceed 30%');
        }

        if (!investmentPeriod || investmentPeriod < 1) {
            errors.push('Investment period must be at least 1 year');
        }
        if (investmentPeriod > 40) {
            errors.push('Investment period cannot exceed 40 years');
        }

        return errors;
    }

    function validateGoalInputs() {
        const targetAmount = parseFloat(document.getElementById('targetAmount')?.value);
        const goalYears = parseFloat(document.getElementById('goalYears')?.value);
        const goalReturnRate = parseFloat(document.getElementById('goalReturnRate')?.value);

        const errors = [];

        if (!targetAmount || targetAmount < 10000) {
            errors.push('Target amount must be at least ₹10,000');
        }
        if (targetAmount > 100000000) {
            errors.push('Target amount cannot exceed ₹10 crores');
        }

        if (!goalYears || goalYears < 1) {
            errors.push('Goal period must be at least 1 year');
        }
        if (goalYears > 40) {
            errors.push('Goal period cannot exceed 40 years');
        }

        if (!goalReturnRate || goalReturnRate < 1) {
            errors.push('Expected return rate must be at least 1%');
        }
        if (goalReturnRate > 30) {
            errors.push('Expected return rate cannot exceed 30%');
        }

        return errors;
    }

    // Slider synchronization
    function syncSliders() {
        // Monthly Amount
        const monthlyAmountSlider = document.getElementById('monthlyAmountSlider');
        const monthlyAmountInput = document.getElementById('monthlyAmountInput');
        const monthlyAmountDisplay = document.getElementById('monthlyAmountDisplay');

        if (monthlyAmountSlider && monthlyAmountInput && monthlyAmountDisplay) {
            monthlyAmountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                monthlyAmountInput.value = value;
                monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')} per month`;
            });

            monthlyAmountInput.addEventListener('input', function() {
                const value = parseInt(this.value) || 0;
                if (value >= 500 && value <= 100000) {
                    monthlyAmountSlider.value = value;
                    monthlyAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')} per month`;
                } else if (value > 100000) {
                    this.value = 100000;
                    monthlyAmountSlider.value = 100000;
                    monthlyAmountDisplay.textContent = `₹${(100000).toLocaleString('en-IN')} per month`;
                    showNotification('Maximum monthly SIP amount is ₹1,00,000', 'warning');
                }
            });
        }

        // Return Rate
        const returnRateSlider = document.getElementById('returnRateSlider');
        const returnRateInput = document.getElementById('returnRateInput');
        const returnRateDisplay = document.getElementById('returnRateDisplay');

        if (returnRateSlider && returnRateInput && returnRateDisplay) {
            returnRateSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                returnRateInput.value = value;
                returnRateDisplay.textContent = `${value}% annual returns`;
            });

            returnRateInput.addEventListener('input', function() {
                const value = parseFloat(this.value) || 0;
                if (value >= 1 && value <= 30) {
                    returnRateSlider.value = value;
                    returnRateDisplay.textContent = `${value}% annual returns`;
                } else if (value > 30) {
                    this.value = 30;
                    returnRateSlider.value = 30;
                    returnRateDisplay.textContent = '30% annual returns';
                    showNotification('Maximum expected return is 30%', 'warning');
                }
            });
        }

        // Investment Period
        const periodSlider = document.getElementById('investmentPeriodSlider');
        const periodInput = document.getElementById('investmentPeriodInput');
        const periodDisplay = document.getElementById('investmentPeriodDisplay');

        if (periodSlider && periodInput && periodDisplay) {
            periodSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                periodInput.value = value;
                periodDisplay.textContent = `${value} years investment`;
            });

            periodInput.addEventListener('input', function() {
                const value = parseInt(this.value) || 0;
                if (value >= 1 && value <= 40) {
                    periodSlider.value = value;
                    periodDisplay.textContent = `${value} years investment`;
                } else if (value > 40) {
                    this.value = 40;
                    periodSlider.value = 40;
                    periodDisplay.textContent = '40 years investment';
                    showNotification('Maximum investment period is 40 years', 'warning');
                }
            });
        }
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

        if (!monthlyAmount || monthlyAmount <= 0 || monthlyAmount < 500) {
            showNotification('Please enter a valid monthly SIP amount (minimum ₹500)', 'error');
            return false;
        }

        if (!returnRate || returnRate <= 0 || returnRate > 30) {
            showNotification('Please enter a valid expected return rate (1% - 30%)', 'error');
            return false;
        }

        if (!period || period <= 0 || period > 40) {
            showNotification('Please enter a valid investment period (1 - 40 years)', 'error');
            return false;
        }

        // Additional validation for step-up SIP
        const sipType = document.querySelector('input[name="sipType"]:checked')?.value;
        if (sipType === 'stepup') {
            const stepUpRate = document.getElementById('stepUpRate')?.value;
            if (!stepUpRate || stepUpRate <= 0 || stepUpRate > 50) {
                showNotification('Please enter a valid step-up rate (1% - 50%)', 'error');
                return false;
            }
        }

        return true;
    }

    // SIP Calculation with comprehensive validation
    function calculateSIP() {
        try {
            // Validate inputs
            const errors = validateSIPInputs();
            if (errors.length > 0) {
                showNotification(errors[0], 'error');
                return;
            }

            const monthlyAmount = parseFloat(document.getElementById('monthlyAmountInput').value);
            const returnRate = parseFloat(document.getElementById('returnRateInput').value);
            const investmentPeriod = parseFloat(document.getElementById('investmentPeriodInput').value);
            const sipType = document.querySelector('input[name="sipType"]:checked')?.value;

            // Show loading state
            const calculateBtn = document.getElementById('calculateSIP');
            const originalText = calculateBtn.innerHTML;
            calculateBtn.innerHTML = '<span class="btn-text">Calculating...</span>';
            calculateBtn.disabled = true;

            setTimeout(() => {
                const monthlyRate = returnRate / 12 / 100;
                const totalMonths = investmentPeriod * 12;

                let maturityValue, totalInvestment;

                if (sipType === 'stepup') {
                    const stepUpRate = parseFloat(document.getElementById('stepUpRate')?.value) || 10;

                    // Step-up SIP calculation
                    totalInvestment = 0;
                    maturityValue = 0;
                    let currentMonthlyAmount = monthlyAmount;

                    for (let year = 0; year < investmentPeriod; year++) {
                        const monthsInThisYear = Math.min(12, totalMonths - (year * 12));
                        const yearlyInvestment = currentMonthlyAmount * monthsInThisYear;
                        totalInvestment += yearlyInvestment;

                        // Calculate future value for this year's investments
                        const remainingMonths = totalMonths - (year * 12);
                        const futureValue = currentMonthlyAmount * (((Math.pow(1 + monthlyRate, remainingMonths) - 1) / monthlyRate) * (1 + monthlyRate));
                        maturityValue += futureValue;

                        // Increase for next year
                        currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpRate / 100);
                    }
                } else {
                    // Regular SIP calculation
                    totalInvestment = monthlyAmount * totalMonths;

                    if (monthlyRate === 0) {
                        maturityValue = totalInvestment;
                    } else {
                        maturityValue = monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
                    }
                }

                const totalReturns = maturityValue - totalInvestment;

                // Validate calculation results
                if (isNaN(maturityValue) || isNaN(totalInvestment) || isNaN(totalReturns)) {
                    throw new Error('Calculation resulted in invalid values');
                }

                // Update results
                document.getElementById('totalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
                document.getElementById('totalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;
                document.getElementById('maturityValue').textContent = `₹${Math.round(maturityValue).toLocaleString('en-IN')}`;

                // Create chart
                updateSIPChart(totalInvestment, totalReturns);

                // Show success message
                showNotification('SIP calculation completed successfully!', 'success');

                // Restore button
                calculateBtn.innerHTML = originalText;
                calculateBtn.disabled = false;

            }, 500); // Small delay for better UX

        } catch (error) {
            console.error('SIP Calculation Error:', error);
            showNotification('Error in calculation. Please check your inputs.', 'error');

            // Restore button
            const calculateBtn = document.getElementById('calculateSIP');
            calculateBtn.innerHTML = '<span class="btn-text">Calculate SIP</span>';
            calculateBtn.disabled = false;
        }
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
                            color: 'rgba(255, 255, 255, 0.1)'
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

    // Goal calculation with validation
    function calculateGoal() {
        try {
            // Validate inputs
            const errors = validateGoalInputs();
            if (errors.length > 0) {
                showNotification(errors[0], 'error');
                return;
            }

            const targetAmount = parseFloat(document.getElementById('targetAmount').value);
            const goalYears = parseFloat(document.getElementById('goalYears').value);
            const goalReturnRate = parseFloat(document.getElementById('goalReturnRate').value);

            const monthlyRate = goalReturnRate / 12 / 100;
            const totalMonths = goalYears * 12;

            let requiredSIP;
            if (monthlyRate === 0) {
                requiredSIP = targetAmount / totalMonths;
            } else {
                requiredSIP = targetAmount / (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
            }

            const totalInvestment = requiredSIP * totalMonths;
            const totalReturns = targetAmount - totalInvestment;

            // Validate results
            if (isNaN(requiredSIP) || requiredSIP <= 0) {
                throw new Error('Invalid SIP calculation');
            }

            if (requiredSIP > 100000) {
                showNotification('Required SIP amount is very high. Consider increasing the time period or reducing the target.', 'warning');
            }

            // Update results
            document.getElementById('requiredSIP').textContent = `₹${Math.round(requiredSIP).toLocaleString('en-IN')}`;
            document.getElementById('goalTotalInvestment').textContent = `₹${Math.round(totalInvestment).toLocaleString('en-IN')}`;
            document.getElementById('goalTotalReturns').textContent = `₹${Math.round(totalReturns).toLocaleString('en-IN')}`;

            // Show goal results
            document.getElementById('goalResult').style.display = 'block';

            // Create goal chart
            updateGoalChart(totalInvestment, totalReturns, targetAmount);

            showNotification('Goal planning calculation completed!', 'success');

        } catch (error) {
            console.error('Goal Calculation Error:', error);
            showNotification('Error in goal calculation. Please check your inputs.', 'error');
        }
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