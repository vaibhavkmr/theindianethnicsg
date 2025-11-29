// Main JavaScript file for TheIndianEthnic.sg Website

// Global variables
let currentProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Initialize navigation
    initializeNavigation();

    // Initialize smooth scrolling
    initializeSmoothScrolling();

    // Initialize loading states
    initializeLoadingStates();

    // Initialize tooltips and popovers
    initializeBootstrapComponents();

    // Update wishlist badge
    updateWishlistBadge();

    // Initialize category from URL parameters BEFORE loading products
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        currentCategory = category;
        updateCategoryDescription(category);
        updateActiveFilter(category);
    }

    // Load products if on products page, homepage, or any page with search
    // This ensures search dropdown works on all pages
    if (document.getElementById('productsGrid') || 
        document.getElementById('featuredProducts') || 
        document.getElementById('searchInput')) {
        loadProductsData();
    }

    // Initialize search functionality after DOM is ready
    initializeSearch();
}

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navbarCollapse && navbarCollapse.contains(event.target);
        const isToggleButton = navbarToggler && navbarToggler.contains(event.target);

        if (!isClickInsideNav && !isToggleButton && navbarCollapse && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 1)';
                navbar.style.backdropFilter = 'none';
            }
        }
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    if (searchInput) {
        // Show typeahead suggestions on all pages
        searchInput.addEventListener('input', debounce(handleSearchDropdown, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchDropdown(e);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (searchDropdown && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove('show');
            }
        });
    }
}

// Debounce function for search
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

// Helper function to match category
function matchesCategory(productCategory, filterCategory) {
    if (filterCategory === 'all') return true;
    
    // Convert both to lowercase for comparison
    const category = productCategory.toLowerCase();
    const filter = filterCategory.toLowerCase();
    
    // Check if category starts with or includes the filter
    // Examples: "Silk Sarees" matches "silk", "Bridal Collection" matches "bridal"
    return category.startsWith(filter) || category.includes(filter);
}

// Handle search dropdown
function handleSearchDropdown(event) {
    const searchDropdown = document.getElementById('searchDropdown');
    if (!searchDropdown) return;

    // Only search if we have products loaded
    if (!currentProducts || currentProducts.length === 0) {
        return;
    }

    const searchTerm = event.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        searchDropdown.classList.remove('show');
        searchDropdown.innerHTML = '';
        return;
    }

    // Filter products based on search term
    const results = currentProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            (product.material && product.material.toLowerCase().includes(searchTerm));
    }).slice(0, 5); // Limit to 5 results

    if (results.length === 0) {
        searchDropdown.innerHTML = DOMPurify.sanitize('<div class="search-dropdown-empty">No products found</div>');
        searchDropdown.classList.add('show');
        return;
    }

    // Display results in dropdown
    searchDropdown.innerHTML = DOMPurify.sanitize(results.map(product => `
        <div class="search-dropdown-item" data-product-id="${product.id}">
            <img src="${window.SITE_CONFIG.getPath(product.images[0])}" alt="${product.name}" loading="lazy">
            <div class="search-dropdown-item-info">
                <div class="search-dropdown-item-name">${product.name}</div>
                <div class="search-dropdown-item-category">${product.category}</div>
            </div>
            <div class="search-dropdown-item-price">₹${product.price.toLocaleString()}</div>
        </div>
    `).join(''));

    searchDropdown.classList.add('show');
    
    // Attach search dropdown click handlers
    attachSearchDropdownListeners();
}

// Select product from search dropdown
function selectSearchProduct(productId) {
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    
    // Clear search
    if (searchInput) searchInput.value = '';
    if (searchDropdown) {
        searchDropdown.classList.remove('show');
        searchDropdown.innerHTML = '';
    }
    
    // Open product modal if function exists (on product pages)
    if (typeof openProductModal === 'function') {
        openProductModal(productId);
    } else {
        // Redirect to products page with product ID to open modal
        const currentPath = window.location.pathname;
        const isInWebFolder = currentPath.includes('/web/');
        const productsUrl = isInWebFolder ? 'products.html' : 'web/products.html';
        window.location.href = `${productsUrl}?product=${productId}`;
    }
}

