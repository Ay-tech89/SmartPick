class SmartPickApp {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupScrollPlugin();
        this.setupAnimations();
        this.setupEventListeners();
        this.setupCounterAnimations();
    }

    setupScrollPlugin() {
        gsap.registerPlugin(ScrollTrigger);
    }


    setupTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        
        if (this.theme === 'light') {
            body.classList.add('light');
            themeBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
        } else {
            themeBtn.innerHTML = '<i class="bi bi-moon-stars"></i>';
        }

        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light');
            const isLight = body.classList.contains('light');
            
            themeBtn.innerHTML = isLight 
                ? '<i class="bi bi-sun-fill"></i>' 
                : '<i class="bi bi-moon-stars"></i>';
            this.theme = isLight ? 'light' : 'dark';
            localStorage.setItem('theme', this.theme);

            // Animate theme transition
            gsap.to('body', {
                duration: 0.5,
                ease: "power2.inOut"
            });
        });
    }


    setupAnimations() {
        // Animation hero content on load
        const heroTimeline = gsap.timeline();
        
        heroTimeline
            .to('.hero-title', {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            })
            .to('.hero-subtitle', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5")
            .to('.cta-btn', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power3.out"
            }, "-=0.3");


        // Animate sections when they come into view
        gsap.to('.section-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: '.features',
                start: 'top 80%',
                toggleActions: "play none none reverse"
            }
        });


        // Animate feature cards
        gsap.to('.feature-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.features-grid',
                start: 'top 80%',
                toggleActions: "play none none reverse"
            }
        });


        // Animate category cards
        gsap.to('.category-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.category-grid',
                start: 'top 80%',
                toggleActions: "play none none reverse"
            }
        });


        // Animate steps
        gsap.to('.step', {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.how-it-works',
                start: 'top 80%',
                toggleActions: "play none none reverse"
            }
        });
    }


    setupEventListeners() {
        // Main CTA buttons in hero section
        const startExploringBtn = document.getElementById('start-exploring');
        const learnMoreBtn = document.getElementById('learn-more');


        if (startExploringBtn) {
            startExploringBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Start Exploring clicked!');
                this.scrollToCategories();
            });
        }


        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Learn More clicked!');
                this.scrollToFeatures();
            });
        }


        // Get started buttons
        const getStartedBtn1 = document.getElementById('get-started-1');


        if (getStartedBtn1) {
            getStartedBtn1.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Get Started clicked!');
                this.scrollToCategories();
            });
        }


        // Category card clicks
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                console.log('Category clicked:', category);
                
                // Only navigate to media or books
                if (category === 'media' || category === 'books') {
                    this.navigateToCategory(category);
                }
            });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // Feature card hover effects
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }


    scrollToCategories() {
        console.log('Scrolling to categories...');
        const categoriesSection = document.getElementById('categories-section');
        
        if (categoriesSection) {
            // Add button press animation
            gsap.to(event.target, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });


            // Smooth scroll to categories
            categoriesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            console.error('Categories section not found!');
        }
    }


    scrollToFeatures() {
        console.log('Scrolling to features...');
        const featuresSection = document.getElementById('features-section');
        
        if (featuresSection) {
            // Add button press animation
            gsap.to(event.target, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });


            // Smooth scroll to features
            featuresSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            console.error('Features section not found!');
        }
    }


    navigateToCategory(category) {
        console.log('Navigating to category:', category);
        
        // Add click animation
        gsap.to('.category-card', {
            scale: 0.98,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to('.category-card', {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                });
            }
        });


        // Navigate after animation
        setTimeout(() => {
            window.location.href = `pages/${category}.html`;
        }, 300);
    }
}


// app Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('SmartPick app initializing...');
    new SmartPickApp();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('SmartPick app initializing (alternative)...');
        new SmartPickApp();
    });
} else {
    console.log('SmartPick app initializing (immediate)...');
    new SmartPickApp();
}