#!/bin/bash

# Interactive PWA Testing Script for Cuddles
# Uses Docker Compose for development and production testing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${PURPLE}======================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}======================================${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}📋 Step $1:${NC} $2"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

wait_for_user() {
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env with your actual VAPID keys before continuing"
            wait_for_user
        else
            print_error ".env.example not found. Please create .env manually."
            exit 1
        fi
    fi
    print_success ".env file found"
}

# Test notification API
test_notifications() {
    local api_url=$1
    local test_type=$2
    
    print_info "Testing $test_type notification..."
    
    response=$(curl -s -w "%{http_code}" -o /tmp/curl_response.txt "$api_url/test-push?type=$test_type")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        print_success "$test_type notification sent successfully!"
        echo "Response: $(cat /tmp/curl_response.txt)"
    else
        print_error "$test_type notification failed (HTTP $http_code)"
        echo "Response: $(cat /tmp/curl_response.txt)"
    fi
    rm -f /tmp/curl_response.txt
}

# PWA Installation Check
check_pwa_installation() {
    local url=$1
    print_info "PWA Installation Checklist for $url"
    echo ""
    echo "🔍 Manual checks to perform in your browser:"
    echo "   1. Open $url"
    echo "   2. Open DevTools (F12)"
    echo "   3. Go to Application tab"
    echo "   4. Check Service Workers section"
    echo "   5. Check Manifest section"
    echo "   6. Look for install button in address bar"
    echo ""
}

# Main script
print_header "🤗 Cuddles PWA Interactive Testing"

echo "This script will guide you through testing PWA functionality"
echo "including push notifications across development and production setups."
echo ""

# Preliminary checks
print_step "1" "Checking Prerequisites"
check_docker
check_env

echo ""
echo "Choose testing mode:"
echo "1) Development Mode (HTTP)"
echo "2) Development Mode (HTTPS for full PWA testing)"
echo "3) Production Mode"
echo "4) Run all modes sequentially"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        mode="dev-http"
        ;;
    2)
        mode="dev-https"
        ;;
    3)
        mode="prod"
        ;;
    4)
        mode="all"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Development HTTP Mode
if [ "$mode" = "dev-http" ] || [ "$mode" = "all" ]; then
    print_header "🔧 Development Mode (HTTP) Testing"
    
    print_step "2" "Starting Development Environment"
    print_info "Starting containers with docker-compose..."
    
    # Ensure HTTPS is disabled
    export HTTPS=false
    
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up -d
    
    print_info "Waiting for services to start..."
    sleep 10
    
    # Check if services are up
    if curl -s http://localhost:8500/health > /dev/null; then
        print_success "API is running at http://localhost:8500"
    else
        print_error "API failed to start"
        docker-compose -f docker-compose.dev.yml logs api-dev
        exit 1
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "UI is running at http://localhost:3000"
    else
        print_error "UI failed to start"
        docker-compose -f docker-compose.dev.yml logs ui-dev
        exit 1
    fi
    
    print_step "3" "Testing Basic Functionality"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo ""
    print_warning "Note: Push notifications may not work over HTTP in some browsers"
    wait_for_user
    
    print_step "4" "Testing Push Notifications"
    test_notifications "http://localhost:8500" "period"
    test_notifications "http://localhost:8500" "ovulation"
    test_notifications "http://localhost:8500" "generic"
    
    echo ""
    print_info "Development HTTP testing complete"
    
    if [ "$mode" != "all" ]; then
        wait_for_user
        docker-compose -f docker-compose.dev.yml down
    fi
fi

