let gaInitialized = false;
let pendingEvents = [];

function clearPendingEvents() {
    pendingEvents = [];
}

function initGA() {
    if (gaInitialized) return;
    
    const measurementId = window.GA_MEASUREMENT_ID;
    
    if (!measurementId) {
        console.warn('Google Analytics Measurement ID not found');
        return;
    }
    
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);
    
    const script2 = document.createElement('script');
    script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=None;Secure'
        });
    `;
    document.head.appendChild(script2);
    
    gaInitialized = true;
    
    setTimeout(() => {
        flushPendingEvents();
    }, 1000);
}

function flushPendingEvents() {
    if (pendingEvents.length > 0 && typeof window.gtag === 'function') {
        pendingEvents.forEach(event => {
            window.gtag('event', event.action, event.data);
        });
        pendingEvents = [];
    }
}

function trackEvent(action, category, label, value) {
    if (typeof window === 'undefined') {
        return;
    }
    
    const eventData = {
        event_category: category,
        event_label: label
    };
    
    if (value !== undefined) {
        eventData.value = value;
    }
    
    if (!window.gtag) {
        pendingEvents.push({ action, data: eventData });
        return;
    }
    
    window.gtag('event', action, eventData);
}

function trackPageView(pagePath) {
    if (typeof window === 'undefined' || !window.gtag) {
        return;
    }
    
    const measurementId = window.GA_MEASUREMENT_ID;
    if (!measurementId) return;
    
    window.gtag('config', measurementId, {
        page_path: pagePath,
        'anonymize_ip': true
    });
}

function trackProductView(productId, productName, productCategory) {
    trackEvent('view_item', 'ecommerce', `${productName} (${productCategory})`, productId);
}

function trackWhatsAppClick(productName, action = 'inquiry') {
    trackEvent('whatsapp_click', 'engagement', `${action}: ${productName}`);
}

function trackCategoryFilter(categoryName) {
    trackEvent('filter_category', 'navigation', categoryName);
}

function trackWishlistAction(action, productName) {
    trackEvent(`wishlist_${action}`, 'engagement', productName);
}

function trackBlogOpen(blogTitle) {
    trackEvent('blog_open', 'content', blogTitle);
}

function trackSearch(searchTerm, resultCount) {
    trackEvent('search', 'engagement', searchTerm, resultCount);
}

function checkConsent() {
    return localStorage.getItem('cookie_consent') === 'accepted';
}

if (checkConsent()) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGA);
    } else {
        initGA();
    }
}
