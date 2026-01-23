#!/bin/bash

# Monitor IPS ERP Amplify Deployment with KIRO CLI
# Usage: ./monitor-deployment.sh [interval_seconds]

INTERVAL=${1:-60}  # Default: check every 60 seconds
APP_ID="d2wwgecog8smmr"
REGION="us-east-1"

echo "🔍 Starting deployment monitor (checking every ${INTERVAL}s)"
echo "📱 App ID: ${APP_ID}"
echo "🌎 Region: ${REGION}"
echo ""

while true; do
    # Get latest build info
    BUILD_INFO=$(aws amplify list-jobs \
        --app-id "$APP_ID" \
        --branch-name main \
        --region "$REGION" \
        --max-results 1 \
        --output json 2>&1)
    
    if [ $? -eq 0 ]; then
        # Save to temp file for KIRO to analyze
        echo "$BUILD_INFO" > /tmp/amplify-build-status.json
        
        # Use KIRO CLI to analyze the deployment
        kiro chat "Analyze this Amplify deployment status and tell me:
1. Current build status (SUCCEED/FAILED/IN_PROGRESS)
2. Build number and commit
3. Any errors or warnings
4. Should I be concerned about anything?
5. If failed, what are the likely causes?

Be concise and actionable." -a /tmp/amplify-build-status.json
        
        echo ""
        echo "---"
        echo "⏰ Next check in ${INTERVAL} seconds (Ctrl+C to stop)"
        echo ""
    else
        echo "❌ Error fetching build info. Check AWS credentials."
        echo "$BUILD_INFO"
    fi
    
    sleep "$INTERVAL"
done
