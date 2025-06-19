
// Universal Tab Navigation Script for PRATIX FINANCE Calculators
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation items (desktop and mobile)
    const desktopNavItems = document.querySelectorAll('.tab-navigation .tab-nav-item[data-tab]');
    const mobileNavItems = document.querySelectorAll('.standard-bottom-nav .standard-nav-item[data-tab]');
    const allNavItems = [...desktopNavItems, ...mobileNavItems];
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to switch between tabs
    function switchTab(targetTab) {
        console.log('Switching to tab:', targetTab);
        
        // Remove active class from all navigation items and tab contents
        allNavItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to corresponding navigation items (both desktop and mobile)
        const activeDesktopNav = document.querySelector(`.tab-navigation .tab-nav-item[data-tab="${targetTab}"]`);
        const activeMobileNav = document.querySelector(`.standard-bottom-nav .standard-nav-item[data-tab="${targetTab}"]`);
        
        if (activeDesktopNav) {
            activeDesktopNav.classList.add('active');
        }
        if (activeMobileNav) {
            activeMobileNav.classList.add('active');
        }

        // Show corresponding tab content
        const activeTabContent = document.getElementById(targetTab);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
            console.log('Tab content activated:', targetTab);
        }

        // Enhanced Auto Scroll to Top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        
        // Scroll window to top for mobile
        if (window.innerWidth <= 1023) {
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        }
        
        // Also scroll main app content
        const mainAppContent = document.querySelector('.main-app-content');
        if (mainAppContent) {
            mainAppContent.scrollTop = 0;
        }
        
        // Ensure body scroll is at top
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    // Add event listeners to all navigation items
    allNavItems.forEach(item => {
        const handleTabSwitch = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            if (targetTab) {
                switchTab(targetTab);
            }
        };
        
        // Add both click and touch events for better mobile support
        item.addEventListener('click', handleTabSwitch);
        item.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleTabSwitch.call(this, e);
        });
    });

    // Initialize with first active tab or first tab
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id;
        switchTab(tabId);
    } else if (allNavItems.length > 0) {
        const firstTab = allNavItems[0].getAttribute('data-tab');
        if (firstTab) {
            switchTab(firstTab);
        }
    }

    // Ensure mobile navigation is always visible
    function ensureMobileNavVisibility() {
        const mobileNav = document.querySelector('.standard-bottom-nav');
        if (mobileNav && window.innerWidth <= 1023) {
            mobileNav.style.display = 'grid';
            mobileNav.style.visibility = 'visible';
            mobileNav.style.opacity = '1';
            mobileNav.style.position = 'fixed';
            mobileNav.style.bottom = '0';
            mobileNav.style.left = '0';
            mobileNav.style.right = '0';
            mobileNav.style.zIndex = '999999999';
        }
    }

    // Call on load and resize
    ensureMobileNavVisibility();
    window.addEventListener('resize', ensureMobileNavVisibility);

    // Handle keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && e.target.hasAttribute('data-tab')) {
            e.target.addEventListener('keydown', function(ke) {
                if (ke.key === 'Enter' || ke.key === ' ') {
                    ke.preventDefault();
                    e.target.click();
                }
            });
        }
    });
});

// Global navigation functions
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/index.html';
    }
}

function goToHome() {
    window.location.href = '/index.html';
}

function goToEmiCalculator() {
    window.location.href = '/emi-calculator.html';
}

function goToSipCalculator() {
    window.location.href = '/sip-calculator.html';
}

function goToGstCalculator() {
    window.location.href = '/gst-calculator.html';
}

function goToTaxCalculator() {
    window.location.href = '/tax-calculator.html';
}

function goToFdCalculator() {
    window.location.href = '/fd-calculator.html';
}
