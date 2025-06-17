// Tax Calculator JavaScript

// Global variables
let taxChart, comparisonChart, salaryChart;

// Tax slabs for 2024-25
const taxSlabs = {
    old: {
        below60: [
            { min: 0, max: 250000, rate: 0 },
            { min: 250000, max: 500000, rate: 5 },
            { min: 500000, max: 1000000, rate: 20 },
            { min: 1000000, max: Infinity, rate: 30 }
        ],
        senior60: [
            { min: 0, max: 300000, rate: 0 },
            { min: 300000, max: 500000, rate: 5 },
            { min: 500000, max: 1000000, rate: 20 },
            { min: 1000000, max: Infinity, rate: 30 }
        ],
        superSenior80: [
            { min: 0, max: 500000, rate: 0 },
            { min: 500000, max: 1000000, rate: 20 },
            { min: 1000000, max: Infinity, rate: 30 }
        ]
    },
    new: {
        all: [
            { min: 0, max: 300000, rate: 0 },
            { min: 300000, max: 600000, rate: 5 },
            { min: 600000, max: 900000, rate: 10 },
            { min: 900000, max: 1200000, rate: 15 },
            { min: 1200000, max: 1500000, rate: 20 },
            { min: 1500000, max: Infinity, rate: 30 }
        ]
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabNavigation();
    initializeSlider();
    initializeEventListeners();
    initializeRegimeToggle();
    setupDefaultValues();
});

// Tab Navigation Functions
function initializeTabNavigation() {
    // Desktop tab navigation
    const desktopTabItems = document.querySelectorAll('.tab-nav-item');
    desktopTabItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab, item));
    });

    // Mobile bottom navigation
    const mobileTabItems = document.querySelectorAll('.standard-nav-item');
    mobileTabItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab, item));
    });
}

function switchTab(tabId, clickedElement) {
    // Hide all tab contents
    const allTabContents = document.querySelectorAll('.tab-content');
    allTabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update active state for desktop navigation
    const desktopTabItems = document.querySelectorAll('.tab-nav-item');
    desktopTabItems.forEach(item => item.classList.remove('active'));

    const activeDesktopTab = document.querySelector(`.tab-nav-item[data-tab="${tabId}"]`);
    if (activeDesktopTab) {
        activeDesktopTab.classList.add('active');
    }

    // Update active state for mobile navigation
    const mobileTabItems = document.querySelectorAll('.standard-nav-item');
    mobileTabItems.forEach(item => item.classList.remove('active'));

    const activeMobileTab = document.querySelector(`.standard-nav-item[data-tab="${tabId}"]`);
    if (activeMobileTab) {
        activeMobileTab.classList.add('active');
    }

    // If clicked element exists, ensure it's marked as active
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

// Slider Functions
function initializeSlider() {
    const slider = document.getElementById('salarySlider');
    const input = document.getElementById('salaryInput');
    const display = document.getElementById('salaryDisplay');

    if (slider && input && display) {
        // Sync slider with input
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            input.value = value;
            display.textContent = formatCurrency(value);
        });

        // Sync input with slider
        input.addEventListener('input', function() {
            const value = parseInt(this.value) || 0;
            slider.value = Math.min(Math.max(value, 100000), 5000000);
            display.textContent = formatCurrency(value);
        });

        // Initialize display
        const initialValue = parseInt(slider.value);
        input.value = initialValue;
        display.textContent = formatCurrency(initialValue);
    }
}

// Event Listeners
function initializeEventListeners() {
    // Tax Calculator
    const calculateBtn = document.getElementById('calculateTax');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateTax);
    }

    const refreshBtn = document.getElementById('refreshTax');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshTaxCalculator);
    }

    // Tax Planning
    const planningBtn = document.getElementById('calculatePlanning');
    if (planningBtn) {
        planningBtn.addEventListener('click', calculateTaxPlanning);
    }

    const refreshPlanningBtn = document.getElementById('refreshPlanning');
    if (refreshPlanningBtn) {
        refreshPlanningBtn.addEventListener('click', refreshTaxPlanning);
    }

    // Salary Breakdown
    const salaryBtn = document.getElementById('calculateSalaryBreakdown');
    if (salaryBtn) {
        salaryBtn.addEventListener('click', calculateSalaryBreakdown);
    }

    const refreshSalaryBtn = document.getElementById('refreshSalaryBreakdown');
    if (refreshSalaryBtn) {
        refreshSalaryBtn.addEventListener('click', refreshSalaryBreakdown);
    }

    // Deduction Optimizer
    const optimizeBtn = document.getElementById('optimizeDeductions');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', optimizeDeductions);
    }
}

