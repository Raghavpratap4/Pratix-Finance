
// Global variables
let fdChart, bankComparisonChart, alternativesChart, ladderingChart, taxChart;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFDCalculator();
    setupEventListeners();
    setupNavigationListeners();
});

// Initialize FD Calculator
function initializeFDCalculator() {
    clearAllInputs();
    updateSliderDisplays();
    setupSliderSyncing();
}

// Setup Event Listeners
function setupEventListeners() {
    // FD Calculator
    document.getElementById('calculateFD').addEventListener('click', calculateFD);
    document.getElementById('refreshFD').addEventListener('click', refreshFDCalculator);

    // Bank Comparison
    document.getElementById('compareBanks').addEventListener('click', compareBanks);
    document.getElementById('refreshComparison').addEventListener('click', refreshBankComparison);

    // Alternatives
    document.getElementById('compareAlternatives').addEventListener('click', compareAlternatives);
    document.getElementById('refreshAlternatives').addEventListener('click', refreshAlternatives);

    // Laddering
    document.getElementById('calculateLaddering').addEventListener('click', calculateLaddering);
    document.getElementById('refreshLaddering').addEventListener('click', refreshLaddering);

    // Tax
    document.getElementById('calculateTax').addEventListener('click', calculateTax);
    document.getElementById('refreshTax').addEventListener('click', refreshTax);

    // Tax saver FD type change
    document.querySelectorAll('input[name="fdType"]').forEach(radio => {
        radio.addEventListener('change', handleFDTypeChange);
    });
}

// Setup Navigation Listeners
function setupNavigationListeners() {
    console.log('Setting up navigation listeners...');
    
    // Desktop tab navigation
    const desktopNavItems = document.querySelectorAll('.tab-nav-item[data-tab]');
    console.log(`Found ${desktopNavItems.length} desktop nav items`);
    
    desktopNavItems.forEach((item, index) => {
        const targetTab = item.getAttribute('data-tab');
        console.log(`Desktop nav item ${index}: ${targetTab}`);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Desktop nav clicked: ${targetTab}`);
            switchTab(targetTab);

            // Update active nav item
            desktopNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Mobile bottom navigation  
    const mobileNavItems = document.querySelectorAll('.standard-nav-item[data-tab]');
    console.log(`Found ${mobileNavItems.length} mobile nav items`);
    
    mobileNavItems.forEach((item, index) => {
        const targetTab = item.getAttribute('data-tab');
        console.log(`Mobile nav item ${index}: ${targetTab}`);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Mobile nav clicked: ${targetTab}`);
            switchTab(targetTab);

            // Update active nav item
            mobileNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    console.log('Navigation listeners setup complete!');
}

// Switch Tab Function
function switchTab(tabId) {
    console.log(`Switching to tab: ${tabId}`);
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Show target tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block';
        console.log(`Successfully switched to tab: ${tabId}`);
    } else {
        console.error(`Tab not found: ${tabId}`);
    }
}

// Clear all inputs
function clearAllInputs() {
    // FD Calculator inputs
    document.getElementById('principalAmountInput').value = '';
    document.getElementById('interestRateInput').value = '';
    document.getElementById('tenureInput').value = '';

    // Reset sliders to default values
    document.getElementById('principalAmountSlider').value = 100000;
    document.getElementById('interestRateSlider').value = 7.5;
    document.getElementById('tenureSlider').value = 3;

    // Reset dropdowns
    document.getElementById('compoundingFrequency').value = 4;
    document.getElementById('regularFD').checked = true;

    // Clear results
    clearResults();
}

// Clear results
function clearResults() {
    document.getElementById('principalAmount').textContent = '₹0';
    document.getElementById('totalInterest').textContent = '₹0';
    document.getElementById('maturityAmount').textContent = '₹0';
    document.getElementById('effectiveYield').textContent = '0%';

    // Destroy existing charts
    if (fdChart) {
        fdChart.destroy();
        fdChart = null;
    }
    if (bankComparisonChart) {
        bankComparisonChart.destroy();
        bankComparisonChart = null;
    }
    if (alternativesChart) {
        alternativesChart.destroy();
        alternativesChart = null;
    }
    if (ladderingChart) {
        ladderingChart.destroy();
        ladderingChart = null;
    }
    if (taxChart) {
        taxChart.destroy();
        taxChart = null;
    }
}

