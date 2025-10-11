// Sistema de Carrinho Simplificado - Atlas Suplementos

console.log('🚀 Carregando carrinho simplificado...');

// Função global para adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId, sabor, quantidade = 1) {
    console.log('🌐 Função global adicionarAoCarrinho chamada:', produtoId, sabor, quantidade);
    
    // Buscar dados do produto
    fetch('/api/produtos')
        .then(response => response.json())
        .then(produtos => {
            const produto = produtos.find(p => p.id === produtoId);
            
            if (!produto) {
                console.error('❌ Produto não encontrado:', produtoId);
                alert('Produto não encontrado!');
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

            // Adicionar ao carrinho
            fetch('/api/carrinho/adicionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemCarrinho)
            })
            .then(response => response.json())
            .then(data => {
                console.log('📝 Resposta do servidor:', data);
                
                if (data.success) {
                    console.log('✅ Produto adicionado com sucesso!');
                    alert('Produto adicionado ao carrinho!');
                } else {
                    console.error('❌ Erro ao adicionar produto:', data.error);
                    alert('Erro ao adicionar produto!');
                }
            })
            .catch(error => {
                console.error('❌ Erro ao adicionar produto:', error);
                alert('Erro ao adicionar produto!');
            });
        })
        .catch(error => {
            console.error('❌ Erro ao buscar produto:', error);
            alert('Erro ao buscar produto!');
        });
}

console.log('✅ Script de carrinho simplificado carregado!');