// Regime Toggle Functions
function initializeRegimeToggle() {
    const regimeRadios = document.querySelectorAll('input[name="taxRegime"]');
    const deductionsSection = document.getElementById('deductionsSection');

    regimeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (deductionsSection) {
                if (this.value === 'old') {
                    deductionsSection.style.display = 'block';
                } else {
                    deductionsSection.style.display = 'none';
                }
            }
        });
    });
}

// Tax Calculation Functions
function calculateTax() {
    const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
    const ageCategory = document.querySelector('input[name="ageCategory"]:checked').value;
    const taxRegime = document.querySelector('input[name="taxRegime"]:checked').value;

    if (salary <= 0) {
        alert('Please enter a valid salary amount');
        return;
    }

    let taxableIncome = salary;
    let totalDeductions = 0;

    // Calculate deductions for old regime
    if (taxRegime === 'old') {
        const deduction80C = parseFloat(document.getElementById('deduction80C').value) || 0;
        const deduction80D = parseFloat(document.getElementById('deduction80D').value) || 0;
        const hraDeduction = parseFloat(document.getElementById('hraDeduction').value) || 0;
        const homeLoanInterest = parseFloat(document.getElementById('homeLoanInterest').value) || 0;
        const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;

        totalDeductions = Math.min(deduction80C, 150000) + deduction80D + hraDeduction + 
                         Math.min(homeLoanInterest, 200000) + otherDeductions;
        taxableIncome = Math.max(salary - totalDeductions, 0);
    } else {
        // New regime standard deduction
        totalDeductions = 50000;
        taxableIncome = Math.max(salary - 50000, 0);
    }

    // Calculate tax
    const tax = calculateIncomeTax(taxableIncome, ageCategory, taxRegime);
    const cess = tax * 0.04; // 4% cess
    const totalTax = tax + cess;
    const netTakeHome = salary - totalTax;

    // Update results
    updateTaxResults(taxableIncome, tax, cess, totalTax, netTakeHome);

    // Update comparison
    updateRegimeComparison(salary, ageCategory);

    // Update chart
    updateTaxChart(netTakeHome, totalTax);
}

function calculateIncomeTax(taxableIncome, ageCategory, regime) {
    let slabs;

    if (regime === 'old') {
        slabs = taxSlabs.old[ageCategory];
    } else {
        slabs = taxSlabs.new.all;
    }

    let tax = 0;

    for (const slab of slabs) {
        if (taxableIncome > slab.min) {
            const taxableAmount = Math.min(taxableIncome, slab.max) - slab.min;
            tax += taxableAmount * (slab.rate / 100);
        }
    }

    return tax;
}

function updateTaxResults(taxableIncome, tax, cess, totalTax, netTakeHome) {
    document.getElementById('taxableIncome').textContent = formatCurrency(taxableIncome);
    document.getElementById('incomeTax').textContent = formatCurrency(tax);
    document.getElementById('cess').textContent = formatCurrency(cess);
    document.getElementById('totalTax').textContent = formatCurrency(totalTax);
    document.getElementById('netTakeHome').textContent = formatCurrency(netTakeHome);
}

