#!/bin/bash

# Claude Flow: The Ascension - Auto-Update Startup Script
# Ensures the game always uses the latest claude-flow@alpha version

echo "🚀 Claude Flow: The Ascension - Initializing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to display animated loading
show_loading() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Step 1: Check for updates
echo "🔍 Phase 1: Scanning for Claude Flow updates..."

# Clear npm cache to ensure fresh version check
npm cache verify 2>/dev/null &
show_loading $!

# Get current version (if any)
CURRENT_VERSION=$(npx claude-flow@alpha --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+(-alpha\.[0-9]+)?' || echo "none")
echo "   Current version: $CURRENT_VERSION"

# Get latest version from npm
LATEST_VERSION=$(npm view claude-flow@alpha version 2>/dev/null || echo "unknown")
echo "   Latest version: $LATEST_VERSION"

# Step 2: Update if needed
if [ "$CURRENT_VERSION" != "$LATEST_VERSION" ] || [ "$CURRENT_VERSION" == "none" ]; then
    echo ""
    echo "⚡ Phase 2: Downloading new powers..."
    echo "   Upgrading from $CURRENT_VERSION to $LATEST_VERSION"
    
    # Force npm to fetch latest
    npm cache clean --force 2>/dev/null
    
    # Use npx with --yes to always get latest
    npx --yes claude-flow@alpha --version > /dev/null 2>&1 &
    show_loading $!
    
    echo "   ✅ Update complete!"
else
    echo "   ✅ Already at maximum power!"
fi

# Step 3: Initialize Claude Flow
echo ""
echo "🧠 Phase 3: Neural patterns evolving..."

# Initialize Claude Flow if not already done
if [ ! -f ".claude-flow/config.json" ]; then
    npx claude-flow@alpha init --force 2>/dev/null &
    show_loading $!
    echo "   ✅ Claude Flow initialized!"
else
    echo "   ✅ Configuration loaded!"
fi

# Step 4: Discover new features
echo ""
echo "🎯 Phase 4: Discovering new abilities..."

# Get list of available commands
FEATURES=$(npx claude-flow@alpha help 2>/dev/null | grep -E '^\s+\w+' | head -5 | tr '\n' ', ' | sed 's/,$//')
if [ -n "$FEATURES" ]; then
    echo "   Unlocked: $FEATURES"
else
    echo "   Core features ready!"
fi

# Step 5: Start the game
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Claude Flow $LATEST_VERSION activated!"
echo "🎮 Starting The Ascension..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set environment variables to ensure latest version
export CLAUDE_FLOW_VERSION=$LATEST_VERSION
export CLAUDE_FLOW_AUTO_UPDATE=true
export NPM_CONFIG_UPDATE_NOTIFIER=false

# Start the game with auto-update enabled
npm run dev