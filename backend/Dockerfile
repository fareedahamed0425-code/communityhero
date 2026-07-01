FROM python:3.11-slim

# Install system dependencies (needed for PostgreSQL, PostGIS, etc)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Command to run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
