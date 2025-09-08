#!/bin/bash

# Docker build script for Next.js application
set -e

# Default values
BUILD_TYPE="production"
TAG="latest"
PUSH=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      BUILD_TYPE="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    --clean)
      CLEAN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -t, --type TYPE    Build type (production, development) [default: production]"
      echo "  --tag TAG          Docker image tag [default: latest]"
      echo "  --push             Push image to registry after build"
      echo "  --clean            Clean up unused Docker resources"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Validate build type
if [[ "$BUILD_TYPE" != "production" && "$BUILD_TYPE" != "development" ]]; then
  echo "Error: Invalid build type. Must be 'production' or 'development'"
  exit 1
fi

echo "Building Docker image for $BUILD_TYPE..."

# Set Dockerfile based on build type
if [[ "$BUILD_TYPE" == "production" ]]; then
  DOCKERFILE="Dockerfile"
else
  DOCKERFILE="Dockerfile.dev"
fi

# Build the image
echo "Building image with tag: $TAG"
docker build -f "$DOCKERFILE" -t "nextjs-app:$TAG" .

if [ $? -eq 0 ]; then
  echo "Build successful!"
else
  echo "Build failed!"
  exit 1
fi

# Push image if requested
if [ "$PUSH" = true ]; then
  echo "Pushing image to registry..."
  docker push "nextjs-app:$TAG"
  
  if [ $? -eq 0 ]; then
    echo "Push successful!"
  else
    echo "Push failed!"
    exit 1
  fi
fi

# Clean up if requested
if [ "$CLEAN" = true ]; then
  echo "Cleaning up unused Docker resources..."
  docker system prune -f
  echo "Cleanup complete!"
fi

echo "Docker build process completed successfully!"
