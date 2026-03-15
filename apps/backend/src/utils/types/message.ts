export type Platform = 'zalo_personal' | 'zalo_oa' | 'meta';

export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'video'
  | 'audio'
  | 'sticker'
  | 'unknown';

export interface Attachment {
  type: MessageType;
  url?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface Message {
  platform: Platform;
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
  type: MessageType;
  text?: string;
  attachments?: Attachment[];
  // raw?: unknown;
}