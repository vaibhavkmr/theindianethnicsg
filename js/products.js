// Products page specific JavaScript

// Global variables for products page
let currentModal = null;
let currentProductData = null;

// Initialize products page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProductsPage();
});

function initializeProductsPage() {
    initializeFilters();
    initializeSorting();
    initializeProductModal();
    handleURLParameters();
}

// Handle URL parameters (e.g., search query, category, or product ID from other pages)
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const productId = urlParams.get('product');
    const category = urlParams.get('category');
    
    // Handle category parameter (from navigation menu links)
    if (category) {
        // Wait for products to load, then apply category filter
        if (currentProducts && currentProducts.length > 0) {
            filterByCategory(category);
            updateActiveFilter(category);
            updateCategoryDescription(category);
        } else {
            // Listen for products loaded event (main.js dispatches this)
            document.addEventListener('productsLoaded', () => {
                filterByCategory(category);
                updateActiveFilter(category);
                updateCategoryDescription(category);
            }, { once: true });
            
            // Fallback: poll with timeout
            let attempts = 0;
            const checkProducts = setInterval(() => {
                attempts++;
                if (currentProducts && currentProducts.length > 0) {
                    clearInterval(checkProducts);
                    filterByCategory(category);
                    updateActiveFilter(category);
                    updateCategoryDescription(category);
                } else if (attempts > 50) {
                    // Stop after 5 seconds
                    clearInterval(checkProducts);
                }
            }, 100);
        }
    }
    
    if (searchQuery) {
        // Prefill search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        
        // Wait for products to load, then apply search filter
        // Use event listener or check if already loaded
        if (currentProducts && currentProducts.length > 0) {
            applySearchFilter(searchQuery);
        } else {
            // Listen for products loaded event (main.js dispatches this)
            document.addEventListener('productsLoaded', () => {
                applySearchFilter(searchQuery);
            }, { once: true });
            
            // Fallback: poll with timeout
            let attempts = 0;
            const checkProducts = setInterval(() => {
                attempts++;
                if (currentProducts && currentProducts.length > 0) {
                    clearInterval(checkProducts);
                    applySearchFilter(searchQuery);
                } else if (attempts > 50) {
                    // Stop after 5 seconds
                    clearInterval(checkProducts);
                }
            }, 100);
        }
    }
    
    // Handle product ID parameter (from search clicks on non-product pages)
    if (productId) {
        // Wait for products to load, then open the modal
        if (currentProducts && currentProducts.length > 0) {
            openProductModal(parseInt(productId));
        } else {
            // Listen for products loaded event
            document.addEventListener('productsLoaded', () => {
                openProductModal(parseInt(productId));
            }, { once: true });
            
            // Fallback: poll with timeout
            let attempts = 0;
            const checkProducts = setInterval(() => {
                attempts++;
                if (currentProducts && currentProducts.length > 0) {
                    clearInterval(checkProducts);
                    openProductModal(parseInt(productId));
                } else if (attempts > 50) {
                    clearInterval(checkProducts);
                }
            }, 100);
        }
    }
}

// Apply search filter based on query string
function applySearchFilter(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term || !currentProducts) return;
    
    // Filter products based on search term
    filteredProducts = currentProducts.filter(product => {
        return product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term) ||
            (product.material && product.material.toLowerCase().includes(term));
    });
    
    // Update display
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
    
    // Show empty state if no results
    if (filteredProducts.length === 0) {
        const productGrid = document.getElementById('productsGrid');
        if (productGrid) {
            // Build empty state safely without innerHTML
            const emptyStateDiv = document.createElement('div');
            emptyStateDiv.className = 'col-12 text-center py-5';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-search fa-3x text-muted mb-3';
            
            const heading = document.createElement('h4');
            heading.textContent = `No products found for "${searchTerm}"`;
            
            const paragraph = document.createElement('p');
            paragraph.className = 'text-muted';
            paragraph.textContent = 'Try adjusting your search terms or browse our categories.';
            
            const link = document.createElement('a');
            link.href = 'products.html?category=all';
            link.className = 'btn btn-primary';
            link.textContent = 'View All Products';
            
            emptyStateDiv.appendChild(icon);
            emptyStateDiv.appendChild(heading);
            emptyStateDiv.appendChild(paragraph);
            emptyStateDiv.appendChild(link);
            
            productGrid.innerHTML = '';
            productGrid.appendChild(emptyStateDiv);
        }
    }
}

