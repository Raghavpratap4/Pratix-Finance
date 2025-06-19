
// PRATIX FINANCE Unit Converter Script
// Comprehensive unit conversion with advanced features

document.addEventListener('DOMContentLoaded', function() {
    console.log('Unit Converter loaded successfully!');
    
    // Initialize all converters
    initializeInputListeners();
    setupFooterFunctionality();
    
    // Auto-clear all results on page load
    clearAllConverters();
});

// Conversion factors and formulas
const conversionFactors = {
    // Length conversions (all to meters)
    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        inch: 0.0254,
        foot: 0.3048,
        yard: 0.9144,
        mile: 1609.344,
        nautical_mile: 1852,
        light_year: 9.461e15
    },
    
    // Weight conversions (all to grams)
    weight: {
        gram: 1,
        kilogram: 1000,
        pound: 453.592,
        ounce: 28.3495,
        ton: 1000000,
        stone: 6350.29,
        carat: 0.2,
        milligram: 0.001
    },
    
    // Area conversions (all to square meters)
    area: {
        square_meter: 1,
        square_kilometer: 1000000,
        square_centimeter: 0.0001,
        square_foot: 0.092903,
        square_inch: 0.00064516,
        square_yard: 0.836127,
        acre: 4046.86,
        hectare: 10000,
        square_mile: 2590000
    },
    
    // Volume conversions (all to liters)
    volume: {
        liter: 1,
        milliliter: 0.001,
        cubic_meter: 1000,
        cubic_centimeter: 0.001,
        gallon_us: 3.78541,
        gallon_uk: 4.54609,
        quart: 0.946353,
        pint: 0.473176,
        cup: 0.236588,
        fluid_ounce: 0.0295735,
        tablespoon: 0.0147868,
        teaspoon: 0.00492892
    },
    
    // Speed conversions (all to m/s)
    speed: {
        ms: 1,
        kmh: 0.277778,
        mph: 0.44704,
        fps: 0.3048,
        knot: 0.514444,
        mach: 343
    },
    
    // Time conversions (all to seconds)
    time: {
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2629746,
        year: 31556952,
        millisecond: 0.001,
        microsecond: 0.000001
    },
    
    // Energy conversions (all to joules)
    energy: {
        joule: 1,
        kilojoule: 1000,
        calorie: 4.184,
        kilocalorie: 4184,
        watt_hour: 3600,
        kilowatt_hour: 3600000,
        btu: 1055.06,
        erg: 0.0000001
    },
    
    // Pressure conversions (all to pascals)
    pressure: {
        pascal: 1,
        kilopascal: 1000,
        bar: 100000,
        atmosphere: 101325,
        psi: 6894.76,
        torr: 133.322,
        mmhg: 133.322,
        inhg: 3386.39
    }
};

// Temperature conversion functions (special case)
function convertTemperatureValue(value, fromUnit, toUnit) {
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
    }
    
    // Convert from Celsius to target unit
    let result;
    switch(toUnit) {
        case 'celsius':
            result = celsius;
            break;
        case 'fahrenheit':
            result = celsius * 9/5 + 32;
            break;
        case 'kelvin':
            result = celsius + 273.15;
            break;
        case 'rankine':
            result = celsius * 9/5 + 491.67;
            break;
    }
    
    return result;
}

// Generic conversion function
function convertUnit(value, fromUnit, toUnit, type) {
    if (type === 'temperature') {
        return convertTemperatureValue(value, fromUnit, toUnit);
    }
    
    const factors = conversionFactors[type];
    if (!factors || !factors[fromUnit] || !factors[toUnit]) {
        throw new Error('Invalid conversion units');
    }
    
    // Convert to base unit, then to target unit
    const baseValue = value * factors[fromUnit];
    return baseValue / factors[toUnit];
}

// Utility functions
function formatNumber(num) {
    if (Math.abs(num) >= 1e9) {
        return num.toExponential(6);
    } else if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(4) + 'M';
    } else if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(4) + 'K';
    } else if (Math.abs(num) < 0.001 && num !== 0) {
        return num.toExponential(6);
    } else {
        return num.toFixed(8).replace(/\.?0+$/, '');
    }
}

