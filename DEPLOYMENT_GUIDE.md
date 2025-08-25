# Chat Application Deployment Guide

## Overview
This guide covers how to deploy and embed the Next.js chat application into your existing website.

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Step 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from the nextjs directory
cd nextjs
vercel

# Follow the prompts to connect to your Vercel account
# Choose your project settings
```

#### Step 2: Configure Environment Variables
In your Vercel dashboard, add these environment variables:
```
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your_base64_encoded_key
RAG_CORPUS_NAME=your_rag_corpus_name
GOOGLE_CLOUD_PROJECT=your_project_id
```

#### Step 3: Update Embed URLs
Replace `http://localhost:3000` with your Vercel URL:
```html
<iframe src="https://your-app.vercel.app" width="100%" height="600px"></iframe>
```

### 2. Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

#### Step 2: Build and Run
```bash
# Build the image
docker build -t chat-app .

# Run the container
docker run -p 3000:3000 \
  -e GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your_key \
  -e RAG_CORPUS_NAME=your_corpus \
  -e GOOGLE_CLOUD_PROJECT=your_project \
  chat-app
```

### 3. Traditional Server Deployment

#### Step 1: Build for Production
```bash
cd nextjs
npm run build
npm start
```

#### Step 2: Use PM2 for Process Management
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "chat-app" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Embedding Methods

### Method 1: Iframe Embed (Simplest)

#### Basic Iframe
```html
<iframe 
  src="https://your-chat-app.com" 
  width="100%" 
  height="600px"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);"
  title="AI Chat Assistant">
</iframe>
```

#### Floating Chat Widget
```html
<style>
.floating-chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  z-index: 1000;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
</style>

<iframe 
  src="https://your-chat-app.com" 
  class="floating-chat"
  title="AI Chat Assistant">
</iframe>
```

### Method 2: API Integration (More Control)

#### JavaScript Integration
```javascript
// Configuration
const API_BASE_URL = 'https://your-chat-app.com/api';
const USER_ID = 'website-user-' + Date.now();
const SESSION_ID = 'session-' + Date.now();

// Send message function
async function sendMessage(message) {
  const response = await fetch(`${API_BASE_URL}/run_sse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      userId: USER_ID,
      sessionId: SESSION_ID
    })
  });
  
  // Process streaming response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Process the streaming data
    console.log(chunk);
  }
}
```

### Method 3: React Component Integration

#### Create a React Component
```jsx
import React, { useState, useEffect } from 'react';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('https://your-chat-app.com/api/run_sse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: 'react-user',
          sessionId: 'session-' + Date.now()
        })
      });
      
      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.textDelta) {
                aiResponse += data.textDelta;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.sender === 'ai') {
                    lastMessage.text = aiResponse;
                  } else {
                    newMessages.push({ text: aiResponse, sender: 'ai' });
                  }
                  return [...newMessages];
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="loading">AI is thinking...</div>}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
```

## Security Considerations

### 1. CORS Configuration
Update your Next.js configuration to allow your domain:
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-website.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

### 2. Rate Limiting
Consider implementing rate limiting to prevent abuse:
```javascript
// Add to your API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export default function handler(req, res) {
  limiter(req, res, () => {
    // Your API logic here
  });
}
```

### 3. Authentication (Optional)
For more secure integration, consider adding authentication:
```javascript
// Add API key validation
const API_KEY = process.env.CHAT_API_KEY;

export default function handler(req, res) {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Your API logic here
}
```

## Performance Optimization

### 1. CDN Integration
Use a CDN like Cloudflare for better global performance.

### 2. Caching
Implement caching for static assets and API responses.

### 3. Compression
Enable gzip compression in your server configuration.

## Monitoring and Analytics

### 1. Error Tracking
Integrate error tracking services like Sentry:
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### 2. Analytics
Add analytics to track chat usage:
```javascript
// Google Analytics
gtag('event', 'chat_started', {
  'event_category': 'engagement',
  'event_label': 'chat_widget'
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your domain is whitelisted in CORS configuration
2. **Authentication Errors**: Check your Google Cloud credentials
3. **Streaming Issues**: Verify the API endpoint is accessible
4. **Performance Issues**: Consider using a CDN and optimizing images

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=* npm run dev
```

## Support

For additional support:
- Check the application logs
- Verify environment variables
- Test the API endpoints directly
- Review the browser console for errors
