// WhatsApp Integration JavaScript

// WhatsApp Business Number
const WHATSAPP_NUMBER = '919876543210';

// Open WhatsApp with custom message
function openWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open in new window/tab
    window.open(whatsappUrl, '_blank');

    // Track WhatsApp engagement (optional analytics)
    trackWhatsAppEngagement(message);
}

// Generate WhatsApp message for specific product
function generateProductWhatsAppMessage(product) {
    const message = `Hi! I'm interested in ${product.name} (₹${product.price.toLocaleString()}). 

Product Details:
- Category: ${product.category}
- Price: ₹${product.price.toLocaleString()}

Could you please provide more information about this saree? I would like to know about:
- Fabric details
- Available colors
- Care instructions
- Delivery information

Thank you!`;

    return message;
}

// Generate general inquiry message
function generateGeneralInquiryMessage() {
    return `Hi! I'm interested in exploring your saree collection. Could you help me find the perfect saree for my needs?`;
}

// Generate category-specific inquiry message
function generateCategoryInquiryMessage(category) {
    const categoryMessages = {
        'silk': 'Hi! I\'m interested in your silk saree collection. Could you show me your latest designs and prices?',
        'cotton': 'Hi! I\'m looking for comfortable cotton sarees for daily wear. What options do you have available?',
        'designer': 'Hi! I\'m interested in your designer saree collection for special occasions. Could you help me choose?',
        'bridal': 'Hi! I\'m looking for bridal sarees for my upcoming wedding. Could you assist me with your bridal collection?',
        'party': 'Hi! I need party wear sarees for celebrations. What are your latest party saree designs?'
    };

    return categoryMessages[category] || generateGeneralInquiryMessage();
}

// Generate bulk order inquiry message
function generateBulkOrderMessage() {
    return `Hi! I'm interested in placing a bulk order for sarees. Could you please share:
- Minimum order quantities
- Bulk pricing
- Available designs
- Delivery timelines

Thank you!`;
}

// Generate custom design inquiry message
function generateCustomDesignMessage() {
    return `Hi! I'm interested in getting a custom saree designed. Could you please share information about:
- Custom design process
- Available fabrics
- Design options
- Pricing
- Timeline

I have some specific requirements in mind. Thank you!`;
}

// Track WhatsApp engagement for analytics
function trackWhatsAppEngagement(message) {
    try {
        // Basic analytics tracking
        const engagementData = {
            timestamp: new Date().toISOString(),
            message_type: getMessageType(message),
            message_preview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            source_page: window.location.pathname
        };

        // Store in localStorage for basic tracking
        let engagements = JSON.parse(localStorage.getItem('whatsapp_engagements') || '[]');
        engagements.push(engagementData);

        // Keep only last 50 engagements
        if (engagements.length > 50) {
            engagements = engagements.slice(-50);
        }

        localStorage.setItem('whatsapp_engagements', JSON.stringify(engagements));

        // Google Analytics tracking
        if (typeof trackWhatsAppClick === 'function') {
            const productName = message.includes("I'm interested in") ? 
                message.split("I'm interested in ")[1].split("(")[0].trim() : 
                'General Inquiry';
            trackWhatsAppClick(productName, getMessageType(message));
        }

    } catch (error) {
        console.log('Analytics tracking error:', error);
    }
}

// Determine message type for analytics
function getMessageType(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('₹') || lowerMessage.includes('price')) return 'product_inquiry';
    if (lowerMessage.includes('bulk order')) return 'bulk_inquiry';
    if (lowerMessage.includes('custom design')) return 'custom_design';
    if (lowerMessage.includes('bridal')) return 'bridal_inquiry';
    if (lowerMessage.includes('silk')) return 'silk_inquiry';
    if (lowerMessage.includes('cotton')) return 'cotton_inquiry';
    if (lowerMessage.includes('designer')) return 'designer_inquiry';
    if (lowerMessage.includes('party')) return 'party_inquiry';

    return 'general_inquiry';
}

// Initialize WhatsApp functionality
function initializeWhatsApp() {
    // Add click handlers to all WhatsApp buttons
    const whatsappButtons = document.querySelectorAll('[data-whatsapp]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function() {
            const message = this.dataset.whatsapp || generateGeneralInquiryMessage();
            openWhatsApp(message);
        });
    });

    // Add floating WhatsApp button if not exists
    addFloatingWhatsAppButton();
}

// Add floating WhatsApp button
function addFloatingWhatsAppButton() {
    // Check if floating button already exists
    if (document.getElementById('floating-whatsapp')) return;

    const floatingButton = document.createElement('div');
    floatingButton.id = 'floating-whatsapp';
    floatingButton.className = 'floating-whatsapp';
    floatingButton.innerHTML = DOMPurify.sanitize(`
        <button class="btn btn-success rounded-circle p-3 shadow-lg" title="Chat on WhatsApp">
            <i class="fab fa-whatsapp fs-4"></i>
        </button>
    `);

    // Add styles
    floatingButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
    `;

    // Add click handler
    floatingButton.addEventListener('click', function() {
        openWhatsApp(generateGeneralInquiryMessage());
    });

    // Add to page
    document.body.appendChild(floatingButton);

    // Add CSS animation
    if (!document.getElementById('whatsapp-styles')) {
        const styles = document.createElement('style');
        styles.id = 'whatsapp-styles';
        styles.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .floating-whatsapp:hover {
                transform: scale(1.1) !important;
            }

            .floating-whatsapp button {
                background: linear-gradient(135deg, #25D366, #128C7E) !important;
                border: none !important;
                box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4) !important;
            }

            .floating-whatsapp button:hover {
                background: linear-gradient(135deg, #128C7E, #25D366) !important;
                box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6) !important;
            }

            @media (max-width: 768px) {
                .floating-whatsapp {
                    bottom: 15px !important;
                    right: 15px !important;
                }
                .floating-whatsapp button {
                    padding: 0.75rem !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// WhatsApp utility functions
const WhatsAppUtils = {
    // Quick message templates
    templates: {
        product: generateProductWhatsAppMessage,
        general: generateGeneralInquiryMessage,
        category: generateCategoryInquiryMessage,
        bulk: generateBulkOrderMessage,
        custom: generateCustomDesignMessage
    },

    // Quick actions
    sendProductInquiry: function(product) {
        const message = generateProductWhatsAppMessage(product);
        openWhatsApp(message);
    },

    sendCategoryInquiry: function(category) {
        const message = generateCategoryInquiryMessage(category);
        openWhatsApp(message);
    },

    sendCustomMessage: function(message) {
        openWhatsApp(message);
    },

    // Get engagement statistics
    getEngagementStats: function() {
        try {
            const engagements = JSON.parse(localStorage.getItem('whatsapp_engagements') || '[]');
            const stats = {
                total: engagements.length,
                today: 0,
                by_type: {}
            };

            const today = new Date().toDateString();
            engagements.forEach(engagement => {
                const engagementDate = new Date(engagement.timestamp).toDateString();
                if (engagementDate === today) stats.today++;

                const type = engagement.message_type;
                stats.by_type[type] = (stats.by_type[type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            return { total: 0, today: 0, by_type: {} };
        }
    }
};

// Initialize WhatsApp when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeWhatsApp);

// Export functions for global use
window.openWhatsApp = openWhatsApp;
window.generateProductWhatsAppMessage = generateProductWhatsAppMessage;
window.generateCategoryInquiryMessage = generateCategoryInquiryMessage;
window.WhatsAppUtils = WhatsAppUtils;