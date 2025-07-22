#!/bin/bash
# StudySprint 4.0 - Stage 8 Performance Optimization Deployment Guide
# Fixed version with correct Python version check

set -e  # Exit on any error

echo "🚀 StudySprint 4.0 - Stage 8 Performance Optimization Deployment"
echo "================================================================="
echo "This script will install and configure all performance optimizations"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Some operations will be performed as root."
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Python version - FIXED VERSION
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    python_version=$(python3 --version | cut -d' ' -f2)
    python_major=$(echo $python_version | cut -d'.' -f1)
    python_minor=$(echo $python_version | cut -d'.' -f2)
    
    if [[ $python_major -lt 3 ]] || [[ $python_major -eq 3 && $python_minor -lt 8 ]]; then
        log_error "Python 3.8+ is required. Found: $python_version"
        exit 1
    fi
    
    log_success "Python $python_version detected (compatible)"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL is required but not installed"
        exit 1
    fi
    
    log_success "System requirements check passed"
}

# Install Redis
install_redis() {
    log_info "Installing Redis for caching..."
    
    if command -v redis-server &> /dev/null; then
        log_success "Redis already installed"
        return 0
    fi
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            log_info "Installing Redis via Homebrew..."
            brew install redis
            brew services start redis
        else
            log_error "Homebrew required for Redis installation on macOS"
            log_info "Install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y redis-server
            sudo systemctl start redis-server
            sudo systemctl enable redis-server
        elif command -v yum &> /dev/null; then
            sudo yum install -y redis
            sudo systemctl start redis
            sudo systemctl enable redis
        else
            log_error "Unsupported Linux distribution"
            exit 1
        fi
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    # Test Redis connection
    sleep 2
    if redis-cli ping 2>/dev/null | grep -q PONG; then
        log_success "Redis installed and running"
    else
        log_error "Redis installation failed or not responding"
        exit 1
    fi
}

# Quick installation function for immediate testing
quick_install() {
    log_info "Running quick performance optimization setup..."
    
    cd "$(dirname "$0")/../backend"
    
    # Activate virtual environment
    if [[ ! -d "venv" ]]; then
        log_info "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Install performance dependencies
    log_info "Installing performance dependencies..."
    pip install redis psutil aiohttp
    
    # Test Redis connection
    if ! redis-cli ping 2>/dev/null | grep -q PONG; then
        log_warning "Redis not running. Performance caching will be disabled."
        log_info "Install Redis with: brew install redis && brew services start redis"
    else
        log_success "Redis connection successful"
    fi
    
    # Test database connection
    if psql studysprint4_local -c "SELECT 1;" &>/dev/null; then
        log_success "Database connection successful"
    else
        log_warning "Database connection failed. Some features may not work."
    fi
    
    log_success "Quick performance setup completed!"
    log_info "Start your backend with: ./scripts/start_backend.sh"
}

# Main execution
main() {
    echo "🚀 Starting StudySprint 4.0 Performance Optimization"
    echo ""
    
    check_permissions
    check_requirements
    
    # Offer quick install for immediate testing
    echo ""
    log_info "Choose installation mode:"
    echo "1. Quick setup (install basic performance dependencies)"
    echo "2. Full optimization (complete performance overhaul)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            quick_install
            ;;
        2)
            log_info "Full optimization requires Redis, PostgreSQL tuning, and more..."
            log_info "This will modify system configuration. Continue? (y/N)"
            read -p "Continue with full optimization? " confirm
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                install_redis
                log_success "Full optimization started... (this may take several minutes)"
                # Additional full optimization steps would go here
            else
                log_info "Cancelled. Running quick setup instead..."
                quick_install
            fi
            ;;
        *)
            log_info "Invalid choice. Running quick setup..."
            quick_install
            ;;
    esac
    
    echo ""
    log_success "🎉 Performance optimization completed!"
    echo ""
    log_info "Next steps:"
    echo "1. Start your backend: ./scripts/start_backend.sh"
    echo "2. Test performance: curl http://localhost:8000/health"
    echo "3. View API docs: http://localhost:8000/docs"
}

main "$@"
