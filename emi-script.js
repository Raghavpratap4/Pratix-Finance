
// PRATIX FINANCE - Professional EMI Calculator
// Version 2.0 - Enhanced with comprehensive error handling and features

'use strict';

// Global State Management
const EMICalculator = {
    // State
    currentEMIData: null,
    charts: {
        emi: null,
        prepayment: null,
        comparison: null
    },
    
    // Configuration
    config: {
        maxLoanAmount: 100000000, // 10 Crores
        minLoanAmount: 1000,
        maxInterestRate: 50,
        minInterestRate: 0.1,
        maxTenure: 50,
        minTenure: 1,
        precision: 2,
        currency: 'INR'
    },
    
    // Error tracking
    errors: [],
    
    // Validation rules
    validation: {
        loanAmount: {
            required: true,
            min: 1000,
            max: 100000000,
            message: 'Loan amount must be between ₹1,000 and ₹10,00,00,000'
        },
        interestRate: {
            required: true,
            min: 0.1,
            max: 50,
            step: 0.01,
            message: 'Interest rate must be between 0.1% and 50%'
        },
        tenure: {
            required: true,
            min: 1,
            max: 50,
            integer: true,
            message: 'Tenure must be between 1 and 50 years'
        }
    }
};

// Utility Functions
const Utils = {
    // Format currency with proper Indian numbering
    formatCurrency: (amount, showSymbol = true) => {
        try {
            const formatter = new Intl.NumberFormat('en-IN', {
                style: showSymbol ? 'currency' : 'decimal',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            return formatter.format(Math.round(amount));
        } catch (error) {
            console.error('Currency formatting error:', error);
            return showSymbol ? `₹${Math.round(amount).toLocaleString('en-IN')}` : Math.round(amount).toLocaleString('en-IN');
        }
    },
    
    // Precise financial calculations
    calculateEMI: (principal, annualRate, years) => {
        if (!principal || !annualRate || !years) return 0;
        
        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;
        
        if (monthlyRate === 0) {
            return principal / totalMonths;
        }
        
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        return isFinite(emi) ? emi : 0;
    },
    
    // Validation utilities
    validateNumber: (value, rules) => {
        const result = { valid: true, errors: [] };
        
        if (rules.required && (!value || value === '')) {
            result.valid = false;
            result.errors.push('This field is required');
            return result;
        }
        
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            result.valid = false;
            result.errors.push('Please enter a valid number');
            return result;
        }
        
        if (rules.min !== undefined && num < rules.min) {
            result.valid = false;
            result.errors.push(`Value must be at least ${rules.min}`);
        }
        
        if (rules.max !== undefined && num > rules.max) {
            result.valid = false;
            result.errors.push(`Value must not exceed ${rules.max}`);
        }
        
        if (rules.integer && !Number.isInteger(num)) {
            result.valid = false;
            result.errors.push('Value must be a whole number');
        }
        
        return result;
    },
    
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Safe DOM element getter
    getElement: (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with ID '${id}' not found`);
        }
        return element;
    },
    
    // Generate unique ID
    generateId: () => {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Notification System
const NotificationSystem = {
    container: null,
    
    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        const id = Utils.generateId();
        
        notification.id = id;
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            margin-bottom: 10px;
            padding: 16px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(20px);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            pointer-events: auto;
            cursor: pointer;
            position: relative;
        `;
        
        // Set background based on type
        const backgrounds = {
            success: 'linear-gradient(135deg, #00ff88, #00cc70)',
            error: 'linear-gradient(135deg, #ff4757, #e63946)',
            warning: 'linear-gradient(135deg, #ffab00, #f77f00)',
            info: 'linear-gradient(135deg, #00d4ff, #0077b6)'
        };
        
        notification.style.background = backgrounds[type] || backgrounds.info;
        notification.textContent = message;
        
        // Add close functionality
        notification.addEventListener('click', () => {
            this.remove(id);
        });
        
        this.container.appendChild(notification);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        return id;
    },
    
    remove(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    },
    
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};

// Form Validation System
const FormValidator = {
    // Validate single field
    validateField(fieldId, rules) {
        const element = Utils.getElement(fieldId);
        if (!element) return { valid: false, errors: ['Field not found'] };
        
        const value = element.value.trim();
        const validation = Utils.validateNumber(value, rules);
        
        // Update UI
        this.updateFieldUI(element, validation);
        
        return validation;
    },
    
    // Update field UI based on validation
    updateFieldUI(element, validation) {
        // Remove existing error states
        element.classList.remove('error', 'success');
        const existingError = element.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        if (!validation.valid) {
            element.classList.add('error');
            this.showFieldError(element, validation.errors[0]);
        } else if (element.value.trim()) {
            element.classList.add('success');
        }
    },
    
    // Show field error
    showFieldError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    },
    
    // Validate all EMI fields
    validateEMIForm() {
        const fields = [
            { id: 'loanAmountInput', rules: EMICalculator.validation.loanAmount },
            { id: 'interestRateInput', rules: EMICalculator.validation.interestRate },
            { id: 'loanTenureInput', rules: EMICalculator.validation.tenure }
        ];
        
        let allValid = true;
        const errors = [];
        
        fields.forEach(field => {
            const validation = this.validateField(field.id, field.rules);
            if (!validation.valid) {
                allValid = false;
                errors.push(...validation.errors);
            }
        });
        
        return { valid: allValid, errors };
    }
};