// Setup slider syncing
function setupSliderSyncing() {
    // Principal Amount
    const principalSlider = document.getElementById('principalAmountSlider');
    const principalInput = document.getElementById('principalAmountInput');

    principalSlider.addEventListener('input', function() {
        principalInput.value = this.value;
        updateSliderDisplays();
    });

    principalInput.addEventListener('input', function() {
        principalSlider.value = this.value;
        updateSliderDisplays();
    });

    // Interest Rate
    const rateSlider = document.getElementById('interestRateSlider');
    const rateInput = document.getElementById('interestRateInput');

    rateSlider.addEventListener('input', function() {
        rateInput.value = this.value;
        updateSliderDisplays();
    });

    rateInput.addEventListener('input', function() {
        rateSlider.value = this.value;
        updateSliderDisplays();
    });

    // Tenure
    const tenureSlider = document.getElementById('tenureSlider');
    const tenureInput = document.getElementById('tenureInput');

    tenureSlider.addEventListener('input', function() {
        tenureInput.value = this.value;
        updateSliderDisplays();
    });

    tenureInput.addEventListener('input', function() {
        tenureSlider.value = this.value;
        updateSliderDisplays();
    });
}

// Update slider displays
function updateSliderDisplays() {
    const principal = document.getElementById('principalAmountSlider').value;
    const rate = document.getElementById('interestRateSlider').value;
    const tenure = document.getElementById('tenureSlider').value;

    document.getElementById('principalAmountDisplay').textContent = `₹${formatNumber(principal)}`;
    document.getElementById('interestRateDisplay').textContent = `${rate}% per annum`;
    document.getElementById('tenureDisplay').textContent = `${tenure} year${tenure > 1 ? 's' : ''}`;
}

// Handle FD Type Change
function handleFDTypeChange(event) {
    const tenureSlider = document.getElementById('tenureSlider');
    const tenureInput = document.getElementById('tenureInput');

    if (event.target.value === 'taxsaver') {
        tenureSlider.value = 5;
        tenureInput.value = 5;
        tenureSlider.disabled = true;
        tenureInput.disabled = true;
        updateSliderDisplays();
    } else {
        tenureSlider.disabled = false;
        tenureInput.disabled = false;
    }
}

// Calculate FD
function calculateFD() {
    const principal = parseFloat(document.getElementById('principalAmountInput').value) || 
                     parseFloat(document.getElementById('principalAmountSlider').value);
    const rate = parseFloat(document.getElementById('interestRateInput').value) || 
                parseFloat(document.getElementById('interestRateSlider').value);
    const tenure = parseFloat(document.getElementById('tenureInput').value) || 
                  parseFloat(document.getElementById('tenureSlider').value);
    const frequency = parseInt(document.getElementById('compoundingFrequency').value);

    // Validation
    if (!principal || !rate || !tenure) {
        showWarning('Please fill in all required fields to calculate FD returns.');
        return;
    }

    if (principal < 1000) {
        showWarning('Principal amount should be at least ₹1,000.');
        return;
    }

    if (rate <= 0 || rate > 20) {
        showWarning('Interest rate should be between 0.1% and 20%.');
        return;
    }

    if (tenure <= 0 || tenure > 10) {
        showWarning('Tenure should be between 1 and 10 years.');
        return;
    }

    // Calculate compound interest
    const maturityAmount = principal * Math.pow(1 + (rate/100)/frequency, frequency * tenure);
    const totalInterest = maturityAmount - principal;
    const effectiveYield = ((maturityAmount / principal) ** (1/tenure) - 1) * 100;

    // Update results
    document.getElementById('principalAmount').textContent = `₹${formatNumber(principal)}`;
    document.getElementById('totalInterest').textContent = `₹${formatNumber(totalInterest)}`;
    document.getElementById('maturityAmount').textContent = `₹${formatNumber(maturityAmount)}`;
    document.getElementById('effectiveYield').textContent = `${effectiveYield.toFixed(2)}%`;

    // Create chart
    createFDChart(principal, totalInterest);

    showNotification('FD calculation completed successfully!', 'success');
}

// Create FD Chart
function createFDChart(principal, interest) {
    const ctx = document.getElementById('fdChart').getContext('2d');

    if (fdChart) {
        fdChart.destroy();
    }

    fdChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Interest Earned'],
            datasets: [{
                data: [principal, interest],
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
                    display: false
                }
            }
        }
    });
}

