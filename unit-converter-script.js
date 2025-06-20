// PRATIX FINANCE Simple Unit Converter Script
// User-friendly and responsive for all devices

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple Unit Converter loaded successfully!');
    initializeConverter();
    setupEventListeners();
    setActiveCategory('length');
});

// Simple conversion data
const conversionData = {
    length: {
        name: 'Length',
        icon: '📏',
        units: {
            meter: { name: 'Meter (m)', factor: 1 },
            kilometer: { name: 'Kilometer (km)', factor: 1000 },
            centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
            millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
            inch: { name: 'Inch (in)', factor: 0.0254 },
            foot: { name: 'Foot (ft)', factor: 0.3048 },
            yard: { name: 'Yard (yd)', factor: 0.9144 },
            mile: { name: 'Mile (mi)', factor: 1609.344 }
        },
        references: [
            { label: '1 Meter =', value: '100 cm' },
            { label: '1 Kilometer =', value: '1000 m' },
            { label: '1 Foot =', value: '12 inches' },
            { label: '1 Mile =', value: '5280 ft' }
        ]
    },
    weight: {
        name: 'Weight',
        icon: '⚖️',
        units: {
            kilogram: { name: 'Kilogram (kg)', factor: 1000 },
            gram: { name: 'Gram (g)', factor: 1 },
            pound: { name: 'Pound (lb)', factor: 453.592 },
            ounce: { name: 'Ounce (oz)', factor: 28.3495 },
            ton: { name: 'Metric Ton', factor: 1000000 }
        },
        references: [
            { label: '1 Kilogram =', value: '1000 g' },
            { label: '1 Pound =', value: '16 oz' },
            { label: '1 Ton =', value: '1000 kg' }
        ]
    },
    area: {
        name: 'Area',
        icon: '📐',
        units: {
            square_meter: { name: 'Square Meter (m²)', factor: 1 },
            square_kilometer: { name: 'Square Kilometer (km²)', factor: 1000000 },
            square_foot: { name: 'Square Foot (ft²)', factor: 0.092903 },
            acre: { name: 'Acre', factor: 4046.86 },
            hectare: { name: 'Hectare', factor: 10000 }
        },
        references: [
            { label: '1 Hectare =', value: '10,000 m²' },
            { label: '1 Acre =', value: '4,047 m²' },
            { label: '1 km² =', value: '100 hectares' }
        ]
    },
    volume: {
        name: 'Volume',
        icon: '🪣',
        units: {
            liter: { name: 'Liter (L)', factor: 1 },
            milliliter: { name: 'Milliliter (mL)', factor: 0.001 },
            cubic_meter: { name: 'Cubic Meter (m³)', factor: 1000 },
            gallon_us: { name: 'US Gallon', factor: 3.78541 },
            cubic_foot: { name: 'Cubic Foot (ft³)', factor: 28.3168 }
        },
        references: [
            { label: '1 Liter =', value: '1000 mL' },
            { label: '1 m³ =', value: '1000 L' },
            { label: '1 US Gallon =', value: '3.785 L' }
        ]
    },
    temperature: {
        name: 'Temperature',
        icon: '🌡️',
        units: {
            celsius: { name: 'Celsius (°C)' },
            fahrenheit: { name: 'Fahrenheit (°F)' },
            kelvin: { name: 'Kelvin (K)' }
        },
        references: [
            { label: 'Water Freezes:', value: '0°C / 32°F' },
            { label: 'Water Boils:', value: '100°C / 212°F' },
            { label: 'Room Temperature:', value: '20-25°C' }
        ]
    },
    speed: {
        name: 'Speed',
        icon: '⚡',
        units: {
            kmh: { name: 'km/h', factor: 0.277778 },
            mph: { name: 'mph', factor: 0.44704 },
            ms: { name: 'm/s', factor: 1 },
            fps: { name: 'ft/s', factor: 0.3048 }
        },
        references: [
            { label: '1 km/h =', value: '0.278 m/s' },
            { label: '1 mph =', value: '1.609 km/h' },
            { label: 'Speed of sound =', value: '343 m/s' }
        ]
    }
};

let currentCategory = 'length';

// Initialize converter
function initializeConverter() {
    populateUnitSelectors();
    updateQuickReference();
    updateConverterTitle();
    clearResults();
}

// Setup event listeners
function setupEventListeners() {
    // Category card clicks
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            setActiveCategory(category);
        });
    });

    // Real-time conversion
    const inputValue = document.getElementById('inputValue');
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');

    [inputValue, fromUnit, toUnit].forEach(element => {
        element.addEventListener('input', performConversion);
    });

    // Enter key support
    inputValue.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performConversion();
        }
    });
}

// Set active category
function setActiveCategory(category) {
    currentCategory = category;

    // Update category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-category') === category) {
            card.classList.add('active');
        }
    });

    // Update interface
    populateUnitSelectors();
    updateQuickReference();
    updateConverterTitle();
    clearResults();

    showNotification(`Switched to ${conversionData[category].name} converter`);
}

// Update converter title
function updateConverterTitle() {
    const categoryData = conversionData[currentCategory];
    const titleElement = document.getElementById('converterTitle');
    if (titleElement) {
        titleElement.textContent = `${categoryData.name} Converter`;
    }
}

// Populate unit selectors
function populateUnitSelectors() {
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    const units = conversionData[currentCategory].units;

    // Clear existing options
    fromSelect.innerHTML = '<option value="">Select Unit</option>';
    toSelect.innerHTML = '<option value="">Select Unit</option>';

    // Add unit options
    Object.keys(units).forEach(unitKey => {
        const unit = units[unitKey];

        const fromOption = new Option(unit.name, unitKey);
        const toOption = new Option(unit.name, unitKey);

        fromSelect.add(fromOption);
        toSelect.add(toOption);
    });
}

