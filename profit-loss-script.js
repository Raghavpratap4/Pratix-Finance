
// Profit Loss Calculator Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profit Loss Calculator loaded');
    initializeProfitLossCalculator();
});

// Global variables to store calculation results
let currentPLData = {};
let plChart = null;
let breakEvenChart = null;
let scenarioChart = null;
let marginChart = null;
let projectionChart = null;

function initializeProfitLossCalculator() {
    // P&L Calculator
    document.getElementById('calculatePL')?.addEventListener('click', calculateProfitLoss);
    document.getElementById('refreshPL')?.addEventListener('click', resetPLCalculator);
    
    // Break-Even Analysis
    document.getElementById('calculateBreakEven')?.addEventListener('click', calculateBreakEven);
    document.getElementById('refreshBreakEven')?.addEventListener('click', resetBreakEven);
    
    // Scenario Planning
    document.getElementById('calculateScenarios')?.addEventListener('click', calculateScenarios);
    document.getElementById('refreshScenarios')?.addEventListener('click', resetScenarios);
    
    // Margin Analysis
    document.getElementById('calculateMargins')?.addEventListener('click', calculateMargins);
    document.getElementById('refreshMargins')?.addEventListener('click', resetMargins);
    
    // Monthly Projections
    document.getElementById('calculateProjections')?.addEventListener('click', calculateProjections);
    document.getElementById('refreshProjections')?.addEventListener('click', resetProjections);
    
    // Chart type selectors
    document.getElementById('plChartType')?.addEventListener('change', updatePLChart);
    document.getElementById('projectionChartType')?.addEventListener('change', updateProjectionChart);
    
    // PDF download buttons
    document.getElementById('downloadPLPDF')?.addEventListener('click', downloadPLPDF);
    document.getElementById('downloadBreakEvenPDF')?.addEventListener('click', downloadBreakEvenPDF);
    document.getElementById('downloadScenarioPDF')?.addEventListener('click', downloadScenarioPDF);
    document.getElementById('downloadMarginPDF')?.addEventListener('click', downloadMarginPDF);
    document.getElementById('downloadProjectionPDF')?.addEventListener('click', downloadProjectionPDF);
}

// Profit Loss Calculator Functions
function calculateProfitLoss() {
    try {
        const totalRevenue = parseFloat(document.getElementById('totalRevenue').value) || 0;
        const costOfGoods = parseFloat(document.getElementById('costOfGoods').value) || 0;
        const operatingExpenses = parseFloat(document.getElementById('operatingExpenses').value) || 0;
        const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;
        const financialCosts = parseFloat(document.getElementById('financialCosts').value) || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;

        // Validate inputs
        if (totalRevenue <= 0) {
            showNotification('Please enter a valid revenue amount', 'error');
            return;
        }

        // Calculate P&L components
        const grossProfit = totalRevenue - costOfGoods;
        const operatingProfit = grossProfit - operatingExpenses;
        const profitBeforeTax = operatingProfit + otherIncome - financialCosts;
        const taxAmount = (profitBeforeTax > 0) ? (profitBeforeTax * taxRate / 100) : 0;
        const netProfit = profitBeforeTax - taxAmount;
        
        // Calculate margins
        const grossMargin = (grossProfit / totalRevenue) * 100;
        const netMargin = (netProfit / totalRevenue) * 100;

        // Store results
        currentPLData = {
            totalRevenue,
            costOfGoods,
            operatingExpenses,
            otherIncome,
            financialCosts,
            taxRate,
            grossProfit,
            operatingProfit,
            profitBeforeTax,
            taxAmount,
            netProfit,
            grossMargin,
            netMargin
        };

        // Display results
        displayPLResults();
        createPLChart();
        
        showNotification('P&L calculated successfully!', 'success');
    } catch (error) {
        console.error('Error calculating P&L:', error);
        showNotification('Error calculating P&L. Please check your inputs.', 'error');
    }
}

function displayPLResults() {
    document.getElementById('grossProfit').textContent = formatCurrency(currentPLData.grossProfit);
    document.getElementById('operatingProfit').textContent = formatCurrency(currentPLData.operatingProfit);
    document.getElementById('profitBeforeTax').textContent = formatCurrency(currentPLData.profitBeforeTax);
    document.getElementById('taxAmount').textContent = formatCurrency(currentPLData.taxAmount);
    document.getElementById('netProfit').textContent = formatCurrency(currentPLData.netProfit);
    document.getElementById('grossMargin').textContent = currentPLData.grossMargin.toFixed(2) + '%';
    document.getElementById('netMargin').textContent = currentPLData.netMargin.toFixed(2) + '%';
    
    document.getElementById('plResults').style.display = 'block';
    document.getElementById('plChartContainer').style.display = 'block';
}

