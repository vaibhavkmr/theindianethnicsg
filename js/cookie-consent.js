function checkConsent() {
    return localStorage.getItem('cookie_consent') === 'accepted';
}

function checkCookieConsent() {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        showCookieConsentBanner();
    } else if (consent === 'accepted') {
        if (typeof initGA === 'function') {
            initGA();
        }
    }
}

function showCookieConsentBanner() {
    const existingBanner = document.getElementById('cookie-consent-banner');
    if (existingBanner) return;
    
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = DOMPurify.sanitize(`
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                <h5><i class="fas fa-cookie-bite me-2"></i>Cookie Notice</h5>
                <p>We use cookies and analytics to improve your browsing experience and understand how visitors interact with our website. Your privacy is important to us - we anonymize all data and comply with PDPA regulations.</p>
            </div>
            <div class="cookie-consent-actions">
                <button class="btn btn-light me-2" id="cookie-decline">Decline</button>
                <button class="btn btn-primary" id="cookie-accept">Accept</button>
            </div>
        </div>
    `);
    
    document.body.appendChild(banner);
    
    const styles = document.createElement('style');
    styles.textContent = `
        .cookie-consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
            color: white;
            padding: 1.5rem;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(100%);
            }
        }
        
        .cookie-consent-banner.hiding {
            animation: slideDown 0.3s ease-out forwards;
        }
        
        .cookie-consent-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2rem;
        }
        
        .cookie-consent-text h5 {
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .cookie-consent-text p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .cookie-consent-actions {
            display: flex;
            gap: 0.5rem;
            flex-shrink: 0;
        }
        
        @media (max-width: 768px) {
            .cookie-consent-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .cookie-consent-actions {
                width: 100%;
            }
            
            .cookie-consent-actions button {
                flex: 1;
            }
        }
    `;
    document.head.appendChild(styles);
    
    document.getElementById('cookie-accept').addEventListener('click', acceptCookies);
    document.getElementById('cookie-decline').addEventListener('click', declineCookies);
}

function acceptCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    hideCookieBanner();
    
    if (typeof initGA === 'function') {
        initGA();
    }
}

function declineCookies() {
    localStorage.setItem('cookie_consent', 'declined');
    hideCookieBanner();
    
    if (typeof clearPendingEvents === 'function') {
        clearPendingEvents();
    }
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.classList.add('hiding');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCookieConsent);
} else {
    checkCookieConsent();
}