// Compare Banks
function compareBanks() {
    const amount = parseFloat(document.getElementById('comparisonAmount').value);
    const tenure = parseFloat(document.getElementById('comparisonTenure').value);

    if (!amount || !tenure) {
        showWarning('Please enter deposit amount and tenure for bank comparison.');
        return;
    }

    if (amount < 1000) {
        showWarning('Deposit amount should be at least ₹1,000.');
        return;
    }

    if (tenure <= 0 || tenure > 10) {
        showWarning('Tenure should be between 1 and 10 years.');
        return;
    }

    // Bank rates based on tenure
    const bankRates = {
        'SBI': tenure <= 2 ? 6.8 : tenure <= 3 ? 7.0 : 6.5,
        'HDFC': tenure <= 2 ? 7.0 : tenure <= 3 ? 7.25 : tenure <= 5 ? 7.0 : 6.5,
        'ICICI': tenure <= 2 ? 7.0 : tenure <= 3 ? 7.25 : tenure <= 5 ? 7.0 : 6.75,
        'Axis': tenure <= 2 ? 7.25 : tenure <= 3 ? 7.5 : tenure <= 5 ? 7.25 : 7.0,
        'Kotak': tenure <= 2 ? 7.0 : tenure <= 3 ? 7.25 : tenure <= 5 ? 7.0 : 6.75,
        'PNB': tenure <= 2 ? 6.75 : tenure <= 3 ? 7.0 : 6.5
    };

    const bankReturns = {};
    Object.keys(bankRates).forEach(bank => {
        const rate = bankRates[bank];
        bankReturns[bank] = amount * Math.pow(1 + rate/100/4, 4 * tenure);
    });

    document.getElementById('comparisonResults').style.display = 'block';
    createBankComparisonChart(bankReturns);

    showNotification('Bank comparison completed successfully!', 'success');
}

