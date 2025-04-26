# Kuzu API

A simple Python API server for executing Cypher queries against a Kuzu graph database and syncing data from S3.

## Features

- Execute Cypher queries via a REST API
- Sync database from S3 storage
- Containerized for easy deployment
- Ready for deployment to fly.io

## Local Development

### Prerequisites

- Python 3.8+
- uv (Python package installer)

### Setup

1. Clone the repository
2. Create a virtual environment and install dependencies:

```bash
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows
.venv\Scripts\activate
# On macOS/Linux
source .venv/bin/activate

# Install dependencies using uv
uv pip install -r requirements.txt
```

### Running the Server

```bash
python server.py
```

The server will be available at http://localhost:8000.

When running locally, the database will be stored in a `db_data` directory in the current working directory, not in `/data` as it would be in a container.

### Testing the API

A simple test script is provided to verify that the API is working:

```bash
python test_api.py
```

This will test the health check, query, and trigger-sync endpoints.

## API Endpoints

### Execute a Cypher Query

```
POST /query
```

Request body:

```json
{
  "query": "MATCH (n:Verse) RETURN n LIMIT 10",
  "params": {
    "param1": "value1"
  }
}
```

Response:

```json
{
  "data": [
    {
      "column1": "value1",
      "column2": "value2"
    }
  ],
  "columns": ["column1", "column2"],
  "execution_time_ms": 10.5
}
```

### Trigger Database Sync from S3

```
GET /trigger-sync
```

Response:

```json
{
  "message": "Database sync started in the background"
}
```

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "message": "Database connection is working"
}
```

## Docker

Build the Docker image:

```bash
docker build -t kuzu-api .
```

Run the container:

```bash
docker run -p 8000:8000 -v $(pwd)/data:/data kuzu-api
```

## Deployment to fly.io

1. Install the flyctl CLI
2. Log in to fly.io
3. Create a volume for the database:

```bash
fly volumes create kuzu_graph_data --size 10 --region sin
```

4. Deploy the application:

```bash
fly deploy
```

## Environment Variables

- `DB_PATH`: Path to the Kuzu database (default: `/data/quran_graph_db`)
- `PORT`: Port for the server to listen on (default: `8000`)
- `AWS_ACCESS_KEY_ID`: AWS access key ID for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for S3
- `S3_ENDPOINT_URL`: S3 endpoint URL (default: `https://fly.storage.tigris.dev`)
