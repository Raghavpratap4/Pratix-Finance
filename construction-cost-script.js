
// Construction Cost Calculator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Construction Cost Calculator loaded');

    // Initialize all calculators
    initializeConstructionCalculator();
    setupEventListeners();
    
    // Chart variables
    let houseConstructionChart = null;
    let commercialConstructionChart = null;
});

// Initialize Construction Calculator
function initializeConstructionCalculator() {
    // Set default values for house construction
    document.getElementById('plotLength').value = '';
    document.getElementById('plotWidth').value = '';
    document.getElementById('constructionArea').value = '';
    document.getElementById('floors').value = '1';
    document.getElementById('constructionType').value = 'standard';
    document.getElementById('location').value = '1.0';
    
    // Hide custom rate initially
    toggleCustomRate();
    
    // Initialize renovation checkboxes
    setupRenovationCheckboxes();
}

// Setup event listeners
function setupEventListeners() {
    // Construction type change
    const constructionType = document.getElementById('constructionType');
    if (constructionType) {
        constructionType.addEventListener('change', toggleCustomRate);
    }
    
    // Auto-calculate plot area
    const plotLength = document.getElementById('plotLength');
    const plotWidth = document.getElementById('plotWidth');
    const constructionArea = document.getElementById('constructionArea');
    
    if (plotLength && plotWidth && constructionArea) {
        [plotLength, plotWidth].forEach(input => {
            input.addEventListener('input', function() {
                if (plotLength.value && plotWidth.value) {
                    const plotArea = parseFloat(plotLength.value) * parseFloat(plotWidth.value);
                    const builtUpArea = Math.floor(plotArea * 0.6); // 60% of plot area
                    constructionArea.placeholder = `Suggested: ${builtUpArea} sq ft (60% of plot)`;
                }
            });
        });
    }
}

// Toggle custom rate visibility
function toggleCustomRate() {
    const constructionType = document.getElementById('constructionType');
    const customRateGroup = document.getElementById('customRateGroup');
    
    if (constructionType && customRateGroup) {
        if (constructionType.value === 'custom') {
            customRateGroup.style.display = 'block';
        } else {
            customRateGroup.style.display = 'none';
        }
    }
}

// Setup renovation checkboxes
function setupRenovationCheckboxes() {
    const checkboxes = [
        { checkbox: 'kitchenReno', input: 'kitchenCost' },
        { checkbox: 'bathroomReno', input: 'bathroomCost' },
        { checkbox: 'bedroomReno', input: 'bedroomCost' },
        { checkbox: 'livingReno', input: 'livingCost' }
    ];
    
    checkboxes.forEach(item => {
        const checkbox = document.getElementById(item.checkbox);
        const input = document.getElementById(item.input);
        
        if (checkbox && input) {
            checkbox.addEventListener('change', function() {
                input.disabled = !this.checked;
                if (!this.checked) {
                    input.value = '';
                }
            });
        }
    });
}

// House Construction Calculator
function calculateHouseConstruction() {
    try {
        // Get input values
        const constructionArea = parseFloat(document.getElementById('constructionArea').value);
        const floors = parseInt(document.getElementById('floors').value);
        const constructionType = document.getElementById('constructionType').value;
        const location = parseFloat(document.getElementById('location').value);
        const customRate = parseFloat(document.getElementById('customRate').value) || 0;
        
        // Additional costs
        const electricalCost = parseFloat(document.getElementById('electricalCost').value) || 0;
        const plumbingCost = parseFloat(document.getElementById('plumbingCost').value) || 0;
        const interiorCost = parseFloat(document.getElementById('interiorCost').value) || 0;
        const approvalCost = parseFloat(document.getElementById('approvalCost').value) || 0;
        
        // Validate inputs
        if (!constructionArea || constructionArea <= 0) {
            showNotification('Please enter a valid construction area', 'error');
            return;
        }
        
        // Calculate basic rates
        const rates = {
            basic: 1200,
            standard: 1500,
            premium: 2000,
            luxury: 2500,
            custom: customRate
        };
        
        const baseRate = rates[constructionType] || rates.standard;
        const totalArea = constructionArea * floors;
        const adjustedRate = baseRate * location;
        
        // Calculate basic construction cost
        const basicConstructionCost = totalArea * adjustedRate;
        
        // Calculate additional costs (if not provided, use defaults)
        const electricalWorkCost = electricalCost || (basicConstructionCost * 0.08);
        const plumbingWorkCost = plumbingCost || (basicConstructionCost * 0.06);
        const interiorWorkCost = interiorCost || (basicConstructionCost * 0.15);
        const approvalWorkCost = approvalCost || (basicConstructionCost * 0.03);
        
        // Calculate total project cost
        const totalProjectCost = basicConstructionCost + electricalWorkCost + 
                                 plumbingWorkCost + interiorWorkCost + approvalWorkCost;
        
        const costPerSqFt = totalProjectCost / totalArea;
        
        // Update results
        updateHouseConstructionResults({
            totalProjectCost,
            costPerSqFt,
            basicConstructionCost,
            electricalWorkCost,
            plumbingWorkCost,
            interiorWorkCost,
            approvalWorkCost
        });
        
        // Show results
        document.getElementById('houseConstructionResults').style.display = 'block';
        
        // Create chart
        createHouseConstructionChart({
            basicConstructionCost,
            electricalWorkCost,
            plumbingWorkCost,
            interiorWorkCost,
            approvalWorkCost
        });
        
        showNotification('House construction cost calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in house construction calculation:', error);
        showNotification('Error calculating construction cost. Please check your inputs.', 'error');
    }
}

