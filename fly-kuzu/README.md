# KuzuDB Explorer Deployment for Quran Knowledge Graph

This directory contains all the necessary files to deploy the KuzuDB Explorer to fly.io with your Quran Knowledge Graph database built into the Docker image.

## Files

- `Dockerfile` - Configures the KuzuDB Explorer image and copies the database files
- `fly.toml` - Configuration file for fly.io deployment
- `deploy-to-fly.sh` - Helper script to automate the deployment process
- `DEPLOY.md` - Detailed deployment instructions and troubleshooting guide
- `.dockerignore` - Specifies files to exclude from the Docker build

## Quick Start

1. Make sure you have a fly.io account and the flyctl CLI installed
2. Run the deployment script:
   ```bash
   chmod +x deploy-to-fly.sh
   ./deploy-to-fly.sh
   ```
3. Access your KuzuDB Explorer at https://quran-graph-explorer.fly.dev

## Detailed Instructions

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions, including:
- Local testing
- Manual deployment steps
- Managing your deployment
- Uploading data to the volume
- Troubleshooting

## Local Testing

To test the container locally before deploying:

```bash
# Build the local Docker image with the database
cd ..  # Move to the root directory
docker build -t kuzu-explorer-local -f fly-kuzu/Dockerfile .

# Run the container locally
docker run -p 8000:8000 --rm kuzu-explorer-local
```

Visit http://localhost:8000 to access the KuzuDB Explorer interface.
