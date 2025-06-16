
// Global variables
let emiChart = null;
let prepaymentChart = null;
let comparisonChart = null;
let currentEMIData = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing EMI calculator');
    
    // Initialize all functionality
    initEMICalculator();
    initTabSwitching();
    initBottomNavigation();
    initAmortizationTable();
    initPrepaymentCalculator();
    initLoanComparison();
    initSmartFeatures();
    
    // Show first tab by default
    setTimeout(() => {
        switchToTab('emi-calculator');
    }, 100);
    
    console.log('EMI calculator initialization complete');
});

// Initialize EMI Calculator
function initEMICalculator() {
    console.log('Initializing EMI Calculator...');
    
    // Get button elements
    const calculateButton = document.getElementById('calculateEMI');
    const refreshButton = document.getElementById('refreshEMI');
    
    // Add event listeners for calculate button
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Calculate button clicked');
            try {
                calculateEMI();
                showNotification('EMI calculated successfully!', 'success');
            } catch (error) {
                console.error('Error calculating EMI:', error);
                showNotification('Error calculating EMI. Please check your inputs.', 'error');
            }
        });
    }
    
    // Add event listeners for refresh button
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Refresh button clicked');
            try {
                resetEMICalculator();
                showNotification('Calculator refreshed!', 'info');
            } catch (error) {
                console.error('Error refreshing calculator:', error);
            }
        });
    }
    
    // Chart type selector
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    if (chartTypeSelect) {
        chartTypeSelect.addEventListener('change', function() {
            if (currentEMIData) {
                updateChart(currentEMIData);
            }
        });
    }
    
    // Comparison chart type selector
    const comparisonChartTypeSelect = document.getElementById('comparisonChartType');
    if (comparisonChartTypeSelect) {
        comparisonChartTypeSelect.addEventListener('change', function() {
            console.log('Comparison chart type changed to:', this.value);
            updateComparisonChart();
        });
    }
    
    // PDF download
    const downloadPDFButton = document.getElementById('downloadPDF');
    if (downloadPDFButton) {
        downloadPDFButton.addEventListener('click', function() {
            generateEMIPDF();
        });
    }
    
    // Download comparison PDF
    const downloadComparisonPDFButton = document.getElementById('downloadComparisonPDF');
    if (downloadComparisonPDFButton) {
        downloadComparisonPDFButton.addEventListener('click', function() {
            console.log('Download comparison PDF button clicked');
            generateComparisonPDF();
        });
    }
    
    // Input validation and formatting
    const loanAmountInput = document.getElementById('loanAmountInput');
    const interestRateInput = document.getElementById('interestRateInput');
    const loanTenureInput = document.getElementById('loanTenureInput');
    
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            if (this.value.split('.').length > 2) {
                this.value = this.value.substring(0, this.value.lastIndexOf('.'));
            }
        });
    }
    
    if (interestRateInput) {
        interestRateInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            if (this.value.split('.').length > 2) {
                this.value = this.value.substring(0, this.value.lastIndexOf('.'));
            }
        });
    }
    
    if (loanTenureInput) {
        loanTenureInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
}

