# Use the official Python image as base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y gcc \
    libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*  # Reduce the image size after installing dependencies

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code into the container
COPY . .

# Expose port 8000 to the outside world
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
