from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import kuzu
import os
from typing import Dict, Any, Optional, List
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Determine if we're running in a container
IN_CONTAINER = os.environ.get("CONTAINER", "false").lower() == "true"

# Database path - use a local directory if not in a container
if IN_CONTAINER:
    DB_PATH = os.environ.get("DB_PATH", "/data/quran_graph_db")
else:
    # Use a directory in the current working directory
    DB_PATH = os.environ.get("DB_PATH", os.path.join(os.getcwd(), "db_data"))

# Database connection
db = None
conn = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db, conn
    try:
        logger.info(f"Connecting to existing database at {DB_PATH}")

        # Connect to the database in read-only mode
        try:
            # Note: Kuzu doesn't have a built-in read-only mode, but we'll ensure
            # our API endpoints don't allow write operations
            db = kuzu.Database(DB_PATH, read_only=True)
            conn = kuzu.Connection(db)
            logger.info("Database connection established")
        except Exception as db_error:
            logger.error(f"Failed to connect to database: {str(db_error)}")
            raise
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down database connection")
    # Kuzu handles cleanup automatically when objects are destroyed
    conn = None
    db = None


# Create FastAPI app
app = FastAPI(
    title="Kuzu API",
    description="API for executing Cypher queries against a Kuzu graph database",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CypherQuery(BaseModel):
    query: str
    params: Optional[Dict[str, Any]] = None


class QueryResult(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    execution_time_ms: float


# Event handlers are now managed by the lifespan context manager


@app.post("/query", response_model=QueryResult)
async def execute_query(query_data: CypherQuery):
    global conn
    if conn is None:
        raise HTTPException(
            status_code=500, detail="Database connection not established"
        )

    # Check if the query is read-only
    query = query_data.query.strip().upper()
    if query.startswith(
        ("CREATE", "DROP", "ALTER", "DELETE", "REMOVE", "SET", "MERGE")
    ):
        raise HTTPException(
            status_code=403,
            detail="Write operations are not allowed. This API provides read-only access to the database.",
        )

    try:
        import time

        start_time = time.time()

        # Execute the query
        if query_data.params:
            # Prepare parameters for the query
            params = {}
            for key, value in query_data.params.items():
                params[key] = value
            result = conn.execute(query_data.query, params)
        else:
            result = conn.execute(query_data.query)

        # Convert result to list of dictionaries
        data = []
        columns = result.get_column_names()

        # Get results as dataframe and convert to dict
        df = result.get_as_df()
        if not df.empty:
            data = df.to_dict(orient="records")

        execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds

        return {"data": data, "columns": columns, "execution_time_ms": execution_time}
    except Exception as e:
        logger.error(f"Query execution error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")


@app.get("/sync-instructions")
async def sync_instructions():
    """Provide instructions for manually syncing the database from S3"""
    return {
        "message": "Manual sync instructions",
        "steps": [
            "1. SSH into the container: flyctl ssh console -a kuzu-api",
            "2. Configure AWS CLI: aws configure",
            "3. Enter AWS credentials when prompted:",
            "4. Sync the database: aws s3 cp s3://quranlabs/quran_graph_db/ /app/database/ --recursive --endpoint-url=https://fly.storage.tigris.dev",
            "5. Restart the app: exit and run 'flyctl apps restart kuzu-api'",
        ],
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global conn
    try:
        if conn is None:
            return {"status": "error", "message": "Database connection not established"}

        # Execute a simple query to check if the database is responsive
        result = conn.execute("RETURN 1 as test")
        data = result.get_as_df()
        if data.iloc[0]["test"] == 1:
            return {"status": "healthy", "message": "Database connection is working"}
        else:
            return {
                "status": "error",
                "message": "Database query returned unexpected result",
            }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "error", "message": f"Health check failed: {str(e)}"}