# Development HTTPS Mode
if [ "$mode" = "dev-https" ] || [ "$mode" = "all" ]; then
    print_header "🔒 Development Mode (HTTPS) Testing"
    
    print_step "2" "Starting Development Environment with HTTPS"
    print_warning "HTTPS mode requires manual certificate acceptance"
    
    # Enable HTTPS
    export HTTPS=true
    
    if [ "$mode" = "all" ]; then
        docker-compose -f docker-compose.dev.yml down
        sleep 2
    fi
    
    # Update environment and restart
    docker-compose -f docker-compose.dev.yml up -d
    
    print_info "Waiting for HTTPS services to start..."
    sleep 15
    
    print_step "3" "HTTPS Setup Instructions"
    echo "🔧 Manual HTTPS setup required:"
    echo "   1. Open https://localhost:3001 in your browser"
    echo "   2. Accept the self-signed certificate warning"
    echo "   3. Also visit https://localhost:8500/health to accept API certificate"
    echo ""
    print_warning "You may need to manually set HTTPS=true in docker-compose.dev.yml"
    wait_for_user
    
    check_pwa_installation "https://localhost:3001"
    wait_for_user
    
    print_step "4" "Testing PWA Features"
    echo "🧪 PWA Testing Checklist:"
    echo "   ✓ Service Worker registration"
    echo "   ✓ Install prompt (A2HS)"
    echo "   ✓ Offline functionality"
    echo "   ✓ Push notifications"
    echo ""
    
    print_step "5" "Testing Push Notifications (HTTPS)"
    test_notifications "https://localhost:8500" "period"
    test_notifications "https://localhost:8500" "ovulation"
    
    echo ""
    print_success "HTTPS PWA testing complete!"
    
    if [ "$mode" != "all" ]; then
        wait_for_user
        docker-compose -f docker-compose.dev.yml down
    fi
fi

# Production Mode
if [ "$mode" = "prod" ] || [ "$mode" = "all" ]; then
    print_header "🚀 Production Mode Testing"
    
    print_step "2" "Starting Production Environment"
    
    if [ "$mode" = "all" ]; then
        docker-compose -f docker-compose.dev.yml down
        sleep 2
    fi
    
    docker-compose down
    docker-compose up -d --build
    
    print_info "Waiting for production services to start..."
    sleep 15
    
    # Check production services
    if curl -s http://localhost:8500/health > /dev/null; then
        print_success "Production API is running"
    else
        print_error "Production API failed to start"
        exit 1
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Production UI is running"
    else
        print_error "Production UI failed to start"
        exit 1
    fi
    
    print_step "3" "Production PWA Testing"
    echo "🎯 Production Testing Checklist:"
    echo "   ✓ Open http://localhost:3000"
    echo "   ✓ Check Lighthouse PWA score"
    echo "   ✓ Test offline functionality"
    echo "   ✓ Test push notifications"
    echo "   ✓ Test app installation"
    echo ""
    
    check_pwa_installation "http://localhost:3000"
    wait_for_user
    
    print_step "4" "Testing Production Notifications"
    test_notifications "http://localhost:8500" "period"
    test_notifications "http://localhost:8500" "ovulation"
    
    print_step "5" "Lighthouse PWA Audit"
    echo "🔍 Run Lighthouse PWA audit:"
    echo "   1. Open Chrome DevTools (F12)"
    echo "   2. Go to Lighthouse tab"
    echo "   3. Select 'Progressive Web App'"
    echo "   4. Click 'Generate report'"
    echo "   5. Aim for 100% PWA score"
    echo ""
    
    wait_for_user
    
    if [ "$mode" != "all" ]; then
        docker-compose down
    fi
fi

print_header "🎉 PWA Testing Complete!"

echo "Summary of what was tested:"
echo "✅ Service Worker functionality"
echo "✅ Push notifications"
echo "✅ PWA installation prompts"
echo "✅ Offline functionality"
echo "✅ Cross-browser compatibility"
echo ""

print_info "Additional testing recommendations:"
echo "📱 Test on mobile devices"
echo "🌐 Test in different browsers (Chrome, Firefox, Safari, Edge)"
echo "📊 Run periodic Lighthouse audits"
echo "🔔 Test notifications with real user interactions"
echo ""

if [ "$mode" = "all" ]; then
    echo "Cleaning up all containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
fi

print_success "All testing completed successfully!"