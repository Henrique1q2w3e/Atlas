/* ========================================
   ATLAS SUPPLEMENTS - MODERN NAVIGATION
   ======================================== */

class ModernNavigation {
    constructor() {
        this.navbar = null;
        this.mobileMenu = null;
        this.mobileMenuBtn = null;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.createModernNavbar();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
    }

    createModernNavbar() {
        // Criar navbar moderna se não existir
        if (!document.querySelector('.navbar-modern')) {
            const navbar = document.createElement('nav');
            navbar.className = 'navbar-modern';
            navbar.innerHTML = `
                <div class="container mx-auto px-4">
                    <div class="flex items-center justify-between py-4">
                        <!-- Logo -->
                        <a href="#" class="navbar-brand-modern">
                            <span class="text-gradient">Atlas</span>
                        </a>

                        <!-- Desktop Menu -->
                        <div class="hidden md:flex items-center space-x-8">
                            <a href="#home" class="nav-link-modern active">Home</a>
                            <a href="#produtos" class="nav-link-modern">Produtos</a>
                            <a href="#categorias" class="nav-link-modern">Categorias</a>
                            <a href="#sobre" class="nav-link-modern">Sobre</a>
                            <a href="#contato" class="nav-link-modern">Contato</a>
                        </div>

                        <!-- Mobile Menu Button -->
                        <button class="md:hidden p-2 text-gray-700 hover:text-atlas-gold transition-colors" id="mobile-menu-btn">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Mobile Menu -->
                    <div class="md:hidden hidden" id="mobile-menu">
                        <div class="py-4 space-y-2">
                            <a href="#home" class="nav-link-modern block">Home</a>
                            <a href="#produtos" class="nav-link-modern block">Produtos</a>
                            <a href="#categorias" class="nav-link-modern block">Categorias</a>
                            <a href="#sobre" class="nav-link-modern block">Sobre</a>
                            <a href="#contato" class="nav-link-modern block">Contato</a>
                        </div>
                    </div>
                </div>
            `;

            // Inserir no início do body
            document.body.insertBefore(navbar, document.body.firstChild);
        }

        this.navbar = document.querySelector('.navbar-modern');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    }

    setupEventListeners() {
        // Event listeners para links de navegação
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link-modern')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.setActiveLink(e.target);
                this.closeMobileMenu();
            }
        });

        // Event listener para botão do menu mobile
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Fechar menu mobile ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            // Adicionar classe scrolled quando rolar
            if (scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Esconder/mostrar navbar baseado na direção do scroll
            if (scrollY > lastScrollY && scrollY > 100) {
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                this.navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    setupMobileMenu() {
        // Animações para o menu mobile
        if (this.mobileMenu) {
            this.mobileMenu.style.transition = 'all 0.3s ease';
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling para todos os links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80; // Compensar altura da navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    setActiveLink(activeLink) {
        // Remover classe active de todos os links
        document.querySelectorAll('.nav-link-modern').forEach(link => {
            link.classList.remove('active');
        });

        // Adicionar classe active ao link clicado
        activeLink.classList.add('active');
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenu.classList.remove('hidden');
        this.mobileMenu.style.maxHeight = this.mobileMenu.scrollHeight + 'px';
        this.mobileMenuBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        `;
    }

    closeMobileMenu() {
        this.mobileMenu.style.maxHeight = '0';
        setTimeout(() => {
            this.mobileMenu.classList.add('hidden');
        }, 300);
        this.mobileMenuBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        `;
        this.isMenuOpen = false;
    }
}

/* ========================================
   ANIMAÇÕES E EFEITOS VISUAIS
   ======================================== */

class VisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        document.querySelectorAll('.card-modern, .hero-content, .section-title').forEach(el => {
            observer.observe(el);
        });
    }

    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    setupHoverEffects() {
        // Efeito de hover nos cards
        document.querySelectorAll('.card-modern').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupLoadingAnimations() {
        // Animação de loading para elementos
        const loadingElements = document.querySelectorAll('.loading');
        
        loadingElements.forEach(element => {
            element.addEventListener('animationend', () => {
                element.classList.remove('loading');
            });
        });
    }
}

/* ========================================
   RESPONSIVIDADE E MOBILE
   ======================================== */

class ResponsiveHandler {
    constructor() {
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }

    init() {
        this.setupResizeListener();
        this.setupTouchGestures();
        this.optimizeForMobile();
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < 640) return 'sm';
        if (width < 768) return 'md';
        if (width < 1024) return 'lg';
        if (width < 1280) return 'xl';
        return '2xl';
    }

    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.handleBreakpointChange();
                }
            }, 250);
        });
    }

    setupTouchGestures() {
        // Swipe gestures para carrosséis mobile
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = startX - endX;
            const diffY = startY - endY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        // Swipe left
                        this.handleSwipeLeft();
                    } else {
                        // Swipe right
                        this.handleSwipeRight();
                    }
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    optimizeForMobile() {
        if (this.currentBreakpoint === 'sm') {
            // Otimizações específicas para mobile
            this.optimizeImages();
            this.optimizeAnimations();
        }
    }

    handleBreakpointChange() {
        // Reconfigurar layout baseado no novo breakpoint
        this.optimizeForMobile();
    }

    handleSwipeLeft() {
        // Implementar navegação por swipe
        console.log('Swipe left detected');
    }

    handleSwipeRight() {
        // Implementar navegação por swipe
        console.log('Swipe right detected');
    }

    optimizeImages() {
        // Lazy loading para imagens
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeAnimations() {
        // Reduzir animações em dispositivos móveis para melhor performance
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
        }
    }
}

/* ========================================
   INICIALIZAÇÃO
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos os módulos
    new ModernNavigation();
    new VisualEffects();
    new ResponsiveHandler();

    // Adicionar classe para indicar que o JavaScript está carregado
    document.body.classList.add('js-loaded');

    // Log de inicialização
    console.log('🚀 Atlas Modern Navigation initialized');
});

/* ========================================
   MELHORIAS DE NAVEGAÇÃO - ATLAS
   ======================================== */

// Melhorar navegação existente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Melhorias de navegação carregadas');
    
    // Adicionar efeito de scroll na navbar
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    
    function updateNavbar() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Auto-hide navbar
        if (scrollY > lastScrollY && scrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
    }
    
    window.addEventListener('scroll', updateNavbar);
    
    // Melhorar menu mobile
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animar ícone hamburger
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars text-xl';
            } else {
                icon.className = 'fas fa-times text-xl';
            }
        });
        
        // Fechar menu ao clicar em link
        mobileMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.className = 'fas fa-bars text-xl';
            }
        });
    }
    
    // Melhorar links de navegação
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remover active de todos os links
            navLinks.forEach(l => l.classList.remove('active'));
            // Adicionar active ao link clicado
            this.classList.add('active');
        });
    });
    
    // Smooth scrolling para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Melhorar botão do carrinho
    const cartBtn = document.querySelector('[onclick="abrirCarrinho()"]');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            // Animação de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    // Adicionar efeito de hover nos cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Melhorar botões
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Adicionar loading suave
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
    
    console.log('✅ Melhorias de navegação aplicadas');
});
