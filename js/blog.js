let blogPosts = [];

async function loadBlogPosts() {
    try {
        const response = await fetch(window.SITE_CONFIG.getPath('data/blog.json'));
        const data = await response.json();
        blogPosts = data.posts;
        renderBlogGrid();
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

function renderBlogGrid() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    const blogCards = blogPosts.map(post => `
        <div class="col-lg-4 col-md-6 col-sm-6">
            <a href="blog-post.html?slug=${post.slug}" class="text-decoration-none">
                <article class="card h-100 border-0 shadow-sm blog-card">
                    <img src="${window.SITE_CONFIG.getPath(post.image)}" 
                         alt="${post.title}" 
                         class="card-img-top" 
                         style="height: 250px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="mb-2">
                            <span class="badge bg-${post.categoryClass}">${post.category}</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark">${post.title}</h5>
                        <p class="card-text text-muted">${post.excerpt}</p>
                        <div class="mt-auto">
                            <small class="text-muted"><i class="fas fa-calendar me-1"></i>${post.date}</small>
                        </div>
                    </div>
                </article>
            </a>
        </div>
    `);
    
    blogGrid.innerHTML = DOMPurify.sanitize(blogCards.join(''));
}

async function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        const response = await fetch(window.SITE_CONFIG.getPath('data/blog.json'));
        const data = await response.json();
        const post = data.posts.find(p => p.slug === slug);
        
        if (!post) {
            window.location.href = 'blog.html';
            return;
        }
        
        renderBlogPost(post);
    } catch (error) {
        console.error('Error loading blog post:', error);
    }
}

function renderBlogPost(post) {
    document.title = `${post.title} | TheIndianEthnic.sg Blog`;
    
    // Track blog post view
    if (typeof trackBlogOpen === 'function') {
        trackBlogOpen(post.title);
    }
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = post.excerpt;
    }
    
    const categoryBadge = document.getElementById('postCategory');
    const postTitle = document.getElementById('postTitle');
    const postMeta = document.getElementById('postMeta');
    const postImage = document.getElementById('postImage');
    const postContent = document.getElementById('postContent');
    
    if (categoryBadge) {
        categoryBadge.className = `badge bg-${post.categoryClass}`;
        categoryBadge.textContent = post.category;
    }
    
    if (postTitle) {
        postTitle.textContent = post.title;
    }
    
    if (postMeta) {
        postMeta.innerHTML = DOMPurify.sanitize(`
            <i class="fas fa-calendar me-2"></i>${post.date}
            <i class="fas fa-clock ms-3 me-2"></i>${post.readTime}
        `);
    }
    
    if (postImage) {
        postImage.src = window.SITE_CONFIG.getPath(post.image);
        postImage.alt = post.title;
    }
    
    if (postContent && post.content) {
        let contentHTML = '';
        
        post.content.forEach(block => {
            switch (block.type) {
                case 'paragraph':
                    contentHTML += `<p class="lead">${block.text}</p>`;
                    break;
                case 'heading':
                    if (block.level === 2) {
                        contentHTML += `<h2 class="fw-bold mt-5 mb-3">${block.text}</h2>`;
                    } else if (block.level === 3) {
                        contentHTML += `<h3 class="fw-bold mt-4 mb-3">${block.text}</h3>`;
                    } else if (block.level === 4) {
                        contentHTML += `<h4 class="fw-bold mt-3 mb-2">${block.text}</h4>`;
                    }
                    break;
                case 'list':
                    contentHTML += '<ul>';
                    block.items.forEach(item => {
                        contentHTML += `<li>${item}</li>`;
                    });
                    contentHTML += '</ul>';
                    break;
                case 'tip':
                    contentHTML += `
                        <div class="alert alert-info mt-5">
                            <h5 class="fw-bold"><i class="fas fa-lightbulb me-2"></i>${block.title}</h5>
                            <p class="mb-0">${block.text}</p>
                        </div>
                    `;
                    break;
            }
        });
        
        contentHTML += `
            <h3 class="fw-bold mt-5 mb-3">Ready to Shop?</h3>
            <p>Now that you've learned more about sarees, explore our collection of beautiful sarees!</p>
            <div class="text-center mt-4">
                <a href="products.html" class="btn btn-primary btn-lg">
                    <i class="fas fa-shopping-bag me-2"></i>Browse Our Collection
                </a>
            </div>
        `;
        
        postContent.innerHTML = DOMPurify.sanitize(contentHTML);
    }
}

if (document.getElementById('blogGrid')) {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
}

if (document.getElementById('postContent')) {
    document.addEventListener('DOMContentLoaded', loadSinglePost);
}
