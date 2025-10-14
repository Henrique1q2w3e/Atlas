#!/usr/bin/env python3
"""
WSGI entry point para deploy em produção
"""
import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == "__main__":
    app.run()
#!/usr/bin/env python3
"""
WSGI entry point para deploy em produção
"""
import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == "__main__":
    app.run()