// Initialize filter buttons
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            if (category) {
                filterByCategory(category);
                updateActiveFilter(category);
                updateCategoryDescription(category);

                // Update URL without refreshing page
                const url = new URL(window.location);
                url.searchParams.set('category', category);
                window.history.pushState({}, '', url);
            }
        });
    });
}

// Helper function to match category (matches main.js)
function matchesCategory(productCategory, filterCategory) {
    if (filterCategory === 'all') return true;
    
    const category = productCategory.toLowerCase();
    const filter = filterCategory.toLowerCase();
    
    return category.startsWith(filter) || category.includes(filter);
}

// Filter products by category
function filterByCategory(category) {
    currentCategory = category;

    if (category === 'all') {
        filteredProducts = [...currentProducts];
    } else {
        filteredProducts = currentProducts.filter(product =>
            matchesCategory(product.category, category)
        );
    }

    // Track category filter event
    if (typeof trackCategoryFilter === 'function' && category !== 'all') {
        trackCategoryFilter(category);
    }

    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
    loadRelatedProducts();
}

// Initialize sorting functionality
function initializeSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
}

// Sort products
function sortProducts(sortType) {
    let sortedProducts = [...filteredProducts];

    switch (sortType) {
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            sortedProducts.sort((a, b) => b.id - a.id);
            break;
        default:
            break;
    }

    displayProducts(sortedProducts);
}

// Initialize product modal
function initializeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function() {
            // Focus on modal for accessibility
            modal.focus();
            
            // Reinitialize GLightbox after modal is shown
            if (typeof GLightbox !== 'undefined') {
                if (window.lightbox) {
                    window.lightbox.destroy();
                }
                window.lightbox = GLightbox({
                    selector: '.glightbox',
                    touchNavigation: true,
                    loop: true,
                    autoplayVideos: false,
                    zoomable: true,
                    draggable: true
                });
            }
        });

        modal.addEventListener('hidden.bs.modal', function() {
            // Clear modal data when closed
            currentModal = null;
            currentProductData = null;
            
            // Ensure backdrop is removed and body classes are cleaned up
            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            // Clear URL parameter if it exists
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('product')) {
                urlParams.delete('product');
                const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
                window.history.replaceState({}, '', newUrl);
            }
        });
    }
}

// Open product modal
function openProductModal(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    currentProductData = product;
    populateProductModal(product);

    const modalElement = document.getElementById('productModal');
    const modal = new bootstrap.Modal(modalElement);
    currentModal = modal;
    modal.show();

    // Load related products
    loadRelatedProducts(product.category);
    
    // Clear URL parameter after a short delay to prevent it from reopening on refresh
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('product')) {
            urlParams.delete('product');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, 500);
}

