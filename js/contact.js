// Contact page specific JavaScript

// Initialize contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    initializeContactForm();
    initializeFormValidation();
    initializeNewsletterSubscription();
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// Handle contact form submission
async function handleContactFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    // Disable submit button and show loading
    const originalButtonContent = DOMPurify.sanitize(submitButton.innerHTML);
    submitButton.disabled = true;
    submitButton.innerHTML = DOMPurify.sanitize('<i class="fas fa-spinner fa-spin me-2"></i>Sending...');

    try {
        // Collect form data
        const contactData = {
            firstName: formData.get('firstName') || document.getElementById('firstName').value,
            lastName: formData.get('lastName') || document.getElementById('lastName').value,
            email: formData.get('email') || document.getElementById('email').value,
            phone: formData.get('phone') || document.getElementById('phone').value,
            interest: formData.get('interest') || document.getElementById('interest').value,
            message: formData.get('message') || document.getElementById('message').value,
            newsletter: formData.has('newsletter') || document.getElementById('newsletter').checked,
            timestamp: new Date().toISOString(),
            source: 'website_contact_form'
        };

        // Validate required fields
        if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.message) {
            throw new Error('Please fill in all required fields');
        }

        // Validate email format
        if (!isValidEmail(contactData.email)) {
            throw new Error('Please enter a valid email address');
        }

        // Since this is a static website, we'll store the inquiry and redirect to WhatsApp
        await processContactInquiry(contactData);

        // Show success modal
        showSuccessModal();

        // Reset form
        form.reset();

        // Optional: Send to WhatsApp with inquiry details
        const whatsappMessage = generateContactWhatsAppMessage(contactData);
        setTimeout(() => {
            openWhatsApp(whatsappMessage);
        }, 2000);

    } catch (error) {
        console.error('Contact form error:', error);
        showErrorMessage(error.message);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = DOMPurify.sanitize(originalButtonContent);
    }
}

// Process contact inquiry
async function processContactInquiry(contactData) {
    // Store inquiry in localStorage for backup
    const inquiries = JSON.parse(localStorage.getItem('contact_inquiries') || '[]');
    inquiries.push(contactData);

    // Keep only last 50 inquiries
    if (inquiries.length > 50) {
        inquiries.splice(0, inquiries.length - 50);
    }

    localStorage.setItem('contact_inquiries', JSON.stringify(inquiries));

    // Send to Google Sheets via Apps Script
    const scriptUrl = window.GOOGLE_APPS_SCRIPT_URL;
    
    if (scriptUrl) {
        try {
            const response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });
            
            // Note: no-cors mode means we can't read the response, 
            // but the data will still be sent to Google Sheets
            console.log('Form data sent to Google Sheets');
        } catch (error) {
            console.error('Error sending to Google Sheets:', error);
            // Continue with the form flow even if Google Sheets fails
        }
    }

    return true;
}

// Generate WhatsApp message from contact form data
function generateContactWhatsAppMessage(contactData) {
    let message = `Hi! I submitted a contact form on your website. Here are my details:

Name: ${contactData.firstName} ${contactData.lastName}
Email: ${contactData.email}`;

    if (contactData.phone) {
        message += `\nPhone: ${contactData.phone}`;
    }

    if (contactData.interest) {
        message += `\nInterested in: ${contactData.interest}`;
    }

    message += `\nMessage: ${contactData.message}`;

    if (contactData.newsletter) {
        message += `\n\nI would also like to subscribe to your newsletter for updates and offers.`;
    }

    message += `\n\nPlease get back to me at your convenience. Thank you!`;

    return message;
}

// Show success modal
function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const modal = new bootstrap.Modal(successModal);
        modal.show();
    }
}

// Show error message
function showErrorMessage(message) {
    // Create error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = DOMPurify.sanitize(`
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `);

    // Insert at top of form
    const form = document.getElementById('contactForm');
    if (form) {
        form.insertBefore(alertDiv, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize form validation
function initializeFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Add real-time validation to required fields
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });

    // Email specific validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', validateEmailField);
    }

    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', formatPhoneNumber);
    }
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    clearFieldError(event);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    // Additional validation based on field type
    if (field.type === 'email' && value) {
        if (!isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    if (field.type === 'tel' && value) {
        if (!isValidPhoneNumber(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }

    return true;
}

// Validate email field specifically
function validateEmailField(event) {
    const field = event.target;
    const value = field.value.trim();

    if (value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
    }
}

// Show field error
function showFieldError(field, message) {
    clearFieldError({ target: field });

    field.classList.add('is-invalid');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');

    const errorFeedback = field.parentNode.querySelector('.invalid-feedback');
    if (errorFeedback) {
        errorFeedback.remove();
    }
}

// Format phone number as user types
function formatPhoneNumber(event) {
    const field = event.target;
    let value = field.value.replace(/\D/g, ''); // Remove non-digits

    // Format Indian phone numbers
    if (value.length > 0) {
        if (value.length <= 5) {
            value = value;
        } else if (value.length <= 10) {
            value = value.replace(/(\d{5})(\d{1,5})/, '$1 $2');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{1,5})/, '+91 $2 $3');
        }
    }

    field.value = value;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone number validation helper
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Initialize newsletter subscription
function initializeNewsletterSubscription() {
    const newsletterCheckbox = document.getElementById('newsletter');
    if (newsletterCheckbox) {
        newsletterCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Optional: Track newsletter subscription intent
                trackNewsletterIntent();
            }
        });
    }
}

// Track newsletter subscription intent
function trackNewsletterIntent() {
    const intent = {
        timestamp: new Date().toISOString(),
        source: 'contact_form',
        page: window.location.pathname
    };

    let intents = JSON.parse(localStorage.getItem('newsletter_intents') || '[]');
    intents.push(intent);

    // Keep only last 10 intents
    if (intents.length > 10) {
        intents = intents.slice(-10);
    }

    localStorage.setItem('newsletter_intents', JSON.stringify(intents));
}

// Get contact inquiries statistics
function getContactStats() {
    try {
        const inquiries = JSON.parse(localStorage.getItem('contact_inquiries') || '[]');
        const stats = {
            total: inquiries.length,
            today: 0,
            by_interest: {},
            recent: inquiries.slice(-5)
        };

        const today = new Date().toDateString();
        inquiries.forEach(inquiry => {
            const inquiryDate = new Date(inquiry.timestamp).toDateString();
            if (inquiryDate === today) stats.today++;

            const interest = inquiry.interest || 'general';
            stats.by_interest[interest] = (stats.by_interest[interest] || 0) + 1;
        });

        return stats;
    } catch (error) {
        return { total: 0, today: 0, by_interest: {}, recent: [] };
    }
}

// Export functions for global use
window.getContactStats = getContactStats;