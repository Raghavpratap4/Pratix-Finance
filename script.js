// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to switch tabs
    function switchTab(targetTab) {
        // Remove active class from all nav items and tab contents
        navItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Show corresponding tab content
        const activeTabContent = document.getElementById(targetTab);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }

        // Store current tab in localStorage
        localStorage.setItem('activeTab', targetTab);

        // Scroll to top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
    }

    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Restore last active tab from localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab);
    }

    // EMI Calculator functionality
    let emiChart = null;
    let prepaymentChart = null;
    let loanComparisonChart = null;

    // Initialize EMI Calculator
    function initEMICalculator() {
        const loanAmountSlider = document.getElementById('loanAmountSlider');
        const loanAmountInput = document.getElementById('loanAmountInput');
        const loanAmountDisplay = document.getElementById('loanAmountDisplay');

        const interestRateSlider = document.getElementById('interestRateSlider');
        const interestRateInput = document.getElementById('interestRateInput');
        const interestRateDisplay = document.getElementById('interestRateDisplay');

        const loanTenureSlider = document.getElementById('loanTenureSlider');
        const loanTenureInput = document.getElementById('loanTenureInput');
        const loanTenureDisplay = document.getElementById('loanTenureDisplay');

        const calculateBtn = document.getElementById('calculateEMI');
        const refreshBtn = document.getElementById('refreshEMI');

        // Initialize with default values
        if (loanAmountSlider && loanAmountInput && loanAmountDisplay) {
            loanAmountSlider.value = '1000000';
            loanAmountInput.value = '1000000';
            loanAmountDisplay.textContent = '₹10,00,000';
        }

        if (interestRateSlider && interestRateInput && interestRateDisplay) {
            interestRateSlider.value = '8.5';
            interestRateInput.value = '8.5';
            interestRateDisplay.textContent = '8.5%';
        }

        if (loanTenureSlider && loanTenureInput && loanTenureDisplay) {
            loanTenureSlider.value = '20';
            loanTenureInput.value = '20';
            loanTenureDisplay.textContent = '20 Years';
        }

        // Calculate initial EMI
        calculateEMI();

        // Sync sliders with inputs
        if (loanAmountSlider && loanAmountInput) {
            loanAmountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                loanAmountInput.value = value;
                loanAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                calculateEMI();
            });

            loanAmountInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 100000 && value <= 10000000) {
                        loanAmountSlider.value = value;
                        loanAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                        calculateEMI();
                    }
                }
            });
        }

        if (interestRateSlider && interestRateInput) {
            interestRateSlider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                interestRateInput.value = value;
                interestRateDisplay.textContent = `${value}%`;
                calculateEMI();
            });

            interestRateInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (value >= 1 && value <= 20) {
                        interestRateSlider.value = value;
                        interestRateDisplay.textContent = `${value}%`;
                        calculateEMI();
                    }
                }
            });
        }

        if (loanTenureSlider && loanTenureInput) {
            loanTenureSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                loanTenureInput.value = value;
                loanTenureDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                calculateEMI();
            });

            loanTenureInput.addEventListener('input', function() {
                if (this.value) {
                    const value = parseInt(this.value);
                    if (value >= 1 && value <= 40) {
                        loanTenureSlider.value = value;
                        loanTenureDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                        calculateEMI();
                    }
                }
            });
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                calculateEMI();
                showNotification('EMI calculated successfully!', 'success');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                // Reset to default values
                if (loanAmountSlider && loanAmountInput && loanAmountDisplay) {
                    loanAmountSlider.value = '1000000';
                    loanAmountInput.value = '1000000';
                    loanAmountDisplay.textContent = '₹10,00,000';
                }

                if (interestRateSlider && interestRateInput && interestRateDisplay) {
                    interestRateSlider.value = '8.5';
                    interestRateInput.value = '8.5';
                    interestRateDisplay.textContent = '8.5%';
                }

                if (loanTenureSlider && loanTenureInput && loanTenureDisplay) {
                    loanTenureSlider.value = '20';
                    loanTenureInput.value = '20';
                    loanTenureDisplay.textContent = '20 Years';
                }

                calculateEMI();
                showNotification('EMI calculator refreshed!', 'info');
            });
        }

        // Initialize chart
        initChart();
    }

    function calculateEMI() {
        const principal = parseInt(document.getElementById('loanAmountInput')?.value) || 1000000;
        const annualRate = parseFloat(document.getElementById('interestRateInput')?.value) || 8.5;
        const years = parseInt(document.getElementById('loanTenureInput')?.value) || 20;

        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;

        // EMI Calculation using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);

        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - principal;

        // Update display
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

        // Update chart
        updateChart(principal, totalInterest);
    }

    function initChart() {
        const ctx = document.getElementById('emiChart');
        if (!ctx) return;

        emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Interest Amount'],
                datasets: [{
                    data: [1000000, 808224],
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

    function updateChart(principal, interest) {
        if (emiChart) {
            emiChart.data.datasets[0].data = [principal, Math.round(interest)];
            emiChart.update('active');
        }
    }

    // Initialize prepayment calculator
    function initPrepaymentCalculator() {
        const calculateBtn = document.getElementById('calculatePrepayment');
        const refreshBtn = document.getElementById('refreshPrepayment');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                calculatePrepaymentImpact();
                showNotification('Prepayment impact calculated!', 'success');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                document.getElementById('prepaymentAmount').value = '';
                document.getElementById('prepayAfterMonths').value = '';
                document.getElementById('prepaymentResults').style.display = 'none';
                showNotification('Prepayment calculator refreshed!', 'info');
            });
        }
    }

    function calculatePrepaymentImpact() {
        const principal = parseInt(document.getElementById('loanAmountInput')?.value) || 1000000;
        const annualRate = parseFloat(document.getElementById('interestRateInput')?.value) || 8.5;
        const years = parseInt(document.getElementById('loanTenureInput')?.value) || 20;

        const prepaymentAmount = parseInt(document.getElementById('prepaymentAmount')?.value) || 200000;
        const prepayAfterMonths = parseInt(document.getElementById('prepayAfterMonths')?.value) || 12;
        const prepayOption = document.querySelector('input[name="prepayOption"]:checked')?.value || 'tenure';

        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;

        // Calculate original EMI
        const originalEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                           (Math.pow(1 + monthlyRate, totalMonths) - 1);

        // Calculate remaining balance after prepayAfterMonths
        let balance = principal;
        for (let i = 0; i < prepayAfterMonths; i++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = originalEMI - interestPayment;
            balance -= principalPayment;
        }

        // Apply prepayment
        const newBalance = balance - prepaymentAmount;
        const remainingMonths = totalMonths - prepayAfterMonths;

        let newEMI, newTenure;
        let originalTotalInterest = (originalEMI * totalMonths) - principal;
        let newTotalInterest;

        if (prepayOption === 'tenure') {
            // Keep EMI same, reduce tenure
            newEMI = originalEMI;
            newTenure = Math.log(1 + (newBalance * monthlyRate) / originalEMI) / Math.log(1 + monthlyRate);
            newTenure = Math.ceil(newTenure);

            // Calculate interest paid before prepayment
            let interestPaidSoFar = 0;
            let tempBalance = principal;
            for (let i = 0; i < prepayAfterMonths; i++) {
                const interestPayment = tempBalance * monthlyRate;
                interestPaidSoFar += interestPayment;
                const principalPayment = originalEMI - interestPayment;
                tempBalance -= principalPayment;
            }

            newTotalInterest = interestPaidSoFar + (newEMI * newTenure) - principal;
        } else {
            // Keep tenure same, reduce EMI
            newTenure = remainingMonths;
            newEMI = (newBalance * monthlyRate * Math.pow(1 + monthlyRate, newTenure)) / 
                     (Math.pow(1 + monthlyRate, newTenure) - 1);

            // Calculate interest paid before prepayment
            let interestPaidSoFar = 0;
            let tempBalance = principal;
            for (let i = 0; i < prepayAfterMonths; i++) {
                const interestPayment = tempBalance * monthlyRate;
                interestPaidSoFar += interestPayment;
                const principalPayment = originalEMI - interestPayment;
                tempBalance -= principalPayment;
            }

            newTotalInterest = interestPaidSoFar + (newEMI * newTenure) - principal;
        }

        const interestSaved = originalTotalInterest - newTotalInterest;

        // Update UI
        document.getElementById('originalEMI').textContent = `₹${Math.round(originalEMI).toLocaleString('en-IN')}`;
        document.getElementById('originalInterest').textContent = `₹${Math.round(originalTotalInterest).toLocaleString('en-IN')}`;
        document.getElementById('originalTenure').textContent = `${years} Years`;

        document.getElementById('newEMI').textContent = `₹${Math.round(newEMI).toLocaleString('en-IN')}`;
        document.getElementById('newInterest').textContent = `₹${Math.round(newTotalInterest).toLocaleString('en-IN')}`;

        if (prepayOption === 'tenure') {
            const newYears = Math.floor((prepayAfterMonths + newTenure) / 12);
            const newMonths = (prepayAfterMonths + newTenure) % 12;
            document.getElementById('newTenure').textContent = 
                `${newYears} Years${newMonths > 0 ? ` ${newMonths} Months` : ''}`;
            document.getElementById('benefitLabel').textContent = 'Time Saved';
            const savedMonths = totalMonths - (prepayAfterMonths + newTenure);
            const savedYears = Math.floor(savedMonths / 12);
            const savedMonthsRem = savedMonths % 12;
            document.getElementById('benefitValue').textContent = 
                `${savedYears} Years${savedMonthsRem > 0 ? ` ${savedMonthsRem} Months` : ''}`;
        } else {
            document.getElementById('newTenure').textContent = `${years} Years`;
            document.getElementById('benefitLabel').textContent = 'EMI Saved';
            document.getElementById('benefitValue').textContent = `₹${Math.round(originalEMI - newEMI).toLocaleString('en-IN')}`;
        }

        document.getElementById('interestSaved').textContent = `₹${Math.round(interestSaved).toLocaleString('en-IN')}`;

        // Show results
        document.getElementById('prepaymentResults').style.display = 'block';
    }

    // Initialize loan comparison
    function initLoanComparison() {
        const compareBtn = document.getElementById('compareLoans');
        const refreshBtn = document.getElementById('refreshComparison');

        if (compareBtn) {
            compareBtn.addEventListener('click', function() {
                compareLoanOptions();
                showNotification('Loans compared successfully!', 'success');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                // Clear all loan inputs
                document.getElementById('loan1Amount').value = '';
                document.getElementById('loan1Rate').value = '';
                document.getElementById('loan1Tenure').value = '';
                document.getElementById('loan2Amount').value = '';
                document.getElementById('loan2Rate').value = '';
                document.getElementById('loan2Tenure').value = '';
                document.getElementById('loan3Amount').value = '';
                document.getElementById('loan3Rate').value = '';
                document.getElementById('loan3Tenure').value = '';
                document.getElementById('comparisonResults').style.display = 'none';
                showNotification('Loan comparison refreshed!', 'info');
            });
        }
    }

    function compareLoanOptions() {
        const loans = [];

        // Get loan 1 data
        const loan1Amount = parseInt(document.getElementById('loan1Amount')?.value);
        const loan1Rate = parseFloat(document.getElementById('loan1Rate')?.value);
        const loan1Tenure = parseInt(document.getElementById('loan1Tenure')?.value);

        if (loan1Amount && loan1Rate && loan1Tenure) {
            const monthlyRate1 = loan1Rate / 12 / 100;
            const totalMonths1 = loan1Tenure * 12;
            const emi1 = (loan1Amount * monthlyRate1 * Math.pow(1 + monthlyRate1, totalMonths1)) / 
                        (Math.pow(1 + monthlyRate1, totalMonths1) - 1);
            const totalInterest1 = (emi1 * totalMonths1) - loan1Amount;

            loans.push({
                name: 'Loan Option 1',
                amount: loan1Amount,
                rate: loan1Rate,
                tenure: loan1Tenure,
                emi: emi1,
                totalInterest: totalInterest1,
                totalRepayment: emi1 * totalMonths1
            });
        }

        // Get loan 2 data
        const loan2Amount = parseInt(document.getElementById('loan2Amount')?.value);
        const loan2Rate = parseFloat(document.getElementById('loan2Rate')?.value);
        const loan2Tenure = parseInt(document.getElementById('loan2Tenure')?.value);

        if (loan2Amount && loan2Rate && loan2Tenure) {
            const monthlyRate2 = loan2Rate / 12 / 100;
            const totalMonths2 = loan2Tenure * 12;
            const emi2 = (loan2Amount * monthlyRate2 * Math.pow(1 + monthlyRate2, totalMonths2)) / 
                        (Math.pow(1 + monthlyRate2, totalMonths2) - 1);
            const totalInterest2 = (emi2 * totalMonths2) - loan2Amount;

            loans.push({
                name: 'Loan Option 2',
                amount: loan2Amount,
                rate: loan2Rate,
                tenure: loan2Tenure,
                emi: emi2,
                totalInterest: totalInterest2,
                totalRepayment: emi2 * totalMonths2
            });
        }

        // Get loan 3 data
        const loan3Amount = parseInt(document.getElementById('loan3Amount')?.value);
        const loan3Rate = parseFloat(document.getElementById('loan3Rate')?.value);
        const loan3Tenure = parseInt(document.getElementById('loan3Tenure')?.value);

        if (loan3Amount && loan3Rate && loan3Tenure) {
            const monthlyRate3 = loan3Rate / 12 / 100;
            const totalMonths3 = loan3Tenure * 12;
            const emi3 = (loan3Amount * monthlyRate3 * Math.pow(1 + monthlyRate3, totalMonths3)) / 
                        (Math.pow(1 + monthlyRate3, totalMonths3) - 1);
            const totalInterest3 = (emi3 * totalMonths3) - loan3Amount;

            loans.push({
                name: 'Loan Option 3',
                amount: loan3Amount,
                rate: loan3Rate,
                tenure: loan3Tenure,
                emi: emi3,
                totalInterest: totalInterest3,
                totalRepayment: emi3 * totalMonths3
            });
        }

        if (loans.length === 0) {
            showNotification('Please enter at least one loan option', 'error');
            return;
        }

        // Find best loan (lowest total repayment)
        const bestLoan = loans.reduce((best, current) => 
            current.totalRepayment < best.totalRepayment ? current : best
        );

        // Update comparison table
        const tableBody = document.getElementById('comparisonTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';

            loans.forEach(loan => {
                const row = document.createElement('tr');
                if (loan === bestLoan) {
                    row.classList.add('best-loan');
                }

                row.innerHTML = `
                    <td>${loan.name}${loan === bestLoan ? ' <span class="best-loan-indicator">⭐ Best</span>' : ''}</td>
                    <td>₹${Math.round(loan.emi).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(loan.totalInterest).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(loan.totalRepayment).toLocaleString('en-IN')}</td>
                `;

                tableBody.appendChild(row);
            });
        }

        // Show results
        document.getElementById('comparisonResults').style.display = 'block';
    }

    // Tool functionality
    function initTools() {
        // Eligibility checker
        const checkEligibilityBtn = document.getElementById('checkEligibility');
        if (checkEligibilityBtn) {
            checkEligibilityBtn.addEventListener('click', function() {
                const monthlyIncome = parseInt(document.getElementById('monthlyIncome')?.value) || 50000;
                const age = parseInt(document.getElementById('applicantAge')?.value) || 30;
                const currentEMIs = parseInt(document.getElementById('currentEMIs')?.value) || 0;

                const foirRatio = (currentEMIs / monthlyIncome) * 100;
                const maxFOIR = 50; // 50% FOIR limit
                const availableIncome = monthlyIncome * (maxFOIR / 100) - currentEMIs;

                // Assuming 8.5% interest rate and 20 years tenure
                const monthlyRate = 8.5 / 12 / 100;
                const totalMonths = 20 * 12;
                const eligibleAmount = (availableIncome * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / 
                                    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));

                document.getElementById('eligibleAmount').textContent = `₹${Math.round(eligibleAmount).toLocaleString('en-IN')}`;
                document.getElementById('foirRatio').textContent = `${Math.round(foirRatio)}%`;
                document.getElementById('eligibilityResult').style.display = 'block';

                showNotification('Eligibility calculated successfully!', 'success');
            });
        }

        // Reverse EMI calculator
        const calculateReverseLoanBtn = document.getElementById('calculateReverseLoan');
        if (calculateReverseLoanBtn) {
            calculateReverseLoanBtn.addEventListener('click', function() {
                const desiredEMI = parseInt(document.getElementById('desiredEMI')?.value) || 50000;
                const interestRate = parseFloat(document.getElementById('reverseInterestRate')?.value) || 8.5;
                const tenure = parseInt(document.getElementById('reverseTenure')?.value) || 20;

                const monthlyRate = interestRate / 12 / 100;
                const totalMonths = tenure * 12;

                const maxLoanAmount = (desiredEMI * (Math.pow(1 + monthlyRate, totalMonths) - 1)) / 
                                    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
                const totalInterest = (desiredEMI * totalMonths) - maxLoanAmount;

                document.getElementById('maxLoanAmount').textContent = `₹${Math.round(maxLoanAmount).toLocaleString('en-IN')}`;
                document.getElementById('reverseTotalInterest').textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
                document.getElementById('reverseLoanResult').style.display = 'block';

                showNotification('Reverse EMI calculated successfully!', 'success');
            });
        }

        // GST Impact calculator
        const calculateGSTImpactBtn = document.getElementById('calculateGSTImpact');
        if (calculateGSTImpactBtn) {
            calculateGSTImpactBtn.addEventListener('click', function() {
                const loanAmount = parseInt(document.getElementById('gstLoanAmount')?.value) || 1000000;
                const processingFeePercent = parseFloat(document.getElementById('processingFee')?.value) || 1;
                const gstRate = parseFloat(document.getElementById('gstRate')?.value) || 18;

                const processingFeeAmount = (loanAmount * processingFeePercent) / 100;
                const gstAmount = (processingFeeAmount * gstRate) / 100;
                const totalUpfrontCost = processingFeeAmount + gstAmount;

                document.getElementById('processingFeeAmount').textContent = `₹${Math.round(processingFeeAmount).toLocaleString('en-IN')}`;
                document.getElementById('gstAmount').textContent = `₹${Math.round(gstAmount).toLocaleString('en-IN')}`;
                document.getElementById('totalUpfrontCost').textContent = `₹${Math.round(totalUpfrontCost).toLocaleString('en-IN')}`;
                document.getElementById('gstImpactResult').style.display = 'block';

                showNotification('GST impact calculated successfully!', 'success');
            });
        }

        // SIP vs EMI comparison
        const compareSIPEMIBtn = document.getElementById('compareSIPEMI');
        if (compareSIPEMIBtn) {
            compareSIPEMIBtn.addEventListener('click', function() {
                const monthlyAmount = parseInt(document.getElementById('monthlyAmount')?.value) || 50000;
                const sipReturns = parseFloat(document.getElementById('sipReturns')?.value) || 12;
                const loanRate = parseFloat(document.getElementById('loanRate')?.value) || 8.5;
                const timePeriod = parseInt(document.getElementById('timePeriod')?.value) || 20;

                // SIP calculation
                const sipMonthlyRate = sipReturns / 12 / 100;
                const sipMonths = timePeriod * 12;
                const sipInvested = monthlyAmount * sipMonths;
                const sipMaturity = monthlyAmount * ((Math.pow(1 + sipMonthlyRate, sipMonths) - 1) / sipMonthlyRate);
                const sipWealth = sipMaturity - sipInvested;

                // EMI calculation
                const totalEMIPaid = monthlyAmount * sipMonths;

                // Assuming loan amount that gives this EMI
                const loanMonthlyRate = loanRate / 12 / 100;
                const principalPaid = (monthlyAmount * (Math.pow(1 + loanMonthlyRate, sipMonths) - 1)) / 
                                   (loanMonthlyRate * Math.pow(1 + loanMonthlyRate, sipMonths));
                const interestPaid = totalEMIPaid - principalPaid;

                document.getElementById('sipInvested').textContent = `₹${Math.round(sipInvested).toLocaleString('en-IN')}`;
                document.getElementById('sipMaturity').textContent = `₹${Math.round(sipMaturity).toLocaleString('en-IN')}`;
                document.getElementById('sipWealth').textContent = `₹${Math.round(sipWealth).toLocaleString('en-IN')}`;
                document.getElementById('totalEMIPaid').textContent = `₹${Math.round(totalEMIPaid).toLocaleString('en-IN')}`;
                document.getElementById('principalPaid').textContent = `₹${Math.round(principalPaid).toLocaleString('en-IN')}`;
                document.getElementById('interestPaid').textContent = `₹${Math.round(interestPaid).toLocaleString('en-IN')}`;

                const wealthDifference = sipWealth;
                document.getElementById('comparisonVerdict').textContent = 
                    `SIP investment creates ₹${Math.round(wealthDifference).toLocaleString('en-IN')} more wealth than loan payment`;

                document.getElementById('sipEmiResult').style.display = 'block';

                showNotification('SIP vs EMI comparison completed!', 'success');
            });
        }

        // Tool headers click handlers
        document.querySelectorAll('.tool-header').forEach(header => {
            header.addEventListener('click', function() {
                const toolName = this.getAttribute('data-tool');
                const content = document.getElementById(`${toolName}-content`);
                const expandIcon = this.querySelector('.expand-icon');

                if (content) {
                    const isExpanded = content.classList.contains('expanded');

                    if (isExpanded) {
                        content.classList.remove('expanded');
                        this.classList.remove('expanded');
                        content.style.maxHeight = '0';
                    } else {
                        content.classList.add('expanded');
                        this.classList.add('expanded');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        });
    }

    // Smart features functionality
    function initSmartFeatures() {
        // Save loan plan
        const saveLoanPlanBtn = document.getElementById('saveLoanPlan');
        if (saveLoanPlanBtn) {
            saveLoanPlanBtn.addEventListener('click', function() {
                const loanData = {
                    amount: document.getElementById('loanAmountInput')?.value || '1000000',
                    rate: document.getElementById('interestRateInput')?.value || '8.5',
                    tenure: document.getElementById('loanTenureInput')?.value || '20',
                    emi: document.getElementById('monthlyEMI')?.textContent || '₹0',
                    totalInterest: document.getElementById('totalInterest')?.textContent || '₹0',
                    totalAmount: document.getElementById('totalAmount')?.textContent || '₹0',
                    savedDate: new Date().toISOString(),
                    planName: `Loan Plan ${Date.now()}`
                };

                let savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
                savedPlans.push(loanData);
                localStorage.setItem('savedLoanPlans', JSON.stringify(savedPlans));

                updateSavedPlansList();
                showNotification('Loan plan saved successfully!', 'success');
            });
        }

        // Share loan plan
        const shareLoanPlanBtn = document.getElementById('shareLoanPlan');
        if (shareLoanPlanBtn) {
            shareLoanPlanBtn.addEventListener('click', function() {
                const loanData = {
                    amount: document.getElementById('loanAmountInput')?.value || '1000000',
                    rate: document.getElementById('interestRateInput')?.value || '8.5',
                    tenure: document.getElementById('loanTenureInput')?.value || '20',
                    emi: document.getElementById('monthlyEMI')?.textContent || '₹0',
                    totalInterest: document.getElementById('totalInterest')?.textContent || '₹0',
                    totalAmount: document.getElementById('totalAmount')?.textContent || '₹0'
                };

                const shareText = `
EMI Calculator Results:
Loan Amount: ₹${parseInt(loanData.amount).toLocaleString('en-IN')}
Interest Rate: ${loanData.rate}%
Tenure: ${loanData.tenure} years
Monthly EMI: ${loanData.emi}
Total Interest: ${loanData.totalInterest}
Total Amount: ${loanData.totalAmount}

Calculated using PRATIX FINANCE - https://pratix-finance.vercel.app
                `.trim();

                const shareableLink = `${window.location.origin}${window.location.pathname}?amount=${loanData.amount}&rate=${loanData.rate}&tenure=${loanData.tenure}`;

                document.getElementById('shareableLink').value = shareableLink;
                document.getElementById('shareText').value = shareText;
                document.getElementById('shareModal').style.display = 'flex';
            });
        }

        // Close share modal
        const closeShareModalBtn = document.getElementById('closeShareModal');
        if (closeShareModalBtn) {
            closeShareModalBtn.addEventListener('click', function() {
                document.getElementById('shareModal').style.display = 'none';
            });
        }

        // Copy link
        const copyLinkBtn = document.getElementById('copyLink');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                const linkInput = document.getElementById('shareableLink');
                linkInput.select();
                document.execCommand('copy');
                this.textContent = 'Copied!';
                this.classList.add('copied');
                setTimeout(() => {
                    this.textContent = 'Copy';
                    this.classList.remove('copied');
                }, 2000);
            });
        }

        // Copy text
        const copyTextBtn = document.getElementById('copyText');
        if (copyTextBtn) {
            copyTextBtn.addEventListener('click', function() {
                const textArea = document.getElementById('shareText');
                textArea.select();
                document.execCommand('copy');
                this.textContent = 'Copied!';
                this.classList.add('copied');
                setTimeout(() => {
                    this.textContent = 'Copy Text';
                    this.classList.remove('copied');
                }, 2000);
            });
        }        // Download PDF
        const downloadPDFBtn = document.getElementById('downloadPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', function() {
                showNotification('PDF download feature coming soon!', 'info');
            });
        }

        // Load saved plans
        updateSavedPlansList();
    }

    function updateSavedPlansList() {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const container = document.getElementById('savedPlansContainer');

        if (!container) return;

        if (savedPlans.length === 0) {
            container.innerHTML = '<div class="no-plans-message"><p>No saved loan plans yet. Calculate an EMI and save your first plan!</p></div>';
            return;
        }

        container.innerHTML = savedPlans.map((plan, index) => `
            <div class="saved-plan-item">
                <div class="saved-plan-header">
                    <div class="saved-plan-name">${plan.planName}</div>
                    <div class="saved-plan-date">${new Date(plan.savedDate).toLocaleDateString()}</div>
                </div>
                <div class="saved-plan-summary">
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">Loan Amount</div>
                        <div class="plan-summary-value">₹${parseInt(plan.amount).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">EMI</div>
                        <div class="plan-summary-value">${plan.emi}</div>
                    </div>
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">Total Interest</div>
                        <div class="plan-summary-value">${plan.totalInterest}</div>
                    </div>
                </div>
                <div class="saved-plan-actions">
                    <button class="plan-action-btn load" onclick="loadSavedPlan(${index})">Load</button>
                    <button class="plan-action-btn delete" onclick="deleteSavedPlan(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Global functions for saved plans
    window.loadSavedPlan = function(index) {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const plan = savedPlans[index];

        if (plan) {
            document.getElementById('loanAmountSlider').value = plan.amount;
            document.getElementById('loanAmountInput').value = plan.amount;
            document.getElementById('loanAmountDisplay').textContent = `₹${parseInt(plan.amount).toLocaleString('en-IN')}`;

            document.getElementById('interestRateSlider').value = plan.rate;
            document.getElementById('interestRateInput').value = plan.rate;
            document.getElementById('interestRateDisplay').textContent = `${plan.rate}%`;

            document.getElementById('loanTenureSlider').value = plan.tenure;
            document.getElementById('loanTenureInput').value = plan.tenure;
            document.getElementById('loanTenureDisplay').textContent = `${plan.tenure} Years`;

            calculateEMI();
            showNotification('Loan plan loaded successfully!', 'success');
        }
    };

    window.deleteSavedPlan = function(index) {
        if (confirm('Are you sure you want to delete this loan plan?')) {
            let savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
            savedPlans.splice(index, 1);
            localStorage.setItem('savedLoanPlans', JSON.stringify(savedPlans));
            updateSavedPlansList();
            showNotification('Loan plan deleted successfully!', 'success');
        }
    };

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00d4ff)' : 
                        type === 'error' ? 'linear-gradient(135deg, #ff4757, #ff6b7a)' : 
                        'linear-gradient(135deg, #667eea, #764ba2)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(20px);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS for notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);

    // Navigation functions
    window.goToGST = function() {
        window.location.href = 'gst-calculator.html';
    };

    window.goToSIP = function() {
        window.location.href = 'sip-calculator.html';
    };

    window.goToEMI = function() {
        window.location.href = 'emi-calculator.html';
    };

    window.goToTax = function() {
        window.location.href = 'tax-calculator.html';
    };

    window.goToFD = function() {
        window.location.href = 'fd-calculator.html';
    };

    window.goToHome = function() {
        window.location.href = 'index.html';
    };

    window.goBack = function() {
        window.history.back();
    };

    // Initialize all components
    if (document.getElementById('emi-calculator')) {
        initEMICalculator();
        initPrepaymentCalculator();
        initLoanComparison();
        initTools();
        initSmartFeatures();
    }

    // Check for URL parameters and load plan
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('amount') && urlParams.has('rate') && urlParams.has('tenure')) {
        const amount = urlParams.get('amount');
        const rate = urlParams.get('rate');
        const tenure = urlParams.get('tenure');

        if (document.getElementById('loanAmountInput')) {
            document.getElementById('loanAmountSlider').value = amount;
            document.getElementById('loanAmountInput').value = amount;
            document.getElementById('loanAmountDisplay').textContent = `₹${parseInt(amount).toLocaleString('en-IN')}`;

            document.getElementById('interestRateSlider').value = rate;
            document.getElementById('interestRateInput').value = rate;
            document.getElementById('interestRateDisplay').textContent = `${rate}%`;

            document.getElementById('loanTenureSlider').value = tenure;
            document.getElementById('loanTenureInput').value = tenure;
            document.getElementById('loanTenureDisplay').textContent = `${tenure} Years`;

            calculateEMI();
            showNotification('Loan plan loaded from shared link!', 'success');
        }
    }
});