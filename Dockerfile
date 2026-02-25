FROM node:18-slim

# Instalar herramientas de compilación
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

# Instalar dependencias (compila better-sqlite3 para Linux)
RUN npm install

# Copiar código
COPY . .

# Ejecutar seed si es necesario
RUN node src/scripts/seed.js || echo 'Seed already run'

# Usuario no root
USER node

EXPOSE 5000

CMD ["node", "src/app.js"]