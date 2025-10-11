// Sistema de Produtos - Atlas Suplementos
let produtos = [];
let categoriaAtual = '';
let termoPesquisa = '';
let produtoAtual = null;
let saborSelecionado = null;
let imagemAtual = 0;

// Carregar produtos quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    configurarPesquisa();
    
    // Verificar se há parâmetro de categoria na URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('categoria');
    if (categoriaUrl) {
        filtrarCategoria(categoriaUrl);
    }
});

// Configurar sistema de pesquisa
function configurarPesquisa() {
    const barraPesquisa = document.getElementById('barra-pesquisa');
    const limparPesquisaBtn = document.getElementById('limpar-pesquisa');
    
    if (barraPesquisa) {
        // Pesquisa em tempo real
        barraPesquisa.addEventListener('input', function() {
            const valor = this.value.trim();
            if (valor.length >= 2) {
                realizarPesquisa(valor);
            } else if (valor.length === 0) {
                limparPesquisa();
            }
        });
        
        // Pesquisa ao pressionar Enter
        barraPesquisa.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const valor = this.value.trim();
                if (valor.length >= 2) {
                    realizarPesquisa(valor);
                }
            }
        });
    }
    
    if (limparPesquisaBtn) {
        limparPesquisaBtn.addEventListener('click', function() {
            limparPesquisa();
        });
    }
}

// Realizar pesquisa
function realizarPesquisa(termo) {
    console.log("🔍 Realizando pesquisa por:", termo);
    termoPesquisa = termo.toLowerCase();
    
    // Mostrar loading
    mostrarLoading(true);
    
    // Simular delay para melhor UX
    setTimeout(() => {
        console.log("🔍 Produtos filtrados:", filtrarProdutos());
        const produtosFiltrados = filtrarProdutos();
        console.log("🖼️ Exibindo produtos filtrados:", produtosFiltrados);
        exibirProdutos(produtosFiltrados);
        console.log("✅ Loading finalizado");
        mostrarLoading(false);
        
        // Mostrar resultados da pesquisa
        mostrarResultadosPesquisa(termo, produtosFiltrados.length);
        
        // Atualizar botões de categoria
        atualizarBotaoCategoriaAtivo();
    }, 300);
}

// Filtrar produtos por pesquisa e categoria
function filtrarProdutos() {
    let produtosFiltrados = produtos;
    
    // Filtrar por categoria se houver
    if (categoriaAtual) {
        produtosFiltrados = produtosFiltrados.filter(p => 
            p.categoria.toLowerCase() === categoriaAtual.toLowerCase()
        );
    }
    
    // Filtrar por termo de pesquisa se houver
    if (termoPesquisa) {
        produtosFiltrados = produtosFiltrados.filter(p => {
            const nome = p.nome.toLowerCase();
            const marca = p.marca.toLowerCase();
            const categoria = p.categoria.toLowerCase();
            const descricao = (p.descricao || '').toLowerCase();
            const sabores = (p.sabores || []).join(' ').toLowerCase();
            
            return nome.includes(termoPesquisa) ||
                   marca.includes(termoPesquisa) ||
                   categoria.includes(termoPesquisa) ||
                   descricao.includes(termoPesquisa) ||
                   sabores.includes(termoPesquisa);
        });
    }
    
    return produtosFiltrados;
}

// Limpar pesquisa
function limparPesquisa() {
    termoPesquisa = '';
    const barraPesquisa = document.getElementById('barra-pesquisa');
    if (barraPesquisa) {
        barraPesquisa.value = '';
    }
    
    // Ocultar resultados da pesquisa
    const resultadosDiv = document.getElementById('resultados-pesquisa');
    if (resultadosDiv) {
        resultadosDiv.classList.add('hidden');
    }
    
    // Ocultar mensagem de nenhum resultado
    const nenhumResultado = document.getElementById('nenhum-resultado');
    if (nenhumResultado) {
        nenhumResultado.classList.add('hidden');
    }
    
    // Exibir produtos filtrados apenas por categoria
    console.log("🔍 Produtos filtrados:", filtrarProdutos());
    const produtosFiltrados = filtrarProdutos();
    console.log("🖼️ Exibindo produtos filtrados:", produtosFiltrados);
    exibirProdutos(produtosFiltrados);
    
    // Atualizar botões de categoria
    atualizarBotaoCategoriaAtivo();
}

