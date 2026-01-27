# IPS-ERP Makefile
# Common automation targets for development and operations

.PHONY: help install bootstrap deploy backup restore validate clean dev test lint build

# Default target
help:
	@echo "IPS-ERP Automation Targets"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run linter"
	@echo "  make build       - Build for production"
	@echo ""
	@echo "Deployment:"
	@echo "  make bootstrap   - Bootstrap new AWS account"
	@echo "  make deploy-dev  - Deploy to development"
	@echo "  make deploy-staging - Deploy to staging"
	@echo "  make deploy-prod - Deploy to production"
	@echo "  make validate    - Validate deployment"
	@echo ""
	@echo "Data Operations:"
	@echo "  make backup      - Export data backup"
	@echo "  make restore     - Restore from backup (requires MANIFEST=path)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make sandbox     - Start Amplify sandbox"

# ─────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────

install:
	npm install --legacy-peer-deps

dev:
	npm run dev

test:
	npm run test

lint:
	npm run lint

build:
	npm run build

# ─────────────────────────────────────────────────────────────
# Deployment
# ─────────────────────────────────────────────────────────────

bootstrap:
	chmod +x scripts/bootstrap-new-account.sh
	./scripts/bootstrap-new-account.sh

deploy-dev:
	chmod +x scripts/deploy-all.sh
	./scripts/deploy-all.sh dev

deploy-staging:
	chmod +x scripts/deploy-all.sh
	./scripts/deploy-all.sh staging

deploy-prod:
	chmod +x scripts/deploy-all.sh
	./scripts/deploy-all.sh prod

validate:
	chmod +x scripts/validate-deployment.sh
	./scripts/validate-deployment.sh

sandbox:
	npx ampx sandbox

# ─────────────────────────────────────────────────────────────
# Data Operations
# ─────────────────────────────────────────────────────────────

backup:
	chmod +x scripts/backup-export.sh
	./scripts/backup-export.sh --env production --output ./backups

restore:
ifndef MANIFEST
	$(error MANIFEST is required. Usage: make restore MANIFEST=./backups/backup-manifest.json)
endif
	chmod +x scripts/restore-import.sh
	./scripts/restore-import.sh --manifest $(MANIFEST)

restore-dry-run:
ifndef MANIFEST
	$(error MANIFEST is required. Usage: make restore-dry-run MANIFEST=./backups/backup-manifest.json)
endif
	chmod +x scripts/restore-import.sh
	./scripts/restore-import.sh --manifest $(MANIFEST) --dry-run

# ─────────────────────────────────────────────────────────────
# Maintenance
# ─────────────────────────────────────────────────────────────

clean:
	rm -rf dist
	rm -rf node_modules/.cache
	rm -rf .amplify/generated
	rm -f amplify_outputs.json

clean-all: clean
	rm -rf node_modules
	rm -rf backups

# ─────────────────────────────────────────────────────────────
# Portability Verification
# ─────────────────────────────────────────────────────────────

check-hardcoded:
	@echo "Checking for hardcoded AWS account IDs..."
	@grep -rn "arn:aws" --include="*.ts" --include="*.json" . | grep -v node_modules | grep -v ".amplify" || echo "No hardcoded ARNs found"
	@grep -rn "[0-9]\{12\}" --include="*.ts" --include="*.json" . | grep -v node_modules | grep -v ".amplify" | grep -v package-lock || echo "No 12-digit IDs found"

verify-gitignore:
	@echo "Verifying sensitive files are gitignored..."
	@git status --porcelain | grep amplify_outputs.json && echo "WARNING: amplify_outputs.json not ignored!" || echo "OK: amplify_outputs.json is ignored"
