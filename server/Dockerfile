FROM node:20-slim

# FFmpeg + dependencias do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package.json dedicado do server (apenas deps do servidor)
COPY server/package.json ./
RUN npm install --production

# Copiar o script do server
COPY scripts/local-ffmpeg-server.js ./scripts/

# Diretorios para sessoes (espelhando o path do server)
RUN mkdir -p /tmp/hyperedit-ffmpeg/sessions

ENV PORT=3333
ENV NODE_ENV=production

EXPOSE 3333

CMD ["node", "scripts/local-ffmpeg-server.js"]
