// ========================================
// Dynamic Loading Spinner
// ========================================
(function() {
    const currentPageName = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    const isCheckout = currentPageName.includes('cart.html') && window.location.search.includes('buyNow=true');
    const targetPages = [
        'products.html', 'product-detail.html', 'chia-seeds-detail.html',
        'flax-seeds-detail.html', 'sunflower-seeds-detail.html', 'mix-seeds-detail.html',
        'pumpkin-seeds-detail.html', 'watermelon-seeds-detail.html',
        'thankyou.html', 'track-order-details.html',
        'order-history.html', 'wishlist.html', 'cart.html'
    ];
    const shouldShow = targetPages.some(page => currentPageName.includes(page)) && !isCheckout;

    if (shouldShow) {
        const loaderHtml = `
            <div id="page-loader" class="page-loader-overlay">
                <div class="loader-container">
                    <div class="loader-spinner"></div>
                    <div class="loader-branding">
                        <span class="loader-logo-leaf">🌱</span>
                        <span class="loader-text">THE CLEEDS</span>
                    </div>
                </div>
            </div>
        `;
        document.addEventListener('DOMContentLoaded', function() {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = loaderHtml;
            const loaderEl = tempDiv.firstElementChild;
            document.body.appendChild(loaderEl);
            
            function fadeOutLoader() {
                if (loaderEl && !loaderEl.classList.contains('fade-out')) {
                    loaderEl.classList.add('fade-out');
                    setTimeout(() => {
                        if (loaderEl.parentNode) {
                            loaderEl.parentNode.removeChild(loaderEl);
                        }
                    }, 400);
                }
            }

            window.addEventListener('load', fadeOutLoader);
            setTimeout(fadeOutLoader, 600);
        });
    }
})();

// ========================================
// Load Navbar Component
// ========================================

/**
 * Fetches and loads the navbar HTML from navbar.html
 * Replaces the navbar-container div with the actual navbar
 */
function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        return Promise.resolve(false);
    }

    return fetch('navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load navbar');
            }
            return response.text();
        })
        .then(html => {
            navbarContainer.innerHTML = html;
            return true;
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            return false;
        });
}

// ========================================
// Load Footer Component
// ========================================

/**
 * Fetches and loads the brand information footer HTML from footer.html
 * Replaces the existing footer element dynamically
 */
function loadFooter() {
    const currentPageName = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    const isCheckout = currentPageName.includes('cart.html') && window.location.search.includes('buyNow=true');
    const excludePages = ['login.html', 'signup.html', 'order-success.html'];
    const shouldExclude = excludePages.some(page => currentPageName.includes(page)) || isCheckout;

    if (shouldExclude) {
        return Promise.resolve(false);
    }

    const existingFooter = document.querySelector('footer.footer');
    if (!existingFooter) {
        return Promise.resolve(false);
    }

    return fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer');
            }
            return response.text();
        })
        .then(html => {
            existingFooter.outerHTML = html;
            initBackToTop();
            return true;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            return false;
        });
}

// ========================================
// Back To Top Button Behavior
// ========================================

/**
 * Initializes scroll event listener and click event listener for Back To Top button
 */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Load navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadNavbar().then(function() {
        initializeNavbar();
    });

    loadFooter();

    initLoginForm();
    initTrackOrderSearchPage();
    renderTrackOrderDetailsPage();
    renderOrderHistoryPage();
    renderRelatedProductsSection();
    
    // Add wishlist initialization
    initWishlistIcons();
    updateWishlistCount();
    renderWishlistPage();

    // Add reviews initialization
    renderReviewsSection();

    // Add recently viewed initialization
    trackRecentlyViewed();
    renderRecentlyViewedSection();

    // Add stock status initialization
    renderStockStatus();

    // Initialize catalog dropdown price synchronization
    initSizeDropdowns();
    
    // Enable sparkle animation on click
    initSparkleAnimation();
    
    // Listen for storage changes (cart/wishlist updates from other pages/tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartCount();
        }
        if (e.key === 'seedWishlist') {
            updateWishlistCount();
            initWishlistIcons();
            renderWishlistPage();
        }
    });

    // Add homepage customer reviews initialization
    initHomepageReviews();
});

function initializeNavbar() {
    const currentPageName = window.location.pathname.split('/').pop() || 'index.html';
    const currentPage = currentPageName === 'track-order-details.html' ? 'thankyou.html' : currentPageName;

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    startTypewriterAnimation();
    initNavbarSearch();
    updateCartCount();
    updateWishlistCount();
}

// ========================================
// Typewriter Animation for Search
// ========================================

/**
 * Creates a typewriter effect on the search input placeholder
 * Types out "Search For Seeds" letter by letter (slow), then deletes it quickly (fast), and repeats
 */
function startTypewriterAnimation() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const fullText = 'Search For Seeds';
    const typingSpeed = 100;    // 100ms per character when typing
    const deletingSpeed = 50;   // 50ms per character when deleting
    let isDeleting = false;
    let displayText = '';
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
        if (isDeleting) {
            displayText = fullText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            displayText = fullText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        searchInput.placeholder = displayText;
        
        // If finished typing, start deleting after a pause
        if (!isDeleting && charIndex === fullText.length) {
            isDeleting = true;
        }
        
        // If finished deleting, start typing again
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
        }
    }, isDeleting ? deletingSpeed : typingSpeed);
}

/**
 * Normalizes search input for matching against product keywords.
 * @param {string} value
 * @returns {string}
 */
function normalizeSearchValue(value) {
    return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Product search targets for the shared navbar search bar.
 */
const NAVBAR_PRODUCT_SEARCH = [
    { terms: ['chia seeds', 'chia'], href: 'chia-seeds-detail.html' },
    { terms: ['flax seeds', 'flax'], href: 'flax-seeds-detail.html' },
    { terms: ['sunflower seeds', 'sunflower'], href: 'sunflower-seeds-detail.html' },
    { terms: ['mixed seeds', 'mixed', 'mix seeds', 'mix'], href: 'mix-seeds-detail.html' },
    { terms: ['watermelon seeds', 'watermelon'], href: 'watermelon-seeds-detail.html' },
    { terms: ['pumpkin seeds', 'pumpkin'], href: 'pumpkin-seeds-detail.html' }
];

/**
 * Finds the best product page for a search query.
 * @param {string} query
 * @returns {string|null}
 */
function getProductPageFromSearch(query) {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) {
        return null;
    }

    for (let i = 0; i < NAVBAR_PRODUCT_SEARCH.length; i++) {
        const product = NAVBAR_PRODUCT_SEARCH[i];
        for (let j = 0; j < product.terms.length; j++) {
            const term = product.terms[j];
            if (normalizedQuery === term || normalizedQuery.includes(term)) {
                return product.href;
            }
        }
    }

    return null;
}

/**
 * Wires search input and icon interactions for the shared navbar.
 */
