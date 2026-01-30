
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

export interface WebhookResponse {
  output?: string;
  message?: string;
  status?: string;
}
