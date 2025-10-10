#!/bin/bash

# Development Environment Launcher for Cuddles
echo "� Starting Cuddles Development Environment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Please edit .env with your actual configuration"
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

echo ""
echo "🔧 Starting development containers..."

# Stop any existing containers
docker-compose -f docker-compose.dev.yml down

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if curl -s http://localhost:8500/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is running at http://localhost:8500${NC}"
else
    echo "❌ API failed to start. Checking logs..."
    docker-compose -f docker-compose.dev.yml logs api-dev
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UI is running at http://localhost:3000${NC}"
else
    echo "❌ UI failed to start. Checking logs..."
    docker-compose -f docker-compose.dev.yml logs ui-dev
    exit 1
fi

echo ""
echo -e "${BLUE}🎉 Development environment is ready!${NC}"
echo ""
echo "📱 Open your browser to:"
echo "   • UI: http://localhost:3000"
echo "   • API: http://localhost:8500"
echo ""
echo "� Useful commands:"
echo "   • View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   • Stop containers: docker-compose -f docker-compose.dev.yml down"
echo "   • Test PWA: ./scripts/test-pwa-interactive.sh"
echo ""

# Follow logs by default
echo "📋 Following container logs (Ctrl+C to stop)..."
echo ""
docker-compose -f docker-compose.dev.yml logs -f