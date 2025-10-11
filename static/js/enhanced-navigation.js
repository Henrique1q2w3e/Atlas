/* ========================================
   ATLAS SUPLEMENTOS - NAVEGAÇÃO MELHORADA
   ======================================== */

console.log('🚀 Enhanced Navigation carregado');

// Implementação completa da navegação
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM carregado - Enhanced Navigation ativo');
    
    // Elementos da navegação
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('enhanced-navbar');
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const categoriasLink = document.getElementById('categorias-link');
    const categoriasDropdown = document.getElementById('categorias-dropdown');
    
    // ========================================
    // MENU MOBILE
    // ========================================
    if (mobileBtn && mobileMenu) {
        console.log('✅ Elementos do menu mobile encontrados');
        
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔄 Toggle do menu mobile');
            
            // Toggle do menu mobile
            mobileMenu.classList.toggle('active');
            mobileBtn.classList.toggle('active');
            
            console.log('Menu mobile ativo:', mobileMenu.classList.contains('active'));
            
            // Prevenir scroll do body quando menu estiver aberto
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                console.log('🔒 Scroll bloqueado');
            } else {
                document.body.style.overflow = '';
                console.log('🔓 Scroll liberado');
            }
        });
        
        // Fechar menu mobile ao clicar em um link
        const mobileLinks = mobileMenu.querySelectorAll('.navbar-mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileBtn.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // Fechar menu mobile ao clicar fora
    document.addEventListener('click', (e) => {
        if (mobileBtn && mobileMenu && 
            !mobileBtn.contains(e.target) && 
            !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ========================================
    // DROPDOWN DE CATEGORIAS
    // ========================================
    if (categoriasLink && categoriasDropdown) {
        categoriasLink.addEventListener('click', (e) => {
            e.preventDefault();
            categoriasDropdown.classList.toggle('active');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!categoriasLink.contains(e.target) && !categoriasDropdown.contains(e.target)) {
                categoriasDropdown.classList.remove('active');
            }
        });
    }
    
    // ========================================
    // DROPDOWN DO USUÁRIO
    // ========================================
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.toggle('active');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // ========================================
    // SCROLL DA NAVEGAÇÃO
    // ========================================
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (navbar) {
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Esconder/mostrar navbar baseado no scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        }
        
        lastScrollY = currentScrollY;
    });
    
    // ========================================
    // VERIFICAÇÃO DE LOGIN
    // ========================================
    function verificarLogin() {
        console.log('Verificando status do usuário...');
        fetch('/api/verificar-login')
            .then(response => response.json())
            .then(data => {
                console.log('Status do usuário:', data);
                const userMenuContent = document.getElementById('user-menu-content');
                if (userMenuContent) {
                    if (data.logado) {
                        userMenuContent.innerHTML = `
                            <a href="/perfil" class="navbar-dropdown-item">
                                <i class="fas fa-user mr-2"></i>Perfil
                            </a>
                            <a href="/pedidos" class="navbar-dropdown-item">
                                <i class="fas fa-shopping-bag mr-2"></i>Pedidos
                            </a>
                            <a href="#" onclick="logout()" class="navbar-dropdown-item">
                                <i class="fas fa-sign-out-alt mr-2"></i>Sair
                            </a>
                        `;
                    } else {
                        userMenuContent.innerHTML = `
                            <a href="/login" class="navbar-dropdown-item">
                                <i class="fas fa-sign-in-alt mr-2"></i>Login
                            </a>
                            <a href="/registro" class="navbar-dropdown-item">
                                <i class="fas fa-user-plus mr-2"></i>Registrar
                            </a>
                        `;
                    }
                }
            })
            .catch(error => console.error('Erro ao verificar login:', error));
    }
    
    // Verificar login ao carregar
    verificarLogin();
    
    // ========================================
    // FUNÇÃO DE LOGOUT
    // ========================================
    window.logout = function() {
        console.log('Fazendo logout...');
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Logout realizado com sucesso');
                // Recarregar a página para atualizar o menu
                window.location.reload();
            } else {
                console.error('Erro no logout:', data.error);
            }
        })
        .catch(error => {
            console.error('Erro ao fazer logout:', error);
        });
    };
    
    console.log('✅ Enhanced Navigation inicializado com sucesso');
});
