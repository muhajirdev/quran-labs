#!/bin/bash
set -e

echo "=== Kuzu API Deployment Script ==="
echo "This script will deploy the Kuzu API to fly.io"
echo "=================================================="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "flyctl is not installed. Installing..."
    curl -L https://fly.io/install.sh | sh

    # Add flyctl to PATH for this session
    export FLYCTL_INSTALL="/home/$(whoami)/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# Check if user is logged in to fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "Please log in to fly.io:"
    flyctl auth login
fi

# Check if the app already exists
if ! flyctl apps list | grep -q "kuzu-api"; then
    echo "Creating new fly.io app: kuzu-api"
    flyctl apps create kuzu-api
else
    echo "App kuzu-api already exists"
fi

# Check if the volume already exists
if ! flyctl volumes list | grep -q "kuzu_api_data"; then
    echo "Creating persistent volume: kuzu_api_data"
    flyctl volumes create kuzu_api_data --size 10 --region sin
else
    echo "Volume kuzu_api_data already exists"
fi

# Set secrets for AWS credentials
echo "Setting AWS credentials as secrets..."
flyctl secrets set AWS_ACCESS_KEY_ID="tid_PdKCHFQUhBtMDmXrfRSslDeIDhoArvrEObiDJNJxcSAFtzsqPG"
flyctl secrets set AWS_SECRET_ACCESS_KEY="tsec_qvLmTLgEYzQohNrc8QqZ0TU8kZTkBKGgm4EqOioMHug+s8mAwq8xmeUz5R2x+cgXfbclYH"
flyctl secrets set S3_ENDPOINT_URL="https://fly.storage.tigris.dev"

# Deploy the app
echo "Deploying app to fly.io..."
flyctl deploy

echo "Deployment complete!"
echo "Your Kuzu API should be available at: https://kuzu-api.fly.dev"
echo ""
echo "You can trigger a database sync by visiting: https://kuzu-api.fly.dev/trigger-sync"
echo "You can check the health of the API by visiting: https://kuzu-api.fly.dev/health"
