// Sistema de Carrinho - Atlas Suplementos
// Integrado com backend Flask

class CarrinhoManager {
    constructor() {
        console.log('🚀 Inicializando CarrinhoManager...');
        this.carrinho = [];
        this.carregarCarrinho();
    }

    async carregarCarrinho() {
        try {
            console.log('📦 Carregando carrinho do servidor...');
            const response = await fetch('/api/carrinho');
            const data = await response.json();
            this.carrinho = data;
            console.log('✅ Carrinho carregado:', this.carrinho);
            this.atualizarContador();
        } catch (error) {
            console.error('❌ Erro ao carregar carrinho:', error);
        }
    }

    async adicionarProduto(produto) {
        try {
            console.log('➕ Adicionando produto ao carrinho:', produto);
            const response = await fetch('/api/carrinho/adicionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(produto)
            });

            const data = await response.json();
            console.log('📝 Resposta do servidor:', data);
            
            if (data.success) {
                this.carrinho = data.carrinho;
                this.atualizarContador();
                console.log('✅ Produto adicionado com sucesso!');
            } else {
                console.error('❌ Erro ao adicionar produto:', data.error);
            }
        } catch (error) {
            console.error('❌ Erro ao adicionar produto:', error);
        }
    }

    async removerProduto(produtoId, sabor) {
        try {
            console.log('➖ Removendo produto do carrinho:', produtoId, sabor);
            const response = await fetch('/api/carrinho/remover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ produto_id: produtoId, sabor: sabor })
            });

            const data = await response.json();
            
            if (data.success) {
                this.carrinho = data.carrinho;
                this.atualizarContador();
            } else {
                console.error('❌ Erro ao remover produto:', data.error);
            }
        } catch (error) {
            console.error('❌ Erro ao remover produto:', error);
        }
    }

    async limparCarrinho() {
        try {
            console.log('🗑️ Limpando carrinho...');
            const response = await fetch('/api/carrinho/limpar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.carrinho = [];
                this.atualizarContador();
            } else {
                console.error('❌ Erro ao limpar carrinho:', data.error);
            }
        } catch (error) {
            console.error('❌ Erro ao limpar carrinho:', error);
        }
    }

    obterTotal() {
        return this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    obterQuantidadeTotal() {
        return this.carrinho.reduce((total, item) => total + item.quantidade, 0);
    }

    atualizarContador() {
        const contador = document.getElementById('cart-count');
        if (contador) {
            const quantidade = this.obterQuantidadeTotal();
            contador.textContent = quantidade;
            contador.style.display = quantidade > 0 ? 'block' : 'none';
            console.log('🔢 Contador atualizado:', quantidade);
        }
    }


    // Método para adicionar produto ao carrinho (chamado pelos botões)
    async adicionarAoCarrinho(produtoId, sabor, quantidade = 1) {
        console.log('🛒 Adicionando ao carrinho:', produtoId, sabor, quantidade);
        
        // Buscar dados do produto
        try {
            const response = await fetch('/api/produtos');
            const data = await response.json();
            const produtos = data.produtos || data;
            const produto = produtos.find(p => p.id === produtoId);
            
            if (!produto) {
                console.error('❌ Produto não encontrado:', produtoId);
                return;
            }

            console.log('📦 Produto encontrado:', produto);

            const itemCarrinho = {
                produto_id: produtoId,
                nome: produto.nome,
                marca: produto.marca,
                preco: produto.preco,
                sabor: sabor,
                quantidade: quantidade,
                imagem: produto.imagem_principal
            };

            console.log('🛍️ Item do carrinho:', itemCarrinho);
            await this.adicionarProduto(itemCarrinho);
        } catch (error) {
            console.error('❌ Erro ao buscar produto:', error);
        }
    }
}

// Instanciar o gerenciador de carrinho
console.log('🏗️ Criando instância do CarrinhoManager...');
const carrinhoManager = new CarrinhoManager();

// Função global para adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId, sabor, quantidade = 1) {
    console.log('🌐 Função global adicionarAoCarrinho chamada:', produtoId, sabor, quantidade);
    carrinhoManager.adicionarAoCarrinho(produtoId, sabor, quantidade);
}

// Função para abrir o modal do carrinho
function abrirCarrinho() {
    console.log('🛒 Abrindo modal do carrinho...');
    const modal = document.getElementById('modal-carrinho');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        atualizarModalCarrinho();
    }
}

