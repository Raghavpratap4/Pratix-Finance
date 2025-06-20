
// PRATIX FINANCE Enhanced Unit Converter Script - Responsive Design
// Optimized for all screen sizes with modern UX

document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Unit Converter loaded successfully!');

    // Initialize the converter
    initializeConverter();
    setupEventListeners();
    setupResponsiveLayout();

    // Set default category
    setActiveCategory('length');
});

// Enhanced conversion factors database
const conversionData = {
    length: {
        name: 'Length',
        icon: '📏',
        description: 'Convert between different units of length and distance',
        units: {
            meter: { name: 'Meter (m)', factor: 1 },
            kilometer: { name: 'Kilometer (km)', factor: 1000 },
            centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
            millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
            inch: { name: 'Inch (in)', factor: 0.0254 },
            foot: { name: 'Foot (ft)', factor: 0.3048 },
            yard: { name: 'Yard (yd)', factor: 0.9144 },
            mile: { name: 'Mile (mi)', factor: 1609.344 },
            nautical_mile: { name: 'Nautical Mile', factor: 1852 }
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
        description: 'Convert between different units of weight and mass',
        units: {
            kilogram: { name: 'Kilogram (kg)', factor: 1000 },
            gram: { name: 'Gram (g)', factor: 1 },
            pound: { name: 'Pound (lb)', factor: 453.592 },
            ounce: { name: 'Ounce (oz)', factor: 28.3495 },
            ton: { name: 'Metric Ton', factor: 1000000 },
            stone: { name: 'Stone', factor: 6350.29 },
            carat: { name: 'Carat', factor: 0.2 }
        },
        references: [
            { label: '1 Kilogram =', value: '1000 g' },
            { label: '1 Pound =', value: '16 oz' },
            { label: '1 Stone =', value: '14 lbs' },
            { label: '1 Ton =', value: '1000 kg' }
        ]
    },
    area: {
        name: 'Area',
        icon: '📐',
        description: 'Convert between different units of area and surface',
        units: {
            square_meter: { name: 'Square Meter (m²)', factor: 1 },
            square_kilometer: { name: 'Square Kilometer (km²)', factor: 1000000 },
            square_centimeter: { name: 'Square Centimeter (cm²)', factor: 0.0001 },
            square_foot: { name: 'Square Foot (ft²)', factor: 0.092903 },
            square_inch: { name: 'Square Inch (in²)', factor: 0.00064516 },
            acre: { name: 'Acre', factor: 4046.86 },
            hectare: { name: 'Hectare', factor: 10000 },
            square_mile: { name: 'Square Mile', factor: 2589988.11 }
        },
        references: [
            { label: '1 Hectare =', value: '10,000 m²' },
            { label: '1 Acre =', value: '4,047 m²' },
            { label: '1 km² =', value: '100 hectares' },
            { label: '1 ft² =', value: '144 in²' }
        ]
    },
    volume: {
        name: 'Volume',
        icon: '🪣',
        description: 'Convert between different units of volume and capacity',
        units: {
            liter: { name: 'Liter (L)', factor: 1 },
            milliliter: { name: 'Milliliter (mL)', factor: 0.001 },
            cubic_meter: { name: 'Cubic Meter (m³)', factor: 1000 },
            gallon_us: { name: 'US Gallon', factor: 3.78541 },
            gallon_uk: { name: 'UK Gallon', factor: 4.54609 },
            cubic_foot: { name: 'Cubic Foot (ft³)', factor: 28.3168 },
            cubic_inch: { name: 'Cubic Inch (in³)', factor: 0.0163871 },
            barrel: { name: 'Barrel (Oil)', factor: 158.987 }
        },
        references: [
            { label: '1 Liter =', value: '1000 mL' },
            { label: '1 m³ =', value: '1000 L' },
            { label: '1 US Gallon =', value: '3.785 L' },
            { label: '1 ft³ =', value: '28.3 L' }
        ]
    },
    temperature: {
        name: 'Temperature',
        icon: '🌡️',
        description: 'Convert between different temperature scales',
        units: {
            celsius: { name: 'Celsius (°C)' },
            fahrenheit: { name: 'Fahrenheit (°F)' },
            kelvin: { name: 'Kelvin (K)' },
            rankine: { name: 'Rankine (°R)' }
        },
        references: [
            { label: 'Water Freezes:', value: '0°C / 32°F' },
            { label: 'Water Boils:', value: '100°C / 212°F' },
            { label: 'Absolute Zero:', value: '-273.15°C' },
            { label: 'Room Temperature:', value: '20-25°C' }
        ]
    },
    speed: {
        name: 'Speed',
        icon: '⚡',
        description: 'Convert between different units of speed and velocity',
        units: {
            kmh: { name: 'Kilometers/Hour (km/h)', factor: 0.277778 },
            mph: { name: 'Miles/Hour (mph)', factor: 0.44704 },
            ms: { name: 'Meters/Second (m/s)', factor: 1 },
            fps: { name: 'Feet/Second (ft/s)', factor: 0.3048 },
            knot: { name: 'Knot', factor: 0.514444 },
            mach: { name: 'Mach (at sea level)', factor: 343 }
        },
        references: [
            { label: '1 km/h =', value: '0.278 m/s' },
            { label: '1 mph =', value: '1.609 km/h' },
            { label: '1 knot =', value: '1.852 km/h' },
            { label: 'Speed of sound =', value: '343 m/s' }
        ]
    },
    pressure: {
        name: 'Pressure',
        icon: '🌪️',
        description: 'Convert between different units of pressure',
        units: {
            pascal: { name: 'Pascal (Pa)', factor: 1 },
            kilopascal: { name: 'Kilopascal (kPa)', factor: 1000 },
            bar: { name: 'Bar', factor: 100000 },
            atmosphere: { name: 'Atmosphere (atm)', factor: 101325 },
            torr: { name: 'Torr', factor: 133.322 },
            psi: { name: 'PSI', factor: 6895 },
            mmhg: { name: 'mmHg', factor: 133.322 }
        },
        references: [
            { label: '1 Bar =', value: '100,000 Pa' },
            { label: '1 Atmosphere =', value: '101,325 Pa' },
            { label: '1 PSI =', value: '6,895 Pa' },
            { label: 'Sea Level =', value: '1 atm' }
        ]
    },
    energy: {
        name: 'Energy',
        icon: '⚡',
        description: 'Convert between different units of energy and work',
        units: {
            joule: { name: 'Joule (J)', factor: 1 },
            kilojoule: { name: 'Kilojoule (kJ)', factor: 1000 },
            calorie: { name: 'Calorie (cal)', factor: 4.184 },
            kilocalorie: { name: 'Kilocalorie (kcal)', factor: 4184 },
            watt_hour: { name: 'Watt Hour (Wh)', factor: 3600 },
            kwh: { name: 'Kilowatt Hour (kWh)', factor: 3600000 },
            btu: { name: 'BTU', factor: 1055.06 },
            erg: { name: 'Erg', factor: 0.0000001 }
        },
        references: [
            { label: '1 kWh =', value: '3.6 MJ' },
            { label: '1 kcal =', value: '4,184 J' },
            { label: '1 BTU =', value: '1,055 J' },
            { label: 'Food Calorie =', value: '1 kcal' }
        ]
    },
    time: {
        name: 'Time',
        icon: '⏰',
        description: 'Convert between different units of time',
        units: {
            second: { name: 'Second (s)', factor: 1 },
            minute: { name: 'Minute (min)', factor: 60 },
            hour: { name: 'Hour (hr)', factor: 3600 },
            day: { name: 'Day', factor: 86400 },
            week: { name: 'Week', factor: 604800 },
            month: { name: 'Month (30 days)', factor: 2592000 },
            year: { name: 'Year (365 days)', factor: 31536000 },
            decade: { name: 'Decade', factor: 315360000 }
        },
        references: [
            { label: '1 Minute =', value: '60 seconds' },
            { label: '1 Hour =', value: '60 minutes' },
            { label: '1 Day =', value: '24 hours' },
            { label: '1 Year =', value: '365 days' }
        ]
    }
};

let currentCategory = 'length';

// Initialize converter
function initializeConverter() {
    populateUnitSelectors();
    updateQuickReference();
    updateCategoryDisplay();
    clearResults();
}

// Setup responsive layout
function setupResponsiveLayout() {
    // Check screen size and apply appropriate layout
    function checkScreenSize() {
        const isDesktop = window.innerWidth >= 1024;
        const sidebar = document.querySelector('.desktop-sidebar');
        const mobileSelector = document.querySelector('.mobile-category-selector');
        
        if (isDesktop) {
            if (sidebar) sidebar.style.display = 'flex';
            if (mobileSelector) mobileSelector.style.display = 'none';
        } else {
            if (sidebar) sidebar.style.display = 'none';
            if (mobileSelector) mobileSelector.style.display = 'block';
        }
    }

    // Initial check
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', debounce(checkScreenSize, 250));
}

// Setup event listeners
function setupEventListeners() {
    // Desktop category navigation
    const desktopCategoryItems = document.querySelectorAll('.category-nav-item');
    desktopCategoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            setActiveCategory(category);
        });
    });

    // Mobile category cards
    const mobileCategoryCards = document.querySelectorAll('.mobile-category-card');
    mobileCategoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            setActiveCategory(category);
        });
    });

    // Real-time conversion on input
    const inputValue = document.getElementById('inputValue');
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');

    [inputValue, fromUnit, toUnit].forEach(element => {
        element.addEventListener('input', debounce(performConversion, 300));
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

    // Update desktop navigation
    document.querySelectorAll('.category-nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-category') === category) {
            item.classList.add('active');
        }
    });

    // Update mobile navigation
    document.querySelectorAll('.mobile-category-card').forEach(card => {
        card.classList.remove('active');
        if (card.getAttribute('data-category') === category) {
            card.classList.add('active');
        }
    });

    // Update interface
    populateUnitSelectors();
    updateQuickReference();
    updateCategoryDisplay();
    clearResults();

    showNotification(`Switched to ${conversionData[category].name} converter`, 'info');
}

