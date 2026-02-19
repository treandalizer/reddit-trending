# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for layer caching
COPY package*.json ./

# Install all deps (dev included for building)
RUN npm install

# Copy all source code
COPY . .

# Build both frontend and backend in one command
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install only production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy the full build output
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]