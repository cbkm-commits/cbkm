#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building with react-scripts..."
npx react-scripts build

echo "Build completed successfully!"