// Update house construction results
function updateHouseConstructionResults(results) {
    document.getElementById('totalProjectCost').textContent = formatCurrency(results.totalProjectCost);
    document.getElementById('costPerSqFt').textContent = formatCurrency(results.costPerSqFt);
    document.getElementById('basicConstructionCost').textContent = formatCurrency(results.basicConstructionCost);
    document.getElementById('electricalWorkCost').textContent = formatCurrency(results.electricalWorkCost);
    document.getElementById('plumbingWorkCost').textContent = formatCurrency(results.plumbingWorkCost);
    document.getElementById('interiorWorkCost').textContent = formatCurrency(results.interiorWorkCost);
    document.getElementById('approvalWorkCost').textContent = formatCurrency(results.approvalWorkCost);
}

// Create house construction chart
function createHouseConstructionChart(data) {
    const ctx = document.getElementById('houseConstructionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (houseConstructionChart) {
        houseConstructionChart.destroy();
    }
    
    houseConstructionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Basic Construction', 'Electrical Work', 'Plumbing Work', 'Interior & Finishing', 'Approvals'],
            datasets: [{
                data: [
                    data.basicConstructionCost,
                    data.electricalWorkCost,
                    data.plumbingWorkCost,
                    data.interiorWorkCost,
                    data.approvalWorkCost
                ],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(255, 0, 128, 0.8)',
                    'rgba(255, 206, 84, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 212, 255, 1)',
                    'rgba(0, 255, 136, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(255, 0, 128, 1)',
                    'rgba(255, 206, 84, 1)'
                ],
                borderWidth: 2
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
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.parsed);
                            const percentage = ((context.parsed / data.totalProjectCost) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Commercial Construction Calculator
function calculateCommercialConstruction() {
    try {
        // Get input values
        const commercialType = document.getElementById('commercialType').value;
        const commercialArea = parseFloat(document.getElementById('commercialArea').value);
        const commercialFloors = parseInt(document.getElementById('commercialFloors').value) || 1;
        const parkingArea = parseFloat(document.getElementById('parkingArea').value) || 0;
        const hvacSystem = document.getElementById('hvacSystem').value;
        const elevators = parseInt(document.getElementById('elevators').value) || 0;
        const fireSystem = document.getElementById('fireSystem').value;
        const securitySystem = document.getElementById('securitySystem').value;
        
        // Validate inputs
        if (!commercialArea || commercialArea <= 0) {
            showNotification('Please enter a valid commercial area', 'error');
            return;
        }
        
        // Commercial building rates
        const commercialRates = {
            office: 1800,
            retail: 1600,
            warehouse: 800,
            hospital: 2200,
            hotel: 2500,
            mall: 2000
        };
        
        // HVAC rates
        const hvacRates = {
            basic: 200,
            standard: 350,
            premium: 500
        };
        
        // Fire safety rates
        const fireRates = {
            basic: 80,
            advanced: 150
        };
        
        // Security system rates
        const securityRates = {
            basic: 50,
            advanced: 120
        };
        
        // Calculate costs
        const baseConstructionCost = commercialArea * commercialRates[commercialType];
        const hvacCost = commercialArea * hvacRates[hvacSystem];
        const elevatorCost = elevators * 1500000; // ₹15 lakhs per elevator
        const fireCost = commercialArea * fireRates[fireSystem];
        const securityCost = commercialArea * securityRates[securitySystem];
        const parkingCost = parkingArea * 300; // ₹300 per sq ft for parking
        
        const totalCommercialCost = baseConstructionCost + hvacCost + elevatorCost + 
                                   fireCost + securityCost + parkingCost;
        const commercialCostPerSqFt = totalCommercialCost / commercialArea;
        
        // Update results
        document.getElementById('totalCommercialCost').textContent = formatCurrency(totalCommercialCost);
        document.getElementById('commercialCostPerSqFt').textContent = formatCurrency(commercialCostPerSqFt);
        
        // Show results
        document.getElementById('commercialConstructionResults').style.display = 'block';
        
        // Create chart
        createCommercialConstructionChart({
            baseConstructionCost,
            hvacCost,
            elevatorCost,
            fireCost,
            securityCost,
            parkingCost
        });
        
        showNotification('Commercial construction cost calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in commercial construction calculation:', error);
        showNotification('Error calculating commercial cost. Please check your inputs.', 'error');
    }
}

// Create commercial construction chart
function createCommercialConstructionChart(data) {
    const ctx = document.getElementById('commercialConstructionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (commercialConstructionChart) {
        commercialConstructionChart.destroy();
    }
    
    commercialConstructionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Base Construction', 'HVAC System', 'Elevators', 'Fire Safety', 'Security', 'Parking'],
            datasets: [{
                label: 'Cost (₹)',
                data: [
                    data.baseConstructionCost,
                    data.hvacCost,
                    data.elevatorCost,
                    data.fireCost,
                    data.securityCost,
                    data.parkingCost
                ],
                backgroundColor: 'rgba(0, 212, 255, 0.8)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 1
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
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return formatCurrency(value);
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
    });
}

// Renovation Calculator
function calculateRenovation() {
    try {
        const renovationType = document.getElementById('renovationType').value;
        const renovationArea = parseFloat(document.getElementById('renovationArea').value);
        
        // Get room-specific costs
        const kitchenCost = document.getElementById('kitchenReno').checked ? 
                           (parseFloat(document.getElementById('kitchenCost').value) || 150000) : 0;
        const bathroomCost = document.getElementById('bathroomReno').checked ? 
                            (parseFloat(document.getElementById('bathroomCost').value) || 100000) : 0;
        const bedroomCost = document.getElementById('bedroomReno').checked ? 
                           (parseFloat(document.getElementById('bedroomCost').value) || 80000) : 0;
        const livingCost = document.getElementById('livingReno').checked ? 
                          (parseFloat(document.getElementById('livingCost').value) || 120000) : 0;
        
        // Validate inputs
        if (!renovationArea || renovationArea <= 0) {
            showNotification('Please enter a valid renovation area', 'error');
            return;
        }
        
        // Renovation percentage factors
        const renovationFactors = {
            partial: 0.4,
            major: 0.7,
            complete: 1.0
        };
        
        // Base renovation cost per sq ft
        const baseRenovationRate = 800;
        const renovationFactor = renovationFactors[renovationType];
        const baseRenovationCost = renovationArea * baseRenovationRate * renovationFactor;
        
        // Total renovation cost
        const totalRenovationCost = baseRenovationCost + kitchenCost + bathroomCost + 
                                   bedroomCost + livingCost;
        
        // Update results
        document.getElementById('totalRenovationCost').textContent = formatCurrency(totalRenovationCost);
        
        // Show results
        document.getElementById('renovationResults').style.display = 'block';
        
        showNotification('Renovation cost calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in renovation calculation:', error);
        showNotification('Error calculating renovation cost. Please check your inputs.', 'error');
    }
}

// Material Calculator
function calculateMaterials() {
    try {
        const materialArea = parseFloat(document.getElementById('materialArea').value);
        
        // Validate inputs
        if (!materialArea || materialArea <= 0) {
            showNotification('Please enter a valid construction area', 'error');
            return;
        }
        
        // Material requirements per sq ft
        const materials = {
            cement: { quantity: 0.4, unit: 'bags', rate: 400 }, // bags per sq ft
            steel: { quantity: 4, unit: 'kg', rate: 65 }, // kg per sq ft
            bricks: { quantity: 8, unit: 'pieces', rate: 6 }, // pieces per sq ft
            sand: { quantity: 1.2, unit: 'cft', rate: 30 }, // cubic feet per sq ft
            aggregate: { quantity: 2.4, unit: 'cft', rate: 35 }, // cubic feet per sq ft
            paint: { quantity: 0.18, unit: 'liters', rate: 180 } // liters per sq ft
        };
        
        let totalMaterialCost = 0;
        let materialBreakdownHTML = '';
        
        // Calculate material requirements
        for (const [material, data] of Object.entries(materials)) {
            const totalQuantity = materialArea * data.quantity;
            const materialCost = totalQuantity * data.rate;
            totalMaterialCost += materialCost;
            
            materialBreakdownHTML += `
                <div class="result-item">
                    <span class="result-label">${capitalizeFirst(material)} (${totalQuantity.toFixed(2)} ${data.unit})</span>
                    <span class="result-value">${formatCurrency(materialCost)}</span>
                </div>
            `;
        }
        
        // Update material breakdown
        document.getElementById('materialBreakdown').innerHTML = materialBreakdownHTML;
        
        // Update total cost
        document.getElementById('totalMaterialCost').textContent = formatCurrency(totalMaterialCost);
        
        // Show results
        document.getElementById('materialResults').style.display = 'block';
        
        showNotification('Material requirements calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in material calculation:', error);
        showNotification('Error calculating materials. Please check your inputs.', 'error');
    }
}

// Timeline Calculator
function calculateTimeline() {
    try {
        const timelineArea = parseFloat(document.getElementById('timelineArea').value);
        const complexity = document.getElementById('constructionComplexity').value;
        
        // Validate inputs
        if (!timelineArea || timelineArea <= 0) {
            showNotification('Please enter a valid construction area', 'error');
            return;
        }
        
        // Timeline calculation based on area and complexity
        const baseTimePerSqFt = 0.01; // 0.01 months per sq ft for moderate complexity
        const complexityFactors = {
            simple: 0.8,
            moderate: 1.0,
            complex: 1.3
        };
        
        const estimatedDuration = timelineArea * baseTimePerSqFt * complexityFactors[complexity];
        
        // Update results
        document.getElementById('estimatedDuration').textContent = `${estimatedDuration.toFixed(1)} months`;
        
        // Show results
        document.getElementById('timelineResults').style.display = 'block';
        
        showNotification('Project timeline calculated successfully!', 'success');
        
    } catch (error) {
        console.error('Error in timeline calculation:', error);
        showNotification('Error calculating timeline. Please check your inputs.', 'error');
    }
}

// Reset Functions
function resetHouseConstruction() {
    // Clear all input fields
    const inputs = ['plotLength', 'plotWidth', 'constructionArea', 'customRate', 
                   'electricalCost', 'plumbingCost', 'interiorCost', 'approvalCost'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Reset dropdowns
    document.getElementById('floors').value = '1';
    document.getElementById('constructionType').value = 'standard';
    document.getElementById('location').value = '1.0';
    
    // Hide results
    document.getElementById('houseConstructionResults').style.display = 'none';
    
    // Destroy chart
    if (houseConstructionChart) {
        houseConstructionChart.destroy();
        houseConstructionChart = null;
    }
    
    toggleCustomRate();
}

function resetCommercialConstruction() {
    // Clear all input fields
    const inputs = ['commercialArea', 'commercialFloors', 'parkingArea', 'elevators'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Reset dropdowns
    document.getElementById('commercialType').value = 'office';
    document.getElementById('hvacSystem').value = 'basic';
    document.getElementById('fireSystem').value = 'basic';
    document.getElementById('securitySystem').value = 'basic';
    
    // Hide results
    document.getElementById('commercialConstructionResults').style.display = 'none';
    
    // Destroy chart
    if (commercialConstructionChart) {
        commercialConstructionChart.destroy();
        commercialConstructionChart = null;
    }
}

function resetRenovation() {
    // Clear all input fields
    document.getElementById('renovationArea').value = '';
    
    // Reset checkboxes and costs
    const checkboxes = ['kitchenReno', 'bathroomReno', 'bedroomReno', 'livingReno'];
    const costs = ['kitchenCost', 'bathroomCost', 'bedroomCost', 'livingCost'];
    
    checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.checked = false;
    });
    
    costs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
            element.disabled = true;
        }
    });
    
    // Reset dropdown
    document.getElementById('renovationType').value = 'partial';
    
    // Hide results
    document.getElementById('renovationResults').style.display = 'none';
}

