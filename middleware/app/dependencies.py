"""
Dependencias compartidas para inyección de dependencias.
"""
from concurrent.futures import ThreadPoolExecutor
from app.config import THREAD_POOL_WORKERS

# ThreadPoolExecutor global para operaciones pesadas
GLOBAL_THREAD_POOL = ThreadPoolExecutor(
    max_workers=THREAD_POOL_WORKERS,
    thread_name_prefix="inia-worker"
)

