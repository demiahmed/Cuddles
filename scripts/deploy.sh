#!/bin/bash

# Production Deployment Script for Cuddles
echo "🚀 Starting Cuddles Production Deployment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found. Please create .env with production values.${NC}"
    exit 1
fi

# Validate VAPID configuration
source .env
if [ -z "$VAPID_PUBLIC_KEY" ] || [ -z "$VAPID_PRIVATE_KEY" ] || [ -z "$VAPID_EMAIL" ]; then
    echo -e "${RED}❌ Missing required VAPID configuration in .env${NC}"
    echo "Please generate VAPID keys and update your .env file"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration validated${NC}"
echo ""
echo "🔧 Starting production containers..."

# Stop any existing containers
docker-compose down

# Build and start production environment
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if curl -s http://localhost:8500/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is running at http://localhost:8500${NC}"
else
    echo -e "${RED}❌ API failed to start. Checking logs...${NC}"
    docker-compose logs api
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UI is running at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ UI failed to start. Checking logs...${NC}"
    docker-compose logs ui
    exit 1
fi

echo ""
echo -e "${BLUE}🎉 Production deployment successful!${NC}"
echo ""
echo "📱 Your application is ready at:"
echo "   • UI: http://localhost:3000"
echo "   • API: http://localhost:8500"
echo ""
echo "� Management commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop application: docker-compose down"
echo "   • Test PWA: ./scripts/test-pwa-interactive.sh"
echo "   • Check PWA status: ./scripts/pwa-cross-browser-check.sh"
echo ""
echo "🔒 Security checklist:"
echo "   ✓ VAPID keys configured"
echo "   ✓ Production environment variables set"
echo "   ✓ Services running with health checks"
echo ""

# Run PWA check
echo "🧪 Running PWA compatibility check..."
./scripts/pwa-cross-browser-check.sh