function resetMaterials() {
    document.getElementById('materialArea').value = '';
    document.getElementById('materialBreakdown').innerHTML = '';
    document.getElementById('materialResults').style.display = 'none';
}

function resetTimeline() {
    document.getElementById('timelineArea').value = '';
    document.getElementById('constructionComplexity').value = 'simple';
    document.getElementById('timelineResults').style.display = 'none';
}

// Utility Functions
function formatCurrency(amount) {
    if (amount >= 10000000) { // 1 crore or more
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 lakh or more
        return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(20px);
    `;
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #00ff88, #00d4ff)',
        error: 'linear-gradient(135deg, #ff4757, #ff6b7a)',
        info: 'linear-gradient(135deg, #667eea, #764ba2)'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Navigation functions
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Add CSS for animations
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
    
    .room-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .room-item label {
        display: flex;
        align-items: center;
        color: var(--text-secondary);
        font-weight: 600;
        cursor: pointer;
        margin: 0;
        text-transform: none;
        letter-spacing: normal;
        font-size: 1rem;
    }
    
    .room-item input[type="checkbox"] {
        margin-right: 0.5rem;
        width: 18px;
        height: 18px;
    }
    
    .room-item .input-wrapper {
        width: 200px;
    }
    
    .renovation-rooms {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    @media (max-width: 768px) {
        .room-item {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
        }
        
        .room-item .input-wrapper {
            width: 100%;
        }
    }
`;
document.head.appendChild(style);

console.log('Construction Cost Calculator script loaded successfully!');
