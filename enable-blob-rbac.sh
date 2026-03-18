#!/bin/bash

# Setup Blob Access with RBAC for Zava Marketing Studio
# This grants your Azure identity permission to read blobs

set -e

echo "🔐 Setting up Blob Storage Access (RBAC)"
echo "========================================="
echo ""

STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT_NAME:-${1:-}}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-${2:-}}"

if [[ -z "$STORAGE_ACCOUNT" ]]; then
    read -rp "Storage account name: " STORAGE_ACCOUNT
fi
if [[ -z "$RESOURCE_GROUP" ]]; then
    read -rp "Resource group name: " RESOURCE_GROUP
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Running 'az login'..."
    az login
fi

echo "✓ Logged in to Azure"
echo ""

# Get current user
USER_ID=$(az ad signed-in-user show --query id -o tsv)
USER_EMAIL=$(az ad signed-in-user show --query userPrincipalName -o tsv)

echo "👤 Current user: $USER_EMAIL"
echo ""

# Get storage account resource ID
STORAGE_ID=$(az storage account show \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query id -o tsv)

echo "📦 Assigning 'Storage Blob Data Reader' role..."
if az role assignment create \
    --role "Storage Blob Data Reader" \
    --assignee $USER_ID \
    --scope $STORAGE_ID \
    --output none 2>/dev/null; then
    echo "✓ Role assigned"
else
    echo "✓ Role already assigned"
fi

echo ""
echo "📦 Assigning 'Storage Blob Data Contributor' role..."
if az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee $USER_ID \
    --scope $STORAGE_ID \
    --output none 2>/dev/null; then
    echo "✓ Role assigned"
else
    echo "✓ Role already assigned"
fi

echo ""
echo "✅ Done! You now have access to blob storage."
echo ""
echo "🔄 Restart your dev server:"
echo "   pkill -f 'next dev' && npm run dev"
echo ""