function createPLChart() {
    const ctx = document.getElementById('plChart').getContext('2d');
    
    if (plChart) {
        plChart.destroy();
    }

    const chartType = document.getElementById('plChartType').value || 'doughnut';
    
    const data = {
        labels: ['Cost of Goods', 'Operating Expenses', 'Tax', 'Net Profit'],
        datasets: [{
            data: [
                currentPLData.costOfGoods,
                currentPLData.operatingExpenses,
                currentPLData.taxAmount,
                currentPLData.netProfit
            ],
            backgroundColor: [
                '#ff6b6b',
                '#ffa726',
                '#66bb6a',
                '#42a5f5'
            ],
            borderWidth: 2,
            borderColor: '#fff'
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
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₹' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    };

    plChart = new Chart(ctx, config);
}

// Break-Even Analysis Functions
function calculateBreakEven() {
    try {
        const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
        const variableCostPerUnit = parseFloat(document.getElementById('variableCostPerUnit').value) || 0;
        const sellingPricePerUnit = parseFloat(document.getElementById('sellingPricePerUnit').value) || 0;

        if (sellingPricePerUnit <= variableCostPerUnit) {
            showNotification('Selling price must be greater than variable cost per unit', 'error');
            return;
        }

        const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
        const contributionMarginPercent = (contributionMargin / sellingPricePerUnit) * 100;
        const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
        const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

        // Display results
        document.getElementById('breakEvenUnits').textContent = breakEvenUnits.toLocaleString() + ' units';
        document.getElementById('breakEvenRevenue').textContent = formatCurrency(breakEvenRevenue);
        document.getElementById('contributionMargin').textContent = formatCurrency(contributionMargin);
        document.getElementById('contributionMarginPercent').textContent = contributionMarginPercent.toFixed(2) + '%';
        
        document.getElementById('breakEvenResults').style.display = 'block';
        document.getElementById('breakEvenChartContainer').style.display = 'block';
        
        createBreakEvenChart(fixedCosts, variableCostPerUnit, sellingPricePerUnit, breakEvenUnits);
        
        showNotification('Break-even analysis completed!', 'success');
    } catch (error) {
        console.error('Error calculating break-even:', error);
        showNotification('Error calculating break-even. Please check your inputs.', 'error');
    }
}

function createBreakEvenChart(fixedCosts, variableCostPerUnit, sellingPricePerUnit, breakEvenUnits) {
    const ctx = document.getElementById('breakEvenChart').getContext('2d');
    
    if (breakEvenChart) {
        breakEvenChart.destroy();
    }

    const maxUnits = breakEvenUnits * 2;
    const units = [];
    const totalCosts = [];
    const totalRevenue = [];

    for (let i = 0; i <= maxUnits; i += Math.ceil(maxUnits / 20)) {
        units.push(i);
        totalCosts.push(fixedCosts + (i * variableCostPerUnit));
        totalRevenue.push(i * sellingPricePerUnit);
    }

    breakEvenChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: units,
            datasets: [{
                label: 'Total Revenue',
                data: totalRevenue,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }, {
                label: 'Total Costs',
                data: totalCosts,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.1
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
                x: {
                    title: {
                        display: true,
                        text: 'Units',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount (₹)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Scenario Planning Functions
function calculateScenarios() {
    try {
        const baseRevenue = parseFloat(document.getElementById('baseCaseRevenue').value) || 0;
        const optimisticPercent = parseFloat(document.getElementById('optimisticPercent').value) || 0;
        const pessimisticPercent = parseFloat(document.getElementById('pessimisticPercent').value) || 0;
        const baseCosts = parseFloat(document.getElementById('baseCaseCosts').value) || 0;

        if (baseRevenue <= 0) {
            showNotification('Please enter a valid base case revenue', 'error');
            return;
        }

        // Calculate scenarios
        const scenarios = {
            pessimistic: {
                revenue: baseRevenue * (1 - pessimisticPercent / 100),
                costs: baseCosts,
                profit: 0,
                margin: 0
            },
            base: {
                revenue: baseRevenue,
                costs: baseCosts,
                profit: 0,
                margin: 0
            },
            optimistic: {
                revenue: baseRevenue * (1 + optimisticPercent / 100),
                costs: baseCosts,
                profit: 0,
                margin: 0
            }
        };

        // Calculate profits and margins
        Object.keys(scenarios).forEach(key => {
            scenarios[key].profit = scenarios[key].revenue - scenarios[key].costs;
            scenarios[key].margin = (scenarios[key].profit / scenarios[key].revenue) * 100;
        });

        // Display results
        document.getElementById('pessimisticRevenue').textContent = formatCurrency(scenarios.pessimistic.revenue);
        document.getElementById('pessimisticProfit').textContent = formatCurrency(scenarios.pessimistic.profit);
        document.getElementById('pessimisticMargin').textContent = scenarios.pessimistic.margin.toFixed(2) + '%';

        document.getElementById('baseRevenue').textContent = formatCurrency(scenarios.base.revenue);
        document.getElementById('baseProfit').textContent = formatCurrency(scenarios.base.profit);
        document.getElementById('baseMargin').textContent = scenarios.base.margin.toFixed(2) + '%';

        document.getElementById('optimisticRevenue').textContent = formatCurrency(scenarios.optimistic.revenue);
        document.getElementById('optimisticProfit').textContent = formatCurrency(scenarios.optimistic.profit);
        document.getElementById('optimisticMargin').textContent = scenarios.optimistic.margin.toFixed(2) + '%';

        document.getElementById('scenarioResults').style.display = 'block';
        
        createScenarioChart(scenarios);
        
        showNotification('Scenario analysis completed!', 'success');
    } catch (error) {
        console.error('Error calculating scenarios:', error);
        showNotification('Error calculating scenarios. Please check your inputs.', 'error');
    }
}

function createScenarioChart(scenarios) {
    const ctx = document.getElementById('scenarioChart').getContext('2d');
    
    if (scenarioChart) {
        scenarioChart.destroy();
    }

    scenarioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pessimistic', 'Base Case', 'Optimistic'],
            datasets: [{
                label: 'Revenue',
                data: [scenarios.pessimistic.revenue, scenarios.base.revenue, scenarios.optimistic.revenue],
                backgroundColor: '#42a5f5'
            }, {
                label: 'Profit',
                data: [scenarios.pessimistic.profit, scenarios.base.profit, scenarios.optimistic.profit],
                backgroundColor: '#66bb6a'
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
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Margin Analysis Functions
function calculateMargins() {
    try {
        const unitsSold = parseFloat(document.getElementById('unitsSold').value) || 0;
        const revenuePerUnit = parseFloat(document.getElementById('revenuePerUnit').value) || 0;
        const costPerUnit = parseFloat(document.getElementById('costPerUnit').value) || 0;

        if (unitsSold <= 0 || revenuePerUnit <= 0) {
            showNotification('Please enter valid units sold and revenue per unit', 'error');
            return;
        }

        const totalRevenue = unitsSold * revenuePerUnit;
        const totalCost = unitsSold * costPerUnit;
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = (totalProfit / totalRevenue) * 100;
        const markup = ((revenuePerUnit - costPerUnit) / costPerUnit) * 100;
        const roi = (totalProfit / totalCost) * 100;

        // Display results
        document.getElementById('totalRevenueMargin').textContent = formatCurrency(totalRevenue);
        document.getElementById('totalCostMargin').textContent = formatCurrency(totalCost);
        document.getElementById('totalProfitMargin').textContent = formatCurrency(totalProfit);
        document.getElementById('profitMarginPercent').textContent = profitMargin.toFixed(2) + '%';
        document.getElementById('markupPercent').textContent = markup.toFixed(2) + '%';
        document.getElementById('roiPercent').textContent = roi.toFixed(2) + '%';

        document.getElementById('marginResults').style.display = 'block';
        
        createMarginChart(totalRevenue, totalCost, totalProfit);
        
        showNotification('Margin analysis completed!', 'success');
    } catch (error) {
        console.error('Error calculating margins:', error);
        showNotification('Error calculating margins. Please check your inputs.', 'error');
    }
}

function createMarginChart(totalRevenue, totalCost, totalProfit) {
    const ctx = document.getElementById('marginChart').getContext('2d');
    
    if (marginChart) {
        marginChart.destroy();
    }

    marginChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Cost', 'Total Profit'],
            datasets: [{
                data: [totalCost, totalProfit],
                backgroundColor: ['#ff6b6b', '#4CAF50'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₹' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Monthly Projections Functions
function calculateProjections() {
    try {
        const startingRevenue = parseFloat(document.getElementById('startingRevenue').value) || 0;
        const revenueGrowth = parseFloat(document.getElementById('revenueGrowth').value) || 0;
        const monthlyFixedCosts = parseFloat(document.getElementById('monthlyFixedCosts').value) || 0;
        const variableCostPercent = parseFloat(document.getElementById('variableCostPercent').value) || 0;
        const projectionMonths = parseInt(document.getElementById('projectionMonths').value) || 12;

        if (startingRevenue <= 0) {
            showNotification('Please enter a valid starting revenue', 'error');
            return;
        }

        const projections = [];
        let totalYearRevenue = 0;
        let totalYearProfit = 0;
        let breakEvenMonth = 0;

        for (let month = 1; month <= projectionMonths; month++) {
            const monthlyRevenue = startingRevenue * Math.pow(1 + revenueGrowth / 100, month - 1);
            const variableCosts = monthlyRevenue * (variableCostPercent / 100);
            const totalMonthlyCosts = monthlyFixedCosts + variableCosts;
            const monthlyProfit = monthlyRevenue - totalMonthlyCosts;

            projections.push({
                month,
                revenue: monthlyRevenue,
                fixedCosts: monthlyFixedCosts,
                variableCosts,
                profit: monthlyProfit
            });

            if (month <= 12) {
                totalYearRevenue += monthlyRevenue;
                totalYearProfit += monthlyProfit;
            }

            if (monthlyProfit > 0 && breakEvenMonth === 0) {
                breakEvenMonth = month;
            }
        }

        const avgMonthlyProfit = totalYearProfit / Math.min(12, projectionMonths);

        // Display summary
        document.getElementById('totalYearRevenue').textContent = formatCurrency(totalYearRevenue);
        document.getElementById('totalYearProfit').textContent = formatCurrency(totalYearProfit);
        document.getElementById('avgMonthlyProfit').textContent = formatCurrency(avgMonthlyProfit);
        document.getElementById('breakEvenMonth').textContent = breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'Not achieved';

        // Create table
        createProjectionTable(projections);
        
        // Create chart
        createProjectionChart(projections);

        document.getElementById('projectionResults').style.display = 'block';
        
        showNotification('Monthly projections calculated!', 'success');
    } catch (error) {
        console.error('Error calculating projections:', error);
        showNotification('Error calculating projections. Please check your inputs.', 'error');
    }
}

function createProjectionTable(projections) {
    const tableBody = document.getElementById('projectionTableBody');
    tableBody.innerHTML = '';

    projections.forEach((projection, index) => {
        if (index < 12) { // Show only first 12 months
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Month ${projection.month}</td>
                <td>${formatCurrency(projection.revenue)}</td>
                <td>${formatCurrency(projection.fixedCosts)}</td>
                <td>${formatCurrency(projection.variableCosts)}</td>
                <td class="${projection.profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(projection.profit)}</td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function createProjectionChart(projections) {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    
    if (projectionChart) {
        projectionChart.destroy();
    }

    const chartType = document.getElementById('projectionChartType').value || 'line';
    const months = projections.map(p => `Month ${p.month}`);
    const revenues = projections.map(p => p.revenue);
    const profits = projections.map(p => p.profit);

    projectionChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: revenues,
                borderColor: '#42a5f5',
                backgroundColor: chartType === 'area' ? 'rgba(66, 165, 245, 0.3)' : '#42a5f5',
                tension: 0.1
            }, {
                label: 'Profit',
                data: profits,
                borderColor: '#4CAF50',
                backgroundColor: chartType === 'area' ? 'rgba(76, 175, 80, 0.3)' : '#4CAF50',
                tension: 0.1
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
                x: {
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Chart update functions
function updatePLChart() {
    if (currentPLData.totalRevenue) {
        createPLChart();
    }
}

function updateProjectionChart() {
    if (projectionChart) {
        const projections = Array.from(document.querySelectorAll('#projectionTableBody tr')).map((row, index) => ({
            month: index + 1,
            revenue: parseFloat(row.cells[1].textContent.replace(/[₹,]/g, '')),
            profit: parseFloat(row.cells[4].textContent.replace(/[₹,]/g, ''))
        }));
        
        if (projections.length > 0) {
            createProjectionChart(projections);
        }
    }
}

// Reset functions
function resetPLCalculator() {
    document.getElementById('totalRevenue').value = '';
    document.getElementById('costOfGoods').value = '';
    document.getElementById('operatingExpenses').value = '';
    document.getElementById('otherIncome').value = '';
    document.getElementById('financialCosts').value = '';
    document.getElementById('taxRate').value = '';
    
    document.getElementById('plResults').style.display = 'none';
    document.getElementById('plChartContainer').style.display = 'none';
    
    if (plChart) {
        plChart.destroy();
        plChart = null;
    }
    
    currentPLData = {};
}

function resetBreakEven() {
    document.getElementById('fixedCosts').value = '';
    document.getElementById('variableCostPerUnit').value = '';
    document.getElementById('sellingPricePerUnit').value = '';
    
    document.getElementById('breakEvenResults').style.display = 'none';
    document.getElementById('breakEvenChartContainer').style.display = 'none';
    
    if (breakEvenChart) {
        breakEvenChart.destroy();
        breakEvenChart = null;
    }
}

function resetScenarios() {
    document.getElementById('baseCaseRevenue').value = '';
    document.getElementById('optimisticPercent').value = '';
    document.getElementById('pessimisticPercent').value = '';
    document.getElementById('baseCaseCosts').value = '';
    
    document.getElementById('scenarioResults').style.display = 'none';
    
    if (scenarioChart) {
        scenarioChart.destroy();
        scenarioChart = null;
    }
}

function resetMargins() {
    document.getElementById('productName').value = '';
    document.getElementById('unitsSold').value = '';
    document.getElementById('revenuePerUnit').value = '';
    document.getElementById('costPerUnit').value = '';
    
    document.getElementById('marginResults').style.display = 'none';
    
    if (marginChart) {
        marginChart.destroy();
        marginChart = null;
    }
}

function resetProjections() {
    document.getElementById('startingRevenue').value = '';
    document.getElementById('revenueGrowth').value = '';
    document.getElementById('monthlyFixedCosts').value = '';
    document.getElementById('variableCostPercent').value = '';
    document.getElementById('projectionMonths').value = '';
    
    document.getElementById('projectionResults').style.display = 'none';
    
    if (projectionChart) {
        projectionChart.destroy();
        projectionChart = null;
    }
}

// PDF download functions
function downloadPLPDF() {
    try {
        if (!currentPLData.totalRevenue) {
            showNotification('Please calculate P&L first', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('Profit & Loss Statement', 20, 30);

        // Add company info
        doc.setFontSize(12);
        doc.text('Generated by PRATIX FINANCE', 20, 45);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);

        // Add P&L data
        let yPos = 75;
        doc.setFontSize(14);
        doc.text('Financial Summary:', 20, yPos);
        
        yPos += 15;
        doc.setFontSize(11);
        const plData = [
            ['Total Revenue', formatCurrency(currentPLData.totalRevenue)],
            ['Cost of Goods Sold', formatCurrency(currentPLData.costOfGoods)],
            ['Gross Profit', formatCurrency(currentPLData.grossProfit)],
            ['Operating Expenses', formatCurrency(currentPLData.operatingExpenses)],
            ['Operating Profit', formatCurrency(currentPLData.operatingProfit)],
            ['Other Income', formatCurrency(currentPLData.otherIncome)],
            ['Financial Costs', formatCurrency(currentPLData.financialCosts)],
            ['Profit Before Tax', formatCurrency(currentPLData.profitBeforeTax)],
            ['Tax Amount', formatCurrency(currentPLData.taxAmount)],
            ['Net Profit', formatCurrency(currentPLData.netProfit)],
            ['Gross Margin', currentPLData.grossMargin.toFixed(2) + '%'],
            ['Net Margin', currentPLData.netMargin.toFixed(2) + '%']
        ];

        plData.forEach(([label, value]) => {
            doc.text(label + ':', 20, yPos);
            doc.text(value, 120, yPos);
            yPos += 12;
        });

        doc.save('profit-loss-statement.pdf');
        showNotification('P&L PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

function downloadBreakEvenPDF() {
    // Similar implementation for break-even PDF
    showNotification('Break-even PDF download functionality coming soon!', 'info');
}

function downloadScenarioPDF() {
    // Similar implementation for scenario PDF
    showNotification('Scenario PDF download functionality coming soon!', 'info');
}

function downloadMarginPDF() {
    // Similar implementation for margin PDF
    showNotification('Margin PDF download functionality coming soon!', 'info');
}

function downloadProjectionPDF() {
    // Similar implementation for projection PDF
    showNotification('Projection PDF download functionality coming soon!', 'info');
}

// Utility functions
function formatCurrency(amount) {
    if (amount < 0) {
        return '-₹' + Math.abs(amount).toLocaleString('en-IN');
    }
    return '₹' + amount.toLocaleString('en-IN');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '10000',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Navigation functions
function goToEmiCalculator() {
    window.location.href = 'emi-calculator.html';
}

function goToSipCalculator() {
    window.location.href = 'sip-calculator.html';
}

function goToTaxCalculator() {
    window.location.href = 'tax-calculator.html';
}

function goToGstCalculator() {
    window.location.href = 'gst-calculator.html';
}

function goToFdCalculator() {
    window.location.href = 'fd-calculator.html';
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}
