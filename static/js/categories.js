/**
 * Categories Module - Atlas Suplementos
 * Implementa seção de categorias com interatividade completa
 * 
 * @author Atlas Team
 * @version 1.0.0
 */

/**
 * Inicializa o módulo de categorias
 * @param {Object} options - Opções de configuração
 * @returns {Object} API pública do módulo
 */
export function initCategories(options = {}) {
    // Configurações padrão
    const config = {
        containerSelector: options.containerSelector || '#categorias',
        tabsSelector: options.tabsSelector || '.category-tab',
        productsGridId: options.productsGridId || 'products-grid',
        productsCarouselId: options.productsCarouselId || 'products-carousel',
        mainImgId: options.mainImgId || 'main-category-img',
        mainImgMobileId: options.mainImgMobileId || 'main-category-img-mobile',
        data: options.data || {},
        productCardRenderer: options.productCardRenderer || null,
        ...options
    };

    // Estado interno
    let currentCategory = null;
    let container = null;
    let tabs = [];
    let productsGrid = null;
    let productsCarousel = null;
    let mainImg = null;
    let mainImgMobile = null;
    let intersectionObserver = null;

    /**
     * Inicializa o módulo
     */
    function init() {
        try {
            // Elementos DOM
            container = document.querySelector(config.containerSelector);
            if (!container) {
                console.error('Container de categorias não encontrado:', config.containerSelector);
                return null;
            }

            tabs = Array.from(container.querySelectorAll(config.tabsSelector));
            productsGrid = container.querySelector(`#${config.productsGridId}`);
            productsCarousel = container.querySelector(`#${config.productsCarouselId}`);
            mainImg = container.querySelector(`#${config.mainImgId}`);
            mainImgMobile = container.querySelector(`#${config.mainImgMobileId}`);

            // Validação de elementos essenciais
            if (!tabs.length) {
                console.warn('Nenhuma tab de categoria encontrada');
            }

            // Configurar tabs
            setupTabs();
            
            // Configurar lazy loading
            setupLazyLoading();
            
            // Configurar acessibilidade do carrossel
            setupCarouselAccessibility();
            
            // Configurar debounce para resize
            setupResizeHandler();
            
            // Selecionar primeira categoria por padrão
            const firstCategory = Object.keys(config.data)[0];
            if (firstCategory) {
                selectCategory(firstCategory);
            }

            console.log('Módulo de categorias inicializado com sucesso');
            return api;

        } catch (error) {
            console.error('Erro ao inicializar módulo de categorias:', error);
            return null;
        }
    }

    /**
     * Configura as tabs com eventos de clique e teclado
     */
    function setupTabs() {
        tabs.forEach((tab, index) => {
            // Event listener para clique
            tab.addEventListener('click', () => {
                const categoryId = tab.dataset.category;
                if (categoryId) {
                    selectCategory(categoryId);
                }
            });

            // Event listeners para teclado
            tab.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevTab = tabs[index - 1] || tabs[tabs.length - 1];
                        prevTab.focus();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextTab = tabs[index + 1] || tabs[0];
                        nextTab.focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        tabs[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        tabs[tabs.length - 1].focus();
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        const categoryId = tab.dataset.category;
                        if (categoryId) {
                            selectCategory(categoryId);
                        }
                        break;
                }
            });
        });
    }

    /**
     * Seleciona uma categoria
     * @param {string} categoryId - ID da categoria
     */
    function selectCategory(categoryId) {
        try {
            const category = config.data[categoryId];
            if (!category) {
                console.error('Categoria não encontrada:', categoryId);
                return;
            }

            // Atualizar estado
            currentCategory = categoryId;

            // Atualizar tabs
            updateTabs(categoryId);

            // Atualizar imagem principal
            updateMainImage(category);

            // Renderizar produtos
            renderProducts(categoryId);

            // Emitir evento customizado
            container.dispatchEvent(new CustomEvent('categorychange', {
                detail: { categoryId, categoryData: category }
            }));

        } catch (error) {
            console.error('Erro ao selecionar categoria:', error);
        }
    }

    /**
     * Atualiza o estado visual das tabs
     * @param {string} categoryId - ID da categoria ativa
     */
    function updateTabs(categoryId) {
        tabs.forEach(tab => {
            const isActive = tab.dataset.category === categoryId;
            tab.setAttribute('aria-selected', isActive);
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
            
            // Atualizar classes visuais
            if (isActive) {
                tab.classList.remove('bg-gray-200', 'text-gray-700');
                tab.classList.add('bg-gradient-to-r', 'from-yellow-400', 'to-yellow-500', 'text-white');
            } else {
                tab.classList.remove('bg-gradient-to-r', 'from-yellow-400', 'to-yellow-500', 'text-white');
                tab.classList.add('bg-gray-200', 'text-gray-700');
            }
        });
    }

    /**
     * Atualiza a imagem principal com animação
     * @param {Object} category - Dados da categoria
     */
    function updateMainImage(category) {
        if (!category.image) return;

        const updateImage = (imgElement, imageData) => {
            if (!imgElement || !imageData) return;

            // Verificar se a imagem já está carregada
            const newSrc = imageData.desktop || imageData;
            if (imgElement.src === newSrc) return;

            // Animação de fade out
            imgElement.style.transition = 'opacity 0.3s ease';
            imgElement.style.opacity = '0';
            
            setTimeout(() => {
                // Atualizar src e alt
                imgElement.src = newSrc;
                imgElement.alt = imageData.alt || category.title;
                
                // Adicionar onerror para fallback
                imgElement.onerror = function() {
                    this.src = '/static/images/placeholder.png';
                };
                
                // Animação de fade in
                imgElement.style.opacity = '1';
            }, 300);
        };

        // Atualizar imagens desktop e mobile
        updateImage(mainImg, category.image);
        updateImage(mainImgMobile, category.image);
    }

    /**
     * Renderiza os produtos da categoria
     * @param {string} categoryId - ID da categoria
     */
    function renderProducts(categoryId) {
        const category = config.data[categoryId];
        if (!category || !category.products) {
            console.warn('Produtos não encontrados para categoria:', categoryId);
            return;
        }

        const products = category.products;
        
        // Limpar containers
        if (productsGrid) {
            productsGrid.innerHTML = '';
        }
        if (productsCarousel) {
            productsCarousel.innerHTML = '';
        }

        if (products.length === 0) {
            showEmptyState();
            return;
        }

        // Renderizar produtos
        products.forEach(product => {
            const card = createProductCard(product);
            
            // Adicionar ao grid (desktop)
            if (productsGrid) {
                productsGrid.appendChild(card.cloneNode(true));
            }
            
            // Adicionar ao carrossel (mobile)
            if (productsCarousel) {
                const mobileCard = card.cloneNode(true);
                mobileCard.classList.add('flex-shrink-0', 'snap-start', 'w-64');
                productsCarousel.appendChild(mobileCard);
            }
        });

        // Emitir evento
        container.dispatchEvent(new CustomEvent('productsrendered', {
            detail: { categoryId, count: products.length }
        }));
    }

    /**
     * Cria um card de produto
     * @param {Object} product - Dados do produto
     * @returns {HTMLElement} Elemento do card
     */
    function createProductCard(product) {
        // Usar renderer customizado se fornecido
        if (config.productCardRenderer && typeof config.productCardRenderer === 'function') {
            return config.productCardRenderer(product);
        }

        // Renderer padrão melhorado
        const card = document.createElement('article');
        card.className = 'product-card bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-105';
        card.setAttribute('role', 'article');
        card.setAttribute('aria-labelledby', `card-title-${product.id}`);

        const price = product.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Sob consulta';
        const originalPrice = product.originalPrice ? `R$ ${product.originalPrice.toFixed(2).replace('.', ',')}` : '';
        const discount = product.originalPrice && product.price ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        const badge = product.badge ? 
            `<span class="inline-block px-3 py-1 text-xs font-semibold product-badge text-white rounded-full">${product.badge}</span>` : '';
        
        const discountBadge = discount > 0 ? 
            `<div class="absolute top-2 right-2 discount-badge text-white px-3 py-1 rounded-full text-xs font-bold">-${discount}%</div>` : '';

        const benefits = product.benefits ? product.benefits.slice(0, 2).map(benefit => 
            `<div class="flex items-center text-xs benefits mb-1">
                <svg class="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                ${benefit}
            </div>`
        ).join('') : '';

        card.innerHTML = `
            <div class="h-full flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 overflow-hidden group border border-slate-700">
                <!-- Imagem do produto -->
                <div class="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                    <img data-src="${product.image}" 
                         alt="${product.title}" 
                         class="w-full h-full object-cover lazy group-hover:scale-110 transition-transform duration-700" 
                         loading="lazy"
                         onerror="this.src='/static/images/placeholder.png'">
                    ${discountBadge}
                    
                    <!-- Overlay gradiente dourado -->
                    <div class="absolute inset-0 bg-gradient-to-t from-yellow-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <!-- Ícone de visualização -->
                    <div class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <div class="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full p-2 shadow-lg">
                            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Conteúdo do card -->
                <div class="p-6 flex flex-col h-full bg-gradient-to-b from-slate-800 to-slate-900">
                    <div class="flex-1">
                        <h3 id="card-title-${product.id}" class="title text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">${product.title}</h3>
                        
                        <!-- Benefícios -->
                        <div class="space-y-2 mb-4">
                            ${benefits}
                        </div>
                    </div>
                    
                    <!-- Preço e badge -->
                    <div class="mt-auto">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center">
                                ${originalPrice ? `<span class="text-gray-400 line-through text-sm mr-2">${originalPrice}</span>` : ''}
                                <span class="price text-yellow-400 font-bold text-xl">${price}</span>
                            </div>
                            ${badge}
                        </div>
                        
                        <!-- Botão de compra -->
                        <a href="${product.url || '#'}" 
                           class="block w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group-hover:shadow-xl transform hover:scale-105 relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                            </svg>
                            <span class="relative z-10">COMPRAR AGORA</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Mostra estado vazio quando não há produtos
     */
    function showEmptyState() {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'col-span-full text-center py-8';
        emptyMessage.innerHTML = `
            <p class="text-gray-500 mb-4">Nenhum produto encontrado nesta categoria</p>
            <button class="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                Ver todos os produtos
            </button>
        `;

        if (productsGrid) {
            productsGrid.appendChild(emptyMessage);
        }
        if (productsCarousel) {
            productsCarousel.appendChild(emptyMessage.cloneNode(true));
        }
    }

    /**
     * Configura lazy loading para imagens
     */
    function setupLazyLoading() {
        // Intersection Observer para lazy loading
        if ('IntersectionObserver' in window) {
            intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            intersectionObserver.unobserve(img);
                        }
                    }
                });
            }, { rootMargin: '50px' });

            // Observar imagens lazy
            const lazyImages = container.querySelectorAll('img.lazy');
            lazyImages.forEach(img => intersectionObserver.observe(img));
        }
    }

    /**
     * Configura acessibilidade do carrossel
     */
    function setupCarouselAccessibility() {
        if (!productsCarousel) return;

        const carouselContainer = productsCarousel.closest('[aria-roledescription="carousel"]');
        if (carouselContainer) {
            carouselContainer.setAttribute('aria-label', 'Produtos da categoria');
        }
    }

    /**
     * Configura handler de resize com debounce
     */
    function setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Recalcular layout se necessário
                if (currentCategory) {
                    renderProducts(currentCategory);
                }
            }, 250);
        });
    }

    /**
     * API pública do módulo
     */
    const api = {
        /**
         * Seleciona uma categoria
         * @param {string} categoryId - ID da categoria
         */
        selectCategory,

        /**
         * Retorna a categoria atual
         * @returns {string|null} ID da categoria atual
         */
        getCurrentCategory: () => currentCategory,

        /**
         * Destrói o módulo e limpa recursos
         */
        destroy: () => {
            if (intersectionObserver) {
                intersectionObserver.disconnect();
            }
            // Limpar event listeners se necessário
        }
    };

    // Inicializar e retornar API
    return init();
}

// Dados de exemplo para desenvolvimento
export const SAMPLE_CATEGORIES_DATA = {
    "massa-muscular": {
        "id": "massa-muscular",
        "title": "Massa Muscular",
        "image": {
            "desktop": "/static/images/categoria-musculo.png",
            "mobile": "/static/images/categoria-musculo.png",
            "alt": "Massa Muscular"
        },
        "products": [
            {
                "id": "w1",
                "title": "Whey Protein 1kg",
                "price": 199.90,
                "originalPrice": 249.90,
                "image": "/static/images/whey-integral.png",
                "badge": "Mais vendido",
                "url": "whey.html?p=w1",
                "stock": 10,
                "benefits": ["Aumenta massa muscular", "Recuperação rápida", "Alto valor biológico"]
            },
            {
                "id": "c1",
                "title": "Creatina 300g",
                "price": 89.90,
                "originalPrice": 119.90,
                "image": "/static/images/creatina.png",
                "badge": "Promo",
                "url": "creatina.html?p=c1",
                "stock": 25,
                "benefits": ["Força e potência", "Resistência muscular", "Recuperação"]
            },
            {
                "id": "b1",
                "title": "BCAA 2:1:1",
                "price": 79.90,
                "originalPrice": 99.90,
                "image": "/static/images/pre-max.png",
                "badge": "Novo",
                "url": "bcaa.html?p=b1",
                "stock": 15,
                "benefits": ["Previne catabolismo", "Energia muscular", "Recuperação"]
            }
        ]
    },
    "emagrecimento": {
        "id": "emagrecimento",
        "title": "Emagrecimento",
        "image": {
            "desktop": "/static/images/categoria-musculo.png", // Usando imagem existente
            "mobile": "/static/images/categoria-musculo.png",
            "alt": "Emagrecimento"
        },
        "products": [
            {
                "id": "t1",
                "title": "Termogênico Premium",
                "price": 149.90,
                "originalPrice": 199.90,
                "image": "/static/images/avatar-pre.png",
                "badge": "Novo",
                "url": "termogenico.html?p=t1",
                "stock": 8,
                "benefits": ["Queima de gordura", "Energia", "Metabolismo"]
            },
            {
                "id": "l1",
                "title": "L-Carnitina",
                "price": 69.90,
                "originalPrice": 89.90,
                "image": "/static/images/avatar-vitamina.png",
                "badge": "Promo",
                "url": "l-carnitina.html?p=l1",
                "stock": 20,
                "benefits": ["Queima gordura", "Energia", "Performance"]
            },
            {
                "id": "g1",
                "title": "Garcinia Cambogia",
                "price": 59.90,
                "originalPrice": 79.90,
                "image": "/static/images/avatar-hiper.png",
                "badge": "Bestseller",
                "url": "garcinia.html?p=g1",
                "stock": 12,
                "benefits": ["Controle do apetite", "Queima gordura", "Metabolismo"]
            }
        ]
    },
    "energia": {
        "id": "energia",
        "title": "Energia",
        "image": {
            "desktop": "/static/images/categoria-musculo.png", // Usando imagem existente
            "mobile": "/static/images/categoria-musculo.png",
            "alt": "Energia"
        },
        "products": [
            {
                "id": "p1",
                "title": "Pré-Treino Max",
                "price": 129.90,
                "originalPrice": 159.90,
                "image": "/static/images/avatar-pre.png",
                "badge": "Bestseller",
                "url": "pre-treino.html?p=p1",
                "stock": 12,
                "benefits": ["Energia", "Foco", "Performance"]
            },
            {
                "id": "v1",
                "title": "Vitaminas Complex",
                "price": 59.90,
                "originalPrice": 79.90,
                "image": "/static/images/avatar-vitamina.png",
                "badge": "Essencial",
                "url": "vitaminas.html?p=v1",
                "stock": 30,
                "benefits": ["Energia", "Imunidade", "Bem-estar"]
            },
            {
                "id": "c1",
                "title": "Cafeína Anidra",
                "price": 39.90,
                "originalPrice": 49.90,
                "image": "/static/images/avatar-barrinha.png",
                "badge": "Econômico",
                "url": "cafeina.html?p=c1",
                "stock": 25,
                "benefits": ["Energia", "Foco", "Performance"]
            }
        ]
    }
};