function getUnitName(unit, type) {
    const unitNames = {
        length: {
            meter: 'Meter (m)',
            kilometer: 'Kilometer (km)',
            centimeter: 'Centimeter (cm)',
            millimeter: 'Millimeter (mm)',
            inch: 'Inch (in)',
            foot: 'Foot (ft)',
            yard: 'Yard (yd)',
            mile: 'Mile (mi)',
            nautical_mile: 'Nautical Mile',
            light_year: 'Light Year'
        },
        weight: {
            gram: 'Gram (g)',
            kilogram: 'Kilogram (kg)',
            pound: 'Pound (lb)',
            ounce: 'Ounce (oz)',
            ton: 'Metric Ton',
            stone: 'Stone',
            carat: 'Carat',
            milligram: 'Milligram (mg)'
        },
        temperature: {
            celsius: 'Celsius (°C)',
            fahrenheit: 'Fahrenheit (°F)',
            kelvin: 'Kelvin (K)',
            rankine: 'Rankine (°R)'
        }
    };
    
    return unitNames[type] && unitNames[type][unit] || unit;
}

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
    }, 4000);
}

// Individual converter functions
function convertLength() {
    try {
        const input = document.getElementById('lengthInput').value;
        const fromUnit = document.getElementById('lengthFromUnit').value;
        const toUnit = document.getElementById('lengthToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'length');
        
        document.getElementById('lengthResultValue').textContent = 
            `${formatNumber(result)} ${getUnitName(toUnit, 'length').split('(')[1]?.replace(')', '') || toUnit}`;
        
        document.getElementById('lengthFormula').textContent = 
            `${input} ${getUnitName(fromUnit, 'length').split('(')[1]?.replace(')', '') || fromUnit} = ${formatNumber(result)} ${getUnitName(toUnit, 'length').split('(')[1]?.replace(')', '') || toUnit}`;
        
        showNotification('Length converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertWeight() {
    try {
        const input = document.getElementById('weightInput').value;
        const fromUnit = document.getElementById('weightFromUnit').value;
        const toUnit = document.getElementById('weightToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'weight');
        
        document.getElementById('weightResultValue').textContent = 
            `${formatNumber(result)} ${getUnitName(toUnit, 'weight').split('(')[1]?.replace(')', '') || toUnit}`;
        
        document.getElementById('weightFormula').textContent = 
            `${input} ${getUnitName(fromUnit, 'weight').split('(')[1]?.replace(')', '') || fromUnit} = ${formatNumber(result)} ${getUnitName(toUnit, 'weight').split('(')[1]?.replace(')', '') || toUnit}`;
        
        showNotification('Weight converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertArea() {
    try {
        const input = document.getElementById('areaInput').value;
        const fromUnit = document.getElementById('areaFromUnit').value;
        const toUnit = document.getElementById('areaToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'area');
        
        document.getElementById('areaResultValue').textContent = 
            `${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        document.getElementById('areaFormula').textContent = 
            `${input} ${fromUnit.replace('_', ' ')} = ${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        showNotification('Area converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertVolume() {
    try {
        const input = document.getElementById('volumeInput').value;
        const fromUnit = document.getElementById('volumeFromUnit').value;
        const toUnit = document.getElementById('volumeToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'volume');
        
        document.getElementById('volumeResultValue').textContent = 
            `${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        document.getElementById('volumeFormula').textContent = 
            `${input} ${fromUnit.replace('_', ' ')} = ${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        showNotification('Volume converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertTemperature() {
    try {
        const input = document.getElementById('temperatureInput').value;
        const fromUnit = document.getElementById('temperatureFromUnit').value;
        const toUnit = document.getElementById('temperatureToUnit').value;
        
        if (input === '' || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertTemperatureValue(parseFloat(input), fromUnit, toUnit);
        
        document.getElementById('temperatureResultValue').textContent = 
            `${formatNumber(result)}°${toUnit.charAt(0).toUpperCase()}`;
        
        document.getElementById('temperatureFormula').textContent = 
            `${input}°${fromUnit.charAt(0).toUpperCase()} = ${formatNumber(result)}°${toUnit.charAt(0).toUpperCase()}`;
        
        showNotification('Temperature converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertSpeed() {
    try {
        const input = document.getElementById('speedInput').value;
        const fromUnit = document.getElementById('speedFromUnit').value;
        const toUnit = document.getElementById('speedToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'speed');
        
        document.getElementById('speedResultValue').textContent = 
            `${formatNumber(result)} ${toUnit}`;
        
        document.getElementById('speedFormula').textContent = 
            `${input} ${fromUnit} = ${formatNumber(result)} ${toUnit}`;
        
        showNotification('Speed converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertTime() {
    try {
        const input = document.getElementById('timeInput').value;
        const fromUnit = document.getElementById('timeFromUnit').value;
        const toUnit = document.getElementById('timeToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'time');
        
        document.getElementById('timeResultValue').textContent = 
            `${formatNumber(result)} ${toUnit}`;
        
        document.getElementById('timeFormula').textContent = 
            `${input} ${fromUnit} = ${formatNumber(result)} ${toUnit}`;
        
        showNotification('Time converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertEnergy() {
    try {
        const input = document.getElementById('energyInput').value;
        const fromUnit = document.getElementById('energyFromUnit').value;
        const toUnit = document.getElementById('energyToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'energy');
        
        document.getElementById('energyResultValue').textContent = 
            `${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        document.getElementById('energyFormula').textContent = 
            `${input} ${fromUnit.replace('_', ' ')} = ${formatNumber(result)} ${toUnit.replace('_', ' ')}`;
        
        showNotification('Energy converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

function convertPressure() {
    try {
        const input = document.getElementById('pressureInput').value;
        const fromUnit = document.getElementById('pressureFromUnit').value;
        const toUnit = document.getElementById('pressureToUnit').value;
        
        if (!input || isNaN(input)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const result = convertUnit(parseFloat(input), fromUnit, toUnit, 'pressure');
        
        document.getElementById('pressureResultValue').textContent = 
            `${formatNumber(result)} ${toUnit}`;
        
        document.getElementById('pressureFormula').textContent = 
            `${input} ${fromUnit} = ${formatNumber(result)} ${toUnit}`;
        
        showNotification('Pressure converted successfully!');
    } catch (error) {
        showNotification('Conversion error: ' + error.message, 'error');
    }
}

// Clear functions
function clearLengthConverter() {
    document.getElementById('lengthInput').value = '';
    document.getElementById('lengthFromUnit').selectedIndex = 0;
    document.getElementById('lengthToUnit').selectedIndex = 1;
    document.getElementById('lengthResultValue').textContent = '-';
    document.getElementById('lengthFormula').textContent = '-';
    showNotification('Length converter cleared');
}

function clearWeightConverter() {
    document.getElementById('weightInput').value = '';
    document.getElementById('weightFromUnit').selectedIndex = 0;
    document.getElementById('weightToUnit').selectedIndex = 1;
    document.getElementById('weightResultValue').textContent = '-';
    document.getElementById('weightFormula').textContent = '-';
    showNotification('Weight converter cleared');
}

function clearAreaConverter() {
    document.getElementById('areaInput').value = '';
    document.getElementById('areaFromUnit').selectedIndex = 0;
    document.getElementById('areaToUnit').selectedIndex = 1;
    document.getElementById('areaResultValue').textContent = '-';
    document.getElementById('areaFormula').textContent = '-';
    showNotification('Area converter cleared');
}

function clearVolumeConverter() {
    document.getElementById('volumeInput').value = '';
    document.getElementById('volumeFromUnit').selectedIndex = 0;
    document.getElementById('volumeToUnit').selectedIndex = 1;
    document.getElementById('volumeResultValue').textContent = '-';
    document.getElementById('volumeFormula').textContent = '-';
    showNotification('Volume converter cleared');
}

function clearTemperatureConverter() {
    document.getElementById('temperatureInput').value = '';
    document.getElementById('temperatureFromUnit').selectedIndex = 0;
    document.getElementById('temperatureToUnit').selectedIndex = 1;
    document.getElementById('temperatureResultValue').textContent = '-';
    document.getElementById('temperatureFormula').textContent = '-';
    showNotification('Temperature converter cleared');
}

function clearSpeedConverter() {
    document.getElementById('speedInput').value = '';
    document.getElementById('speedFromUnit').selectedIndex = 0;
    document.getElementById('speedToUnit').selectedIndex = 1;
    document.getElementById('speedResultValue').textContent = '-';
    document.getElementById('speedFormula').textContent = '-';
    showNotification('Speed converter cleared');
}

function clearTimeConverter() {
    document.getElementById('timeInput').value = '';
    document.getElementById('timeFromUnit').selectedIndex = 0;
    document.getElementById('timeToUnit').selectedIndex = 1;
    document.getElementById('timeResultValue').textContent = '-';
    document.getElementById('timeFormula').textContent = '-';
    showNotification('Time converter cleared');
}

function clearEnergyConverter() {
    document.getElementById('energyInput').value = '';
    document.getElementById('energyFromUnit').selectedIndex = 0;
    document.getElementById('energyToUnit').selectedIndex = 1;
    document.getElementById('energyResultValue').textContent = '-';
    document.getElementById('energyFormula').textContent = '-';
    showNotification('Energy converter cleared');
}

function clearPressureConverter() {
    document.getElementById('pressureInput').value = '';
    document.getElementById('pressureFromUnit').selectedIndex = 0;
    document.getElementById('pressureToUnit').selectedIndex = 1;
    document.getElementById('pressureResultValue').textContent = '-';
    document.getElementById('pressureFormula').textContent = '-';
    showNotification('Pressure converter cleared');
}

function clearAllConverters() {
    // Clear all input fields and results
    const inputs = document.querySelectorAll('.calc-input[type="number"]');
    inputs.forEach(input => input.value = '');
    
    const resultValues = document.querySelectorAll('[id$="ResultValue"]');
    resultValues.forEach(element => element.textContent = '-');
    
    const formulas = document.querySelectorAll('[id$="Formula"]');
    formulas.forEach(element => element.textContent = '-');
}

// Input validation and real-time conversion
function initializeInputListeners() {
    const inputs = document.querySelectorAll('.calc-input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove invalid characters
            this.value = this.value.replace(/[^\d.-]/g, '');
            
            // Auto-convert if all fields are filled
            const tabId = this.closest('.tab-content').id;
            if (this.value && !isNaN(this.value)) {
                // Optional: Enable auto-conversion on input
                // setTimeout(() => autoConvert(tabId), 500);
            }
        });
        
        // Allow Enter key to trigger conversion
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const tabId = this.closest('.tab-content').id;
                const convertFunction = window[`convert${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`];
                if (convertFunction) {
                    convertFunction();
                }
            }
        });
    });
}

// Share functionality
function shareResults() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const tabId = activeTab.id;
    const resultElement = document.querySelector(`#${tabId}ResultValue`);
    const formulaElement = document.querySelector(`#${tabId}Formula`);
    
    if (!resultElement || resultElement.textContent === '-') {
        showNotification('No results to share. Please perform a conversion first.', 'error');
        return;
    }
    
    const shareText = `Unit Conversion Result:\n${formulaElement.textContent}\n\nCalculated using PRATIX FINANCE Unit Converter\n${window.location.href}`;
    
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

// Footer functionality
function setupFooterFunctionality() {
    // Setup collapsible footer sections
    const footerHeaders = document.querySelectorAll('.footer-section-header');
    footerHeaders.forEach(header => {
        header.addEventListener('click', function() {
            toggleFooterSection(this);
        });
    });
    
    // Setup footer navigation links
    const footerNavLinks = document.querySelectorAll('.footer-link-collapsible[data-tab]');
    footerNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            const tabNavItem = document.querySelector(`.tab-nav-item[data-tab="${tabId}"]`);
            if (tabNavItem) {
                tabNavItem.click();
            }
        });
    });
}

function toggleFooterSection(header) {
    const content = header.nextElementSibling;
    const expandIcon = header.querySelector('.footer-expand-icon');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        expandIcon.textContent = '+';
        expandIcon.style.transform = 'rotate(0deg)';
        header.classList.remove('active');
    } else {
        // Close other sections
        document.querySelectorAll('.footer-section-content.expanded').forEach(openContent => {
            openContent.classList.remove('expanded');
            openContent.previousElementSibling.querySelector('.footer-expand-icon').textContent = '+';
            openContent.previousElementSibling.querySelector('.footer-expand-icon').style.transform = 'rotate(0deg)';
            openContent.previousElementSibling.classList.remove('active');
        });
        
        // Open this section
        content.classList.add('expanded');
        expandIcon.textContent = '−';
        expandIcon.style.transform = 'rotate(180deg)';
        header.classList.add('active');
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

// Utility function for smooth number animation
function animateValue(element, start, end, duration = 1000) {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    function update() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const current = start + (end - start) * progress;
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

console.log('PRATIX FINANCE Unit Converter initialized successfully!');
