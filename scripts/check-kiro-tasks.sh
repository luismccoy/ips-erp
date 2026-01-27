#!/bin/bash
# Check for pending Kiro (backend) tasks
# Run this in Kiro IDE to see what work is waiting

cd "$(dirname "$0")/.."
echo "🔧 KIRO BACKEND TASKS"
echo "====================="
echo ""

if [ -f tasks/queue.json ]; then
    PENDING=$(cat tasks/queue.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
tasks = data.get('queues', {}).get('kiro', {}).get('pending', [])
if tasks:
    for t in tasks:
        print(f\"📋 [{t['priority']}] {t['title']}\")
        print(f\"   Spec: {t['spec']}\")
        print(f\"   Status: {t['status']}\")
        print()
else:
    print('✅ No pending tasks')
")
    echo "$PENDING"
else
    echo "❌ No queue.json found"
fi

echo ""
echo "To start a task, open the spec file and implement it."
echo "Then update tasks/queue.json to mark it in-progress or completed."
