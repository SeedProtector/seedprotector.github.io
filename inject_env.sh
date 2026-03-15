#!/usr/bin/env bash
# ============================================================
# inject_env.sh — 将环境变量注入到 web/data/site.json
# ============================================================
# 用法:
#   bash scripts/tools/inject_env.sh              # 从 .env 文件读取
#   bash scripts/tools/inject_env.sh --env-only   # 仅从系统环境变量读取
#
# 支持的环境变量:
#   SEED_CONTACT_EMAIL       → site.json: links.email
#   SEED_EMAILJS_PUBLIC_KEY  → site.json: emailjs.publicKey
#   SEED_EMAILJS_SERVICE_ID  → site.json: emailjs.serviceId
#   SEED_EMAILJS_TEMPLATE_ID → site.json: emailjs.templateId
#
# 优先级: 系统环境变量 > .env 文件 > site.json 中现有值
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SITE_JSON="$PROJECT_ROOT/data/site.json"
ENV_FILE="$PROJECT_ROOT/.env"

# ---- Color helpers ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[inject_env]${NC} $*"; }
ok()    { echo -e "${GREEN}[inject_env]${NC} $*"; }
warn()  { echo -e "${YELLOW}[inject_env]${NC} $*"; }
err()   { echo -e "${RED}[inject_env]${NC} $*" >&2; }

# ---- Check dependencies ----
if ! command -v python3 &>/dev/null; then
  err "python3 is required but not found. Please install Python 3."
  exit 1
fi

# ---- Check site.json exists ----
if [ ! -f "$SITE_JSON" ]; then
  err "site.json not found at: $SITE_JSON"
  exit 1
fi

# ---- Parse flags ----
ENV_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --env-only) ENV_ONLY=true ;;
    -h|--help)
      echo "Usage: $0 [--env-only]"
      echo ""
      echo "Options:"
      echo "  --env-only   Only read from system environment variables (skip .env file)"
      echo "  -h, --help   Show this help message"
      echo ""
      echo "Environment variables:"
      echo "  SEED_CONTACT_EMAIL        Contact email address"
      echo "  SEED_EMAILJS_PUBLIC_KEY   EmailJS public key"
      echo "  SEED_EMAILJS_SERVICE_ID   EmailJS service ID"
      echo "  SEED_EMAILJS_TEMPLATE_ID  EmailJS template ID"
      exit 0
      ;;
  esac
done

# ---- Load .env file if not --env-only ----
if [ "$ENV_ONLY" = false ] && [ -f "$ENV_FILE" ]; then
  info "Loading .env file: $ENV_FILE"
  # Source .env but don't override existing env vars
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    # Trim whitespace
    key="$(echo "$key" | xargs)"
    value="$(echo "$value" | xargs)"
    # Remove surrounding quotes from value
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    # Only set if not already in environment (env vars take precedence)
    if [ -z "${!key:-}" ]; then
      export "$key=$value"
    fi
  done < "$ENV_FILE"
elif [ "$ENV_ONLY" = false ] && [ ! -f "$ENV_FILE" ]; then
  warn ".env file not found at $ENV_FILE — using system environment variables only"
fi

# ---- Collect values ----
CONTACT_EMAIL="${SEED_CONTACT_EMAIL:-}"
EMAILJS_PUBLIC_KEY="${SEED_EMAILJS_PUBLIC_KEY:-}"
EMAILJS_SERVICE_ID="${SEED_EMAILJS_SERVICE_ID:-}"
EMAILJS_TEMPLATE_ID="${SEED_EMAILJS_TEMPLATE_ID:-}"

# ---- Check if any values are set ----
if [ -z "$CONTACT_EMAIL" ] && [ -z "$EMAILJS_PUBLIC_KEY" ] && [ -z "$EMAILJS_SERVICE_ID" ] && [ -z "$EMAILJS_TEMPLATE_ID" ]; then
  warn "No email environment variables found. site.json will not be modified."
  warn "Set variables in .env or export them before running this script."
  warn "See .env.example for available variables."
  exit 0
fi

# ---- Inject into site.json using Python ----
info "Injecting environment variables into: $SITE_JSON"

export SITE_JSON
export SEED_CONTACT_EMAIL="${CONTACT_EMAIL}"
export SEED_EMAILJS_PUBLIC_KEY="${EMAILJS_PUBLIC_KEY}"
export SEED_EMAILJS_SERVICE_ID="${EMAILJS_SERVICE_ID}"
export SEED_EMAILJS_TEMPLATE_ID="${EMAILJS_TEMPLATE_ID}"

python3 << 'PYTHON_SCRIPT'
import json
import os
import sys

site_json_path = os.environ.get('SITE_JSON', '')
if not site_json_path:
    print("[inject_env] ERROR: SITE_JSON path not set", file=sys.stderr)
    sys.exit(1)

# Read current site.json
with open(site_json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

changes = []

# Inject contact email
contact_email = os.environ.get('SEED_CONTACT_EMAIL', '')
if contact_email:
    if 'links' not in data:
        data['links'] = {}
    old_val = data['links'].get('email', '')
    data['links']['email'] = contact_email
    if old_val != contact_email:
        changes.append(f"  links.email: '{old_val}' → '{contact_email}'")

# Inject EmailJS config
emailjs_fields = {
    'SEED_EMAILJS_PUBLIC_KEY': 'publicKey',
    'SEED_EMAILJS_SERVICE_ID': 'serviceId',
    'SEED_EMAILJS_TEMPLATE_ID': 'templateId',
}

if 'emailjs' not in data:
    data['emailjs'] = {}

for env_key, json_key in emailjs_fields.items():
    env_val = os.environ.get(env_key, '')
    if env_val:
        old_val = data['emailjs'].get(json_key, '')
        data['emailjs'][json_key] = env_val
        # Mask the value for display (show first 4 chars + ***)
        masked = env_val[:4] + '***' if len(env_val) > 4 else env_val
        if old_val != env_val:
            changes.append(f"  emailjs.{json_key}: → '{masked}'")

# Write back
with open(site_json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')

# Report
if changes:
    print(f"[inject_env] Updated {len(changes)} field(s):")
    for c in changes:
        print(c)
else:
    print("[inject_env] No changes needed — values already match.")
PYTHON_SCRIPT

ok "Done! site.json has been updated."
echo ""
info "Tip: Remember to NOT commit site.json with real credentials."
info "     You can add 'data/site.json' to .gitignore if needed."
