# Stage 1: Build Next.js static export
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: FastAPI backend serving static files
FROM python:3.12-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install backend dependencies
COPY backend/ backend/
RUN cd backend && uv sync --frozen --no-dev

# Copy built frontend
COPY --from=frontend-builder /app/frontend/out/ static/

ENV STATIC_DIR=/app/static
ENV DB_PATH=/app/prelegal.db

WORKDIR /app/backend
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
