FROM node:18-slim

# Instalar dependencias del sistema necesarias para better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear directorio para datos persistentes
RUN mkdir -p /data && chown -R node:node /data

# Copiar package files
COPY package*.json ./

# Instalar dependencias (compilar better-sqlite3 para Linux)
RUN npm ci --only=production && npm cache clean --force

# Copiar código
COPY . .

# Usuario no root
USER node

EXPOSE 5000

CMD ["node", "src/app.js"]