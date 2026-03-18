#!/bin/bash

# GBB Marketing Studio - Development Startup Script
# Runs both backend (port 4000) and frontend (port 3000)

set -e

echo "🚀 Starting GBB Marketing Studio..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""
echo -e "${BLUE}🔧 Starting servers...${NC}"
echo -e "   Backend:  http://localhost:4000"
echo -e "   Frontend: http://localhost:3000"
echo ""

# Start backend and frontend concurrently
trap 'kill 0' EXIT

cd backend && npm run dev &
cd frontend && npm run dev &

wait
