#!/usr/bin/env python3
import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mudar para o diretório correto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
import mercadopago
from datetime import datetime
import uuid
# import pandas as pd  # Removido para compatibilidade com Render
import json
import sqlite3
import hashlib
import secrets
import time
import hmac
import base64
from datetime import datetime, timedelta
import openpyxl
from openpyxl import Workbook, load_workbook

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'sua_chave_secreta_aqui'

# Funções de autenticação
def hash_senha(senha):
    """Hash da senha usando SHA-256"""
    return hashlib.sha256(senha.encode()).hexdigest()

def verificar_senha(senha, hash_senha_armazenado):
    """Verificar se a senha está correta"""
    return hash_senha(senha) == hash_senha_armazenado

def conectar_db():
    """Conectar ao banco de dados"""
    # Verificar se tem DATABASE_URL (PostgreSQL no Render)
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # PostgreSQL no Render
        import psycopg2
        print("🐘 Conectando ao PostgreSQL...")
        return psycopg2.connect(database_url)
    else:
        # SQLite local para desenvolvimento
        print("💾 Conectando ao SQLite local...")
        db_path = os.path.join(os.getcwd(), 'atlas.db')
        return sqlite3.connect(db_path)

def criar_tabelas():
    """Criar tabelas do banco de dados se não existirem"""
    try:
        print("🔧 Criando/conectando ao banco de dados...")
        conn = conectar_db()
        cursor = conn.cursor()
        
        # Verificar se é PostgreSQL ou SQLite
        database_url = os.environ.get('DATABASE_URL')
        
        if database_url:
            # PostgreSQL
            print("🐘 Criando tabelas no PostgreSQL...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usuario (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    senha_hash TEXT NOT NULL,
                    data_criacao TIMESTAMP NOT NULL,
                    admin INTEGER DEFAULT 0
                )
            ''')
        else:
            # SQLite
            print("💾 Criando tabelas no SQLite...")
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usuario (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha_hash TEXT NOT NULL,
                    data_criacao TEXT NOT NULL,
                    admin INTEGER DEFAULT 0
                )
            ''')
        
        conn.commit()
        conn.close()
        print("✅ Tabelas do banco de dados criadas/verificadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        import traceback
        traceback.print_exc()

def usuario_logado():
    """Verificar se usuário está logado"""
    return 'user_id' in session

def obter_usuario_logado():
    """Obtém os dados do usuário logado"""
    if not usuario_logado():
        return None
    
    conn = conectar_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, nome, email, data_criacao, admin FROM usuario WHERE id = ?', (session['user_id'],))
    usuario = cursor.fetchone()
    conn.close()
    
    if usuario:
        return {
            'id': usuario[0],
            'nome': usuario[1],
            'email': usuario[2],
            'data_criacao': usuario[3],
            'admin': usuario[4]
        }
    return None

def obter_imagem_produto(marca, categoria):
    """Mapeia marca e categoria para imagem específica"""
    marca_lower = marca.lower().strip()
    categoria_lower = categoria.lower().strip()
    
    # Mapeamento de imagens por marca e categoria
    imagens_map = {
        # MAX - Whey
        ('max', 'whey'): '/static/images/whey-isolado-max-card.png',
        ('max', 'whey isolado'): '/static/images/whey-isolado-max-card.png',
        ('max', 'whey concentrado'): '/static/images/whey-concentrado-max-card.png',
        ('max', 'whey 3w'): '/static/images/whey-3w-max-card.png',
        
        # MAX - Pré-treino
        ('max', 'pré-treino'): '/static/images/horus-max-card.png',
        ('max', 'horus'): '/static/images/horus-max-card.png',
        ('max', 'pré'): '/static/images/horus-max-card.png',
        
        # MAX - Hipercalórico
        ('max', 'hipercalórico'): '/static/images/hipercalorico-max-card.png',
        ('max', 'hiper'): '/static/images/hipercalorico-max-card.png',
        
        # MAX - Multivitamínico
        ('max', 'multivitamínico'): '/static/images/multivitaminico-max-card.png',
        ('max', 'vitamina'): '/static/images/multivitaminico-max-card.png',
        
        # DUX - Whey
        ('dux', 'whey'): '/static/images/whey-concentrado-dux-card.png',
        ('dux', 'whey isolado'): '/static/images/whey-isolado-dux-card.png',
        ('dux', 'whey concentrado'): '/static/images/whey-concentrado-dux-card.png',
        
        # DUX - Creatina
        ('dux', 'creatina'): '/static/images/creatina-dux-card.png',
        
        # DUX - Multivitamínico
        ('dux', 'multivitamínico'): '/static/images/multivitaminco-dux-card.png',
        ('dux', 'vitamina'): '/static/images/multivitaminco-dux-card.png',
        
        # DUX - Ômega 3
        ('dux', 'ômega'): '/static/images/omega3-dux-card.png',
        ('dux', 'omega'): '/static/images/omega3-dux-card.png',
        
        # DUX - Cafeína
        ('dux', 'cafeína'): '/static/images/cafeina-dux-card.png',
        ('dux', 'cafeina'): '/static/images/cafeina-dux-card.png',
        
        # FTW - Whey
        ('ftw', 'whey'): '/static/images/whey-concentrado-ftw-card.png',
        ('ftw', 'whey 3w'): '/static/images/whey-3w-ftw-card.png',
        
        # FTW - Creatina
        ('ftw', 'creatina'): '/static/images/creatina-ftw-card.png',
        
        # FTW - Pré-treino
        ('ftw', 'pré-treino'): '/static/images/pre-treino-ftw-card.png',
        ('ftw', 'pré'): '/static/images/pre-treino-ftw-card.png',
        
        # SHARK - Whey
        ('shark', 'whey'): '/static/images/whey-concentrado-shark-card.png',
        ('shark', 'whey isolado'): '/static/images/whey-isolado-shark-card.png',
        
        # SHARK - Creatina
        ('shark', 'creatina'): '/static/images/creatina-shark-card.png',
        
        # SHARK - Pré-treino
        ('shark', 'pré-treino'): '/static/images/pre-treino-shark-card.png',
        ('shark', 'pré'): '/static/images/pre-treino-shark-card.png',
        
        # INTEGRAL - Whey
        ('integral', 'whey'): '/static/images/whey-concentrado-integral-card.png',
        ('integral', 'whey isolado'): '/static/images/whey-isolado-integral-card.png',
        
        # INTEGRAL - Creatina
        ('integral', 'creatina'): '/static/images/creatina-integral-card.png',
        
        # NUTRA - Whey
        ('nutra', 'whey'): '/static/images/whey-concentrado-nutra-card.png',
        ('nutra', 'whey isolado'): '/static/images/whey-isolado-nutra-card.png',
        
        # NUTRA - Barrinha
        ('nutra', 'barrinha'): '/static/images/barrinha-nutra-card.png',
        
        # ATLHETICA - Whey
        ('atlhetica', 'whey'): '/static/images/whey-concentrado-atlhetica-card.png',
        ('atlhetica', 'whey isolado'): '/static/images/whey-best-atlhetica-card.png',
        
        # ATLHETICA - Barrinha
        ('atlhetica', 'barrinha'): '/static/images/barrinha-atlhetica-card.png',
        
        # ATLHETICA - Multivitamínico
        ('atlhetica', 'multivitamínico'): '/static/images/multivitaminico-atlhetica-card.png',
        ('atlhetica', 'vitamina'): '/static/images/multivitaminico-atlhetica-card.png',
        
        # ADAPTOGEN - Whey
        ('adaptogen', 'whey'): '/static/images/whey-gold-adaptogen-card.png',
        ('adaptogen', 'whey tasty'): '/static/images/whey-tasty-adaptogen-card.png',
        
        # UNDER LABZ - Whey
        ('under labz', 'whey'): '/static/images/whey-concentrado-under-labz-card.png',
        ('under labz', 'whey isolado'): '/static/images/whey-isolado-under-labz-card.png',
        
        # UNDER LABZ - Pré-treino
        ('under labz', 'pré-treino'): '/static/images/pre-treino-under-labz-card.png',
        ('under labz', 'pré'): '/static/images/pre-treino-under-labz-card.png',
    }
    
    # Tentar encontrar imagem específica
    for (marca_key, categoria_key), imagem in imagens_map.items():
        if marca_key in marca_lower and categoria_key in categoria_lower:
            return imagem
    
    # Imagens por categoria padrão
    categoria_imagens = {
        'whey': '/static/images/whey-max.png',
        'creatina': '/static/images/creatina.png',
        'pré-treino': '/static/images/pre-max.png',
        'pré': '/static/images/pre-max.png',
        'hipercalórico': '/static/images/hipercaloricos.png',
        'hiper': '/static/images/hipercaloricos.png',
        'multivitamínico': '/static/images/omega-3.png',
        'vitamina': '/static/images/omega-3.png',
        'barrinha': '/static/images/barrinhas.png',
        'ômega': '/static/images/omega-3.png',
        'omega': '/static/images/omega-3.png',
        'cafeína': '/static/images/capsula-de-cafeina.png',
        'cafeina': '/static/images/capsula-de-cafeina.png',
    }
    
    # Tentar encontrar por categoria
    for cat_key, imagem in categoria_imagens.items():
        if cat_key in categoria_lower:
            return imagem
    
    # Imagem padrão
    return '/static/images/produto-placeholder.svg'

def carregar_produtos():
    """Carrega produtos da planilha Excel usando openpyxl"""
    try:
        from openpyxl import load_workbook
        
        wb = load_workbook('atlas.xlsx')
        ws = wb.active
        
        produtos = []
        for index, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=1):
            if not row[0] or not row[1]:  # MARCA e CATEGORIA
                continue
                
            marca = str(row[0]).strip()
            categoria = str(row[1]).strip()
            sabores_texto = str(row[2]).strip() if row[2] else 'N/A'
            
            sabores_lista = []
            if sabores_texto != 'N/A' and sabores_texto != 'NÃO TEM SABORES':
                sabores_lista = [s.strip() for s in sabores_texto.split(',') if s.strip()]
            
            # Determinar categoria para filtros
            categoria_filtro = 'whey'  # Padrão
            categoria_lower = categoria.lower()
            
            if 'creatina' in categoria_lower:
                categoria_filtro = 'creatina'
            elif 'pré' in categoria_lower or 'treino' in categoria_lower or 'horus' in categoria_lower or 'égide' in categoria_lower or 'fire' in categoria_lower:
                categoria_filtro = 'pre_treino'
            elif 'hiper' in categoria_lower:
                categoria_filtro = 'hipercalorico'
            elif 'vitamina' in categoria_lower or 'multivitamínico' in categoria_lower or 'multivitaminco' in categoria_lower:
                categoria_filtro = 'vitaminas'
            elif 'barrinha' in categoria_lower or 'barrinhas' in categoria_lower:
                categoria_filtro = 'barrinhas'
            elif 'omega' in categoria_lower or 'cafeína' in categoria_lower or 'cafeina' in categoria_lower:
                categoria_filtro = 'vitaminas'  # Agrupar suplementos em vitaminas
            
            produto = {
                'id': f"produto_{index}",
                'nome': f"{marca} - {categoria}",
                'marca': marca,
                'categoria': categoria_filtro,
                'sabores': sabores_lista,
                'preco': 99.90,  # Preço padrão
                'imagem': obter_imagem_produto(marca, categoria),
                'imagem_principal': obter_imagem_produto(marca, categoria),
                'descricao': f"Suplemento {categoria} da marca {marca}",
                'estoque': 10
            }
            produtos.append(produto)
        
        return produtos
    except Exception as e:
        print(f"Erro ao carregar produtos: {e}")
        return []

