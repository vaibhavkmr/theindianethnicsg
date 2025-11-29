// Carousel data and functionality
let carouselData = [];

// Load carousel data from JSON
async function loadCarousel() {
    try {
        const response = await fetch(window.SITE_CONFIG.getPath('data/carousel.json'));
        const data = await response.json();
        carouselData = data.slides;
        renderCarousel();
    } catch (error) {
        console.error('Error loading carousel:', error);
        // Fallback: keep existing carousel if JSON fails to load
    }
}

// Render carousel dynamically
function renderCarousel() {
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const carouselInner = document.querySelector('.carousel-inner');
    
    if (!carouselIndicators || !carouselInner || carouselData.length === 0) return;

    // Build indicators
    const indicators = carouselData.map((slide, index) => `
        <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${index}" 
                ${slide.active ? 'class="active"' : ''} 
                aria-label="Slide ${index + 1}"></button>
    `).join('');

    // Build slides
    const slides = carouselData.map(slide => `
        <div class="carousel-item ${slide.active ? 'active' : ''}">
            <div class="hero-slide" style="background-image: url('${slide.backgroundImage}');">
                <div class="hero-overlay"></div>
                <div class="container">
                    <div class="row align-items-center min-vh-75">
                        <div class="col-lg-6">
                            <div class="hero-content text-white">
                                <h1 class="display-4 fw-bold mb-4">${slide.title}</h1>
                                <p class="lead mb-4">${slide.description}</p>
                                <a href="${slide.primaryButton.link}" class="btn btn-primary btn-lg me-3">
                                    ${slide.primaryButton.text}
                                </a>
                                <a href="${slide.secondaryButton.link}" 
                                   class="btn btn-outline-light btn-lg" 
                                   ${slide.secondaryButton.whatsapp ? 'target="_blank"' : ''}>
                                    ${slide.secondaryButton.icon ? `<i class="${slide.secondaryButton.icon} me-2"></i>` : ''}${slide.secondaryButton.text}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Update DOM with sanitized content
    carouselIndicators.innerHTML = DOMPurify.sanitize(indicators);
    carouselInner.innerHTML = DOMPurify.sanitize(slides);

    // Reinitialize Bootstrap carousel
    const carouselElement = document.getElementById('heroCarousel');
    if (carouselElement && typeof bootstrap !== 'undefined') {
        // Dispose existing carousel instance if any
        const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
        if (existingCarousel) {
            existingCarousel.dispose();
        }
        // Create new carousel instance
        new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            ride: 'carousel'
        });
    }
}

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', loadCarousel);
