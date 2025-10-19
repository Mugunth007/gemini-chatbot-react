import type { Part } from '@google/genai';

export type Sender = 'user' | 'model';

export interface Message {
  id: string;
  sender: Sender;
  parts: Part[];
  sources?: { uri: string; title: string }[];
}