// Update quick reference
function updateQuickReference() {
    const referenceGrid = document.getElementById('referenceGrid');
    const references = conversionData[currentCategory].references;

    referenceGrid.innerHTML = '';

    references.forEach(ref => {
        const refItem = document.createElement('div');
        refItem.className = 'reference-item';
        refItem.innerHTML = `
            <span class="ref-label">${ref.label}</span>
            <span class="ref-value">${ref.value}</span>
        `;
        referenceGrid.appendChild(refItem);
    });
}

// Perform conversion
function performConversion() {
    const inputValue = document.getElementById('inputValue').value;
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;

    // Validation
    if (!inputValue || !fromUnit || !toUnit || isNaN(inputValue)) {
        hideResults();
        return;
    }

    try {
        let result;
        let formula;

        if (currentCategory === 'temperature') {
            result = convertTemperature(parseFloat(inputValue), fromUnit, toUnit);
            formula = getTemperatureFormula(inputValue, fromUnit, toUnit, result);
        } else {
            result = convertStandardUnit(parseFloat(inputValue), fromUnit, toUnit);
            formula = getStandardFormula(inputValue, fromUnit, toUnit, result);
        }

        displayResult(result, formula);

    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
        hideResults();
    }
}

// Convert standard units
function convertStandardUnit(value, fromUnit, toUnit) {
    const units = conversionData[currentCategory].units;

    if (!units[fromUnit] || !units[toUnit]) {
        throw new Error('Invalid unit selection');
    }

    // Convert to base unit, then to target unit
    const baseValue = value * units[fromUnit].factor;
    return baseValue / units[toUnit].factor;
}

// Convert temperature
function convertTemperature(value, fromUnit, toUnit) {
    // Convert to Celsius first
    let celsius;

    switch(fromUnit) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
        default:
            throw new Error('Invalid temperature unit');
    }

    // Convert from Celsius to target unit
    switch(toUnit) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return celsius * 9/5 + 32;
        case 'kelvin':
            return celsius + 273.15;
        default:
            throw new Error('Invalid temperature unit');
    }
}

// Get formula for standard units
function getStandardFormula(input, fromUnit, toUnit, result) {
    const units = conversionData[currentCategory].units;
    const fromName = units[fromUnit].name.split('(')[1]?.replace(')', '') || fromUnit;
    const toName = units[toUnit].name.split('(')[1]?.replace(')', '') || toUnit;

    return `${input} ${fromName} = ${formatNumber(result)} ${toName}`;
}

// Get formula for temperature
function getTemperatureFormula(input, fromUnit, toUnit, result) {
    const symbols = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K'
    };

    return `${input}${symbols[fromUnit]} = ${formatNumber(result)}${symbols[toUnit]}`;
}

// Display result
function displayResult(result, formula) {
    document.getElementById('resultValue').textContent = formatNumber(result);
    document.getElementById('resultFormula').textContent = formula;

    // Show result section
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';

    // Smooth scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide results
function hideResults() {
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'none';
}

// Clear results
function clearResults() {
    document.getElementById('resultValue').textContent = '-';
    document.getElementById('resultFormula').textContent = '-';
    hideResults();
}

// Clear entire converter
function clearConverter() {
    document.getElementById('inputValue').value = '';
    document.getElementById('fromUnit').selectedIndex = 0;
    document.getElementById('toUnit').selectedIndex = 0;
    clearResults();
    showNotification('Converter cleared');
}

// Swap units
function swapUnits() {
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');

    const fromValue = fromSelect.value;
    const toValue = toSelect.value;

    fromSelect.value = toValue;
    toSelect.value = fromValue;

    // Trigger conversion if possible
    if (fromValue && toValue) {
        performConversion();
        showNotification('Units swapped');
    }
}

// Format number for display
function formatNumber(num) {
    if (Math.abs(num) >= 1e9) {
        return num.toExponential(4);
    } else if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(3) + 'M';
    } else if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(3) + 'K';
    } else if (Math.abs(num) < 0.001 && num !== 0) {
        return num.toExponential(4);
    } else {
        return num.toFixed(6).replace(/\.?0+$/, '');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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

// Share functionality
function shareResults() {
    const resultValue = document.getElementById('resultValue').textContent;
    const resultFormula = document.getElementById('resultFormula').textContent;

    if (resultValue === '-') {
        showNotification('No results to share. Please perform a conversion first.', 'error');
        return;
    }

    const shareText = `Unit Conversion Result:\n${resultFormula}\n\nCalculated using PRATIX FINANCE Unit Converter\n${window.location.href}`;

    if (navigator.share) {
        navigator.share({
            title: 'Unit Conversion Result - PRATIX FINANCE',
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard!');
        }).catch(() => {
            showNotification('Unable to copy to clipboard', 'error');
        });
    }
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

function goToProfitLossCalculator() {
    window.location.href = 'profit-loss-calculator.html';
}

// Scroll to calculators function for homepage CTA
function scrollToCalculators() {
    window.location.href = 'index.html#calculators';
}

// Animation keyframes (to be added via CSS)
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

    .reference-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        border: 1px solid rgba(0, 212, 255, 0.2);
        transition: all 0.3s ease;
        margin-bottom: 0.5rem;
    }

    .reference-item:hover {
        border-color: var(--neon-cyan);
        background: rgba(0, 212, 255, 0.1);
        transform: translateY(-2px);
    }

    .ref-label {
        color: var(--text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .ref-value {
        color: var(--neon-blue);
        font-weight: 700;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
    }
`;
document.head.appendChild(style);

console.log('PRATIX FINANCE Simple Unit Converter initialized successfully!');