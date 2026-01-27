#!/bin/bash
#
# backup-export.sh
# Export data from IPS-ERP for backup or migration
#
# Usage: ./scripts/backup-export.sh [--env production] [--output ./backups]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
ENV="production"
OUTPUT_DIR="./backups"
REGION="${AWS_REGION:-us-east-1}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --output) OUTPUT_DIR="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

BACKUP_DIR="${OUTPUT_DIR}/${ENV}-${TIMESTAMP}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IPS-ERP: Data Backup Export                               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENV}${NC}"
echo -e "${YELLOW}Output: ${BACKUP_DIR}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# Step 1: Verify Prerequisites
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5] Verifying prerequisites...${NC}"

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured or expired.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials valid${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup directory created: ${BACKUP_DIR}${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 2: Discover DynamoDB Tables
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/5] Discovering DynamoDB tables...${NC}"

# List tables matching IPS pattern
TABLES=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'Tenant') || contains(@, 'Patient') || contains(@, 'Nurse') || contains(@, 'Shift') || contains(@, 'Visit') || contains(@, 'VitalSign') || contains(@, 'Billing') || contains(@, 'Inventory') || contains(@, 'Audit') || contains(@, 'Notification') || contains(@, 'Assessment')]" --output text --region "$REGION")

if [ -z "$TABLES" ]; then
    echo -e "${RED}❌ No IPS-ERP tables found. Check region and deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}Found tables:${NC}"
echo "$TABLES" | tr '\t' '\n' | while read table; do
    echo "  - $table"
done

echo ""

# ─────────────────────────────────────────────────────────────
# Step 3: Export DynamoDB Data
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/5] Exporting DynamoDB data...${NC}"

MANIFEST_FILE="${BACKUP_DIR}/backup-manifest.json"
echo "{" > "$MANIFEST_FILE"
echo "  \"version\": \"1.0.0\"," >> "$MANIFEST_FILE"
echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"," >> "$MANIFEST_FILE"
echo "  \"environment\": \"${ENV}\"," >> "$MANIFEST_FILE"
echo "  \"region\": \"${REGION}\"," >> "$MANIFEST_FILE"
echo "  \"tables\": {" >> "$MANIFEST_FILE"

FIRST_TABLE=true
for TABLE in $TABLES; do
    echo -e "${YELLOW}Exporting: ${TABLE}...${NC}"
    
    # Get item count
    COUNT=$(aws dynamodb scan --table-name "$TABLE" --select COUNT --query "Count" --output text --region "$REGION" 2>/dev/null || echo "0")
    
    # Export data
    OUTPUT_FILE="${BACKUP_DIR}/${TABLE}.json"
    aws dynamodb scan --table-name "$TABLE" --output json --region "$REGION" > "$OUTPUT_FILE" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not export ${TABLE}${NC}"
        continue
    }
    
    # Add to manifest
    if [ "$FIRST_TABLE" != "true" ]; then
        echo "," >> "$MANIFEST_FILE"
    fi
    FIRST_TABLE=false
    
    FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null || echo "0")
    
    echo -n "    \"${TABLE}\": {" >> "$MANIFEST_FILE"
    echo -n "\"file\": \"${TABLE}.json\", " >> "$MANIFEST_FILE"
    echo -n "\"count\": ${COUNT}, " >> "$MANIFEST_FILE"
    echo -n "\"sizeBytes\": ${FILE_SIZE}" >> "$MANIFEST_FILE"
    echo -n "}" >> "$MANIFEST_FILE"
    
    echo -e "${GREEN}  ✅ ${TABLE}: ${COUNT} items, ${FILE_SIZE} bytes${NC}"
done

echo "" >> "$MANIFEST_FILE"
echo "  }," >> "$MANIFEST_FILE"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 4: Export Cognito Users (metadata only)
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/5] Exporting Cognito user list...${NC}"

# Find Cognito user pool
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 60 --query "UserPools[?contains(Name, 'amplify')].Id" --output text --region "$REGION" | head -1)

if [ -n "$USER_POOL_ID" ]; then
    USERS_FILE="${BACKUP_DIR}/cognito-users.json"
    aws cognito-idp list-users --user-pool-id "$USER_POOL_ID" --region "$REGION" > "$USERS_FILE" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not export Cognito users${NC}"
    }
    
    USER_COUNT=$(cat "$USERS_FILE" | grep -o '"Username"' | wc -l)
    echo -e "${GREEN}✅ Exported ${USER_COUNT} Cognito users (metadata only, no passwords)${NC}"
    
    echo "  \"cognito\": {" >> "$MANIFEST_FILE"
    echo "    \"userPoolId\": \"${USER_POOL_ID}\"," >> "$MANIFEST_FILE"
    echo "    \"usersFile\": \"cognito-users.json\"," >> "$MANIFEST_FILE"
    echo "    \"userCount\": ${USER_COUNT}," >> "$MANIFEST_FILE"
    echo "    \"note\": \"Passwords cannot be exported. Users must reset on migration.\"" >> "$MANIFEST_FILE"
    echo "  }," >> "$MANIFEST_FILE"
else
    echo -e "${YELLOW}⚠️  No Cognito user pool found${NC}"
    echo "  \"cognito\": null," >> "$MANIFEST_FILE"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 5: Finalize Manifest
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/5] Finalizing backup manifest...${NC}"

# Calculate total size
TOTAL_SIZE=$(du -sb "$BACKUP_DIR" 2>/dev/null | cut -f1 || du -sk "$BACKUP_DIR" | awk '{print $1 * 1024}')

echo "  \"totalSizeBytes\": ${TOTAL_SIZE}," >> "$MANIFEST_FILE"
echo "  \"checksum\": \"$(find "$BACKUP_DIR" -type f -name "*.json" -exec md5sum {} \; | md5sum | cut -d' ' -f1)\"" >> "$MANIFEST_FILE"
echo "}" >> "$MANIFEST_FILE"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Backup Export Complete!                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Backup location: ${BACKUP_DIR}${NC}"
echo -e "${YELLOW}Manifest: ${MANIFEST_FILE}${NC}"
echo -e "${YELLOW}Total size: $(numfmt --to=iec ${TOTAL_SIZE} 2>/dev/null || echo "${TOTAL_SIZE} bytes")${NC}"
echo ""
echo -e "${YELLOW}Files created:${NC}"
ls -la "$BACKUP_DIR"
echo ""
echo -e "${YELLOW}To restore, run:${NC}"
echo -e "  ${BLUE}./scripts/restore-import.sh --manifest ${MANIFEST_FILE}${NC}"