function initNavbarSearch() {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.querySelector('.search-icon');
    const searchContainer = document.querySelector('.search-container');

    if (!searchInput || !searchContainer) {
        return;
    }

    // Create dropdown dynamically
    let dropdown = document.getElementById('search-suggestions');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-suggestions';
        dropdown.className = 'search-suggestions-dropdown';
        searchContainer.appendChild(dropdown);
    }

    const SEED_TYPES = [
        { key: 'chia', label: 'Chia', href: 'chia-seeds-detail.html' },
        { key: 'flax', label: 'Flax', href: 'flax-seeds-detail.html' },
        { key: 'sunflower', label: 'Sunflower', href: 'sunflower-seeds-detail.html' },
        { key: 'mixed', altKey: 'mix', label: 'Mixed', href: 'mix-seeds-detail.html' },
        { key: 'watermelon', label: 'Watermelon', href: 'watermelon-seeds-detail.html' },
        { key: 'pumpkin', label: 'Pumpkin', href: 'pumpkin-seeds-detail.html' }
    ];

    function renderSuggestions() {
        const query = searchInput.value;
        const q = query.toLowerCase().trim();

        if (!q) {
            dropdown.innerHTML = '';
            dropdown.classList.remove('show');
            return;
        }

        let html = '';

        if (q === 'seed' || q === 'seeds') {
            // Render all seed products
            html += `
                <div class="search-suggestions-section">
                    <div class="search-suggestions-section-title">Suggestions</div>
                    ${SEED_TYPES.map(type => `
                        <div class="search-suggestion-item" data-href="${type.href}">${type.label} Seeds</div>
                    `).join('')}
                </div>
                <div class="search-suggestions-section">
                    <div class="search-suggestions-section-title">Collections</div>
                    <div class="search-suggestion-item" data-href="products.html">Buy Flax, Chia, Pumpkin, Sunflower, Watermelon, and Mixed Seeds Online</div>
                </div>
            `;
        } else {
            // Filter specific variants
            const matched = SEED_TYPES.filter(type => {
                const mainMatch = type.key.indexOf(q) !== -1 || q.indexOf(type.key) !== -1;
                const altMatch = type.altKey && (type.altKey.indexOf(q) !== -1 || q.indexOf(type.altKey) !== -1);
                return mainMatch || altMatch;
            });

            if (matched.length > 0) {
                // Generate suggestions items
                const suggestionsHtml = matched.map(type => `
                    <div class="search-suggestion-item" data-href="${type.href}">${type.label} Seeds</div>
                    <div class="search-suggestion-item" data-href="${type.href}">${type.label} Seed</div>
                `).join('');

                // Generate collections items
                const collectionsHtml = matched.map(type => `
                    <div class="search-suggestion-item" data-href="${type.href}">${type.label}</div>
                `).join('');

                html += `
                    <div class="search-suggestions-section">
                        <div class="search-suggestions-section-title">Suggestions</div>
                        ${suggestionsHtml}
                    </div>
                    <div class="search-suggestions-section">
                        <div class="search-suggestions-section-title">Collections</div>
                        ${collectionsHtml}
                    </div>
                `;
            }
        }

        if (html) {
            dropdown.innerHTML = html;
            dropdown.classList.add('show');

            // Attach click event to all suggestions items
            dropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const href = this.getAttribute('data-href');
                    if (href) {
                        window.location.href = href;
                    }
                });
            });
        } else {
            dropdown.innerHTML = '';
            dropdown.classList.remove('show');
        }
    }

    // Input listener to update in real time
    searchInput.addEventListener('input', renderSuggestions);
    searchInput.addEventListener('focus', renderSuggestions);

    // Click outside to hide
    document.addEventListener('mousedown', function(event) {
        if (!searchContainer.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Existing search execution on Enter or click
    function performSearch() {
        const targetPage = getProductPageFromSearch(searchInput.value);
        if (targetPage) {
            window.location.href = targetPage;
            return;
        }

        window.alert('No product found. Please try another search.');
    }

    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    if (searchIcon) {
        searchIcon.addEventListener('click', function(event) {
            event.preventDefault();
            performSearch();
        });
    }
}

// ========================================
// Sparkle/Firework Click Animation
// ========================================

/**
 * Initializes the sparkle animation effect on page click
 * Creates colorful particles that burst outward from click position and fade away
 */
function initSparkleAnimation() {
    document.addEventListener('click', function(e) {
        createSparkles(e.clientX, e.clientY);
    });
}

/**
 * Creates subtle sparkle particles at the click position
 * @param {number} x - X coordinate of click
 * @param {number} y - Y coordinate of click
 */
function createSparkles(x, y) {
    const colors = ['#2d4a22', '#ffcc00']; // Forest green and gold
    const particleCount = 7; // 7 subtle particles
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        
        // Random color from theme colors
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random angle for subtle spread
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 2 + Math.random() * 1.5;
        const distance = velocity * 30; // Smaller spread distance
        
        // Calculate end position
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Set particle styles
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        particle.style.setProperty('--end-x', endX - x + 'px');
        particle.style.setProperty('--end-y', endY - y + 'px');
        
        document.body.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, 500);
    }
}

// ========================================
// Add to Cart Function
// ========================================

/**
 * Handles adding a product to the cart
 * Saves product info to localStorage and updates cart badge
 * 
 * @param {string} productName - Name of the product
 * @param {HTMLElement} button - The button element clicked
 */
function addToCart(productName, button) {
    const productNameShort = getShortProductName(productName);
    const stock = STOCK_DATA[productNameShort] || { status: 'in-stock', text: 'In Stock', emoji: '🟢' };
    if (stock.status === 'out-of-stock') {
        alert('Sorry, this product is out of stock.');
        return;
    }

    // Find the product card
    const productCard = button.closest('.product-card');
    const priceText = productCard.querySelector('.product-price').textContent;
    const price = parseFloat(priceText.replace('₹', ''));
    const imageElement = productCard.querySelector('.product-image img');
    const imageSrc = imageElement ? imageElement.src : '';
    
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            image: imageSrc,
            quantity: 1,
            id: Date.now()
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge();
    
    // Visual feedback
    button.textContent = '✓ Added';
    button.style.backgroundColor = '#223919';
    setTimeout(() => {
        button.textContent = 'Add to Cart';
        button.style.backgroundColor = '';
    }, 1500);

    // Show custom success modal
    showAddToCartSuccessModal();
}

/**
 * Updates the cart badge count in the navbar
 * Reads cart from localStorage and displays total items
 * Hides badge when empty, shows when items exist
 * This function runs on every page load for persistence
 */
function updateCartCount() {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('show');
            // Add pulse animation feedback only if count changed
            badge.style.animation = 'none';
            setTimeout(() => {
                badge.style.animation = 'badge-pulse 0.5s ease-out';
            }, 10);
        } else {
            badge.classList.remove('show');
        }
    } else {
        // Retry if badge not found (navbar might not be loaded yet)
        setTimeout(() => {
            const retryBadge = document.querySelector('.cart-badge');
            if (retryBadge) {
                if (totalItems > 0) {
                    retryBadge.textContent = totalItems;
                    retryBadge.classList.add('show');
                    retryBadge.style.animation = 'badge-pulse 0.5s ease-out';
                } else {
                    retryBadge.classList.remove('show');
                }
            }
        }, 100);
    }
}

/**
 * Alias for updateCartCount for backward compatibility
 * Deprecated: Use updateCartCount() instead
 */
function updateCartBadge() {
    updateCartCount();
}

/**
 * Related product data for the product detail pages.
 */
const RELATED_PRODUCTS = {
    'chia-seeds-detail.html': {
        name: 'The Cleeds Premium Chia Seeds',
        displayName: 'Chia Seeds',
        price: '₹130.00',
        image: '../images/Chia/front.png',
        href: 'chia-seeds-detail.html',
        related: ['flax-seeds-detail.html', 'sunflower-seeds-detail.html', 'mix-seeds-detail.html']
    },
    'product-detail.html': {
        name: 'The Cleeds Premium Chia Seeds',
        displayName: 'Chia Seeds',
        price: '₹130.00',
        image: '../images/Chia/front.png',
        href: 'chia-seeds-detail.html',
        related: ['flax-seeds-detail.html', 'sunflower-seeds-detail.html', 'mix-seeds-detail.html']
    },
    'flax-seeds-detail.html': {
        name: 'The Cleeds Premium Flax Seeds',
        displayName: 'Flax Seeds',
        price: '₹100.00',
        image: '../images/Flax/front.png',
        href: 'flax-seeds-detail.html',
        related: ['chia-seeds-detail.html', 'sunflower-seeds-detail.html', 'mix-seeds-detail.html']
    },
    'sunflower-seeds-detail.html': {
        name: 'The Cleeds Premium Sunflower Seeds',
        displayName: 'Sunflower Seeds',
        price: '₹110.00',
        image: '../images/Sunflower/front.png',
        href: 'sunflower-seeds-detail.html',
        related: ['chia-seeds-detail.html', 'flax-seeds-detail.html', 'mix-seeds-detail.html']
    },
    'mix-seeds-detail.html': {
        name: 'The Cleeds Premium 5-in-1 Mix Seeds',
        displayName: 'Mixed Seeds',
        price: '₹150.00',
        image: '../images/Mix/front.png',
        href: 'mix-seeds-detail.html',
        related: ['chia-seeds-detail.html', 'flax-seeds-detail.html', 'sunflower-seeds-detail.html']
    },
    'watermelon-seeds-detail.html': {
        name: 'The Cleeds Premium Watermelon Seeds',
        displayName: 'Watermelon Seeds',
        price: '₹150.00',
        image: '../images/Watermelon/front.png',
        href: 'watermelon-seeds-detail.html',
        related: ['pumpkin-seeds-detail.html', 'chia-seeds-detail.html', 'flax-seeds-detail.html']
    },
    'pumpkin-seeds-detail.html': {
        name: 'The Cleeds Premium Pumpkin Seeds',
        displayName: 'Pumpkin Seeds',
        price: '₹120.00',
        image: '../images/Pumpkin/front.png',
        href: 'pumpkin-seeds-detail.html',
        related: ['watermelon-seeds-detail.html', 'chia-seeds-detail.html', 'flax-seeds-detail.html']
    }
};

