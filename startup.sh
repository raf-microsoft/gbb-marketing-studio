#!/bin/bash
# GBB Marketing Studio - Azure App Service Production Startup
# Runs the Express backend (port 4000) and Next.js standalone frontend (Azure PORT)

echo "Starting GBB Marketing Studio..."

WWWROOT=/home/site/wwwroot

# Start the Express backend explicitly on port 4000.
# We override PORT here so it doesn't conflict with the Azure-assigned PORT
# env var that Next.js uses for the public-facing server.
cd "$WWWROOT/backend"
PORT=4000 node server.js &
BACKEND_PID=$!
echo "Backend starting on port 4000 (PID: $BACKEND_PID)"

# Give the backend a moment to initialise before taking traffic
sleep 2

# Start the Next.js standalone server.
# HOSTNAME=0.0.0.0 is required for Azure App Service to route external traffic.
# PORT is set automatically by Azure App Service (default 8080).
cd "$WWWROOT/frontend"
export HOSTNAME=0.0.0.0
exec node server.js
