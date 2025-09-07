import { NextRequest, NextResponse } from 'next/server';
import { ModelArmorClient } from '../../../lib/model-armor-client';
import { getTemplates, isModelArmorEnabled } from '../model-armor/config';
import { shouldUseAgentEngine, getEndpointForPath, getAuthHeaders } from '@/lib/config';
import { formatLocalBackendPayload, formatAgentEnginePayload } from '@/lib/handlers/run-sse-common';

// Initialize Model Armor client
const modelArmorClient = new ModelArmorClient();

export async function POST(req: NextRequest) {
  try {
    const { 
      message, 
      safetyProfile = 'balanced',
      sessionId,
      userId,
      ...context 
    } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }
    
    let sanitizedInput = message;
    let promptSafety = null;
    let responseSafety = null;
    
    // Step 1: Sanitize user input
    if (isModelArmorEnabled()) {
      const templates = getTemplates(safetyProfile);
      
      promptSafety = await modelArmorClient.sanitizePrompt(message, templates.prompt);
      
      if (promptSafety.blocked) {
        return NextResponse.json({
          response: "I cannot process that request due to safety concerns. Please rephrase your question.",
          blocked: true,
          reason: 'unsafe_prompt',
          safetyDetails: {
            prompt: promptSafety.details,
            response: null
          }
        });
      }
      
      sanitizedInput = promptSafety.sanitizedText || message;
    }
    
    // Step 2: Generate AI response using your existing logic
    let aiResponse;
    try {
      // Here you would integrate with your existing AI generation logic
      // For now, I'll create a placeholder that you can replace
      aiResponse = await generateAIResponse(sanitizedInput, { sessionId, userId, ...context });
      
    } catch (error) {
      console.error('AI generation failed:', error);
      return NextResponse.json({
        response: "I'm experiencing technical difficulties. Please try again later.",
        blocked: true,
        reason: 'generation_error',
        error: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
    
    // Step 3: Sanitize AI response
    if (isModelArmorEnabled()) {
      const templates = getTemplates(safetyProfile);
      
      responseSafety = await modelArmorClient.sanitizeResponse(aiResponse, templates.response);
      
      if (responseSafety.blocked) {
        return NextResponse.json({
          response: "I apologize, but I cannot provide that response due to safety policies.",
          blocked: true,
          reason: 'unsafe_response',
          safetyDetails: {
            prompt: promptSafety?.details || null,
            response: responseSafety.details
          }
        });
      }
    }
    
    // Step 4: Return safe response
    return NextResponse.json({
      response: aiResponse,
      blocked: false,
      safetyDetails: {
        prompt: promptSafety?.details || null,
        response: responseSafety?.details || null
      },
      metadata: {
        sanitizedInput: sanitizedInput !== message,
        safetyProfile,
        modelArmor: {
          enabled: isModelArmorEnabled(),
          templates: isModelArmorEnabled() ? getTemplates(safetyProfile) : null
        }
      }
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: 'I apologize, but I encountered an error. Please try again.'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Generate AI response using your existing backend logic
 * Integrates with your ADK local backend or Agent Engine
 */
async function generateAIResponse(prompt: string, context: { sessionId: string; userId: string }): Promise<string> {
  const requestData = {
    message: prompt,
    userId: context.userId,
    sessionId: context.sessionId,
  };

  try {
    if (shouldUseAgentEngine()) {
      // Use Agent Engine for AI generation
      return await callAgentEngine(requestData);
    } else {
      // Use local backend for AI generation
      return await callLocalBackend(requestData);
    }
  } catch (error) {
    console.error('Backend AI generation failed:', error);
    throw error;
  }
}

/**
 * Call Agent Engine API for AI response
 */
async function callAgentEngine(requestData: { message: string; userId: string; sessionId: string }): Promise<string> {
  const payload = formatAgentEnginePayload(requestData);
  const endpoint = getEndpointForPath('', 'query'); // Use query instead of streamQuery for non-streaming
  const authHeaders = await getAuthHeaders();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agent Engine API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Extract response from Agent Engine format
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const content = data.candidates[0].content;
    if (content.parts && content.parts[0] && content.parts[0].text) {
      return content.parts[0].text;
    }
  }
  
  // Fallback if format is different
  return JSON.stringify(data);
}

/**
 * Call local backend API for AI response
 */
async function callLocalBackend(requestData: { message: string; userId: string; sessionId: string }): Promise<string> {
  const payload = formatLocalBackendPayload(requestData);
  const endpoint = getEndpointForPath('/run_sse');
  const authHeaders = await getAuthHeaders();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Local backend API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // For local backend, we need to handle the streaming response differently
  // Since this is a non-streaming chat endpoint, we'll collect the full response
  const fullResponse = await collectStreamingResponse(response);
  return fullResponse;
}

/**
 * Collect full response from streaming endpoint
 */
async function collectStreamingResponse(response: Response): Promise<string> {
  if (!response.body) {
    throw new Error('No response body available');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let lastValidJson: Record<string, unknown> | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.trim().substring(6));
            lastValidJson = jsonData;
            
            // Extract text content from incremental updates
            if (jsonData.content && jsonData.content.parts && jsonData.content.parts[0]) {
              const newText = jsonData.content.parts[0].text;
              if (jsonData.incremental) {
                fullText += newText;
              } else {
                // Final complete response
                fullText = newText;
              }
            }
          } catch {
            // Skip invalid JSON lines
            console.warn('Failed to parse SSE line:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Return the accumulated text or the last complete response
  return fullText || (lastValidJson?.content as any)?.parts?.[0]?.text || 'No response generated';
}

/**
 * Handle preflight requests for CORS
 */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}