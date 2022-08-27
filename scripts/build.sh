#!/bin/bash

# Usage: ./scripts/build.sh

set -e

cd "$(dirname "$0")/../"

echo "Start building backend..."

go build -o ./build/memos ./bin/server/main.go

echo "Backend built!"