// Função para fechar o modal do carrinho
function fecharModalCarrinho() {
    console.log('❌ Fechando modal do carrinho...');
    const modal = document.getElementById('modal-carrinho');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Função para atualizar o modal do carrinho
async function atualizarModalCarrinho() {
    try {
        console.log('🔄 Atualizando modal do carrinho...');
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        const itensContainer = document.getElementById('carrinho-itens');
        const vazioContainer = document.getElementById('carrinho-vazio');
        const footerContainer = document.getElementById('carrinho-footer');
        const totalElement = document.getElementById('carrinho-total');
        
        if (carrinho.length === 0) {
            // Carrinho vazio
            itensContainer.innerHTML = '';
            vazioContainer.classList.remove('hidden');
            footerContainer.classList.add('hidden');
        } else {
            // Carrinho com itens
            vazioContainer.classList.add('hidden');
            footerContainer.classList.remove('hidden');
            
            // Renderizar itens
            itensContainer.innerHTML = carrinho.map((item, index) => `
                <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg mb-3">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src="${item.imagem || '/static/images/produto-placeholder.svg'}" 
                             alt="${item.nome}" 
                             class="w-12 h-12 object-cover rounded">
                    </div>
                    
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800">${item.nome}</h3>
                        <p class="text-sm text-gray-500">Sabor: ${item.sabor}</p>
                        <div class="flex items-center space-x-2 mt-2">
                            <button onclick="alterarQuantidadeCarrinho(${index}, -1)" 
                                    class="w-6 h-6 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 flex items-center justify-center text-sm">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="text-sm font-medium">${item.quantidade}</span>
                            <button onclick="alterarQuantidadeCarrinho(${index}, 1)" 
                                    class="w-6 h-6 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 flex items-center justify-center text-sm">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="font-semibold text-atlas-gold">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
                        <button onclick="removerItemCarrinho(${index})" 
                                class="text-red-500 hover:text-red-700 text-sm mt-1">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Calcular e exibir total
            const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            if (totalElement) {
                totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
            }
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar modal do carrinho:', error);
    }
}

// Função para alterar quantidade no carrinho
async function alterarQuantidadeCarrinho(index, delta) {
    try {
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        if (index >= 0 && index < carrinho.length) {
            const item = carrinho[index];
            const novaQuantidade = item.quantidade + delta;
            
            if (novaQuantidade <= 0) {
                // Remover item se quantidade for 0 ou menor
                await carrinhoManager.removerProduto(item.produto_id, item.sabor);
            } else {
                // Atualizar quantidade
                const response = await fetch('/api/carrinho/adicionar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        produto_id: item.produto_id,
                        nome: item.nome,
                        preco: item.preco,
                        sabor: item.sabor,
                        quantidade: delta,
                        imagem: item.imagem
                    })
                });
                
                if (response.ok) {
                    await carrinhoManager.carregarCarrinho();
                    atualizarModalCarrinho();
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao alterar quantidade:', error);
    }
}

// Função para remover item do carrinho
async function removerItemCarrinho(index) {
    try {
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        if (index >= 0 && index < carrinho.length) {
            const item = carrinho[index];
            await carrinhoManager.removerProduto(item.produto_id, item.sabor);
            atualizarModalCarrinho();
        }
    } catch (error) {
        console.error('❌ Erro ao remover item:', error);
    }
}

// Função para verificar se usuário está logado
async function verificarLogin() {
    try {
        const response = await fetch('/api/verificar-login');
        const data = await response.json();
        return data.logado;
    } catch (error) {
        console.error('❌ Erro ao verificar login:', error);
        return false;
    }
}

// Função para finalizar compra
async function finalizarCompra() {
    console.log('💳 Finalizando compra...');
    
    // Fechar modal do carrinho
    fecharModalCarrinho();
    
    // Redirecionar para checkout (o checkout fará a verificação de login)
    console.log('✅ Redirecionando para checkout...');
    window.location.href = '/checkout';
}

// Função para mostrar modal de login
function mostrarModalLogin() {
    const modal = document.createElement('div');
    modal.id = 'modal-login-required';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-lock text-2xl text-yellow-600"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Login Necessário</h3>
                <p class="text-gray-600 mb-6">
                    Você precisa estar logado para finalizar a compra.
                </p>
                <div class="flex space-x-3">
                    <button onclick="fecharModalLogin()" 
                            class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-semibold">
                        Cancelar
                    </button>
                    <button onclick="irParaLogin()" 
                            class="flex-1 bg-atlas-gold text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-semibold">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Fazer Login
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal de login
function fecharModalLogin() {
    const modal = document.getElementById('modal-login-required');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Função para ir para login
function irParaLogin() {
    fecharModalLogin();
    fecharModalCarrinho();
    window.location.href = '/login';
}

// Fechar modal clicando fora dele
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-carrinho');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalCarrinho();
            }
        });
    }
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-carrinho');
            if (modal && !modal.classList.contains('hidden')) {
                fecharModalCarrinho();
            }
        }
    });
});


// Função global para adicionar ao carrinho (compatibilidade)
function adicionarAoCarrinhoGlobal(produto, sabor = 'único', quantidade = 1) {
    console.log('🛒 Adicionando produto via função global:', produto);
    
    // Criar objeto do produto no formato esperado
    const produtoCarrinho = {
        produto_id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        sabor: sabor,
        quantidade: quantidade,
        imagem: produto.imagem
    };
    
    // Usar o CarrinhoManager
    if (window.carrinhoManager) {
        window.carrinhoManager.adicionarProduto(produtoCarrinho);
    } else {
        console.error('❌ CarrinhoManager não disponível');
        alert('Erro: Sistema de carrinho não disponível');
    }
}


console.log('✅ Script de carrinho carregado com sucesso!');
