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

## Getting Started

### Prerequisites

- Node.js 20.9.0
- An Azure OpenAI resource with image, text, and video deployments
- An Azure Storage account

### Environment Variables

Create a `.env.local` file:

```env
# ─── Auth ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_AUTH=true                          # Set to false to disable auth locally
NEXT_PUBLIC_AUTH_URL=https://your-auth-server  # External auth service URL
NEXT_PUBLIC_APP_URL=https://your-app-url       # This app's public URL (used in auth redirect)

# ─── Azure OpenAI ────────────────────────────────────────────────────────────
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/openai/v1/
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1
AZURE_OPENAI_TEXT_DEPLOYMENT=gpt-4o
AZURE_OPENAI_VIDEO_DEPLOYMENT=sora

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

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app is deployed as an [Azure Static Web App](https://azure.microsoft.com/en-us/products/app-service/static) with a Node.js API backend.

```powershell
# Build and zip-deploy
./deploy-zip.ps1
```

To enable Blob Storage access from the deployed app, assign the `Storage Blob Data Contributor` role to the Static Web App's managed identity:

```bash
./enable-blob-rbac.sh
```

## Project Structure

```
pages/
  index.js              # Home — campaign type picker + recent generations
  image.js              # Image projects list
  video.js              # Video projects list
  image/[projectId].js  # Image generation workspace
  video/[projectId].js  # Video generation workspace
  assets.js             # Asset library
  api/                  # Next.js API routes (OpenAI + Blob Storage calls)
components/             # Shared UI components and ad format previews
guidelines/             # Per-format generation guidelines (Markdown)
store/                  # Zustand stores (image, video, marketing studio settings)
hooks/                  # useAuth, useSamples, useImageDimensions, etc.
```


Build the app before deploying:

```bash
npm run build
```

Deploy using the [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/):

```bash
npx swa deploy ./out --app-name zava-marketing-studio
```

Or connect the repository to Azure Static Web Apps via the [Azure Portal](https://portal.azure.com) for automatic CI/CD on every push.
