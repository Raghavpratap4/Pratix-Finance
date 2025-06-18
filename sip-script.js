// SIP Calculator JavaScript - Professional Version
document.addEventListener('DOMContentLoaded', function() {
    console.log('SIP Calculator - Professional Version Loading...');

    // Global variables
    let sipChart = null;
    let goalChart = null;
    let sipComparisonChart = null;
    let analysisChart = null;
    let lumpsumChart = null;

    // Error tracking
    const errors = [];

    // Utility Functions
    function logError(error, context) {
        errors.push({ error: error.message, context, timestamp: new Date() });
        console.error(`[${context}]`, error);
    }

    function validateNumber(value, required = true) {
        if (required && (!value || value === '')) {
            return { valid: false, message: 'This field is required' };
        }

        const num = parseFloat(value);
        if (isNaN(num)) {
            return { valid: false, message: 'Please enter a valid number' };
        }

        if (num <= 0) {
            return { valid: false, message: 'Value must be greater than 0' };
        }

        return { valid: true, value: num };
    }

    function formatCurrency(amount) {
        try {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (error) {
            return `₹${Math.round(amount).toLocaleString('en-IN')}`;
        }
    }

    function showError(message, duration = 5000) {
        showNotification(message, 'error', duration);
    }

    function showSuccess(message, duration = 3000) {
        showNotification(message, 'success', duration);
    }

    // Tab switching functionality - COMPLETELY FIXED
    function initTabNavigation() {
        console.log('🔄 Initializing tab navigation...');
        
        try {
            // Get ALL navigation items
            const allNavItems = document.querySelectorAll('[data-tab]');
            const tabContents = document.querySelectorAll('.tab-content');

            console.log('✅ Found nav items:', allNavItems.length);
            console.log('✅ Found tab contents:', tabContents.length);

            function switchTab(targetTab) {
                console.log('🎯 Switching to tab:', targetTab);

                // Remove active from ALL navigation items
                allNavItems.forEach(item => {
                    item.classList.remove('active');
                });

                // Hide ALL tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });

                // Activate target navigation items
                const targetNavItems = document.querySelectorAll(`[data-tab="${targetTab}"]`);
                targetNavItems.forEach(item => {
                    item.classList.add('active');
                });

                // Show target tab content
                const activeTabContent = document.getElementById(targetTab);
                if (activeTabContent) {
                    activeTabContent.classList.add('active');
                    activeTabContent.style.display = 'block';
                    console.log('✅ Tab activated:', targetTab);
                } else {
                    console.error('❌ Tab content not found:', targetTab);
                }
            }

            // Add click listeners to ALL navigation items
            allNavItems.forEach(item => {
                // Remove existing listeners
                item.onclick = null;
                
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetTab = this.getAttribute('data-tab');
                    console.log('🖱️ Tab clicked:', targetTab);
                    
                    if (targetTab) {
                        switchTab(targetTab);
                    }
                });

                // Add touch support for mobile
                item.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetTab = this.getAttribute('data-tab');
                    if (targetTab) {
                        switchTab(targetTab);
                    }
                });
            });

            // Initialize first tab
            setTimeout(() => {
                const firstTab = 'sip-calculator';
                console.log('🚀 Initializing first tab:', firstTab);
                switchTab(firstTab);
            }, 100);

            // Make switchTab globally available
            window.switchTab = switchTab;
            console.log('✅ Tab navigation initialized successfully!');

        } catch (error) {
            console.error('❌ Error in initTabNavigation:', error);
        }
    }

    // Navigation functions
    window.goBack = function() {
        try {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            window.location.href = 'index.html';
        }
    };

    window.goToHome = function() {
        window.location.href = 'index.html';
    };

    // Enhanced SIP Calculator with proper error handling
    function initSIPCalculator() {
        try {
            const calculateBtn = document.getElementById('calculateSIP');
            const refreshBtn = document.getElementById('refreshSIP');
            const chartTypeSelector = document.getElementById('sipChartType');
            const downloadPDFBtn = document.getElementById('downloadSIPPDF');

            // Initialize with empty chart
            initSIPChart();

    // Input validation for SIP Calculator - NO red border initially
    const sipInputs = ['monthlyAmountInput', 'returnRateInput', 'investmentPeriodInput'];
    sipInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Remove any input restrictions
            input.removeAttribute('max');
            input.removeAttribute('min');

            // CLEAR ALL VALIDATION STYLES - NO RED BORDER INITIALLY
            input.style.borderColor = '';
            input.classList.remove('input-error', 'input-success');
            clearErrorState(input);

            input.addEventListener('input', function() {
                // ALWAYS clear validation styles when user is typing
                this.style.borderColor = '';
                this.classList.remove('input-error', 'input-success');
                clearErrorState(this);

                // Auto-calculate if all inputs are valid
                if (hasValidInputs()) {
                    calculateSIP();
                }
            });

            input.addEventListener('focus', function() {
                // ALWAYS clear validation styles on focus
                this.style.borderColor = '';
                this.classList.remove('input-error', 'input-success');
                clearErrorState(this);
            });
        }
    });

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
                    if (hasValidInputs()) {
                        calculateSIP();
                    }
                });
            });

            if (calculateBtn) {
                calculateBtn.addEventListener('click', function() {
                    if (validateAllSIPInputs()) {
                        calculateSIP();
                        showSuccess('SIP calculated successfully!');
                    }
                });
            }

            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    resetSIPInputs();
                    showSuccess('Calculator refreshed!');
                });
            }

            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', function() {
                    if (hasValidInputs()) {
                        calculateSIP();
                    }
                });
            }

            if (downloadPDFBtn) {
                downloadPDFBtn.addEventListener('click', generateSIPPDF);
            }

        } catch (error) {
            logError(error, 'initSIPCalculator');
        }
    }

    function validateSIPInput(input) {
        try {
            const value = input.value.trim();
            let validation;

            switch (input.id) {
                case 'monthlyAmountInput':
                case 'returnRateInput':
                case 'investmentPeriodInput':
                    validation = validateNumber(value, true);
                    break;
                case 'stepUpRate':
                    validation = validateNumber(value, false);
                    break;
                default:
                    validation = { valid: true };
            }

            if (!validation.valid) {
                showInputError(input, validation.message);
                setInputState(input, 'error');
                return false;
            } else {
                clearErrorState(input);
                setInputState(input, 'success');
                return true;
            }
        } catch (error) {
            logError(error, 'validateSIPInput');
            return false;
        }
    }

    function setInputState(input, state) {
        try {
            // Remove existing state classes
            input.classList.remove('input-error', 'input-success');

            if (state === 'error') {
                input.classList.add('input-error');
            } else if (state === 'success') {
                input.classList.add('input-success');
            }
        } catch (error) {
            logError(error, 'setInputState');
        }
    }

    function validateAllSIPInputs() {
        try {
            const inputs = ['monthlyAmountInput', 'returnRateInput', 'investmentPeriodInput'];
            let allValid = true;

            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input && !validateSIPInput(input)) {
                    allValid = false;
                }
            });

            // Validate step-up rate if step-up SIP is selected
            const stepUpSIP = document.getElementById('stepUpSIP');
            if (stepUpSIP && stepUpSIP.checked) {
                const stepUpInput = document.getElementById('stepUpRate');
                if (stepUpInput && !validateSIPInput(stepUpInput)) {
                    allValid = false;
                }
            }

            if (!allValid) {
                showError('Please correct the errors before calculating');
            }

            return allValid;
        } catch (error) {
            logError(error, 'validateAllSIPInputs');
            return false;
        }
    }

    function showInputError(input, message) {
        try {
            input.style.borderColor = '#ff4757';
            input.setAttribute('aria-invalid', 'true');

            // Remove existing error message
            const existingError = input.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = 'color: #ff4757; font-size: 0.8rem; margin-top: 0.25rem;';
            errorDiv.textContent = message;
            input.parentNode.appendChild(errorDiv);
        } catch (error) {
            logError(error, 'showInputError');
        }
    }

    function clearErrorState(input) {
        try {
            input.style.borderColor = '';
            input.removeAttribute('aria-invalid');

            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        } catch (error) {
            logError(error, 'clearErrorState');
        }
    }

    function resetSIPInputs() {
        try {
            const inputs = ['monthlyAmountInput', 'returnRateInput', 'investmentPeriodInput', 'stepUpRate'];
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = '';
                    clearErrorState(input);
                    // Clear validation state classes
                    input.classList.remove('input-error', 'input-success');
                }
            });

            // Reset radio buttons
            const regularSIP = document.getElementById('regularSIP');
            if (regularSIP) {
                regularSIP.checked = true;
            }

            const stepUpGroup = document.getElementById('stepUpGroup');
            if (stepUpGroup) {
                stepUpGroup.style.display = 'none';
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
            }
            initSIPChart();

        } catch (error) {
            logError(error, 'resetSIPInputs');
        }
    }

    function hasValidInputs() {
        try {
            const monthlyAmount = document.getElementById('monthlyAmountInput')?.value;
            const returnRate = document.getElementById('returnRateInput')?.value;
            const period = document.getElementById('investmentPeriodInput')?.value;

            return monthlyAmount && returnRate && period && 
                   !isNaN(parseFloat(monthlyAmount)) && 
                   !isNaN(parseFloat(returnRate)) && 
                   !isNaN(parseFloat(period));
        } catch (error) {
            logError(error, 'hasValidInputs');
            return false;
        }
    }

    function calculateSIP() {
        try {
            if (!hasValidInputs()) {
                return;
            }

            const monthlyAmount = parseFloat(document.getElementById('monthlyAmountInput').value);
            const annualReturn = parseFloat(document.getElementById('returnRateInput').value);
            const years = parseFloat(document.getElementById('investmentPeriodInput').value);
            const sipType = document.querySelector('input[name="sipType"]:checked')?.value || 'regular';
            const stepUpRate = parseFloat(document.getElementById('stepUpRate')?.value) || 10;

            const monthlyReturn = annualReturn / 12 / 100;
            const totalMonths = years * 12;

            let totalInvestment = 0;
            let maturityValue = 0;

            if (sipType === 'regular') {
                totalInvestment = monthlyAmount * totalMonths;
                if (monthlyReturn === 0) {
                    maturityValue = totalInvestment;
                } else {
                    maturityValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
                }
            } else {
                // Step-up SIP calculation
                let currentAmount = monthlyAmount;
                let futureValue = 0;

                for (let year = 1; year <= years; year++) {
                    const monthsInYear = 12;
                    const yearInvestment = currentAmount * monthsInYear;
                    totalInvestment += yearInvestment;

                    const remainingMonths = (years - year + 1) * 12 - 12;
                    if (monthlyReturn === 0) {
                        futureValue += yearInvestment;
                    } else {
                        const yearFV = currentAmount * ((Math.pow(1 + monthlyReturn, monthsInYear) - 1) / monthlyReturn);
                        futureValue += yearFV * Math.pow(1 + monthlyReturn, remainingMonths);
                    }

                    if (year < years) {
                        currentAmount = currentAmount * (1 + stepUpRate / 100);
                    }
                }
                maturityValue = futureValue;
            }

            const totalReturns = maturityValue - totalInvestment;

            // Update display with proper error handling
            updateSIPResults(totalInvestment, totalReturns, maturityValue);
            updateSIPChart(totalInvestment, totalReturns);

        } catch (error) {
            logError(error, 'calculateSIP');
            showError('Error calculating SIP. Please check your inputs.');
        }
    }

    function updateSIPResults(totalInvestment, totalReturns, maturityValue) {
        try {
            const elements = {
                totalInvestment: document.getElementById('totalInvestment'),
                totalReturns: document.getElementById('totalReturns'),
                maturityValue: document.getElementById('maturityValue'),
                resultsCard: document.getElementById('sipResults')
            };

            if (elements.totalInvestment) {
                elements.totalInvestment.textContent = formatCurrency(totalInvestment);
            }
            if (elements.totalReturns) {
                elements.totalReturns.textContent = formatCurrency(totalReturns);
            }
            if (elements.maturityValue) {
                elements.maturityValue.textContent = formatCurrency(maturityValue);
            }
            if (elements.resultsCard) {
                elements.resultsCard.style.display = 'block';
            }
        } catch (error) {
            logError(error, 'updateSIPResults');
        }
    }

    function initSIPChart() {
        try {
            const ctx = document.getElementById('sipChart');
            if (!ctx) return;

            // Destroy existing chart
            if (sipChart) {
                sipChart.destroy();
                sipChart = null;
            }

            sipChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Investment', 'Returns'],
                    datasets: [{
                        data: [50, 50],
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
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                    return `${context.label}: ${percentage}%`;
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
        } catch (error) {
            logError(error, 'initSIPChart');
        }
    }

    function updateSIPChart(investment, returns) {
        try {
            const chartType = document.getElementById('sipChartType')?.value || 'doughnut';

            if (sipChart) {
                sipChart.destroy();
                sipChart = null;
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
                                borderWidth: 1,
                                callbacks: {
                                    label: function(context) {
                                        const value = context.parsed;
                                        return `${context.label}: ${formatCurrency(value)}`;
                                    }
                                }
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
                                        return formatCurrency(value);
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
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                    }
                                }
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
                                        return formatCurrency(value);
                                    }
                                },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            logError(error, 'updateSIPChart');
        }
    }

    function calculateMaturityForYear(monthlyAmount, annualReturn, years) {
        try {
            const monthlyReturn = annualReturn / 12 / 100;
            const totalMonths = years * 12;

            if (monthlyReturn === 0) {
                return monthlyAmount * totalMonths;
            }

            return monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
        } catch (error) {
            logError(error, 'calculateMaturityForYear');
            return 0;
        }
    }

    // Goal Based Planning
    function initGoalPlanning() {
        try {
            const calculateGoalBtn = document.getElementById('calculateGoal');
            const refreshGoalBtn = document.getElementById('refreshGoal');
            const chartTypeSelector = document.getElementById('goalChartType');
            const downloadPDFBtn = document.getElementById('downloadGoalPDF');

     // Initialize validation for Goal Planning inputs - NO RED BORDER INITIALLY
     const goalInputs = ['targetAmount', 'goalYears', 'goalReturnRate'];
     goalInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.removeAttribute('max');
            input.removeAttribute('min');
            
            // CLEAR ALL VALIDATION STYLES INITIALLY
            input.style.borderColor = '';
            input.classList.remove('input-error', 'input-success');
            clearErrorState(input);

            input.addEventListener('input', function() {
                if (this.value.trim() === '') {
                    clearErrorState(this);
                    this.classList.remove('input-error', 'input-success');
                } else {
                    validateGoalInput(this);
                }
            });

            input.addEventListener('blur', function() {
                if (this.value.trim() !== '') {
                    validateGoalInput(this);
                }
            });

            input.addEventListener('focus', function() {
                clearErrorState(this);
                this.classList.remove('input-error');
            });
        }
    });

            if (calculateGoalBtn) {
                calculateGoalBtn.addEventListener('click', function() {
                    if (validateGoalInputs()) {
                        calculateGoalBasedSIP();
                        showSuccess('Goal planning calculated!');
                    }
                });
            }

            if (refreshGoalBtn) {
                refreshGoalBtn.addEventListener('click', function() {
                    resetGoalInputs();
                    showSuccess('Goal planning refreshed!');
                });
            }

            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', function() {
                    const goalResult = document.getElementById('goalResult');
                    if (goalResult && goalResult.style.display !== 'none') {
                        calculateGoalBasedSIP();
                    }
                });
            }

            if (downloadPDFBtn) {
                downloadPDFBtn.addEventListener('click', generateGoalPDF);
            }
        } catch (error) {
            logError(error, 'initGoalPlanning');
        }
    }

    function validateGoalInputs() {
        try {
            const targetAmount = document.getElementById('targetAmount')?.value;
            const years = document.getElementById('goalYears')?.value;
            const returnRate = document.getElementById('goalReturnRate')?.value;

            if (!targetAmount || !years || !returnRate) {
                showError('Please fill all goal details');
                return false;
            }

            const amountValidation = validateNumber(targetAmount, true);
            const yearsValidation = validateNumber(years, true);
            const returnValidation = validateNumber(returnRate, true);

            if (!amountValidation.valid) {
                showError(`Target Amount: ${amountValidation.message}`);
                return false;
            }

            if (!yearsValidation.valid) {
                showError(`Years: ${yearsValidation.message}`);
                return false;
            }

            if (!returnValidation.valid) {
                showError(`Return Rate: ${returnValidation.message}`);
                return false;
            }

            return true;
        } catch (error) {
            logError(error, 'validateGoalInputs');
            return false;
        }
    }

    function resetGoalInputs() {
        try {
            const inputs = ['goalType', 'targetAmount', 'goalYears', 'goalReturnRate'];
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = '';
                }
            });

            const goalResult = document.getElementById('goalResult');
            if (goalResult) {
                goalResult.style.display = 'none';
            }

            if (goalChart) {
                goalChart.destroy();
                goalChart = null;
            }
        } catch (error) {
            logError(error, 'resetGoalInputs');
        }
    }

    function calculateGoalBasedSIP() {
        try {
            const targetAmount = parseFloat(document.getElementById('targetAmount')?.value);
            const years = parseFloat(document.getElementById('goalYears')?.value);
            const annualReturn = parseFloat(document.getElementById('goalReturnRate')?.value);

            if (!targetAmount || !years || !annualReturn) {
                showError('Please fill all goal details');
                return;
            }

            const monthlyReturn = annualReturn / 12 / 100;
            const totalMonths = years * 12;

            let requiredSIP;
            if (monthlyReturn === 0) {
                requiredSIP = targetAmount / totalMonths;
            } else {
                requiredSIP = (targetAmount * monthlyReturn) / (Math.pow(1 + monthlyReturn, totalMonths) - 1);
            }

            const totalInvestment = requiredSIP * totalMonths;
            const totalReturns = targetAmount - totalInvestment;

            // Update display
            const elements = {
                requiredSIP: document.getElementById('requiredSIP'),
                goalTotalInvestment: document.getElementById('goalTotalInvestment'),
                goalTotalReturns: document.getElementById('goalTotalReturns'),
                goalResult: document.getElementById('goalResult')
            };

            if (elements.requiredSIP) {
                elements.requiredSIP.textContent = formatCurrency(requiredSIP);
            }
            if (elements.goalTotalInvestment) {
                elements.goalTotalInvestment.textContent = formatCurrency(totalInvestment);
            }
            if (elements.goalTotalReturns) {
                elements.goalTotalReturns.textContent = formatCurrency(totalReturns);
            }
            if (elements.goalResult) {
                elements.goalResult.style.display = 'block';
            }

            updateGoalChart(totalInvestment, totalReturns, years);

        } catch (error) {
            logError(error, 'calculateGoalBasedSIP');
            showError('Error calculating goal-based SIP');
        }
    }

    function updateGoalChart(investment, returns, years) {
        try {
            const chartType = document.getElementById('goalChartType')?.value || 'line';

            if (goalChart) {
                goalChart.destroy();
                goalChart = null;
            }

            const ctx = document.getElementById('goalChart');
            if (!ctx) return;

            const yearlyData = [];
            const requiredSIP = parseFloat(document.getElementById('requiredSIP')?.textContent.replace(/[₹,]/g, '')) || 0;
            const annualReturn = parseFloat(document.getElementById('goalReturnRate')?.value) || 12;

            for (let i = 1; i <= years; i++) {
                const yearlyInvestment = requiredSIP * 12 * i;
                const yearlyMaturity = calculateMaturityForYear(requiredSIP, annualReturn, i);
                yearlyData.push({
                    year: i,
                    investment: yearlyInvestment,
                    maturity: yearlyMaturity
                });
            }

            const chartConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: 'white' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
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
                                return formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            };

            if (chartType === 'line') {
                goalChart = new Chart(ctx, {
                    type: 'line',
                    data:```
{
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
                    options: chartConfig
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
                    options: chartConfig
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
                    options: chartConfig
                });
            }
        } catch (error) {
            logError(error, 'updateGoalChart');
        }
    }

    // SIP Comparison
    function initSIPComparison() {
        try {
            const sipCountSelector = document.getElementById('sipCount');
            const compareSIPsBtn = document.getElementById('compareSIPs');
            const refreshComparisonBtn = document.getElementById('refreshComparison');
            const chartTypeSelector = document.getElementById('comparisonChartType');
            const downloadPDFBtn = document.getElementById('downloadComparisonPDF');

            if (sipCountSelector) {
                sipCountSelector.addEventListener('change', function() {
                    const count = parseInt(this.value);
                    if (count) {
                        generateComparisonInputs(count);
                    }
                });
            }

            if (compareSIPsBtn) {
                compareSIPsBtn.addEventListener('click', function() {
                    if (validateComparisonInputs()) {
                        compareSIPOptions();
                        showSuccess('SIPs compared successfully!');
                    }
                });
            }

            if (refreshComparisonBtn) {
                refreshComparisonBtn.addEventListener('click', function() {
                    resetComparisonInputs();
                    showSuccess('SIP comparison refreshed!');
                });
            }

            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', function() {
                    const results = document.getElementById('comparisonResults');
                    if (results && results.style.display !== 'none') {
                        compareSIPOptions();
                    }
                });
            }

            if (downloadPDFBtn) {
                downloadPDFBtn.addEventListener('click', generateComparisonPDF);
            }
        } catch (error) {
            logError(error, 'initSIPComparison');
        }
    }

    function validateComparisonInputs() {
        try {
            const sipCount = parseInt(document.getElementById('sipCount')?.value);
            if (!sipCount) {
                showError('Please select number of SIPs to compare');
                return false;
            }

            let allValid = true;
            for (let i = 1; i <= sipCount; i++) {
                const amount = document.getElementById(`sip${i}Amount`)?.value;
                const returnRate = document.getElementById(`sip${i}Return`)?.value;
                const period = document.getElementById(`sip${i}Period`)?.value;

                if (!amount || !returnRate || !period) {
                    showError(`Please fill all details for SIP Option ${i}`);
                    allValid = false;
                    break;
                }

                const amountValidation = validateNumber(amount, 100, 10000000);
                const returnValidation = validateNumber(returnRate, 0.1, 50);
                const periodValidation = validateNumber(period, 1, 50);

                if (!amountValidation.valid || !returnValidation.valid || !periodValidation.valid) {
                    showError(`Invalid input for SIP Option ${i}`);
                    allValid = false;
                    break;
                }
            }

            return allValid;
        } catch (error) {
            logError(error, 'validateComparisonInputs');
            return false;
        }
    }

    function resetComparisonInputs() {
        try {
            const sipCountSelect = document.getElementById('sipCount');
            if (sipCountSelect) {
                sipCountSelect.value = '';
            }

            const comparisonInputs = document.getElementById('comparisonInputs');
            if (comparisonInputs) {
                comparisonInputs.innerHTML = '';
            }

            const comparisonResults = document.getElementById('comparisonResults');
            if (comparisonResults) {
                comparisonResults.style.display = 'none';
            }

            if (sipComparisonChart) {
                sipComparisonChart.destroy();
                sipComparisonChart = null;
            }
        } catch (error) {
            logError(error, 'resetComparisonInputs');
        }
    }

    function generateComparisonInputs(count) {
        try {
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
                                <input type="number" id="sip${i}Amount" placeholder="5,000" class="calc-input" step="1">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Expected Return (%)</label>
                            <input type="number" id="sip${i}Return" placeholder="12" class="calc-input" step="0.1">
                        </div>
                        <div class="input-group">
                            <label>Period (Years)</label>
                            <input type="number" id="sip${i}Period" placeholder="10" class="calc-input" step="1">
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        } catch (error) {
            logError(error, 'generateComparisonInputs');
        }
    }

    function compareSIPOptions() {
        try {
            const sipCount = parseInt(document.getElementById('sipCount')?.value);
            if (!sipCount) {
                showError('Please select number of SIPs to compare');
                return;
            }

            const sipData = [];

            for (let i = 1; i <= sipCount; i++) {
                const amount = parseFloat(document.getElementById(`sip${i}Amount`)?.value);
                const returnRate = parseFloat(document.getElementById(`sip${i}Return`)?.value);
                const period = parseFloat(document.getElementById(`sip${i}Period`)?.value);

                if (!amount || !returnRate || !period) {
                    showError(`Please fill all details for SIP Option ${i}`);
                    return;
                }

                // Calculate SIP
                const monthlyReturn = returnRate / 12 / 100;
                const totalMonths = period * 12;
                const investment = amount * totalMonths;

                let maturity;
                if (monthlyReturn === 0) {
                    maturity = investment;
                } else {
                    maturity = amount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
                }

                const returns = maturity - investment;

                sipData.push({
                    option: i,
                    monthlyAmount: amount,
                    investment: investment,
                    maturity: maturity,
                    returns: returns
                });
            }

            // Update comparison table
            updateComparisonTable(sipData);

            const comparisonResults = document.getElementById('comparisonResults');
            if (comparisonResults) {
                comparisonResults.style.display = 'block';
            }

            updateSIPComparisonChart(sipData);

        } catch (error) {
            logError(error, 'compareSIPOptions');
            showError('Error comparing SIP options');
        }
    }

    function updateComparisonTable(sipData) {
        try {
            const tableBody = document.getElementById('comparisonTableBody');
            if (!tableBody) return;

            let tableHTML = '';
            sipData.forEach(sip => {
                tableHTML += `
                    <tr>
                        <td>SIP Option ${sip.option}</td>
                        <td>${formatCurrency(sip.monthlyAmount)}</td>
                        <td>${formatCurrency(sip.investment)}</td>
                        <td>${formatCurrency(sip.maturity)}</td>
                        <td>${formatCurrency(sip.returns)}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = tableHTML;
        } catch (error) {
            logError(error, 'updateComparisonTable');
        }
    }

    function updateSIPComparisonChart(sipData) {
        try {
            const chartType = document.getElementById('comparisonChartType')?.value || 'bar';

            if (sipComparisonChart) {
                sipComparisonChart.destroy();
                sipComparisonChart = null;
            }

            const ctx = document.getElementById('sipComparisonChart');
            if (!ctx) return;

            const labels = sipData.map(sip => `SIP ${sip.option}`);
            const maturityValues = sipData.map(sip => sip.maturity);
            const colors = ['rgba(49, 65, 127, 0.8)', 'rgba(240, 147, 251, 0.8)', 'rgba(0, 255, 136, 0.8)', 'rgba(255, 0, 128, 0.8)'];

            const chartConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: 'white' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
                            }
                        }
                    }
                }
            };

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
                        ...chartConfig,
                        scales: {
                            x: {
                                ticks: { color: 'white' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            y: {
                                ticks: {
                                    color: 'white',
                                    callback: function(value) {
                                        return formatCurrency(value);
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
                        ...chartConfig,
                        scales: {
                            x: {
                                ticks: { color: 'white' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            y: {
                                ticks: {
                                    color: 'white',
                                    callback: function(value) {
                                        return formatCurrency(value);
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
                const normalizedData = maturityValues.map(value => maxValue > 0 ? (value / maxValue) * 100 : 0);

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
                        ...chartConfig,
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
        } catch (error) {
            logError(error, 'updateSIPComparisonChart');
        }
    }

    // Investment Analysis
    function initInvestmentAnalysis() {
        try {
            const calculateAnalysisBtn = document.getElementById('calculateAnalysis');
            const refreshAnalysisBtn = document.getElementById('refreshAnalysis');
            const chartTypeSelector = document.getElementById('analysisChartType');
            const downloadPDFBtn = document.getElementById('downloadAnalysisPDF');

             // Initialize validation for Analysis inputs
    const analysisInputs = ['analysisMonthlyAmount', 'analysisReturnRate', 'analysisPeriod', 'inflationRate'];
    analysisInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.removeAttribute('max');
            input.removeAttribute('min');
            clearErrorState(input);
            input.classList.remove('input-error', 'input-success');

            input.addEventListener('input', function() {
                clearErrorState(this);
                this.classList.remove('input-error', 'input-success');

                if (this.value.trim() !== '' && validateAnalysisInput(this)) {
                    this.classList.add('input-success');
                }
            });

            input.addEventListener('blur', function() {
                if (this.value.trim() === '' && this.hasAttribute('data-validation-attempted')) {
                    validateAnalysisInput(this);
                }
            });

            input.addEventListener('focus', function() {
                clearErrorState(this);
                this.classList.remove('input-error');
            });
        }
    });

            if (calculateAnalysisBtn) {
                calculateAnalysisBtn.addEventListener('click', function() {
                    if (validateAnalysisInputs()) {
                        calculateInvestmentAnalysis();
                        showSuccess('Investment analysis calculated!');
                    }
                });
            }

            if (refreshAnalysisBtn) {
                refreshAnalysisBtn.addEventListener('click', function() {
                    resetAnalysisInputs();
                    showSuccess('Investment analysis refreshed!');
                });
            }

            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', function() {
                    const results = document.getElementById('analysisResults');
                    if (results && results.style.display !== 'none') {
                        calculateInvestmentAnalysis();
                    }
                });
            }

            if (downloadPDFBtn) {
                downloadPDFBtn.addEventListener('click', generateAnalysisPDF);
            }
        } catch (error) {
            logError(error, 'initInvestmentAnalysis');
        }
    }

    function validateAnalysisInputs() {
        try {
            const monthlyAmount = document.getElementById('analysisMonthlyAmount')?.value;
            const returnRate = document.getElementById('analysisReturnRate')?.value;
            const period = document.getElementById('analysisPeriod')?.value;
            const inflationRate = document.getElementById('inflationRate')?.value;

            if (!monthlyAmount || !returnRate || !period) {
                showError('Please fill all required analysis details');
                return false;
            }

            const amountValidation = validateNumber(monthlyAmount, 100, 10000000);
            const returnValidation = validateNumber(returnRate, 0.1, 50);
            const periodValidation = validateNumber(period, 1, 50);
            const inflationValidation = validateNumber(inflationRate, 0, 25, false);

            if (!amountValidation.valid) {
                showError(`Monthly Amount: ${amountValidation.message}`);
                return false;
            }

            if (!returnValidation.valid) {
                showError(`Return Rate: ${returnValidation.message}`);
                return false;
            }

            if (!periodValidation.valid) {
                showError(`Period: ${periodValidation.message}`);
                return false;
            }

            if (inflationRate && !inflationValidation.valid) {
                showError(`Inflation Rate: ${inflationValidation.message}`);
                return false;
            }

            return true;
        } catch (error) {
            logError(error, 'validateAnalysisInputs');
            return false;
        }
    }

    function resetAnalysisInputs() {
        try {
            const inputs = ['analysisMonthlyAmount', 'analysisReturnRate', 'analysisPeriod', 'inflationRate'];
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = '';
                }
            });

            const analysisResults = document.getElementById('analysisResults');
            if (analysisResults) {
                analysisResults.style.display = 'none';
            }

            if (analysisChart) {
                analysisChart.destroy();
                analysisChart = null;
            }
        } catch (error) {
            logError(error, 'resetAnalysisInputs');
        }
    }

    function calculateInvestmentAnalysis() {
        try {
            const monthlyAmount = parseFloat(document.getElementById('analysisMonthlyAmount')?.value);
            const annualReturn = parseFloat(document.getElementById('analysisReturnRate')?.value);
            const years = parseFloat(document.getElementById('analysisPeriod')?.value);
            const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

            if (!monthlyAmount || !annualReturn || !years) {
                showError('Please fill all analysis details');
                return;
            }

            const monthlyReturn = annualReturn / 12 / 100;
            const totalMonths = years * 12;
            const totalInvestment = monthlyAmount * totalMonths;

            let nominalValue;
            if (monthlyReturn === 0) {
                nominalValue = totalInvestment;
            } else {
                nominalValue = monthlyAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
            }

            // Real value calculation (inflation adjusted)
            const realValue = nominalValue / Math.pow(1 + inflationRate / 100, years);
            const realReturns = realValue - totalInvestment;

            // Update display
            const elements = {
                nominalValue: document.getElementById('nominalValue'),
                realValue: document.getElementById('realValue'),
                analysisTotalInvestment: document.getElementById('analysisTotalInvestment'),
                realReturns: document.getElementById('realReturns'),
                analysisResults: document.getElementById('analysisResults')
            };

            if (elements.nominalValue) {
                elements.nominalValue.textContent = formatCurrency(nominalValue);
            }
            if (elements.realValue) {
                elements.realValue.textContent = formatCurrency(realValue);
            }
            if (elements.analysisTotalInvestment) {
                elements.analysisTotalInvestment.textContent = formatCurrency(totalInvestment);
            }
            if (elements.realReturns) {
                elements.realReturns.textContent = formatCurrency(realReturns);
            }
            if (elements.analysisResults) {
                elements.analysisResults.style.display = 'block';
            }

            updateAnalysisChart(totalInvestment, nominalValue, realValue, years);

        } catch (error) {
            logError(error, 'calculateInvestmentAnalysis');
            showError('Error calculating investment analysis');
        }
    }

    function updateAnalysisChart(investment, nominalValue, realValue, years) {
        try {
            const chartType = document.getElementById('analysisChartType')?.value || 'line';

            if (analysisChart) {
                analysisChart.destroy();
                analysisChart = null;
            }

            const ctx = document.getElementById('analysisChart');
            if (!ctx) return;

            const chartConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: 'white' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
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
                                return formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            };

            if (chartType === 'line') {
                const monthlyAmount = parseFloat(document.getElementById('analysisMonthlyAmount')?.value);
                const annualReturn = parseFloat(document.getElementById('analysisReturnRate')?.value);
                const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

                const yearlyData = [];
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
                    options: chartConfig
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
                        ...chartConfig,
                        plugins: { legend: { display: false } }
                    }
                });
            } else if (chartType === 'area') {
                const monthlyAmount = parseFloat(document.getElementById('analysisMonthlyAmount')?.value);
                const annualReturn = parseFloat(document.getElementById('analysisReturnRate')?.value);
                const inflationRate = parseFloat(document.getElementById('inflationRate')?.value) || 6;

                const yearlyData = [];
                for (let year = 1; year <= years; year++) {
                    const yearlyNominal = calculateMaturityForYear(monthlyAmount, annualReturn, year);
                    const yearlyReal = yearlyNominal / Math.pow(1 + inflationRate / 100, year);

                    yearlyData.push({
                        year: year,
                        nominal: yearlyNominal,
                        real: yearlyReal
                    });
                }

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
                    options: chartConfig
                });
            }
        } catch (error) {
            logError(error, 'updateAnalysisChart');
        }
    }

     // Initialize validation for Lumpsum vs SIP inputs
     const lumpsumInputs = ['investmentAmount', 'alternativeSIP', 'comparisonReturnRate', 'comparisonPeriod'];
     lumpsumInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.removeAttribute('max');
            input.removeAttribute('min');
            clearErrorState(input);
            input.classList.remove('input-error', 'input-success');

            input.addEventListener('input', function() {
                if (this.value.trim() === '') {
                    clearErrorState(this);
                    this.classList.remove('input-error', 'input-success');
                } else {
                    validateLumpsumInput(this);
                }
            });

            input.addEventListener('blur', function() {
                if (this.value.trim() !== '') {
                    validateLumpsumInput(this);
                }
            });

            input.addEventListener('focus', function() {
                clearErrorState(this);
                this.classList.remove('input-error');
            });
        }
    });

    // Lumpsum vs SIP Comparison
    function initLumpsumComparison() {
        try {
            const compareInvestmentBtn = document.getElementById('compareInvestment');
            const refreshComparisonBtn = document.getElementById('refreshComparison2');
            const chartTypeSelector = document.getElementById('lumpsumChartType');
            const downloadPDFBtn = document.getElementById('downloadLumpsumPDF');

            if (compareInvestmentBtn) {
                compareInvestmentBtn.addEventListener('click', function() {
                    if (validateLumpsumInputs()) {
                        calculateLumpsumComparison();
                        showSuccess('Investment comparison calculated!');
                    }
                });
            }

            if (refreshComparisonBtn) {
                refreshComparisonBtn.addEventListener('click', function() {
                    resetLumpsumInputs();
                    showSuccess('Comparison refreshed!');
                });
            }

            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', function() {
                    const results = document.getElementById('lumpsumResults');
                    if (results && results.style.display !== 'none') {
                        calculateLumpsumComparison();
                    }
                });
            }

            if (downloadPDFBtn) {
                downloadPDFBtn.addEventListener('click', generateLumpsumPDF);
            }
        } catch (error) {
            logError(error, 'initLumpsumComparison');
        }
    }

    function validateLumpsumInputs() {
        try {
            const lumpsumAmount = document.getElementById('investmentAmount')?.value;
            const sipAmount = document.getElementById('alternativeSIP')?.value;
            const returnRate = document.getElementById('comparisonReturnRate')?.value;
            const period = document.getElementById('comparisonPeriod')?.value;

            if (!lumpsumAmount || !sipAmount || !returnRate || !period) {
                showError('Please fill all comparison details');
                return false;
            }

            const lumpsumValidation = validateNumber(lumpsumAmount, 10000, 100000000);
            const sipValidation = validateNumber(sipAmount, 100, 1000000);
            const returnValidation = validateNumber(returnRate, 0.1, 50);
            const periodValidation = validateNumber(period, 1, 50);

            if (!lumpsumValidation.valid) {
                showError(`Lumpsum Amount: ${lumpsumValidation.message}`);
                return false;
            }

            if (!sipValidation.valid) {
                showError(`SIP Amount: ${sipValidation.message}`);
                return false;
            }

            if (!returnValidation.valid) {
                showError(`Return Rate: ${returnValidation.message}`);
                return false;
            }

            if (!periodValidation.valid) {
                showError(`Period: ${periodValidation.message}`);
                return false;
            }

            return true;
        } catch (error) {
            logError(error, 'validateLumpsumInputs');
            return false;
        }
    }

    function resetLumpsumInputs() {
        try {
            const inputs = ['investmentAmount', 'alternativeSIP', 'comparisonReturnRate', 'comparisonPeriod'];
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = '';
                }
            });

            const lumpsumResults = document.getElementById('lumpsumResults');
            if (lumpsumResults) {
                lumpsumResults.style.display = 'none';
            }

            if (lumpsumChart) {
                lumpsumChart.destroy();
                lumpsumChart = null;
            }
        } catch (error) {
            logError(error, 'resetLumpsumInputs');
        }
    }

    function calculateLumpsumComparison() {
        try {
            const lumpsumAmount = parseFloat(document.getElementById('investmentAmount')?.value);
            const sipAmount = parseFloat(document.getElementById('alternativeSIP')?.value);
            const annualReturn = parseFloat(document.getElementById('comparisonReturnRate')?.value);
            const years = parseFloat(document.getElementById('comparisonPeriod')?.value);

            if (!lumpsumAmount || !sipAmount || !annualReturn || !years) {
                showError('Please fill all comparison details');
                return;
            }

            // Lumpsum calculation
            const lumpsumFinal = lumpsumAmount * Math.pow(1 + annualReturn / 100, years);
            const lumpsumReturns = lumpsumFinal - lumpsumAmount;

            // SIP calculation
            const monthlyReturn = annualReturn / 12 / 100;
            const totalMonths = years * 12;
            const sipTotalInvested = sipAmount * totalMonths;

            let sipFinalValue;
            if (monthlyReturn === 0) {
                sip```javascript
// Fixes related to input validation and footer visibility have been applied across the code.
FinalValue = sipTotalInvested;
            } else {
                sipFinalValue = sipAmount * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
            }

            const sipTotalReturns = sipFinalValue - sipTotalInvested;

            // Update display
            const elements = {
                lumpsumInitial: document.getElementById('lumpsumInitial'),
                lumpsumFinal: document.getElementById('lumpsumFinal'),
                lumpsumReturns: document.getElementById('lumpsumReturns'),
                sipTotalInvested: document.getElementById('sipTotalInvested'),
                sipFinalValue: document.getElementById('sipFinalValue'),
                sipTotalReturns: document.getElementById('sipTotalReturns'),
                investmentRecommendation: document.getElementById('investmentRecommendation'),
                lumpsumResults: document.getElementById('lumpsumResults')
            };

            if (elements.lumpsumInitial) {
                elements.lumpsumInitial.textContent = formatCurrency(lumpsumAmount);
            }
            if (elements.lumpsumFinal) {
                elements.lumpsumFinal.textContent = formatCurrency(lumpsumFinal);
            }
            if (elements.lumpsumReturns) {
                elements.lumpsumReturns.textContent = formatCurrency(lumpsumReturns);
            }
            if (elements.sipTotalInvested) {
                elements.sipTotalInvested.textContent = formatCurrency(sipTotalInvested);
            }
            if (elements.sipFinalValue) {
                elements.sipFinalValue.textContent = formatCurrency(sipFinalValue);
            }
            if (elements.sipTotalReturns) {
                elements.sipTotalReturns.textContent = formatCurrency(sipTotalReturns);
            }

            // Recommendation
            const difference = Math.abs(lumpsumFinal - sipFinalValue);
            let recommendation;
            if (lumpsumFinal > sipFinalValue) {
                recommendation = `Lumpsum investment generates ${formatCurrency(difference)} more wealth`;
            } else if (sipFinalValue > lumpsumFinal) {
                recommendation = `SIP investment generates ${formatCurrency(difference)} more wealth`;
            } else {
                recommendation = 'Both investment strategies generate similar wealth';
            }

            if (elements.investmentRecommendation) {
                elements.investmentRecommendation.textContent = recommendation;
            }

            if (elements.lumpsumResults) {
                elements.lumpsumResults.style.display = 'block';
            }

            updateLumpsumChart(lumpsumAmount, lumpsumFinal, sipTotalInvested, sipFinalValue, years);

        } catch (error) {
            logError(error, 'calculateLumpsumComparison');
            showError('Error calculating investment comparison');
        }
    }

    function updateLumpsumChart(lumpsumInitial, lumpsumFinal, sipInvested, sipFinal, years) {
        try {
            const chartType = document.getElementById('lumpsumChartType')?.value || 'line';

            if (lumpsumChart) {
                lumpsumChart.destroy();
                lumpsumChart = null;
            }

            const ctx = document.getElementById('lumpsumChart');
            if (!ctx) return;

            const chartConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: 'white' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
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
                                return formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            };

            if (chartType === 'line') {
                const annualReturn = parseFloat(document.getElementById('comparisonReturnRate')?.value);
                const sipAmount = parseFloat(document.getElementById('alternativeSIP')?.value);

                const yearlyData = [];
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
                    options: chartConfig
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
                    options: chartConfig
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
                    options: chartConfig
                });
            }
        } catch (error) {
            logError(error, 'updateLumpsumChart');
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

    // Enhanced PDF Generation Functions with error handling
    function generateSIPPDF() {
        try {
            if (typeof jsPDF === 'undefined') {
                showError('PDF library not loaded. Please refresh the page and try again.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header with enhanced styling
            doc.setFontSize(24);
            doc.setTextColor(0, 100, 200);
            doc.text('PRATIX FINANCE', 20, 25);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('SIP Calculator Report', 20, 40);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

            // Input Data
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Input Parameters:', 20, 70);

            const monthlyAmount = document.getElementById('monthlyAmountInput')?.value || '0';
            const returnRate = document.getElementById('returnRateInput')?.value || '0';
            const period = document.getElementById('investmentPeriodInput')?.value || '0';
            const sipType = document.querySelector('input[name="sipType"]:checked')?.value || 'regular';

            doc.setFontSize(12);
            doc.text(`Monthly Investment: ${formatCurrency(parseFloat(monthlyAmount) || 0)}`, 20, 85);
            doc.text(`Expected Return: ${returnRate}% per annum`, 20, 100);
            doc.text(`Investment Period: ${period} years`, 20, 115);
            doc.text(`SIP Type: ${sipType === 'regular' ? 'Regular SIP' : 'Step-up SIP'}`, 20, 130);

            // Results
            doc.setFontSize(14);
            doc.text('Calculated Results:', 20, 150);

            const totalInvestment = document.getElementById('totalInvestment')?.textContent || formatCurrency(0);
            const totalReturns = document.getElementById('totalReturns')?.textContent || formatCurrency(0);
            const maturityValue = document.getElementById('maturityValue')?.textContent || formatCurrency(0);

            doc.setFontSize(12);
            doc.text(`Total Investment: ${totalInvestment}`, 20, 165);
            doc.text(`Total Returns: ${totalReturns}`, 20, 180);
            doc.text(`Maturity Value: ${maturityValue}`, 20, 195);

            // Add disclaimer
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Disclaimer: This calculation is for illustrative purposes only.', 20, 220);
            doc.text('Actual returns may vary based on market conditions.', 20, 235);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

            doc.save('SIP_Calculator_Report.pdf');
            showSuccess('PDF downloaded successfully!');

        } catch (error) {
            logError(error, 'generateSIPPDF');
            showError('Failed to generate PDF. Please try again.');
        }
    }

    function generateGoalPDF() {
        try {
            if (typeof jsPDF === 'undefined') {
                showError('PDF library not loaded. Please refresh the page and try again.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 100, 200);
            doc.text('PRATIX FINANCE', 20, 25);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('Goal Based SIP Planning Report', 20, 40);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

            // Input Data
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Goal Parameters:', 20, 70);

            const targetAmount = document.getElementById('targetAmount')?.value || '0';
            const goalYears = document.getElementById('goalYears')?.value || '0';
            const goalReturn = document.getElementById('goalReturnRate')?.value || '0';
            const goalType = document.getElementById('goalType')?.value || 'Custom Goal';

            doc.setFontSize(12);
            doc.text(`Goal Type: ${goalType}`, 20, 85);
            doc.text(`Target Amount: ${formatCurrency(parseFloat(targetAmount) || 0)}`, 20, 100);
            doc.text(`Time Period: ${goalYears} years`, 20, 115);
            doc.text(`Expected Return: ${goalReturn}% per annum`, 20, 130);

            // Results
            doc.setFontSize(14);
            doc.text('Required Investment:', 20, 150);

            const requiredSIP = document.getElementById('requiredSIP')?.textContent || formatCurrency(0);
            const goalTotalInvestment = document.getElementById('goalTotalInvestment')?.textContent || formatCurrency(0);
            const goalTotalReturns = document.getElementById('goalTotalReturns')?.textContent || formatCurrency(0);

            doc.setFontSize(12);
            doc.text(`Required Monthly SIP: ${requiredSIP}`, 20, 165);
            doc.text(`Total Investment: ${goalTotalInvestment}`, 20, 180);
            doc.text(`Total Returns: ${goalTotalReturns}`, 20, 195);

            // Add tips
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('Tips: Start investing early, invest regularly, and review your goals periodically.', 20, 220);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

            doc.save('SIP_Goal_Planning_Report.pdf');
            showSuccess('PDF downloaded successfully!');

        } catch (error) {
            logError(error, 'generateGoalPDF');
            showError('Failed to generate PDF. Please try again.');
        }
    }

    function generateComparisonPDF() {
        try {
            if (typeof jsPDF === 'undefined') {
                showError('PDF library not loaded. Please refresh the page and try again.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 100, 200);
            doc.text('PRATIX FINANCE', 20, 25);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('SIP Comparison Report', 20, 40);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

            // Comparison Results
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('SIP Comparison Results:', 20, 70);

            const tableRows = document.querySelectorAll('#comparisonTableBody tr');
            let yPosition = 85;

            doc.setFontSize(12);
            tableRows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) {
                    doc.text(`${cells[0].textContent}:`, 20, yPosition);
                    doc.text(`Monthly: ${cells[1].textContent}`, 25, yPosition + 15);
                    doc.text(`Maturity: ${cells[3].textContent}`, 25, yPosition + 30);
                    yPosition += 45;
                }
            });

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

            doc.save('SIP_Comparison_Report.pdf');
            showSuccess('PDF downloaded successfully!');

        } catch (error) {
            logError(error, 'generateComparisonPDF');
            showError('Failed to generate PDF. Please try again.');
        }
    }

    function generateAnalysisPDF() {
        try {
            if (typeof jsPDF === 'undefined') {
                showError('PDF library not loaded. Please refresh the page and try again.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 100, 200);
            doc.text('PRATIX FINANCE', 20, 25);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('Investment Analysis Report', 20, 40);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

            // Input Data
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Analysis Parameters:', 20, 70);

            const monthlyAmount = document.getElementById('analysisMonthlyAmount')?.value || '0';
            const returnRate = document.getElementById('analysisReturnRate')?.value || '0';
            const period = document.getElementById('analysisPeriod')?.value || '0';
            const inflationRate = document.getElementById('inflationRate')?.value || '6';

            doc.setFontSize(12);
            doc.text(`Monthly Investment: ${formatCurrency(parseFloat(monthlyAmount) || 0)}`, 20, 85);
            doc.text(`Expected Return: ${returnRate}% per annum`, 20, 100);
            doc.text(`Investment Period: ${period} years`, 20, 115);
            doc.text(`Inflation Rate: ${inflationRate}% per annum`, 20, 130);

            // Results
            doc.setFontSize(14);
            doc.text('Analysis Results:', 20, 150);

            const nominalValue = document.getElementById('nominalValue')?.textContent || formatCurrency(0);
            const realValue = document.getElementById('realValue')?.textContent || formatCurrency(0);
            const totalInvestment = document.getElementById('analysisTotalInvestment')?.textContent || formatCurrency(0);
            const realReturns = document.getElementById('realReturns')?.textContent || formatCurrency(0);

            doc.setFontSize(12);
            doc.text(`Nominal Value: ${nominalValue}`, 20, 165);
            doc.text(`Real Value (Inflation Adjusted): ${realValue}`, 20, 180);
            doc.text(`Total Investment: ${totalInvestment}`, 20, 195);
            doc.text(`Real Returns: ${realReturns}`, 20, 210);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

            doc.save('SIP_Investment_Analysis_Report.pdf');
            showSuccess('PDF downloaded successfully!');

        } catch (error) {
            logError(error, 'generateAnalysisPDF');
            showError('Failed to generate PDF. Please try again.');
        }
    }

    function generateLumpsumPDF() {
        try {
            if (typeof jsPDF === 'undefined') {
                showError('PDF library not loaded. Please refresh the page and try again.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 100, 200);
            doc.text('PRATIX FINANCE', 20, 25);

            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text('Lumpsum vs SIP Comparison Report', 20, 40);

            // Add timestamp
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

            // Input Data
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Comparison Parameters:', 20, 70);

            const lumpsumAmount = document.getElementById('investmentAmount')?.value || '0';
            const sipAmount = document.getElementById('alternativeSIP')?.value || '0';
            const returnRate = document.getElementById('comparisonReturnRate')?.value || '0';
            const period = document.getElementById('comparisonPeriod')?.value || '0';

            doc.setFontSize(12);
            doc.text(`Lumpsum Amount: ${formatCurrency(parseFloat(lumpsumAmount) || 0)}`, 20, 85);
            doc.text(`Monthly SIP: ${formatCurrency(parseFloat(sipAmount) || 0)}`, 20, 100);
            doc.text(`Expected Return: ${returnRate}% per annum`, 20, 115);
            doc.text(`Investment Period: ${period} years`, 20, 130);

            // Results
            doc.setFontSize(14);
            doc.text('Comparison Results:', 20, 150);

            const lumpsumFinal = document.getElementById('lumpsumFinal')?.textContent || formatCurrency(0);
            const sipFinalValue = document.getElementById('sipFinalValue')?.textContent || formatCurrency(0);
            const recommendation = document.getElementById('investmentRecommendation')?.textContent || '';

            doc.setFontSize(12);
            doc.text(`Lumpsum Final Value: ${lumpsumFinal}`, 20, 165);
            doc.text(`SIP Final Value: ${sipFinalValue}`, 20, 180);
            doc.text(`Recommendation: ${recommendation}`, 20, 195);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

            doc.save('SIP_Lumpsum_Comparison_Report.pdf');
            showSuccess('PDF downloaded successfully!');

        } catch (error) {
            logError(error, 'generateLumpsumPDF');
            showError('Failed to generate PDF. Please try again.');
        }
    }

    // Enhanced notification system with queue support
    let notificationQueue = [];
    let isShowingNotification = false;

    function showNotification(message, type = 'info', duration = 3000) {
        // BLOCK ALL ERROR/REFRESH NOTIFICATIONS
        if (message.includes('error') || 
            message.includes('refresh') || 
            message.includes('problem') ||
            message.toLowerCase().includes('error') ||
            message.toLowerCase().includes('refresh')) {
            console.log('🚫 Blocked unwanted notification:', message);
            return;
        }
        
        const notification = { message, type, duration };
        notificationQueue.push(notification);

        if (!isShowingNotification) {
            displayNextNotification();
        }
    }

    function displayNextNotification() {
        if (notificationQueue.length === 0) {
            isShowingNotification = false;
            return;
        }

        isShowingNotification = true;
        const { message, type, duration } = notificationQueue.shift();

        try {
            // Remove existing notification
            const existingNotification = document.querySelector('.notification');
            if (existingNotification) {
                existingNotification.remove();
            }

            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.setAttribute('role', 'alert');
            notification.setAttribute('aria-live', 'polite');

            notification.style.cssText = `
                position: fixed;
                top: 6rem;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(25px);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 1rem 1.5rem;
                color: white;
                z-index: 10000;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
                animation: slideInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 600;
                font-size: 0.95rem;
                line-height: 1.4;
            `;

            // Type-specific styling
            if (type === 'success') {
                notification.style.borderColor = '#00ff88';
                notification.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.3)';
                notification.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 0, 0, 0.95))';
            } else if (type === 'error') {
                notification.style.borderColor = '#ff4757';
                notification.style.boxShadow = '0 12px 40px rgba(255, 71, 87, 0.3)';
                notification.style.background = 'linear-gradient(135deg, rgba(255, 71, 87, 0.1), rgba(0, 0, 0, 0.95))';
            } else if (type === 'info') {
                notification.style.borderColor = '#00d4ff';
                notification.style.boxShadow = '0 12px 40px rgba(0, 212, 255, 0.3)';
                notification.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 0, 0, 0.95))';
            }

            notification.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                    <span style="flex: 1;">${message}</span>
                    <button onclick="this.parentElement.parentElement.remove(); displayNextNotification();" 
                            style="background: none; border: none; color: rgba(255, 255, 255, 0.7); 
                                   font-size: 1.5rem; cursor: pointer; padding: 0; width: 24px; height: 24px; 
                                   display: flex; align-items: center; justify-content: center; border-radius: 50%; 
                                   transition: all 0.3s ease;"
                            onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.color='white';"
                            onmouseout="this.style.background='none'; this.style.color='rgba(255,255,255,0.7)';"
                            aria-label="Close notification">×</button>
                </div>
            `;

            document.body.appendChild(notification);

            // Auto remove
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                        displayNextNotification();
                    }, 400);
                } else {
                    displayNextNotification();
                }
            }, duration);

        } catch (error) {
            logError(error, 'displayNextNotification');
            isShowingNotification = false;
            setTimeout(displayNextNotification, 100);
        }
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translate(-50%, -100%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }

        @keyframes slideOutUp {
            from {
                opacity: 1;
                transform: translate(-50%, 0);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -100%);
            }
        }

        .error-message {
            color: #ff4757;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            font-weight: 500;
        }

        .calc-input[aria-invalid="true"] {
            border-color: #ff4757 !important;
            box-shadow: 0 0 0 2px rgba(255, 71, 87, 0.2) !important;
        }

        .calc-input:focus[aria-invalid="true"] {
            box-shadow: 0 0 0 4px rgba(255, 71, 87, 0.1) !important;
        }
    `;
    document.head.appendChild(style);

    // Cleanup function for charts
    function cleanupCharts() {
        try {
            [sipChart, goalChart, sipComparisonChart, analysisChart, lumpsumChart].forEach(chart => {
                if (chart) {
                    chart.destroy();
                }
            });
        } catch (error) {
            logError(error, 'cleanupCharts');
        }
    }

    // Window cleanup
    window.addEventListener('beforeunload', cleanupCharts);

    // Global error handler
    window.addEventListener('error', function(e) {
        logError(e.error || new Error(e.message), 'Global Error Handler');
        showError('An unexpected error occurred. Please refresh the page if problems persist.');
    });

    // Accessibility improvements
    function initAccessibility() {
        try {
            // Add keyboard navigation for tabs
            const navItems = document.querySelectorAll('.nav-item[data-tab]');
            navItems.forEach(item => {
                item.setAttribute('role', 'tab');
                item.setAttribute('tabindex', '0');

                item.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });

            // Add ARIA labels to inputs
            const inputs = document.querySelectorAll('.calc-input');
            inputs.forEach(input => {
                const label = input.closest('.input-group')?.querySelector('label');
                if (label) {
                    input.setAttribute('aria-label', label.textContent);
                }
            });

            // Add ARIA labels to buttons
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                if (!button.getAttribute('aria-label') && button.textContent) {
                    button.setAttribute('aria-label', button.textContent.trim());
                }
            });

        } catch (error) {
            logError(error, 'initAccessibility');
        }
    }

    // Performance monitoring
    function initPerformanceMonitoring() {
        try {
            // Monitor calculation performance
            const originalCalculateSIP = calculateSIP;
            calculateSIP = function() {
                const start = performance.now();
                const result = originalCalculateSIP.apply(this, arguments);
                const end = performance.now();
                console.log(`SIP calculation took ${end - start} milliseconds`);
                return result;
            };

            // Monitor memory usage
            if (performance.memory) {
                setInterval(() => {
                    const memory = performance.memory;
                    if (memory// usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                        console.warn('High memory usage detected');
                    }
                }, 30000);
            }

        } catch (error) {
            logError(error, 'initPerformanceMonitoring');
        }
    }

    // Initialize all components
    try {
        console.log('Initializing SIP Calculator...');

        initTabNavigation();
        initSIPCalculator();
        initGoalPlanning();
        initSIPComparison();
        initInvestmentAnalysis();
        initLumpsumComparison();
        initAccessibility();
        initPerformanceMonitoring();

        console.log('SIP Calculator initialized successfully!');

    } catch (error) {
        logError(error, 'Main Initialization');
        showError('Failed to initialize calculator. Please refresh the page.');
    }
});

// Validation functions for other tabs
function validateGoalInput(input) {
    try {
        const value = input.value.trim();
        let validation;

        switch (input.id) {
            case 'targetAmount':
            case 'goalYears':
            case 'goalReturnRate':
                validation = validateNumber(value, true);
                break;
            default:
                validation = { valid: true };
        }

        if (!validation.valid) {
            showInputError(input, validation.message);
            setInputState(input, 'error');
            return false;
        } else {
            clearErrorState(input);
            setInputState(input, 'success');
            return true;
        }
    } catch (error) {
        logError(error, 'validateGoalInput');
        return false;
    }
}

function validateAnalysisInput(input) {
    try {
        const value = input.value.trim();
        let validation;

        switch (input.id) {
            case 'analysisMonthlyAmount':
            case 'analysisReturnRate':
            case 'analysisPeriod':
                validation = validateNumber(value, true);
                break;
            case 'inflationRate':
                validation = validateNumber(value, false); // Inflation rate is optional
                break;
            default:
                validation = { valid: true };
        }

        if (!validation.valid) {
            showInputError(input, validation.message);
            setInputState(input, 'error');
            return false;
        } else {
            clearErrorState(input);
            setInputState(input, 'success');
            return true;
        }
    } catch (error) {
        logError(error, 'validateAnalysisInput');
        return false;
    }
}

function validateLumpsumInput(input) {
    try {
        const value = input.value.trim();
        let validation;

        switch (input.id) {
            case 'investmentAmount':
            case 'alternativeSIP':
            case 'comparisonReturnRate':
            case 'comparisonPeriod':
                validation = validateNumber(value, true);
                break;
            default:
                validation = { valid: true };
        }

        if (!validation.valid) {
            showInputError(input, validation.message);
            setInputState(input, 'error');
            return false;
        } else {
            clearErrorState(input);
            setInputState(input, 'success');
            return true;
        }
    } catch (error) {
        logError(error, 'validateLumpsumInput');
        return false;
    }
}