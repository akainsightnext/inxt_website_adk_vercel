# Next.js Frontend Deployment Guide - Vercel

## Overview
This guide explains how to deploy your Next.js frontend to Vercel and configure it to connect to your deployed ADK agent backend. The frontend automatically detects the deployment environment and configures endpoints accordingly.

## Prerequisites

### 1. Vercel Account Setup
1. Go to [vercel.com](https://vercel.com) and sign up/sign in
2. Connect your GitHub/GitLab/Bitbucket account


### 2. Backend Deployment
Your Next.js frontend needs a backend to connect to:
- **Agent Engine** - Follow the [ADK Deployment Guide](./ADK_DEPLOYMENT_GUIDE.md)


## Environment Variables by Deployment Type

The frontend automatically detects which backend type to use based on available environment variables. Here's what you need for each deployment scenario:

### 🚀 Agent Engine Backend (Recommended)

**Required Variables:**
```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=explore-demo-429117
REASONING_ENGINE_ID=2397889724644589568
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiZXhwbG9yZS1kZW1vLTQyOTExNyIsCiAgInByaXZhdGVfa2V5X2lkIjogIjQ5YTI5NGQ0ODQxMDU5M2MwNzY1MmRlMTE0MzlhN2M5YTUyMjQ4M2IiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQ2tCWWRqcTV2dEVGQnpcbmhWbGZSSkdoUnJpSDVteitINzl1T2NheE5Eb2pWZy91aXRoT1huTGRZV1pYVkpiKzBQVWwzY01KTnpOc0p1MFFcbmFyMW4yYWhYbEpsVkZTdXlpVlRCYlFNOUlpeWdMS0Ixc2FDMkVOVEhIQzVTZnZXM3ZnQ3YzUE91RG9SVHdGWVFcblZuWFFteDMvWDkyc3lvdU9rd1lPV0owYk9zVWw3aEphV3ZkYUhGRnB5RG5CL2VRQXNkUW02dXEycnUyWEhaNDVcbk45UHhhcVBHMGZ6T21BalhsYVRLeHJSckhQK1h4eDFqRGozLzBMVkZCNVU3bmdCU01FbFRTcW9nb2FYY3lvYS9cbk4xSCtLU3NGRXNBd1B1VTQ5OXQ2Nkc0UmhRckVQKzRnU2ptUVNIdnRVNk42OE5Gc1NUME9uQ0kvWE9nSDY2RUVcbjl3QlBCK1R0QWdNQkFBRUNnZ0VBS1V3dkU1eGd6U2FmYXdhM1F2SnJ6SFNXLzdpMzFxQTl2YzRVUmdmRlg2SktcbnJxQU02R2FGZTFJTHg0OUgyVzdaV3Foa2RBeVBDUHNnRTFNY3oyb1JKY1FIZTFHeVIraW1DM0djTUNkTG55UzlcblhnVFVWeU1Udi9KTGczL3Q5RTZGczhIcEpQa0l2bUdlQ2MwTEt2UHpjSm85b1VUNk1ISzZRcUJ6SmlqOC9KaDFcbjluUDJnczRsSnQwanpoZHNjVVJ1Wit2UXU5ZFRuVkNLcVJkUG9YYkdxcGNFTk9ObEpxY1duSjdkK0hjeHNPc0ZcbkhZVHBaeCsrdXhId3pJbUxYOWJnaVBDNXl0NzM3aVZFSzhkL2dEb2pkQ3pyMlcvQnF2MHBidkhLMXhDcnBPeklcbkxYZ2RFMnNmTHNycDZYUXFuUFZ4Z0lBUWJpcEM4bW56eUZjMmE1S3dUUUtCZ1FEbE1sKzFWU3pZMEJ1dmpZQ3NcbkdqUFV5UXA2SWVXcFRJT2U3YzR0U2Z3aW1CZmVndGNXVk1ITmVQUW9Ea1M3aWlIUW1Oa0hZLzVFVVVzclhPKzlcblpQaHNkVHdVMlp3NnUrSVhFWm50L1dDMzkzNkpsQVpwMHB1ME8xeWVyTFZJVzRORkYxVDVidHZWVDJGdmxoQWNcblV5Q2M0RVp3anpkQWxuemJaenRSUTNlRFF3S0JnUUMzTS9Xb1pySWc2ZkNqQ2ltdWV2TWFsck9yemVTZ2M0NkFcbmFOZjJHeFZ6ZGxoMXBIUmlVanU0VzViSFE5VlV5cGtIRjNmZEUxdFRTckxBRHpRdWRScHhKN0xwN2VGVjQwaFBcbkpPaWhWY0tMSUZCMlhqdGhybVVsSHdKamVxbkZCWlE2aWZSRHdLeTdFT2VvV29GYkpScVFEQTRZMnFFNUdIWFRcbjdtUS8xN2E4RHdLQmdIZWF5Z2MrNDZCaE9aRnJMbktoV2RyNDd0YTlTYlFIa2NnbUlTblJLaHFEZERGUjVoeHBcbkxwbWpQUWFLSzZRU2VZTDV3SWZ5em9Xb1JxbmlYZGxnRDZQSnFnalhab2ZmOUNSRnN5Wld5MW8xZFhzbUhCS3RcbkxVUG9sblRYZStLK25zbzNXc2l2NlZodmpGRkc1akZoeitzTnZyU09pQzdVV1dQRmcxYnM5amt4QW9HQkFJNVlcblgvSjF3TWZVSFRZQkNudllhaFZwckxhNzVuMUk3QnNYMjEwTWxERS9iZUlTWXArV2QzSjZMNEFxVTVKclRGVjNcblJablBsWEQxSkVnWVNCb2t3T1BVemEzM045Tk5JbnprRjZCcml4b2doSVJFR1cxL1hIVm9UNm5Od0NVbWZaS3lcblo4bFE1cVQrc0pCZHFnNlFtTC85cmVKZjFVOFFrMVNVOE8ydUJQeS9Bb0dBUngvODR3cmN3d2oxS3pnNjFrb2NcbmxXQ2NSdlhWWTh0WS9Rb2VReE92MUc3Z21uNnZBWnJ0dDZ0bzQ3ZG5DYTlNcUlVT3R6WlhtWmhyRkF6S2VmNjlcblE2RzhlbDdPSGFyM1VMcllXTmxDOEo3ZldIdnh6bkZxN2lqOW5jYVZtSlp3N3hqMVJLd1NDVElOMXNuWGoyUnJcbktqSjJCV3Q2Q05Ccnp6bFpkK3NlLzNBPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogInZlcnRleC1haS1jaGF0Ym90QGV4cGxvcmUtZGVtby00MjkxMTcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTEwMzkzNDA2NzE1MzgzNDMyOTQ3IiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS92ZXJ0ZXgtYWktY2hhdGJvdCU0MGV4cGxvcmUtZGVtby00MjkxMTcuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJ1bml2ZXJzZV9kb21haW4iOiAiZ29vZ2xlYXBpcy5jb20iCn0K
ADK_APP_NAME=InsightNext_Website_Agent
AGENT_ENGINE_ENDPOINT=https://us-central1-aiplatform.googleapis.com/v1/projects/explore-demo-429117/locations/us-central1/reasoningEngines/2397889724644589568
GOOGLE_CLOUD_LOCATION=us-central1
```

**How to get these values:**
1. **GOOGLE_CLOUD_PROJECT**: Your Google Cloud project ID
2. **REASONING_ENGINE_ID**: From your ADK deployment output (e.g., `projects/123/locations/us-central1/reasoningEngines/abc123` → use `abc123`)
3. **GOOGLE_CLOUD_LOCATION**: Region where you deployed your agent (default: `us-central1`)
4. **GOOGLE_SERVICE_ACCOUNT_KEY_BASE64**: Base64-encoded service account key (see setup instructions below)

## Service Account Setup for Agent Engine

If you're using Agent Engine backend, you need to create a Google Cloud service account and configure authentication. This is required for the frontend to authenticate with Google Cloud's Vertex AI API.

### Step 1: Create Service Account

1. **Go to Google Cloud Console:**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project (the same one where you deployed your ADK agent)

2. **Navigate to Service Accounts:**
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **"Create Service Account"**

3. **Configure Service Account:**
   - **Service account name**: `agent-engine-frontend` (or any descriptive name)
   - **Service account ID**: Will be auto-generated
   - **Description**: `Service account for frontend to access Agent Engine`
   - Click **"Create and Continue"**

4. **Add Required Roles:**
   Add these roles to your service account:
   - **Vertex AI User** (`roles/aiplatform.user`) - Required for Agent Engine API access
   - **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`) - Required for token generation
   
   Click **"Continue"** then **"Done"**

### Step 2: Generate Service Account Key

1. **Access Service Account:**
   - In the Service Accounts list, click on the service account you just created
   - Go to the **"Keys"** tab

2. **Create New Key:**
   - Click **"Add Key"** → **"Create new key"**
   - Select **"JSON"** as the key type
   - Click **"Create"**

3. **Download Key:**
   - The JSON key file will be automatically downloaded to your computer
   - **Important**: Store this file securely and never commit it to version control

### Step 3: Convert JSON Key to Base64

You need to convert the JSON key to base64 for safe storage in environment variables.

**Option A: Using Terminal/Command Line (Recommended)**

```bash
# On macOS/Linux
cat path/to/your-service-account-key.json | base64

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content path/to/your-service-account-key.json -Raw)))
```

**Option B: Using Node.js**

```javascript
const fs = require('fs');
const keyFile = fs.readFileSync('path/to/your-service-account-key.json', 'utf8');
const base64Key = Buffer.from(keyFile).toString('base64');
console.log(base64Key);
```

**Option C: Using Online Tool**

1. Go to [base64encode.org](https://www.base64encode.org/)
2. Copy the entire contents of your JSON key file
3. Paste it into the encoder
4. Copy the base64 output


**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add a new environment variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`
   - **Value**: The base64 string you generated
   - **Environments**: Select Production, Preview, and Development


## Deploy via Vercel Dashboard (Recommended)

1. **Import Your Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the `nextjs` folder as the root directory

2. **Configure Build Settings:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `nextjs`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (uses default)

3. **Set Environment Variables:**
   - In project settings, go to "Environment Variables"
   - Add your variables based on your backend type (see sections above)
   - Set for "Production", "Preview", and "Development" as needed

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app