/**
 * Renders the "You May Also Like" section on product detail pages.
 */
function renderRelatedProductsSection() {
    const currentPage = window.location.pathname.split('/').pop();
    const product = RELATED_PRODUCTS[currentPage];

    if (!product) {
        return;
    }

    const footer = document.querySelector('footer.footer');
    if (!footer) {
        return;
    }

    const section = document.createElement('section');
    section.className = 'related-products-section';
    section.innerHTML = [
        '<h2 class="related-products-title">You May Also Like</h2>',
        '<div class="related-products-grid">',
        product.related.map(function(page) {
            const relatedProduct = RELATED_PRODUCTS[page];
            if (!relatedProduct) {
                return '';
            }

            return [
                '<a class="related-product-card" href="' + relatedProduct.href + '">',
                '<div class="related-product-image">',
                '<img src="' + relatedProduct.image + '" alt="' + relatedProduct.name + '">',
                '</div>',
                '<div class="related-product-body">',
                '<h3>' + relatedProduct.displayName + '</h3>',
                '<p class="related-product-price">' + relatedProduct.price + '</p>',
                '<span class="related-product-button">View Product</span>',
                '</div>',
                '</a>'
            ].join('');
        }).join(''),
        '</div>'
    ].join('');

    footer.parentNode.insertBefore(section, footer);
}

/**
 * Handles the login form submit flow.
 * Preserves native validation and shows a success toast before redirecting home.
 */
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    let redirectTimer = null;

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!loginForm.checkValidity()) {
            loginForm.reportValidity();
            return;
        }

        const submitButton = loginForm.querySelector('.btn-login');
        if (submitButton) {
            submitButton.disabled = true;
        }

        showLoginToast('Login Successful! Redirecting...');

        if (redirectTimer) {
            clearTimeout(redirectTimer);
        }

        redirectTimer = setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    });
}

/**
 * Shows a lightweight success toast on the login page.
 * @param {string} message
 */
