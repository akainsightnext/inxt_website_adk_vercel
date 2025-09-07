import { NextRequest, NextResponse } from 'next/server';
import { ModelArmorClient } from '../../../../lib/model-armor-client';
import { isModelArmorEnabled } from '../config';

const modelArmorClient = new ModelArmorClient();

export async function POST(req: NextRequest) {
  try {
    if (!isModelArmorEnabled()) {
      return NextResponse.json({
        isSafe: true,
        blocked: false,
        text: await req.json().then(body => body.text),
        details: { disabled: true }
      });
    }
    
    const { text, type = 'prompt', templateId } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    let result;
    if (type === 'response') {
      result = await modelArmorClient.sanitizeResponse(text, templateId);
    } else {
      result = await modelArmorClient.sanitizePrompt(text, templateId);
    }
    
    return NextResponse.json({
      isSafe: result.isSafe,
      blocked: result.blocked,
      text: result.sanitizedText,
      matchState: result.matchState,
      details: result.details,
      // Include raw response for debugging (remove in production)
      debug: process.env.NODE_ENV === 'development' ? result.rawResponse : undefined
    });
    
  } catch (error) {
    console.error('Model Armor sanitization error:', error);
    
    return NextResponse.json(
      {
        error: 'Model Armor service unavailable',
        isSafe: true, // Fail open
        blocked: false,
        text: await req.json().then(body => body.text).catch(() => ''),
      },
      { status: 500 }
    );
  }
}