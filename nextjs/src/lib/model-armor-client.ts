import { authManager } from './auth';

export interface SafetyResult {
  isSafe: boolean;
  blocked: boolean;
  matchState: number;
  sanitizedText?: string;
  details: SafetyDetails;
  rawResponse?: Record<string, unknown>;
}

export interface SafetyDetails {
  sensitiveData?: string;
  promptInjection?: string;
  maliciousUrls?: string;
  responsibleAI?: {
    overall: string;
    sexuallyExplicit: string;
    hateSpeech: string;
    harassment: string;
    dangerous: string;
  };
}

export class ModelArmorClient {
  private projectId: string;
  private location: string;
  private endpoint: string;
  
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    this.endpoint = process.env.MODEL_ARMOR_ENDPOINT || 
      `https://modelarmor.${this.location}.rep.googleapis.com`;
    
    if (!this.projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID is required');
    }
  }
  
  async sanitizePrompt(text: string, templateId?: string): Promise<SafetyResult> {
    const template = templateId || process.env.MODEL_ARMOR_PROMPT_TEMPLATE || 'ma-all-med';
    
    try {
      const accessToken = await authManager.getAccessToken();
      
      const response = await fetch(
        `${this.endpoint}/v1/projects/${this.projectId}/locations/${this.location}/templates/${template}:sanitizeUserPrompt`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userPromptData: {
              text: text
            }
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Model Armor API error:', error);
        throw new Error(`Model Armor API failed: ${response.status} ${error}`);
      }
      
      const data = await response.json();
      return this.parseResponse(data, text);
      
    } catch (error) {
      console.error('Error sanitizing prompt:', error);
      // Fail open - allow request if Model Armor fails
      return {
        isSafe: true,
        blocked: false,
        matchState: 0,
        sanitizedText: text,
        details: {},
        rawResponse: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
  
  async sanitizeResponse(text: string, templateId?: string): Promise<SafetyResult> {
    const template = templateId || process.env.MODEL_ARMOR_RESPONSE_TEMPLATE || 'ma-all-low';
    
    try {
      const accessToken = await authManager.getAccessToken();
      
      const response = await fetch(
        `${this.endpoint}/v1/projects/${this.projectId}/locations/${this.location}/templates/${template}:sanitizeModelResponse`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelResponseData: {
              text: text
            }
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Model Armor API error:', error);
        throw new Error(`Model Armor API failed: ${response.status} ${error}`);
      }
      
      const data = await response.json();
      return this.parseResponse(data, text);
      
    } catch (error) {
      console.error('Error sanitizing response:', error);
      // Fail open - allow response if Model Armor fails
      return {
        isSafe: true,
        blocked: false,
        matchState: 0,
        sanitizedText: text,
        details: {},
        rawResponse: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
  
  private parseResponse(apiResponse: Record<string, unknown>, originalText: string): SafetyResult {
    const sanitizationResult = apiResponse.sanitizationResult;
    const filterMatchState = sanitizationResult.filterMatchState;
    const isBlocked = filterMatchState === 2;
    
    // Extract sanitized/deidentified text
    let sanitizedText = originalText;
    const filterResults = sanitizationResult.filterResults || {};
    
    if (filterResults.sdp?.sdpFilterResult?.deidentifyResult?.data?.text) {
      sanitizedText = filterResults.sdp.sdpFilterResult.deidentifyResult.data.text;
    }
    
    return {
      isSafe: !isBlocked,
      blocked: isBlocked,
      matchState: filterMatchState,
      sanitizedText: isBlocked ? originalText : sanitizedText,
      details: this.parseDetails(filterResults),
      rawResponse: apiResponse
    };
  }
  
  private parseDetails(filterResults: Record<string, unknown>): SafetyDetails {
    const details: SafetyDetails = {};
    
    // Sensitive Data Protection
    if (filterResults.sdp) {
      const sdpResult = filterResults.sdp.sdpFilterResult;
      if (sdpResult.inspectResult) {
        details.sensitiveData = this.getMatchStateMessage(sdpResult.inspectResult.matchState);
      } else if (sdpResult.deidentifyResult) {
        details.sensitiveData = this.getMatchStateMessage(sdpResult.deidentifyResult.matchState);
      }
    }
    
    // Prompt Injection and Jailbreak
    if (filterResults.piAndJailbreak) {
      details.promptInjection = this.getMatchStateMessage(
        filterResults.piAndJailbreak.piAndJailbreakFilterResult.matchState
      );
    }
    
    // Malicious URIs
    if (filterResults.maliciousUris) {
      details.maliciousUrls = this.getMatchStateMessage(
        filterResults.maliciousUris.maliciousUriFilterResult.matchState
      );
    }
    
    // Responsible AI
    if (filterResults.rai) {
      const raiResult = filterResults.rai.raiFilterResult;
      const raiTypes = raiResult.raiFilterTypeResults || {};
      
      details.responsibleAI = {
        overall: this.getMatchStateMessage(raiResult.matchState),
        sexuallyExplicit: this.getMatchStateMessage(raiTypes.sexuallyExplicit?.matchState || 0),
        hateSpeech: this.getMatchStateMessage(raiTypes.hateSpeech?.matchState || 0),
        harassment: this.getMatchStateMessage(raiTypes.harassment?.matchState || 0),
        dangerous: this.getMatchStateMessage(raiTypes.dangerous?.matchState || 0),
      };
    }
    
    return details;
  }
  
  private getMatchStateMessage(matchState: number): string {
    switch (matchState) {
      case 1: return 'safe';
      case 2: return 'blocked';
      default: return 'not_assessed';
    }
  }
}