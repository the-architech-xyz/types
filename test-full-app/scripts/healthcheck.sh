#!/bin/bash

# Health check script for Next.js application
set -e

# Default values
URL="http://localhost:3000"
TIMEOUT=30
RETRIES=3
INTERVAL=10

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--url)
      URL="$2"
      shift 2
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -r|--retries)
      RETRIES="$2"
      shift 2
      ;;
    -i|--interval)
      INTERVAL="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -u, --url URL      Health check URL [default: http://localhost:3000]"
      echo "  -t, --timeout SEC  Timeout in seconds [default: 30]"
      echo "  -r, --retries NUM  Number of retries [default: 3]"
      echo "  -i, --interval SEC Interval between retries [default: 10]"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "Starting health check for $URL..."

# Health check function
check_health() {
  local url=$1
  local timeout=$2
  
  if command -v curl >/dev/null 2>&1; then
    curl -f -s --max-time $timeout "$url/api/health" >/dev/null 2>&1
  elif command -v wget >/dev/null 2>&1; then
    wget -q --timeout=$timeout -O /dev/null "$url/api/health" >/dev/null 2>&1
  else
    echo "Error: Neither curl nor wget is available"
    return 1
  fi
}

# Perform health checks
for ((i=1; i<=RETRIES; i++)); do
  echo "Health check attempt $i/$RETRIES..."
  
  if check_health "$URL" "$TIMEOUT"; then
    echo "Health check passed!"
    exit 0
  else
    echo "Health check failed!"
    
    if [ $i -lt $RETRIES ]; then
      echo "Waiting $INTERVAL seconds before retry..."
      sleep $INTERVAL
    fi
  fi
done

echo "Health check failed after $RETRIES attempts!"
exit 1