# Rotas principais
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/produtos')
def produtos():
    return render_template('produtos.html')

@app.route('/outlet')
def outlet():
    return render_template('outlet.html')

@app.route('/checkout')
def checkout():
    if not usuario_logado():
        return redirect(url_for('login'))
    return render_template('checkout.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/registro')
def registro():
    return render_template('registro.html')

@app.route('/contato')
def contato():
    return render_template('contato.html')

@app.route('/recuperar-senha')
def recuperar_senha():
    return render_template('recuperar_senha.html')

@app.route('/nova-senha')
def nova_senha():
    return render_template('nova_senha.html')

@app.route('/produto/<produto_id>')
def produto_individual(produto_id):
    return render_template('produto_individual.html', produto_id=produto_id)

@app.route('/perfil')
def perfil():
    if not usuario_logado():
        return redirect(url_for('login'))
    usuario = obter_usuario_logado()
    return render_template('perfil.html', usuario=usuario)

@app.route('/pedidos')
def pedidos():
    if not usuario_logado():
        return redirect(url_for('login'))
    return render_template('pedidos.html')

# Sistema de carrinho em memória (simplificado)
carrinho_global = []

def obter_carrinho_usuario():
    """Obtém o carrinho do usuário atual"""
    return carrinho_global

def salvar_pedido_na_planilha(dados_cliente, carrinho, order_id, status="Pendente"):
    """Salva o pedido na planilha pedidos_atlas.xlsx"""
    try:
        planilha_path = 'pedidos_atlas.xlsx'
        
        if os.path.exists(planilha_path):
            wb = load_workbook(planilha_path)
            ws = wb.active
        else:
            wb = Workbook()
            ws = wb.active
            ws.title = "Pedidos Atlas"
            headers = [
                "ID Pedido", "Data", "Nome", "Email", "Telefone", "CPF", 
                "Data Nascimento", "CEP", "Cidade", "Estado", "Bairro", 
                "Endereço", "Observações", "Status", "Total", "Produtos"
            ]
            for col, header in enumerate(headers, 1):
                ws.cell(row=1, column=col, value=header)
        
        total = sum(item.get('preco', 0) * item.get('quantidade', 1) for item in carrinho)
        produtos_texto = []
        for item in carrinho:
            produto_info = f"{item.get('nome', 'Produto')}"
            if item.get('sabor'):
                produto_info += f" - Sabor: {item.get('sabor')}"
            produto_info += f" (Qtd: {item.get('quantidade', 1)})"
            produtos_texto.append(produto_info)
        
        produtos_str = " | ".join(produtos_texto)
        next_row = ws.max_row + 1
        
        pedido_data = [
            order_id,
            datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            dados_cliente.get('nome', ''),
            dados_cliente.get('email', ''),
            dados_cliente.get('telefone', ''),
            dados_cliente.get('cpf', ''),
            dados_cliente.get('data_nascimento', ''),
            dados_cliente.get('cep', ''),
            dados_cliente.get('cidade', ''),
            dados_cliente.get('estado', ''),
            dados_cliente.get('bairro', ''),
            dados_cliente.get('endereco', ''),
            dados_cliente.get('observacoes', ''),
            status,
            f"R$ {total:.2f}",
            produtos_str
        ]
        
        for col, value in enumerate(pedido_data, 1):
            ws.cell(row=next_row, column=col, value=value)
        
        wb.save(planilha_path)
        print(f"✅ Pedido {order_id} salvo na planilha")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao salvar pedido na planilha: {e}")
        return False

