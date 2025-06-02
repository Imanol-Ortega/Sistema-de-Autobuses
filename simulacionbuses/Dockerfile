# Usar imagen base de Python
FROM python:3.10-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY simulatorFinal.py .
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Variables de entorno para Cassandra
ENV CASSANDRA_HOST=cassandra

# Comando de ejecución
CMD ["python", "simulatorFinal.py"]