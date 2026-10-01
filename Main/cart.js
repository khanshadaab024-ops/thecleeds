// ========================================
// Cart Page Functionality
// ========================================

const ORDER_STORAGE_KEY = 'seedOrders';
const LAST_ORDER_ID_KEY = 'lastPlacedOrderId';

function getStoredOrders() {
    const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!storedOrders) {
        return [];
    }

    const parsedOrders = JSON.parse(storedOrders);
    return Array.isArray(parsedOrders) ? parsedOrders : [];
}

function saveStoredOrders(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function generateUniqueOrderId(existingOrders) {
    let orderId = '';

    do {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        orderId = 'SEED-' + randomNumber;
    } while (existingOrders.some(order => (order.orderId || order.id) === orderId));

    return orderId;
}

function getEstimatedDeliveryDate() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return deliveryDate.toISOString();
}

/**
 * Loads and displays cart items on the cart page
 */
function loadCart() {
    const isBuyNow = new URLSearchParams(window.location.search).get('buyNow') === 'true';
    const buyNowItem = isBuyNow ? JSON.parse(sessionStorage.getItem('buyNowItem')) : null;
    const cart = buyNowItem ? [buyNowItem] : (JSON.parse(localStorage.getItem('cart')) || []);
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');

    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = '';
        
        cart.forEach((item) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-total">
                    <p>₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-remove">
                    <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartItemsContainer.style.display = 'grid';
        cartSummary.style.display = 'block';
        updateCartSummary();
    }
}

/**
 * Updates the quantity of a cart item
 * @param {number} id - Product ID
 * @param {number} change - Amount to change quantity by (+1 or -1)
 */
function updateQuantity(id, change) {
    const isBuyNow = new URLSearchParams(window.location.search).get('buyNow') === 'true';
    if (isBuyNow) {
        const buyNowItem = JSON.parse(sessionStorage.getItem('buyNowItem'));
        if (buyNowItem && buyNowItem.id === id) {
            buyNowItem.quantity += change;
            if (buyNowItem.quantity < 1) buyNowItem.quantity = 1;
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            loadCart();
        }
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const item = cart.find(product => product.id === id);
    if (item) {
        item.quantity += change;
        
        if (item.quantity < 1) {
            item.quantity = 1;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartBadge();
    }
}

/**
 * Removes a product from the cart
 * @param {number} id - Product ID
 */
function removeFromCart(id) {
    const isBuyNow = new URLSearchParams(window.location.search).get('buyNow') === 'true';
    if (isBuyNow) {
        sessionStorage.removeItem('buyNowItem');
        window.location.href = 'cart.html';
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(item => item.id !== id);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

/**
 * Updates the cart summary totals
 */
const VALID_COUPONS = {
    'SAVE10': 10,
    'SAVE20': 20
};

function updateCartSummary() {
    const isBuyNow = new URLSearchParams(window.location.search).get('buyNow') === 'true';
    const buyNowItem = isBuyNow ? JSON.parse(sessionStorage.getItem('buyNowItem')) : null;
    const cart = buyNowItem ? [buyNowItem] : (JSON.parse(localStorage.getItem('cart')) || []);
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    document.getElementById('subtotal').textContent = '₹' + subtotal.toFixed(2);
    
    // Check if coupon is applied
    const appliedCoupon = sessionStorage.getItem('appliedCoupon');
    const discountRow = document.getElementById('discount-row');
    const discountPercentEl = document.getElementById('discount-percent');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalPriceEl = document.getElementById('total-price');

    let total = subtotal;

    if (appliedCoupon && VALID_COUPONS[appliedCoupon]) {
        const percent = VALID_COUPONS[appliedCoupon];
        const discountAmount = subtotal * (percent / 100);
        total = subtotal - discountAmount;

        if (discountRow) discountRow.style.display = 'flex';
        if (discountPercentEl) discountPercentEl.textContent = percent;
        if (discountAmountEl) discountAmountEl.textContent = '-₹' + discountAmount.toFixed(2);
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    if (totalPriceEl) {
        totalPriceEl.textContent = '₹' + total.toFixed(2);
    }
}

/**
 * Handles checkout button click
 */
function handleCheckout() {
    const isBuyNow = new URLSearchParams(window.location.search).get('buyNow') === 'true';
    const buyNowItem = isBuyNow ? JSON.parse(sessionStorage.getItem('buyNowItem')) : null;
    const cart = buyNowItem ? [buyNowItem] : (JSON.parse(localStorage.getItem('cart')) || []);
    
    if (cart.length > 0) {
        const orders = getStoredOrders();
        const orderId = generateUniqueOrderId(orders);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate discounted total
        const appliedCoupon = sessionStorage.getItem('appliedCoupon');
        let total = subtotal;
        if (appliedCoupon && VALID_COUPONS[appliedCoupon]) {
            const percent = VALID_COUPONS[appliedCoupon];
            total = subtotal * (1 - percent / 100);
        }

        const order = {
            orderId: orderId,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: total,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            estimatedDelivery: getEstimatedDeliveryDate()
        };

        orders.push(order);
        saveStoredOrders(orders);
        localStorage.setItem(LAST_ORDER_ID_KEY, orderId);
        
        if (buyNowItem) {
            sessionStorage.removeItem('buyNowItem');
        } else {
            localStorage.removeItem('cart');
        }
        
        sessionStorage.removeItem('appliedCoupon'); // clear coupon after order placement
        updateCartCount();
        window.location.href = 'order-success.html';
    }
}

function initCouponFeature() {
    const couponInput = document.getElementById('coupon-input');
    const applyBtn = document.getElementById('apply-coupon-btn');
    const couponMessage = document.getElementById('coupon-message');

    if (!couponInput || !applyBtn || !couponMessage) return;

    // Check if there is already an applied coupon on page load
    const currentCoupon = sessionStorage.getItem('appliedCoupon');
    if (currentCoupon) {
        couponInput.value = currentCoupon;
        couponInput.disabled = true;
        applyBtn.textContent = 'Remove';
        applyBtn.classList.add('remove-coupon');
        couponMessage.textContent = 'Coupon applied successfully.';
        couponMessage.className = 'coupon-message success';
    }

    // Add keypress listener to allow pressing Enter to apply coupon
    couponInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyBtn.click();
        }
    });

    applyBtn.addEventListener('click', function() {
        const isRemove = applyBtn.classList.contains('remove-coupon');
        if (isRemove) {
            sessionStorage.removeItem('appliedCoupon');
            couponInput.value = '';
            couponInput.disabled = false;
            applyBtn.textContent = 'Apply';
            applyBtn.classList.remove('remove-coupon');
            couponMessage.textContent = '';
            couponMessage.className = 'coupon-message';
            updateCartSummary();
            return;
        }

        const code = couponInput.value.trim().toUpperCase();

        if (!code) {
            couponMessage.textContent = 'Please enter a coupon code.';
            couponMessage.className = 'coupon-message error';
            return;
        }

        if (VALID_COUPONS[code]) {
            sessionStorage.setItem('appliedCoupon', code);
            couponInput.disabled = true;
            applyBtn.textContent = 'Remove';
            applyBtn.classList.add('remove-coupon');
            couponMessage.textContent = 'Coupon applied successfully.';
            couponMessage.className = 'coupon-message success';
            updateCartSummary();
        } else {
            couponMessage.textContent = 'Invalid coupon code.';
            couponMessage.className = 'coupon-message error';
        }
    });
}

// Load cart when page is ready
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    initCouponFeature();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
