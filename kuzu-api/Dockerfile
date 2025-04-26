FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including AWS CLI
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install uv for faster package installation
RUN pip install uv

# Copy requirements file
COPY requirements.txt .

# Install dependencies using pip directly to ensure all dependencies are properly installed
RUN pip install -r requirements.txt
RUN pip install numpy pandas

# Copy application code
COPY . .

# Create data directory for the database
RUN mkdir -p /app/database && \
    chmod -R 777 /app/database

# Set environment variables
ENV DB_PATH=/app/database
ENV PORT=8000
ENV CONTAINER=true

# Expose the port
EXPOSE 8000

# Run the application
CMD ["python", "server.py"]
