#!/usr/bin/env python3
"""
Script para criar uma planilha limpa de pedidos
"""

from openpyxl import Workbook
from datetime import datetime

def criar_planilha_limpa():
    """Cria uma planilha limpa com cabeçalhos organizados"""
    
    # Criar workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Pedidos Atlas"
    
    # Cabeçalhos organizados
    headers = [
        "ID Pedido", "Data", "Nome", "Email", "Telefone", "CPF", 
        "Data Nascimento", "CEP", "Cidade", "Estado", "Bairro", 
        "Endereço", "Observações", "Status", "Total", "Produtos"
    ]
    
    # Adicionar cabeçalhos
    for col, header in enumerate(headers, 1):
        ws.cell(row=1, column=col, value=header)
    
    # Salvar planilha
    wb.save('pedidos_atlas.xlsx')
    print("✅ Planilha limpa criada: pedidos_atlas.xlsx")
    print("📋 Cabeçalhos organizados:")
    for i, header in enumerate(headers, 1):
        print(f"   {chr(64+i)} - {header}")

if __name__ == "__main__":
    criar_planilha_limpa()
