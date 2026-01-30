
import { WEBHOOK_URL } from '../constants';
import { User, WebhookResponse } from '../types';

export const sendMessageToWebhook = async (message: string, user: User): Promise<WebhookResponse> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Status ${response.status}: ${errorText || response.statusText}`);
    }

    // Handle different response types from n8n (sometimes it returns plain text)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const textData = await response.text();
      return { 
        status: "success", 
        message: textData || "Webhook triggered successfully" 
      };
    }
  } catch (error: any) {
    console.error("Detailed Webhook Error:", error);
    
    // Specifically handle the 'Failed to fetch' error which usually means CORS or Network failure
    if (error.message === 'Failed to fetch') {
      throw new Error("Network error or CORS block. Ensure n8n is active, 'Listening for test event' is clicked, and CORS is enabled in n8n settings.");
    }
    
    throw error;
  }
};
