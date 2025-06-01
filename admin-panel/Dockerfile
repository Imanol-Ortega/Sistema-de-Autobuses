FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production --silent

# Copiar el resto del código fuente
COPY . .

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactjs -u 1001

# Cambiar ownership de los archivos al usuario no-root
RUN chown -R reactjs:nodejs /app
USER reactjs

# Exponer el puerto 3000 
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://localhost:3001/api

# En desarrollo usará npm start
# En producción puede usar npm run build + serve
CMD ["npm", "start"]