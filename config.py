import os

class Config:
    """Configurações base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sua_chave_secreta_super_segura_aqui'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///instance/atlas.db'
    
    # Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN = os.environ.get('MERCADOPAGO_ACCESS_TOKEN') or 'APP_USR-1767627899974277-090620-d9a19a4ac8a0b81161b717c772359483-2669713221'
    
    # URLs de retorno
    BASE_URL = os.environ.get('BASE_URL') or 'http://localhost:5000'
    
    # Configurações de segurança
    RATE_LIMIT_ENABLED = True
    MAX_LOGIN_ATTEMPTS = 10
    MAX_PASSWORD_RESET_ATTEMPTS = 3

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    TESTING = False
    
class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Configurações para testes"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'

# Configuração baseada no ambiente
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