// Chart Management System
const ChartManager = {
    // Destroy chart safely
    destroyChart(chartRef) {
        if (chartRef && typeof chartRef.destroy === 'function') {
            try {
                chartRef.destroy();
            } catch (error) {
                console.warn('Error destroying chart:', error);
            }
        }
        return null;
    },
    
    // Create EMI breakdown chart
    createEMIChart(canvasId, data, type = 'doughnut') {
        const canvas = Utils.getElement(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        EMICalculator.charts.emi = this.destroyChart(EMICalculator.charts.emi);
        
        const config = this.getChartConfig(type, data);
        
        try {
            EMICalculator.charts.emi = new Chart(ctx, config);
            return EMICalculator.charts.emi;
        } catch (error) {
            console.error('Error creating chart:', error);
            NotificationSystem.show('Error creating chart visualization', 'error');
            return null;
        }
    },
    
    // Get chart configuration
    getChartConfig(type, data) {
        const colors = {
            primary: '#00d4ff',
            secondary: '#8b5cf6',
            accent: '#00ff88',
            background: 'rgba(255, 255, 255, 0.1)'
        };
        
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y || context.parsed;
                            return `${context.dataset.label || context.label}: ${Utils.formatCurrency(value)}`;
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };
        
        switch (type) {
            case 'doughnut':
                return {
                    type: 'doughnut',
                    data: {
                        labels: ['Principal Amount', 'Interest Amount'],
                        datasets: [{
                            data: [data.principal, data.totalInterest],
                            backgroundColor: [colors.primary, colors.secondary],
                            borderColor: [colors.primary, colors.secondary],
                            borderWidth: 2,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        ...commonOptions,
                        cutout: '60%',
                        plugins: {
                            ...commonOptions.plugins,
                            legend: {
                                ...commonOptions.plugins.legend,
                                display: true
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
                            label: 'Amount',
                            data: [data.principal, data.totalInterest],
                            backgroundColor: [colors.primary, colors.secondary],
                            borderColor: [colors.primary, colors.secondary],
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        ...commonOptions,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#ffffff',
                                    callback: function(value) {
                                        return Utils.formatCurrency(value);
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
                        },
                        plugins: {
                            ...commonOptions.plugins,
                            legend: {
                                display: false
                            }
                        }
                    }
                };
                
            case 'line':
                const monthlyData = this.generateMonthlyData(data);
                return {
                    type: 'line',
                    data: {
                        labels: monthlyData.labels,
                        datasets: [{
                            label: 'Outstanding Balance',
                            data: monthlyData.balances,
                            borderColor: colors.primary,
                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: colors.primary,
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        ...commonOptions,
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
                return this.getChartConfig('doughnut', data);
        }
    },
    
    // Generate monthly data for line chart
    generateMonthlyData(data) {
        const labels = [];
        const balances = [];
        const monthlyRate = data.annualRate / 12 / 100;
        let balance = data.principal;
        
        // Add initial balance
        labels.push('Start');
        balances.push(balance);
        
        // Calculate yearly balances
        for (let year = 1; year <= data.years; year++) {
            for (let month = 1; month <= 12 && balance > 0; month++) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = Math.min(data.emi - interestPayment, balance);
                balance = Math.max(0, balance - principalPayment);
            }
            
            labels.push(`Year ${year}`);
            balances.push(Math.round(balance));
        }
        
        return { labels, balances };
    }
};

// Tab Management System
const TabManager = {
    activeTab: 'emi-calculator',
    
    init() {
        this.setupTabListeners();
        this.setupResponsiveNavigation();
        this.switchToTab(this.activeTab);
    },
    
    setupTabListeners() {
        // Desktop navigation
        const desktopNavItems = document.querySelectorAll('.tab-nav-item[data-tab]');
        desktopNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute('data-tab');
                this.switchToTab(targetTab);
            });
        });
        
        // Bottom navigation
        const bottomNavItems = document.querySelectorAll('.standard-nav-item[data-tab]');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = item.getAttribute('data-tab');
                this.switchToTab(targetTab);
            });
        });
    },
    
    setupResponsiveNavigation() {
        // Mobile menu toggle (if needed)
        const menuToggle = Utils.getElement('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const navigation = document.querySelector('.tab-navigation');
                if (navigation) {
                    navigation.classList.toggle('mobile-open');
                }
            });
        }
    },
    
    switchToTab(tabId) {
        try {
            // Update active tab
            this.activeTab = tabId;
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                tab.style.display = 'none';
            });
            
            // Show target tab
            const targetTab = Utils.getElement(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
                
                // Initialize tab content
                this.initializeTabContent(tabId);
            }
            
            // Update navigation states
            this.updateNavigationStates(tabId);
            
            // Save to localStorage
            localStorage.setItem('emi_calculator_active_tab', tabId);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error switching tabs:', error);
            NotificationSystem.show('Error switching tabs', 'error');
        }
    },
    
    updateNavigationStates(activeTabId) {
        // Update desktop navigation
        const allNavItems = document.querySelectorAll('[data-tab]');
        allNavItems.forEach(item => {
            const tabId = item.getAttribute('data-tab');
            if (tabId === activeTabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    initializeTabContent(tabId) {
        switch (tabId) {
            case 'emi-calculator':
                // EMI calculator is already initialized
                break;
            case 'amortization-table':
                if (EMICalculator.currentEMIData) {
                    AmortizationTable.generate(EMICalculator.currentEMIData);
                }
                break;
            case 'prepayment-impact':
                PrepaymentCalculator.init();
                break;
            case 'loan-comparison':
                LoanComparison.init();
                break;
            case 'tools-extras':
                // Tools are static content
                break;
            case 'smart-features':
                SmartFeatures.init();
                break;
        }
    }
};

// Main EMI Calculator Functions
const EMICalculatorCore = {
    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.loadSavedData();
    },
    
    setupEventListeners() {
        // Calculate button
        const calculateBtn = Utils.getElement('calculateEMI');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateEMI();
            });
        }
        
        // Refresh button
        const refreshBtn = Utils.getElement('refreshEMI');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCalculator();
            });
        }
        
        // Chart type selector
        const chartTypeSelect = Utils.getElement('chartTypeSelect');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', () => {
                if (EMICalculator.currentEMIData) {
                    this.updateChart();
                }
            });
        }
        
        // PDF download
        const downloadPDFBtn = Utils.getElement('downloadPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', () => {
                PDFGenerator.generateEMIReport();
            });
        }
    },
    
    setupRealTimeValidation() {
        const inputs = ['loanAmountInput', 'interestRateInput', 'loanTenureInput'];
        
        inputs.forEach(inputId => {
            const input = Utils.getElement(inputId);
            if (input) {
                // Real-time validation with debounce
                const debouncedValidation = Utils.debounce(() => {
                    this.validateAndCalculate();
                }, 500);
                
                input.addEventListener('input', debouncedValidation);
                input.addEventListener('blur', () => {
                    this.validateField(inputId);
                });
                
                // Format input on blur
                input.addEventListener('blur', () => {
                    this.formatInput(input);
                });
            }
        });
    },
    
    validateField(fieldId) {
        const rules = {
            'loanAmountInput': EMICalculator.validation.loanAmount,
            'interestRateInput': EMICalculator.validation.interestRate,
            'loanTenureInput': EMICalculator.validation.tenure
        };
        
        return FormValidator.validateField(fieldId, rules[fieldId]);
    },
    
    formatInput(input) {
        if (!input.value) return;
        
        const value = parseFloat(input.value);
        if (isNaN(value)) return;
        
        // Format based on input type
        if (input.id === 'loanAmountInput') {
            // Format loan amount with commas
            input.value = Math.round(value).toString();
        } else if (input.id === 'interestRateInput') {
            // Limit decimal places for interest rate
            input.value = value.toFixed(2);
        } else if (input.id === 'loanTenureInput') {
            // Ensure tenure is integer
            input.value = Math.round(value).toString();
        }
    },
    
    validateAndCalculate() {
        const validation = FormValidator.validateEMIForm();
        
        if (validation.valid) {
            this.calculateEMI(false); // Silent calculation
        }
    },
    
    calculateEMI(showNotification = true) {
        try {
            // Validate form
            const validation = FormValidator.validateEMIForm();
            if (!validation.valid) {
                if (showNotification) {
                    NotificationSystem.show(validation.errors[0], 'error');
                }
                return false;
            }
            
            // Get input values
            const loanAmount = parseFloat(Utils.getElement('loanAmountInput').value);
            const annualRate = parseFloat(Utils.getElement('interestRateInput').value);
            const years = parseFloat(Utils.getElement('loanTenureInput').value);
            
            // Calculate EMI
            const emi = Utils.calculateEMI(loanAmount, annualRate, years);
            const totalAmount = emi * years * 12;
            const totalInterest = totalAmount - loanAmount;
            
            // Store calculation data
            EMICalculator.currentEMIData = {
                principal: loanAmount,
                emi: emi,
                totalInterest: totalInterest,
                totalAmount: totalAmount,
                annualRate: annualRate,
                years: years,
                timestamp: new Date().toISOString()
            };
            
            // Update UI
            this.updateResults();
            this.updateChart();
            this.showResultsSection();
            
            // Generate amortization table
            AmortizationTable.generate(EMICalculator.currentEMIData);
            
            // Save to localStorage
            this.saveCalculation();
            
            if (showNotification) {
                NotificationSystem.show('EMI calculated successfully!', 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('Error calculating EMI:', error);
            NotificationSystem.show('Error calculating EMI. Please check your inputs.', 'error');
            return false;
        }
    },
    
    updateResults() {
        const data = EMICalculator.currentEMIData;
        if (!data) return;
        
        // Update result display
        const resultElements = {
            monthlyEMI: Utils.formatCurrency(data.emi),
            totalInterest: Utils.formatCurrency(data.totalInterest),
            totalAmount: Utils.formatCurrency(data.totalAmount)
        };
        
        Object.keys(resultElements).forEach(id => {
            const element = Utils.getElement(id);
            if (element) {
                element.textContent = resultElements[id];
            }
        });
    },
    
    updateChart() {
        const chartTypeSelect = Utils.getElement('chartTypeSelect');
        const chartType = chartTypeSelect ? chartTypeSelect.value : 'pie';
        
        if (EMICalculator.currentEMIData) {
            ChartManager.createEMIChart('emiChart', EMICalculator.currentEMIData, chartType);
        }
    },
    
    showResultsSection() {
        const sections = ['resultCard', 'chartContainer', 'chartControls'];
        sections.forEach(sectionId => {
            const section = Utils.getElement(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
    },
    
    resetCalculator() {
        try {
            // Clear inputs
            const inputs = ['loanAmountInput', 'interestRateInput', 'loanTenureInput'];
            inputs.forEach(inputId => {
                const input = Utils.getElement(inputId);
                if (input) {
                    input.value = '';
                    input.classList.remove('error', 'success');
                }
            });
            
            // Clear error messages
            document.querySelectorAll('.error-message').forEach(error => {
                error.remove();
            });
            
            // Hide results
            const sections = ['resultCard', 'chartContainer', 'chartControls', 'amortizationTableContainer'];
            sections.forEach(sectionId => {
                const section = Utils.getElement(sectionId);
                if (section) {
                    section.style.display = 'none';
                }
            });
            
            // Destroy charts
            Object.keys(EMICalculator.charts).forEach(chartKey => {
                EMICalculator.charts[chartKey] = ChartManager.destroyChart(EMICalculator.charts[chartKey]);
            });
            
            // Clear data
            EMICalculator.currentEMIData = null;
            
            // Clear localStorage
            localStorage.removeItem('emi_calculator_data');
            
            NotificationSystem.show('Calculator reset successfully!', 'info');
            
        } catch (error) {
            console.error('Error resetting calculator:', error);
            NotificationSystem.show('Error resetting calculator', 'error');
        }
    },
    
    saveCalculation() {
        if (EMICalculator.currentEMIData) {
            try {
                localStorage.setItem('emi_calculator_data', JSON.stringify(EMICalculator.currentEMIData));
            } catch (error) {
                console.warn('Could not save calculation to localStorage:', error);
            }
        }
    },
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('emi_calculator_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restore inputs
                const loanAmountInput = Utils.getElement('loanAmountInput');
                const interestRateInput = Utils.getElement('interestRateInput');
                const loanTenureInput = Utils.getElement('loanTenureInput');
                
                if (loanAmountInput) loanAmountInput.value = data.principal;
                if (interestRateInput) interestRateInput.value = data.annualRate;
                if (loanTenureInput) loanTenureInput.value = data.years;
                
                // Recalculate
                this.calculateEMI(false);
            }
        } catch (error) {
            console.warn('Could not load saved data:', error);
        }
    }
};

// Amortization Table Module
const AmortizationTable = {
    generate(data) {
        const tbody = Utils.getElement('amortizationTableBody');
        const container = Utils.getElement('amortizationTableContainer');
        
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
            
            const row = this.createTableRow(year, yearlyPrincipal, yearlyInterest, balance);
            tbody.appendChild(row);
        }
        
        if (container) {
            container.style.display = 'block';
        }
    },
    
    createTableRow(year, principalPaid, interestPaid, outstandingBalance) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${Utils.formatCurrency(principalPaid)}</td>
            <td>${Utils.formatCurrency(interestPaid)}</td>
            <td>${Utils.formatCurrency(Math.max(0, outstandingBalance))}</td>
        `;
        return row;
    }
};

// Prepayment Calculator Module
const PrepaymentCalculator = {
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const calculateBtn = Utils.getElement('calculatePrepayment');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculate();
            });
        }
        
        const refreshBtn = Utils.getElement('refreshPrepayment');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.reset();
            });
        }
        
        const downloadBtn = Utils.getElement('downloadPrepaymentPDF');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                PDFGenerator.generatePrepaymentReport();
            });
        }
    },
    
    calculate() {
        if (!EMICalculator.currentEMIData) {
            NotificationSystem.show('Please calculate EMI first in the main calculator!', 'error');
            return;
        }
        
        const prepaymentAmount = parseFloat(Utils.getElement('prepaymentAmount')?.value || 0);
        const prepayAfterMonths = parseInt(Utils.getElement('prepayAfterMonths')?.value || 0);
        const prepayOption = document.querySelector('input[name="prepayOption"]:checked')?.value;
        
        // Validation
        if (!prepaymentAmount || !prepayAfterMonths || !prepayOption) {
            NotificationSystem.show('Please fill all prepayment details!', 'error');
            return;
        }
        
        if (prepaymentAmount <= 0) {
            NotificationSystem.show('Prepayment amount must be greater than ₹0', 'error');
            return;
        }
        
        if (prepaymentAmount >= EMICalculator.currentEMIData.principal) {
            NotificationSystem.show('Prepayment amount cannot exceed loan amount', 'error');
            return;
        }
        
        if (prepayAfterMonths >= (EMICalculator.currentEMIData.years * 12)) {
            NotificationSystem.show('Prepayment month should be within loan tenure', 'error');
            return;
        }
        
        // Calculate prepayment impact
        const result = this.calculatePrepaymentScenario(
            EMICalculator.currentEMIData,
            prepaymentAmount,
            prepayAfterMonths,
            prepayOption
        );
        
        // Update UI
        this.updatePrepaymentResults(result);
        
        NotificationSystem.show('Prepayment impact calculated successfully!', 'success');
    },
    
    calculatePrepaymentScenario(originalData, prepaymentAmount, prepayAfterMonths, option) {
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
        
        let newEMI, newTenureMonths, newTotalInterest;
        
        if (option === 'tenure') {
            // Keep EMI same, reduce tenure
            newEMI = originalData.emi;
            if (balance <= 0) {
                newTenureMonths = 0;
                newTotalInterest = totalInterest;
            } else {
                newTenureMonths = Math.ceil(Math.log(1 + (balance * monthlyRate) / newEMI) / Math.log(1 + monthlyRate));
                
                // Calculate total interest for remaining months
                let tempBalance = balance;
                for (let i = 0; i < newTenureMonths; i++) {
                    const interestPayment = tempBalance * monthlyRate;
                    const principalPayment = Math.min(newEMI - interestPayment, tempBalance);
                    totalInterest += interestPayment;
                    tempBalance -= principalPayment;
                    if (tempBalance <= 0) break;
                }
                newTotalInterest = totalInterest;
            }
        } else {
            // Keep tenure same, reduce EMI
            const remainingMonths = (originalData.years * 12) - prepayAfterMonths;
            if (balance <= 0) {
                newEMI = 0;
                newTenureMonths = 0;
                newTotalInterest = totalInterest;
            } else {
                newEMI = (balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
                        (Math.pow(1 + monthlyRate, remainingMonths) - 1);
                newTenureMonths = remainingMonths;
                
                // Calculate total interest for remaining months
                let tempBalance = balance;
                for (let i = 0; i < remainingMonths; i++) {
                    const interestPayment = tempBalance * monthlyRate;
                    const principalPayment = Math.min(newEMI - interestPayment, tempBalance);
                    totalInterest += interestPayment;
                    tempBalance -= principalPayment;
                    if (tempBalance <= 0) break;
                }
                newTotalInterest = totalInterest;
            }
        }
        
        const interestSaved = originalData.totalInterest - newTotalInterest;
        const totalNewTenureMonths = prepayAfterMonths + newTenureMonths;
        
        return {
            newEMI: newEMI,
            newTotalInterest: newTotalInterest,
            interestSaved: interestSaved,
            newTenureMonths: totalNewTenureMonths,
            newTenureText: this.formatTenure(totalNewTenureMonths),
            timeSaved: this.formatTenure((originalData.years * 12) - totalNewTenureMonths)
        };
    },
    
    formatTenure(months) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        if (years === 0) {
            return `${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
        } else if (remainingMonths === 0) {
            return `${years} Year${years !== 1 ? 's' : ''}`;
        } else {
            return `${years} Year${years !== 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
        }
    },
    
    updatePrepaymentResults(result) {
        const elements = {
            interestSaved: Utils.formatCurrency(result.interestSaved),
            originalEMI: Utils.formatCurrency(EMICalculator.currentEMIData.emi),
            originalInterest: Utils.formatCurrency(EMICalculator.currentEMIData.totalInterest),
            originalTenure: `${EMICalculator.currentEMIData.years} Years`,
            newEMI: Utils.formatCurrency(result.newEMI),
            newInterest: Utils.formatCurrency(result.newTotalInterest),
            newTenure: result.newTenureText,
            benefitValue: result.timeSaved
        };
        
        Object.keys(elements).forEach(id => {
            const element = Utils.getElement(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
        
        // Show results section
        const resultsSection = Utils.getElement('prepaymentResults');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Create comparison chart
        this.createPrepaymentChart(EMICalculator.currentEMIData, result);
    },
    
    createPrepaymentChart(originalData, prepaymentData) {
        const canvas = Utils.getElement('prepaymentChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        EMICalculator.charts.prepayment = ChartManager.destroyChart(EMICalculator.charts.prepayment);
        
        EMICalculator.charts.prepayment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Original Loan', 'With Prepayment'],
                datasets: [
                    {
                        label: 'Principal',
                        data: [originalData.principal, originalData.principal],
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Interest',
                        data: [originalData.totalInterest, prepaymentData.newTotalInterest],
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgba(139, 92, 246, 1)',
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
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Utils.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    },
    
    reset() {
        const inputs = ['prepaymentAmount', 'prepayAfterMonths'];
        inputs.forEach(inputId => {
            const input = Utils.getElement(inputId);
            if (input) {
                input.value = '';
            }
        });
        
        const resultsSection = Utils.getElement('prepaymentResults');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        EMICalculator.charts.prepayment = ChartManager.destroyChart(EMICalculator.charts.prepayment);
        
        NotificationSystem.show('Prepayment calculator reset!', 'info');
    }
};

// Loan Comparison Module
const LoanComparison = {
    loanCount: 0,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const loanCountSelect = Utils.getElement('loanCountSelect');
        if (loanCountSelect) {
            loanCountSelect.addEventListener('change', () => {
                this.generateLoanInputs();
            });
        }
        
        const compareBtn = Utils.getElement('compareLoans');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.compareLoans();
            });
        }
        
        const refreshBtn = Utils.getElement('refreshComparison');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    },
    
    generateLoanInputs() {
        const loanCountSelect = Utils.getElement('loanCountSelect');
        const inputsGrid = Utils.getElement('loanInputsGrid');
        
        if (!loanCountSelect || !inputsGrid) return;
        
        this.loanCount = parseInt(loanCountSelect.value);
        if (!this.loanCount) return;
        
        inputsGrid.innerHTML = '';
        
        for (let i = 1; i <= this.loanCount; i++) {
            const loanCard = this.createLoanInputCard(i);
            inputsGrid.appendChild(loanCard);
        }
    },
    
    createLoanInputCard(loanNumber) {
        const card = document.createElement('div');
        card.className = 'loan-input-card';
        card.innerHTML = `
            <div class="glass-card">
                <h4 class="loan-card-title">Loan Option ${loanNumber}</h4>
                <div class="input-group">
                    <label for="loanAmount${loanNumber}">Loan Amount</label>
                    <div class="input-wrapper">
                        <span class="currency">₹</span>
                        <input type="number" id="loanAmount${loanNumber}" class="calc-input" placeholder="Enter amount">
                    </div>
                </div>
                <div class="input-group">
                    <label for="interestRate${loanNumber}">Interest Rate (%)</label>
                    <input type="number" id="interestRate${loanNumber}" class="calc-input" placeholder="Enter rate" step="0.01">
                </div>
                <div class="input-group">
                    <label for="tenure${loanNumber}">Tenure (Years)</label>
                    <input type="number" id="tenure${loanNumber}" class="calc-input" placeholder="Enter years">
                </div>
            </div>
        `;
        return card;
    },
    
    compareLoans() {
        if (!this.loanCount) {
            NotificationSystem.show('Please select number of loans to compare!', 'error');
            return;
        }
        
        const loans = [];
        let allValid = true;
        
        for (let i = 1; i <= this.loanCount; i++) {
            const loanAmount = parseFloat(Utils.getElement(`loanAmount${i}`)?.value || 0);
            const interestRate = parseFloat(Utils.getElement(`interestRate${i}`)?.value || 0);
            const tenure = parseFloat(Utils.getElement(`tenure${i}`)?.value || 0);
            
            if (!loanAmount || !interestRate || !tenure) {
                NotificationSystem.show(`Please fill all fields for Loan ${i}!`, 'error');
                allValid = false;
                break;
            }
            
            const emi = Utils.calculateEMI(loanAmount, interestRate, tenure);
            const totalAmount = emi * tenure * 12;
            const totalInterest = totalAmount - loanAmount;
            
            loans.push({
                number: i,
                loanAmount,
                interestRate,
                tenure,
                emi,
                totalAmount,
                totalInterest
            });
        }
        
        if (!allValid) return;
        
        this.displayComparisonResults(loans);
        NotificationSystem.show('Loan comparison completed!', 'success');
    },
    
    displayComparisonResults(loans) {
        const tableBody = Utils.getElement('comparisonTableBody');
        const resultsSection = Utils.getElement('comparisonResults');
        
        if (!tableBody || !resultsSection) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Populate table
        loans.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Loan ${loan.number}</td>
                <td>${Utils.formatCurrency(loan.emi)}</td>
                <td>${Utils.formatCurrency(loan.totalInterest)}</td>
                <td>${Utils.formatCurrency(loan.totalAmount)}</td>
            `;
            tableBody.appendChild(row);
        });
        
        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Create comparison chart
        this.createComparisonChart(loans);
    },
    
    createComparisonChart(loans) {
        const canvas = Utils.getElement('loanComparisonChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        EMICalculator.charts.comparison = ChartManager.destroyChart(EMICalculator.charts.comparison);
        
        const labels = loans.map(loan => `Loan ${loan.number}`);
        const emiData = loans.map(loan => loan.emi);
        const interestData = loans.map(loan => loan.totalInterest);
        
        EMICalculator.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Monthly EMI',
                        data: emiData,
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Total Interest',
                        data: interestData,
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2,
                        yAxisID: 'y1'
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
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Utils.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    },
    
    reset() {
        const loanCountSelect = Utils.getElement('loanCountSelect');
        const inputsGrid = Utils.getElement('loanInputsGrid');
        const resultsSection = Utils.getElement('comparisonResults');
        
        if (loanCountSelect) loanCountSelect.value = '';
        if (inputsGrid) inputsGrid.innerHTML = '';
        if (resultsSection) resultsSection.style.display = 'none';
        
        EMICalculator.charts.comparison = ChartManager.destroyChart(EMICalculator.charts.comparison);
        
        this.loanCount = 0;
        NotificationSystem.show('Loan comparison reset!', 'info');
    }
};

