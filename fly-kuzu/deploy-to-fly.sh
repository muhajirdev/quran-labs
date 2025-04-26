#!/bin/bash
set -e

echo "=== KuzuDB Explorer Deployment Script ==="
echo "This script will deploy the KuzuDB Explorer to fly.io"
echo "The database files from playground/quran_graph_db/ will be built into the Docker image"
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
if ! flyctl apps list | grep -q "quran-graph-explorer"; then
    echo "Creating new fly.io app: quran-graph-explorer"
    flyctl apps create quran-graph-explorer
else
    echo "App quran-graph-explorer already exists"
fi

# No need to create a volume since we're building the database into the image
# if ! flyctl volumes list | grep -q "quran_graph_data"; then
#     echo "Creating persistent volume: quran_graph_data"
#     flyctl volumes create quran_graph_data --size 10 --region sin
# else
#     echo "Volume quran_graph_data already exists"
# fi

# Move to the root directory to access the database files
cd ..

# Deploy the app
echo "Deploying app to fly.io..."
flyctl deploy --config fly-kuzu/fly.toml --dockerfile fly-kuzu/Dockerfile

echo "Deployment complete!"
echo "Your KuzuDB Explorer should be available at: https://quran-graph-explorer.fly.dev"
echo ""
echo "The database files from playground/quran_graph_db/ have been built into the Docker image."
echo "No additional steps are required to upload the database files."
