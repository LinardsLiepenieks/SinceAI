# Simple Dockerfile for Next.js (hackathon-friendly)
FROM node:20-alpine

WORKDIR /app

# Install deps
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Copy app files
COPY frontend/ .

# Build and run (use next start)
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]
