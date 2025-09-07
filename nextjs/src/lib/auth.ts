import { google } from 'googleapis';

export interface GoogleCloudAuth {
  accessToken: string;
  expiresAt: number;
}

class AuthManager {
  private cachedAuth: GoogleCloudAuth | null = null;
  
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedAuth && Date.now() < this.cachedAuth.expiresAt - 300000) { // 5 min buffer
      return this.cachedAuth.accessToken;
    }
    
    // Get new access token
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: [
          'https://www.googleapis.com/auth/cloud-platform',
        ],
      });
      
      const client = await auth.getClient();
      const accessTokenResponse = await client.getAccessToken();
      
      if (!accessTokenResponse.token) {
        throw new Error('Failed to get access token');
      }
      
      // Cache the token
      this.cachedAuth = {
        accessToken: accessTokenResponse.token,
        expiresAt: Date.now() + 3600000, // 1 hour
      };
      
      return accessTokenResponse.token;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with Google Cloud');
    }
  }
}

export const authManager = new AuthManager();