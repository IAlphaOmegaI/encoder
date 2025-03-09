FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    libgomp1 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install --no-cache-dir poetry==1.7.1

# Copy only requirements first to leverage Docker cache
COPY pyproject.toml poetry.lock* ./

# Configure poetry and pre-download dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-interaction --no-ansi \
    || true

# Copy the rest of the application
COPY . .

# Install dependencies again to ensure everything is installed
RUN poetry install --only main --no-interaction --no-ansi

# Set PYTHONPATH
ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]