// Calculate EMI with proper validation
function calculateEMI() {
    console.log('calculateEMI function called');
    
    const loanAmountInput = document.getElementById('loanAmountInput');
    const interestRateInput = document.getElementById('interestRateInput');
    const loanTenureInput = document.getElementById('loanTenureInput');
    
    if (!loanAmountInput || !interestRateInput || !loanTenureInput) {
        console.error('Input fields not found!');
        showNotification('Input fields not found!', 'error');
        return;
    }
    
    const loanAmountValue = loanAmountInput.value.trim();
    const interestRateValue = interestRateInput.value.trim();
    const loanTenureValue = loanTenureInput.value.trim();
    
    if (!loanAmountValue || !interestRateValue || !loanTenureValue) {
        showNotification('Please fill all fields!', 'error');
        return;
    }
    
    const principal = parseFloat(loanAmountValue);
    const annualRate = parseFloat(interestRateValue);
    const years = parseFloat(loanTenureValue);
    
    // Enhanced validation
    if (isNaN(principal) || isNaN(annualRate) || isNaN(years)) {
        showNotification('Please enter valid numbers!', 'error');
        return;
    }
    
    if (principal <= 0 || principal > 100000000) {
        showNotification('Loan amount should be between ₹1 and ₹10 crores!', 'error');
        return;
    }
    
    if (annualRate <= 0 || annualRate > 50) {
        showNotification('Interest rate should be between 0.1% and 50%!', 'error');
        return;
    }
    
    if (years <= 0 || years > 50) {
        showNotification('Loan tenure should be between 1 and 50 years!', 'error');
        return;
    }
    
    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = years * 12;
    
    // EMI Calculation using the standard formula
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
               (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalAmount = emi * totalMonths;
    const totalInterest = totalAmount - principal;
    
    currentEMIData = {
        principal: principal,
        emi: emi,
        totalInterest: totalInterest,
        totalAmount: totalAmount,
        annualRate: annualRate,
        years: years
    };
    
    // Update display with proper formatting
    const monthlyEMIElement = document.getElementById('monthlyEMI');
    const totalInterestElement = document.getElementById('totalInterest');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (monthlyEMIElement) {
        monthlyEMIElement.textContent = `₹${Math.round(emi).toLocaleString('en-IN')}`;
    }
    if (totalInterestElement) {
        totalInterestElement.textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
    }
    if (totalAmountElement) {
        totalAmountElement.textContent = `₹${Math.round(totalAmount).toLocaleString('en-IN')}`;
    }
    
    // Show results and chart
    const resultCard = document.getElementById('resultCard');
    const chartContainer = document.getElementById('chartContainer');
    const chartControls = document.getElementById('chartControls');
    
    if (resultCard) resultCard.style.display = 'block';
    if (chartContainer) chartContainer.style.display = 'block';
    if (chartControls) chartControls.style.display = 'block';
    
    // Update chart
    updateChart(currentEMIData);
    
    // Update amortization table
    generateAmortizationTable(currentEMIData);
}

// Reset EMI Calculator function
function resetEMICalculator() {
    console.log('Resetting EMI Calculator');
    
    // Clear inputs
    const inputs = ['loanAmountInput', 'interestRateInput', 'loanTenureInput', 'prepaymentAmount', 'prepayAfterMonths'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Hide results and charts
    const elementsToHide = ['resultCard', 'chartContainer', 'chartControls', 'prepaymentResults', 'comparisonResults', 'amortizationTableContainer'];
    elementsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Reset charts
    if (emiChart) {
        emiChart.destroy();
        emiChart = null;
    }
    if (prepaymentChart) {
        prepaymentChart.destroy();
        prepaymentChart = null;
    }
    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }
    
    // Reset global data
    currentEMIData = null;
    
    // Regenerate loan inputs if on comparison tab
    const loanCountSelect = document.getElementById('loanCountSelect');
    if (loanCountSelect && loanCountSelect.value) {
        generateLoanInputs();
    }
}

// Update chart based on selected type
function updateChart(data) {
    const chartTypeSelect = document.getElementById('chartTypeSelect');
    const canvas = document.getElementById('emiChart');
    
    if (!chartTypeSelect || !canvas) return;
    
    const chartType = chartTypeSelect.value;
    const ctx = canvas.getContext('2d');
    
    if (emiChart) {
        emiChart.destroy();
    }
    
    const chartConfig = getChartConfig(chartType, data);
    emiChart = new Chart(ctx, chartConfig);
}

// Get chart configuration
function getChartConfig(type, data) {
    const colors = {
        primary: '#00d4ff',
        secondary: '#8b5cf6',
        accent: '#00ff88'
    };
    
    switch (type) {
        case 'pie':
            return {
                type: 'doughnut',
                data: {
                    labels: ['Principal Amount', 'Interest Amount'],
                    datasets: [{
                        data: [data.principal, data.totalInterest],
                        backgroundColor: [colors.primary, colors.secondary],
                        borderColor: [colors.primary, colors.secondary],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            };
            
        case 'bar':
            return {
                type: 'bar',
                data: {
                    labels: ['Principal', 'Interest'],
                    datasets: [{
                        label: 'Amount (₹)',
                        data: [data.principal, data.totalInterest],
                        backgroundColor: [colors.primary, colors.secondary],
                        borderColor: [colors.primary, colors.secondary],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            };
            
        case 'line':
            const monthlyData = generateMonthlyBreakdown(data);
            return {
                type: 'line',
                data: {
                    labels: monthlyData.months,
                    datasets: [{
                        label: 'Outstanding Balance',
                        data: monthlyData.balances,
                        borderColor: colors.primary,
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(1) + 'L';
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            };
        default:
            return getChartConfig('pie', data);
    }
}

// Generate monthly breakdown for line chart
function generateMonthlyBreakdown(data) {
    const months = [];
    const balances = [];
    const monthlyRate = data.annualRate / 12 / 100;
    let balance = data.principal;
    
    for (let i = 0; i <= data.years * 12; i += 12) {
        months.push(`Year ${i/12}`);
        balances.push(Math.round(balance));
        
        // Calculate balance after 12 months
        for (let j = 0; j < 12 && balance > 0; j++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = data.emi - interestPayment;
            balance = Math.max(0, balance - principalPayment);
        }
    }
    
    return { months, balances };
}

// Initialize tab switching functionality
function initTabSwitching() {
    console.log('Initializing tab switching');
    
    const navItems = document.querySelectorAll('.nav-item, .tab-nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        const targetTab = item.getAttribute('data-tab');
        console.log(`Adding click listener to nav item ${index}:`, targetTab);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            if (targetTab) {
                switchToTab(targetTab);
            }
        });
    });
}

// Initialize bottom navigation
function initBottomNavigation() {
    console.log('Initializing bottom navigation');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    console.log('Found bottom nav items:', navItems.length);
    
    navItems.forEach((item, index) => {
        const targetTab = item.getAttribute('data-tab');
        console.log(`Bottom nav item ${index}:`, targetTab);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('Bottom nav tab clicked:', targetTab);
            
            if (targetTab) {
                switchToTab(targetTab);
            }
        });
    });
}

// Switch to tab function
function switchToTab(tabId) {
    console.log('Switching to tab:', tabId);
    
    try {
        // Remove active class from all nav items and tab contents
        const navItems = document.querySelectorAll('.nav-item, .tab-nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(nav => {
            nav.classList.remove('active');
        });
        
        tabContents.forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        // Add active class to target tab and nav item
        const targetTab = document.getElementById(tabId);
        const targetNavs = document.querySelectorAll(`[data-tab="${tabId}"]`);
        
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.style.display = 'block';
            targetTab.style.visibility = 'visible';
            targetTab.style.opacity = '1';
            
            console.log('Tab activated:', tabId);
            
            // Initialize tab-specific content
            initializeTabContent(tabId);
        } else {
            console.error('Target tab not found:', tabId);
        }
        
        targetNavs.forEach(nav => {
            if (nav) {
                nav.classList.add('active');
            }
        });
        
        // Save active tab
        localStorage.setItem('activeTab', tabId);
        
        // Scroll to top when switching tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

// Initialize tab-specific content
function initializeTabContent(tabId) {
    console.log('Initializing content for tab:', tabId);
    
    switch(tabId) {
        case 'emi-calculator':
            // EMI calculator is already initialized
            break;
        case 'amortization-table':
            if (currentEMIData) {
                generateAmortizationTable(currentEMIData);
                const tableContainer = document.getElementById('amortizationTableContainer');
                if (tableContainer) {
                    tableContainer.style.display = 'block';
                }
            }
            break;
        case 'prepayment-impact':
            // Initialize prepayment calculator if not already done
            initPrepaymentCalculator();
            break;
        case 'loan-comparison':
            // Initialize loan comparison
            const loanCountSelect = document.getElementById('loanCountSelect');
            if (loanCountSelect && !loanCountSelect.value) {
                loanCountSelect.value = '2';
                generateLoanInputs();
            } else if (!document.querySelector('#loanInputsGrid .loan-input-card')) {
                generateLoanInputs();
            }
            break;
        case 'tools-extras':
            // Tools grid is already in HTML
            break;
        case 'smart-features':
            // Initialize smart features
            initializeSmartFeatures();
            break;
    }
}

// Initialize Amortization Table
function initAmortizationTable() {
    const downloadBtn = document.getElementById('downloadAmortizationPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generateAmortizationPDF();
        });
    }
}

// Generate Amortization Table
function generateAmortizationTable(data) {
    const tbody = document.getElementById('amortizationTableBody');
    const tableContainer = document.getElementById('amortizationTableContainer');
    
    if (!tbody || !data) return;
    
    tbody.innerHTML = '';
    
    const monthlyRate = data.annualRate / 12 / 100;
    let balance = data.principal;
    
    for (let year = 1; year <= data.years; year++) {
        let yearlyPrincipal = 0;
        let yearlyInterest = 0;
        
        for (let month = 1; month <= 12 && balance > 0; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(data.emi - interestPayment, balance);
            
            yearlyPrincipal += principalPayment;
            yearlyInterest += interestPayment;
            balance = Math.max(0, balance - principalPayment);
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>₹${Math.round(yearlyPrincipal).toLocaleString('en-IN')}</td>
            <td>₹${Math.round(yearlyInterest).toLocaleString('en-IN')}</td>
            <td>₹${Math.round(Math.max(0, balance)).toLocaleString('en-IN')}</td>
        `;
        tbody.appendChild(row);
    }
    
    // Show the table container
    if (tableContainer) {
        tableContainer.style.display = 'block';
    }
}

// Initialize Prepayment Calculator
function initPrepaymentCalculator() {
    const calculateBtn = document.getElementById('calculatePrepayment');
    const refreshBtn = document.getElementById('refreshPrepayment');
    const downloadBtn = document.getElementById('downloadPrepaymentPDF');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            calculatePrepaymentImpact();
            showNotification('Prepayment impact calculated!', 'success');
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const prepaymentAmount = document.getElementById('prepaymentAmount');
            const prepayAfterMonths = document.getElementById('prepayAfterMonths');
            const prepaymentResults = document.getElementById('prepaymentResults');
            
            if (prepaymentAmount) prepaymentAmount.value = '';
            if (prepayAfterMonths) prepayAfterMonths.value = '';
            if (prepaymentResults) prepaymentResults.style.display = 'none';
            
            showNotification('Prepayment calculator refreshed!', 'info');
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            generatePrepaymentPDF();
        });
    }
}

// Calculate Prepayment Impact
function calculatePrepaymentImpact() {
    if (!currentEMIData) {
        showNotification('Please calculate EMI first!', 'error');
        return;
    }
    
    const prepaymentAmountInput = document.getElementById('prepaymentAmount');
    const prepayAfterMonthsInput = document.getElementById('prepayAfterMonths');
    const prepayOptionRadio = document.querySelector('input[name="prepayOption"]:checked');
    
    if (!prepaymentAmountInput || !prepayAfterMonthsInput || !prepayOptionRadio) {
        showNotification('Please fill all prepayment fields!', 'error');
        return;
    }
    
    const prepaymentAmount = parseInt(prepaymentAmountInput.value);
    const prepayAfterMonths = parseInt(prepayAfterMonthsInput.value);
    const prepayOption = prepayOptionRadio.value;
    
    if (!prepaymentAmount || !prepayAfterMonths) {
        showNotification('Please fill all prepayment fields!', 'error');
        return;
    }
    
    if (prepaymentAmount <= 0 || prepayAfterMonths <= 0) {
        showNotification('Please enter valid positive values!', 'error');
        return;
    }
    
    if (prepayAfterMonths >= (currentEMIData.years * 12)) {
        showNotification('Prepayment month should be less than loan tenure!', 'error');
        return;
    }
    
    const result = calculatePrepaymentScenario(currentEMIData, prepaymentAmount, prepayAfterMonths, prepayOption);
    
    // Update display
    document.getElementById('interestSaved').textContent = `₹${Math.round(result.interestSaved).toLocaleString('en-IN')}`;
    document.getElementById('originalEMI').textContent = `₹${Math.round(currentEMIData.emi).toLocaleString('en-IN')}`;
    document.getElementById('originalInterest').textContent = `₹${Math.round(currentEMIData.totalInterest).toLocaleString('en-IN')}`;
    document.getElementById('originalTenure').textContent = `${currentEMIData.years} Years`;
    document.getElementById('newEMI').textContent = `₹${Math.round(result.newEMI).toLocaleString('en-IN')}`;
    document.getElementById('newInterest').textContent = `₹${Math.round(result.newTotalInterest).toLocaleString('en-IN')}`;
    document.getElementById('newTenure').textContent = result.newTenureText;
    
    if (prepayOption === 'tenure') {
        document.getElementById('benefitLabel').textContent = 'Time Saved';
        document.getElementById('benefitValue').textContent = result.timeSaved;
    } else {
        document.getElementById('benefitLabel').textContent = 'EMI Reduction';
        document.getElementById('benefitValue').textContent = `₹${Math.round(currentEMIData.emi - result.newEMI).toLocaleString('en-IN')}`;
    }
    
    document.getElementById('prepaymentResults').style.display = 'block';
    
    // Update prepayment chart
    updatePrepaymentChart(currentEMIData, result);
}

// Calculate prepayment scenario
function calculatePrepaymentScenario(originalData, prepaymentAmount, prepayAfterMonths, option) {
    const monthlyRate = originalData.annualRate / 12 / 100;
    let balance = originalData.principal;
    let totalInterest = 0;
    
    // Calculate balance after prepayment months
    for (let i = 0; i < prepayAfterMonths; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = originalData.emi - interestPayment;
        totalInterest += interestPayment;
        balance -= principalPayment;
    }
    
    // Apply prepayment
    balance = Math.max(0, balance - prepaymentAmount);
    
    let newEMI, newTenureMonths;
    
    if (option === 'tenure') {
        // Keep EMI same, reduce tenure
        newEMI = originalData.emi;
        if (balance <= 0) {
            newTenureMonths = 0;
        } else {
            newTenureMonths = Math.ceil(Math.log(1 + (balance * monthlyRate) / newEMI) / Math.log(1 + monthlyRate));
        }
    } else {
        // Keep tenure same, reduce EMI
        const remainingMonths = (originalData.years * 12) - prepayAfterMonths;
        if (balance <= 0) {
            newEMI = 0;
            newTenureMonths = 0;
        } else {
            newEMI = (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                    (Math.pow(1 + monthlyRate, remainingMonths) - 1);
            newTenureMonths = remainingMonths;
        }
    }
    
    // Calculate new total interest
    let tempBalance = balance;
    for (let i = 0; i < newTenureMonths && tempBalance > 0; i++) {
        const interestPayment = tempBalance * monthlyRate;
        const principalPayment = Math.min(newEMI - interestPayment, tempBalance);
        totalInterest += interestPayment;
        tempBalance -= principalPayment;
    }
    
    const newTotalInterest = totalInterest;
    const interestSaved = originalData.totalInterest - newTotalInterest;
    
    const totalNewTenureMonths = prepayAfterMonths + newTenureMonths;
    const newTenureYears = Math.floor(totalNewTenureMonths / 12);
    const newTenureRemainingMonths = totalNewTenureMonths % 12;
    
    let newTenureText, timeSaved;
    if (newTenureRemainingMonths === 0) {
        newTenureText = `${newTenureYears} Years`;
    } else {
        newTenureText = `${newTenureYears} Years ${newTenureRemainingMonths} Months`;
    }
    
    const timeSavedMonths = (originalData.years * 12) - totalNewTenureMonths;
    const timeSavedYears = Math.floor(timeSavedMonths / 12);
    const timeSavedRemainingMonths = timeSavedMonths % 12;
    
    if (timeSavedRemainingMonths === 0) {
        timeSaved = `${timeSavedYears} Years`;
    } else {
        timeSaved = `${timeSavedYears} Years ${timeSavedRemainingMonths} Months`;
    }
    
    return {
        newEMI,
        newTotalInterest,
        interestSaved,
        newTenureText,
        timeSaved
    };
}

// Update prepayment chart
function updatePrepaymentChart(originalData, prepaymentData) {
    const ctx = document.getElementById('prepaymentChart');
    if (!ctx) return;
    
    if (prepaymentChart) {
        prepaymentChart.destroy();
    }
    
    prepaymentChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Original Loan', 'With Prepayment'],
            datasets: [{
                label: 'Total Interest',
                data: [originalData.totalInterest, prepaymentData.newTotalInterest],
                backgroundColor: ['#ff0080', '#00ff88'],
                borderColor: ['#ff0080', '#00ff88'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + (value / 100000).toFixed(1) + 'L';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Initialize Loan Comparison
function initLoanComparison() {
    console.log('Initializing Loan Comparison...');
    
    const loanCountSelect = document.getElementById('loanCountSelect');
    const compareLoansBtn = document.getElementById('compareLoans');
    const refreshComparisonBtn = document.getElementById('refreshComparison');
    
    if (loanCountSelect) {
        loanCountSelect.addEventListener('change', function() {
            generateLoanInputs();
        });
        
        // Generate initial loan inputs
        generateLoanInputs();
    }
    
    if (compareLoansBtn) {
        compareLoansBtn.addEventListener('click', function() {
            compareLoanOptions();
            showNotification('Loans compared successfully!', 'success');
        });
    }
    
    if (refreshComparisonBtn) {
        refreshComparisonBtn.addEventListener('click', function() {
            generateLoanInputs();
            const comparisonResults = document.getElementById('comparisonResults');
            if (comparisonResults) comparisonResults.style.display = 'none';
            showNotification('Comparison refreshed!', 'info');
        });
    }
    
    generateLoanInputs();
}

// Generate loan input forms
function generateLoanInputs() {
    const loanCountSelect = document.getElementById('loanCountSelect');
    const container = document.getElementById('loanInputsGrid');
    
    if (!container || !loanCountSelect) {
        console.error('Loan inputs container or select not found');
        return;
    }
    
    const loanCount = parseInt(loanCountSelect.value) || 2;
    console.log('Generating loan inputs for', loanCount, 'loans');
    
    container.innerHTML = '';
    
    for (let i = 1; i <= loanCount; i++) {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-input-card';
        loanCard.innerHTML = `
            <h3>Loan Option ${i}</h3>
            <div class="input-group">
                <label>Loan Amount</label>
                <div class="input-wrapper">
                    <span class="currency">₹</span>
                    <input type="number" id="loan${i}Amount" placeholder="Enter loan amount" class="calc-input" min="1000" step="1000">
                </div>
            </div>
            <div class="input-group">
                <label>Interest Rate (%)</label>
                <input type="number" id="loan${i}Rate" placeholder="Enter interest rate" class="calc-input" step="0.01" min="0.1" max="50">
            </div>
            <div class="input-group">
                <label>Loan Tenure (Years)</label>
                <input type="number" id="loan${i}Tenure" placeholder="Enter tenure" class="calc-input" min="1" max="50" step="1">
            </div>
        `;
        container.appendChild(loanCard);
    }
    
    console.log('Generated', container.children.length, 'loan input cards');
}

// Compare loan options
function compareLoanOptions() {
    const loanCount = parseInt(document.getElementById('loanCountSelect').value);
    if (!loanCount) {
        showNotification('Please select number of loans to compare!', 'error');
        return;
    }
    
    const loans = [];
    
    for (let i = 1; i <= loanCount; i++) {
        const amountElement = document.getElementById(`loan${i}Amount`);
        const rateElement = document.getElementById(`loan${i}Rate`);
        const tenureElement = document.getElementById(`loan${i}Tenure`);
        
        if (!amountElement || !rateElement || !tenureElement) {
            showNotification(`Input fields for Loan ${i} not found!`, 'error');
            return;
        }
        
        const amount = parseInt(amountElement.value);
        const rate = parseFloat(rateElement.value);
        const tenure = parseInt(tenureElement.value);
        
        if (!amount || !rate || !tenure) {
            showNotification(`Please fill all fields for Loan ${i}!`, 'error');
            return;
        }
        
        if (amount <= 0 || rate <= 0 || tenure <= 0) {
            showNotification(`Please enter valid positive values for Loan ${i}!`, 'error');
            return;
        }
        
        const monthlyRate = rate / 12 / 100;
        const totalMonths = tenure * 12;
        const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - amount;
        
        loans.push({
            name: `Loan ${i}`,
            amount,
            rate,
            tenure,
            emi,
            totalInterest,
            totalAmount
        });
    }
    
    // Update comparison table
    const tbody = document.getElementById('comparisonTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        
        loans.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.name}</td>
                <td>₹${Math.round(loan.emi).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(loan.totalInterest).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(loan.totalAmount).toLocaleString('en-IN')}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    const comparisonResults = document.getElementById('comparisonResults');
    if (comparisonResults) comparisonResults.style.display = 'block';
    
    // Update comparison chart
    updateComparisonChart(loans);
}

// Update comparison chart
function updateComparisonChart(loans = null) {
    if (!loans) {
        // Extract data from table if loans not provided
        const tbody = document.getElementById('comparisonTableBody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        loans = [];
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                loans.push({
                    name: cells[0].textContent,
                    emi: parseFloat(cells[1].textContent.replace(/[₹,]/g, '')),
                    totalInterest: parseFloat(cells[2].textContent.replace(/[₹,]/g, '')),
                    totalAmount: parseFloat(cells[3].textContent.replace(/[₹,]/g, ''))
                });
            }
        });
    }
    
    const chartTypeSelect = document.getElementById('comparisonChartType');
    const canvas = document.getElementById('loanComparisonChart');
    
    if (!chartTypeSelect || !canvas || !loans.length) return;
    
    const chartType = chartTypeSelect.value;
    const ctx = canvas.getContext('2d');
    
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const colors = ['#00d4ff', '#8b5cf6', '#00ff88', '#ff0080'];
    
    let chartConfig;
    
    switch (chartType) {
        case 'bar':
            chartConfig = {
                type: 'bar',
                data: {
                    labels: loans.map(loan => loan.name),
                    datasets: [{
                        label: 'Monthly EMI',
                        data: loans.map(loan => loan.emi),
                        backgroundColor: colors.slice(0, loans.length),
                        borderColor: colors.slice(0, loans.length),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            };
            break;
            
        case 'pie':
            chartConfig = {
                type: 'doughnut',
                data: {
                    labels: loans.map(loan => loan.name),
                    datasets: [{
                        data: loans.map(loan => loan.totalInterest),
                        backgroundColor: colors.slice(0, loans.length),
                        borderColor: colors.slice(0, loans.length),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            };
            break;
            
        case 'line':
            chartConfig = {
                type: 'line',
                data: {
                    labels: loans.map(loan => loan.name),
                    datasets: [{
                        label: 'Total Amount',
                        data: loans.map(loan => loan.totalAmount),
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return '₹' + (value / 100000).toFixed(1) + 'L';
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            };
            break;
    }
    
    comparisonChart = new Chart(ctx, chartConfig);
}

// Initialize Smart Features
function initializeSmartFeatures() {
    console.log('Initializing smart features...');
    
    // Save Plan functionality
    const savePlanBtn = document.getElementById('saveLoanPlan');
    if (savePlanBtn) {
        savePlanBtn.onclick = function() {
            if (currentEMIData) {
                const planName = prompt('Enter a name for this loan plan:');
                if (planName) {
                    saveLoanPlan(planName, currentEMIData);
                    showNotification('Loan plan saved successfully!', 'success');
                }
            } else {
                showNotification('Please calculate an EMI first!', 'error');
            }
        };
    }
    
    // Share Plan functionality
    const sharePlanBtn = document.getElementById('shareLoanPlan');
    if (sharePlanBtn) {
        sharePlanBtn.onclick = function() {
            if (currentEMIData) {
                showShareModal();
            } else {
                showNotification('Please calculate an EMI first!', 'error');
            }
        };
    }
    
    // Initialize other smart feature buttons
    const buttons = [
        'addEMIReminder',
        'aiAssistance', 
        'smartNotifications',
        'analyticsBoard'
    ];
    
    buttons.forEach(buttonId => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.onclick = function() {
                showNotification(`${this.textContent} feature coming soon!`, 'info');
            };
        }
    });
    
    // Load saved plans
    loadSavedPlans();
    
    console.log('Smart features initialized');
}

// Save loan plan to localStorage
function saveLoanPlan(name, data) {
    const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
    const plan = {
        id: Date.now(),
        name: name,
        date: new Date().toLocaleDateString(),
        data: data
    };
    savedPlans.push(plan);
    localStorage.setItem('savedLoanPlans', JSON.stringify(savedPlans));
    loadSavedPlans();
}

// Load saved plans
function loadSavedPlans() {
    const container = document.getElementById('savedPlansContainer');
    if (!container) return;
    
    const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
    
    if (savedPlans.length === 0) {
        container.innerHTML = '<div class="no-plans-message"><p>No saved loan plans yet. Calculate an EMI and save your first plan!</p></div>';
        return;
    }
    
    container.innerHTML = savedPlans.map(plan => `
        <div class="saved-plan-card">
            <h4>${plan.name}</h4>
            <p>Saved on: ${plan.date}</p>
            <p>Loan Amount: ₹${Math.round(plan.data.principal).toLocaleString('en-IN')}</p>
            <p>Monthly EMI: ₹${Math.round(plan.data.emi).toLocaleString('en-IN')}</p>
            <p>Interest Rate: ${plan.data.annualRate}%</p>
            <p>Tenure: ${plan.data.years} years</p>
            <button class="delete-plan-btn" onclick="deletePlan(${plan.id})">Delete Plan</button>
        </div>
    `).join('');
}

// Delete plan
function deletePlan(planId) {
    const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
    const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
    localStorage.setItem('savedLoanPlans', JSON.stringify(updatedPlans));
    loadSavedPlans();
    showNotification('Plan deleted successfully!', 'success');
}

// Show share modal
function showShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal && currentEMIData) {
        const shareText = `EMI Calculator Results:
Loan Amount: ₹${Math.round(currentEMIData.principal).toLocaleString('en-IN')}
Interest Rate: ${currentEMIData.annualRate}%
Tenure: ${currentEMIData.years} years
Monthly EMI: ₹${Math.round(currentEMIData.emi).toLocaleString('en-IN')}
Total Interest: ₹${Math.round(currentEMIData.totalInterest).toLocaleString('en-IN')}
Total Amount: ₹${Math.round(currentEMIData.totalAmount).toLocaleString('en-IN')}

Calculate your EMI at: ${window.location.href}`;
        
        const shareTextElement = document.getElementById('shareText');
        const shareableLinkElement = document.getElementById('shareableLink');
        
        if (shareTextElement) shareTextElement.value = shareText;
        if (shareableLinkElement) shareableLinkElement.value = window.location.href;
        
        modal.style.display = 'flex';
    }
}

// Close share modal
const closeShareModal = document.getElementById('closeShareModal');
if (closeShareModal) {
    closeShareModal.onclick = function() {
        const modal = document.getElementById('shareModal');
        if (modal) modal.style.display = 'none';
    };
}

// Copy functionality
const copyLinkBtn = document.getElementById('copyLink');
if (copyLinkBtn) {
    copyLinkBtn.onclick = function() {
        const input = document.getElementById('shareableLink');
        if (input) {
            input.select();
            navigator.clipboard.writeText(input.value).then(() => {
                showNotification('Link copied to clipboard!', 'success');
            });
        }
    };
}

const copyTextBtn = document.getElementById('copyText');
if (copyTextBtn) {
    copyTextBtn.onclick = function() {
        const textarea = document.getElementById('shareText');
        if (textarea) {
            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
                showNotification('Text copied to clipboard!', 'success');
            });
        }
    };
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ff0080, #ff4444)';
            break;
        case 'info':
        default:
            notification.style.background = 'linear-gradient(135deg, #00d4ff, #8b5cf6)';
            break;
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// PDF Generation Functions
function generateEMIPDF() {
    if (!currentEMIData) {
        showNotification('Please calculate EMI first!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('EMI Calculator Report', 20, 35);
        
        // Input Data
        doc.setFontSize(12);
        doc.text('Input Details:', 20, 55);
        doc.text(`Loan Amount: ₹${currentEMIData.principal.toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Interest Rate: ${currentEMIData.annualRate}%`, 20, 80);
        doc.text(`Loan Tenure: ${currentEMIData.years} years`, 20, 90);
        
        // Results
        doc.text('Calculation Results:', 20, 110);
        doc.text(`Monthly EMI: ₹${Math.round(currentEMIData.emi).toLocaleString('en-IN')}`, 20, 125);
        doc.text(`Total Interest: ₹${Math.round(currentEMIData.totalInterest).toLocaleString('en-IN')}`, 20, 135);
        doc.text(`Total Amount: ₹${Math.round(currentEMIData.totalAmount).toLocaleString('en-IN')}`, 20, 145);
        
        // Chart
        const canvas = document.getElementById('emiChart');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 20, 160, 160, 80);
        }
        
        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);
        
        doc.save('EMI_Calculator_Report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function generateAmortizationPDF() {
    if (!currentEMIData) {
        showNotification('Please calculate EMI first!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('EMI Calculator', 20, 35);
        
        doc.setFontSize(14);
        doc.text('Amortization Schedule', 20, 50);
        
        // Table header
        doc.setFontSize(10);
        doc.text('Year', 20, 70);
        doc.text('Principal', 50, 70);
        doc.text('Interest', 90, 70);
        doc.text('Balance', 130, 70);
        
        // Table data
        const monthlyRate = currentEMIData.annualRate / 12 / 100;
        let balance = currentEMIData.principal;
        let yPosition = 80;
        
        for (let year = 1; year <= currentEMIData.years && yPosition < 250; year++) {
            let yearlyPrincipal = 0;
            let yearlyInterest = 0;
            
            for (let month = 1; month <= 12 && balance > 0; month++) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = Math.min(currentEMIData.emi - interestPayment, balance);
                
                yearlyPrincipal += principalPayment;
                yearlyInterest += interestPayment;
                balance = Math.max(0, balance - principalPayment);
            }
            
            doc.text(year.toString(), 20, yPosition);
            doc.text(`₹${Math.round(yearlyPrincipal).toLocaleString('en-IN')}`, 50, yPosition);
            doc.text(`₹${Math.round(yearlyInterest).toLocaleString('en-IN')}`, 90, yPosition);
            doc.text(`₹${Math.round(Math.max(0, balance)).toLocaleString('en-IN')}`, 130, yPosition);
            
            yPosition += 10;
        }
        
        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);
        
        doc.save('Amortization_Schedule.pdf');
        showNotification('Amortization PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function generatePrepaymentPDF() {
    showNotification('Prepayment PDF generation feature coming soon!', 'info');
}

function generateComparisonPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('EMI Calculator', 20, 35);
        
        doc.setFontSize(14);
        doc.text('Loan Comparison Analysis', 20, 50);
        
        // Table data
        doc.setFontSize(10);
        doc.text('Loan', 20, 70);
        doc.text('Monthly EMI', 60, 70);
        doc.text('Total Interest', 110, 70);
        doc.text('Total Amount', 160, 70);
        
        const tbody = document.getElementById('comparisonTableBody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            let yPosition = 80;
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4 && yPosition < 250) {
                    doc.text(cells[0].textContent, 20, yPosition);
                    doc.text(cells[1].textContent, 60, yPosition);
                    doc.text(cells[2].textContent, 110, yPosition);
                    doc.text(cells[3].textContent, 160, yPosition);
                    yPosition += 10;
                }
            });
        }
        
        // Chart
        const canvas = document.getElementById('loanComparisonChart');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 20, yPosition + 20, 160, 80);
        }
        
        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);
        
        doc.save('Loan_Comparison_Analysis.pdf');
        showNotification('Comparison PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// Navigation functions for tool cards
function goToSipCalculator() {
    window.location.href = 'sip-calculator.html';
}

function goToEmiCalculator() {
    // Already on EMI calculator, switch to main tab
    switchToTab('emi-calculator');
}

function goToGstCalculator() {
    window.location.href = 'gst-calculator.html';
}

function goToTaxCalculator() {
    window.location.href = 'tax-calculator.html';
}

function goToFdCalculator() {
    window.location.href = 'fd-calculator.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

// Make functions globally available
window.switchToTab = switchToTab;
window.goToSipCalculator = goToSipCalculator;
window.goToEmiCalculator = goToEmiCalculator;
window.goToGstCalculator = goToGstCalculator;
window.goToTaxCalculator = goToTaxCalculator;
window.goToFdCalculator = goToFdCalculator;
window.goToHome = goToHome;
window.generateComparisonPDF = generateComparisonPDF;
window.deletePlan = deletePlan;
