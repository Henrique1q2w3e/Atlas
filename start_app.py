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
import pandas as pd
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
    return sqlite3.connect('instance/atlas.db')

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

def carregar_produtos():
    """Carrega produtos da planilha Excel"""
    try:
        df = pd.read_excel('atlas.xlsx')
        df.columns = df.columns.str.strip()
        
        produtos = []
        for index, row in df.iterrows():
            if pd.isna(row['MARCA']) or pd.isna(row['CATEGORIA']):
                continue
                
            sabores_texto = str(row['SABORES']).strip() if not pd.isna(row['SABORES']) else 'N/A'
            sabores_lista = []
            if sabores_texto != 'N/A' and sabores_texto != 'NÃO TEM SABORES':
                sabores_lista = [s.strip() for s in sabores_texto.split(',') if s.strip()]
            
            produto = {
                'id': f"produto_{index}",
                'nome': f"{row['MARCA']} - {row['CATEGORIA']}",
                'marca': str(row['MARCA']).strip(),
                'categoria': 'whey',  # Categoria padrão
                'sabores': sabores_lista,
                'preco': 99.90,  # Preço padrão
                'imagem': '/static/images/produto-placeholder.svg',
                'descricao': f"Suplemento {row['CATEGORIA']} da marca {row['MARCA']}",
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

# API básica
@app.route('/api/carrinho', methods=['GET'])
def get_carrinho():
    return jsonify([])

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

if __name__ == '__main__':
    print("✅ Sistema Atlas Suplementos iniciado!")
    print(f"📁 Diretório atual: {os.getcwd()}")
    print(f"📁 Templates: {os.path.exists('templates')}")
    print(f"📁 Static: {os.path.exists('static')}")
    print(f"📁 index.html: {os.path.exists('templates/index.html')}")
    app.run(debug=True, host='0.0.0.0', port=5000)
