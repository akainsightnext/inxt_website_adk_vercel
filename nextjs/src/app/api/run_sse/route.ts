import { NextRequest } from "next/server";
import { shouldUseAgentEngine } from "@/lib/config";
import {
  parseStreamRequest,
  logStreamRequest,
  CORS_HEADERS,
} from "@/lib/handlers/run-sse-common";
import {
  createValidationError,
  createInternalServerError,
} from "@/lib/handlers/error-utils";
import { handleAgentEngineStreamRequest } from "@/lib/handlers/run-sse-agent-engine-handler";
import { handleLocalBackendStreamRequest } from "@/lib/handlers/run-sse-local-backend-handler";
import { ModelArmorClient, SafetyResult } from "@/lib/model-armor-client";
import { getTemplates, isModelArmorEnabled } from "@/app/api/model-armor/config";

// Configure maximum execution duration (5 minutes = 300 seconds)
export const maxDuration = 300;

/**
 * Run SSE API Route - Main Orchestrator
 * Uses strategy pattern to delegate to appropriate deployment handler
 *
 * @param request - The incoming HTTP request
 * @returns Streaming SSE response with real-time data
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Parse and validate the incoming request
    const { data: requestData, validation } = await parseStreamRequest(request);

    if (!validation.isValid || !requestData) {
      return createValidationError(
        validation.error || "Invalid request format"
      );
    }

    // Model Armor: Sanitize user input before processing
    let sanitizedMessage = requestData.message;
    let promptSafety: SafetyResult | null = null;
    
    if (isModelArmorEnabled()) {
      try {
        const modelArmorClient = new ModelArmorClient();
        const templates = getTemplates('balanced'); // Use balanced profile by default
        
        promptSafety = await modelArmorClient.sanitizePrompt(requestData.message, templates.prompt);
        
        if (promptSafety.blocked) {
          // Return blocked response as SSE stream
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              const blockedResponse = {
                content: {
                  parts: [{ 
                    text: "I cannot process that request due to safety concerns. Please rephrase your question in a more appropriate manner." 
                  }],
                  role: "model"
                },
                blocked: true,
                safetyDetails: promptSafety?.details || {},
                timestamp: Date.now() / 1000
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(blockedResponse)}\n\n`));
              controller.close();
            }
          });

          return new Response(stream, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              ...CORS_HEADERS,
            },
          });
        }
        
        // Use sanitized text if available
        sanitizedMessage = promptSafety.sanitizedText || requestData.message;
        
      } catch (modelArmorError) {
        console.error('Model Armor error:', modelArmorError);
        // Continue with original message if Model Armor fails (fail-open approach)
      }
    }

    // Update request data with sanitized message
    const sanitizedRequestData = {
      ...requestData,
      message: sanitizedMessage
    };

    // Determine deployment strategy based on configuration
    const deploymentType = shouldUseAgentEngine()
      ? "agent_engine"
      : "local_backend";

    // Log the incoming request with deployment strategy
    logStreamRequest(
      sanitizedRequestData.sessionId,
      sanitizedRequestData.userId,
      sanitizedRequestData.message,
      deploymentType
    );

    // Delegate to appropriate deployment strategy handler
    if (deploymentType === "agent_engine") {
      return await handleAgentEngineStreamRequest(sanitizedRequestData);
    } else {
      return await handleLocalBackendStreamRequest(sanitizedRequestData);
    }
  } catch (error) {
    // Handle any unexpected errors at the top level
    return createInternalServerError(
      "Failed to process streaming request",
      error
    );
  }
}

/**
 * Handle preflight requests for CORS
 * @returns CORS headers for preflight requests
 */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
