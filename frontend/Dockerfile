# ================================
# Waku Expense Tracker - Frontend
# ================================

# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for better Docker caching
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Build Vite application
RUN npm run build


# Production stage
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite production build
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]