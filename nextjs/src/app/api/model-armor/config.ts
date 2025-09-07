export const SAFETY_TEMPLATES = {
  // Conservative - High security
  conservative: {
    prompt: 'ma-all-high',
    response: 'ma-rai-high'
  },
  
  // Balanced - Recommended for most use cases  
  balanced: {
    prompt: 'ma-all-med',
    response: 'ma-all-low'
  },
  
  // Permissive - Light filtering
  permissive: {
    prompt: 'ma-pijb-med',
    response: 'ma-rai-low'
  },
  
  // PII focused - Sensitive data protection
  pii_focused: {
    prompt: 'ma-sdp-inspect',
    response: 'ma-sdp-deid'
  },
  
  // Content moderation - Focus on harmful content
  content_moderation: {
    prompt: 'ma-rai-high',
    response: 'ma-rai-med'
  }
} as const;

export type SafetyProfile = keyof typeof SAFETY_TEMPLATES;

export const getTemplates = (profile: SafetyProfile = 'balanced') => {
  return SAFETY_TEMPLATES[profile];
};

export const isModelArmorEnabled = () => {
  return process.env.ENABLE_MODEL_ARMOR?.toLowerCase() === 'true';
};