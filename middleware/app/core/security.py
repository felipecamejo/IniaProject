"""
Módulo de seguridad con circuit breaker y validaciones.
Protege el servidor contra fallos en cascada y sobrecarga.
"""
import time
import logging

logger = logging.getLogger(__name__)


class CircuitBreaker:
    """Circuit breaker para proteger contra fallos en cascada."""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half_open
    
    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half_open"
                logger.info("Circuit breaker: Cambiando a estado half_open")
            else:
                raise RuntimeError("Circuit breaker está abierto. Servicio temporalmente no disponible.")
        
        try:
            result = func(*args, **kwargs)
            if self.state == "half_open":
                self.state = "closed"
                self.failure_count = 0
                logger.info("Circuit breaker: Recuperado, cambiando a estado closed")
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
                logger.error(f"Circuit breaker: Abierto después de {self.failure_count} fallos")
            
            raise


# Circuit breakers por tipo de operación
db_circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)
import_circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=120)