// Populate product modal with data
function populateProductModal(product) {
    // Track product view
    if (typeof trackProductView === 'function') {
        trackProductView(product.id, product.name, product.category);
    }
    
    // Set product name
    const nameElement = document.getElementById('modalProductName');
    if (nameElement) nameElement.textContent = product.name;

    // Set product price
    const priceElement = document.getElementById('modalProductPrice');
    if (priceElement) priceElement.textContent = `₹${product.price.toLocaleString()}`;

    // Set product category
    const categoryElement = document.getElementById('modalProductCategory');
    if (categoryElement) categoryElement.textContent = product.category;

    // Set product material
    const materialElement = document.getElementById('modalProductMaterial');
    if (materialElement) materialElement.textContent = product.material || 'Premium Quality Fabric';

    // Set product description
    const descriptionElement = document.getElementById('modalProductDescription');
    if (descriptionElement) descriptionElement.textContent = product.description;

    // Set main image and lightbox link
    const mainImageElement = document.getElementById('modalMainImage');
    const imageLinkElement = document.getElementById('modalImageLink');
    if (mainImageElement) {
        mainImageElement.src = product.images[0];
        mainImageElement.alt = product.name;
    }
    if (imageLinkElement) {
        imageLinkElement.href = product.images[0];
        imageLinkElement.setAttribute('data-glightbox', `title: ${product.name}; description: ${product.name} - Image 1`);
        imageLinkElement.setAttribute('data-gallery', 'product-gallery');
    }

    // Create hidden gallery links for all other images (for navigation in lightbox)
    const galleryContainer = document.getElementById('hiddenGallery');
    if (galleryContainer) {
        // Always clear first to avoid stale images from previous products
        galleryContainer.innerHTML = '';
        
        // Add all images except the first one to hidden gallery
        if (product.images.length > 1) {
            galleryContainer.innerHTML = DOMPurify.sanitize(product.images.slice(1).map((image, index) => `
                <a href="${image}" class="glightbox d-none" 
                   data-gallery="product-gallery"
                   data-glightbox="title: ${product.name}; description: ${product.name} - Image ${index + 2}">
                </a>
            `).join(''));
        }
    }

    // Set thumbnail images
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    if (thumbnailsContainer && product.images.length > 1) {
        thumbnailsContainer.innerHTML = DOMPurify.sanitize(product.images.map((image, index) => `
            <img src="${image}" alt="${product.name} ${index + 1}" 
                 class="img-thumbnail ${index === 0 ? 'active' : ''}"
                 data-image-src="${image}"
                 data-image-index="${index}">
        `).join(''));
        
        // Add click listeners to thumbnails
        const thumbnails = thumbnailsContainer.querySelectorAll('img');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const imageSrc = this.dataset.imageSrc;
                const imageIndex = parseInt(this.dataset.imageIndex);
                changeMainImage(imageSrc, this, imageIndex);
            });
        });
    }

    // Set product features
    const featuresContainer = document.getElementById('modalProductFeatures');
    if (featuresContainer) {
        const features = product.features || [
            'Premium quality fabric',
            'Intricate design work',
            'Comfortable fit',
            'Easy to drape',
            'Perfect for occasions'
        ];

        featuresContainer.innerHTML = DOMPurify.sanitize(features.map(feature => `
            <li><i class="fas fa-check text-success me-2"></i>${feature}</li>
        `).join(''));
    }

    // Set WhatsApp button
    const whatsappBtn = document.getElementById('modalWhatsAppBtn');
    if (whatsappBtn) {
        whatsappBtn.onclick = function() {
            openWhatsApp(product.whatsapp_message || generateWhatsAppMessage(product));
        };
    }
}