// Create Bank Comparison Chart
function createBankComparisonChart(returns) {
    const ctx = document.getElementById('bankComparisonChart').getContext('2d');

    if (bankComparisonChart) {
        bankComparisonChart.destroy();
    }

    const banks = Object.keys(returns);
    const amounts = Object.values(returns);

    bankComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: banks,
            datasets: [{
                label: 'Maturity Amount',
                data: amounts,
                backgroundColor: 'rgba(49, 65, 127, 0.8)',
                borderColor: 'rgba(49, 65, 127, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
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
                            return '₹' + formatNumber(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Compare Alternatives
function compareAlternatives() {
    const amount = parseFloat(document.getElementById('altInvestmentAmount').value);
    const period = parseFloat(document.getElementById('altInvestmentPeriod').value);
    const fdRate = parseFloat(document.getElementById('altFDRate').value);

    if (!amount || !period || !fdRate) {
        showWarning('Please fill in all fields for investment comparison.');
        return;
    }

    if (amount < 1000) {
        showWarning('Investment amount should be at least ₹1,000.');
        return;
    }

    if (period <= 0 || period > 20) {
        showWarning('Investment period should be between 1 and 20 years.');
        return;
    }

    // Calculate returns for different investments
    const fdReturns = amount * Math.pow(1 + fdRate/100/4, 4 * period);
    const sipReturns = calculateSIPReturns(amount/12, 12, period); // Monthly SIP
    const ppfReturns = amount * Math.pow(1 + 7.1/100, period);
    const nscReturns = amount * Math.pow(1 + 6.8/100, period);

    // Update results
    document.getElementById('fdReturns').textContent = `₹${formatNumber(fdReturns)}`;
    document.getElementById('sipReturns').textContent = `₹${formatNumber(sipReturns)}`;
    document.getElementById('ppfReturns').textContent = `₹${formatNumber(ppfReturns)}`;
    document.getElementById('nscReturns').textContent = `₹${formatNumber(nscReturns)}`;

    document.getElementById('alternativesResults').style.display = 'block';

    // Create chart
    createAlternativesChart({
        'Fixed Deposit': fdReturns,
        'SIP (12%)': sipReturns,
        'PPF (7.1%)': ppfReturns,
        'NSC (6.8%)': nscReturns
    });

    // Generate recommendation
    generateInvestmentRecommendation(fdReturns, sipReturns, ppfReturns, nscReturns, period);

    showNotification('Investment comparison completed successfully!', 'success');
}

// Calculate SIP Returns
function calculateSIPReturns(monthlyAmount, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    return monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
}

// Create Alternatives Chart
function createAlternativesChart(returns) {
    const ctx = document.getElementById('alternativesChart').getContext('2d');

    if (alternativesChart) {
        alternativesChart.destroy();
    }

    const labels = Object.keys(returns);
    const data = Object.values(returns);

    alternativesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Maturity Amount',
                data: data,
                backgroundColor: [
                    'rgba(49, 65, 127, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(100, 45, 151, 0.8)'
                ],
                borderColor: [
                    'rgba(49, 65, 127, 1)',
                    'rgba(240, 147, 251, 1)',
                    'rgba(0, 212, 255, 1)',
                    'rgba(100, 45, 151, 1)'
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
                            return '₹' + formatNumber(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Generate Investment Recommendation
function generateInvestmentRecommendation(fd, sip, ppf, nsc, period) {
    const recommendations = [];

    const highest = Math.max(fd, sip, ppf, nsc);
    let bestOption = '';

    if (sip === highest) {
        bestOption = 'SIP Mutual Funds';
        recommendations.push('SIP offers highest returns but comes with market risk.');
    } else if (fd === highest) {
        bestOption = 'Fixed Deposit';
        recommendations.push('FD provides guaranteed returns with complete safety.');
    } else if (ppf === highest) {
        bestOption = 'PPF';
        recommendations.push('PPF offers tax-free returns with 15-year lock-in.');
    } else {
        bestOption = 'NSC';
        recommendations.push('NSC provides tax benefits under 80C with guaranteed returns.');
    }

    if (period <= 3) {
        recommendations.push('For short-term goals, consider FD or liquid funds.');
    } else if (period <= 7) {
        recommendations.push('Mix FD with SIP for balanced risk-return profile.');
    } else {
        recommendations.push('For long-term wealth creation, SIP in equity funds is recommended.');
    }

    document.getElementById('investmentRecommendation').innerHTML = 
        `<strong>Best Option:</strong> ${bestOption}<br><br>${recommendations.join('<br><br>')}`;
}

// Calculate Laddering
function calculateLaddering() {
    const totalAmount = parseFloat(document.getElementById('ladderingAmount').value);
    const numberOfFDs = parseInt(document.getElementById('numberOfFDs').value);
    const avgRate = parseFloat(document.getElementById('ladderingRate').value);

    if (!totalAmount || !avgRate) {
        showWarning('Please enter total amount and average interest rate for laddering strategy.');
        return;
    }

    if (totalAmount < 10000) {
        showWarning('Total amount should be at least ₹10,000 for laddering.');
        return;
    }

    if (avgRate <= 0 || avgRate > 15) {
        showWarning('Interest rate should be between 0.1% and 15%.');
        return;
    }

    const amountPerFD = totalAmount / numberOfFDs;
    const ladderGrid = document.getElementById('ladderGrid');
    ladderGrid.innerHTML = '';

    const ladderData = [];

    for (let i = 1; i <= numberOfFDs; i++) {
        const tenure = i;
        const rate = avgRate + (i - 1) * 0.1; // Slightly higher rates for longer tenure
        const maturityAmount = amountPerFD * Math.pow(1 + rate/100/4, 4 * tenure);

        ladderData.push({
            fd: i,
            amount: amountPerFD,
            tenure: tenure,
            rate: rate,
            maturity: maturityAmount
        });

        const ladderItem = document.createElement('div');
        ladderItem.className = 'ladder-item';
        ladderItem.innerHTML = `
            <div class="ladder-header">
                <h4>FD ${i}</h4>
                <span class="ladder-tenure">${tenure} Year${tenure > 1 ? 's' : ''}</span>
            </div>
            <div class="ladder-details">
                <div class="ladder-detail">
                    <span>Amount:</span>
                    <span>₹${formatNumber(amountPerFD)}</span>
                </div>
                <div class="ladder-detail">
                    <span>Rate:</span>
                    <span>${rate.toFixed(2)}%</span>
                </div>
                <div class="ladder-detail">
                    <span>Maturity:</span>
                    <span>₹${formatNumber(maturityAmount)}</span>
                </div>
            </div>
        `;
        ladderGrid.appendChild(ladderItem);
    }

    document.getElementById('ladderingResults').style.display = 'block';
    createLadderingChart(ladderData);

    showNotification('FD laddering strategy created successfully!', 'success');
}

// Create Laddering Chart
function createLadderingChart(data) {
    const ctx = document.getElementById('ladderingChart').getContext('2d');

    if (ladderingChart) {
        ladderingChart.destroy();
    }

    const labels = data.map(item => `FD ${item.fd} (${item.tenure}Y)`);
    const amounts = data.map(item => item.maturity);

    ladderingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Maturity Timeline',
                data: amounts,
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
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
                            return '₹' + formatNumber(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Calculate Tax
function calculateTax() {
    const annualInterest = parseFloat(document.getElementById('annualInterest').value);
    const taxSlab = parseFloat(document.getElementById('taxSlab').value);
    const isSenior = document.querySelector('input[name="seniorCitizen"]:checked').value === 'yes';

    if (!annualInterest) {
        showWarning('Please enter annual FD interest income for tax calculation.');
        return;
    }

    if (annualInterest < 0) {
        showWarning('Annual interest income cannot be negative.');
        return;
    }

    // TDS calculation
    const tdsThreshold = isSenior ? 50000 : 40000;
    const tdsRate = 10;
    let tdsAmount = 0;

    if (annualInterest > tdsThreshold) {
        tdsAmount = annualInterest * tdsRate / 100;
    }

    // Additional tax calculation
    const additionalTax = annualInterest * taxSlab / 100 - tdsAmount;
    const totalTax = tdsAmount + Math.max(0, additionalTax);
    const postTaxReturns = annualInterest - totalTax;

    // Update results
    document.getElementById('grossInterest').textContent = `₹${formatNumber(annualInterest)}`;
    document.getElementById('tdsAmount').textContent = `₹${formatNumber(tdsAmount)}`;
    document.getElementById('additionalTax').textContent = `₹${formatNumber(Math.max(0, additionalTax))}`;
    document.getElementById('totalTaxOnFD').textContent = `₹${formatNumber(totalTax)}`;
    document.getElementById('postTaxReturns').textContent = `₹${formatNumber(postTaxReturns)}`;

    document.getElementById('taxResults').style.display = 'block';

    // Create tax chart
    createTaxChart(postTaxReturns, totalTax);

    showNotification('Tax calculation completed successfully!', 'success');
}

// Create Tax Chart
function createTaxChart(postTaxReturns, totalTax) {
    const ctx = document.getElementById('taxChart').getContext('2d');

    if (taxChart) {
        taxChart.destroy();
    }

    taxChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Post-Tax Returns', 'Tax Amount'],
            datasets: [{
                data: [postTaxReturns, totalTax],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 71, 87, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 71, 87, 1)'
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

// Refresh Functions
function refreshFDCalculator() {
    clearAllInputs();
    updateSliderDisplays();
    clearResults();
    showNotification('FD calculator refreshed!', 'info');
}

function refreshBankComparison() {
    document.getElementById('comparisonAmount').value = '';
    document.getElementById('comparisonTenure').value = '';
    document.getElementById('comparisonResults').style.display = 'none';
    if (bankComparisonChart) {
        bankComparisonChart.destroy();
        bankComparisonChart = null;
    }
    showNotification('Bank comparison refreshed!', 'info');
}

function refreshAlternatives() {
    document.getElementById('altInvestmentAmount').value = '';
    document.getElementById('altInvestmentPeriod').value = '';
    document.getElementById('altFDRate').value = '';
    document.getElementById('alternativesResults').style.display = 'none';
    if (alternativesChart) {
        alternativesChart.destroy();
        alternativesChart = null;
    }
    showNotification('Alternatives comparison refreshed!', 'info');
}

function refreshLaddering() {
    document.getElementById('ladderingAmount').value = '';
    document.getElementById('numberOfFDs').value = 4;
    document.getElementById('ladderingRate').value = '';
    document.getElementById('ladderingResults').style.display = 'none';
    if (ladderingChart) {
        ladderingChart.destroy();
        ladderingChart = null;
    }
    showNotification('Laddering strategy refreshed!', 'info');
}

function refreshTax() {
    document.getElementById('annualInterest').value = '';
    document.getElementById('taxSlab').value = 20;
    document.getElementById('notSenior').checked = true;
    document.getElementById('taxResults').style.display = 'none';
    if (taxChart) {
        taxChart.destroy();
        taxChart = null;
    }
    showNotification('Tax calculation refreshed!', 'info');
}

// Utility Functions
function formatNumber(num) {
    return Math.round(num).toLocaleString('en-IN');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 
                     type === 'error' ? 'linear-gradient(135deg, #ff4757, #ff6b7a)' : 
                     'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(20px);
        animation: slideInDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showWarning(message) {
    showNotification(message, 'error');
}

// Navigation Functions
function goToHome() {
    window.location.href = '/index.html';
}

function goToEMI() {
    window.location.href = '/emi-calculator.html';
}

function goToSIP() {
    window.location.href = '/sip-calculator.html';
}

function goToGST() {
    window.location.href = '/gst-calculator.html';
}

function goToTax() {
    window.location.href = '/tax-calculator.html';
}

function goBack() {
    window.history.back();
}

// Additional functions for tools-extras tab
function downloadFDReport() {
    showNotification('FD Report download feature coming soon!', 'info');
}

function shareFDCalculation() {
    if (navigator.share) {
        navigator.share({
            title: 'FD Calculator - PRATIX FINANCE',
            text: 'Check out this amazing FD Calculator!',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Unable to copy link', 'error');
        });
    }
}

function printFDResults() {
    window.print();
}

// Add CSS for ladder items
const style = document.createElement('style');
style.textContent = `
    .ladder-item {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }

    .ladder-item:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-2px);
    }

    .ladder-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .ladder-header h4 {
        color: #00d4ff;
        margin: 0;
        font-size: 1rem;
    }

    .ladder-tenure {
        background: rgba(0, 212, 255, 0.2);
        color: #00d4ff;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .ladder-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .ladder-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .ladder-detail span:first-child {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }

    .ladder-detail span:last-child {
        color: #ffffff;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .bank-rates-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .bank-card {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }

    .bank-card:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
    }

    .bank-card h3 {
        color: #00d4ff;
        text-align: center;
        margin-bottom: 1rem;
        font-size: 1.125rem;
    }

    .rate-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .rate-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .rate-item:last-child {
        border-bottom: none;
    }

    .rate-item span:first-child {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }

    .rate-item span:last-child {
        color: #00ff88;
        font-weight: 700;
        font-size: 0.95rem;
    }

    .alternatives-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .alternative-card {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }

    .alternative-card:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
    }

    .alternative-card h4 {
        text-align: center;
        margin-bottom: 1rem;
        color: #ffffff;
        font-size: 1rem;
    }

    .alt-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .alt-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
    }

    .alt-item span:first-child {
        color: rgba(255, 255, 255, 0.7);
    }

    .alt-item span:last-child {
        color: #ffffff;
        font-weight: 600;
    }

    .risk-low {
        color: #00ff88 !important;
    }

    .risk-medium {
        color: #ffb800 !important;
    }

    .fd-card {
        border-color: rgba(49, 65, 127, 0.5);
    }

    .sip-card {
        border-color: rgba(240, 147, 251, 0.5);
    }

    .ppf-card {
        border-color: rgba(0, 212, 255, 0.5);
    }

    .nsc-card {
        border-color: rgba(100, 45, 151, 0.5);
    }

    .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .benefit-item {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .benefit-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .benefit-item h4 {
        color: #ffffff;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .benefit-item p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        line-height: 1.4;
        margin: 0;
    }

    .tax-summary {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
    }

    .tax-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tax-item:last-child {
        border-bottom: none;
    }

    .tax-item.total-tax {
        border-top: 2px solid #00d4ff;
        padding-top: 1rem;
        margin-top: 1rem;
        font-weight: 700;
    }

    .tax-label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
    }

    .tax-value {
        font-size: 1.125rem;
        font-weight: 700;
        color: #00ff88;
    }

    .total-tax .tax-value {
        color: #00d4ff;
        font-size: 1.25rem;
    }

    .tax-tips {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
    }

    .tax-tips h3 {
        color: #ffffff;
        margin-bottom: 1rem;
        font-size: 1.125rem;
    }

    .tips-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tip-icon {
        font-size: 1.25rem;
        margin-top: 0.1rem;
    }

    .tip-item p {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.5;
        margin: 0;
        font-size: 0.9rem;
    }

    .tip-item strong {
        color: #00d4ff;
    }

    .laddering-explanation {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 2rem;
    }

    .laddering-explanation h3 {
        color: #00d4ff;
        margin-bottom: 0.75rem;
    }

    .laddering-explanation p {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
        margin: 0;
    }

    .recommendation-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 16px;
        padding: 1.5rem;
        margin-top: 2rem;
        text-align: center;
    }

    .recommendation-card h4 {
        color: #00d4ff;
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
    }

    .recommendation-card p {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
        margin: 0;
    }

    .recommendation-card strong {
        color: #00ff88;
    }
`;
document.head.appendChild(style);

console.log('FD Calculator initialized successfully!');