function showLoginToast(message) {
    let toast = document.getElementById('login-success-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'login-success-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.style.position = 'fixed';
        toast.style.top = '24px';
        toast.style.left = '50%';
        toast.style.transform = 'translate(-50%, -12px)';
        toast.style.background = 'var(--forest-green)';
        toast.style.color = '#fff';
        toast.style.padding = '0.9rem 1.2rem';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 10px 30px rgba(34, 57, 25, 0.25)';
        toast.style.fontSize = '0.95rem';
        toast.style.fontWeight = '600';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        toast.style.maxWidth = 'calc(100vw - 2rem)';
        toast.style.textAlign = 'center';
        toast.style.pointerEvents = 'none';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
}

// ========================================
// Track Order Flow
// ========================================

const TRACKING_DETAILS_STORAGE_KEY = 'currentTrackingOrder';

function getStoredOrders() {
    const storedOrders = localStorage.getItem('seedOrders');
    if (!storedOrders) {
        return [];
    }

    try {
        const parsedOrders = JSON.parse(storedOrders);
        return Array.isArray(parsedOrders) ? parsedOrders : [];
    } catch (e) {
        console.error('Error parsing stored orders:', e);
        return [];
    }
}

function findOrderById(orderId) {
    if (!orderId || typeof orderId !== 'string') {
        return null;
    }
    const normalizedOrderId = orderId.trim().toUpperCase();
    const orders = getStoredOrders();
    return orders.find(order => {
        const storedOrderId = (order.orderId || order.id || '').toString().toUpperCase();
        return storedOrderId === normalizedOrderId;
    });
}

function normalizeTrackingStatus(status) {
    return (status || 'confirmed').toString().toLowerCase().replace(/\s+/g, '_');
}

function getTrackingStepIndex(status, createdAt, estimatedDelivery) {
    const normalizedStatus = normalizeTrackingStatus(status);
    const stepMap = {
        confirmed: 0,
        packed: 1,
        shipped: 2,
        out_for_delivery: 3,
        delivered: 4
    };

    let stepIndex = stepMap[normalizedStatus] !== undefined ? stepMap[normalizedStatus] : 0;

    const createdDate = createdAt ? new Date(createdAt) : null;
    const estimatedDate = estimatedDelivery ? new Date(estimatedDelivery) : null;
    if (createdDate && !Number.isNaN(createdDate.getTime())) {
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        let timeBasedIndex = 0;
        if (hoursElapsed >= 72) {
            timeBasedIndex = 4;
        } else if (hoursElapsed >= 48) {
            timeBasedIndex = 3;
        } else if (hoursElapsed >= 24) {
            timeBasedIndex = 2;
        } else if (hoursElapsed >= 12) {
            timeBasedIndex = 1;
        }

        stepIndex = Math.max(stepIndex, timeBasedIndex);
    }

    if (estimatedDate && !Number.isNaN(estimatedDate.getTime())) {
        const now = new Date();
        if (now >= estimatedDate) {
            stepIndex = 4;
        } else if (now.getTime() >= estimatedDate.getTime() - (24 * 60 * 60 * 1000)) {
            stepIndex = Math.max(stepIndex, 3);
        }
    }

    return stepIndex;
}

function formatEstimatedDelivery(dateValue) {
    if (!dateValue) {
        return 'Not available';
    }

    const deliveryDate = new Date(dateValue);
    if (Number.isNaN(deliveryDate.getTime())) {
        return dateValue;
    }

    return deliveryDate.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getEstimatedDeliveryDate() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toISOString();
}

function formatOrderDate(dateValue) {
    if (!dateValue) {
        return 'Not available';
    }

    const orderDate = new Date(dateValue);
    if (Number.isNaN(orderDate.getTime())) {
        return dateValue;
    }

    return orderDate.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function getOrderQuantity(order) {
    if (!order || !Array.isArray(order.items)) {
        return 0;
    }

    return order.items.reduce(function(total, item) {
        return total + (Number(item.quantity) || 0);
    }, 0);
}

function getOrderProductNames(order) {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
        return 'Not available';
    }

    return order.items.map(function(item) {
        return item.name;
    }).join(', ');
}

function normalizeOrderStatus(status) {
    const normalized = (status || 'confirmed').toString().toLowerCase().replace(/\s+/g, '_');
    const labels = {
        confirmed: 'Order Confirmed',
        packed: 'Packed',
        shipped: 'Shipped',
        delivered: 'Delivered'
    };

    return labels[normalized] || 'Order Confirmed';
}

function getOrderStatusClass(status) {
    const normalized = (status || 'confirmed').toString().toLowerCase().replace(/\s+/g, '_');
    return 'status-' + normalized;
}

function renderOrderHistoryPage() {
    const historyPage = document.querySelector('[data-order-history]');
    if (!historyPage) {
        return;
    }

    const ordersContainer = document.getElementById('order-history-list');
    const emptyState = document.getElementById('order-history-empty');
    if (!ordersContainer || !emptyState) {
        return;
    }

    const orders = getStoredOrders().slice().sort(function(a, b) {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    if (orders.length === 0) {
        ordersContainer.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    ordersContainer.innerHTML = orders.map(function(order) {
        const orderId = order.orderId || order.id || 'Not available';
        const quantity = getOrderQuantity(order);
        const totalAmount = Number(order.total || 0).toFixed(2);
        const productNames = getOrderProductNames(order);
        const trackUrl = 'thankyou.html?orderId=' + encodeURIComponent(orderId);
        const detailsUrl = 'track-order-details.html?orderId=' + encodeURIComponent(orderId);

        return [
            '<article class="order-card">',
            '<div class="order-card-header">',
            '<div>',
            '<p class="order-card-label">Order ID</p>',
            '<h3>' + orderId + '</h3>',
            '</div>',
            '<span class="order-status-badge ' + getOrderStatusClass(order.status) + '">' + normalizeOrderStatus(order.status) + '</span>',
            '</div>',
            '<div class="order-card-grid">',
            '<div><span class="order-card-label">Order Date</span><p>' + formatOrderDate(order.createdAt) + '</p></div>',
            '<div><span class="order-card-label">Product Name(s)</span><p>' + productNames + '</p></div>',
            '<div><span class="order-card-label">Quantity</span><p>' + quantity + '</p></div>',
            '<div><span class="order-card-label">Total Amount</span><p>₹' + totalAmount + '</p></div>',
            '</div>',
            '<div class="order-card-actions">',
            '<a class="btn order-action-btn btn-secondary" href="' + detailsUrl + '">View Order Details</a>',
            '<a class="btn order-action-btn" href="' + trackUrl + '">Track Order</a>',
            '</div>',
            '</article>'
        ].join('');
    }).join('');
}

function initTrackOrderSearchPage() {
    const form = document.getElementById('track-order-form');
    const input = document.getElementById('order-id-input');
    const errorMessage = document.getElementById('track-order-error');

    if (!form || !input) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderIdFromUrl = params.get('orderId');
    if (orderIdFromUrl) {
        input.value = orderIdFromUrl;
        
        // Auto-validate and handle if passed in URL
        const order = findOrderById(orderIdFromUrl);
        if (!order) {
            if (errorMessage) {
                errorMessage.textContent = 'We could not find your order. Please check the details you entered and try again.';
                errorMessage.classList.add('show');
            }
        } else {
            const trackingPayload = {
                orderId: order.orderId || order.id || orderIdFromUrl,
                estimatedDelivery: order.estimatedDelivery || getEstimatedDeliveryDate(),
                status: order.status || 'confirmed',
                createdAt: order.createdAt || new Date().toISOString()
            };
            sessionStorage.setItem(TRACKING_DETAILS_STORAGE_KEY, JSON.stringify(trackingPayload));
            window.location.href = 'track-order-details.html?orderId=' + encodeURIComponent(trackingPayload.orderId);
            return;
        }
    }

    const submitTrackingSearch = function(event) {
        event.preventDefault();

        const orderId = input.value.trim();
        if (!orderId) {
            if (errorMessage) {
                errorMessage.textContent = 'We could not find your order. Please check the details you entered and try again.';
                errorMessage.classList.add('show');
            }
            return;
        }

        const order = findOrderById(orderId);
        if (!order) {
            if (errorMessage) {
                errorMessage.textContent = 'We could not find your order. Please check the details you entered and try again.';
                errorMessage.classList.add('show');
            }
            return;
        }

        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
        }

        const trackingPayload = {
            orderId: order.orderId || order.id || orderId,
            estimatedDelivery: order.estimatedDelivery || getEstimatedDeliveryDate(),
            status: order.status || 'confirmed',
            createdAt: order.createdAt || new Date().toISOString()
        };

        sessionStorage.setItem(TRACKING_DETAILS_STORAGE_KEY, JSON.stringify(trackingPayload));
        window.location.href = 'track-order-details.html?orderId=' + encodeURIComponent(trackingPayload.orderId);
    };

    form.addEventListener('submit', submitTrackingSearch);
    input.addEventListener('input', function() {
        if (errorMessage && errorMessage.classList.contains('show')) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
        }
    });
}

function renderTrackOrderDetailsPage() {
    const detailsPage = document.querySelector('[data-track-order-details]');
    if (!detailsPage) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const orderIdFromUrl = params.get('orderId');
    
    let payload = null;
    try {
        const storedPayload = sessionStorage.getItem(TRACKING_DETAILS_STORAGE_KEY);
        payload = storedPayload ? JSON.parse(storedPayload) : null;
        if (storedPayload) {
            sessionStorage.removeItem(TRACKING_DETAILS_STORAGE_KEY);
        }
    } catch (e) {
        console.error('Error parsing session storage tracking details:', e);
    }

    let trackingOrder = payload && (!orderIdFromUrl || payload.orderId === orderIdFromUrl) ? payload : null;
    if (!trackingOrder && orderIdFromUrl) {
        const order = findOrderById(orderIdFromUrl);
        if (order) {
            trackingOrder = {
                orderId: order.orderId || order.id || orderIdFromUrl,
                estimatedDelivery: order.estimatedDelivery || getEstimatedDeliveryDate(),
                status: order.status || 'confirmed',
                createdAt: order.createdAt || new Date().toISOString()
            };
        }
    }

    const emptyState = document.getElementById('tracking-empty-state');
    const summaryNode = document.querySelector('.tracking-summary');
    const timelineNode = document.getElementById('tracking-timeline');

    if (!trackingOrder) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        if (summaryNode) {
            summaryNode.style.display = 'none';
        }
        if (timelineNode) {
            timelineNode.style.display = 'none';
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (summaryNode) {
        summaryNode.style.display = '';
    }
    if (timelineNode) {
        timelineNode.style.display = '';
    }

    const orderIdNode = document.getElementById('tracking-order-id');
    const deliveryNode = document.getElementById('tracking-estimated-delivery');

    if (orderIdNode) {
        orderIdNode.textContent = trackingOrder.orderId;
    }

    if (deliveryNode) {
        deliveryNode.textContent = formatEstimatedDelivery(trackingOrder.estimatedDelivery);
    }

    if (timelineNode) {
        const steps = [
            'Order Confirmed',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered'
        ];
        const currentStepIndex = getTrackingStepIndex(trackingOrder.status, trackingOrder.createdAt, trackingOrder.estimatedDelivery);
        timelineNode.innerHTML = '';

        steps.forEach((step, index) => {
            const item = document.createElement('li');
            item.className = 'timeline-item' + (index <= currentStepIndex ? ' is-complete' : '');
            item.innerHTML = `
                <span class="timeline-marker" aria-hidden="true">${index <= currentStepIndex ? '✓' : '○'}</span>
                <span class="timeline-label">${step}</span>
            `;
            timelineNode.appendChild(item);
        });
    }
}

// ========================================
// Wishlist Functionality
// ========================================

const PRODUCT_DATA = {
    'Chia Seeds': { name: 'Chia Seeds', href: 'chia-seeds-detail.html', image: '../images/Chia/front.png', price: '₹130.00' },
    'Flax Seeds': { name: 'Flax Seeds', href: 'flax-seeds-detail.html', image: '../images/Flax/front.png', price: '₹100.00' },
    'Mix Seeds': { name: 'Mix Seeds', href: 'mix-seeds-detail.html', image: '../images/Mix/front.png', price: '₹110.00' },
    'Pumpkin Seeds': { name: 'Pumpkin Seeds', href: 'pumpkin-seeds-detail.html', image: '../images/Pumpkin/front.png', price: '₹120.00' },
    'Sunflower Seeds': { name: 'Sunflower Seeds', href: 'sunflower-seeds-detail.html', image: '../images/Sunflower/front.png', price: '₹130.00' },
    'Watermelon Seeds': { name: 'Watermelon Seeds', href: 'watermelon-seeds-detail.html', image: '../images/Watermelon/front.png', price: '₹150.00' }
};

function getShortProductName(title) {
    const t = title.toLowerCase();
    if (t.includes('chia')) return 'Chia Seeds';
    if (t.includes('flax')) return 'Flax Seeds';
    if (t.includes('mix')) return 'Mix Seeds';
    if (t.includes('pumpkin')) return 'Pumpkin Seeds';
    if (t.includes('sunflower')) return 'Sunflower Seeds';
    if (t.includes('watermelon')) return 'Watermelon Seeds';
    return title;
}

function updateWishlistCount() {
    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('seedWishlist')) || [];
    } catch (e) {
        console.error('Error parsing wishlist from localStorage:', e);
    }
    const totalItems = wishlist.length;

    const badge = document.querySelector('.wishlist-badge');
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    } else {
        setTimeout(() => {
            const retryBadge = document.querySelector('.wishlist-badge');
            if (retryBadge) {
                if (totalItems > 0) {
                    retryBadge.textContent = totalItems;
                    retryBadge.classList.add('show');
                } else {
                    retryBadge.classList.remove('show');
                }
            }
        }, 100);
    }
}

