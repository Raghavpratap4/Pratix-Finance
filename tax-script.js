// Income Tax Calculator JavaScript
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

    window.goToSIP = function() {
        window.location.href = 'sip-calculator.html';
    };

    window.goToGST = function() {
        window.location.href = 'gst-calculator.html';
    }

    window.goToFD = function() {
        window.location.href = '/fd-calculator.html';
    }

    // Tax Calculator functionality
    let taxChart = null;
    let comparisonChart = null;
    let salaryBreakdownChart = null;

    // Tax slabs for FY 2024-25
    const TAX_SLABS = {
        old: {
            below60: [
                { min: 0, max: 250000, rate: 0 },
                { min: 250001, max: 500000, rate: 5 },
                { min: 500001, max: 1000000, rate: 20 },
                { min: 1000001, max: Infinity, rate: 30 }
            ],
            senior60: [
                { min: 0, max: 300000, rate: 0 },
                { min: 300001, max: 500000, rate: 5 },
                { min: 500001, max: 1000000, rate: 20 },
                { min: 1000001, max: Infinity, rate: 30 }
            ],
            superSenior80: [
                { min: 0, max: 500000, rate: 0 },
                { min: 500001, max: 1000000, rate: 20 },
                { min: 1000001, max: Infinity, rate: 30 }
            ]
        },
        new: {
            all: [
                { min: 0, max: 300000, rate: 0 },
                { min: 300001, max: 600000, rate: 5 },
                { min: 600001, max: 900000, rate: 10 },
                { min: 900001, max: 1200000, rate: 15 },
                { min: 1200001, max: 1500000, rate: 20 },
                { min: 1500001, max: Infinity, rate: 30 }
            ]
        }
    };

    // Initialize Tax Calculator
    function initTaxCalculator() {
        const salarySlider = document.getElementById('salarySlider');
        const salaryInput = document.getElementById('salaryInput');
        const salaryDisplay = document.getElementById('salaryDisplay');

        const calculateBtn = document.getElementById('calculateTax');
        const refreshBtn = document.getElementById('refreshTax');

        // Initialize with empty values
        initializeEmptyValues();

        // Sync slider with input
        if (salarySlider && salaryInput) {
            salarySlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                salaryInput.value = value;
                salaryDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                if (validateTaxInputs()) {
                    calculateTax();
                }
            });

            salaryInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 100000 && value <= 5000000) {
                        salarySlider.value = value;
                        salaryDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                    } else {
                        salaryDisplay.textContent = 'Enter valid salary (₹1L - ₹50L)';
                    }
                } else {
                    salaryDisplay.textContent = 'Enter salary';
                }
            });
        }

        // Tax regime change handler
        const regimeRadios = document.querySelectorAll('input[name="taxRegime"]');
        const deductionsSection = document.getElementById('deductionsSection');

        regimeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'old') {
                    deductionsSection.style.display = 'block';
                } else {
                    deductionsSection.style.display = 'none';
                }
                if (validateTaxInputs()) {
                    calculateTax();
                    calculateRegimeComparison();
                }
            });
        });

        // Age category change handler
        const ageRadios = document.querySelectorAll('input[name="ageCategory"]');
        ageRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (validateTaxInputs()) {
                    calculateTax();
                    calculateRegimeComparison();
                }
            });
        });

        // Deduction inputs change handlers
        const deductionInputs = [
            'deduction80C', 'deduction80D', 'hraDeduction', 
            'homeLoanInterest', 'otherDeductions'
        ];

        deductionInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', function() {
                    if (validateTaxInputs()) {
                        calculateTax();
                        calculateRegimeComparison();
                    }
                });
            }
        });

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                if (!validateTaxInputs()) {
                    return;
                }

                this.classList.add('loading');
                this.querySelector('.btn-text').textContent = 'Calculating...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.querySelector('.btn-text').textContent = 'Calculate Tax';
                    calculateTax();
                    calculateRegimeComparison();
                    showNotification('Tax calculated successfully!', 'success');
                }, 800);
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                initializeEmptyValues();
                showNotification('Tax calculator refreshed!', 'info');
            });
        }

        // Initialize chart
        initTaxChart();
    }

    function initializeEmptyValues() {
        // Clear all input fields
        if (document.getElementById('salaryInput')) document.getElementById('salaryInput').value = '';
        if (document.getElementById('deduction80C')) document.getElementById('deduction80C').value = '';
        if (document.getElementById('deduction80D')) document.getElementById('deduction80D').value = '';
        if (document.getElementById('hraDeduction')) document.getElementById('hraDeduction').value = '';
        if (document.getElementById('homeLoanInterest')) document.getElementById('homeLoanInterest').value = '';
        if (document.getElementById('otherDeductions')) document.getElementById('otherDeductions').value = '';

        // Reset slider
        if (document.getElementById('salarySlider')) document.getElementById('salarySlider').value = '100000';

        // Update display
        if (document.getElementById('salaryDisplay')) document.getElementById('salaryDisplay').textContent = 'Enter salary';

        // Reset to old regime and below 60
        if (document.getElementById('oldRegime')) document.getElementById('oldRegime').checked = true;
        if (document.getElementById('below60')) document.getElementById('below60').checked = true;

        // Show deductions section
        const deductionsSection = document.getElementById('deductionsSection');
        if (deductionsSection) deductionsSection.style.display = 'block';

        // Clear results
        clearTaxResults();

        // Reset chart
        if (taxChart) {
            taxChart.data.datasets[0].data = [0, 0];
            taxChart.update();
        }
    }

    function clearTaxResults() {
        if (document.getElementById('taxableIncome')) document.getElementById('taxableIncome').textContent = '₹0';
        if (document.getElementById('incomeTax')) document.getElementById('incomeTax').textContent = '₹0';
        if (document.getElementById('cess')) document.getElementById('cess').textContent = '₹0';
        if (document.getElementById('totalTax')) document.getElementById('totalTax').textContent = '₹0';
        if (document.getElementById('netTakeHome')) document.getElementById('netTakeHome').textContent = '₹0';
    }

    function validateTaxInputs() {
        const salary = document.getElementById('salaryInput')?.value;

        if (!salary || salary <= 0) {
            showNotification('Please enter a valid salary amount', 'error');
            return false;
        }

        return true;
    }

    function calculateTax() {
        const grossSalary = parseInt(document.getElementById('salaryInput')?.value) || 0;
        const taxRegime = document.querySelector('input[name="taxRegime"]:checked')?.value || 'old';
        const ageCategory = document.querySelector('input[name="ageCategory"]:checked')?.value || 'below60';

        if (grossSalary <= 0) {
            clearTaxResults();
            return;
        }

        let taxableIncome = grossSalary;
        let totalDeductions = 0;

        if (taxRegime === 'old') {
            // Calculate deductions for old regime
            const deduction80C = Math.min(parseInt(document.getElementById('deduction80C')?.value) || 0, 150000);
            const deduction80D = parseInt(document.getElementById('deduction80D')?.value) || 0;
            const hraDeduction = parseInt(document.getElementById('hraDeduction')?.value) || 0;
            const homeLoanInterest = parseInt(document.getElementById('homeLoanInterest')?.value) || 0;
            const otherDeductions = parseInt(document.getElementById('otherDeductions')?.value) || 0;

            totalDeductions = deduction80C + deduction80D + hraDeduction + homeLoanInterest + otherDeductions;
            taxableIncome = Math.max(grossSalary - totalDeductions, 0);
        } else {
            // New regime - standard deduction of ₹50,000
            totalDeductions = 50000;
            taxableIncome = Math.max(grossSalary - totalDeductions, 0);
        }

        // Calculate tax based on regime and age category
        let taxSlabs;
        if (taxRegime === 'old') {
            taxSlabs = TAX_SLABS.old[ageCategory];
        } else {
            taxSlabs = TAX_SLABS.new.all;
        }

        const incomeTax = calculateIncomeTax(taxableIncome, taxSlabs);
        const cess = incomeTax * 0.04; // 4% Health and Education Cess
        const totalTax = incomeTax + cess;
        const netTakeHome = grossSalary - totalTax;

        // Update display
        document.getElementById('taxableIncome').textContent = `₹${taxableIncome.toLocaleString('en-IN')}`;
        document.getElementById('incomeTax').textContent = `₹${Math.round(incomeTax).toLocaleString('en-IN')}`;
        document.getElementById('cess').textContent = `₹${Math.round(cess).toLocaleString('en-IN')}`;
        document.getElementById('totalTax').textContent = `₹${Math.round(totalTax).toLocaleString('en-IN')}`;
        document.getElementById('netTakeHome').textContent = `₹${Math.round(netTakeHome).toLocaleString('en-IN')}`;

        // Update chart
        updateTaxChart(netTakeHome, totalTax);
    }

    function calculateIncomeTax(taxableIncome, taxSlabs) {
        let tax = 0;

        for (const slab of taxSlabs) {
            if (taxableIncome > slab.min) {
                const taxableAmountInSlab = Math.min(taxableIncome, slab.max) - slab.min + 1;
                if (taxableAmountInSlab > 0) {
                    tax += taxableAmountInSlab * (slab.rate / 100);
                }
            }
        }

        return tax;
    }

    function calculateRegimeComparison() {
        const grossSalary = parseInt(document.getElementById('salaryInput')?.value) || 0;
        const ageCategory = document.querySelector('input[name="ageCategory"]:checked')?.value || 'below60';

        if (grossSalary <= 0) return;

        // Old regime calculation
        const deduction80C = Math.min(parseInt(document.getElementById('deduction80C')?.value) || 0, 150000);
        const deduction80D = parseInt(document.getElementById('deduction80D')?.value) || 0;
        const hraDeduction = parseInt(document.getElementById('hraDeduction')?.value) || 0;
        const homeLoanInterest = parseInt(document.getElementById('homeLoanInterest')?.value) || 0;
        const otherDeductions = parseInt(document.getElementById('otherDeductions')?.value) || 0;

        const oldTotalDeductions = deduction80C + deduction80D + hraDeduction + homeLoanInterest + otherDeductions;
        const oldTaxableIncome = Math.max(grossSalary - oldTotalDeductions, 0);
        const oldIncomeTax = calculateIncomeTax(oldTaxableIncome, TAX_SLABS.old[ageCategory]);
        const oldCess = oldIncomeTax * 0.04;
        const oldTotalTax = oldIncomeTax + oldCess;
        const oldNetIncome = grossSalary - oldTotalTax;

        // New regime calculation
        const newTotalDeductions = 50000;
        const newTaxableIncome = Math.max(grossSalary - newTotalDeductions, 0);
        const newIncomeTax = calculateIncomeTax(newTaxableIncome, TAX_SLABS.new.all);
        const newCess = newIncomeTax * 0.04;
        const newTotalTax = newIncomeTax + newCess;
        const newNetIncome = grossSalary - newTotalTax;

        // Update comparison display
        document.getElementById('oldGrossIncome').textContent = `₹${grossSalary.toLocaleString('en-IN')}`;
        document.getElementById('oldTotalDeductions').textContent = `₹${oldTotalDeductions.toLocaleString('en-IN')}`;
        document.getElementById('oldTaxableIncome').textContent = `₹${oldTaxableIncome.toLocaleString('en-IN')}`;
        document.getElementById('oldTaxLiability').textContent = `₹${Math.round(oldTotalTax).toLocaleString('en-IN')}`;
        document.getElementById('oldNetIncome').textContent = `₹${Math.round(oldNetIncome).toLocaleString('en-IN')}`;

        document.getElementById('newGrossIncome').textContent = `₹${grossSalary.toLocaleString('en-IN')}`;
        document.getElementById('newStandardDeduction').textContent = `₹${newTotalDeductions.toLocaleString('en-IN')}`;
        document.getElementById('newTaxableIncome').textContent = `₹${newTaxableIncome.toLocaleString('en-IN')}`;
        document.getElementById('newTaxLiability').textContent = `₹${Math.round(newTotalTax).toLocaleString('en-IN')}`;
        document.getElementById('newNetIncome').textContent = `₹${Math.round(newNetIncome).toLocaleString('en-IN')}`;

        // Update recommendation
        const recommendationCard = document.getElementById('recommendationCard');
        const recommendationText = document.getElementById('recommendationText');

        if (newNetIncome > oldNetIncome) {
            const savings = newNetIncome - oldNetIncome;
            recommendationText.textContent = `New Regime is better - You save ₹${Math.round(savings).toLocaleString('en-IN')} annually`;
            recommendationCard.className = 'recommendation-card new-better';
        } else if (oldNetIncome > newNetIncome) {
            const savings = oldNetIncome - newNetIncome;
            recommendationText.textContent = `Old Regime is better - You save ₹${Math.round(savings).toLocaleString('en-IN')} annually`;
            recommendationCard.className = 'recommendation-card old-better';
        } else {
            recommendationText.textContent = 'Both regimes result in the same tax liability';
            recommendationCard.className = 'recommendation-card equal';
        }

        // Update comparison chart
        updateComparisonChart(oldNetIncome, oldTotalTax, newNetIncome, newTotalTax);
    }

    function initTaxChart() {
        const ctx = document.getElementById('taxChart');
        if (!ctx) return;

        taxChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Net Income', 'Tax Amount'],
                datasets: [{
                    data: [400000, 100000],
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

    function updateTaxChart(netIncome, taxAmount) {
        if (taxChart) {
            taxChart.data.datasets[0].data = [Math.round(netIncome), Math.round(taxAmount)];
            taxChart.update('active');
        }
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
                        data: [Math.round(oldNet), Math.round(newNet)],
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Tax Amount',
                        data: [Math.round(oldTax), Math.round(newTax)],
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
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
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

    // Tax Planning functionality
    function initTaxPlanning() {
        const calculatePlanningBtn = document.getElementById('calculatePlanning');
        const refreshPlanningBtn = document.getElementById('refreshPlanning');

        if (calculatePlanningBtn) {
            calculatePlanningBtn.addEventListener('click', function() {
                const targetSavings = parseInt(document.getElementById('targetSavings')?.value) || 50000;
                const current80C = parseInt(document.getElementById('current80C')?.value) || 0;

                // Calculate additional 80C needed
                const maxDeduction80C = 150000;
                const additional80C = Math.max(0, Math.min(targetSavings, maxDeduction80C - current80C));

                document.getElementById('additional80C').textContent = `₹${additional80C.toLocaleString('en-IN')}`;
                document.getElementById('planningResults').style.display = 'block';

                showNotification('Tax saving plan generated!', 'success');
            });
        }

        if (refreshPlanningBtn) {
            refreshPlanningBtn.addEventListener('click', function() {
                if (document.getElementById('targetSavings')) document.getElementById('targetSavings').value = '';
                if (document.getElementById('current80C')) document.getElementById('current80C').value = '';
                document.getElementById('planningResults').style.display = 'none';
                showNotification('Tax planning refreshed!', 'info');
            });
        }
    }

    // Salary Breakdown functionality
    function initSalaryBreakdown() {
        const calculateSalaryBreakdownBtn = document.getElementById('calculateSalaryBreakdown');
        const refreshSalaryBreakdownBtn = document.getElementById('refreshSalaryBreakdown');

        if (calculateSalaryBreakdownBtn) {
            calculateSalaryBreakdownBtn.addEventListener('click', function() {
                const grossSalary = parseInt(document.getElementById('grossSalaryBreakdown')?.value) || 600000;
                const basicPercentage = parseInt(document.getElementById('basicPercentage')?.value) || 50;
                const hraPercentage = parseInt(document.getElementById('hraPercentage')?.value) || 40;
                const specialAllowances = parseInt(document.getElementById('specialAllowances')?.value) || 0;

                // Calculate components
                const basicSalary = (grossSalary * basicPercentage) / 100;
                const hraAmount = (basicSalary * hraPercentage) / 100;
                const otherAllowances = grossSalary - basicSalary - hraAmount - specialAllowances;

                // Calculate deductions
                const epfAmount = Math.min(basicSalary * 0.12, 21600); // 12% of basic, max ₹21,600
                const professionalTax = 2400; // Annual professional tax
                const tdsAmount = calculateTDS(grossSalary);

                const totalDeductions = epfAmount + professionalTax + tdsAmount;
                const netAnnualSalary = grossSalary - totalDeductions;
                const netMonthlySalary = netAnnualSalary / 12;

                // Update display
                document.getElementById('basicSalaryAmount').textContent = `₹${Math.round(basicSalary).toLocaleString('en-IN')}`;
                document.getElementById('hraAmount').textContent = `₹${Math.round(hraAmount).toLocaleString('en-IN')}`;
                document.getElementById('specialAllowancesAmount').textContent = `₹${specialAllowances.toLocaleString('en-IN')}`;
                document.getElementById('otherAllowancesAmount').textContent = `₹${Math.round(otherAllowances).toLocaleString('en-IN')}`;

                document.getElementById('epfAmount').textContent = `₹${Math.round(epfAmount).toLocaleString('en-IN')}`;
                document.getElementById('professionalTax').textContent = `₹${professionalTax.toLocaleString('en-IN')}`;
                document.getElementById('tdsAmount').textContent = `₹${Math.round(tdsAmount).toLocaleString('en-IN')}`;

                document.getElementById('netMonthlySalary').textContent = `₹${Math.round(netMonthlySalary).toLocaleString('en-IN')}`;

                document.getElementById('salaryResults').style.display = 'block';

                // Update salary breakdown chart
                updateSalaryBreakdownChart(basicSalary, hraAmount, specialAllowances, otherAllowances);

                showNotification('Salary breakdown calculated!', 'success');
            });
        }

        if (refreshSalaryBreakdownBtn) {
            refreshSalaryBreakdownBtn.addEventListener('click', function() {
                if (document.getElementById('grossSalaryBreakdown')) document.getElementById('grossSalaryBreakdown').value = '';
                if (document.getElementById('basicPercentage')) document.getElementById('basicPercentage').value = '50';
                if (document.getElementById('hraPercentage')) document.getElementById('hraPercentage').value = '40';
                if (document.getElementById('specialAllowances')) document.getElementById('specialAllowances').value = '';
                document.getElementById('salaryResults').style.display = 'none';
                showNotification('Salary breakdown refreshed!', 'info');
            });
        }
    }

    function calculateTDS(grossSalary) {
        // Simplified TDS calculation - assume standard deduction of ₹50,000
        const taxableIncome = Math.max(grossSalary - 50000, 0);
        const incomeTax = calculateIncomeTax(taxableIncome, TAX_SLABS.new.all);
        const cess = incomeTax * 0.04;
        return incomeTax + cess;
    }

    function updateSalaryBreakdownChart(basic, hra, special, other) {
        const ctx = document.getElementById('salaryBreakdownChart');
        if (!ctx) return;

        if (salaryBreakdownChart) {
            salaryBreakdownChart.destroy();
        }

        salaryBreakdownChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Basic Salary', 'HRA', 'Special Allowances', 'Other Allowances'],
                datasets: [{
                    data: [Math.round(basic), Math.round(hra), special, Math.round(other)],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(255, 206, 84, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 212, 255, 1)',
                        'rgba(240, 147, 251, 1)',
                        'rgba(255, 206, 84, 1)',
                        'rgba(75, 192, 192, 1)'
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
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 10
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
                cutout: '50%'
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
    initTaxCalculator();
    initTaxPlanning();
    initSalaryBreakdown();

    console.log('Income Tax Calculator initialized successfully!');
});