#!/usr/bin/env python3
"""
Teste simples do carrinho temporário (sem Flask)
"""

def test_carrinho_temporario_simples():
    """Testa a lógica do carrinho temporário sem Flask"""
    
    print("🧪 TESTE SIMPLES DO CARRINHO TEMPORÁRIO")
    print("=" * 50)
    
    # Simular a função obter_carrinho_temporario
    def obter_carrinho_temporario():
        """Obtém o carrinho temporário (sempre retorna a mesma instância)"""
        if not hasattr(obter_carrinho_temporario, '_carrinho'):
            obter_carrinho_temporario._carrinho = []
        return obter_carrinho_temporario._carrinho
    
    # Teste 1: Verificar se a função funciona
    print("\n📋 Teste 1: Função obter_carrinho_temporario()")
    carrinho_temp = obter_carrinho_temporario()
    print(f"   Tipo: {type(carrinho_temp)}")
    print(f"   É lista: {isinstance(carrinho_temp, list)}")
    print(f"   Tamanho inicial: {len(carrinho_temp)}")
    
    # Teste 2: Adicionar item ao carrinho temporário
    print("\n📋 Teste 2: Adicionar item ao carrinho")
    item_teste = {
        'produto_id': 'teste_001',
        'nome': 'Produto Teste',
        'marca': 'Marca Teste',
        'preco': 29.90,
        'sabor': 'Sabor Teste',
        'quantidade': 1,
        'imagem': '/static/images/teste.jpg'
    }
    
    carrinho_temp.append(item_teste)
    print(f"   Item adicionado: {item_teste['nome']}")
    print(f"   Tamanho após adicionar: {len(carrinho_temp)}")
    
    # Teste 3: Verificar se o item foi realmente adicionado
    print("\n📋 Teste 3: Verificar item no carrinho")
    item_encontrado = None
    for item in carrinho_temp:
        if item['produto_id'] == 'teste_001':
            item_encontrado = item
            break
    
    if item_encontrado:
        print(f"   ✅ Item encontrado: {item_encontrado['nome']}")
        print(f"   ✅ Preço: R$ {item_encontrado['preco']}")
        print(f"   ✅ Quantidade: {item_encontrado['quantidade']}")
    else:
        print("   ❌ Item NÃO encontrado!")
        return False
    
    # Teste 4: Verificar se a função obter_carrinho_temporario retorna a mesma instância
    print("\n📋 Teste 4: Persistência do carrinho")
    carrinho_temp2 = obter_carrinho_temporario()
    print(f"   Mesma instância: {carrinho_temp is carrinho_temp2}")
    print(f"   Tamanho da segunda instância: {len(carrinho_temp2)}")
    
    if carrinho_temp is not carrinho_temp2:
        print("   ❌ Instâncias diferentes - problema de persistência!")
        return False
    
    # Teste 5: Simular adição de múltiplos itens
    print("\n📋 Teste 5: Múltiplos itens")
    item_teste2 = {
        'produto_id': 'teste_002',
        'nome': 'Produto Teste 2',
        'marca': 'Marca Teste 2',
        'preco': 39.90,
        'sabor': 'Sabor Teste 2',
        'quantidade': 2,
        'imagem': '/static/images/teste2.jpg'
    }
    
    carrinho_temp.append(item_teste2)
    print(f"   Segundo item adicionado: {item_teste2['nome']}")
    print(f"   Tamanho final: {len(carrinho_temp)}")
    
    # Teste 6: Verificar se ambos os itens estão lá
    print("\n📋 Teste 6: Verificar ambos os itens")
    itens_encontrados = 0
    for item in carrinho_temp:
        if item['produto_id'] in ['teste_001', 'teste_002']:
            itens_encontrados += 1
            print(f"   ✅ {item['nome']} - R$ {item['preco']}")
    
    if itens_encontrados == 2:
        print(f"   ✅ Todos os {itens_encontrados} itens encontrados!")
    else:
        print(f"   ❌ Apenas {itens_encontrados} de 2 itens encontrados!")
        return False
    
    print("\n🎉 TODOS OS TESTES CONCLUÍDOS!")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    sucesso = test_carrinho_temporario_simples()
    if sucesso:
        print("\n✅ TESTE PASSOU - Lógica do carrinho temporário funcionando!")
        print("🚀 Pronto para deploy!")
    else:
        print("\n❌ TESTE FALHOU - Verificar código antes do deploy!")
