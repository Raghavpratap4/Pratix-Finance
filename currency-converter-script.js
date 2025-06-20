
// PRATIX FINANCE Advanced Currency Converter Script
// Live exchange rates with enhanced desktop experience

class CurrencyConverter {
    constructor() {
        this.exchangeRates = {};
        this.baseCurrency = 'USD';
        this.lastUpdated = null;
        this.isLoading = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Multiple API endpoints for redundancy
        this.apiEndpoints = [
            'https://api.exchangerate-api.com/v4/latest/',
            'https://api.fixer.io/latest?access_key=YOUR_KEY&base=',
            'https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/'
        ];
        
        // Fallback exchange rates (updated periodically)
        this.fallbackRates = {
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'INR': 83.25,
            'JPY': 150.45,
            'CAD': 1.36,
            'AUD': 1.53,
            'CHF': 0.88,
            'CNY': 7.23,
            'SEK': 10.85,
            'NZD': 1.64,
            'MXN': 17.85,
            'SGD': 1.34,
            'HKD': 7.83,
            'NOK': 10.95,
            'TRY': 30.45,
            'RUB': 92.75,
            'ZAR': 18.95,
            'BRL': 5.05,
            'KRW': 1335.50
        };
        
        this.init();
    }

    async init() {
        this.updateStatus('🔄', 'Loading live rates...', 'loading');
        await this.loadExchangeRates();
        this.setupEventListeners();
        this.populateQuickConversions();
        this.populatePopularPairs();
        this.initializeChart();
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadExchangeRates(true);
        }, 300000);
        
        // Auto-convert with default values
        setTimeout(() => {
            this.convertCurrency();
        }, 1000);
    }

    async loadExchangeRates(silent = false) {
        if (this.isLoading) return;
        this.isLoading = true;
        
        if (!silent) {
            this.updateStatus('🔄', 'Fetching live rates...', 'loading');
        }

        try {
            // Try primary API first
            const response = await fetch(`${this.apiEndpoints[0]}${this.baseCurrency}`);
            
            if (!response.ok) {
                throw new Error('Primary API failed');
            }
            
            const data = await response.json();
            
            if (data && data.rates) {
                this.exchangeRates = data.rates;
                this.lastUpdated = new Date();
                this.retryCount = 0;
                
                this.updateStatus('✅', 'Live rates updated', 'success');
                this.updateLastUpdatedTime();
                this.updateExchangeRateDisplays();
                
                // Store in localStorage for offline use
                localStorage.setItem('exchangeRates', JSON.stringify({
                    rates: this.exchangeRates,
                    timestamp: this.lastUpdated.getTime()
                }));
                
            } else {
                throw new Error('Invalid API response');
            }
            
        } catch (error) {
            console.warn('Failed to fetch live rates:', error);
            this.handleRatesFetchError();
        }
        
        this.isLoading = false;
    }

    handleRatesFetchError() {
        // Try to load from localStorage first
        const stored = localStorage.getItem('exchangeRates');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                const storedTime = new Date(data.timestamp);
                const hoursSinceUpdate = (Date.now() - storedTime.getTime()) / (1000 * 60 * 60);
                
                // Use stored data if less than 6 hours old
                if (hoursSinceUpdate < 6) {
                    this.exchangeRates = data.rates;
                    this.lastUpdated = storedTime;
                    this.updateStatus('⚠️', 'Using cached rates', 'warning');
                    this.updateLastUpdatedTime();
                    this.updateExchangeRateDisplays();
                    return;
                }
            } catch (e) {
                console.warn('Failed to parse stored rates');
            }
        }
        
        // Fall back to hardcoded rates
        this.exchangeRates = { ...this.fallbackRates };
        this.lastUpdated = new Date();
        this.updateStatus('⚠️', 'Using offline rates', 'warning');
        this.updateLastUpdatedTime();
        this.updateExchangeRateDisplays();
        
        // Retry after delay
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(() => {
                this.loadExchangeRates(true);
            }, 5000 * this.retryCount);
        }
    }

    updateStatus(icon, text, type) {
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        const statusContainer = document.getElementById('ratesStatus');
        
        if (statusIcon) statusIcon.textContent = icon;
        if (statusText) statusText.textContent = text;
        
        if (statusContainer) {
            statusContainer.className = `glass-card status-${type}`;
        }
        
        // Auto-hide success status after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.updateStatus('🌐', 'Live rates active', 'active');
            }, 3000);
        }
    }

    updateLastUpdatedTime() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement && this.lastUpdated) {
            const timeString = this.lastUpdated.toLocaleTimeString();
            lastUpdatedElement.textContent = `Last updated: ${timeString}`;
        }
    }

    updateExchangeRateDisplays() {
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        this.updateSingleRateDisplay('fromRate', fromCurrency, fromCurrency);
        this.updateSingleRateDisplay('toRate', toCurrency, toCurrency);
        
        // Update conversion if amount is entered
        if (document.getElementById('amount').value) {
            this.convertCurrency();
        }
    }

    updateSingleRateDisplay(elementId, fromCur, toCur) {
        const element = document.getElementById(elementId);
        if (element) {
            if (fromCur === toCur) {
                element.textContent = `1 ${fromCur} = 1 ${fromCur}`;
            } else {
                const rate = this.getExchangeRate(fromCur, toCur);
                element.textContent = `1 ${fromCur} = ${this.formatCurrency(rate, toCur)} ${toCur}`;
            }
        }
    }

    setupEventListeners() {
        // Real-time conversion
        const amountInput = document.getElementById('amount');
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        if (amountInput) {
            amountInput.addEventListener('input', () => this.convertCurrency());
            amountInput.addEventListener('focus', () => {
                amountInput.select(); // Select all text on focus for easy editing
            });
        }
        
        if (fromSelect) {
            fromSelect.addEventListener('change', () => {
                this.updateExchangeRateDisplays();
                this.convertCurrency();
            });
        }
        
        if (toSelect) {
            toSelect.addEventListener('change', () => {
                this.updateExchangeRateDisplays();
                this.convertCurrency();
            });
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.convertCurrency();
            } else if (e.key === 'Escape') {
                this.clearConverter();
            }
        });
    }

    getExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;
        
        // Convert via USD as base
        const fromRate = this.exchangeRates[fromCurrency] || 1;
        const toRate = this.exchangeRates[toCurrency] || 1;
        
        if (fromCurrency === 'USD') {
            return toRate;
        } else if (toCurrency === 'USD') {
            return 1 / fromRate;
        } else {
            return toRate / fromRate;
        }
    }

    convertCurrency() {
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        if (!amount || amount <= 0 || !fromCurrency || !toCurrency) {
            this.hideResults();
            return;
        }
        
        const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);
        const convertedAmount = amount * exchangeRate;
        
        this.displayResult(amount, fromCurrency, convertedAmount, toCurrency, exchangeRate);
        this.updateChart(fromCurrency, toCurrency);
        
        // Add visual feedback
        this.addConversionAnimation();
    }

    displayResult(amount, fromCurrency, convertedAmount, toCurrency, exchangeRate) {
        // Main result display
        const resultAmountEl = document.getElementById('resultAmount');
        const conversionRateEl = document.getElementById('conversionRate');
        const inputDisplayEl = document.getElementById('inputDisplay');
        
        if (resultAmountEl) {
            resultAmountEl.textContent = `${this.formatCurrency(convertedAmount, toCurrency)} ${toCurrency}`;
        }
        
        if (conversionRateEl) {
            conversionRateEl.textContent = `1 ${fromCurrency} = ${this.formatCurrency(exchangeRate, toCurrency)} ${toCurrency}`;
        }
        
        if (inputDisplayEl) {
            inputDisplayEl.textContent = `${this.formatCurrency(amount, fromCurrency)} ${fromCurrency}`;
        }
        
        // Show results with animation
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'block';
            resultSection.classList.add('result-updated');
            
            setTimeout(() => {
                resultSection.classList.remove('result-updated');
            }, 500);
        }
    }

    addConversionAnimation() {
        // Add a subtle pulse animation to the convert button
        const convertBtn = document.querySelector('.calculate-btn');
        if (convertBtn) {
            convertBtn.style.transform = 'scale(1.05)';
            setTimeout(() => {
                convertBtn.style.transform = '';
            }, 150);
        }
    }

    hideResults() {
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
    }

    formatCurrency(amount, currency) {
        // Different formatting for different currencies
        let decimals = 2;
        
        // Currencies that typically don't use decimals
        if (['JPY', 'KRW'].includes(currency)) {
            decimals = 0;
        }
        
        // High-value currencies might need more precision for small amounts
        if (amount < 0.01 && amount > 0) {
            decimals = 6;
        } else if (amount < 1 && amount > 0) {
            decimals = 4;
        }
        
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    populateQuickConversions() {
        const container = document.getElementById('quickConversions');
        if (!container) return;
        
        const quickAmounts = [100, 500, 1000, 5000, 10000];
        
        container.innerHTML = quickAmounts.map(amount => `
            <div class="quick-convert-item" onclick="currencyConverter.setQuickAmount(${amount})">
                <div class="quick-amount">${this.formatNumber(amount)}</div>
                <div class="quick-label">Quick Convert</div>
            </div>
        `).join('');
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000) + 'K';
        }
        return num.toString();
    }

    setQuickAmount(amount) {
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.value = amount;
            amountInput.focus();
            this.convertCurrency();
            
            // Add visual feedback
            const clickedItem = event.currentTarget;
            clickedItem.style.transform = 'scale(0.95)';
            setTimeout(() => {
                clickedItem.style.transform = '';
            }, 150);
        }
    }

    populatePopularPairs() {
        const container = document.getElementById('popularPairs');
        if (!container) return;
        
        const popularPairs = [
            ['USD', 'INR', '🇺🇸→🇮🇳'],
            ['EUR', 'USD', '🇪🇺→🇺🇸'],
            ['GBP', 'USD', '🇬🇧→🇺🇸'],
            ['USD', 'JPY', '🇺🇸→🇯🇵'],
            ['AUD', 'USD', '🇦🇺→🇺🇸'],
            ['USD', 'CAD', '🇺🇸→🇨🇦']
        ];
        
        container.innerHTML = popularPairs.map(([from, to, flags]) => {
            const rate = this.getExchangeRate(from, to);
            return `
                <div class="popular-pair-item" onclick="currencyConverter.setPopularPair('${from}', '${to}')">
                    <div class="pair-currencies">${flags}</div>
                    <div class="pair-rate">${this.formatCurrency(rate, to)}</div>
                    <div class="pair-change">📈</div>
                </div>
            `;
        }).join('');
    }

    setPopularPair(fromCurrency, toCurrency) {
        document.getElementById('fromCurrency').value = fromCurrency;
        document.getElementById('toCurrency').value = toCurrency;
        this.updateExchangeRateDisplays();
        this.convertCurrency();
        
        // Add visual feedback
        showNotification(`Switched to ${fromCurrency} → ${toCurrency}`, 'success');
    }

    initializeChart() {
        const canvas = document.getElementById('rateChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Simple chart implementation
        this.drawChart(ctx, canvas.width, canvas.height, 'INR', 'USD');
    }

    updateChart(fromCurrency, toCurrency) {
        const canvas = document.getElementById('rateChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Clear and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawChart(ctx, canvas.width, canvas.height, fromCurrency, toCurrency);
    }

    drawChart(ctx, width, height, fromCurrency, toCurrency) {
        // Generate sample trend data
        const days = 7;
        const currentRate = this.getExchangeRate(fromCurrency, toCurrency);
        const trendData = [];
        
        for (let i = 0; i < days; i++) {
            // Simulate rate fluctuation
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            trendData.push(currentRate * (1 + variation));
        }
        
        // Chart styling
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Find min/max for scaling
        const minRate = Math.min(...trendData);
        const maxRate = Math.max(...trendData);
        const range = maxRate - minRate || 1;
        
        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw trend line
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        trendData.forEach((rate, index) => {
            const x = padding + (index / (days - 1)) * chartWidth;
            const y = padding + (1 - (rate - minRate) / range) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#00ff88';
        trendData.forEach((rate, index) => {
            const x = padding + (index / (days - 1)) * chartWidth;
            const y = padding + (1 - (rate - minRate) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Chart title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${fromCurrency}/${toCurrency} - 7 Day Trend`, width / 2, 20);
        
        // Current rate label
        ctx.font = '12px Inter';
        ctx.fillText(`Current: ${this.formatCurrency(currentRate, toCurrency)}`, width / 2, height - 10);
    }

    clearConverter() {
        document.getElementById('amount').value = '1000';
        document.getElementById('fromCurrency').value = 'INR';
        document.getElementById('toCurrency').value = 'USD';
        
        this.updateExchangeRateDisplays();
        this.convertCurrency();
        
        showNotification('Converter reset!', 'info');
    }
}

// Global functions for HTML onclick events
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    
    fromSelect.value = toValue;
    toSelect.value = fromValue;
    
    currencyConverter.updateExchangeRateDisplays();
    currencyConverter.convertCurrency();
    
    // Add visual feedback
    const swapBtn = document.querySelector('.swap-btn');
    swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 300);
    
    showNotification('Currencies swapped!', 'success');
}

function clearConverter() {
    currencyConverter.clearConverter();
}

function refreshRates() {
    currencyConverter.retryCount = 0;
    currencyConverter.loadExchangeRates();
    showNotification('Refreshing exchange rates...', 'info');
}

function shareResults() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultAmount = document.getElementById('resultAmount')?.textContent || '';
    
    const shareText = `💱 ${amount} ${fromCurrency} = ${resultAmount}\n\nCalculated using PRATIX FINANCE Currency Converter\n${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Currency Conversion Result',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Conversion result copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Unable to copy to clipboard', 'error');
        });
    }
}

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
        font-size: 0.9rem;
        border: 1px solid rgba(255,255,255,0.2);
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
    }, 4000);
}

// Initialize currency converter when DOM is loaded
let currencyConverter;

document.addEventListener('DOMContentLoaded', function() {
    console.log('PRATIX FINANCE Currency Converter loaded!');
    currencyConverter = new CurrencyConverter();
    
    // Add loading animation
    document.body.classList.add('loading');
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 1000);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .status-loading { 
        border-color: #ffa500 !important; 
        background: rgba(255, 165, 0, 0.1) !important;
    }
    .status-success { 
        border-color: #00ff88 !important; 
        background: rgba(0, 255, 136, 0.1) !important;
    }
    .status-warning { 
        border-color: #ff9500 !important; 
        background: rgba(255, 149, 0, 0.1) !important;
    }
    .status-active { 
        border-color: #00d4ff !important; 
        background: rgba(0, 212, 255, 0.1) !important;
    }
    
    .result-updated {
        transform: scale(1.02);
        transition: transform 0.3s ease;
        border-color: var(--neon-green) !important;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.4) !important;
    }
    
    .loading {
        overflow: hidden;
    }
    
    .loading * {
        animation-duration: 0.6s;
    }
    
    /* Enhanced Desktop Layout */
    .desktop-converter-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 2rem;
        margin-top: 2rem;
    }
    
    .converter-main-area {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .converter-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: sticky;
        top: 2rem;
        height: fit-content;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
    }
    
    /* Enhanced Interface Styling */
    .converter-interface {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 255, 136, 0.05) 100%);
        border: 2px solid rgba(0, 212, 255, 0.3);
    }
    
    .result-display {
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
        border: 2px solid rgba(0, 255, 136, 0.3);
    }
    
    .quick-reference-card {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%);
        border: 2px solid rgba(139, 92, 246, 0.3);
    }
    
    /* Enhanced Quick Convert Items */
    .quick-convert-item {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 16px;
        padding: 1.5rem 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .quick-convert-item::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(0, 212, 255, 0.1), transparent);
        transform: rotate(45deg);
        transition: all 0.5s ease;
        opacity: 0;
    }
    
    .quick-convert-item:hover {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 255, 136, 0.1) 100%);
        border-color: var(--neon-cyan);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 
            0 0 25px rgba(0, 255, 255, 0.4),
            0 12px 30px rgba(0, 0, 0, 0.4);
    }
    
    .quick-convert-item:hover::before {
        opacity: 1;
        animation: shimmer 0.6s ease-in-out;
    }
    
    .quick-amount {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--neon-blue);
        margin-bottom: 0.5rem;
        text-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
    }
    
    .quick-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    /* Enhanced Popular Pairs */
    .popular-pair-item {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
        border: 2px solid rgba(0, 255, 136, 0.3);
        border-radius: 16px;
        padding: 1.25rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .popular-pair-item:hover {
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%);
        border-color: var(--neon-green);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 
            0 0 25px rgba(0, 255, 136, 0.4),
            0 12px 30px rgba(0, 0, 0, 0.4);
    }
    
    .pair-currencies {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--neon-green);
        margin-bottom: 0.5rem;
        text-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
    }
    
    .pair-rate {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
        font-weight: 600;
    }
    
    .pair-change {
        font-size: 1rem;
    }
    
    /* Mobile Responsive */
    @media (max-width: 1023px) {
        .desktop-converter-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .converter-sidebar {
            position: relative;
            top: auto;
            max-height: none;
            overflow-y: visible;
        }
    }
    
    @media (max-width: 768px) {
        .quick-convert-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
        }
        
        .popular-pairs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }
        
        .quick-convert-item {
            padding: 1rem 0.75rem;
        }
        
        .quick-amount {
            font-size: 1.2rem;
        }
        
        .quick-label {
            font-size: 0.75rem;
        }
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%) rotate(45deg); }
        100% { transform: translateX(100%) rotate(45deg); }
    }
`;
document.head.appendChild(style);

console.log('PRATIX FINANCE Enhanced Currency Converter Script loaded successfully!');
