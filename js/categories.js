// Category rendering functionality
let categoriesData = [];
let productsData = [];

// Load categories and products data from JSON
async function loadCategories() {
    try {
        // Load both categories and products data
        const [categoriesResponse, productsResponse] = await Promise.all([
            fetch('data/categories.json'),
            fetch('data/products.json')
        ]);
        
        const categoriesJson = await categoriesResponse.json();
        const productsJson = await productsResponse.json();
        
        categoriesData = categoriesJson.categories || [];
        productsData = productsJson.products || [];
        
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render categories dynamically
function renderCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    
    if (!categoryGrid || categoriesData.length === 0) return;

    // Build category cards
    const categoryCards = categoriesData.map(categoryData => {
        // Find a product from this category to use as representative image
        const categoryProduct = productsData.find(p => p.category === categoryData.name);
        const categoryImage = categoryProduct ? categoryProduct.images[0] : '/images/products/product-1-main.jpg';
        
        return `
            <div class="col-lg-3 col-md-6">
                <div class="category-card text-center">
                    <div class="category-image mb-3">
                        <img src="${categoryImage}" alt="${categoryData.name}" class="img-fluid rounded-circle">
                    </div>
                    <h4 class="fw-bold mb-2">${categoryData.name}</h4>
                    <p class="text-muted mb-3">${categoryData.description}</p>
                    <a href="web/products.html?category=${categoryData.slug}" class="btn btn-outline-primary">
                        ${categoryData.buttonText}
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Update DOM with sanitized content
    categoryGrid.innerHTML = DOMPurify.sanitize(categoryCards);
}

// Initialize categories on page load
document.addEventListener('DOMContentLoaded', loadCategories);
