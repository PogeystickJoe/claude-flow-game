#!/bin/bash

# Claude Flow: The Ascension - Production Start Script
# ALWAYS checks and updates to latest claude-flow@alpha BEFORE starting

echo "🚀 Claude Flow: The Ascension - Production Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Clear ALL caches to ensure fresh version
echo "🧹 Step 1: Clearing all caches..."
npm cache clean --force 2>/dev/null
rm -rf ~/.npm/_npx 2>/dev/null
echo "   ✅ Caches cleared"

# Step 2: Force update to absolute latest version
echo ""
echo "⚡ Step 2: Forcing update to latest claude-flow@alpha..."

# Remove any cached versions
rm -rf node_modules/.cache 2>/dev/null

# Force npx to download fresh version
echo "   Downloading latest version..."
npx --yes --ignore-existing claude-flow@alpha --version

# Get the version we just downloaded
LATEST_VERSION=$(npx claude-flow@alpha --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+(-alpha\.[0-9]+)?' || echo "unknown")
echo "   ✅ Updated to version: $LATEST_VERSION"

# Step 3: Start the update server in background
echo ""
echo "🔄 Step 3: Starting update monitoring server..."
node server/updateServer.js &
UPDATE_SERVER_PID=$!
echo "   ✅ Update server running (PID: $UPDATE_SERVER_PID)"

# Give update server time to fully check
sleep 3

# Step 4: Export version for game
export CLAUDE_FLOW_VERSION=$LATEST_VERSION
export CLAUDE_FLOW_AUTO_UPDATE=true

# Step 5: Start the game
echo ""
echo "🎮 Step 4: Starting the game..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Claude Flow $LATEST_VERSION ready!"
echo "🎯 Game starting at http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Vite
npm run dev

# Cleanup on exit
trap "kill $UPDATE_SERVER_PID 2>/dev/null" EXIT