def gerar_link_pagamento_simples(dados_cliente, order_id):
    """Gera link de pagamento usando produtos do carrinho"""
    sdk = mercadopago.SDK("APP_USR-1767627899974277-090620-d9a19a4ac8a0b81161b717c772359483-2669713221")
    
    base_url = os.getenv("BASE_URL", "http://localhost:5000")
    carrinho = obter_carrinho_usuario()
    
    if not carrinho or len(carrinho) == 0:
        return {"success": False, "error": "Carrinho vazio"}
    
    items = []
    for item in carrinho:
        items.append({
            "id": item.get('produto_id', f"item_{len(items)}"),
            "title": item.get('nome', 'Produto'),
            "quantity": item.get('quantidade', 1),
            "currency_id": "BRL",
            "unit_price": float(item.get('preco', 0))
        })
    
    payment_data = {
        "items": items,
        "back_urls": {
            "success": f"{base_url}/pagamento/sucesso",
            "failure": f"{base_url}/pagamento/falha",
            "pending": f"{base_url}/pagamento/pendente"
        }
    }
    
    result = sdk.preference().create(payment_data)
    
    if "response" in result:
        payment = result["response"]
        if "init_point" in payment:
            return {
                "success": True,
                "init_point": payment["init_point"],
                "preference_id": payment.get("id")
            }
        else:
            return {"success": False, "error": "Link de pagamento não gerado"}
    else:
        return {"success": False, "error": "Erro na API do Mercado Pago"}