// PDF Generator Module
const PDFGenerator = {
    generateEMIReport() {
        if (!EMICalculator.currentEMIData) {
            NotificationSystem.show('No EMI data to generate report!', 'error');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Header
            this.addHeader(doc, 'EMI Calculator Report');
            
            // Input summary
            let yPos = 70;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Loan Details:', 20, yPos);
            
            yPos += 20;
            doc.setFontSize(12);
            const data = EMICalculator.currentEMIData;
            
            doc.text(`Loan Amount: ${Utils.formatCurrency(data.principal)}`, 20, yPos);
            yPos += 15;
            doc.text(`Interest Rate: ${data.annualRate}% per annum`, 20, yPos);
            yPos += 15;
            doc.text(`Loan Tenure: ${data.years} years`, 20, yPos);
            
            yPos += 30;
            doc.setFontSize(14);
            doc.text('EMI Calculation Results:', 20, yPos);
            
            yPos += 20;
            doc.setFontSize(12);
            doc.text(`Monthly EMI: ${Utils.formatCurrency(data.emi)}`, 20, yPos);
            yPos += 15;
            doc.text(`Total Interest: ${Utils.formatCurrency(data.totalInterest)}`, 20, yPos);
            yPos += 15;
            doc.text(`Total Amount Payable: ${Utils.formatCurrency(data.totalAmount)}`, 20, yPos);
            
            // Footer
            this.addFooter(doc);
            
            doc.save('emi-calculator-report.pdf');
            NotificationSystem.show('EMI report downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            NotificationSystem.show('Error generating PDF report', 'error');
        }
    },
    
    generatePrepaymentReport() {
        // Implementation for prepayment report
        NotificationSystem.show('Prepayment report generation coming soon!', 'info');
    },
    
    addHeader(doc, title) {
        // Logo placeholder
        doc.setFillColor(49, 65, 127);
        doc.rect(20, 15, 40, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('PRATIX', 25, 30);
        doc.text('FINANCE', 25, 37);
        
        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(title, 70, 30);
        
        // Date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 70, 40);
        
        // Line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 50, 190, 50);
    },
    
    addFooter(doc) {
        const pageHeight = doc.internal.pageSize.height;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, pageHeight - 30, 190, pageHeight - 30);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('© 2025 Pratix Finance | Professional Financial Calculators', 20, pageHeight - 15);
        doc.text('https://pratix-finance.vercel.app/', 20, pageHeight - 8);
    }
};

// Smart Features Module
const SmartFeatures = {
    init() {
        this.setupSaveLoadFeatures();
        this.setupCalculationHistory();
    },
    
    setupSaveLoadFeatures() {
        const saveBtn = Utils.getElement('saveLoanPlan');
        const loadBtn = Utils.getElement('loadLoanPlan');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveLoanPlan();
            });
        }
        
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadLoanPlan();
            });
        }
    },
    
    setupCalculationHistory() {
        this.displayCalculationHistory();
    },
    
    saveLoanPlan() {
        if (!EMICalculator.currentEMIData) {
            NotificationSystem.show('No loan data to save!', 'error');
            return;
        }
        
        const planName = prompt('Enter a name for this loan plan:');
        if (!planName) return;
        
        try {
            const savedPlans = JSON.parse(localStorage.getItem('emi_saved_plans') || '[]');
            
            const newPlan = {
                id: Utils.generateId(),
                name: planName,
                data: EMICalculator.currentEMIData,
                savedAt: new Date().toISOString()
            };
            
            savedPlans.push(newPlan);
            localStorage.setItem('emi_saved_plans', JSON.stringify(savedPlans));
            
            NotificationSystem.show(`Loan plan "${planName}" saved successfully!`, 'success');
            this.displaySavedPlans();
            
        } catch (error) {
            console.error('Error saving plan:', error);
            NotificationSystem.show('Error saving loan plan', 'error');
        }
    },
    
    loadLoanPlan() {
        this.displaySavedPlans();
    },
    
    displaySavedPlans() {
        try {
            const savedPlans = JSON.parse(localStorage.getItem('emi_saved_plans') || '[]');
            
            if (savedPlans.length === 0) {
                NotificationSystem.show('No saved plans found!', 'info');
                return;
            }
            
            // Create modal to display plans
            this.showSavedPlansModal(savedPlans);
            
        } catch (error) {
            console.error('Error loading plans:', error);
            NotificationSystem.show('Error loading saved plans', 'error');
        }
    },
    
    showSavedPlansModal(plans) {
        // Simple modal implementation
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1e293b, #334155);
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
            color: white;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 1rem;">Saved Loan Plans</h3>
            ${plans.map(plan => `
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; cursor: pointer;" onclick="EMICalculator.SmartFeatures.loadPlan('${plan.id}')">
                    <h4>${plan.name}</h4>
                    <p>Saved: ${new Date(plan.savedAt).toLocaleDateString()}</p>
                    <p>Amount: ${Utils.formatCurrency(plan.data.principal)}</p>
                </div>
            `).join('')}
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" style="background: #ff4757; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    },
    
    loadPlan(planId) {
        try {
            const savedPlans = JSON.parse(localStorage.getItem('emi_saved_plans') || '[]');
            const plan = savedPlans.find(p => p.id === planId);
            
            if (!plan) {
                NotificationSystem.show('Plan not found!', 'error');
                return;
            }
            
            // Load plan data
            const data = plan.data;
            
            // Update form inputs
            const loanAmountInput = Utils.getElement('loanAmountInput');
            const interestRateInput = Utils.getElement('interestRateInput');
            const loanTenureInput = Utils.getElement('loanTenureInput');
            
            if (loanAmountInput) loanAmountInput.value = data.principal;
            if (interestRateInput) interestRateInput.value = data.annualRate;
            if (loanTenureInput) loanTenureInput.value = data.years;
            
            // Switch to main calculator tab
            TabManager.switchToTab('emi-calculator');
            
            // Calculate EMI
            EMICalculatorCore.calculateEMI(false);
            
            // Close modal
            const modal = document.querySelector('[style*="position: fixed"]');
            if (modal) modal.remove();
            
            NotificationSystem.show(`Loan plan "${plan.name}" loaded successfully!`, 'success');
            
        } catch (error) {
            console.error('Error loading plan:', error);
            NotificationSystem.show('Error loading loan plan', 'error');
        }
    },
    
    displayCalculationHistory() {
        const historyContainer = Utils.getElement('calculationHistory');
        if (!historyContainer) return;
        
        try {
            const history = JSON.parse(localStorage.getItem('emi_calculation_history') || '[]');
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<p>No calculation history found.</p>';
                return;
            }
            
            historyContainer.innerHTML = history.slice(-5).map(calc => `
                <div class="history-item">
                    <h4>${Utils.formatCurrency(calc.principal)} @ ${calc.annualRate}%</h4>
                    <p>EMI: ${Utils.formatCurrency(calc.emi)}</p>
                    <p>Date: ${new Date(calc.timestamp).toLocaleDateString()}</p>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error displaying history:', error);
        }
    }
};

// Navigation Functions
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

window.goToSipCalculator = function() {
    window.location.href = 'sip-calculator.html';
};

window.goToTaxCalculator = function() {
    window.location.href = 'tax-calculator.html';
};

window.goToGstCalculator = function() {
    window.location.href = 'gst-calculator.html';
};

window.goToFdCalculator = function() {
    window.location.href = 'fd-calculator.html';
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('PRATIX FINANCE - EMI Calculator v2.0 Loading...');
        
        // Initialize notification system
        NotificationSystem.init();
        
        // Initialize tab management
        TabManager.init();
        
        // Initialize EMI calculator
        EMICalculatorCore.init();
        
        // Initialize other modules
        PrepaymentCalculator.init();
        LoanComparison.init();
        SmartFeatures.init();
        
        // Load saved active tab
        const savedTab = localStorage.getItem('emi_calculator_active_tab');
        if (savedTab) {
            TabManager.switchToTab(savedTab);
        }
        
        console.log('EMI Calculator initialized successfully!');
        
        // Show welcome notification
        setTimeout(() => {
            NotificationSystem.show('Welcome to PRATIX FINANCE - Professional EMI Calculator!', 'success', 3000);
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing EMI Calculator:', error);
        NotificationSystem.show('Error initializing calculator. Please refresh the page.', 'error');
    }
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    NotificationSystem.show('An unexpected error occurred. Please try again.', 'error');
});

// Expose EMICalculator for debugging and external access
window.EMICalculator = EMICalculator;
window.EMICalculator.SmartFeatures = SmartFeatures;
