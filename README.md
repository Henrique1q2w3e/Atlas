# Atlas Suplementos - Sistema de E-commerce

Sistema completo de e-commerce para venda de suplementos com integração ao Mercado Pago.

## 🚀 Funcionalidades

- **Catálogo de Produtos**: Sistema completo de produtos com categorias e filtros
- **Carrinho de Compras**: Adicionar/remover produtos com sabores específicos
- **Checkout Integrado**: Integração completa com Mercado Pago
- **Sistema de Usuários**: Cadastro, login e recuperação de senha
- **Painel Administrativo**: Gerenciamento de usuários e relatórios
- **Sistema de Pedidos**: Controle completo via planilha Excel
- **Outlet**: Seção especial para produtos em promoção

## 📋 Pré-requisitos

- Python 3.8+
- pip3
- Git

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd atlas-suplementos
```

### 2. Execute o script de inicialização
```bash
./start.sh
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Inicie a aplicação

**Desenvolvimento:**
```bash
python main.py
```

**Produção:**
```bash
gunicorn -c gunicorn.conf.py wsgi:app
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Chave secreta (GERE UMA NOVA EM PRODUÇÃO!)
SECRET_KEY=sua_chave_secreta_super_segura_aqui

# URL base da aplicação
BASE_URL=https://seudominio.com

# Token do Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui

# Configurações de segurança
RATE_LIMIT_ENABLED=true
MAX_LOGIN_ATTEMPTS=10
```

### Mercado Pago

1. Configure o webhook no painel do Mercado Pago:
   - URL: `https://seudominio.com/api/webhook-mercadopago`
   - Eventos: `payment`

2. Configure as URLs de retorno:
   - Sucesso: `https://seudominio.com/pagamento/sucesso`
   - Falha: `https://seudominio.com/pagamento/falha`
   - Pendente: `https://seudominio.com/pagamento/pendente`

## 📁 Estrutura do Projeto

```
atlas-suplementos/
├── main.py                 # Aplicação principal
├── config.py              # Configurações
├── wsgi.py                # Entry point para produção
├── requirements.txt       # Dependências Python
├── start.sh              # Script de inicialização
├── gunicorn.conf.py      # Configuração do Gunicorn
├── static/               # Arquivos estáticos (CSS, JS, imagens)
├── templates/            # Templates HTML
├── instance/             # Banco de dados SQLite
├── atlas.xlsx           # Planilha de produtos
├── pedidos_atlas.xlsx   # Planilha de pedidos
└── backup_*.py          # Scripts de backup
```

## 🗄️ Banco de Dados

O sistema usa SQLite para desenvolvimento e pode ser facilmente migrado para PostgreSQL/MySQL em produção.

### Tabelas principais:
- `usuario`: Dados dos usuários
- `rate_limits`: Controle de rate limiting
- `auditoria`: Log de atividades
- `reset_tokens`: Tokens de recuperação de senha

## 📊 Planilhas

### atlas.xlsx
Planilha com todos os produtos do catálogo. Colunas:
- MARCA: Nome da marca
- CATEGORIA: Categoria do produto
- SABORES: Sabores disponíveis (separados por vírgula)

### pedidos_atlas.xlsx
Planilha com todos os pedidos. Colunas:
- ID Pedido, Data, Nome, Email, Telefone, CPF
- Data Nascimento, CEP, Cidade, Estado, Bairro
- Endereço, Observações, Status, Total, Produtos

## 🔧 Scripts Úteis

### Backup de Usuários
```bash
python export_users.py
```

### Backup de Atividades
```bash
python log_activity.py
```

### Criar Planilha Limpa
```bash
python criar_planilha_limpa.py
```

## 🚀 Deploy em Produção

### 1. Servidor VPS/Cloud
```bash
# Instalar dependências do sistema
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx

# Configurar Nginx (exemplo)
sudo nano /etc/nginx/sites-available/atlas
```

### 2. Configuração do Nginx
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start gunicorn --name atlas -- -c gunicorn.conf.py wsgi:app
pm2 save
pm2 startup
```

## 🔒 Segurança

- Rate limiting implementado
- Hash de senhas com SHA-256
- Tokens seguros para recuperação de senha
- Auditoria de atividades
- Validação de entrada de dados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da aplicação
2. Consulte a documentação do Mercado Pago
3. Verifique as configurações do .env

## 📝 Licença

Sistema proprietário - Atlas Suplementos