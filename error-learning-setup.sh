#\!/bin/bash

# Claude Flow Self-Learning Error System Setup
# This creates a persistent error learning system that improves over time

echo "🧠 Setting up Self-Learning Error System..."

# 1. Create error pattern recognition system
npx claude-flow@alpha hooks pre-task "
  # Check for similar errors in memory
  ERROR_PATTERNS=\$(npx claude-flow@alpha memory query 'error/' --namespace error-learning)
  if [ \! -z \"\$ERROR_PATTERNS\" ]; then
    echo '⚠️ Found previous error patterns. Loading solutions...'
  fi
"

# 2. Create post-error learning hook
npx claude-flow@alpha hooks post-task "
  # Store error patterns and solutions
  if [ \$? -ne 0 ]; then
    ERROR_MSG=\$(tail -n 20 .claude-flow/logs/latest.log | grep -E 'error|Error|ERROR')
    SOLUTION=\$(git diff HEAD~1)
    npx claude-flow@alpha memory store \"error/\$(date +%s)\" \"\$ERROR_MSG|||SOLUTION|||\$SOLUTION\" --namespace error-learning
  fi
"

# 3. Create error analysis workflow
npx claude-flow@alpha workflow create error-analyzer '{
  "name": "Error Pattern Analyzer",
  "description": "Analyzes and learns from errors",
  "steps": [
    {
      "id": "detect",
      "type": "error-detection",
      "command": "grep -r \"error\\|Error\\|ERROR\" --include=\"*.log\""
    },
    {
      "id": "analyze",
      "type": "pattern-analysis",
      "command": "npx claude-flow@alpha neural patterns analyze --action learn"
    },
    {
      "id": "store",
      "type": "memory-storage",
      "command": "npx claude-flow@alpha memory store"
    },
    {
      "id": "suggest",
      "type": "solution-generation",
      "command": "npx claude-flow@alpha agent spawn coder \"Fix based on learned patterns\""
    }
  ]
}'

# 4. Create chained error resolution system
npx claude-flow@alpha sparc run stream-chain "
  Error Detection Chain:
  1. Monitor logs for errors
  2. Search memory for similar patterns
  3. Apply known solutions
  4. If new error, spawn researcher
  5. Store new solution in memory
  6. Train neural network on pattern
"

echo "✅ Self-Learning Error System Initialized\!"
