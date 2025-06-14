
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
        document.querySelector('.main-content').scrollTop = 0;
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
        
        // Sync sliders with inputs
        if (loanAmountSlider && loanAmountInput) {
            loanAmountSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                loanAmountInput.value = value;
                loanAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                calculateEMI();
            });
            
            loanAmountInput.addEventListener('input', function() {
                const value = parseInt(this.value) || 1000000;
                loanAmountSlider.value = value;
                loanAmountDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
                calculateEMI();
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
                const value = parseFloat(this.value) || 8.5;
                interestRateSlider.value = value;
                interestRateDisplay.textContent = `${value}%`;
                calculateEMI();
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
                const value = parseInt(this.value) || 20;
                loanTenureSlider.value = value;
                loanTenureDisplay.textContent = `${value} Year${value > 1 ? 's' : ''}`;
                calculateEMI();
            });
        }
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                this.classList.add('loading');
                this.querySelector('.btn-text').textContent = 'Calculating...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.querySelector('.btn-text').textContent = 'Calculate EMI';
                    calculateEMI();
                    showNotification('EMI calculated successfully!', 'success');
                }, 800);
            });
        }
        
        // Initial calculation
        calculateEMI();
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
        
        // Update display - check if elements exist
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
    
    function updateChart(principal, interest) {
        if (emiChart) {
            emiChart.data.datasets[0].data = [principal, Math.round(interest)];
            emiChart.update('active');
        }
    }
    
    // Initialize EMI Calculator when DOM is loaded
    if (document.getElementById('emi-calculator')) {
        initEMICalculator();
    }
    
    // Settings functionality
    function initSettings() {
        // Load saved settings
        loadSettings();
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkMode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', function() {
                const isDarkMode = this.checked;
                localStorage.setItem('darkMode', isDarkMode);
                
                // Apply theme changes
                applyTheme(isDarkMode);
                
                showNotification(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled', 'info');
            });
        }
        
        // Currency selector
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.addEventListener('change', function() {
                const selectedCurrency = this.value;
                localStorage.setItem('preferredCurrency', selectedCurrency);
                
                // Update currency symbols throughout the app
                updateCurrencyDisplay(selectedCurrency);
                
                showNotification(`Currency changed to ${this.options[this.selectedIndex].text}`, 'success');
            });
        }
        
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                const selectedLanguage = this.value;
                localStorage.setItem('preferredLanguage', selectedLanguage);
                
                // Apply language changes
                applyLanguage(selectedLanguage);
                
                showNotification(selectedLanguage === 'hi' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English', 'success');
            });
        }
        
        // App settings buttons
        const configureNotificationsBtn = document.getElementById('configureNotifications');
        if (configureNotificationsBtn) {
            configureNotificationsBtn.addEventListener('click', function() {
                openNotificationSettings();
            });
        }
        
        const exportDataBtn = document.getElementById('exportData');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', function() {
                exportAppData();
            });
        }
        
        const resetAppBtn = document.getElementById('resetApp');
        if (resetAppBtn) {
            resetAppBtn.addEventListener('click', function() {
                resetAppData();
            });
        }
        
        // Support links
        const aboutLink = document.getElementById('aboutLink');
        if (aboutLink) {
            aboutLink.addEventListener('click', function(e) {
                e.preventDefault();
                showAboutModal();
            });
        }
        
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', function(e) {
                e.preventDefault();
                showHelpModal();
            });
        }
        
        const feedbackLink = document.getElementById('feedbackLink');
        if (feedbackLink) {
            feedbackLink.addEventListener('click', function(e) {
                e.preventDefault();
                openFeedbackForm();
            });
        }
        
        const privacyLink = document.getElementById('privacyLink');
        if (privacyLink) {
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                showPrivacyPolicy();
            });
        }
    }
    
    function loadSettings() {
        // Load dark mode setting
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const darkModeToggle = document.getElementById('darkMode');
            if (darkModeToggle) {
                darkModeToggle.checked = savedDarkMode === 'true';
                applyTheme(savedDarkMode === 'true');
            }
        }
        
        // Load currency setting
        const savedCurrency = localStorage.getItem('preferredCurrency');
        if (savedCurrency) {
            const currencySelect = document.getElementById('currencySelect');
            if (currencySelect) {
                currencySelect.value = savedCurrency;
                updateCurrencyDisplay(savedCurrency);
            }
        }
        
        // Load language setting
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                languageSelect.value = savedLanguage;
                applyLanguage(savedLanguage);
            }
        }
    }
    
    function applyTheme(isDarkMode) {
        // This would apply theme changes to CSS variables
        const root = document.documentElement;
        
        if (!isDarkMode) {
            // Light mode colors
            root.style.setProperty('--dark-gradient', 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)');
            root.style.setProperty('--text-primary', '#2c3e50');
            root.style.setProperty('--text-secondary', 'rgba(44, 62, 80, 0.8)');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.8)');
        } else {
            // Dark mode colors (default)
            root.style.setProperty('--dark-gradient', 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
        }
    }
    
    function updateCurrencyDisplay(currency) {
        const currencySymbols = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€'
        };
        
        const symbol = currencySymbols[currency] || '₹';
        
        // Update all currency symbols in the app
        const currencyElements = document.querySelectorAll('.currency');
        currencyElements.forEach(element => {
            element.textContent = symbol;
        });
        
        // Also update any displayed values with currency formatting
        const resultValues = document.querySelectorAll('.result-value');
        resultValues.forEach(element => {
            const text = element.textContent;
            if (text.includes('₹') || text.includes('$') || text.includes('€')) {
                // Replace the currency symbol but keep the rest
                element.textContent = text.replace(/[₹$€]/, symbol);
            }
        });
    }
    
    function applyLanguage(language) {
        if (language === 'hi') {
            // Apply Hindi translations (basic implementation)
            const translations = {
                'FinCalc Pro': 'फिनकैल्क प्रो',
                'EMI Calculator': 'ईएमआई कैलकुलेटर',
                'Loan Amount': 'लोन राशि',
                'Interest Rate': 'ब्याज दर',
                'Loan Tenure': 'लोन अवधि',
                'Calculate EMI': 'ईएमआई गणना करें',
                'Monthly EMI': 'मासिक ईएमआई',
                'Total Interest': 'कुल ब्याज',
                'Total Amount': 'कुल राशि'
            };
            
            // Apply translations to specific elements
            Object.keys(translations).forEach(english => {
                const elements = document.querySelectorAll(`[data-translate="${english}"]`);
                elements.forEach(element => {
                    element.textContent = translations[english];
                });
            });
        } else {
            // Revert to English - would need to store original values
            // For now, just reload to reset
        }
    }
    
    function openNotificationSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Notification Settings</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-list">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>EMI Reminders</h4>
                                <p>Get reminded about upcoming EMI payments</p>
                            </div>
                            <div class="toggle-switch">
                                <input type="checkbox" id="emiReminders" checked>
                                <label for="emiReminders"></label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Rate Alerts</h4>
                                <p>Notify when interest rates change</p>
                            </div>
                            <div class="toggle-switch">
                                <input type="checkbox" id="rateAlerts">
                                <label for="rateAlerts"></label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>App Updates</h4>
                                <p>Get notified about new features</p>
                            </div>
                            <div class="toggle-switch">
                                <input type="checkbox" id="appUpdates" checked>
                                <label for="appUpdates"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function exportAppData() {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const settings = {
            darkMode: localStorage.getItem('darkMode'),
            currency: localStorage.getItem('preferredCurrency'),
            language: localStorage.getItem('preferredLanguage')
        };
        
        const exportData = {
            savedPlans,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fincalc-data-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showNotification('App data exported successfully!', 'success');
    }
    
    function resetAppData() {
        if (confirm('Are you sure you want to reset all app data? This action cannot be undone.')) {
            localStorage.clear();
            showNotification('App data reset successfully! Refreshing...', 'info');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }
    
    function showAboutModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>About FinCalc Pro</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="about-content">
                        <div class="app-logo">💰</div>
                        <h4>FinCalc Pro v1.0.0</h4>
                        <p>Your comprehensive financial calculator and planning companion.</p>
                        
                        <div class="features-list">
                            <h5>Key Features:</h5>
                            <ul>
                                <li>✅ EMI Calculator with detailed breakdown</li>
                                <li>📊 Amortization schedule visualization</li>
                                <li>⚡ Prepayment impact analysis</li>
                                <li>⚖️ Multi-loan comparison tool</li>
                                <li>🔧 Advanced financial tools</li>
                                <li>💾 Smart plan saving & sharing</li>
                            </ul>
                        </div>
                        
                        <div class="developer-info">
                            <p><strong>Developed with ❤️ for smart financial planning</strong></p>
                            <p>Built using modern web technologies for optimal performance.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function showHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Help & Tutorials</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        <div class="help-section">
                            <h4>🧮 EMI Calculator</h4>
                            <p>Enter your loan amount, interest rate, and tenure to calculate your monthly EMI. The breakdown shows principal vs interest components.</p>
                        </div>
                        
                        <div class="help-section">
                            <h4>📋 Prepayment Impact</h4>
                            <p>See how prepaying your loan affects your tenure or EMI. Choose between reducing loan tenure or monthly payments.</p>
                        </div>
                        
                        <div class="help-section">
                            <h4>⚖️ Loan Comparison</h4>
                            <p>Compare up to 3 different loan options side by side. The best option (lowest total cost) is highlighted in green.</p>
                        </div>
                        
                        <div class="help-section">
                            <h4>💾 Saving Plans</h4>
                            <p>Save your calculations for future reference. Plans are stored locally and can be shared with others.</p>
                        </div>
                        
                        <div class="help-section">
                            <h4>🔧 Advanced Tools</h4>
                            <p>Use specialized calculators for loan eligibility, reverse EMI calculation, and investment comparisons.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function openFeedbackForm() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Send Feedback</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="feedback-form">
                        <div class="input-group">
                            <label>Feedback Type</label>
                            <select class="calc-input">
                                <option>Bug Report</option>
                                <option>Feature Request</option>
                                <option>General Feedback</option>
                                <option>Suggestion</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <label>Your Message</label>
                            <textarea class="calc-input" rows="5" placeholder="Tell us what you think..."></textarea>
                        </div>
                        
                        <div class="input-group">
                            <label>Email (Optional)</label>
                            <input type="email" class="calc-input" placeholder="your@email.com">
                        </div>
                        
                        <button class="calculate-btn" onclick="submitFeedback()">Send Feedback</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function submitFeedback() {
        showNotification('Thank you for your feedback! We appreciate your input.', 'success');
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
    
    function showPrivacyPolicy() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Privacy Policy</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="privacy-content">
                        <h4>Data Collection</h4>
                        <p>FinCalc Pro stores your calculation data locally on your device using browser localStorage. We do not collect or transmit any personal financial information to external servers.</p>
                        
                        <h4>Local Storage</h4>
                        <p>Your saved loan plans, preferences, and settings are stored locally in your browser. This data remains on your device and is not shared with third parties.</p>
                        
                        <h4>No Third-Party Tracking</h4>
                        <p>We do not use cookies for tracking purposes or share data with advertising networks. Your privacy is our priority.</p>
                        
                        <h4>Data Security</h4>
                        <p>All calculations are performed locally in your browser. No financial data is transmitted over the internet during normal usage.</p>
                        
                        <h4>Data Export</h4>
                        <p>You can export your data at any time from the Settings page. You have full control over your information.</p>
                        
                        <p><small>Last updated: ${new Date().toLocaleDateString()}</small></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Make submitFeedback globally available
    window.submitFeedback = submitFeedback;
    
    // Initialize settings when DOM is loaded
    initSettings();
    
    // Feature buttons
    const featureBtns = document.querySelectorAll('.feature-btn');
    featureBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const featureName = this.previousElementSibling.textContent;
            showNotification(`${featureName} coming soon!`, 'info');
        });
    });
    
    // Setting buttons
    const settingBtns = document.querySelectorAll('.setting-btn');
    settingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent;
            showNotification(`${action} functionality coming soon!`, 'info');
        });
    });
    
    // Tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolName = this.querySelector('h3').textContent;
            showNotification(`${toolName} opening soon!`, 'info');
        });
    });
    
    // Form inputs - Add real-time formatting and validation
    function formatNumberInput(input) {
        if (!input) return;
        
        input.addEventListener('input', function() {
            let value = this.value.replace(/,/g, '');
            if (!isNaN(value) && value !== '') {
                const numValue = parseInt(value);
                // Validate min/max values
                const min = parseInt(this.getAttribute('min')) || 0;
                const max = parseInt(this.getAttribute('max')) || Infinity;
                
                if (numValue < min) {
                    this.value = min;
                } else if (numValue > max) {
                    this.value = max;
                } else {
                    this.value = numValue;
                }
            }
        });
        
        input.addEventListener('blur', function() {
            // Ensure value is within range on blur
            const value = parseInt(this.value) || parseInt(this.getAttribute('min')) || 0;
            const min = parseInt(this.getAttribute('min')) || 0;
            const max = parseInt(this.getAttribute('max')) || Infinity;
            
            if (value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            }
        });
    }

    // Apply formatting to all number inputs
    document.querySelectorAll('input[type="number"]').forEach(formatNumberInput);
    
    // Prepayment Calculator functionality
    let prepaymentChart = null;
    
    function initPrepaymentCalculator() {
        const calculateBtn = document.getElementById('calculatePrepayment');
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                this.classList.add('loading');
                this.textContent = 'Analyzing...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = 'Calculate Impact';
                    calculatePrepaymentImpact();
                    showNotification('Prepayment impact calculated!', 'success');
                }, 1200);
            });
        }
    }
    
    function calculatePrepaymentImpact() {
        // Get current loan details from EMI calculator
        const principal = parseInt(document.getElementById('loanAmountInput')?.value) || 1000000;
        const annualRate = parseFloat(document.getElementById('interestRateInput')?.value) || 8.5;
        const years = parseInt(document.getElementById('loanTenureInput')?.value) || 20;
        
        // Get prepayment details
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
            
            newTotalInterest = interestPaidSoFar + prepaymentAmount + (newEMI * newTenure) - principal;
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
            
            newTotalInterest = interestPaidSoFar + prepaymentAmount + (newEMI * newTenure) - principal;
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
        
        // Update chart
        updatePrepaymentChart(originalTotalInterest, newTotalInterest, principal);
    }
    
    function updatePrepaymentChart(originalInterest, newInterest, principal) {
        const ctx = document.getElementById('prepaymentChart');
        if (!ctx) return;
        
        if (prepaymentChart) {
            prepaymentChart.destroy();
        }
        
        prepaymentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Original Loan', 'With Prepayment'],
                datasets: [
                    {
                        label: 'Principal',
                        data: [principal, principal],
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: 'rgba(0, 212, 255, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Interest',
                        data: [originalInterest, newInterest],
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
                        stacked: true,
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
    
    // Initialize prepayment calculator
    if (document.getElementById('prepayment-impact')) {
        initPrepaymentCalculator();
    }
    
    // Loan Comparison functionality
    let loanComparisonChart = null;
    
    function initLoanComparison() {
        const compareBtn = document.getElementById('compareLoans');
        
        if (compareBtn) {
            compareBtn.addEventListener('click', function() {
                this.classList.add('loading');
                this.textContent = 'Comparing...';
                
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = 'Compare Loans';
                    calculateLoanComparison();
                    showNotification('Loan comparison completed!', 'success');
                }, 1000);
            });
        }
        
        // Add real-time calculation on input change
        const loanInputs = [
            'loan1Amount', 'loan1Rate', 'loan1Tenure',
            'loan2Amount', 'loan2Rate', 'loan2Tenure',
            'loan3Amount', 'loan3Rate', 'loan3Tenure'
        ];
        
        loanInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', debounce(calculateLoanComparison, 500));
            }
        });
    }
    
    function calculateLoanComparison() {
        const loans = [];
        
        // Collect loan data
        for (let i = 1; i <= 3; i++) {
            const amount = parseFloat(document.getElementById(`loan${i}Amount`)?.value) || 0;
            const rate = parseFloat(document.getElementById(`loan${i}Rate`)?.value) || 0;
            const tenure = parseFloat(document.getElementById(`loan${i}Tenure`)?.value) || 0;
            
            if (amount > 0 && rate > 0 && tenure > 0) {
                const monthlyRate = rate / 12 / 100;
                const totalMonths = tenure * 12;
                
                // EMI Calculation
                const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                           (Math.pow(1 + monthlyRate, totalMonths) - 1);
                
                const totalRepayment = emi * totalMonths;
                const totalInterest = totalRepayment - amount;
                
                loans.push({
                    id: i,
                    name: `Loan Option ${i}`,
                    amount: amount,
                    rate: rate,
                    tenure: tenure,
                    emi: emi,
                    totalInterest: totalInterest,
                    totalRepayment: totalRepayment
                });
            }
        }
        
        if (loans.length === 0) {
            document.getElementById('comparisonResults').style.display = 'none';
            return;
        }
        
        // Find best loan (lowest total repayment)
        const bestLoan = loans.reduce((best, current) => 
            current.totalRepayment < best.totalRepayment ? current : best
        );
        
        // Update table
        updateComparisonTable(loans, bestLoan.id);
        
        // Update chart
        updateLoanComparisonChart(loans, bestLoan.id);
        
        // Show results
        document.getElementById('comparisonResults').style.display = 'block';
    }
    
    function updateComparisonTable(loans, bestLoanId) {
        const tableBody = document.getElementById('comparisonTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        loans.forEach(loan => {
            const row = document.createElement('tr');
            const isBest = loan.id === bestLoanId;
            
            if (isBest) {
                row.classList.add('best-loan');
            }
            
            row.innerHTML = `
                <td>
                    ${loan.name}
                    ${isBest ? '<div class="best-loan-indicator">Best Option</div>' : ''}
                </td>
                <td>₹${Math.round(loan.emi).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(loan.totalInterest).toLocaleString('en-IN')}</td>
                <td>₹${Math.round(loan.totalRepayment).toLocaleString('en-IN')}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function updateLoanComparisonChart(loans, bestLoanId) {
        const ctx = document.getElementById('loanComparisonChart');
        if (!ctx) return;
        
        if (loanComparisonChart) {
            loanComparisonChart.destroy();
        }
        
        const labels = loans.map(loan => loan.name);
        const emiData = loans.map(loan => Math.round(loan.emi));
        const interestData = loans.map(loan => Math.round(loan.totalInterest));
        const totalData = loans.map(loan => Math.round(loan.totalRepayment));
        
        // Create background colors - highlight best loan
        const backgroundColors = loans.map(loan => 
            loan.id === bestLoanId ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 212, 255, 0.8)'
        );
        const borderColors = loans.map(loan => 
            loan.id === bestLoanId ? 'rgba(0, 255, 136, 1)' : 'rgba(0, 212, 255, 1)'
        );
        
        loanComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Monthly EMI',
                        data: emiData,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 2
                    },
                    {
                        label: 'Total Interest',
                        data: interestData,
                        backgroundColor: loans.map(loan => 
                            loan.id === bestLoanId ? 'rgba(240, 147, 251, 0.8)' : 'rgba(240, 147, 251, 0.6)'
                        ),
                        borderColor: loans.map(loan => 
                            loan.id === bestLoanId ? 'rgba(240, 147, 251, 1)' : 'rgba(240, 147, 251, 0.8)'
                        ),
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
                            },
                            afterLabel: function(context) {
                                const loanIndex = context.dataIndex;
                                if (loans[loanIndex] && loans[loanIndex].id === bestLoanId) {
                                    return '⭐ Best Option';
                                }
                                return '';
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
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Initialize loan comparison
    if (document.getElementById('loan-comparison')) {
        initLoanComparison();
    }
    
    // Smooth scrolling for better UX
    function smoothScrollTo(element, duration = 300) {
        const start = element.scrollTop;
        const startTime = performance.now();
        
        function scrollAnimation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.scrollTop = start * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(scrollAnimation);
            }
        }
        
        requestAnimationFrame(scrollAnimation);
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add notification styles
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
        
        // Add type-specific styling
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
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
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
        
        // Manual close button
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
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translate(-50%, -100%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        
        @keyframes slideOutUp {
            from {
                opacity: 1;
                transform: translate(-50%, 0);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -100%);
            }
        }
        
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        
        .notification-message {
            font-weight: 500;
            font-size: 0.875rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: color 0.2s ease;
        }
        
        .notification-close:hover {
            color: white;
        }
    `;
    document.head.appendChild(style);
    
    // Add haptic feedback for mobile devices
    function addHapticFeedback(element) {
        element.addEventListener('click', function() {
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        });
    }
    
    // Add haptic feedback to interactive elements
    navItems.forEach(addHapticFeedback);
    document.querySelectorAll('.calculate-btn, .feature-btn, .setting-btn, .tool-card').forEach(addHapticFeedback);
    
    // Add touch gesture support for tab switching
    let touchStartX = 0;
    let touchEndX = 0;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        mainContent.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 100;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                const currentActiveTab = document.querySelector('.nav-item.active');
                if (currentActiveTab) {
                    const currentIndex = Array.from(navItems).indexOf(currentActiveTab);
                    let newIndex;
                    
                    if (diff > 0 && currentIndex < navItems.length - 1) {
                        // Swipe left - next tab
                        newIndex = currentIndex + 1;
                    } else if (diff < 0 && currentIndex > 0) {
                        // Swipe right - previous tab
                        newIndex = currentIndex - 1;
                    }
                    
                    if (newIndex !== undefined) {
                        const targetTab = navItems[newIndex].getAttribute('data-tab');
                        switchTab(targetTab);
                        navigator.vibrate && navigator.vibrate(30);
                    }
                }
            }
        }
    }
    
    // Tools & Extras functionality
    function initToolsExtras() {
        // Collapsible tool sections
        const toolHeaders = document.querySelectorAll('.tool-header');
        
        toolHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const toolName = this.getAttribute('data-tool');
                const content = document.getElementById(`${toolName}-content`);
                const expandIcon = this.querySelector('.expand-icon');
                
                if (content.classList.contains('expanded')) {
                    content.classList.remove('expanded');
                    this.classList.remove('expanded');
                } else {
                    // Close all other expanded sections
                    document.querySelectorAll('.tool-content').forEach(c => c.classList.remove('expanded'));
                    document.querySelectorAll('.tool-header').forEach(h => h.classList.remove('expanded'));
                    
                    // Open this section
                    content.classList.add('expanded');
                    this.classList.add('expanded');
                }
            });
        });
        
        // Loan Eligibility Checker
        const checkEligibilityBtn = document.getElementById('checkEligibility');
        if (checkEligibilityBtn) {
            checkEligibilityBtn.addEventListener('click', function() {
                const income = parseFloat(document.getElementById('monthlyIncome')?.value) || 50000;
                const age = parseInt(document.getElementById('applicantAge')?.value) || 30;
                const currentEMIs = parseFloat(document.getElementById('currentEMIs')?.value) || 0;
                
                // FOIR calculation (typically 40-50% of income)
                const maxEMI = (income * 0.4) - currentEMIs;
                const interestRate = 8.5 / 12 / 100; // Monthly rate
                const tenure = (65 - age) * 12; // Till retirement age
                
                // Calculate eligible loan amount
                const eligibleAmount = maxEMI * (Math.pow(1 + interestRate, tenure) - 1) / 
                                     (interestRate * Math.pow(1 + interestRate, tenure));
                
                const foir = ((currentEMIs + maxEMI) / income * 100);
                
                const eligibleAmountEl = document.getElementById('eligibleAmount');
                const foirRatioEl = document.getElementById('foirRatio');
                
                if (eligibleAmountEl) {
                    eligibleAmountEl.textContent = `₹${Math.round(eligibleAmount).toLocaleString('en-IN')}`;
                }
                if (foirRatioEl) {
                    foirRatioEl.textContent = `${foir.toFixed(1)}%`;
                }
                
                document.getElementById('eligibilityResult').style.display = 'block';
                showNotification('Eligibility calculated!', 'success');
            });
        }
        
        // Reverse EMI Calculator
        const calculateReverseLoanBtn = document.getElementById('calculateReverseLoan');
        if (calculateReverseLoanBtn) {
            calculateReverseLoanBtn.addEventListener('click', function() {
                const emi = parseFloat(document.getElementById('desiredEMI')?.value) || 50000;
                const rate = parseFloat(document.getElementById('reverseInterestRate')?.value) || 8.5;
                const tenure = parseInt(document.getElementById('reverseTenure')?.value) || 20;
                
                const monthlyRate = rate / 12 / 100;
                const totalMonths = tenure * 12;
                
                // Calculate loan amount from EMI
                const loanAmount = emi * (Math.pow(1 + monthlyRate, totalMonths) - 1) / 
                                 (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
                
                const totalAmount = emi * totalMonths;
                const totalInterest = totalAmount - loanAmount;
                
                const maxLoanAmountEl = document.getElementById('maxLoanAmount');
                const reverseTotalInterestEl = document.getElementById('reverseTotalInterest');
                
                if (maxLoanAmountEl) {
                    maxLoanAmountEl.textContent = `₹${Math.round(loanAmount).toLocaleString('en-IN')}`;
                }
                if (reverseTotalInterestEl) {
                    reverseTotalInterestEl.textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
                }
                
                document.getElementById('reverseLoanResult').style.display = 'block';
                showNotification('Loan amount calculated!', 'success');
            });
        }
        
        // GST + Processing Fee Calculator
        const calculateGSTImpactBtn = document.getElementById('calculateGSTImpact');
        if (calculateGSTImpactBtn) {
            calculateGSTImpactBtn.addEventListener('click', function() {
                const loanAmount = parseFloat(document.getElementById('gstLoanAmount')?.value) || 1000000;
                const processingFeeRate = parseFloat(document.getElementById('processingFee')?.value) || 1;
                const gstRate = parseFloat(document.getElementById('gstRate')?.value) || 18;
                
                const processingFeeAmount = loanAmount * (processingFeeRate / 100);
                const gstAmount = processingFeeAmount * (gstRate / 100);
                const totalUpfront = processingFeeAmount + gstAmount;
                
                const processingFeeAmountEl = document.getElementById('processingFeeAmount');
                const gstAmountEl = document.getElementById('gstAmount');
                const totalUpfrontCostEl = document.getElementById('totalUpfrontCost');
                
                if (processingFeeAmountEl) {
                    processingFeeAmountEl.textContent = `₹${Math.round(processingFeeAmount).toLocaleString('en-IN')}`;
                }
                if (gstAmountEl) {
                    gstAmountEl.textContent = `₹${Math.round(gstAmount).toLocaleString('en-IN')}`;
                }
                if (totalUpfrontCostEl) {
                    totalUpfrontCostEl.textContent = `₹${Math.round(totalUpfront).toLocaleString('en-IN')}`;
                }
                
                document.getElementById('gstImpactResult').style.display = 'block';
                showNotification('Fee impact calculated!', 'success');
            });
        }
        
        // SIP vs EMI Comparison
        const compareSIPEMIBtn = document.getElementById('compareSIPEMI');
        if (compareSIPEMIBtn) {
            compareSIPEMIBtn.addEventListener('click', function() {
                const monthlyAmount = parseFloat(document.getElementById('monthlyAmount')?.value) || 50000;
                const sipReturns = parseFloat(document.getElementById('sipReturns')?.value) || 12;
                const loanRate = parseFloat(document.getElementById('loanRate')?.value) || 8.5;
                const years = parseInt(document.getElementById('timePeriod')?.value) || 20;
                
                const months = years * 12;
                const sipMonthlyRate = sipReturns / 12 / 100;
                
                // SIP Calculation
                const sipMaturityValue = monthlyAmount * (Math.pow(1 + sipMonthlyRate, months) - 1) / sipMonthlyRate;
                const sipInvested = monthlyAmount * months;
                const sipWealth = sipMaturityValue - sipInvested;
                
                // EMI Calculation (reverse calculation to find loan amount)
                const loanMonthlyRate = loanRate / 12 / 100;
                const principalAmount = monthlyAmount * (Math.pow(1 + loanMonthlyRate, months) - 1) / 
                                      (loanMonthlyRate * Math.pow(1 + loanMonthlyRate, months));
                const totalEMI = monthlyAmount * months;
                const totalInterest = totalEMI - principalAmount;
                
                // Update SIP results
                const sipInvestedEl = document.getElementById('sipInvested');
                const sipMaturityEl = document.getElementById('sipMaturity');
                const sipWealthEl = document.getElementById('sipWealth');
                
                if (sipInvestedEl) sipInvestedEl.textContent = `₹${Math.round(sipInvested).toLocaleString('en-IN')}`;
                if (sipMaturityEl) sipMaturityEl.textContent = `₹${Math.round(sipMaturityValue).toLocaleString('en-IN')}`;
                if (sipWealthEl) sipWealthEl.textContent = `₹${Math.round(sipWealth).toLocaleString('en-IN')}`;
                
                // Update EMI results
                const totalEMIPaidEl = document.getElementById('totalEMIPaid');
                const principalPaidEl = document.getElementById('principalPaid');
                const interestPaidEl = document.getElementById('interestPaid');
                
                if (totalEMIPaidEl) totalEMIPaidEl.textContent = `₹${Math.round(totalEMI).toLocaleString('en-IN')}`;
                if (principalPaidEl) principalPaidEl.textContent = `₹${Math.round(principalAmount).toLocaleString('en-IN')}`;
                if (interestPaidEl) interestPaidEl.textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
                
                // Comparison verdict
                const difference = sipWealth - totalInterest;
                const comparisonVerdictEl = document.getElementById('comparisonVerdict');
                
                if (comparisonVerdictEl) {
                    if (difference > 0) {
                        comparisonVerdictEl.textContent = `SIP investment creates ₹${Math.round(difference).toLocaleString('en-IN')} more wealth than loan payment`;
                        comparisonVerdictEl.style.color = 'var(--success-color)';
                    } else {
                        comparisonVerdictEl.textContent = `Loan payment saves ₹${Math.round(Math.abs(difference)).toLocaleString('en-IN')} compared to SIP investment`;
                        comparisonVerdictEl.style.color = 'var(--accent-color)';
                    }
                }
                
                document.getElementById('sipEmiResult').style.display = 'block';
                showNotification('SIP vs EMI comparison completed!', 'success');
            });
        }
    }
    
    // Initialize Tools & Extras
    if (document.getElementById('tools-extras')) {
        initToolsExtras();
    }
    
    // Smart Features functionality
    function initSmartFeatures() {
        // Save Loan Plan
        const saveLoanPlanBtn = document.getElementById('saveLoanPlan');
        if (saveLoanPlanBtn) {
            saveLoanPlanBtn.addEventListener('click', function() {
                saveLoanPlan();
            });
        }

        // Share Loan Plan
        const shareLoanPlanBtn = document.getElementById('shareLoanPlan');
        if (shareLoanPlanBtn) {
            shareLoanPlanBtn.addEventListener('click', function() {
                openShareModal();
            });
        }

        // Download PDF
        const downloadPDFBtn = document.getElementById('downloadPDF');
        if (downloadPDFBtn) {
            downloadPDFBtn.addEventListener('click', function() {
                downloadLoanPlanPDF();
            });
        }

        // Add EMI Reminder
        const addEMIReminderBtn = document.getElementById('addEMIReminder');
        if (addEMIReminderBtn) {
            addEMIReminderBtn.addEventListener('click', function() {
                addEMIReminder();
            });
        }

        // Share Modal functionality
        const closeShareModalBtn = document.getElementById('closeShareModal');
        const shareModal = document.getElementById('shareModal');
        
        if (closeShareModalBtn && shareModal) {
            closeShareModalBtn.addEventListener('click', function() {
                shareModal.style.display = 'none';
            });

            shareModal.addEventListener('click', function(e) {
                if (e.target === shareModal) {
                    shareModal.style.display = 'none';
                }
            });
        }

        // Copy buttons
        const copyLinkBtn = document.getElementById('copyLink');
        const copyTextBtn = document.getElementById('copyText');

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', function() {
                copyToClipboard('shareableLink', this);
            });
        }

        if (copyTextBtn) {
            copyTextBtn.addEventListener('click', function() {
                copyToClipboard('shareText', this);
            });
        }

        // Load and display saved plans
        loadSavedPlans();
    }

    function getCurrentLoanData() {
        const loanAmount = parseInt(document.getElementById('loanAmountInput')?.value) || 1000000;
        const interestRate = parseFloat(document.getElementById('interestRateInput')?.value) || 8.5;
        const loanTenure = parseInt(document.getElementById('loanTenureInput')?.value) || 20;
        
        const monthlyRate = interestRate / 12 / 100;
        const totalMonths = loanTenure * 12;
        
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        const totalAmount = emi * totalMonths;
        const totalInterest = totalAmount - loanAmount;

        return {
            loanAmount,
            interestRate,
            loanTenure,
            monthlyEMI: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalAmount: Math.round(totalAmount),
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
    }

    function saveLoanPlan() {
        const loanData = getCurrentLoanData();
        const planName = prompt('Enter a name for this loan plan:') || `Loan Plan ${new Date().toLocaleDateString()}`;
        
        loanData.name = planName;
        
        // Get existing saved plans
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        
        // Add new plan
        savedPlans.unshift(loanData);
        
        // Keep only last 10 plans
        if (savedPlans.length > 10) {
            savedPlans.splice(10);
        }
        
        // Save to localStorage
        localStorage.setItem('savedLoanPlans', JSON.stringify(savedPlans));
        
        showNotification('Loan plan saved successfully!', 'success');
        loadSavedPlans();
    }

    function loadSavedPlans() {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const container = document.getElementById('savedPlansContainer');
        
        if (!container) return;
        
        if (savedPlans.length === 0) {
            container.innerHTML = `
                <div class="no-plans-message">
                    <p>No saved loan plans yet. Calculate an EMI and save your first plan!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = savedPlans.map(plan => `
            <div class="saved-plan-item">
                <div class="saved-plan-header">
                    <div class="saved-plan-name">${plan.name}</div>
                    <div class="saved-plan-date">${new Date(plan.timestamp).toLocaleDateString()}</div>
                </div>
                <div class="saved-plan-summary">
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">Loan Amount</div>
                        <div class="plan-summary-value">₹${plan.loanAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">Monthly EMI</div>
                        <div class="plan-summary-value">₹${plan.monthlyEMI.toLocaleString('en-IN')}</div>
                    </div>
                    <div class="plan-summary-item">
                        <div class="plan-summary-label">Rate</div>
                        <div class="plan-summary-value">${plan.interestRate}%</div>
                    </div>
                </div>
                <div class="saved-plan-actions">
                    <button class="plan-action-btn load" onclick="loadLoanPlan('${plan.id}')">Load</button>
                    <button class="plan-action-btn" onclick="shareSavedPlan('${plan.id}')">Share</button>
                    <button class="plan-action-btn delete" onclick="deleteLoanPlan('${plan.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function loadLoanPlan(planId) {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const plan = savedPlans.find(p => p.id === planId);
        
        if (!plan) {
            showNotification('Plan not found!', 'error');
            return;
        }
        
        // Load plan data into form
        const loanAmountInput = document.getElementById('loanAmountInput');
        const interestRateInput = document.getElementById('interestRateInput');
        const loanTenureInput = document.getElementById('loanTenureInput');
        
        if (loanAmountInput) loanAmountInput.value = plan.loanAmount;
        if (interestRateInput) interestRateInput.value = plan.interestRate;
        if (loanTenureInput) loanTenureInput.value = plan.loanTenure;
        
        // Switch to EMI Calculator tab
        switchTab('emi-calculator');
        
        // Trigger calculation
        calculateEMI();
        
        showNotification('Loan plan loaded successfully!', 'success');
    }

    function deleteLoanPlan(planId) {
        if (!confirm('Are you sure you want to delete this loan plan?')) {
            return;
        }
        
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const filteredPlans = savedPlans.filter(p => p.id !== planId);
        
        localStorage.setItem('savedLoanPlans', JSON.stringify(filteredPlans));
        loadSavedPlans();
        showNotification('Loan plan deleted!', 'info');
    }

    function openShareModal() {
        const loanData = getCurrentLoanData();
        
        // Generate shareable link (encode data in URL)
        const encodedData = btoa(JSON.stringify({
            amount: loanData.loanAmount,
            rate: loanData.interestRate,
            tenure: loanData.loanTenure
        }));
        
        const shareableLink = `${window.location.origin}${window.location.pathname}?loan=${encodedData}`;
        
        // Generate share text
        const shareText = `Check out my loan calculation:
        
💰 Loan Amount: ₹${loanData.loanAmount.toLocaleString('en-IN')}
📊 Interest Rate: ${loanData.interestRate}%
⏱️ Tenure: ${loanData.loanTenure} years

📋 Results:
• Monthly EMI: ₹${loanData.monthlyEMI.toLocaleString('en-IN')}
• Total Interest: ₹${loanData.totalInterest.toLocaleString('en-IN')}
• Total Amount: ₹${loanData.totalAmount.toLocaleString('en-IN')}

Calculated using FinCalc Pro
${shareableLink}`;

        document.getElementById('shareableLink').value = shareableLink;
        document.getElementById('shareText').value = shareText;
        document.getElementById('shareModal').style.display = 'flex';
    }

    function shareSavedPlan(planId) {
        const savedPlans = JSON.parse(localStorage.getItem('savedLoanPlans') || '[]');
        const plan = savedPlans.find(p => p.id === planId);
        
        if (!plan) return;
        
        // Set current values to plan values temporarily for sharing
        const currentAmount = document.getElementById('loanAmountInput')?.value;
        const currentRate = document.getElementById('interestRateInput')?.value;
        const currentTenure = document.getElementById('loanTenureInput')?.value;
        
        if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = plan.loanAmount;
        if (document.getElementById('interestRateInput')) document.getElementById('interestRateInput').value = plan.interestRate;
        if (document.getElementById('loanTenureInput')) document.getElementById('loanTenureInput').value = plan.loanTenure;
        
        openShareModal();
        
        // Restore original values
        setTimeout(() => {
            if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = currentAmount;
            if (document.getElementById('interestRateInput')) document.getElementById('interestRateInput').value = currentRate;
            if (document.getElementById('loanTenureInput')) document.getElementById('loanTenureInput').value = currentTenure;
        }, 1000);
    }

    function copyToClipboard(elementId, buttonElement) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.select();
        element.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            buttonElement.textContent = 'Copied!';
            buttonElement.classList.add('copied');
            
            setTimeout(() => {
                buttonElement.textContent = elementId === 'shareableLink' ? 'Copy' : 'Copy Text';
                buttonElement.classList.remove('copied');
            }, 2000);
            
            showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy', 'error');
        }
    }

    function downloadLoanPlanPDF() {
        const loanData = getCurrentLoanData();
        
        // Create a simple text-based PDF content
        const pdfContent = `
LOAN CALCULATION REPORT
========================

Generated on: ${new Date().toLocaleDateString()}

LOAN DETAILS:
• Loan Amount: ₹${loanData.loanAmount.toLocaleString('en-IN')}
• Interest Rate: ${loanData.interestRate}% per annum
• Loan Tenure: ${loanData.loanTenure} years (${loanData.loanTenure * 12} months)

CALCULATION RESULTS:
• Monthly EMI: ₹${loanData.monthlyEMI.toLocaleString('en-IN')}
• Total Interest Payable: ₹${loanData.totalInterest.toLocaleString('en-IN')}
• Total Amount Payable: ₹${loanData.totalAmount.toLocaleString('en-IN')}

PAYMENT BREAKDOWN:
• Principal Component: ${((loanData.loanAmount / loanData.totalAmount) * 100).toFixed(1)}%
• Interest Component: ${((loanData.totalInterest / loanData.totalAmount) * 100).toFixed(1)}%

EMI FORMULA USED:
EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Where:
P = Principal loan amount
r = Monthly interest rate
n = Number of monthly installments

---
Report generated by FinCalc Pro
Financial Calculator & Planner
        `.trim();
        
        // Create and download text file (simplified PDF alternative)
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `loan-plan-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showNotification('Loan plan downloaded!', 'success');
    }

    function addEMIReminder() {
        const loanData = getCurrentLoanData();
        
        // Create calendar event details
        const eventTitle = `EMI Payment - ₹${loanData.monthlyEMI.toLocaleString('en-IN')}`;
        const eventDetails = `Monthly EMI payment for your loan of ₹${loanData.loanAmount.toLocaleString('en-IN')} at ${loanData.interestRate}% interest rate.`;
        
        // Calculate next EMI date (assuming EMI is due on the same date every month)
        const today = new Date();
        const nextEMIDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        
        // Format date for calendar
        const startDate = nextEMIDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(nextEMIDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        // Create Google Calendar link
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails)}&recur=RRULE:FREQ=MONTHLY;COUNT=${loanData.loanTenure * 12}`;
        
        // Create reminder modal
        const reminderModal = document.createElement('div');
        reminderModal.className = 'modal-overlay';
        reminderModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Set EMI Reminder</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="reminder-info">
                        <p><strong>Monthly EMI:</strong> ₹${loanData.monthlyEMI.toLocaleString('en-IN')}</p>
                        <p><strong>Next Payment Date:</strong> ${nextEMIDate.toLocaleDateString()}</p>
                        <p><strong>Total Payments:</strong> ${loanData.loanTenure * 12} months</p>
                    </div>
                    <div class="reminder-options">
                        <button class="feature-btn" onclick="window.open('${calendarUrl}', '_blank')">
                            📅 Add to Google Calendar
                        </button>
                        <button class="feature-btn" onclick="setLocalReminder(${loanData.monthlyEMI}, '${nextEMIDate.toISOString()}')">
                            🔔 Set Browser Reminder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reminderModal);
        
        // Close modal functionality
        const closeBtn = reminderModal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(reminderModal);
        });
        
        reminderModal.addEventListener('click', (e) => {
            if (e.target === reminderModal) {
                document.body.removeChild(reminderModal);
            }
        });
    }

    function setLocalReminder(emiAmount, nextDate) {
        if ('Notification' in window) {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    // Set reminder for the day before EMI
                    const reminderDate = new Date(nextDate);
                    reminderDate.setDate(reminderDate.getDate() - 1);
                    
                    const timeUntilReminder = reminderDate.getTime() - Date.now();
                    
                    if (timeUntilReminder > 0) {
                        setTimeout(() => {
                            new Notification('EMI Payment Reminder', {
                                body: `Your EMI of ₹${emiAmount.toLocaleString('en-IN')} is due tomorrow!`,
                                icon: '/favicon.ico'
                            });
                        }, timeUntilReminder);
                        
                        showNotification('Browser reminder set successfully!', 'success');
                    } else {
                        showNotification('Next EMI date has already passed!', 'warning');
                    }
                } else {
                    showNotification('Notification permission denied', 'error');
                }
            });
        } else {
            showNotification('Notifications not supported in this browser', 'error');
        }
        
        // Close modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    // Check for shared loan data in URL on page load
    function checkForSharedLoan() {
        const urlParams = new URLSearchParams(window.location.search);
        const loanData = urlParams.get('loan');
        
        if (loanData) {
            try {
                const decodedData = JSON.parse(atob(loanData));
                
                // Load shared data into form
                if (document.getElementById('loanAmountInput')) {
                    document.getElementById('loanAmountInput').value = decodedData.amount;
                }
                if (document.getElementById('interestRateInput')) {
                    document.getElementById('interestRateInput').value = decodedData.rate;
                }
                if (document.getElementById('loanTenureInput')) {
                    document.getElementById('loanTenureInput').value = decodedData.tenure;
                }
                
                // Switch to EMI Calculator tab and calculate
                switchTab('emi-calculator');
                setTimeout(() => {
                    calculateEMI();
                    showNotification('Shared loan plan loaded!', 'success');
                }, 500);
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error loading shared loan data:', error);
            }
        }
    }

    // Make functions globally available
    window.loadLoanPlan = loadLoanPlan;
    window.deleteLoanPlan = deleteLoanPlan;
    window.shareSavedPlan = shareSavedPlan;
    window.setLocalReminder = setLocalReminder;

    // Initialize Smart Features
    if (document.getElementById('smart-features')) {
        initSmartFeatures();
    }

    // Check for shared loan data
    checkForSharedLoan();

    // Initialize app
    console.log('FinCalc Pro initialized successfully!');
    showNotification('Welcome to FinCalc Pro!', 'info');
});
