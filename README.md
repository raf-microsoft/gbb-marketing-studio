<img src="frontend/public/logo.svg" alt="Zava" width="200"/>

# Zava Marketing Studio

An internal AI-powered creative tool for generating and managing marketing image and video assets, built on Azure OpenAI and Azure Blob Storage.

## Features

- **Image generation** — Generate social ads, banners, thumbnails, and rebrand assets using Azure OpenAI (`gpt-image-1.5`) with format-specific guidelines (Facebook Ad, Instagram Post, Banner, Thumbnail, Rebrand, Custom)
- **Image refinement** — Iteratively refine generated images with inpainting/masking support
- **Video generation** — Generate short-form video ads (Facebook Reel, Instagram Story, YouTube Short, Banner, Custom) using Azure OpenAI (`Sora 2`)
- **Ad copy generation** — Generate text copy for each ad format alongside visuals
- **Asset library** — Browse, upload, and manage reusable brand assets stored in Azure Blob Storage
- **Project management** — Organise generations into named projects per format
- **Authentication** — Token-based auth with redirect to external auth service

## Architecture

```
Browser → Frontend (Next.js :3000) → Backend (Express :4000) → Azure OpenAI + Storage
                                              ↓
                                      Entra ID (Managed Identity)
```

- **Backend**: Lightweight Express proxy that uses Entra ID for authentication
- **Frontend**: Next.js app for UI and API routes
- **Authentication**: DefaultAzureCredential (Azure CLI locally, Managed Identity in production)

## Stack

| Concern | Library |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 |
| UI Components | [Radix Themes](https://www.radix-ui.com/themes) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs) |
| Icons | [Tabler Icons](https://tabler.io/icons) |
| Notifications | [React Toastify](https://fkhadra.github.io/react-toastify) |
| AI | [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) |
| Storage | [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) |

## Quick Start

```bash
./startdev.sh
```

This will:
1. Install dependencies (first run only)
2. Start backend on http://localhost:4000
3. Start frontend on http://localhost:3000

## Local Development Setup

### Prerequisites

- Node.js 20.9.0
- An Azure OpenAI resource with image, text, and video deployments
- An Azure Storage account

1. **Login to Azure CLI:**
   ```bash
   az login
   ```

2. **Grant yourself RBAC permissions:**
   ```bash
   # For blob storage
   ./enable-blob-rbac.sh

   # For Azure OpenAI (if not already assigned)
   az role assignment create \
     --role "Cognitive Services OpenAI User" \
     --assignee $(az ad signed-in-user show --query id -o tsv) \
     --scope /subscriptions/<subscription-id>/resourceGroups/<rg>/providers/Microsoft.CognitiveServices/accounts/<openai-resource>
   ```

3. **Start the app:**
   ```bash
   ./startdev.sh
   ```

## Configuration

**Backend** (`backend/.env`):
- `PORT`: Backend port (default: 4000)
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI resource endpoint
- `AZURE_STORAGE_ACCOUNT_NAME`: Storage account name

**Frontend** (`frontend/.env.local`):

```env
# ─── Auth ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_AUTH=true                          # Set to false to disable auth locally
NEXT_PUBLIC_AUTH_URL=https://your-auth-server  # External auth service URL
NEXT_PUBLIC_APP_URL=https://your-app-url       # This app's public URL (used in auth redirect)

# ─── Azure OpenAI ────────────────────────────────────────────────────────────
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/openai/v1/
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1.5
AZURE_OPENAI_TEXT_DEPLOYMENT=gpt-5.4
AZURE_OPENAI_VIDEO_DEPLOYMENT=sora-2

# API key auth (leave empty to use DefaultAzureCredential / az login)
# AZURE_OPENAI_API_KEY=your-api-key-here

# ─── Azure Storage ───────────────────────────────────────────────────────────
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account

# Storage key auth (leave empty to use DefaultAzureCredential / az login)
# AZURE_STORAGE_ACCOUNT_KEY=your-storage-key-here
```

### Authentication

When `NEXT_PUBLIC_AUTH=true`, the app validates a session token on load. If no valid token is found, the user is redirected to `NEXT_PUBLIC_AUTH_URL` for login. Set `NEXT_PUBLIC_AUTH=false` for local development to bypass this.

### Azure Identity

By default the app uses `DefaultAzureCredential` from `@azure/identity` for both Azure OpenAI and Azure Storage — meaning it will use `az login` credentials locally and managed identity in production. To use key-based auth instead, set the corresponding `*_API_KEY` / `*_ACCOUNT_KEY` env vars.

## Project Structure

```
backend/
  server.js             # Express proxy server
  routes/               # Route handlers (image, video, storage, health)
  utils/auth.js         # DefaultAzureCredential setup
frontend/
  pages/
    index.js            # Home — campaign type picker + recent generations
    image.js            # Image projects list
    video.js            # Video projects list
    image/[projectId].js  # Image generation workspace
    video/[projectId].js  # Video generation workspace
    assets.js           # Asset library
    api/                # Next.js API routes (OpenAI + Blob Storage calls)
  components/           # Shared UI components and ad format previews
  guidelines/           # Per-format generation guidelines (Markdown)
  store/                # Zustand stores (image, video, marketing studio settings)
  hooks/                # useAuth, useSamples, useImageDimensions, etc.
```

## Deployment

Deploy as an Azure Web App with managed identity:
1. Enable system-assigned managed identity on the Web App
2. Grant the managed identity these RBAC roles:
   - `Cognitive Services OpenAI User` on the Azure OpenAI resource
   - `Storage Blob Data Contributor` on the Storage account
3. Configure environment variables
4. Deploy both frontend and backend together

To enable Blob Storage access from the deployed app:

```bash
./enable-blob-rbac.sh
```

No API keys needed — all authentication via Entra ID. 🔐
