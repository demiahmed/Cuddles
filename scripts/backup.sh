#!/bin/sh
set -e

SRC_DB="/app/instance/menses.db"
BACKUP_DIR="/app/instance/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if source database exists
if [ ! -f "$SRC_DB" ]; then
    echo "Warning: Source database not found at $SRC_DB"
    exit 1
fi

# Create backup with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/menses_${TIMESTAMP}.db"

# Copy database file
cp "$SRC_DB" "$BACKUP_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup created: $BACKUP_FILE"

# Clean up old backups (keep only files from last N days)
if [ "$RETENTION_DAYS" -gt 0 ]; then
    OLD_BACKUPS=$(find "$BACKUP_DIR" -name "menses_*.db" -mtime +$RETENTION_DAYS 2>/dev/null || true)
    if [ -n "$OLD_BACKUPS" ]; then
        echo "$OLD_BACKUPS" | while read -r old_backup; do
            rm -f "$old_backup"
            echo "$(date '+%Y-%m-%d %H:%M:%S') - Removed old backup: $old_backup"
        done
    fi
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed successfully"