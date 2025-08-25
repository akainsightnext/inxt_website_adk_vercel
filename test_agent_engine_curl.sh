#!/bin/bash

# Test Agent Engine Streaming Endpoint
echo "🧪 Testing Agent Engine Streaming Endpoint"
echo "=========================================="

# Get access token
echo "🔑 Getting access token..."
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get access token. Please run: gcloud auth login"
    exit 1
fi

echo "✅ Access token obtained"

# Test 1: Non-streaming endpoint first
echo ""
echo "1️⃣ Testing non-streaming endpoint..."
echo ""

curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/explore-demo-429117/locations/us-central1/reasoningEngines/2397889724644589568:query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "What services does InsightNext offer?",
      "user_id": "test-user-123",
      "session_id": "test-session-456"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "2️⃣ Testing streaming endpoint..."
echo ""

# Test 2: Streaming endpoint
curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/explore-demo-429117/locations/us-central1/reasoningEngines/2397889724644589568:streamQuery?alt=sse" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "What services does InsightNext offer?",
      "user_id": "test-user-123",
      "session_id": "test-session-456"
    }
  }' \
  --no-buffer \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Test completed!"
