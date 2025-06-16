
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
    window.goToEMI = function() {
        window.location.href = 'emi-calculator.html';
    };

    window.goToSIP = function() {
        window.location.href = 'sip-calculator.html';
    };

    window.goToTax = function() {
        window.location.href = 'tax-calculator.html';
    }

    window.goToFD = function() {
        window.location.href = 'fd-calculator.html';
    }

    // Chart variables
    let gstChart = null;
    let analysisChart = null;
    let returnsChart = null;

    // GST Calculator functionality
    function initGSTCalculator() {
        const calculateBtn = document.getElementById('calculateGST');
        const refreshBtn = document.getElementById('refreshGST');
        const chartSelector = document.getElementById('chartTypeSelector');
        const downloadBtn = document.getElementById('downloadGSTPDF');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                if (!validateGSTInputs()) {
                    showNotification('Please fill all required fields!', 'warning');
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

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetGSTCalculator();
                showNotification('Calculator refreshed!', 'info');
            });
        }

        if (chartSelector) {
            chartSelector.addEventListener('change', function() {
                if (gstChart) {
                    updateGSTChart();
                }
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadGSTPDF);
        }

        resetGSTCalculator();
    }

    function validateGSTInputs() {
        const originalAmount = document.getElementById('originalAmount')?.value;
        const gstRate = document.getElementById('gstRate')?.value;
        const calculationType = document.getElementById('calculationType')?.value;

        return originalAmount && originalAmount > 0 && gstRate !== '' && calculationType;
    }

    function resetGSTCalculator() {
        document.getElementById('originalAmount').value = '';
        document.getElementById('gstRate').value = '';
        document.getElementById('calculationType').value = '';
        document.getElementById('gstResults').style.display = 'none';
        document.getElementById('chartContainer').style.display = 'none';
        
        if (gstChart) {
            gstChart.destroy();
            gstChart = null;
        }
    }

    function calculateGST() {
        const originalAmount = parseFloat(document.getElementById('originalAmount').value) || 0;
        const gstRate = parseFloat(document.getElementById('gstRate').value) || 0;
        const calculationType = document.getElementById('calculationType').value;

        let baseAmount, gstAmount, finalAmount;

        if (calculationType === 'exclusive') {
            baseAmount = originalAmount;
            gstAmount = (baseAmount * gstRate) / 100;
            finalAmount = baseAmount + gstAmount;
        } else {
            finalAmount = originalAmount;
            baseAmount = finalAmount / (1 + (gstRate / 100));
            gstAmount = finalAmount - baseAmount;
        }

        const cgstAmount = gstAmount / 2;
        const sgstAmount = gstAmount / 2;

        // Update results
        document.getElementById('baseAmount').textContent = `₹${Math.round(baseAmount).toLocaleString('en-IN')}`;
        document.getElementById('cgstAmount').textContent = `₹${Math.round(cgstAmount).toLocaleString('en-IN')}`;
        document.getElementById('sgstAmount').textContent = `₹${Math.round(sgstAmount).toLocaleString('en-IN')}`;
        document.getElementById('totalGST').textContent = `₹${Math.round(gstAmount).toLocaleString('en-IN')}`;
        document.getElementById('finalAmount').textContent = `₹${Math.round(finalAmount).toLocaleString('en-IN')}`;

        document.getElementById('gstResults').style.display = 'block';
        document.getElementById('chartContainer').style.display = 'block';

        // Create chart
        createGSTChart(baseAmount, cgstAmount, sgstAmount);
    }

    function createGSTChart(baseAmount, cgstAmount, sgstAmount) {
        const ctx = document.getElementById('gstChart');
        const chartType = document.getElementById('chartTypeSelector').value;

        if (gstChart) {
            gstChart.destroy();
        }

        const data = {
            labels: ['Base Amount', 'CGST', 'SGST'],
            datasets: [{
                data: [Math.round(baseAmount), Math.round(cgstAmount), Math.round(sgstAmount)],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 212, 255, 1)',
                    'rgba(0, 255, 136, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: chartType,
            data: data,
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
                                const value = context.parsed.y || context.parsed;
                                return `${context.label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: chartType !== 'doughnut' ? {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                } : {}
            }
        };

        gstChart = new Chart(ctx, config);
    }

    function updateGSTChart() {
        if (gstChart) {
            const baseAmount = parseFloat(document.getElementById('baseAmount').textContent.replace(/[₹,]/g, ''));
            const cgstAmount = parseFloat(document.getElementById('cgstAmount').textContent.replace(/[₹,]/g, ''));
            const sgstAmount = parseFloat(document.getElementById('sgstAmount').textContent.replace(/[₹,]/g, ''));
            
            createGSTChart(baseAmount, cgstAmount, sgstAmount);
        }
    }

    function downloadGSTPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add logo and header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('GST Calculator Report', 20, 50);

        // Add input data
        doc.setFontSize(12);
        doc.text('Input Data:', 20, 70);
        doc.text(`Original Amount: ${document.getElementById('originalAmount').value}`, 20, 85);
        doc.text(`GST Rate: ${document.getElementById('gstRate').value}%`, 20, 100);
        doc.text(`Calculation Type: ${document.getElementById('calculationType').value}`, 20, 115);

        // Add results
        doc.text('Results:', 20, 140);
        doc.text(`Base Amount: ${document.getElementById('baseAmount').textContent}`, 20, 155);
        doc.text(`CGST: ${document.getElementById('cgstAmount').textContent}`, 20, 170);
        doc.text(`SGST: ${document.getElementById('sgstAmount').textContent}`, 20, 185);
        doc.text(`Total GST: ${document.getElementById('totalGST').textContent}`, 20, 200);
        doc.text(`Final Amount: ${document.getElementById('finalAmount').textContent}`, 20, 215);

        // Add footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('gst-calculator-report.pdf');
        showNotification('PDF downloaded successfully!', 'success');
    }

    // Invoice Generator functionality
    function initInvoiceGenerator() {
        const addItemBtn = document.getElementById('addInvoiceItem');
        const generateBtn = document.getElementById('generateInvoicePDF');
        const refreshBtn = document.getElementById('refreshInvoice');

        if (addItemBtn) {
            addItemBtn.addEventListener('click', addInvoiceItem);
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', generateInvoicePDF);
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                resetInvoiceGenerator();
                showNotification('Invoice generator refreshed!', 'info');
            });
        }
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
                    <option value="">Select GST</option>
                    <option value="0">0% GST</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
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

    function generateInvoicePDF() {
        const businessName = document.getElementById('businessName').value;
        const gstin = document.getElementById('gstin').value;
        const address = document.getElementById('businessAddress').value;

        if (!businessName || !gstin || !address) {
            showNotification('Please fill all business details!', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add logo and header
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('TAX INVOICE', 20, 50);

        // Business details
        doc.setFontSize(12);
        doc.text(`Business: ${businessName}`, 20, 70);
        doc.text(`GSTIN: ${gstin}`, 20, 85);
        doc.text(`Address: ${address}`, 20, 100);

        // Invoice items
        const items = document.querySelectorAll('.invoice-item');
        let yPos = 120;
        let subtotal = 0;
        let totalGST = 0;

        doc.text('Items:', 20, yPos);
        yPos += 20;

        items.forEach((item, index) => {
            const desc = item.querySelector('.item-desc').value || 'Item';
            const qty = parseFloat(item.querySelector('.item-qty').value) || 1;
            const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
            const gstRate = parseFloat(item.querySelector('.item-gst').value) || 0;

            const amount = qty * rate;
            const gstAmount = (amount * gstRate) / 100;
            const total = amount + gstAmount;

            subtotal += amount;
            totalGST += gstAmount;

            doc.text(`${index + 1}. ${desc} (Qty: ${qty}, Rate: ₹${rate}, GST: ${gstRate}%) = ₹${total.toFixed(2)}`, 20, yPos);
            yPos += 15;
        });

        // Totals
        yPos += 10;
        doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 20, yPos);
        yPos += 15;
        doc.text(`Total GST: ₹${totalGST.toFixed(2)}`, 20, yPos);
        yPos += 15;
        doc.setFontSize(14);
        doc.text(`Grand Total: ₹${(subtotal + totalGST).toFixed(2)}`, 20, yPos);

        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('invoice.pdf');
        showNotification('Invoice PDF generated successfully!', 'success');
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
                        <option value="">Select GST</option>
                        <option value="0">0% GST</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST</option>
                        <option value="28">28% GST</option>
                    </select>
                    <button class="remove-item-btn" onclick="removeInvoiceItem(this)">×</button>
                </div>
            </div>
        `;
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
                showNotification(`HSN Code: ${hsnCode}, GST Rate: ${gstRate}% selected!`, 'success');
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
        const chartSelector = document.getElementById('analysisChartSelector');
        const downloadBtn = document.getElementById('downloadAnalysisPDF');

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', function() {
                if (!validateAnalysisInputs()) {
                    showNotification('Please fill all required fields!', 'warning');
                    return;
                }

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
                showNotification('Analysis refreshed!', 'info');
            });
        }

        if (chartSelector) {
            chartSelector.addEventListener('change', updateAnalysisChart);
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadAnalysisPDF);
        }
    }

    function validateAnalysisInputs() {
        const monthlySales = document.getElementById('monthlySales')?.value;
        const avgGSTRate = document.getElementById('avgGSTRate')?.value;
        const businessType = document.getElementById('businessType')?.value;

        return monthlySales && monthlySales > 0 && avgGSTRate && avgGSTRate >= 0 && businessType;
    }

    function analyzeGSTImpact() {
        const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 0;
        const avgGSTRate = parseFloat(document.getElementById('avgGSTRate').value) || 0;
        const businessType = document.getElementById('businessType').value;

        const monthlyGST = (monthlySales * avgGSTRate) / 100;
        const annualGST = monthlyGST * 12;

        document.getElementById('monthlyGSTLiability').textContent = `₹${monthlyGST.toLocaleString('en-IN')}`;
        document.getElementById('annualGSTLiability').textContent = `₹${annualGST.toLocaleString('en-IN')}`;
        document.getElementById('effectiveTaxRate').textContent = `${avgGSTRate}%`;
        document.getElementById('complianceStatus').textContent = businessType === 'composition' ? 'Composition Scheme' : 'Regular Filing';

        // Update breakdown table
        const tableBody = document.getElementById('gstBreakdownTableBody');
        tableBody.innerHTML = `
            <tr>
                <td>${avgGSTRate}%</td>
                <td>₹${monthlySales.toLocaleString('en-IN')}</td>
                <td>₹${monthlyGST.toLocaleString('en-IN')}</td>
                <td>100%</td>
            </tr>
        `;

        document.getElementById('analysisResults').style.display = 'block';
        createAnalysisChart(monthlySales, monthlyGST);
    }

    function createAnalysisChart(sales, gst) {
        const ctx = document.getElementById('gstAnalysisChart');
        const chartType = document.getElementById('analysisChartSelector').value;

        if (analysisChart) {
            analysisChart.destroy();
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesData = Array(12).fill(sales);
        const gstData = Array(12).fill(gst);

        const data = {
            labels: chartType === 'doughnut' ? ['Sales', 'GST'] : months,
            datasets: chartType === 'doughnut' ? [{
                data: [sales, gst],
                backgroundColor: ['rgba(0, 212, 255, 0.8)', 'rgba(0, 255, 136, 0.8)'],
                borderColor: ['rgba(0, 212, 255, 1)', 'rgba(0, 255, 136, 1)'],
                borderWidth: 2
            }] : [
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
                    backgroundColor: 'rgba(0, 255, 136, 0.8)',
                    borderColor: 'rgba(0, 255, 136, 1)',
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: chartType,
            data: data,
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
                                const value = context.parsed.y || context.parsed;
                                return `${context.dataset.label || context.label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: chartType !== 'doughnut' ? {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                } : {}
            }
        };

        analysisChart = new Chart(ctx, config);
    }

    function updateAnalysisChart() {
        if (analysisChart) {
            const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 0;
            const avgGSTRate = parseFloat(document.getElementById('avgGSTRate').value) || 0;
            const monthlyGST = (monthlySales * avgGSTRate) / 100;
            
            createAnalysisChart(monthlySales, monthlyGST);
        }
    }

    function resetGSTAnalysis() {
        document.getElementById('monthlySales').value = '';
        document.getElementById('avgGSTRate').value = '';
        document.getElementById('businessType').value = '';
        document.getElementById('analysisResults').style.display = 'none';
        
        if (analysisChart) {
            analysisChart.destroy();
            analysisChart = null;
        }
    }

    function downloadAnalysisPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add content similar to other PDF functions
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('GST Analysis Report', 20, 50);

        // Add analysis data
        doc.setFontSize(12);
        doc.text('Analysis Results:', 20, 70);
        doc.text(`Monthly GST Liability: ${document.getElementById('monthlyGSTLiability').textContent}`, 20, 85);
        doc.text(`Annual GST Liability: ${document.getElementById('annualGSTLiability').textContent}`, 20, 100);
        doc.text(`Effective Tax Rate: ${document.getElementById('effectiveTaxRate').textContent}`, 20, 115);
        doc.text(`Compliance Status: ${document.getElementById('complianceStatus').textContent}`, 20, 130);

        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('gst-analysis-report.pdf');
        showNotification('Analysis PDF downloaded successfully!', 'success');
    }

    // GST Returns functionality
    function initGSTReturns() {
        const calculateBtn = document.getElementById('calculateReturns');
        const refreshBtn = document.getElementById('refreshReturns');
        const chartSelector = document.getElementById('returnsChartSelector');
        const downloadBtn = document.getElementById('downloadReturnsPDF');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                if (!validateReturnsInputs()) {
                    showNotification('Please fill all required fields!', 'warning');
                    return;
                }

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
                showNotification('Returns calculator refreshed!', 'info');
            });
        }

        if (chartSelector) {
            chartSelector.addEventListener('change', updateReturnsChart);
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadReturnsPDF);
        }
    }

    function validateReturnsInputs() {
        const totalSales = document.getElementById('totalSalesGST')?.value;
        const totalPurchases = document.getElementById('totalPurchasesGST')?.value;
        const returnPeriod = document.getElementById('returnPeriod')?.value;

        return totalSales && totalSales > 0 && totalPurchases && totalPurchases >= 0 && returnPeriod;
    }

    function calculateGSTReturns() {
        const totalSales = parseFloat(document.getElementById('totalSalesGST').value) || 0;
        const totalPurchases = parseFloat(document.getElementById('totalPurchasesGST').value) || 0;
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
        createReturnsChart(outputGST, inputGST, netGST);
    }

    function createReturnsChart(outputGST, inputGST, netGST) {
        const ctx = document.getElementById('returnsChart');
        const chartType = document.getElementById('returnsChartSelector').value;

        if (returnsChart) {
            returnsChart.destroy();
        }

        const data = {
            labels: ['Output GST', 'Input GST', 'Net Liability'],
            datasets: [{
                data: [Math.round(outputGST), Math.round(inputGST), Math.round(netGST)],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 0, 128, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 212, 255, 1)',
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 0, 128, 1)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: chartType,
            data: data,
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
                                const value = context.parsed.y || context.parsed;
                                return `${context.label}: ₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                },
                scales: chartType !== 'doughnut' ? {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#ffffff',
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                } : {}
            }
        };

        returnsChart = new Chart(ctx, config);
    }

    function updateReturnsChart() {
        if (returnsChart) {
            const outputGST = parseFloat(document.getElementById('outputGST').textContent.replace(/[₹,]/g, ''));
            const inputGST = parseFloat(document.getElementById('inputGST').textContent.replace(/[₹,]/g, ''));
            const netGST = parseFloat(document.getElementById('netGSTLiability').textContent.replace(/[₹,]/g, ''));
            
            createReturnsChart(outputGST, inputGST, netGST);
        }
    }

    function resetGSTReturns() {
        document.getElementById('returnPeriod').value = '';
        document.getElementById('totalSalesGST').value = '';
        document.getElementById('totalPurchasesGST').value = '';
        document.getElementById('previousBalance').value = '';
        document.getElementById('returnsResults').style.display = 'none';
        
        if (returnsChart) {
            returnsChart.destroy();
            returnsChart = null;
        }
    }

    function downloadReturnsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add content
        doc.setFontSize(20);
        doc.setTextColor(0, 212, 255);
        doc.text('PRATIX FINANCE', 20, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('GST Returns Report', 20, 50);

        // Add returns data
        doc.setFontSize(12);
        doc.text('Returns Summary:', 20, 70);
        doc.text(`Output GST: ${document.getElementById('outputGST').textContent}`, 20, 85);
        doc.text(`Input GST: ${document.getElementById('inputGST').textContent}`, 20, 100);
        doc.text(`Net GST Liability: ${document.getElementById('netGSTLiability').textContent}`, 20, 115);
        doc.text(`Total Payable: ${document.getElementById('totalPayable').textContent}`, 20, 130);

        // Footer
        doc.setFontSize(10);
        doc.text('© 2025 RAGHAV PRATAP | PRATIX FINANCE | https://pratix-finance.vercel.app/', 20, 280);

        doc.save('gst-returns-report.pdf');
        showNotification('Returns PDF downloaded successfully!', 'success');
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