# API básica
@app.route('/api/carrinho', methods=['GET'])
def get_carrinho():
    return jsonify(carrinho_global)

@app.route('/api/carrinho/adicionar', methods=['POST'])
def adicionar_ao_carrinho():
    try:
        data = request.get_json()
        produto_id = data.get('produto_id')
        nome = data.get('nome')
        marca = data.get('marca')
        preco = float(data.get('preco', 0))
        sabor = data.get('sabor')
        quantidade = int(data.get('quantidade', 1))
        imagem = data.get('imagem', '/static/images/produto-placeholder.svg')
        
        item_existente = None
        for item in carrinho_global:
            if item['produto_id'] == produto_id and item['sabor'] == sabor:
                item_existente = item
                break
        
        if item_existente:
            item_existente['quantidade'] += quantidade
        else:
            novo_item = {
                'produto_id': produto_id,
                'nome': nome,
                'marca': marca,
                'preco': preco,
                'sabor': sabor,
                'quantidade': quantidade,
                'imagem': imagem
            }
            carrinho_global.append(novo_item)
        
        return jsonify({
            "success": True,
            "carrinho": carrinho_global,
            "message": "Produto adicionado ao carrinho"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/carrinho/remover', methods=['POST'])
def remover_do_carrinho():
    try:
        data = request.get_json()
        produto_id = data.get('produto_id')
        sabor = data.get('sabor')
        
        carrinho_global[:] = [item for item in carrinho_global 
                             if not (item['produto_id'] == produto_id and item['sabor'] == sabor)]
        
        return jsonify({
            "success": True,
            "carrinho": carrinho_global,
            "message": "Produto removido do carrinho"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/carrinho/limpar', methods=['POST'])
def limpar_carrinho():
    try:
        carrinho_global.clear()
        return jsonify({
            "success": True,
            "carrinho": carrinho_global,
            "message": "Carrinho limpo"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    try:
        produtos = carregar_produtos()
        return jsonify({
            "success": True,
            "produtos": produtos,
            "total": len(produtos)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "produtos": []
        }), 500

@app.route("/api/criar-pagamento-simples", methods=["POST"])
def criar_pagamento_simples():
    try:
        data = request.get_json()
        dados_cliente = data.get("dados_cliente", {})
        
        if not dados_cliente.get('nome') or not dados_cliente.get('email'):
            return jsonify({"error": "Nome e email são obrigatórios"}), 400

        order_id = f"pedido_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        carrinho = obter_carrinho_usuario()
        
        if salvar_pedido_na_planilha(dados_cliente, carrinho, order_id, "Pendente"):
            print(f"✅ Pedido {order_id} registrado na planilha")
        else:
            print(f"⚠️ Erro ao salvar pedido {order_id} na planilha")
        
        result = gerar_link_pagamento_simples(dados_cliente, order_id)
        
        if result["success"]:
            return jsonify({
                "success": True,
                "init_point": result["init_point"],
                "order_id": order_id,
                "preference_id": result.get("preference_id")
            })
        else:
            return jsonify({"error": result.get("error", "Erro ao criar pagamento")}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/pagamento/sucesso")
def pagamento_sucesso():
    return render_template("pagamento_sucesso.html")

@app.route("/pagamento/falha")
def pagamento_falha():
    return render_template("pagamento_falha.html")

@app.route("/pagamento/pendente")
def pagamento_pendente():
    return render_template("pagamento_pendente.html")

@app.route('/api/verificar-login', methods=['GET'])
def verificar_login():
    if usuario_logado():
        usuario = obter_usuario_logado()
        return jsonify({
            "logado": True,
            "usuario": usuario,
            "usuario_nome": usuario['nome'] if usuario else 'Usuário',
            "usuario_email": usuario['email'] if usuario else 'Email'
        })
    return jsonify({
        "logado": False,
        "usuario": None,
        "usuario_nome": None,
        "usuario_email": None
    })

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        print("🔐 Tentativa de login...")
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')
        
        print(f"📧 Email: {email}")
        
        if not email or not senha:
            return jsonify({"success": False, "error": "Email e senha são obrigatórios"}), 400
        
        print("🔧 Conectando ao banco...")
        conn = conectar_db()
        cursor = conn.cursor()
        
        print("🔍 Buscando usuário...")
        cursor.execute('SELECT id, nome, email, senha_hash FROM usuario WHERE email = ?', (email,))
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario:
            print(f"✅ Usuário encontrado: {usuario[1]}")
            if verificar_senha(senha, usuario[3]):
                session['user_id'] = usuario[0]
                print("🎉 Login realizado com sucesso!")
                return jsonify({
                    "success": True,
                    "message": "Login realizado com sucesso",
                    "usuario": {
                        "id": usuario[0],
                        "nome": usuario[1],
                        "email": usuario[2]
                    }
                })
            else:
                print("❌ Senha incorreta")
                return jsonify({"success": False, "error": "Email ou senha incorretos"}), 401
        else:
            print("❌ Usuário não encontrado")
            return jsonify({"success": False, "error": "Email ou senha incorretos"}), 401
            
    except Exception as e:
        print(f"💥 Erro no login: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Erro interno: {str(e)}"}), 500

@app.route('/api/registro', methods=['POST'])
def api_registro():
    try:
        data = request.get_json()
        nome = data.get('nome')
        email = data.get('email')
        senha = data.get('senha')
        
        if not nome or not email or not senha:
            return jsonify({"success": False, "error": "Todos os campos são obrigatórios"}), 400
        
        conn = conectar_db()
        cursor = conn.cursor()
        
        # Verificar se email já existe
        cursor.execute('SELECT id FROM usuario WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "Email já cadastrado"}), 400
        
        # Criar usuário
        senha_hash = hash_senha(senha)
        cursor.execute('''
            INSERT INTO usuario (nome, email, senha_hash, data_criacao, admin)
            VALUES (?, ?, ?, ?, ?)
        ''', (nome, email, senha_hash, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 0))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        # Fazer login automático
        session['user_id'] = user_id
        
        return jsonify({
            "success": True,
            "message": "Usuário criado com sucesso",
            "usuario": {
                "id": user_id,
                "nome": nome,
                "email": email
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logout realizado com sucesso"})

@app.route('/api/recuperar-senha', methods=['POST'])
def api_recuperar_senha():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"success": False, "error": "Email é obrigatório"}), 400
        
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM usuario WHERE email = ?', (email,))
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario:
            # Em produção, você enviaria um email aqui
            return jsonify({
                "success": True,
                "message": "Se o email existir, você receberá instruções para redefinir sua senha"
            })
        else:
            # Por segurança, não revelamos se o email existe
            return jsonify({
                "success": True,
                "message": "Se o email existir, você receberá instruções para redefinir sua senha"
            })
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("✅ Sistema Atlas Suplementos iniciado!")
    print(f"📁 Diretório atual: {os.getcwd()}")
    print(f"📁 Templates: {os.path.exists('templates')}")
    print(f"📁 Static: {os.path.exists('static')}")
    print(f"📁 index.html: {os.path.exists('templates/index.html')}")
    
    # Criar tabelas do banco de dados
    criar_tabelas()
    
    # Configuração para produção
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(debug=debug, host='0.0.0.0', port=port)