// Change main image in modal
function changeMainImage(imageSrc, thumbnailElement, imageIndex) {
    const mainImage = document.getElementById('modalMainImage');
    const imageLink = document.getElementById('modalImageLink');
    
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update the main image link and rebuild gallery with selected image first
    if (imageLink && currentProductData) {
        const productName = currentProductData.name;
        imageLink.href = imageSrc;
        imageLink.setAttribute('data-glightbox', `title: ${productName}; description: ${productName} - Image ${imageIndex + 1}`);
        
        // Rebuild hidden gallery in correct order for navigation
        const galleryContainer = document.getElementById('hiddenGallery');
        if (galleryContainer && currentProductData.images.length > 1) {
            galleryContainer.innerHTML = '';
            
            // Build gallery in circular order: images after selected, then images before selected
            // This ensures clicking right arrow goes to the next image in sequence
            const totalImages = currentProductData.images.length;
            const reorderedIndices = [];
            
            // Add images after the selected one (imageIndex + 1 to end)
            for (let i = imageIndex + 1; i < totalImages; i++) {
                reorderedIndices.push(i);
            }
            
            // Add images before the selected one (0 to imageIndex - 1)
            for (let i = 0; i < imageIndex; i++) {
                reorderedIndices.push(i);
            }
            
            // Create gallery links in the correct order
            reorderedIndices.forEach(idx => {
                const anchor = document.createElement('a');
                anchor.href = currentProductData.images[idx];
                anchor.className = 'glightbox d-none';
                anchor.setAttribute('data-gallery', 'product-gallery');
                anchor.setAttribute('data-glightbox', `title: ${productName}; description: ${productName} - Image ${idx + 1}`);
                galleryContainer.appendChild(anchor);
            });
        }
        
        // Destroy and reinitialize GLightbox to pick up changes
        if (typeof GLightbox !== 'undefined') {
            if (window.lightbox) {
                window.lightbox.destroy();
            }
            window.lightbox = GLightbox({
                selector: '.glightbox',
                touchNavigation: true,
                loop: true,
                autoplayVideos: false,
                zoomable: true,
                draggable: true
            });
        }
    }

    // Update active thumbnail
    const thumbnails = document.querySelectorAll('#modalThumbnails img');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

// Load related products
function loadRelatedProducts(category) {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer || !currentProducts.length) return;

    // Get products from same category (excluding current product)
    let relatedProducts = currentProducts.filter(product => {
        if (currentProductData) {
            return product.category === (category || currentProductData.category) &&
                product.id !== currentProductData.id;
        }
        return product.category === (category || currentCategory);
    });

    // Limit to 3 products
    relatedProducts = relatedProducts.slice(0, 3);

    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = DOMPurify.sanitize('<div class="col-12 text-center"><p class="text-muted">No related products found</p></div>');
        return;
    }

    relatedContainer.innerHTML = DOMPurify.sanitize(relatedProducts.map(product => `
        <div class="col-lg-4 col-md-6 col-6">
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}" class="img-fluid" loading="lazy">
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
    
    // Event listeners are handled by global delegation in main.js
}

// Share product functionality
function shareProduct() {
    if (!currentProductData) return;

    const productUrl = `${window.location.origin}${window.location.pathname}?product=${currentProductData.id}`;
    const shareText = `Check out this beautiful saree: ${currentProductData.name} - ₹${currentProductData.price.toLocaleString()}`;

    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: currentProductData.name,
            text: shareText,
            url: productUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to copying to clipboard
        const textToCopy = `${shareText}\n${productUrl}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Product link copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Product link copied!', 'success');
        });
    }
}

// Add to wishlist functionality
function addToWishlist() {
    if (!currentProductData) return;

    // Get existing wishlist from localStorage
    let wishlist = JSON.parse(localStorage.getItem('saree_wishlist') || '[]');

    // Check if product is already in wishlist
    const existingIndex = wishlist.findIndex(item => item.id === currentProductData.id);

    if (existingIndex === -1) {
        // Add to wishlist
        wishlist.push({
            id: currentProductData.id,
            name: currentProductData.name,
            price: currentProductData.price,
            image: currentProductData.images[0],
            category: currentProductData.category
        });
        localStorage.setItem('saree_wishlist', JSON.stringify(wishlist));
        showToast('Added to wishlist!', 'success');

        // Track wishlist add event
        if (typeof trackWishlistAction === 'function') {
            trackWishlistAction('add', currentProductData.name);
        }

        // Update wishlist badge
        if (typeof window.updateWishlistBadge === 'function') {
            window.updateWishlistBadge();
        }

        // Update button text temporarily
        const btn = event.target;
        const originalHTML = DOMPurify.sanitize(btn.innerHTML);
        btn.innerHTML = DOMPurify.sanitize('<i class="fas fa-heart me-1"></i> Saved');
        setTimeout(() => {
            btn.innerHTML = DOMPurify.sanitize(originalHTML);
        }, 2000);

    } else {
        showToast('Already in your wishlist!', 'info');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = DOMPurify.sanitize(`
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `);

    // Add to page
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Get product from URL parameter
function getProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId && currentProducts.length > 0) {
        const product = currentProducts.find(p => p.id === parseInt(productId));
        if (product) {
            setTimeout(() => {
                openProductModal(product.id);
            }, 500);
        }
    }
}

// Initialize product from URL when products are loaded
document.addEventListener('productsLoaded', getProductFromURL);

// Export functions for global use
window.openProductModal = openProductModal;
window.changeMainImage = changeMainImage;
window.shareProduct = shareProduct;
window.addToWishlist = addToWishlist;

// Note: GLightbox is initialized dynamically when modal is shown
// This ensures it properly captures the current product's image