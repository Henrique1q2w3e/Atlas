import sqlite3
import pandas as pd
from datetime import datetime
import os
import io
from flask import send_file

def criar_backup_usuarios_memoria():
    """Cria backup de usuários em memória (sem arquivo físico)"""
    try:
        # Conectar ao banco
        conn = sqlite3.connect('instance/atlas.db')
        
        # Buscar todos os usuários
        query = """
        SELECT 
            id,
            nome,
            email,
            data_criacao,
            admin,
            CASE 
                WHEN admin = 1 THEN 'Administrador'
                ELSE 'Usuário'
            END as tipo_usuario
        FROM usuario 
        ORDER BY data_criacao DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        # Adicionar informações extras
        df['data_exportacao'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        df['total_usuarios'] = len(df)
        
        # Renomear colunas para português
        df.columns = [
            'ID_Usuario',
            'Nome_Completo', 
            'Email',
            'Data_Cadastro',
            'Admin_Flag',
            'Tipo_Usuario',
            'Data_Exportacao',
            'Total_Usuarios'
        ]
        
        # Criar Excel em memória
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Aba principal com usuários
            df.to_excel(writer, sheet_name='Usuarios', index=False)
            
            # Aba de estatísticas
            stats_data = {
                'Metrica': [
                    'Total de Usuarios',
                    'Administradores', 
                    'Usuarios Comuns',
                    'Data da Exportacao',
                    'Banco de Dados'
                ],
                'Valor': [
                    len(df),
                    len(df[df['Admin_Flag'] == 1]),
                    len(df[df['Admin_Flag'] == 0]),
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'instance/atlas.db'
                ]
            }
            
            stats_df = pd.DataFrame(stats_data)
            stats_df.to_excel(writer, sheet_name='Estatisticas', index=False)
            
            # Aba de usuários por data
            df_por_data = df.groupby(df['Data_Cadastro'].str[:10]).size().reset_index(name='Quantidade')
            df_por_data.columns = ['Data', 'Usuarios_Cadastrados']
            df_por_data.to_excel(writer, sheet_name='Cadastros_por_Data', index=False)
        
        output.seek(0)
        conn.close()
        
        return output
        
    except Exception as e:
        print(f"❌ Erro ao criar backup: {e}")
        return None

def criar_backup_atividades_memoria():
    """Cria backup de atividades em memória (sem arquivo físico)"""
    try:
        # Conectar ao banco
        conn = sqlite3.connect('instance/atlas.db')
        
        # Buscar atividades
        query = """
        SELECT 
            a.usuario_id,
            a.nome,
            a.email,
            a.tipo_acao,
            a.data_atividade,
            u.admin
        FROM atividades a
        LEFT JOIN usuario u ON a.usuario_id = u.id
        ORDER BY a.data_atividade DESC
        """
        
        df = pd.read_sql_query(query, conn)
        
        # Adicionar informações extras
        df['data_exportacao'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        df['total_atividades'] = len(df)
        
        # Renomear colunas para português
        df.columns = [
            'ID_Usuario',
            'Nome_Usuario', 
            'Email',
            'Tipo_Atividade',
            'Data_Atividade',
            'Admin_Flag',
            'Data_Exportacao',
            'Total_Atividades'
        ]
        
        # Criar Excel em memória
        output = io.BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Aba principal com atividades
            df.to_excel(writer, sheet_name='Atividades', index=False)
            
            # Aba de estatísticas
            stats_data = {
                'Metrica': [
                    'Total de Atividades',
                    'Logins Registrados', 
                    'Cadastros Registrados',
                    'Data da Exportacao',
                    'Banco de Dados'
                ],
                'Valor': [
                    len(df),
                    len(df[df['Tipo_Atividade'] == 'LOGIN']),
                    len(df[df['Tipo_Atividade'] == 'CADASTRO']),
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'instance/atlas.db'
                ]
            }
            
            stats_df = pd.DataFrame(stats_data)
            stats_df.to_excel(writer, sheet_name='Estatisticas', index=False)
            
            # Aba de atividades por data
            df_por_data = df.groupby(df['Data_Atividade'].str[:10]).size().reset_index(name='Quantidade')
            df_por_data.columns = ['Data', 'Atividades_Registradas']
            df_por_data.to_excel(writer, sheet_name='Atividades_por_Data', index=False)
        
        output.seek(0)
        conn.close()
        
        return output
        
    except Exception as e:
        print(f"❌ Erro ao criar backup de atividades: {e}")
        return None

def registrar_atividade_seguro(usuario_id, nome, email, tipo_acao):
    """Registra atividade de forma segura (sem dependências externas)"""
    try:
        conn = sqlite3.connect('instance/atlas.db')
        cursor = conn.cursor()
        
        # Criar tabela de atividades se não existir
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS atividades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id VARCHAR(36),
                nome VARCHAR(100),
                email VARCHAR(120),
                tipo_acao VARCHAR(50),
                data_atividade DATETIME
            )
        ''')
        
        # Inserir atividade
        cursor.execute('''
            INSERT INTO atividades (usuario_id, nome, email, tipo_acao, data_atividade)
            VALUES (?, ?, ?, ?, ?)
        ''', (usuario_id, nome, email, tipo_acao, datetime.now()))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Atividade registrada: {nome} - {tipo_acao}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao registrar atividade: {e}")
        return False
