#!/bin/bash

# Test Agent Engine Streaming Endpoint with detailed output
echo "🧪 Testing Agent Engine Streaming Endpoint (Detailed)"
echo "===================================================="

# Get access token
echo "🔑 Getting access token..."
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ $? -ne 0 ]; then
    echo "❌ Failed to get access token. Please run: gcloud auth login"
    exit 1
fi

echo "✅ Access token obtained"

# Test streaming endpoint with verbose output
echo ""
echo "🚀 Testing streaming endpoint with verbose output..."
echo ""

curl -X POST "https://us-central1-aiplatform.googleapis.com/v1/projects/explore-demo-429117/locations/us-central1/reasoningEngines/2397889724644589568:streamQuery?alt=sse" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "input": {
      "message": "What services does InsightNext offer?",
      "user_id": "test-user-123",
      "session_id": "test-session-456"
    }
  }' \
  --no-buffer \
  -v \
  -w "\n\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"

echo ""
echo "✅ Test completed!"