// Update category display
function updateCategoryDisplay() {
    const categoryData = conversionData[currentCategory];
    
    // Update category header
    const iconElement = document.getElementById('currentCategoryIcon');
    const titleElement = document.getElementById('currentCategoryTitle');
    const descElement = document.getElementById('currentCategoryDesc');
    
    if (iconElement) iconElement.textContent = categoryData.icon;
    if (titleElement) titleElement.textContent = `${categoryData.name} Converter`;
    if (descElement) descElement.textContent = categoryData.description;
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
        clearResults();
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
        clearResults();
    }
}

// Convert standard units (non-temperature)
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
        case 'rankine':
            celsius = (value - 491.67) * 5/9;
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
        case 'rankine':
            return celsius * 9/5 + 491.67;
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
        kelvin: 'K',
        rankine: '°R'
    };

    return `${input}${symbols[fromUnit]} = ${formatNumber(result)}${symbols[toUnit]}`;
}

// Display result
function displayResult(result, formula) {
    document.getElementById('resultValue').textContent = formatNumber(result);
    document.getElementById('resultFormula').textContent = formula;

    // Add animation
    const resultCard = document.getElementById('conversionResult');
    resultCard.classList.add('result-updated');
    setTimeout(() => resultCard.classList.remove('result-updated'), 300);
}

// Clear results
function clearResults() {
    document.getElementById('resultValue').textContent = '-';
    document.getElementById('resultFormula').textContent = '-';
}

// Clear entire converter
function clearConverter() {
    document.getElementById('inputValue').value = '';
    document.getElementById('fromUnit').selectedIndex = 0;
    document.getElementById('toUnit').selectedIndex = 0;
    clearResults();
    showNotification('Converter cleared', 'info');
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
        showNotification('Units swapped', 'info');
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

// Debounce function for performance
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

// Navigation functions for tool cards
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

console.log('PRATIX FINANCE Enhanced Unit Converter initialized successfully!');
