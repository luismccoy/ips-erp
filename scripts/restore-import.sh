#!/bin/bash
#
# restore-import.sh
# Restore IPS-ERP data from backup
#
# Usage: ./scripts/restore-import.sh --manifest ./backups/backup-manifest.json
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
MANIFEST=""
REGION="${AWS_REGION:-us-east-1}"
DRY_RUN=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --manifest) MANIFEST="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --dry-run) DRY_RUN=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$MANIFEST" ]; then
    echo -e "${RED}❌ Manifest file required.${NC}"
    echo -e "${YELLOW}Usage: ./scripts/restore-import.sh --manifest ./backups/backup-manifest.json${NC}"
    exit 1
fi

if [ ! -f "$MANIFEST" ]; then
    echo -e "${RED}❌ Manifest file not found: ${MANIFEST}${NC}"
    exit 1
fi

BACKUP_DIR=$(dirname "$MANIFEST")

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IPS-ERP: Data Restore Import                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Manifest: ${MANIFEST}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo -e "${YELLOW}Dry Run: ${DRY_RUN}${NC}"
echo ""

if [ "$DRY_RUN" == "true" ]; then
    echo -e "${YELLOW}⚠️  DRY RUN MODE - No data will be written${NC}"
    echo ""
fi

# ─────────────────────────────────────────────────────────────
# Step 1: Validate Manifest
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/5] Validating manifest...${NC}"

# Check manifest version
VERSION=$(cat "$MANIFEST" | grep -o '"version": "[^"]*"' | cut -d'"' -f4)
if [ "$VERSION" != "1.0.0" ]; then
    echo -e "${RED}❌ Unsupported manifest version: ${VERSION}${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Manifest version: ${VERSION}${NC}"

# Get backup timestamp
BACKUP_TIME=$(cat "$MANIFEST" | grep -o '"timestamp": "[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✅ Backup timestamp: ${BACKUP_TIME}${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 2: Verify Target Tables Exist
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/5] Verifying target tables...${NC}"

# List tables in target account
TARGET_TABLES=$(aws dynamodb list-tables --output text --region "$REGION")

# Extract table names from manifest
BACKUP_TABLES=$(cat "$MANIFEST" | grep -o '"[^"]*": {"file"' | cut -d'"' -f2)

echo -e "${YELLOW}Tables in backup:${NC}"
for TABLE in $BACKUP_TABLES; do
    echo "  - $TABLE"
done

echo ""
echo -e "${YELLOW}Checking target account tables...${NC}"

# For each backup table, find matching target table
declare -A TABLE_MAP
for BACKUP_TABLE in $BACKUP_TABLES; do
    # Extract the model name (e.g., "Patient" from "Patient-abc123-dev")
    MODEL_NAME=$(echo "$BACKUP_TABLE" | cut -d'-' -f1)
    
    # Find matching table in target
    TARGET_TABLE=$(echo "$TARGET_TABLES" | tr '\t' '\n' | grep "^${MODEL_NAME}-" | head -1)
    
    if [ -n "$TARGET_TABLE" ]; then
        TABLE_MAP["$BACKUP_TABLE"]="$TARGET_TABLE"
        echo -e "${GREEN}  ✅ ${BACKUP_TABLE} → ${TARGET_TABLE}${NC}"
    else
        echo -e "${YELLOW}  ⚠️  ${BACKUP_TABLE} → No matching table found${NC}"
    fi
done

echo ""

# ─────────────────────────────────────────────────────────────
# Step 3: Confirm Restore
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/5] Confirming restore operation...${NC}"

if [ "$DRY_RUN" != "true" ]; then
    echo -e "${RED}⚠️  WARNING: This will overwrite existing data!${NC}"
    echo -e "${YELLOW}Type 'RESTORE' to confirm:${NC}"
    read CONFIRM
    
    if [ "$CONFIRM" != "RESTORE" ]; then
        echo -e "${RED}❌ Restore cancelled.${NC}"
        exit 1
    fi
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 4: Restore DynamoDB Data
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/5] Restoring DynamoDB data...${NC}"

RESTORED_COUNT=0
FAILED_COUNT=0

for BACKUP_TABLE in $BACKUP_TABLES; do
    TARGET_TABLE="${TABLE_MAP[$BACKUP_TABLE]}"
    
    if [ -z "$TARGET_TABLE" ]; then
        echo -e "${YELLOW}⚠️  Skipping ${BACKUP_TABLE} (no target table)${NC}"
        ((FAILED_COUNT++)) || true
        continue
    fi
    
    DATA_FILE="${BACKUP_DIR}/${BACKUP_TABLE}.json"
    
    if [ ! -f "$DATA_FILE" ]; then
        echo -e "${YELLOW}⚠️  Data file not found: ${DATA_FILE}${NC}"
        ((FAILED_COUNT++)) || true
        continue
    fi
    
    echo -e "${YELLOW}Restoring: ${BACKUP_TABLE} → ${TARGET_TABLE}...${NC}"
    
    # Count items to restore
    ITEM_COUNT=$(cat "$DATA_FILE" | grep -o '"S"' | wc -l)
    
    if [ "$DRY_RUN" == "true" ]; then
        echo -e "${GREEN}  [DRY RUN] Would restore ~${ITEM_COUNT} items${NC}"
        ((RESTORED_COUNT++))
        continue
    fi
    
    # Restore using batch-write-item
    # Note: For large datasets, use DynamoDB Import/Export feature
    
    # Extract items from scan output and write them back
    cat "$DATA_FILE" | jq -c '.Items[]' | while read item; do
        # Write each item
        aws dynamodb put-item \
            --table-name "$TARGET_TABLE" \
            --item "$item" \
            --region "$REGION" 2>/dev/null || {
            echo -e "${RED}    Failed to write item${NC}"
        }
    done
    
    echo -e "${GREEN}  ✅ Restored ${TARGET_TABLE}${NC}"
    ((RESTORED_COUNT++))
done

echo ""

# ─────────────────────────────────────────────────────────────
# Step 5: Restore Summary
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/5] Restore summary...${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Data Restore Complete!                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Tables restored: ${RESTORED_COUNT}${NC}"
echo -e "${YELLOW}Tables skipped: ${FAILED_COUNT}${NC}"
echo ""

if [ "$DRY_RUN" == "true" ]; then
    echo -e "${YELLOW}This was a DRY RUN. No data was actually written.${NC}"
    echo -e "${YELLOW}Run without --dry-run to perform actual restore.${NC}"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Verify data in DynamoDB console or application"
echo -e "  2. If restoring users, they will need to reset passwords"
echo -e "  3. Run: ${BLUE}./scripts/validate-deployment.sh${NC}"
