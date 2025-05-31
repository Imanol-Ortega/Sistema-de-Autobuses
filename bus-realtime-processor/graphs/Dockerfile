# usa Python 3.11
FROM python:3.11-slim

WORKDIR /app

# instala solo las deps que necesitas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copia tu simulador
COPY . .

# arranca tu script
CMD ["python", "app_prueba.py"]
