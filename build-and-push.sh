#!/bin/bash

# APISIX Dashboard Docker Build and Push Script
# This script builds the Docker image using Dockerfile.k8s and pushes to Aliyun Container Registry

set -e

# Configuration
REGISTRY="goodwe-registry.cn-hangzhou.cr.aliyuncs.com"
NAMESPACE="secp"
IMAGE_NAME="apisix-dashboard"
TAG="k8s-$(date +%Y%m%d-%H%M%S)"
LATEST_TAG="k8s-latest"
USERNAME="dev@1538101074284395"
PASSWORD="1q2w3e4r"

# Full image names
FULL_IMAGE="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}"
TAGGED_IMAGE="${FULL_IMAGE}:${TAG}"
LATEST_IMAGE="${FULL_IMAGE}:${LATEST_TAG}"

echo "🚀 Starting APISIX Dashboard Docker build and push process..."
echo "📦 Image: ${TAGGED_IMAGE}"
echo "📦 Latest: ${LATEST_IMAGE}"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and make sure it's running"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker Desktop"
    exit 1
fi

echo "✅ Docker is available and running"
echo ""

# Login to Aliyun Container Registry
echo "🔐 Logging in to Aliyun Container Registry..."
echo "${PASSWORD}" | docker login "${REGISTRY}" -u "${USERNAME}" --password-stdin

if [ $? -eq 0 ]; then
    echo "✅ Successfully logged in to ${REGISTRY}"
else
    echo "❌ Failed to login to ${REGISTRY}"
    exit 1
fi
echo ""

# Build Docker image
echo "🔨 Building Docker image with Dockerfile.k8s..."
echo "This may take several minutes..."
echo ""

docker build -f Dockerfile.k8s \
    -t "${TAGGED_IMAGE}" \
    -t "${LATEST_IMAGE}" \
    --build-arg APISIX_DASHBOARD_VERSION="$(git rev-parse --short HEAD)" \
    .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi
echo ""

# Show image information
echo "📋 Image Information:"
docker images | grep "${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}" | head -5
echo ""

# Push images to registry
echo "📤 Pushing images to Aliyun Container Registry..."
echo "Pushing tagged image: ${TAGGED_IMAGE}"
docker push "${TAGGED_IMAGE}"

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed ${TAGGED_IMAGE}"
else
    echo "❌ Failed to push ${TAGGED_IMAGE}"
    exit 1
fi

echo "Pushing latest image: ${LATEST_IMAGE}"
docker push "${LATEST_IMAGE}"

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed ${LATEST_IMAGE}"
else
    echo "❌ Failed to push ${LATEST_IMAGE}"
    exit 1
fi

echo ""
echo "🎉 Build and push completed successfully!"
echo "📦 Images pushed:"
echo "   - ${TAGGED_IMAGE}"
echo "   - ${LATEST_IMAGE}"
echo ""
echo "🚀 You can now deploy using:"
echo "   kubectl set image deployment/apisix-dashboard apisix-dashboard=${TAGGED_IMAGE}"
echo "   or"
echo "   docker run -p 9000:9000 ${LATEST_IMAGE}"
echo ""

# Clean up local images (optional)
read -p "🗑️  Do you want to clean up local images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up local images..."
    docker rmi "${TAGGED_IMAGE}" "${LATEST_IMAGE}" 2>/dev/null || true
    docker image prune -f
    echo "✅ Cleanup completed"
fi

echo "✨ All done!"