function toggleWishlist(productName, button) {
    const product = PRODUCT_DATA[productName];
    if (!product) return;

    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('seedWishlist')) || [];
    } catch (e) {
        wishlist = [];
    }
    
    const index = wishlist.findIndex(item => item.name === product.name);

    if (index > -1) {
        wishlist.splice(index, 1);
        if (button) {
            button.classList.remove('is-active');
            const icon = button.querySelector('i');
            if (icon) icon.className = 'far fa-heart';
            if (button.classList.contains('wishlist-heart-btn-details')) {
                button.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
            }
        }
    } else {
        wishlist.push(product);
        if (button) {
            button.classList.add('is-active');
            const icon = button.querySelector('i');
            if (icon) icon.className = 'fas fa-heart';
            if (button.classList.contains('wishlist-heart-btn-details')) {
                button.innerHTML = '<i class="fas fa-heart"></i> Add to Wishlist';
            }
        }
    }

    localStorage.setItem('seedWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    
    // Sync all icons on the page
    const wishlistNames = wishlist.map(item => item.name);
    
    // Sync other product card icons
    document.querySelectorAll('.product-card, .related-product-card').forEach(card => {
        const h3 = card.querySelector('h3');
        if (h3 && h3.textContent.trim() === product.name) {
            const cardBtn = card.querySelector('.wishlist-heart-btn');
            if (cardBtn) {
                const isActive = wishlistNames.includes(product.name);
                cardBtn.classList.toggle('is-active', isActive);
                const icon = cardBtn.querySelector('i');
                if (icon) icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
            }
        }
    });

    // Sync details page elements if present
    const detailsFloatingBtn = document.querySelector('.wishlist-heart-btn-detail');
    const isActive = wishlistNames.includes(product.name);
    
    if (detailsFloatingBtn) {
        detailsFloatingBtn.classList.toggle('is-active', isActive);
        const icon = detailsFloatingBtn.querySelector('i');
        if (icon) icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
    }
}

function initWishlistIcons() {
    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('seedWishlist')) || [];
    } catch (e) {
        wishlist = [];
    }
    const wishlistNames = wishlist.map(item => item.name);

    // 1. Setup Product Cards (Main grid & Related section)
    document.querySelectorAll('.product-card, .related-product-card').forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const name = h3.textContent.trim();
        
        let heartBtn = card.querySelector('.wishlist-heart-btn');
        const isActive = wishlistNames.includes(name);
        
        if (!heartBtn) {
            heartBtn = document.createElement('button');
            heartBtn.className = 'wishlist-heart-btn';
            heartBtn.innerHTML = '<i class="far fa-heart"></i>';
            heartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(name, heartBtn);
            });
            card.appendChild(heartBtn);
        }
        
        heartBtn.classList.toggle('is-active', isActive);
        const icon = heartBtn.querySelector('i');
        if (icon) icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
    });

    // 2. Setup Product Details Page
    const detailsPage = document.querySelector('.product-page-layout');
    if (detailsPage) {
        const titleEl = document.querySelector('.product-title');
        if (titleEl) {
            const simpleName = getShortProductName(titleEl.textContent);
            const isActive = wishlistNames.includes(simpleName);

            // Floating Heart on Main Image
            const mainImgContainer = document.querySelector('.main-product-image');
            if (mainImgContainer) {
                mainImgContainer.style.position = 'relative';
                let floatingHeartBtn = mainImgContainer.querySelector('.wishlist-heart-btn-detail');
                if (!floatingHeartBtn) {
                    floatingHeartBtn = document.createElement('button');
                    floatingHeartBtn.className = 'wishlist-heart-btn-detail';
                    floatingHeartBtn.innerHTML = '<i class="far fa-heart"></i>';
                    floatingHeartBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        toggleWishlist(simpleName, floatingHeartBtn);
                    });
                    mainImgContainer.appendChild(floatingHeartBtn);
                }
                floatingHeartBtn.classList.toggle('is-active', isActive);
                const icon = floatingHeartBtn.querySelector('i');
                if (icon) icon.className = isActive ? 'fas fa-heart' : 'far fa-heart';
            }

            // Text Heart Button next to Add to Cart removed (Buy Now placed statically/dynamically below it)
        }
    }
}

