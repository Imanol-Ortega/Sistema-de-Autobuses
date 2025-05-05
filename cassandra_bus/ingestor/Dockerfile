# 1. Usa Alpine para una imagen ligera
FROM node:18-alpine

# 2. Crea y sitúa el directorio de trabajo
WORKDIR /app

# 3. Copia package.json e instala solo prod dependencies
COPY package.json ./
RUN npm install --production

# 4. Copia el código fuente
COPY . .

# 5. Expone el puerto (si tu servicio ofrece API; opcional)
# EXPOSE 3000

# 6. Ejecuta el ingestor
CMD ["node", "ingestor.js"]
