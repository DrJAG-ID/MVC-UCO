FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including SQLite3 & curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Gunicorn port 35553
EXPOSE 35553

# Launch Gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