function updateRegimeComparison(salary, ageCategory) {
    // Calculate old regime
    const oldDeductions = getOldRegimeDeductions();
    const oldTaxableIncome = Math.max(salary - oldDeductions, 0);
    const oldTax = calculateIncomeTax(oldTaxableIncome, ageCategory, 'old');
    const oldCess = oldTax * 0.04;
    const oldTotalTax = oldTax + oldCess;
    const oldNetIncome = salary - oldTotalTax;

    // Calculate new regime
    const newTaxableIncome = Math.max(salary - 50000, 0);
    const newTax = calculateIncomeTax(newTaxableIncome, ageCategory, 'new');
    const newCess = newTax * 0.04;
    const newTotalTax = newTax + newCess;
    const newNetIncome = salary - newTotalTax;

    // Update comparison display
    document.getElementById('oldGrossIncome').textContent = formatCurrency(salary);
    document.getElementById('oldTotalDeductions').textContent = formatCurrency(oldDeductions);
    document.getElementById('oldTaxableIncome').textContent = formatCurrency(oldTaxableIncome);
    document.getElementById('oldTaxLiability').textContent = formatCurrency(oldTotalTax);
    document.getElementById('oldNetIncome').textContent = formatCurrency(oldNetIncome);

    document.getElementById('newGrossIncome').textContent = formatCurrency(salary);
    document.getElementById('newStandardDeduction').textContent = formatCurrency(50000);
    document.getElementById('newTaxableIncome').textContent = formatCurrency(newTaxableIncome);
    document.getElementById('newTaxLiability').textContent = formatCurrency(newTotalTax);
    document.getElementById('newNetIncome').textContent = formatCurrency(newNetIncome);

    // Update recommendation
    const savings = Math.abs(oldTotalTax - newTotalTax);
    const betterRegime = oldTotalTax < newTotalTax ? 'Old' : 'New';
    document.getElementById('recommendationText').textContent = 
        `${betterRegime} Regime is better - You save ₹${formatNumber(savings)} annually`;

    // Update comparison chart
    updateComparisonChart(oldNetIncome, oldTotalTax, newNetIncome, newTotalTax);
}

function getOldRegimeDeductions() {
    const deduction80C = parseFloat(document.getElementById('deduction80C').value) || 0;
    const deduction80D = parseFloat(document.getElementById('deduction80D').value) || 0;
    const hraDeduction = parseFloat(document.getElementById('hraDeduction').value) || 0;
    const homeLoanInterest = parseFloat(document.getElementById('homeLoanInterest').value) || 0;
    const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;

    return Math.min(deduction80C, 150000) + deduction80D + hraDeduction + 
           Math.min(homeLoanInterest, 200000) + otherDeductions;
}

// Tax Planning Functions
function calculateTaxPlanning() {
    const targetSavings = parseFloat(document.getElementById('targetSavings').value) || 0;
    const current80C = parseFloat(document.getElementById('current80C').value) || 0;

    if (targetSavings <= 0) {
        alert('Please enter a target savings amount');
        return;
    }

    const additional80C = Math.max(0, Math.min(150000 - current80C, targetSavings * 3.33));

    document.getElementById('additional80C').textContent = formatCurrency(additional80C);
    document.getElementById('planningResults').style.display = 'block';
}

// Salary Breakdown Functions
function calculateSalaryBreakdown() {
    const grossSalary = parseFloat(document.getElementById('grossSalaryBreakdown').value) || 0;
    const basicPercentage = parseFloat(document.getElementById('basicPercentage').value) || 50;
    const hraPercentage = parseFloat(document.getElementById('hraPercentage').value) || 40;
    const specialAllowances = parseFloat(document.getElementById('specialAllowances').value) || 0;

    if (grossSalary <= 0) {
        alert('Please enter a valid gross salary');
        return;
    }

    // Calculate components
    const basicSalary = (grossSalary * basicPercentage) / 100;
    const hraAmount = (basicSalary * hraPercentage) / 100;
    const otherAllowances = grossSalary - basicSalary - hraAmount - specialAllowances;

    // Calculate deductions
    const epf = Math.min(basicSalary * 0.12, 21600); // EPF capped at ₹21,600
    const professionalTax = Math.min(2400, grossSalary * 0.004); // Professional tax
    const estimatedTax = calculateEstimatedTax(grossSalary);

    const netAnnualSalary = grossSalary - epf - professionalTax - estimatedTax;
    const netMonthlySalary = netAnnualSalary / 12;

    // Update display
    document.getElementById('basicSalaryAmount').textContent = formatCurrency(basicSalary);
    document.getElementById('hraAmount').textContent = formatCurrency(hraAmount);
    document.getElementById('specialAllowancesAmount').textContent = formatCurrency(specialAllowances);
    document.getElementById('otherAllowancesAmount').textContent = formatCurrency(otherAllowances);
    document.getElementById('epfAmount').textContent = formatCurrency(epf);
    document.getElementById('professionalTax').textContent = formatCurrency(professionalTax);
    document.getElementById('tdsAmount').textContent = formatCurrency(estimatedTax);
    document.getElementById('netMonthlySalary').textContent = formatCurrency(netMonthlySalary);

    document.getElementById('salaryResults').style.display = 'block';

    // Update salary breakdown chart
    updateSalaryChart(basicSalary, hraAmount, specialAllowances, otherAllowances);
}

