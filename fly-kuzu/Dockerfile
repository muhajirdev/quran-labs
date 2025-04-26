FROM kuzudb/explorer:latest

# Create database directory
RUN mkdir -p /database

# Copy the database files from the local directory
# Note: This requires the Dockerfile to be built from the root directory
# where playground/quran_graph_db is accessible
COPY playground/quran_graph_db/ /database/

# Set correct permissions for the database files
# The KuzuDB Explorer runs as user 'nobody'
# Make sure this is near the end of the Dockerfile
USER root
RUN chmod -R 777 /database

# Expose port 8000
EXPOSE 8000

# The entrypoint is already defined in the base image
