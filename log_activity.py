import sqlite3
import pandas as pd
from datetime import datetime
import os

def registrar_atividade(usuario_id, nome, email, tipo_acao):
    """Registra atividade do usuário (login, cadastro, etc.)"""
    
    # Conectar ao banco
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
            data_atividade DATETIME,
            ip_address VARCHAR(45),
            user_agent TEXT
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

def exportar_atividades():
    """Exporta atividades para Excel"""
    
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
    
    # Criar nome do arquivo com timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'atividades_usuarios_{timestamp}.xlsx'
    
    # Salvar em Excel
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
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
    
    conn.close()
    
    print(f"✅ Log de atividades exportado: {filename}")
    print(f"📊 Total de atividades: {len(df)}")
    
    return filename

if __name__ == "__main__":
    exportar_atividades()