// Mostrar resultados da pesquisa
function mostrarResultadosPesquisa(termo, quantidade) {
    const resultadosDiv = document.getElementById('resultados-pesquisa');
    const termoElement = document.getElementById('termo-pesquisado');
    const quantidadeElement = document.getElementById('quantidade-resultados');
    
    if (termoElement) termoElement.textContent = termo;
    if (quantidadeElement) quantidadeElement.textContent = quantidade;
    
    resultadosDiv.classList.remove('hidden');
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading-produtos');
    const container = document.getElementById('produtos-container');
    
    if (mostrar) {
        loading.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        loading.classList.add('hidden');
        container.classList.remove('hidden');
    }
}

// Carregar produtos do backend
function carregarProdutos() {
    mostrarLoading(true);
    
    console.log("📦 Carregando produtos do servidor...");
    fetch('/api/produtos')
        .then(response => {
            console.log("📡 Resposta recebida:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("📦 Produtos carregados:", data);
            produtos = data.produtos || data;
            console.log("📦 Total de produtos:", produtos.length);
            
            const produtosFiltrados = filtrarProdutos();
            console.log("🔍 Produtos filtrados:", produtosFiltrados.length);
            
            exibirProdutos(produtosFiltrados);
            mostrarLoading(false);
            console.log("✅ Carregamento finalizado");
        })
        .catch(error => {
            console.error('❌ Erro ao carregar produtos:', error);
            mostrarLoading(false);
            
            // Mostrar erro na tela
            const container = document.getElementById('produtos-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <div class="text-red-500 text-lg font-semibold mb-4">
                            ❌ Erro ao carregar produtos
                        </div>
                        <div class="text-gray-600">
                            ${error.message}
                        </div>
                        <button onclick="carregarProdutos()" 
                                class="mt-4 px-6 py-2 bg-atlas-gold text-white rounded-lg hover:bg-yellow-600">
                            Tentar Novamente
                        </button>
                    </div>
                `;
                container.classList.remove('hidden');
            }
        });
}

// Exibir produtos na tela
function exibirProdutos(produtosParaExibir = null) {
    console.log("🖼️ Exibindo produtos:", produtosParaExibir);
    const container = document.getElementById('produtos-container');
    const nenhumResultado = document.getElementById('nenhum-resultado');
    
    if (!container) {
        console.error("❌ Container de produtos não encontrado!");
        return;
    }
    
    // Se não foram passados produtos, usar os filtrados
    if (!produtosParaExibir) {
        produtosParaExibir = filtrarProdutos();
    }

    console.log("📊 Total de produtos para exibir:", produtosParaExibir.length);

    if (produtosParaExibir.length === 0) {
        console.log("⚠️ Nenhum produto encontrado, mostrando mensagem");
        container.classList.add('hidden');
        nenhumResultado.classList.remove('hidden');
        return;
    }

    console.log("✅ Exibindo produtos no container");
    container.classList.remove('hidden');
    nenhumResultado.classList.add('hidden');

    container.innerHTML = produtosParaExibir.map(produto => `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="relative overflow-hidden rounded-t-2xl">
                <img src="${produto.imagem_principal || '/static/images/produto-placeholder.svg'}" 
                     alt="${produto.nome}" 
                     class="w-full object-cover hover:scale-110 transition-transform duration-300 img-desktop"
                     onerror="this.src='/static/images/produto-placeholder.svg'">
                <img src="${produto.imagem_mobile || produto.imagem_principal || '/static/images/produto-placeholder.svg'}" 
                     alt="${produto.nome}" 
                     class="w-full object-cover hover:scale-110 transition-transform duration-300 img-mobile"
                     onerror="this.src='/static/images/produto-placeholder.svg'">
                
                <!-- Badge de categoria -->
                <div class="absolute top-4 left-4">
                    <span class="badge px-3 py-1 bg-atlas-gold text-white text-xs font-semibold rounded-full">
                        ${produto.categoria.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                
                <!-- Badge de marca -->
                <div class="absolute top-4 right-16">
                    <span class="badge px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full">
                        ${produto.marca}
                    </span>
                </div>
                
                <!-- Botão de favorito -->
                <button class="favorite-btn absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                    <i class="fas fa-heart text-gray-400 hover:text-red-500"></i>
                </button>
            </div>
            
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">${produto.nome}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${produto.descricao || 'Descrição não disponível'}</p>
                
                <!-- Sabores disponíveis -->
                ${produto.sabores && produto.sabores.length > 0 ? `
                    <div class="mb-4">
                        <p class="text-xs text-gray-500 mb-2">Sabores disponíveis:</p>
                        <div class="flex flex-wrap gap-1">
                            ${produto.sabores.slice(0, 3).map(sabor => `
                                <span class="flavor-tag px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    ${sabor}
                                </span>
                            `).join('')}
                            ${produto.sabores.length > 3 ? `
                                <span class="flavor-tag px-2 py-1 bg-atlas-gold text-white text-xs rounded-full">
                                    +${produto.sabores.length - 3}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between mb-4 mt-auto">
                    <span class="price text-2xl font-bold text-atlas-gold">R$ ${produto.preco.toFixed(2)}</span>
                    <span class="text-sm text-gray-500">${produto.marca}</span>
                </div>
                
                <button onclick="abrirModalProduto('${produto.id}')" 
                        class="details-btn w-full bg-atlas-gold text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                    <i class="fas fa-eye mr-2"></i>
                    Ver Detalhes
                </button>
            </div>
        </div>
    `).join('');
    
    
    // Atualizar botão de limpar pesquisa
    atualizarBotaoLimparPesquisa();
}

// Atualizar botão de limpar pesquisa
function atualizarBotaoLimparPesquisa() {
    const limparBtn = document.getElementById('limpar-pesquisa');
    if (limparBtn) {
        if (termoPesquisa) {
            limparBtn.classList.remove('hidden');
        } else {
            limparBtn.classList.add('hidden');
        }
    }
}


// Filtrar produtos por categoria
function filtrarCategoria(categoria) {
    console.log("🏷️ Filtrando por categoria:", categoria);
    categoriaAtual = categoria;
    
    // Limpar pesquisa ao trocar categoria
    if (termoPesquisa) {
        termoPesquisa = '';
        const barraPesquisa = document.getElementById('barra-pesquisa');
        if (barraPesquisa) {
            barraPesquisa.value = '';
        }
        
        // Ocultar resultados da pesquisa
        const resultadosDiv = document.getElementById('resultados-pesquisa');
        if (resultadosDiv) {
            resultadosDiv.classList.add('hidden');
        }
    }
    
    // Atualizar botões ativos
    atualizarBotaoCategoriaAtivo();
    
    // Exibir produtos filtrados
    console.log("🔍 Produtos filtrados:", filtrarProdutos());
    const produtosFiltrados = filtrarProdutos();
    console.log("🖼️ Exibindo produtos filtrados:", produtosFiltrados);
    exibirProdutos(produtosFiltrados);
}

// Atualizar botão de categoria ativo
function atualizarBotaoCategoriaAtivo() {
    console.log("🎯 Atualizando botão ativo para categoria:", categoriaAtual);
    
    // Resetar todos os botões
    document.querySelectorAll('[data-categoria]').forEach(btn => {
        btn.classList.remove('bg-atlas-gold', 'text-white', 'active', 'bg-gradient-to-r', 'from-atlas-gold', 'to-yellow-500', 'text-gray-900');
        btn.classList.add('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
    });
    
    // Ativar botão da categoria atual
    const botaoAtivo = document.querySelector(`[data-categoria="${categoriaAtual}"]`);
    if (botaoAtivo) {
        console.log("✅ Botão encontrado, ativando:", botaoAtivo);
        botaoAtivo.classList.remove('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
        botaoAtivo.classList.add('bg-gradient-to-r', 'from-atlas-gold', 'to-yellow-500', 'text-gray-900', 'active');
    } else {
        console.log("⚠️ Botão não encontrado para categoria:", categoriaAtual);
    }
}

// Abrir modal do produto
function abrirModalProduto(produtoId) {
    console.log("🔍 Abrindo modal para produto:", produtoId);
    console.log("📦 Lista de produtos:", produtos);
    produtoAtual = produtos.find(p => p.id === produtoId);
    console.log("📦 Produto encontrado:", produtoAtual);
    if (!produtoAtual) {
        console.error("❌ Produto não encontrado:", produtoId);
        return;
    }
    
    // Preencher informações do modal
    document.getElementById('modal-title').textContent = produtoAtual.nome;
    document.getElementById('modal-nome').textContent = produtoAtual.nome;
    document.getElementById('modal-categoria').textContent = produtoAtual.categoria;
    document.getElementById('modal-descricao').textContent = produtoAtual.descricao || 'Descrição não disponível';
    document.getElementById('modal-preco').textContent = `R$ ${produtoAtual.preco.toFixed(2)}`;
    
    // Configurar carousel de imagens
    configurarCarousel();
    
    // Configurar sabores
    configurarSabores();
    
    // Resetar quantidade
    document.getElementById('quantidade-input').value = 1;
    
    // Mostrar modal
    document.getElementById('modal-produto').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Fechar modal do produto
function fecharModalProduto() {
    document.getElementById('modal-produto').classList.add('hidden');
    document.body.style.overflow = 'auto';
    produtoAtual = null;
    saborSelecionado = null;
    imagemAtual = 0;
}

// Configurar carousel de imagens
function configurarCarousel() {
    const carouselInner = document.getElementById('carousel-inner');
    const indicators = document.getElementById('carousel-indicators');
    
    if (!produtoAtual.imagens || produtoAtual.imagens.length === 0) {
        // Imagem padrão se não houver imagens
        carouselInner.innerHTML = `
            <div class="w-full flex-shrink-0">
                <img src="${produtoAtual.imagem_principal || '/static/images/produto-placeholder.svg'}" 
                     alt="${produtoAtual.nome}" 
                     class="w-full h-80 object-cover rounded-lg"
                     onerror="this.src='/static/images/produto-placeholder.svg'">
            </div>
        `;
        indicators.innerHTML = '';
        return;
    }
    
    // Detectar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    // Escolher as imagens apropriadas
    const imagensParaUsar = isMobile && produtoAtual.imagens_mobile ? produtoAtual.imagens_mobile : produtoAtual.imagens;
    
    // Configurar imagens
    carouselInner.innerHTML = imagensParaUsar.map((img, index) => `
        <div class="w-full flex-shrink-0">
            <img src="${img}" alt="${produtoAtual.nome}" 
                 class="w-full h-80 object-cover rounded-lg"
                 onerror="this.src='/static/images/produto-placeholder.svg'">
        </div>
    `).join('');
    
    // Configurar indicadores
    indicators.innerHTML = imagensParaUsar.map((_, index) => `
        <button onclick="irParaImagem(${index})" 
                class="w-3 h-3 rounded-full ${index === 0 ? 'bg-atlas-gold' : 'bg-gray-300'} hover:bg-atlas-gold transition-colors">
        </button>
    `).join('');
    
    imagemAtual = 0;
    atualizarCarousel();
}

// Mudar imagem do carousel
function mudarImagem(direcao) {
    // Detectar se é mobile e escolher imagens apropriadas
    const isMobile = window.innerWidth <= 768;
    const imagensParaUsar = isMobile && produtoAtual.imagens_mobile ? produtoAtual.imagens_mobile : produtoAtual.imagens;
    
    if (!imagensParaUsar || imagensParaUsar.length === 0) return;
    
    imagemAtual += direcao;
    
    if (imagemAtual < 0) imagemAtual = imagensParaUsar.length - 1;
    if (imagemAtual >= imagensParaUsar.length) imagemAtual = 0;
    
    atualizarCarousel();
}

// Ir para imagem específica
function irParaImagem(index) {
    imagemAtual = index;
    atualizarCarousel();
}

// Atualizar posição do carousel
function atualizarCarousel() {
    const carouselInner = document.getElementById('carousel-inner');
    const indicators = document.querySelectorAll('#carousel-indicators button');
    
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${imagemAtual * 100}%)`;
    }
    
    // Atualizar indicadores
    indicators.forEach((indicator, index) => {
        if (index === imagemAtual) {
            indicator.classList.remove('bg-gray-300');
            indicator.classList.add('bg-atlas-gold');
        } else {
            indicator.classList.remove('bg-atlas-gold');
            indicator.classList.add('bg-gray-300');
        }
    });
}

// Configurar sabores disponíveis
function configurarSabores() {
    console.log("🍓 Configurando sabores para produto:", produtoAtual);
    const container = document.getElementById("sabores-container");
    
    if (!produtoAtual.sabores || produtoAtual.sabores.length === 0) {
        // Exibir "Sabor Padrão" quando não há sabores
        container.innerHTML = `
            <div class="p-3 border-2 border-atlas-gold bg-atlas-gold/10 rounded-lg text-center">
                <div class="text-sm font-medium text-atlas-gold">Sabor Padrão</div>
                <div class="text-xs text-gray-500 mt-1">Sem sabor</div>
            </div>
        `;
        saborSelecionado = "Sabor Padrão";
        return;
    }
    
    container.innerHTML = produtoAtual.sabores.map(sabor => `
        <button onclick="selecionarSabor('${sabor}')" 
                class="sabor-btn p-2 sm:p-3 border-2 border-gray-200 rounded-lg text-xs sm:text-sm font-medium hover:border-atlas-gold hover:text-atlas-gold transition-colors text-center break-words leading-tight">
            ${sabor}
        </button>
    `).join('');
    
    // Selecionar primeiro sabor por padrão
    if (produtoAtual.sabores.length > 0) {
        selecionarSabor(produtoAtual.sabores[0]);
    }
}

// Selecionar sabor
function selecionarSabor(sabor) {
    console.log("🍓 Selecionando sabor:", sabor);
    saborSelecionado = sabor;
    
    // Atualizar botões de sabor
    document.querySelectorAll('.sabor-btn').forEach(btn => {
        btn.classList.remove('border-atlas-gold', 'text-atlas-gold', 'bg-atlas-gold', 'text-white');
        btn.classList.add('border-gray-200', 'text-gray-700');
    });
    
    // Marcar sabor selecionado
    const botaoSelecionado = Array.from(document.querySelectorAll('.sabor-btn')).find(btn => 
        btn.textContent.trim() === sabor
    );
    
    if (botaoSelecionado) {
        botaoSelecionado.classList.remove('border-gray-200', 'text-gray-700');
        botaoSelecionado.classList.add('border-atlas-gold', 'text-white', 'bg-atlas-gold');
    }
}

// Alterar quantidade
function alterarQuantidade(delta) {
    const input = document.getElementById('quantidade-input');
    let valor = parseInt(input.value) + delta;
    
    if (valor < 1) valor = 1;
    if (valor > 99) valor = 99;
    
    input.value = valor;
}

// Adicionar ao carrinho
function adicionarAoCarrinho() {
    console.log("🔍 Função adicionarAoCarrinho do modal chamada");
    console.log("📦 produtoAtual:", produtoAtual);
    console.log("🍓 saborSelecionado:", saborSelecionado);
    if (!produtoAtual || !saborSelecionado) {
        alert('Selecione um sabor primeiro!');
        return;
    }
    
    const quantidade = parseInt(document.getElementById('quantidade-input').value);
    
    // Chamar função do carrinho global
    console.log("🔍 Verificando carrinhoManager:", typeof carrinhoManager);
    console.log("🔍 carrinhoManager.adicionarAoCarrinho:", carrinhoManager?.adicionarAoCarrinho);
    
    if (typeof carrinhoManager !== 'undefined' && carrinhoManager.adicionarAoCarrinho) {
        console.log("✅ Chamando carrinhoManager.adicionarAoCarrinho");
        carrinhoManager.adicionarAoCarrinho(produtoAtual.id, saborSelecionado, quantidade);
        fecharModalProduto();
    } else {
        console.error('❌ CarrinhoManager não encontrado ou método não disponível');
        console.error('carrinhoManager:', carrinhoManager);
        alert('Erro: Sistema de carrinho não disponível');
    }
}

// Comprar agora
function comprarAgora() {
    if (!produtoAtual || !saborSelecionado) {
        alert('Selecione um sabor primeiro!');
        return;
    }
    
    const quantidade = parseInt(document.getElementById('quantidade-input').value);
    
    // Adicionar ao carrinho e abrir checkout
    if (typeof carrinhoManager !== 'undefined' && carrinhoManager.adicionarAoCarrinho) {
        carrinhoManager.adicionarAoCarrinho(produtoAtual.id, saborSelecionado, quantidade);
        fecharModalProduto();
        
        // Abrir checkout
        setTimeout(() => {
            window.location.href = '/checkout';
        }, 500);
    } else {
        console.error('CarrinhoManager não encontrado');
        alert('Erro: Sistema de carrinho não disponível');
    }
}

// Fechar modal de checkout
function fecharModalCheckout() {
    document.getElementById('modal-checkout').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.id === 'modal-produto' || e.target.id === 'modal-checkout') {
        e.target.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
});

// Fechar modais com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalProduto();
        fecharModalCheckout();
    }
}); 
