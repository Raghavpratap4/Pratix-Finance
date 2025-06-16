
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
        showNotification('Please fill all fields to calculate EMI!', 'error');
        return;
    }
    
    const principal = parseFloat(loanAmountValue);
    const annualRate = parseFloat(interestRateValue);
    const years = parseFloat(loanTenureValue);
    
    // Enhanced validation
    if (isNaN(principal) || isNaN(annualRate) || isNaN(years)) {
        showNotification('Please enter valid numbers only!', 'error');
        return;
    }
    
    if (principal <= 0 || principal > 100000000) {
        showNotification('Loan amount should be between ₹1,000 and ₹10 crores!', 'error');
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
    
    try {
        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;
        
        // EMI Calculation using the standard formula
        let emi;
        if (monthlyRate === 0) {
            emi = principal / totalMonths;
        } else {
            emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                  (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }
        
        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - principal;
        
        if (!isFinite(emi) || !isFinite(totalAmount) || !isFinite(totalInterest)) {
            showNotification('Error in calculation. Please check your inputs!', 'error');
            return;
        }
        
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
        
        // Show results and chart with smooth animation
        const resultCard = document.getElementById('resultCard');
        const chartContainer = document.getElementById('chartContainer');
        const chartControls = document.getElementById('chartControls');
        
        if (resultCard) {
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (chartContainer) chartContainer.style.display = 'block';
        if (chartControls) chartControls.style.display = 'block';
        
        // Update chart
        updateChart(currentEMIData);
        
        // Update amortization table
        generateAmortizationTable(currentEMIData);
        
        showNotification('EMI calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in EMI calculation:', error);
        showNotification('Calculation error. Please verify your inputs!', 'error');
    }
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
        showNotification('Please calculate EMI first in the main calculator!', 'error');
        return;
    }
    
    const prepaymentAmountInput = document.getElementById('prepaymentAmount');
    const prepayAfterMonthsInput = document.getElementById('prepayAfterMonths');
    const prepayOptionRadio = document.querySelector('input[name="prepayOption"]:checked');
    
    if (!prepaymentAmountInput || !prepayAfterMonthsInput || !prepayOptionRadio) {
        showNotification('Input fields not found!', 'error');
        return;
    }
    
    const prepaymentAmountValue = prepaymentAmountInput.value.trim();
    const prepayAfterMonthsValue = prepayAfterMonthsInput.value.trim();
    
    if (!prepaymentAmountValue || !prepayAfterMonthsValue) {
        showNotification('Please fill all required fields: Prepayment Amount and Prepay After Months!', 'error');
        return;
    }
    
    const prepaymentAmount = parseInt(prepaymentAmountValue);
    const prepayAfterMonths = parseInt(prepayAfterMonthsValue);
    const prepayOption = prepayOptionRadio.value;
    
    if (isNaN(prepaymentAmount) || isNaN(prepayAfterMonths)) {
        showNotification('Please enter valid numbers only!', 'error');
        return;
    }
    
    if (prepaymentAmount <= 0) {
        showNotification('Prepayment amount must be greater than ₹0!', 'error');
        return;
    }
    
    if (prepayAfterMonths <= 0) {
        showNotification('Prepay after months must be greater than 0!', 'error');
        return;
    }
    
    if (prepaymentAmount >= currentEMIData.principal) {
        showNotification('Prepayment amount cannot be greater than or equal to loan amount!', 'error');
        return;
    }
    
    if (prepayAfterMonths >= (currentEMIData.years * 12)) {
        showNotification(`Prepayment month should be less than loan tenure (${currentEMIData.years * 12} months)!`, 'error');
        return;
    }
    
    const result = calculatePrepaymentScenario(currentEMIData, prepaymentAmount, prepayAfterMonths, prepayOption);
    
    // Update main displays
    document.getElementById('interestSaved').textContent = `₹${Math.round(result.interestSaved).toLocaleString('en-IN')}`;
    document.getElementById('originalEMI').textContent = `₹${Math.round(currentEMIData.emi).toLocaleString('en-IN')}`;
    document.getElementById('originalInterest').textContent = `₹${Math.round(currentEMIData.totalInterest).toLocaleString('en-IN')}`;
    document.getElementById('originalTenure').textContent = `${currentEMIData.years} Years`;
    document.getElementById('newEMI').textContent = `₹${Math.round(result.newEMI).toLocaleString('en-IN')}`;
    document.getElementById('newInterest').textContent = `₹${Math.round(result.newTotalInterest).toLocaleString('en-IN')}`;
    document.getElementById('newTenure').textContent = result.newTenureText;
    
    // Update difference columns
    const emiDiff = currentEMIData.emi - result.newEMI;
    const interestDiff = currentEMIData.totalInterest - result.newTotalInterest;
    const totalMonthsOriginal = currentEMIData.years * 12;
    const totalMonthsNew = calculateNewTotalMonths(result.newTenureText);
    const tenureDiffMonths = totalMonthsOriginal - totalMonthsNew;
    
    document.getElementById('emiDifference').textContent = `₹${Math.round(Math.abs(emiDiff)).toLocaleString('en-IN')}`;
    document.getElementById('interestDifference').textContent = `₹${Math.round(interestDiff).toLocaleString('en-IN')}`;
    document.getElementById('tenureDifference').textContent = `${tenureDiffMonths} Months`;
    
    if (prepayOption === 'tenure') {
        document.getElementById('benefitLabel').textContent = 'Time Saved';
        document.getElementById('benefitValue').textContent = result.timeSaved;
    } else {
        document.getElementById('benefitLabel').textContent = 'EMI Reduction';
        document.getElementById('benefitValue').textContent = `₹${Math.round(emiDiff).toLocaleString('en-IN')}`;
    }
    
    document.getElementById('prepaymentResults').style.display = 'block';
    document.getElementById('prepaymentResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Update prepayment chart
    updatePrepaymentChart(currentEMIData, result);
    
    // Store prepayment data for PDF generation
    window.currentPrepaymentData = {
        original: currentEMIData,
        prepayment: result,
        prepaymentAmount: prepaymentAmount,
        prepayAfterMonths: prepayAfterMonths,
        prepayOption: prepayOption
    };
}

// Helper function to calculate total months from tenure text
function calculateNewTotalMonths(tenureText) {
    const yearMatch = tenureText.match(/(\d+)\s*Years?/);
    const monthMatch = tenureText.match(/(\d+)\s*Months?/);
    
    const years = yearMatch ? parseInt(yearMatch[1]) : 0;
    const months = monthMatch ? parseInt(monthMatch[1]) : 0;
    
    return (years * 12) + months;
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
    const loanCountSelect = document.getElementById('loanCountSelect');
    if (!loanCountSelect || !loanCountSelect.value) {
        showNotification('Please select number of loans to compare!', 'error');
        return;
    }
    
    const loanCount = parseInt(loanCountSelect.value);
    const loans = [];
    
    for (let i = 1; i <= loanCount; i++) {
        const amountElement = document.getElementById(`loan${i}Amount`);
        const rateElement = document.getElementById(`loan${i}Rate`);
        const tenureElement = document.getElementById(`loan${i}Tenure`);
        
        if (!amountElement || !rateElement || !tenureElement) {
            showNotification(`Input fields for Loan ${i} not found!`, 'error');
            return;
        }
        
        const amountValue = amountElement.value.trim();
        const rateValue = rateElement.value.trim();
        const tenureValue = tenureElement.value.trim();
        
        if (!amountValue || !rateValue || !tenureValue) {
            showNotification(`Please fill all fields for Loan ${i}: Amount, Interest Rate, and Tenure!`, 'error');
            return;
        }
        
        const amount = parseInt(amountValue);
        const rate = parseFloat(rateValue);
        const tenure = parseInt(tenureValue);
        
        if (isNaN(amount) || isNaN(rate) || isNaN(tenure)) {
            showNotification(`Please enter valid numbers for Loan ${i}!`, 'error');
            return;
        }
        
        if (amount <= 0 || amount > 100000000) {
            showNotification(`Loan ${i} amount should be between ₹1,000 and ₹10 crores!`, 'error');
            return;
        }
        
        if (rate <= 0 || rate > 50) {
            showNotification(`Loan ${i} interest rate should be between 0.1% and 50%!`, 'error');
            return;
        }
        
        if (tenure <= 0 || tenure > 50) {
            showNotification(`Loan ${i} tenure should be between 1 and 50 years!`, 'error');
            return;
        }
        
        const monthlyRate = rate / 12 / 100;
        const totalMonths = tenure * 12;
        
        let emi;
        if (monthlyRate === 0) {
            emi = amount / totalMonths;
        } else {
            emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                  (Math.pow(1 + monthlyRate, totalMonths) - 1);
        }
        
        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - amount;
        
        if (!isFinite(emi) || !isFinite(totalAmount) || !isFinite(totalInterest)) {
            showNotification(`Error in calculation for Loan ${i}. Please check your inputs!`, 'error');
            return;
        }
        
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
    if (comparisonResults) {
        comparisonResults.style.display = 'block';
        comparisonResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Store comparison data for PDF generation
    window.currentComparisonData = loans;
    
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
    if (!window.currentPrepaymentData) {
        showNotification('Please calculate prepayment impact first!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const data = window.currentPrepaymentData;
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Prepayment Impact Analysis Report', 20, 35);
        
        // Original Loan Details
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);
        doc.text('Original Loan Details:', 20, 55);
        
        doc.setTextColor(0, 0, 0);
        doc.text(`Loan Amount: ₹${data.original.principal.toLocaleString('en-IN')}`, 20, 70);
        doc.text(`Interest Rate: ${data.original.annualRate}%`, 20, 80);
        doc.text(`Loan Tenure: ${data.original.years} years`, 20, 90);
        doc.text(`Monthly EMI: ₹${Math.round(data.original.emi).toLocaleString('en-IN')}`, 20, 100);
        doc.text(`Total Interest: ₹${Math.round(data.original.totalInterest).toLocaleString('en-IN')}`, 20, 110);
        
        // Prepayment Details
        doc.setTextColor(0, 100, 0);
        doc.text('Prepayment Details:', 20, 130);
        
        doc.setTextColor(0, 0, 0);
        doc.text(`Prepayment Amount: ₹${data.prepaymentAmount.toLocaleString('en-IN')}`, 20, 145);
        doc.text(`Prepayment After: ${data.prepayAfterMonths} months`, 20, 155);
        doc.text(`Prepayment Option: ${data.prepayOption === 'tenure' ? 'Reduce Tenure' : 'Reduce EMI'}`, 20, 165);
        
        // Impact Analysis
        doc.setTextColor(0, 100, 0);
        doc.text('Impact Analysis:', 20, 185);
        
        doc.setTextColor(0, 0, 0);
        doc.text(`New Monthly EMI: ₹${Math.round(data.prepayment.newEMI).toLocaleString('en-IN')}`, 20, 200);
        doc.text(`New Total Interest: ₹${Math.round(data.prepayment.newTotalInterest).toLocaleString('en-IN')}`, 20, 210);
        doc.text(`New Tenure: ${data.prepayment.newTenureText}`, 20, 220);
        doc.text(`Interest Saved: ₹${Math.round(data.prepayment.interestSaved).toLocaleString('en-IN')}`, 20, 230);
        
        if (data.prepayOption === 'tenure') {
            doc.text(`Time Saved: ${data.prepayment.timeSaved}`, 20, 240);
        } else {
            const emiReduction = data.original.emi - data.prepayment.newEMI;
            doc.text(`EMI Reduction: ₹${Math.round(emiReduction).toLocaleString('en-IN')}`, 20, 240);
        }
        
        // Chart
        const canvas = document.getElementById('prepaymentChart');
        if (canvas) {
            try {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 20, 250, 160, 80);
            } catch (chartError) {
                console.warn('Could not add chart to PDF:', chartError);
            }
        }
        
        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);
        
        doc.save('Prepayment_Impact_Analysis.pdf');
        showNotification('Prepayment PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating prepayment PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function generateComparisonPDF() {
    if (!window.currentComparisonData || window.currentComparisonData.length === 0) {
        showNotification('Please compare loans first!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const loans = window.currentComparisonData;
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Loan Comparison Analysis Report', 20, 35);
        
        doc.setFontSize(12);
        doc.text(`Comparison of ${loans.length} Loan Options`, 20, 50);
        
        // Table header
        doc.setFontSize(10);
        doc.setTextColor(0, 100, 0);
        doc.text('Loan Option', 20, 70);
        doc.text('Loan Amount', 60, 70);
        doc.text('Rate (%)', 100, 70);
        doc.text('Tenure (Y)', 130, 70);
        doc.text('Monthly EMI', 160, 70);
        
        // Table data
        doc.setTextColor(0, 0, 0);
        let yPosition = 80;
        
        loans.forEach((loan, index) => {
            if (yPosition < 220) {
                doc.text(loan.name, 20, yPosition);
                doc.text(`₹${Math.round(loan.amount).toLocaleString('en-IN')}`, 60, yPosition);
                doc.text(`${loan.rate}%`, 100, yPosition);
                doc.text(`${loan.tenure}`, 130, yPosition);
                doc.text(`₹${Math.round(loan.emi).toLocaleString('en-IN')}`, 160, yPosition);
                yPosition += 10;
            }
        });
        
        // Summary section
        yPosition += 10;
        doc.setTextColor(0, 100, 0);
        doc.text('Total Interest Comparison:', 20, yPosition);
        yPosition += 10;
        
        doc.setTextColor(0, 0, 0);
        loans.forEach((loan, index) => {
            if (yPosition < 240) {
                doc.text(`${loan.name}: ₹${Math.round(loan.totalInterest).toLocaleString('en-IN')}`, 20, yPosition);
                yPosition += 8;
            }
        });
        
        // Find best option
        const bestLoan = loans.reduce((best, current) => 
            current.totalInterest < best.totalInterest ? current : best
        );
        
        yPosition += 5;
        doc.setTextColor(0, 150, 0);
        doc.setFontSize(11);
        doc.text(`Best Option: ${bestLoan.name} with lowest total interest of ₹${Math.round(bestLoan.totalInterest).toLocaleString('en-IN')}`, 20, yPosition);
        
        // Chart
        const canvas = document.getElementById('loanComparisonChart');
        if (canvas && yPosition < 200) {
            try {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 20, Math.min(yPosition + 15, 160), 160, 80);
            } catch (chartError) {
                console.warn('Could not add chart to PDF:', chartError);
            }
        }
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);
        
        doc.save('Loan_Comparison_Analysis.pdf');
        showNotification('Comparison PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating comparison PDF:', error);
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
