FROM node:20-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package files first (for caching)
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Development command
CMD ["pnpm", "dev"]
