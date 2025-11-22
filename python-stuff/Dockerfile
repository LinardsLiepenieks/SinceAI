# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies: Poppler (PDF to PNG) and Tesseract (OCR)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Create temp directories for processing
RUN mkdir -p /tmp/uploads /tmp/processed

# make a non-root user and set permissions
RUN useradd -m appuser && \
    chown -R appuser:appuser /app /tmp/uploads /tmp/processed
USER appuser

ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
