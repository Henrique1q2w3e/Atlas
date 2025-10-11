import sqlite3
import pandas as pd
from datetime import datetime
import os

def exportar_usuarios_para_excel():
    """Exporta todos os usuários do banco para uma planilha Excel"""
    
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
    
    # Criar nome do arquivo com timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'backup_usuarios_{timestamp}.xlsx'
    
    # Salvar em Excel
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
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
    
    conn.close()
    
    print(f"✅ Backup criado com sucesso: {filename}")
    print(f"📊 Total de usuários exportados: {len(df)}")
    print(f"👑 Administradores: {len(df[df['Admin_Flag'] == 1])}")
    print(f"👤 Usuários comuns: {len(df[df['Admin_Flag'] == 0])}")
    
    return filename

if __name__ == "__main__":
    exportar_usuarios_para_excel()
