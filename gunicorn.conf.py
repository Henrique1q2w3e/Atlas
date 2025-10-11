# Configuração do Gunicorn para produção
import multiprocessing

# Número de workers (2x CPUs + 1)
workers = multiprocessing.cpu_count() * 2 + 1

# Configurações de binding
bind = "0.0.0.0:5000"

# Configurações de timeout
timeout = 120
keepalive = 2

# Configurações de logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Configurações de worker
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# Configurações de segurança
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Preload da aplicação
preload_app = True
