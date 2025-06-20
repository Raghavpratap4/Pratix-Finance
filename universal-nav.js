
// FIXED & ENHANCED: Universal Tab Navigation Script for PRATIX FINANCE Calculators
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Universal Navigation: Initializing...');
    
    // Enhanced error handling wrapper with better logging
    function safeExecute(fn, errorMsg) {
        try {
            return fn();
        } catch (error) {
            console.warn('⚠️', errorMsg, error);
            return false;
        }
    }

    // Performance optimization: Debounced function
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

    // Get all navigation items with better error handling
    const desktopNavItems = safeExecute(() => 
        document.querySelectorAll('.tab-navigation .tab-nav-item[data-tab], .tab-nav-item[data-tab]')
    , 'Error finding desktop nav items') || [];
    
    const mobileNavItems = safeExecute(() => 
        document.querySelectorAll('.standard-bottom-nav .standard-nav-item[data-tab], .bottom-nav .nav-item[data-tab]')
    , 'Error finding mobile nav items') || [];
    
    const allNavItems = [...desktopNavItems, ...mobileNavItems];
    const tabContents = safeExecute(() => 
        document.querySelectorAll('.tab-content')
    , 'Error finding tab contents') || [];

    console.log(`Navigation: Found ${allNavItems.length} nav items and ${tabContents.length} tab contents`);

    // ENHANCED: Tab switching function with mobile optimization
    function switchTab(targetTab) {
        if (!targetTab) {
            console.warn('❌ No target tab specified');
            return;
        }
        
        console.log('🎯 Switching to tab:', targetTab);

        // Performance: Use requestAnimationFrame for smooth transitions
        requestAnimationFrame(() => {
        
        // Remove active class from all navigation items and tab contents
            allNavItems.forEach(item => {
                safeExecute(() => item.classList.remove('active'), 'Error removing active class from nav item');
            });
            
            tabContents.forEach(content => {
                safeExecute(() => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                }, 'Error removing active class from tab content');
            });

            // Enhanced navigation item selection with multiple selectors
            const navSelectors = [
                `.tab-navigation .tab-nav-item[data-tab="${targetTab}"]`,
                `.tab-nav-item[data-tab="${targetTab}"]`,
                `.standard-bottom-nav .standard-nav-item[data-tab="${targetTab}"]`,
                `.bottom-nav .nav-item[data-tab="${targetTab}"]`,
                `[data-tab="${targetTab}"]`
            ];

            // Find and activate all matching navigation items
            navSelectors.forEach(selector => {
                const navItems = document.querySelectorAll(selector);
                navItems.forEach(item => {
                    if (item) {
                        safeExecute(() => item.classList.add('active'), `Error activating nav item: ${selector}`);
                    }
                });
            });

            // Show corresponding tab content with smooth transition
            const activeTabContent = safeExecute(() => 
                document.getElementById(targetTab)
            , 'Error finding tab content');
            
            if (activeTabContent) {
                safeExecute(() => {
                    activeTabContent.style.display = 'block';
                    activeTabContent.classList.add('active');
                    // Add smooth transition
                    activeTabContent.style.opacity = '0';
                    setTimeout(() => {
                        activeTabContent.style.opacity = '1';
                    }, 10);
                }, 'Error activating tab content');
                console.log('✅ Tab content activated:', targetTab);
            } else {
                console.warn('❌ Tab content not found for:', targetTab);
            }

        // Enhanced scrolling with device detection and performance optimization
            safeExecute(() => {
                const scrollToTop = debounce(() => {
                    if (window.innerWidth >= 1024) {
                        // Desktop: Scroll main content area
                        const mainAppContent = document.querySelector('.main-app-content');
                        if (mainAppContent) {
                            mainAppContent.scrollTop = 0;
                        }
                    } else {
                        // Mobile/Tablet: Smooth scroll to top
                        if ('scrollBehavior' in document.documentElement.style) {
                            window.scrollTo({ 
                                top: 0, 
                                behavior: 'smooth' 
                            });
                        } else {
                            // Fallback for older browsers
                            window.scrollTo(0, 0);
                        }
                        
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            mainContent.scrollTop = 0;
                        }
                    }
                }, 100);
                
                scrollToTop();
            }, 'Error during scroll handling');
        });
    }

    // Enhanced event listener setup
    allNavItems.forEach((item, index) => {
        const handleTabSwitch = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = this.getAttribute('data-tab');
            console.log(`Tab clicked (${index}):`, targetTab);
            
            if (targetTab) {
                switchTab(targetTab);
            } else {
                console.warn('No data-tab attribute found on nav item');
            }
        };
        
        // Add multiple event types for better cross-device support
        ['click', 'touchend'].forEach(eventType => {
            safeExecute(() => {
                item.addEventListener(eventType, handleTabSwitch, { passive: false });
            }, `Error adding ${eventType} listener to nav item`);
        });
        
        // Prevent unwanted touch behaviors
        safeExecute(() => {
            item.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
        }, 'Error adding touchstart listener');
    });

    // Enhanced initialization
    safeExecute(() => {
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
    }, 'Error during initialization');

    // FIXED: Enhanced mobile navigation visibility
    function ensureMobileNavVisibility() {
        safeExecute(() => {
            const mobileNavs = document.querySelectorAll('.standard-bottom-nav, .bottom-nav');
            const isMobile = window.innerWidth <= 1023;
            
            mobileNavs.forEach(mobileNav => {
                if (mobileNav && isMobile) {
                    // Force mobile nav visibility
                    const styles = {
                        display: 'grid',
                        visibility: 'visible',
                        opacity: '1',
                        position: 'fixed',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        zIndex: '999999',
                        width: '100vw',
                        transform: 'translateZ(0)',
                        willChange: 'transform',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '0.25rem'
                    };
                    
                    Object.assign(mobileNav.style, styles);
                } else if (mobileNav && !isMobile) {
                    // Hide on desktop
                    mobileNav.style.display = 'none';
                }
            });
            
            // Adjust body padding
            document.body.style.paddingBottom = isMobile ? '100px' : '0';
            
        }, 'Error ensuring mobile nav visibility');
    }

    // Call immediately and on resize
    ensureMobileNavVisibility();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(ensureMobileNavVisibility, 150);
    });
    
    // Force check after DOM is fully ready
    setTimeout(ensureMobileNavVisibility, 100);
    setTimeout(ensureMobileNavVisibility, 500);

    // Enhanced keyboard navigation
    document.addEventListener('keydown', function(e) {
        safeExecute(() => {
            if (e.key === 'Tab' && e.target.hasAttribute('data-tab')) {
                e.target.addEventListener('keydown', function(ke) {
                    if (ke.key === 'Enter' || ke.key === ' ') {
                        ke.preventDefault();
                        this.click();
                    }
                }, { once: true });
            }
        }, 'Error handling keyboard navigation');
    });

    console.log('Universal Navigation: Initialized successfully');
});

// FIXED: Global navigation functions with error handling
function safeNavigate(url) {
    try {
        if (url && typeof url === 'string') {
            window.location.href = url.startsWith('/') ? url : '/' + url;
        } else {
            console.warn('Invalid URL provided to navigation function');
        }
    } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to home
        window.location.href = '/index.html';
    }
}

function goBack() {
    try {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            safeNavigate('index.html');
        }
    } catch (error) {
        console.error('Go back error:', error);
        safeNavigate('index.html');
    }
}

function goToHome() {
    safeNavigate('index.html');
}

function goToEmiCalculator() {
    safeNavigate('emi-calculator.html');
}

function goToSipCalculator() {
    safeNavigate('sip-calculator.html');
}

function goToGstCalculator() {
    safeNavigate('gst-calculator.html');
}

function goToTaxCalculator() {
    safeNavigate('tax-calculator.html');
}

function goToFdCalculator() {
    safeNavigate('fd-calculator.html');
}
