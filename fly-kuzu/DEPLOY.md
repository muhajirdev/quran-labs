# Deploying KuzuDB Explorer to fly.io

This guide explains how to deploy the KuzuDB Explorer to fly.io with your Quran Knowledge Graph database built into the Docker image.

## Prerequisites

- [fly.io account](https://fly.io/app/sign-up)
- [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Docker installed (for local testing)

## Local Testing

Before deploying to fly.io, you can test the container locally:

```bash
# Build the local Docker image with the database
cd ..  # Move to the root directory
docker build -t kuzu-explorer-local -f fly-kuzu/Dockerfile .

# Run the container locally
docker run -p 8000:8000 --rm kuzu-explorer-local
```

Visit http://localhost:8000 to access the KuzuDB Explorer interface.

## Deployment to fly.io

### Option 1: Automated Deployment

Run the provided deployment script:

```bash
cd fly-kuzu
chmod +x deploy-to-fly.sh
./deploy-to-fly.sh
```

This script will:
1. Install flyctl if not already installed
2. Log you in to fly.io if needed
3. Create a new app if it doesn't exist
4. Create a 10GB persistent volume if it doesn't exist
5. Deploy the application

### Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Navigate to the fly-kuzu directory:
   ```bash
   cd fly-kuzu
   ```

2. Log in to fly.io:
   ```bash
   flyctl auth login
   ```

3. Create a new app:
   ```bash
   flyctl apps create quran-graph-explorer
   ```

4. No need to create a volume as the database is built into the image

5. Deploy the application (from the root directory):
   ```bash
   cd ..  # Move to the root directory
   flyctl deploy --config fly-kuzu/fly.toml --dockerfile fly-kuzu/Dockerfile
   ```

## Accessing Your Deployed KuzuDB Explorer

After deployment, your KuzuDB Explorer will be available at:
https://quran-graph-explorer.fly.dev

## Managing Your Deployment

- View app status:
  ```bash
  flyctl status
  ```

- View app logs:
  ```bash
  flyctl logs
  ```

- SSH into the VM:
  ```bash
  flyctl ssh console
  ```

- Scale the VM:
  ```bash
  flyctl scale vm shared-cpu-1x --memory 2048
  ```

## Database Files

The database files from `playground/quran_graph_db/` are built into the Docker image during deployment. No additional steps are required to upload the database files.

## Troubleshooting

- If the app fails to start, check the logs:
  ```bash
  flyctl logs
  ```

- If you need to access the VM for debugging:
  ```bash
  flyctl ssh console
  ```
