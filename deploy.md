# 🚀 Guia de Deploy - Atlas Suplementos

## Deploy em Produção

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3 python3-pip python3-venv nginx git -y

# Instalar Node.js para PM2 (opcional)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Configuração da Aplicação

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd atlas-suplementos

# Executar script de inicialização
./start.sh

# Configurar variáveis de ambiente
cp env.example .env
nano .env
```

### 3. Configuração do Nginx

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/atlas
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /caminho/para/atlas-suplementos/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Configuração do SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 5. Process Manager (PM2)

```bash
# Instalar PM2
sudo npm install -g pm2

# Criar arquivo de configuração
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'atlas-suplementos',
    script: 'gunicorn',
    args: '-c gunicorn.conf.py wsgi:app',
    cwd: '/caminho/para/atlas-suplementos',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configuração do Mercado Pago

1. **Acesse o painel do Mercado Pago**
2. **Configure o webhook:**
   - URL: `https://seudominio.com/api/webhook-mercadopago`
   - Eventos: `payment`
3. **Configure as URLs de retorno:**
   - Sucesso: `https://seudominio.com/pagamento/sucesso`
   - Falha: `https://seudominio.com/pagamento/falha`
   - Pendente: `https://seudominio.com/pagamento/pendente`

### 7. Monitoramento

```bash
# Verificar status da aplicação
pm2 status
pm2 logs atlas-suplementos

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8. Backup Automático

```bash
# Criar script de backup
nano backup.sh
```

**backup.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/atlas"
APP_DIR="/caminho/para/atlas-suplementos"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
cp $APP_DIR/instance/atlas.db $BACKUP_DIR/atlas_$DATE.db

# Backup das planilhas
cp $APP_DIR/atlas.xlsx $BACKUP_DIR/atlas_$DATE.xlsx
cp $APP_DIR/pedidos_atlas.xlsx $BACKUP_DIR/pedidos_$DATE.xlsx

# Limpar backups antigos (manter últimos 30 dias)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.xlsx" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
chmod +x backup.sh

# Adicionar ao crontab (backup diário às 2h)
crontab -e
# Adicionar: 0 2 * * * /caminho/para/backup.sh
```

### 9. Atualizações

```bash
# Parar aplicação
pm2 stop atlas-suplementos

# Fazer backup
./backup.sh

# Atualizar código
git pull origin main

# Reinstalar dependências (se necessário)
source venv/bin/activate
pip install -r requirements.txt

# Reiniciar aplicação
pm2 restart atlas-suplementos
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro 502 Bad Gateway**
   ```bash
   # Verificar se a aplicação está rodando
   pm2 status
   pm2 logs atlas-suplementos
   ```

2. **Erro de permissões**
   ```bash
   # Corrigir permissões
   sudo chown -R www-data:www-data /caminho/para/atlas-suplementos
   ```

3. **Erro de banco de dados**
   ```bash
   # Verificar se o banco existe
   ls -la instance/
   ```

4. **Erro de planilhas**
   ```bash
   # Verificar se as planilhas existem
   ls -la *.xlsx
   ```

### Logs Importantes

- **Aplicação:** `pm2 logs atlas-suplementos`
- **Nginx:** `/var/log/nginx/error.log`
- **Sistema:** `journalctl -u nginx`

## 📊 Monitoramento

### Métricas Importantes

1. **CPU e Memória:** `htop`
2. **Espaço em disco:** `df -h`
3. **Conexões ativas:** `netstat -tulpn`
4. **Logs de erro:** `pm2 logs --err`

### Alertas Recomendados

1. **Espaço em disco < 20%**
2. **CPU > 80% por mais de 5 minutos**
3. **Memória > 90%**
4. **Aplicação offline**

## 🔒 Segurança

### Configurações Importantes

1. **Firewall:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Atualizações de segurança:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Backup de segurança:**
   - Backup diário dos dados
   - Backup semanal completo
   - Teste de restauração mensal