// Handle search functionality (legacy - kept for compatibility)
function handleSearch(event) {
    // Only search if we have products loaded
    if (!currentProducts || currentProducts.length === 0) {
        return;
    }

    const searchTerm = event.target.value.toLowerCase().trim();

    if (searchTerm === '') {
        // Show all products in current category
        filteredProducts = currentProducts.filter(product =>
            matchesCategory(product.category, currentCategory)
        );
    } else {
        // Filter products based on search term
        filteredProducts = currentProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                (product.material && product.material.toLowerCase().includes(searchTerm));
            const categoryMatches = matchesCategory(product.category, currentCategory);
            return matchesSearch && categoryMatches;
        });
        
        // Track search event
        if (typeof trackSearch === 'function') {
            trackSearch(searchTerm, filteredProducts.length);
        }
    }

    // Update products display
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

// Smooth scrolling initialization
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Only handle valid anchors, not just "#"
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Initialize loading states
function initializeLoadingStates() {
    // Add loading class to elements that need it
    const loadingElements = document.querySelectorAll('[data-loading]');
    loadingElements.forEach(element => {
        element.classList.add('loading-skeleton');
    });
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

// Load products data from JSON
async function loadProductsData() {
    try {
        showLoadingState(true);
        const response = await fetch(window.SITE_CONFIG.getPath('data/products.json'));
        if (!response.ok) {
            throw new Error('Failed to load products data');
        }
        const data = await response.json();
        currentProducts = data.products;
        filteredProducts = [...currentProducts];

        // Filter by category if specified
        if (currentCategory !== 'all') {
            filteredProducts = currentProducts.filter(product =>
                matchesCategory(product.category, currentCategory)
            );
        }

        // Display products
        displayProducts(filteredProducts);
        loadFeaturedProducts();
        updateProductCount(filteredProducts.length);

        // Dispatch event to notify that products are loaded
        document.dispatchEvent(new CustomEvent('productsLoaded'));

    } catch (error) {
        console.error('Error loading products:', error);
        showErrorState();
    } finally {
        showLoadingState(false);
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (products.length === 0) {
        showNoProductsState(true);
        return;
    }

    showNoProductsState(false);

    productsGrid.innerHTML = DOMPurify.sanitize(products.map(product => `
        <div class="col-lg-4 col-md-6 col-6 mb-4">
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${window.SITE_CONFIG.getPath(product.images[0])}" alt="${product.name}" class="img-fluid" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn btn-light btn-sm">
                            <i class="fas fa-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category text-muted small mb-1">${product.category}</div>
                    <h5 class="product-name">${product.name}</h5>
                    <div class="product-price mb-3">₹${product.price.toLocaleString()}</div>
                    <button class="btn whatsapp-btn btn-sm w-100" data-whatsapp-message="${product.whatsapp_message}">
                        <i class="fab fa-whatsapp me-1"></i> Enquire on WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `).join(''));
    
    // Add event listeners after DOM is updated
    attachProductCardListeners();
}

// Load featured products for homepage
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featuredProducts');
    if (!featuredProductsContainer || currentProducts.length === 0) return;

    // Get random featured products (first 6)
    const featuredProducts = currentProducts.slice(0, 6);

    featuredProductsContainer.innerHTML = DOMPurify.sanitize(featuredProducts.map(product => `
        <div class="col-lg-4 col-md-6 col-6 mb-4">
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${window.SITE_CONFIG.getPath(product.images[0])}" alt="${product.name}" class="img-fluid" loading="lazy">
                    <div class="product-overlay">
                        <button class="btn btn-light btn-sm">
                            <i class="fas fa-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category text-muted small mb-1">${product.category}</div>
                    <h5 class="product-name">${product.name}</h5>
                    <div class="product-price mb-3">₹${product.price.toLocaleString()}</div>
                    <button class="btn whatsapp-btn btn-sm w-100" data-whatsapp-message="${product.whatsapp_message}">
                        <i class="fab fa-whatsapp me-1"></i> Enquire on WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `).join(''));
    
    // Add event listeners after DOM is updated
    attachProductCardListeners();
}

// Update category description
function updateCategoryDescription(category) {
    const descriptions = {
        'all': 'Discover our complete range of premium sarees',
        'silk': 'Luxurious silk sarees with intricate traditional designs',
        'cotton': 'Comfortable and elegant cotton sarees for daily wear',
        'designer': 'Contemporary designer sarees for the modern woman',
        'bridal': 'Stunning bridal sarees for your special day',
        'party': 'Glamorous party wear sarees for celebrations'
    };

    const descriptionElement = document.getElementById('categoryDescription');
    if (descriptionElement && descriptions[category]) {
        descriptionElement.textContent = descriptions[category];
    }
}

// Update active filter button
function updateActiveFilter(category) {
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Update product count
function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const productsGrid = document.getElementById('productsGrid');

    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    if (productsGrid) {
        productsGrid.style.display = show ? 'none' : 'block';
    }
}

// Show/hide no products state
function showNoProductsState(show) {
    const noProductsState = document.getElementById('noProductsState');

    if (noProductsState) {
        if (show) {
            noProductsState.classList.remove('d-none');
        } else {
            noProductsState.classList.add('d-none');
        }
    }
}

// Show error state
function showErrorState() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = DOMPurify.sanitize(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fs-1 text-warning mb-4"></i>
                <h3 class="fw-bold mb-3">Unable to load products</h3>
                <p class="text-muted mb-4">Please check your internet connection and try again.</p>
                <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
            </div>
        `);
    }
}

// Attach event listeners to search dropdown items
function attachSearchDropdownListeners() {
    const searchDropdown = document.getElementById('searchDropdown');
    if (!searchDropdown) return;
    
    const items = searchDropdown.querySelectorAll('.search-dropdown-item');
    items.forEach(item => {
        item.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            if (productId) {
                selectSearchProduct(productId);
            }
        });
    });
}

// Attach event listeners to product cards (secure event delegation)
let productListenersAttached = false;
function attachProductCardListeners() {
    // Only attach once to avoid duplicate listeners
    if (productListenersAttached) return;
    productListenersAttached = true;
    
    // Use event delegation on document for product cards
    document.addEventListener('click', function(e) {
        // Handle product card clicks
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.whatsapp-btn')) {
            const productId = parseInt(productCard.dataset.productId);
            if (productId && typeof window.openProductModal === 'function') {
                window.openProductModal(productId);
            }
        }
        
        // Handle WhatsApp button clicks
        const whatsappBtn = e.target.closest('.whatsapp-btn');
        if (whatsappBtn) {
            e.stopPropagation();
            const message = whatsappBtn.dataset.whatsappMessage;
            if (message && typeof window.openWhatsApp === 'function') {
                window.openWhatsApp(message);
            }
        }
    });
}

// Clear all filters
function clearFilters() {
    currentCategory = 'all';
    filteredProducts = [...currentProducts];
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
    updateActiveFilter('all');
    updateCategoryDescription('all');

    // Clear search inputs
    const searchInputs = document.querySelectorAll('#searchInput, #productSearch');
    searchInputs.forEach(input => {
        if (input) input.value = '';
    });
}

// Utility functions for other scripts
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function generateWhatsAppMessage(product) {
    return `Hi! I'm interested in ${product.name} (₹${product.price.toLocaleString()}). Could you provide more details?`;
}

// Update wishlist badge counter
function updateWishlistBadge() {
    const wishlistBadge = document.getElementById('wishlistBadge');
    if (wishlistBadge) {
        const wishlist = JSON.parse(localStorage.getItem('saree_wishlist') || '[]');
        const count = wishlist.length;
        wishlistBadge.textContent = count;
        
        // Hide badge if count is 0
        if (count === 0) {
            wishlistBadge.style.display = 'none';
        } else {
            wishlistBadge.style.display = 'inline-block';
        }
    }
}

// Export functions for use in other scripts
window.clearFilters = clearFilters;
window.formatCurrency = formatCurrency;
window.truncateText = truncateText;
window.generateWhatsAppMessage = generateWhatsAppMessage;
window.updateWishlistBadge = updateWishlistBadge;
window.selectSearchProduct = selectSearchProduct;
