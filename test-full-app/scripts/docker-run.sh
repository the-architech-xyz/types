#!/bin/bash

# Docker run script for Next.js application
set -e

# Default values
MODE="production"
PORT="3000"
DETACHED=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--mode)
      MODE="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -d|--detached)
      DETACHED=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -m, --mode MODE    Run mode (production, development) [default: production]"
      echo "  -p, --port PORT    Port to expose [default: 3000]"
      echo "  -d, --detached     Run in detached mode"
      echo "  --clean            Clean up before running"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate mode
if [[ "$MODE" != "production" && "$MODE" != "development" ]]; then
  echo "Error: Invalid mode. Must be 'production' or 'development'"
  exit 1
fi

# Clean up if requested
if [ "$CLEAN" = true ]; then
  echo "Cleaning up existing containers..."
  docker-compose down -v
  docker system prune -f
fi

# Set environment variables
export NODE_ENV=$MODE
export PORT=$PORT

echo "Starting Next.js application in $MODE mode..."

# Run the application
if [ "$DETACHED" = true ]; then
  docker-compose up -d
  echo "Application started in detached mode!"
  echo "To view logs: docker-compose logs -f"
  echo "To stop: docker-compose down"
else
  docker-compose up
fi