function renderWishlistPage() {
    const wishlistPage = document.querySelector('[data-wishlist-page]');
    if (!wishlistPage) {
        return;
    }

    const itemsContainer = document.getElementById('wishlist-items');
    const emptyState = document.getElementById('empty-wishlist');
    if (!itemsContainer || !emptyState) {
        return;
    }

    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('seedWishlist')) || [];
    } catch (e) {
        console.error('Error parsing wishlist from localStorage:', e);
    }

    if (wishlist.length === 0) {
        itemsContainer.innerHTML = '';
        itemsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    itemsContainer.style.display = 'grid';
    itemsContainer.innerHTML = wishlist.map(item => {
        return `
            <div class="wishlist-item" data-product-name="${item.name}">
                <div class="wishlist-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="wishlist-item-details">
                    <h3>${item.name}</h3>
                    <p class="wishlist-item-price">${item.price}</p>
                </div>
                <div class="wishlist-item-actions">
                    <a href="${item.href}" class="btn view-product-btn">View Product</a>
                    <button class="btn btn-remove-wishlist" onclick="removeFromWishlistDirect('${item.name}')" title="Remove">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function removeFromWishlistDirect(name) {
    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('seedWishlist')) || [];
    } catch (e) {
        wishlist = [];
    }
    wishlist = wishlist.filter(item => item.name !== name);
    localStorage.setItem('seedWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    initWishlistIcons();
    renderWishlistPage();
}

// ========================================
// Reviews & Ratings Functionality
// ========================================

const DEFAULT_SEED_REVIEWS = {
    'Chia Seeds': [
        { name: 'Rohan Sharma', rating: 5, text: 'The seeds are exceptionally fresh and clean. I add them to my oatmeal every morning.', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Priya Patel', rating: 4, text: 'Really good quality chia seeds. The packaging is resealable which is super helpful.', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'Flax Seeds': [
        { name: 'Aman Verma', rating: 5, text: 'Extremely high quality. I grind them for my shakes. Smells very fresh!', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Ananya Roy', rating: 4, text: 'Nice clean flax seeds. High fiber content is great for digestion.', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'Mix Seeds': [
        { name: 'Kabir Singh', rating: 5, text: 'Awesome mix! Perfect ratio of pumpkin, sunflower, flax, chia, and sesame seeds.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Neha Gupta', rating: 5, text: 'Super crunchy and nutritional. It has become my go-to evening snack.', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Vikram Malhotra', rating: 4, text: 'Healthy snack option. No chemical taste, purely natural seeds.', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'Pumpkin Seeds': [
        { name: 'Meera Iyer', rating: 5, text: 'Large, green, and plump seeds. Excellent quality and very healthy!', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Siddharth Sen', rating: 4, text: 'Very crunchy and good flavor. Great source of zinc and magnesium.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'Sunflower Seeds': [
        { name: 'Aditya Rao', rating: 5, text: 'Fresh and delicious. Packed with Vitamin E. Will definitely reorder.', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Shalini Dixit', rating: 4, text: 'Good product. Perfect to sprinkle on salads and toast.', date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'Watermelon Seeds': [
        { name: 'Rajesh Nair', rating: 5, text: 'Crispy and clean seeds. Very rich in protein. A fantastic addition to my diet.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Pooja Mehta', rating: 5, text: 'Excellent natural seeds. No added sodium, which is exactly what I wanted.', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() }
    ]
};

function getStoredReviews() {
    let reviews = localStorage.getItem('seedProductReviews');
    if (!reviews) {
        localStorage.setItem('seedProductReviews', JSON.stringify(DEFAULT_SEED_REVIEWS));
        return DEFAULT_SEED_REVIEWS;
    }
    try {
        return JSON.parse(reviews) || {};
    } catch (e) {
        console.error('Error parsing product reviews:', e);
        return {};
    }
}

function calculateAverageRating(reviewsList) {
    if (!reviewsList || reviewsList.length === 0) {
        return { average: '0.0', starsHtml: '☆☆☆☆☆', count: 0 };
    }
    const sum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sum / reviewsList.length).toFixed(1);
    
    const fullStars = Math.round(average);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= fullStars ? '★' : '☆';
    }
    return { average, starsHtml, count: reviewsList.length };
}

function renderReviewsSection() {
    const detailsPage = document.querySelector('.product-page-layout');
    if (!detailsPage) {
        return;
    }

    const titleEl = document.querySelector('.product-title');
    if (!titleEl) {
        return;
    }

    const productName = getShortProductName(titleEl.textContent);
    const allReviews = getStoredReviews();
    const reviews = allReviews[productName] || [];

    // 1. Update top rating info
    const ratingContainer = document.querySelector('.product-rating');
    const stats = calculateAverageRating(reviews);
    if (ratingContainer) {
        ratingContainer.innerHTML = `
            <span class="rating-stars" style="color: #ff9900;">${stats.starsHtml}</span>
            <span class="rating-text" style="font-weight: 600; color: #4a5444; font-size: 0.95rem; margin-left: 0.25rem;">${stats.average}/5 (${stats.count} ${stats.count === 1 ? 'review' : 'reviews'})</span>
            <span class="meta-separator" style="margin: 0 0.5rem; color: #ccc;">|</span>
            <span>Vegetarian Product</span>
        `;
    }

    // 2. Inject Reviews Section HTML
    let reviewsSection = document.getElementById('product-reviews-section');
    if (!reviewsSection) {
        reviewsSection = document.createElement('section');
        reviewsSection.id = 'product-reviews-section';
        reviewsSection.className = 'reviews-section';
        
        const container = document.querySelector('main.container');
        if (container) {
            const relatedSection = document.querySelector('.related-products-section');
            if (relatedSection) {
                container.insertBefore(reviewsSection, relatedSection);
            } else {
                container.appendChild(reviewsSection);
            }
        }
    }

    reviewsSection.innerHTML = `
        <h2 class="reviews-section-title">Customer Reviews</h2>
        <div class="reviews-layout">
            <!-- Left: Ratings Summary -->
            <div class="rating-summary-box">
                <span class="rating-summary-number">${stats.count > 0 ? stats.average : '0.0'}</span>
                <span class="rating-summary-stars">${stats.count > 0 ? stats.starsHtml : '☆☆☆☆☆'}</span>
                <span class="rating-summary-count">${stats.count} customer ${stats.count === 1 ? 'rating' : 'ratings'}</span>
            </div>

            <!-- Right: Review Form -->
            <div class="review-form-container">
                <h3 class="review-form-title">Write a review</h3>
                <form id="add-review-form" class="review-form" novalidate>
                    <div class="form-group">
                        <label>Your Rating:</label>
                        <div class="star-selector" id="form-star-selector" data-rating="0">
                            <button type="button" class="star-select-btn" data-value="1">★</button>
                            <button type="button" class="star-select-btn" data-value="2">★</button>
                            <button type="button" class="star-select-btn" data-value="3">★</button>
                            <button type="button" class="star-select-btn" data-value="4">★</button>
                            <button type="button" class="star-select-btn" data-value="5">★</button>
                        </div>
                        <span id="star-error" style="color: #b42318; font-size: 0.85rem; display: none; margin-top: 0.25rem;">Please select a star rating.</span>
                    </div>
                    <div class="form-group">
                        <label for="review-name">Your Name:</label>
                        <input type="text" id="review-name" required placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label for="review-text">Your Review:</label>
                        <textarea id="review-text" rows="4" required placeholder="Share your experience with this product..."></textarea>
                    </div>
                    <button type="submit" class="btn review-submit-btn">Submit Review</button>
                </form>
            </div>
        </div>

        <div class="reviews-list-container">
            <h3 class="reviews-list-title">Reviews (${stats.count})</h3>
            <div id="reviews-cards-list">
                <!-- Individual review cards render here -->
            </div>
        </div>
    `;

    renderReviewsList(reviews);
    bindStarSelectorEvents();
    bindReviewFormSubmit(productName);
}

function renderReviewsList(reviewsList) {
    const listContainer = document.getElementById('reviews-cards-list');
    if (!listContainer) return;

    if (reviewsList.length === 0) {
        listContainer.innerHTML = `<p style="color: #66715f; font-style: italic;">No reviews yet. Be the first to write a review!</p>`;
        return;
    }

    listContainer.innerHTML = reviewsList.map(r => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= r.rating ? '★' : '☆';
        }
        
        const dateStr = formatReviewDate(r.date);
        const initial = r.name ? r.name.charAt(0).toUpperCase() : 'U';

        return `
            <article class="review-card">
                <div class="review-card-header">
                    <div class="review-user-info">
                        <div class="review-user-avatar">${initial}</div>
                        <div>
                            <span class="review-user-name">${escapeHTML(r.name)}</span>
                            <div class="review-stars">${starsHtml}</div>
                        </div>
                    </div>
                    <span class="review-date">${dateStr}</span>
                </div>
                <p class="review-text">${escapeHTML(r.text)}</p>
            </article>
        `;
    }).join('');
}

function formatReviewDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function bindStarSelectorEvents() {
    const selector = document.getElementById('form-star-selector');
    if (!selector) return;

    const buttons = selector.querySelectorAll('.star-select-btn');
    
    buttons.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-value'));

        btn.addEventListener('mouseenter', () => {
            buttons.forEach(b => {
                const bVal = parseInt(b.getAttribute('data-value'));
                b.classList.toggle('hovered', bVal <= val);
            });
        });

        btn.addEventListener('mouseleave', () => {
            buttons.forEach(b => b.classList.remove('hovered'));
        });

        btn.addEventListener('click', () => {
            selector.setAttribute('data-rating', val);
            buttons.forEach(b => {
                const bVal = parseInt(b.getAttribute('data-value'));
                b.classList.toggle('active', bVal <= val);
            });
            const starError = document.getElementById('star-error');
            if (starError) starError.style.display = 'none';
        });
    });
}

function bindReviewFormSubmit(productName) {
    const form = document.getElementById('add-review-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('review-name');
        const textInput = document.getElementById('review-text');
        const selector = document.getElementById('form-star-selector');
        const starError = document.getElementById('star-error');

        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        const rating = parseInt(selector.getAttribute('data-rating'));

        let isValid = true;

        if (rating === 0) {
            if (starError) starError.style.display = 'block';
            isValid = false;
        } else {
            if (starError) starError.style.display = 'none';
        }

        if (!name) {
            nameInput.style.borderColor = '#b42318';
            isValid = false;
        } else {
            nameInput.style.borderColor = '';
        }

        if (!text) {
            textInput.style.borderColor = '#b42318';
            isValid = false;
        } else {
            textInput.style.borderColor = '';
        }

        if (!isValid) return;

        const newReview = {
            name: name,
            rating: rating,
            text: text,
            date: new Date().toISOString()
        };

        const allReviews = getStoredReviews();
        if (!allReviews[productName]) {
            allReviews[productName] = [];
        }
        allReviews[productName].unshift(newReview);
        localStorage.setItem('seedProductReviews', JSON.stringify(allReviews));

        renderReviewsSection();
    });
}

// ========================================
// Recently Viewed Products Functionality
// ========================================

const RECENTLY_VIEWED_STORAGE_KEY = 'seedRecentlyViewed';

function trackRecentlyViewed() {
    const detailsPage = document.querySelector('.product-page-layout');
    if (!detailsPage) return;

    const titleEl = document.querySelector('.product-title');
    if (!titleEl) return;

    const productName = getShortProductName(titleEl.textContent);
    const product = PRODUCT_DATA[productName];
    if (!product) return;

    let recentlyViewed = [];
    try {
        recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)) || [];
    } catch (e) {
        recentlyViewed = [];
    }

    // Filter out the current product to re-add it to the front
    recentlyViewed = recentlyViewed.filter(item => item.name !== product.name);
    recentlyViewed.unshift(product);

    // Limit to 10 items
    if (recentlyViewed.length > 10) {
        recentlyViewed = recentlyViewed.slice(0, 10);
    }

    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(recentlyViewed));
}

function renderRecentlyViewedSection() {
    const detailsPage = document.querySelector('.product-page-layout');
    if (!detailsPage) return;

    const titleEl = document.querySelector('.product-title');
    if (!titleEl) return;

    const productName = getShortProductName(titleEl.textContent);
    
    let recentlyViewed = [];
    try {
        recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)) || [];
    } catch (e) {
        recentlyViewed = [];
    }

    // Exclude the current product
    const filteredList = recentlyViewed.filter(item => item.name !== productName);

    if (filteredList.length === 0) {
        return; // No recently viewed products to show
    }

    const displayList = filteredList.slice(0, 4);

    let section = document.getElementById('recently-viewed-section');
    if (!section) {
        section = document.createElement('section');
        section.id = 'recently-viewed-section';
        section.className = 'recently-viewed-section';
        
        const container = document.querySelector('main.container');
        if (container) {
            // Append before the related products section
            const relatedSection = document.querySelector('.related-products-section');
            if (relatedSection) {
                container.insertBefore(section, relatedSection);
            } else {
                container.appendChild(section);
            }
        }
    }

    section.innerHTML = `
        <h2 class="recently-viewed-title">Recently Viewed Products</h2>
        <div class="recently-viewed-grid">
            ${displayList.map(item => `
                <a class="recently-viewed-card" href="${item.href}">
                    <div class="recently-viewed-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="recently-viewed-body">
                        <h3>${item.name}</h3>
                        <p class="recently-viewed-price">${item.price}</p>
                        <span class="recently-viewed-button">View Product</span>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
}

// ========================================
// Stock Status Functionality
// ========================================

const STOCK_DATA = {
    'Chia Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Flax Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Mix Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Mixed Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Pumpkin Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Sunflower Seeds': { status: 'in-stock', text: 'In Stock', emoji: '🟢' },
    'Watermelon Seeds': { status: 'low-stock', text: 'Only a few items left', emoji: '🟡' }
};

function renderStockStatus() {
    // 1. Handle product detail pages
    const detailsPage = document.querySelector('.product-page-layout');
    if (detailsPage) {
        const titleEl = document.querySelector('.product-title');
        if (titleEl) {
            const productName = getShortProductName(titleEl.textContent);
            const stock = STOCK_DATA[productName] || { status: 'in-stock', text: 'In Stock', emoji: '🟢' };
            
            // Check if already injected
            if (!document.getElementById('product-stock-status')) {
                const stockBadge = document.createElement('div');
                stockBadge.id = 'product-stock-status';
                stockBadge.className = `stock-status-badge ${stock.status}`;
                stockBadge.innerHTML = `<span>${stock.emoji}</span> <span>${stock.text}</span>`;
                
                // Insert it after the .product-rating container (or before .price-section)
                const ratingEl = document.querySelector('.product-rating');
                if (ratingEl) {
                    ratingEl.parentNode.insertBefore(stockBadge, ratingEl.nextSibling);
                } else {
                    titleEl.parentNode.insertBefore(stockBadge, titleEl.nextSibling);
                }
            }

            // Handle Out of Stock behavior on detail page
            if (stock.status === 'out-of-stock') {
                const addToCartBtn = document.querySelector('.add-to-cart-btn');
                if (addToCartBtn) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.onclick = null;
                    addToCartBtn.removeAttribute('onclick');
                    addToCartBtn.innerHTML = '🚫 Out of Stock';
                    addToCartBtn.style.backgroundColor = '#95a5a6';
                    addToCartBtn.style.color = '#fff';
                    addToCartBtn.style.cursor = 'not-allowed';
                }
                const buyNowBtn = document.querySelector('.buy-now-btn');
                if (buyNowBtn) {
                    buyNowBtn.disabled = true;
                    buyNowBtn.innerHTML = 'Out of Stock';
                    buyNowBtn.style.backgroundColor = '#95a5a6';
                    buyNowBtn.style.color = '#fff';
                    buyNowBtn.style.cursor = 'not-allowed';
                }
            }
        }
    }

    // 2. Handle products listing page
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length > 0) {
        productCards.forEach(card => {
            const titleEl = card.querySelector('h3');
            if (titleEl) {
                const productName = getShortProductName(titleEl.textContent);
                const stock = STOCK_DATA[productName] || { status: 'in-stock', text: 'In Stock', emoji: '🟢' };
                
                // Check if already injected in this card
                if (!card.querySelector('.stock-status-badge')) {
                    const stockBadge = document.createElement('div');
                    stockBadge.className = `stock-status-badge ${stock.status}`;
                    stockBadge.style.fontSize = '0.8rem'; // Slightly smaller for the catalog card
                    stockBadge.style.margin = '0.25rem 0 0.5rem';
                    stockBadge.innerHTML = `<span>${stock.emoji}</span> <span>${stock.text}</span>`;
                    
                    // Insert after the price element
                    const priceEl = card.querySelector('.product-price');
                    if (priceEl) {
                        priceEl.parentNode.insertBefore(stockBadge, priceEl.nextSibling);
                    } else {
                        titleEl.parentNode.insertBefore(stockBadge, titleEl.nextSibling);
                    }
                }

                // Handle Out of Stock behavior on product listing page card
                if (stock.status === 'out-of-stock') {
                    const addToCartBtn = card.querySelector('.add-to-cart');
                    if (addToCartBtn) {
                        addToCartBtn.disabled = true;
                        addToCartBtn.onclick = null;
                        addToCartBtn.removeAttribute('onclick');
                        addToCartBtn.innerHTML = 'Out of Stock';
                        addToCartBtn.style.backgroundColor = '#95a5a6';
                        addToCartBtn.style.color = '#fff';
                        addToCartBtn.style.cursor = 'not-allowed';
                    }
                }
            }
        });
    }
}

// ========================================
// Add to Cart Details Page & Modal Helper
// ========================================

function addDetailProductToCart(priceText, imageSrc) {
    const titleEl = document.querySelector('.product-title');
    if (!titleEl) return;
    const productName = getShortProductName(titleEl.textContent);
    
    // Check stock status
    const stock = STOCK_DATA[productName] || { status: 'in-stock', text: 'In Stock', emoji: '🟢' };
    if (stock.status === 'out-of-stock') {
        alert('Sorry, this product is out of stock.');
        return;
    }

    const price = parseFloat(priceText.replace('₹', ''));
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            image: imageSrc,
            quantity: 1,
            id: Date.now()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    showAddToCartSuccessModal();
}

function showAddToCartSuccessModal() {
    let modal = document.getElementById('cart-success-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cart-success-modal';
        modal.className = 'cart-success-modal';
        modal.innerHTML = `
            <div class="cart-success-content">
                <div class="cart-success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="cart-success-title">Added to Cart</h3>
                <p class="cart-success-text">Product added to cart successfully.</p>
                <div class="cart-success-actions">
                    <button class="cart-success-btn secondary" onclick="closeCartSuccessModal()">Continue Shopping</button>
                    <a href="cart.html" class="cart-success-btn primary" style="display: block; text-align: center; text-decoration: none; line-height: 1.5;">View Cart</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('show');
}

function closeCartSuccessModal() {
    const modal = document.getElementById('cart-success-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function initSizeDropdowns() {
    const dropdowns = document.querySelectorAll('.size-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            const selectedCard = dropdown.closest('.product-card');
            if (selectedCard) {
                const priceEl = selectedCard.querySelector('.product-price');
                if (priceEl) {
                    const optionText = dropdown.options[dropdown.selectedIndex].text;
                    const priceMatch = optionText.match(/₹\d+(?:\.\d+)?/);
                    if (priceMatch) {
                        priceEl.textContent = priceMatch[0];
                    }
                }
            }
        });
    });
}

// Expose functions globally
window.addDetailProductToCart = addDetailProductToCart;
window.showAddToCartSuccessModal = showAddToCartSuccessModal;
window.closeCartSuccessModal = closeCartSuccessModal;

// ========================================
// Buy Now Checkout redirection
// ========================================

function handleBuyNow() {
    const titleEl = document.querySelector('.product-title');
    if (!titleEl) return;
    const productName = getShortProductName(titleEl.textContent);
    
    // Check stock status
    const stock = STOCK_DATA[productName] || { status: 'in-stock', text: 'In Stock', emoji: '🟢' };
    if (stock.status === 'out-of-stock') {
        alert('Sorry, this product is out of stock.');
        return;
    }

    const selectedBtn = document.querySelector('.size-btn.active') || document.querySelector('.size-grid-btn.active');
    const priceText = selectedBtn ? (selectedBtn.querySelector('.size-btn-price')?.textContent || selectedBtn.querySelector('.size-grid-price')?.textContent || '₹320.00') : '₹320.00';
    const price = parseFloat(priceText.replace('₹', ''));
    const imageEl = document.getElementById('mainImage');
    const imageSrc = imageEl ? imageEl.src : '';

    const buyNowItem = {
        name: productName,
        price: price,
        image: imageSrc,
        quantity: 1,
        id: Date.now()
    };

    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    window.location.href = 'cart.html?buyNow=true';
}

window.handleBuyNow = handleBuyNow;

// ========================================
// Homepage Customer Reviews Logic
// ========================================

const DEFAULT_REVIEWS = [
    {
        name: "Rohan Sharma",
        role: "Fitness Enthusiast",
        rating: 5,
        text: "Excellent quality seeds. Fresh packaging and great taste.",
        date: "June 15, 2026"
    },
    {
        name: "Priya Patel",
        role: "Nutrition Student",
        rating: 5,
        text: "Healthy, natural, and delivered quickly. Highly recommended.",
        date: "June 16, 2026"
    },
    {
        name: "Amit Verma",
        role: "Working Professional",
        rating: 5,
        text: "Great addition to my daily diet. Will order again.",
        date: "June 18, 2026"
    },
    {
        name: "Vikram Malhotra",
        role: "Home Chef",
        rating: 5,
        text: "Perfect ingredient for my baking. Top notch quality.",
        date: "June 19, 2026"
    },
    {
        name: "Anjali Desai",
        role: "Yoga Practitioner",
        rating: 5,
        text: "Extremely fresh and highly nutritious. A must-buy.",
        date: "June 20, 2026"
    }
];

function initHomepageReviews() {
    const grid = document.getElementById('homepage-reviews-grid');
    if (!grid) return; // Not on the homepage

    let currentSlide = 0;

    // Function to calculate and update position
    function updateCarouselPosition() {
        const track = document.getElementById('homepage-reviews-grid');
        if (!track) return;
        
        const cards = track.querySelectorAll('.review-card');
        if (cards.length === 0) return;
        
        // Determine how many cards are visible based on media queries in style.css
        let visibleCards = 3;
        if (window.innerWidth <= 600) {
            visibleCards = 1;
        } else if (window.innerWidth <= 992) {
            visibleCards = 2;
        }
        
        const maxSlide = Math.max(0, cards.length - visibleCards);
        
        // Bounds check
        if (currentSlide > maxSlide) {
            currentSlide = maxSlide;
        }
        if (currentSlide < 0) {
            currentSlide = 0;
        }
        
        // Calculate offset in pixels based on card width and gap
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        const offset = currentSlide * (cardWidth + gap);
        
        track.style.transform = `translateX(-${offset}px)`;
        
        // Enable/disable arrows
        const prevBtn = document.getElementById('reviews-prev-btn');
        const nextBtn = document.getElementById('reviews-next-btn');
        
        if (prevBtn) prevBtn.disabled = (currentSlide === 0);
        if (nextBtn) nextBtn.disabled = (currentSlide >= maxSlide);
    }

    // Function to render reviews
    function renderReviews() {
        let customReviews = [];
        try {
            customReviews = JSON.parse(localStorage.getItem('customerReviews')) || [];
        } catch (e) {
            console.error('Error parsing customerReviews from localStorage:', e);
        }

        // Merge custom reviews at the front of default reviews so they appear first and grow the list
        const allReviews = customReviews.concat(DEFAULT_REVIEWS);

        grid.innerHTML = allReviews.map(review => {
            const stars = '⭐'.repeat(review.rating);
            const dateStr = review.date ? `<p class="review-card-date">${escapeHTML(review.date)}</p>` : '';
            return `
                <div class="review-card">
                    <div class="review-card-stars">${stars}</div>
                    <h3 class="review-card-name">${escapeHTML(review.name)}</h3>
                    <p class="review-card-role">${escapeHTML(review.role)}</p>
                    ${dateStr}
                    <p class="review-card-text">"${escapeHTML(review.text)}"</p>
                </div>
            `;
        }).join('');

        // Wait brief tick for layout paint then update carousel bounds/controls
        setTimeout(updateCarouselPosition, 50);
    }

    renderReviews();

    // Resize listener to recalculate slide offsets
    window.addEventListener('resize', updateCarouselPosition);

    // Arrow controls
    const prevBtn = document.getElementById('reviews-prev-btn');
    const nextBtn = document.getElementById('reviews-next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarouselPosition();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cards = grid.querySelectorAll('.review-card');
            let visibleCards = 3;
            if (window.innerWidth <= 600) {
                visibleCards = 1;
            } else if (window.innerWidth <= 992) {
                visibleCards = 2;
            }
            const maxSlide = Math.max(0, cards.length - visibleCards);
            if (currentSlide < maxSlide) {
                currentSlide++;
                updateCarouselPosition();
            }
        });
    }

    // Modal elements
    const modal = document.getElementById('review-modal');
    const openBtn = document.getElementById('leave-review-btn');
    const closeBtn = document.getElementById('close-review-modal');
    const form = document.getElementById('homepage-review-form');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            form.reset();
            const stars = document.querySelectorAll('#star-rating-input .star');
            stars.forEach(s => s.classList.remove('active'));
            document.getElementById('review-rating').value = '';
            document.getElementById('review-form-error').style.display = 'none';
            document.getElementById('review-form-success').style.display = 'none';
            modal.classList.add('show');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Star rating input interaction
    const starInputContainer = document.getElementById('star-rating-input');
    if (starInputContainer) {
        const stars = starInputContainer.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                document.getElementById('review-rating').value = rating;
                
                stars.forEach((s, idx) => {
                    if (idx < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    }

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const errorEl = document.getElementById('review-form-error');
            const successEl = document.getElementById('review-form-success');
            errorEl.style.display = 'none';
            successEl.style.display = 'none';

            const name = document.getElementById('review-name').value.trim();
            const role = document.getElementById('review-role').value.trim() || 'Verified Buyer';
            const ratingVal = document.getElementById('review-rating').value;
            const message = document.getElementById('review-message').value.trim();

            if (!name) {
                errorEl.textContent = 'Please enter your name.';
                errorEl.style.display = 'block';
                return;
            }
            if (!ratingVal) {
                errorEl.textContent = 'Please select a star rating.';
                errorEl.style.display = 'block';
                return;
            }
            const rating = parseInt(ratingVal);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                errorEl.textContent = 'Please select a valid star rating.';
                errorEl.style.display = 'block';
                return;
            }
            if (!message) {
                errorEl.textContent = 'Please enter a review message.';
                errorEl.style.display = 'block';
                return;
            }

            // Generate today's date formatted: e.g. June 21, 2026
            const today = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = today.toLocaleDateString('en-US', options);

            // Create new review
            const newReview = {
                name: name,
                role: role,
                rating: rating,
                text: message,
                date: formattedDate
            };

            // Save to localStorage
            let customReviews = [];
            try {
                customReviews = JSON.parse(localStorage.getItem('customerReviews')) || [];
            } catch (err) {
                console.error('Error loading reviews for save:', err);
            }
            
            customReviews.unshift(newReview); // Put new review at the top
            
            try {
                localStorage.setItem('customerReviews', JSON.stringify(customReviews));
            } catch (err) {
                console.error('Error saving review to localStorage:', err);
            }

            // Reset current slide to 0 so the user sees their review immediately
            currentSlide = 0;

            // Render reviews immediately
            renderReviews();

            // Display success message
            successEl.textContent = 'Thank you for your review!';
            successEl.style.display = 'block';

            // Close modal after delay
            setTimeout(() => {
                modal.classList.remove('show');
            }, 1500);
        });
    }
}

// Simple HTML escaping helper to prevent XSS in reviews
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}