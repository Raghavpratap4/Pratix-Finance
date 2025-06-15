// GST Calculator JavaScript
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

    window.goToTax = function() {
        window.location.href = 'tax-calculator.html';
    }

    function goToFD() {
        window.location.href = '/fd-calculator.html';
    }

    // GST Calculator functionality
    let gstChart = null;
    let gstAnalysisChart = null;

    function initGSTCalculator() {
        // GST rate buttons
        const gstRateButtons = document.querySelectorAll('.gst-rate-btn');
        const gstRateInput = document.getElementById('gstRate');

        gstRateButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                gstRateButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const rate = this.getAttribute('data-rate');
                gstRateInput.value = rate;
                if (validateGSTInputs()) {
                    calculateGST();
                }
            });
        });

        // Input listeners
        const originalAmountInput = document.getElementById('originalAmount');
        const calculationTypeRadios = document.querySelectorAll('input[name="calculationType"]');

        if (originalAmountInput) {
            originalAmountInput.addEventListener('input', function() {
                if (validateGSTInputs()) {
                    calculateGST();
                }
            });
        }

        if (gstRateInput) {
            gstRateInput.addEventListener('input', function() {
                // Update active button
                gstRateButtons.forEach(btn => btn.classList.remove('active'));
                const matchingBtn = document.querySelector(`[data-rate="${this.value}"]`);
                if (matchingBtn) {
                    matchingBtn.classList.add('active');
                }
                if (validateGSTInputs()) {
                    calculateGST();
                }
            });
        }

        calculationTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (validateGSTInputs()) {
                    calculateGST();
                }
            });
        });

        // Calculate button
        const calculateBtn = document.getElementById('calculateGST');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                if (!validateGSTInputs()) {
                    return;
                }

                this.classList.add('loading');
                this.querySelector('.btn-text').textContent = 'Calculating...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.querySelector('.btn-text').textContent = 'Calculate GST';
                    calculateGST();
                    showNotification('GST calculated successfully!', 'success');
                }, 800);
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshGST');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetGSTCalculator();
                showNotification('GST calculator refreshed!', 'info');
            });
        }

        // Initialize chart
        initGSTChart();

        // Initialize with empty state
        resetGSTCalculator();
    }

    function validateGSTInputs() {
        const originalAmount = document.getElementById('originalAmount')?.value;
        const gstRate = document.getElementById('gstRate')?.value;

        if (!originalAmount || originalAmount <= 0) {
            return false;
        }

        if (!gstRate || gstRate < 0) {
            return false;
        }

        return true;
    }

    function resetGSTCalculator() {
        // Clear inputs
        if (document.getElementById('originalAmount')) document.getElementById('originalAmount').value = '';
        if (document.getElementById('gstRate')) document.getElementById('gstRate').value = '18';

        // Reset radio buttons
        if (document.getElementById('exclusive')) document.getElementById('exclusive').checked = true;

        // Reset GST rate buttons
        document.querySelectorAll('.gst-rate-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-rate="18"]')?.classList.add('active');

        // Clear results
        if (document.getElementById('baseAmount')) document.getElementById('baseAmount').textContent = '₹0';
        if (document.getElementById('cgstAmount')) document.getElementById('cgstAmount').textContent = '₹0';
        if (document.getElementById('sgstAmount')) document.getElementById('sgstAmount').textContent = '₹0';
        if (document.getElementById('totalGST')) document.getElementById('totalGST').textContent = '₹0';
        if (document.getElementById('finalAmount')) document.getElementById('finalAmount').textContent = '₹0';

        // Reset chart
        if (gstChart) {
            gstChart.data.datasets[0].data = [0, 0, 0];
            gstChart.update();
        }
    }

    function calculateGST() {
        const originalAmount = parseFloat(document.getElementById('originalAmount')?.value) || 0;
        const gstRate = parseFloat(document.getElementById('gstRate')?.value) || 18;
        const calculationType = document.querySelector('input[name="calculationType"]:checked')?.value || 'exclusive';

        if (originalAmount <= 0) {
            resetResultsToZero();
            return;
        }

        let baseAmount, gstAmount, finalAmount;

        if (calculationType === 'exclusive') {
            // Add GST to the amount
            baseAmount = originalAmount;
            gstAmount = (baseAmount * gstRate) / 100;
            finalAmount = baseAmount + gstAmount;
        } else {
            // Remove GST from the amount
            finalAmount = originalAmount;
            baseAmount = finalAmount / (1 + (gstRate / 100));
            gstAmount = finalAmount - baseAmount;
        }

        const cgstAmount = gstAmount / 2;
        const sgstAmount = gstAmount / 2;

        // Update results
        if (document.getElementById('baseAmount')) {
            document.getElementById('baseAmount').textContent = `₹${Math.round(baseAmount).toLocaleString('en-IN')}`;
        }
        if (document.getElementById('cgstAmount')) {
            document.getElementById('cgstAmount').textContent = `₹${Math.round(cgstAmount).toLocaleString('en-IN')}`;
        }
        if (document.getElementById('sgstAmount')) {
            document.getElementById('sgstAmount').textContent = `₹${Math.round(sgstAmount).toLocaleString('en-IN')}`;
        }
        if (document.getElementById('totalGST')) {
            document.getElementById('totalGST').textContent = `₹${Math.round(gstAmount).toLocaleString('en-IN')}`;
        }
        if (document.getElementById('finalAmount')) {
            document.getElementById('finalAmount').textContent = `₹${Math.round(finalAmount).toLocaleString('en-IN')}`;
        }

        // Update chart
        updateGSTChart(baseAmount, cgstAmount, sgstAmount);
    }

    function resetResultsToZero() {
        if (document.getElementById('baseAmount')) document.getElementById('baseAmount').textContent = '₹0';
        if (document.getElementById('cgstAmount')) document.getElementById('cgstAmount').textContent = '₹0';
        if (document.getElementById('sgstAmount')) document.getElementById('sgstAmount').textContent = '₹0';
        if (document.getElementById('totalGST')) document.getElementById('totalGST').textContent = '₹0';
        if (document.getElementById('finalAmount')) document.getElementById('finalAmount').textContent = '₹0';

        if (gstChart) {
            gstChart.data.datasets[0].data = [0, 0, 0];
            gstChart.update();
        }
    }

    function initGSTChart() {
        const ctx = document.getElementById('gstChart');
        if (!ctx) return;

        gstChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Base Amount', 'CGST', 'SGST'],
                datasets: [{
                    data: [10000, 900, 900],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(102, 126, 234, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 212, 255, 1)',
                        'rgba(240, 147, 251, 1)',
                        'rgba(102, 126, 234, 1)'
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

    function updateGSTChart(baseAmount, cgstAmount, sgstAmount) {
        if (gstChart) {
            gstChart.data.datasets[0].data = [Math.round(baseAmount), Math.round(cgstAmount), Math.round(sgstAmount)];
            gstChart.update('active');
        }
    }

    // Invoice Generator functionality
    function initInvoiceGenerator() {
        const addItemBtn = document.getElementById('addInvoiceItem');
        const generateBtn = document.getElementById('generateInvoice');
        const refreshBtn = document.getElementById('refreshInvoice');

        if (addItemBtn) {
            addItemBtn.addEventListener('click', addInvoiceItem);
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', generateInvoice);
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetInvoiceGenerator();
                showNotification('Invoice generator refreshed!', 'info');
            });
        }

        // Set default invoice date
        document.getElementById('invoiceDate').textContent = new Date().toLocaleDateString();
    }

    function addInvoiceItem() {
        const itemsContainer = document.getElementById('invoiceItems');
        const newItem = document.createElement('div');
        newItem.className = 'invoice-item';
        newItem.innerHTML = `
            <div class="item-inputs">
                <input type="text" placeholder="Item Description" class="item-desc calc-input">
                <input type="number" placeholder="Quantity" class="item-qty calc-input">
                <input type="number" placeholder="Rate" class="item-rate calc-input">
                <select class="item-gst calc-input">
                    <option value="0">0% GST</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18" selected>18% GST</option>
                    <option value="28">28% GST</option>
                </select>
                <button class="remove-item-btn" onclick="removeInvoiceItem(this)">×</button>
            </div>
        `;
        itemsContainer.appendChild(newItem);
    }

    window.removeInvoiceItem = function(button) {
        const item = button.closest('.invoice-item');
        const itemsContainer = document.getElementById('invoiceItems');
        if (itemsContainer.children.length > 1) {
            item.remove();
        } else {
            showNotification('At least one item is required', 'warning');
        }
    };

    function generateInvoice() {
        const businessName = document.getElementById('businessName').value || 'Your Business Name';
        const gstin = document.getElementById('gstin').value || 'GSTIN Number';
        const address = document.getElementById('businessAddress').value || 'Business Address';

        // Update business info in preview
        document.getElementById('displayBusinessName').textContent = businessName;
        document.getElementById('displayGSTIN').textContent = gstin;
        document.getElementById('displayAddress').textContent = address;

        const items = document.querySelectorAll('.invoice-item');
        const tableBody = document.getElementById('invoiceTableBody');
        tableBody.innerHTML = '';

        let subtotal = 0;
        let totalGST = 0;

        items.forEach(item => {
            const desc = item.querySelector('.item-desc').value || 'Item';
            const qty = parseFloat(item.querySelector('.item-qty').value) || 1;
            const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
            const gstRate = parseFloat(item.querySelector('.item-gst').value) || 18;

            const amount = qty * rate;
            const gstAmount = (amount * gstRate) / 100;
            const total = amount + gstAmount;

            subtotal += amount;
            totalGST += gstAmount;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${desc}</td>
                <td>${qty}</td>
                <td>₹${rate.toLocaleString('en-IN')}</td>
                <td>₹${amount.toLocaleString('en-IN')}</td>
                <td>${gstRate}%</td>
                <td>₹${gstAmount.toLocaleString('en-IN')}</td>
                <td>₹${total.toLocaleString('en-IN')}</td>
            `;
            tableBody.appendChild(row);
        });

        const grandTotal = subtotal + totalGST;

        document.getElementById('invoiceSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        document.getElementById('invoiceTotalGST').textContent = `₹${totalGST.toLocaleString('en-IN')}`;
        document.getElementById('invoiceGrandTotal').textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

        document.getElementById('invoicePreview').style.display = 'block';
        showNotification('Invoice generated successfully!', 'success');
    }

    function resetInvoiceGenerator() {
        document.getElementById('businessName').value = '';
        document.getElementById('gstin').value = '';
        document.getElementById('businessAddress').value = '';

        const itemsContainer = document.getElementById('invoiceItems');
        itemsContainer.innerHTML = `
            <div class="invoice-item">
                <div class="item-inputs">
                    <input type="text" placeholder="Item Description" class="item-desc calc-input">
                    <input type="number" placeholder="Quantity" class="item-qty calc-input">
                    <input type="number" placeholder="Rate" class="item-rate calc-input">
                    <select class="item-gst calc-input">
                        <option value="0">0% GST</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18" selected>18% GST</option>
                        <option value="28">28% GST</option>
                    </select>
                    <button class="remove-item-btn" onclick="removeInvoiceItem(this)">×</button>
                </div>
            </div>
        `;

        document.getElementById('invoicePreview').style.display = 'none';
    }

    // HSN Code Lookup functionality
    function initHSNLookup() {
        const searchBtn = document.getElementById('searchHSN');
        const hsnCards = document.querySelectorAll('.hsn-card');

        if (searchBtn) {
            searchBtn.addEventListener('click', searchHSNCode);
        }

        hsnCards.forEach(card => {
            card.addEventListener('click', function() {
                const hsnCode = this.getAttribute('data-hsn');
                const gstRate = this.getAttribute('data-rate');

                // Copy HSN details for use
                showNotification(`HSN Code: ${hsnCode}, GST Rate: ${gstRate}% copied!`, 'success');

                // Optional: Switch to main calculator with this rate
                switchTab('gst-calculator');
                setTimeout(() => {
                    document.getElementById('gstRate').value = gstRate;
                    document.querySelectorAll('.gst-rate-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelector(`[data-rate="${gstRate}"]`)?.classList.add('active');
                }, 100);
            });
        });
    }

    function searchHSNCode() {
        const searchTerm = document.getElementById('hsnSearch').value.toLowerCase();
        const hsnCards = document.querySelectorAll('.hsn-card');

        hsnCards.forEach(card => {
            const hsnCode = card.querySelector('.hsn-code').textContent.toLowerCase();
            const hsnDesc = card.querySelector('.hsn-desc').textContent.toLowerCase();

            if (hsnCode.includes(searchTerm) || hsnDesc.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.borderColor = '#00ff88';
            } else {
                card.style.display = searchTerm ? 'none' : 'block';
                card.style.borderColor = '';
            }
        });

        if (searchTerm) {
            showNotification('Search completed!', 'info');
        }
    }

    // GST Analysis functionality
    function initGSTAnalysis() {
        const analyzeBtn = document.getElementById('analyzeGST');
        const refreshBtn = document.getElementById('refreshAnalysis');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', function() {
                this.classList.add('loading');
                this.textContent = 'Analyzing...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = 'Analyze GST Impact';
                    analyzeGSTImpact();
                    showNotification('GST analysis completed!', 'success');
                }, 1200);
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetGSTAnalysis();
                showNotification('GST analysis refreshed!', 'info');
            });
        }
    }

    function analyzeGSTImpact() {
        const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 500000;
        const avgGSTRate = parseFloat(document.getElementById('avgGSTRate').value) || 18;
        const businessType = document.getElementById('businessType').value || 'regular';

        const monthlyGST = (monthlySales * avgGSTRate) / 100;
        const annualGST = monthlyGST * 12;

        document.getElementById('monthlyGSTLiability').textContent = `₹${monthlyGST.toLocaleString('en-IN')}`;
        document.getElementById('annualGSTLiability').textContent = `₹${annualGST.toLocaleString('en-IN')}`;
        document.getElementById('effectiveTaxRate').textContent = `${avgGSTRate}%`;
        document.getElementById('complianceStatus').textContent = businessType === 'composition' ? 'Composition Scheme' : 'Regular Filing';

        document.getElementById('analysisResults').style.display = 'block';

        // Update analysis chart
        updateGSTAnalysisChart(monthlySales, monthlyGST);
    }

    function updateGSTAnalysisChart(sales, gst) {
        const ctx = document.getElementById('gstAnalysisChart');
        if (!ctx) return;

        if (gstAnalysisChart) {
            gstAnalysisChart.destroy();
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesData = Array(12).fill(sales);
        const gstData = Array(12).fill(gst);

        gstAnalysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Sales',
                        data: salesData,
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'GST',
                        data: gstData,
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

    function resetGSTAnalysis() {
        document.getElementById('monthlySales').value = '';
        document.getElementById('avgGSTRate').value = '';
        document.getElementById('businessType').value = 'regular';
        document.getElementById('analysisResults').style.display = 'none';
    }

    // GST Returns functionality
    function initGSTReturns() {
        const calculateBtn = document.getElementById('calculateReturns');
        const refreshBtn = document.getElementById('refreshReturns');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                this.classList.add('loading');
                this.textContent = 'Calculating...';

                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = 'Calculate GST Returns';
                    calculateGSTReturns();
                    showNotification('GST returns calculated!', 'success');
                }, 1000);
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetGSTReturns();
                showNotification('GST returns refreshed!', 'info');
            });
        }
    }

    function calculateGSTReturns() {
        const totalSales = parseFloat(document.getElementById('totalSalesGST').value) || 590000;
        const totalPurchases = parseFloat(document.getElementById('totalPurchasesGST').value) || 236000;
        const previousBalance = parseFloat(document.getElementById('previousBalance').value) || 0;

        // Assuming 18% average GST rate for calculation
        const outputGST = totalSales * 18 / 118; // GST on sales
        const inputGST = totalPurchases * 18 / 118; // GST on purchases
        const netGST = outputGST - inputGST + previousBalance;
        const interest = 0; // Calculate based on late filing
        const totalPayable = Math.max(0, netGST + interest);

        document.getElementById('outputGST').textContent = `₹${Math.round(outputGST).toLocaleString('en-IN')}`;
        document.getElementById('inputGST').textContent = `₹${Math.round(inputGST).toLocaleString('en-IN')}`;
        document.getElementById('netGSTLiability').textContent = `₹${Math.round(netGST).toLocaleString('en-IN')}`;
        document.getElementById('interestAmount').textContent = `₹${Math.round(interest).toLocaleString('en-IN')}`;
        document.getElementById('totalPayable').textContent = `₹${Math.round(totalPayable).toLocaleString('en-IN')}`;

        document.getElementById('returnsResults').style.display = 'block';
    }

    function resetGSTReturns() {
        document.getElementById('returnPeriod').value = 'monthly';
        document.getElementById('totalSalesGST').value = '';
        document.getElementById('totalPurchasesGST').value = '';
        document.getElementById('previousBalance').value = '';
        document.getElementById('returnsResults').style.display = 'none';
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
        } else if (type === 'warning') {
            notification.style.borderColor = '#ffb800';
            notification.style.boxShadow = '0 8px 32px rgba(255, 184, 0, 0.2)';
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
    initGSTCalculator();
    initInvoiceGenerator();
    initHSNLookup();
    initGSTAnalysis();
    initGSTReturns();

    console.log('GST Calculator initialized successfully!');
    showNotification('Welcome to GST Calculator!', 'info');
});