function calculateEstimatedTax(grossSalary) {
    // Simplified tax calculation for salary breakdown
    const taxableIncome = Math.max(grossSalary - 50000, 0); // Standard deduction
    return calculateIncomeTax(taxableIncome, 'below60', 'new') * 1.04; // Including cess
}

// Deduction Optimizer Functions
function optimizeDeductions() {
    const income = parseFloat(document.getElementById('optimizerIncome').value) || 0;
    const targetReduction = parseFloat(document.getElementById('targetReduction').value) || 0;

    if (income <= 0 || targetReduction <= 0) {
        alert('Please enter valid income and target reduction amounts');
        return;
    }

    document.getElementById('optimizationResults').style.display = 'block';
}

// Chart Functions
function updateTaxChart(netIncome, taxAmount) {
    const ctx = document.getElementById('taxChart');
    if (!ctx) return;

    if (taxChart) {
        taxChart.destroy();
    }

    taxChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Net Income', 'Tax Amount'],
            datasets: [{
                data: [netIncome, taxAmount],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 0, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 0, 128, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateComparisonChart(oldNet, oldTax, newNet, newTax) {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Old Regime', 'New Regime'],
            datasets: [
                {
                    label: 'Net Income',
                    data: [oldNet, newNet],
                    backgroundColor: 'rgba(0, 255, 136, 0.8)',
                    borderColor: 'rgba(0, 255, 136, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Tax Amount',
                    data: [oldTax, newTax],
                    backgroundColor: 'rgba(255, 0, 128, 0.8)',
                    borderColor: 'rgba(255, 0, 128, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

function updateSalaryChart(basic, hra, special, other) {
    const ctx = document.getElementById('salaryBreakdownChart');
    if (!ctx) return;

    if (salaryChart) {
        salaryChart.destroy();
    }

    salaryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Basic Salary', 'HRA', 'Special Allowances', 'Other Allowances'],
            datasets: [{
                data: [basic, hra, special, other],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(255, 0, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 212, 255, 1)',
                    'rgba(0, 255, 136, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(255, 0, 128, 1)'
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
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(amount) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    }).format(amount);
}

// Refresh Functions
function refreshTaxCalculator() {
    document.getElementById('salaryInput').value = '';
    document.getElementById('salarySlider').value = 500000;
    document.getElementById('salaryDisplay').textContent = 'Enter salary';
    document.getElementById('deduction80C').value = '';
    document.getElementById('deduction80D').value = '';
    document.getElementById('hraDeduction').value = '';
    document.getElementById('homeLoanInterest').value = '';
    document.getElementById('otherDeductions').value = '';

    // Reset results
    document.getElementById('taxableIncome').textContent = '₹0';
    document.getElementById('incomeTax').textContent = '₹0';
    document.getElementById('cess').textContent = '₹0';
    document.getElementById('totalTax').textContent = '₹0';
    document.getElementById('netTakeHome').textContent = '₹0';

    // Reset radio buttons
    document.getElementById('below60').checked = true;
    document.getElementById('oldRegime').checked = true;
    document.getElementById('deductionsSection').style.display = 'block';
}

function refreshTaxPlanning() {
    document.getElementById('targetSavings').value = '';
    document.getElementById('current80C').value = '';
    document.getElementById('planningResults').style.display = 'none';
}

function refreshSalaryBreakdown() {
    document.getElementById('grossSalaryBreakdown').value = '';
    document.getElementById('basicPercentage').value = '50';
    document.getElementById('hraPercentage').value = '40';
    document.getElementById('specialAllowances').value = '';
    document.getElementById('salaryResults').style.display = 'none';
}

// Navigation Functions
function goToEMI() {
    window.location.href = 'emi-calculator.html';
}

function goToSIP() {
    window.location.href = 'sip-calculator.html';
}

function goToGST() {
    window.location.href = 'gst-calculator.html';
}

function goToFD() {
    window.location.href = 'fd-calculator.html';
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Setup Default Values
function setupDefaultValues() {
    // Set default salary value
    const salaryInput = document.getElementById('salaryInput');
    const salarySlider = document.getElementById('salarySlider');
    const salaryDisplay = document.getElementById('salaryDisplay');

    if (salaryInput && salarySlider && salaryDisplay) {
        const defaultSalary = 500000;
        salaryInput.value = defaultSalary;
        salarySlider.value = defaultSalary;
        salaryDisplay.textContent = formatCurrency(defaultSalary);
    }
}