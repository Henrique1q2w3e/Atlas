#!/bin/bash

# Script de inicialização para produção
# Atlas Suplementos - Sistema de E-commerce

echo "🚀 Iniciando Atlas Suplementos..."

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale o Python 3.8+ primeiro."
    exit 1
fi

# Verificar se o pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 não encontrado. Instale o pip primeiro."
    exit 1
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📚 Instalando dependências..."
pip install -r requirements.txt

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p instance
mkdir -p logs

# Verificar se o banco de dados existe
if [ ! -f "instance/atlas.db" ]; then
    echo "🗄️ Banco de dados não encontrado. Será criado automaticamente na primeira execução."
fi

# Verificar se a planilha de produtos existe
if [ ! -f "atlas.xlsx" ]; then
    echo "⚠️ Planilha atlas.xlsx não encontrada. Certifique-se de que ela está no diretório raiz."
fi

# Verificar configurações
if [ ! -f ".env" ]; then
    echo "⚠️ Arquivo .env não encontrado. Copie o env.example para .env e configure as variáveis."
    echo "   cp env.example .env"
fi

echo "✅ Preparação concluída!"
echo ""
echo "Para iniciar em modo desenvolvimento:"
echo "   python main.py"
echo ""
echo "Para iniciar em modo produção:"
echo "   gunicorn -c gunicorn.conf.py wsgi:app"
echo ""
echo "Para configurar o ambiente:"
echo "   1. Copie env.example para .env"
echo "   2. Configure as variáveis no .env"
echo "   3. Execute: python main.py"
