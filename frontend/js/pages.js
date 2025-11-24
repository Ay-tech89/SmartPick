class PageController {
    constructor() {
        this.currentCategory = this.getCurrentCategory();
        this.init();
    }

    getCurrentCategory() {
        const path = window.location.pathname;
        if (path.includes('media')) return 'media';
        if (path.includes('books')) return 'books';
        return 'media';
    }

    init() {
        this.setupTheme();
        this.setupAnimations();
        this.setupEventListeners();
        this.loadRecommendations();
    }

    setupTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        
        if (theme === 'light') {
            body.classList.add('light');
            if (themeBtn) themeBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
        } else {
            if (themeBtn) themeBtn.innerHTML = '<i class="bi bi-moon-stars"></i>';
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                body.classList.toggle('light');
                const isLight = body.classList.contains('light');
                
                themeBtn.innerHTML = isLight 
                    ? '<i class="bi bi-sun-fill"></i>' 
                    : '<i class="bi bi-moon-stars"></i>';
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
        }
    }

    setupAnimations() {
        const tl = gsap.timeline();
        
        tl.to('.hero-icon', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)"
        })
        .to('.page-title', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.4")
        .to('.page-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.4")
        .to('.search-container', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.3")
        .to('.chip, .pref-chip', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out"
        }, "-=0.3")
        .to('.reading-preferences', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.2");
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Filter chips
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                const genre = e.target.dataset.genre;
                if (genre !== 'all') {
                    this.performSearch(genre);
                } else {
                    this.loadRecommendations();
                }
            });
        });

        // Preference chips (for books)
        document.querySelectorAll('.pref-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadRecommendations(true);
            });
        }
    }

    async performSearch(genreQuery = null) {
        const searchInput = document.getElementById('search-input');
        if (!searchInput && !genreQuery) return;
        
        const query = genreQuery || searchInput.value.trim();
        if (!query) return;

        this.showLoading();
        
        try {
            let response;
            
            console.log(`Searching ${this.currentCategory} for: "${query}"`);
            
            // Route to appropriate API based on category
            if (this.currentCategory === 'books') {
                // Google Books API 
                response = await fetch('http://localhost:5000/recommend/google-books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
            } else if (this.currentCategory === 'media') {
                // OMDB API for movies
                response = await fetch('http://localhost:5000/recommend/omdb-movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
            } else {
                this.showError(`${this.currentCategory} recommendations are not available.`);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            console.log(`Found ${data.recommendations?.length || 0} results`);
            
            if (response.status === 429) {
                this.showError(data.error || 'API limit reached. Please try again later.');
                return;
            }
            
            if (data.recommendations?.length === 0) {
                this.showError(data.message || 'No results found. Try a different search.');
                return;
            }
            
            this.displayRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search. Make sure the backend server is running on http://localhost:5000');
        }
    }

    async loadRecommendations(refresh = false) {
        this.showLoading();
        
        try {
            let response;
            
            console.log(`Loading recommendations for: ${this.currentCategory}`);
            
            if (this.currentCategory === 'books') {
                // For books, load some default popular books
                response = await fetch('http://localhost:5000/recommend/google-books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'bestseller fiction' })
                });
            } else if (this.currentCategory === 'media') {
                // For movies, load popular movies
                response = await fetch('http://localhost:5000/recommend/omdb-movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'avengers' })
                });
            } else {
                this.hideLoading();
                this.showError(`${this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1)} recommendations coming soon!`);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            console.log(`Loaded ${data.recommendations?.length || 0} recommendations`);
            
            if (response.status === 429) {
                this.showError(data.error || 'API limit reached. Please try again later.');
                return;
            }
            
            this.displayRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Loading error:', error);
            this.showError('Failed to load recommendations. Make sure the backend server is running');
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('recommendations-grid');
        
        if (loading) loading.style.display = 'flex';
        if (grid) grid.style.opacity = '0';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    displayRecommendations(recommendations) {
        this.hideLoading();
        
        const grid = document.getElementById('recommendations-grid');
        if (!grid) return;
        
        grid.innerHTML = '';

        if (!recommendations.length) {
            grid.innerHTML = '<p class="no-results">No recommendations found. Try a different search.</p>';
            gsap.to(grid, { opacity: 1, duration: 0.5 });
            return;
        }

        recommendations.forEach((item, index) => {
            const card = this.createRecommendationCard(item);
            grid.appendChild(card);
        });

        // Animate cards
        gsap.fromTo(grid.children, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                ease: "power3.out" 
            }
        );

        gsap.to(grid, { opacity: 1, duration: 0.5 });
    }

    createRecommendationCard(item) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        let cardContent = '';
        
        if (this.currentCategory === 'media') {
            // OMDB movie data
            const imageUrl = item.image && item.image !== 'N/A' ? item.image : 'https://via.placeholder.com/300x450/6366f1/ffffff?text=No+Poster';
            const plot = item.plot && item.plot !== 'N/A' && item.plot.length > 150 ? item.plot.substring(0, 150) + '...' : item.plot || 'No plot available.';
            
            cardContent = `
                <div class="card-image">
                    <img src="${imageUrl}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/6366f1/ffffff?text=No+Poster';">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-subtitle">
                        <i class="bi bi-tag"></i> ${item.genre || 'N/A'} • 
                        <i class="bi bi-calendar"></i> ${item.year || 'N/A'}
                    </p>
                    <p class="card-meta">
                        <i class="bi bi-person-video3"></i> <strong>Director:</strong> ${item.director || 'Unknown'}<br>
                        <i class="bi bi-people"></i> <strong>Cast:</strong> ${item.actors || 'Unknown'}
                    </p>
                    <p class="card-description">${plot}</p>
                    ${item.rating && item.rating !== 'N/A' ? `<div class="card-rating">
                        <i class="bi bi-star-fill"></i>
                        <span>${item.rating}/10 IMDb</span>
                    </div>` : ''}
                    ${item.runtime && item.runtime !== 'N/A' ? `<p class="card-runtime">
                        <i class="bi bi-clock"></i> ${item.runtime}
                    </p>` : ''}
                    ${item.imdb_url ? `<a href="${item.imdb_url}" class="card-link" target="_blank" rel="noopener">
                        <i class="bi bi-box-arrow-up-right"></i> View on IMDb
                    </a>` : ''}
                </div>
            `;
        } else if (this.currentCategory === 'books') {
            const description = item.description ? item.description.substring(0, 150) + '...' : 'No description available.';
            
            cardContent = `
                <div class="card-image">
                    <img src="${item.image || 'https://via.placeholder.com/128x200/6366f1/ffffff?text=No+Cover'}" 
                         alt="${item.title}" 
                         onerror="this.src='https://via.placeholder.com/128x200/6366f1/ffffff?text=No+Cover';">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-subtitle">
                        <i class="bi bi-person"></i> ${item.author || 'Unknown Author'}
                    </p>
                    <p class="card-description">${description}</p>
                    ${item.rating ? `<div class="card-rating">
                        <i class="bi bi-star-fill"></i>
                        <span>${item.rating}/5</span>
                    </div>` : ''}
                    ${item.page_count ? `<p class="card-meta">
                        <i class="bi bi-file-earmark-text"></i> ${item.page_count} pages
                    </p>` : ''}
                    ${item.info_link ? `<a href="${item.info_link}" class="card-link" target="_blank" rel="noopener">
                        <i class="bi bi-box-arrow-up-right"></i> More Info
                    </a>` : ''}
                </div>
            `;
        }
        
        card.innerHTML = cardContent;
        
        // Add click event
        card.addEventListener('click', () => {
            gsap.to(card, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        });
        
        return card;
    }

    showError(message) {
        this.hideLoading();
        const grid = document.getElementById('recommendations-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 3rem;">
                    <i class="bi bi-emoji-frown" style="font-size: 3rem; color: var(--text-muted);"></i>
                    <p style="color: var(--text-muted); font-size: 1.1rem; margin-top: 1rem;">${message}</p>
                </div>
            `;
            gsap.to(grid, { opacity: 1, duration: 0.5 });
        }
    }
}

// Initialized page controller awhen DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('PageController initializing...');
    new PageController();
});
