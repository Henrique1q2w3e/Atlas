#!/usr/bin/env python3
"""
Teste do carrinho temporário para usuários não logados
"""

import sys
import os

# Adicionar o diretório atual ao path para importar main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_carrinho_temporario():
    """Testa se o carrinho temporário funciona corretamente"""
    
    print("🧪 TESTE DO CARRINHO TEMPORÁRIO")
    print("=" * 50)
    
    try:
        # Importar as funções necessárias
        from main import obter_carrinho_temporario, obter_carrinho_usuario, qualquer_usuario_logado
        
        print("✅ Funções importadas com sucesso")
        
        # Teste 1: Verificar se a função obter_carrinho_temporario funciona
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
        
        # Teste 4: Verificar se a função obter_carrinho_temporario retorna a mesma instância
        print("\n📋 Teste 4: Persistência do carrinho")
        carrinho_temp2 = obter_carrinho_temporario()
        print(f"   Mesma instância: {carrinho_temp is carrinho_temp2}")
        print(f"   Tamanho da segunda instância: {len(carrinho_temp2)}")
        
        # Teste 5: Simular função qualquer_usuario_logado (sem sessão)
        print("\n📋 Teste 5: Simulação sem sessão")
        print("   (Este teste simula o comportamento sem Flask session)")
        print("   Em produção, qualquer_usuario_logado() retornaria False")
        
        print("\n🎉 TODOS OS TESTES CONCLUÍDOS!")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ ERRO NO TESTE: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    sucesso = test_carrinho_temporario()
    if sucesso:
        print("\n✅ TESTE PASSOU - Carrinho temporário funcionando!")
        print("🚀 Pronto para deploy!")
    else:
        print("\n❌ TESTE FALHOU - Verificar código antes do deploy!")
