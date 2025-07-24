export interface Topic {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PDF {
  id: string;
  title: string;
  url: string;
  pageCount: number;
  uploadedAt: string;
}

export interface Session {
  id: string;
  topicId: string;
  pdfId?: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  isActive: boolean;
}

export interface Note {
  id: string;
  content: string;
  topicId?: string;
  pdfId?: string;
  page?: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  question: string;
  answer: string;
  topicId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  milestones: string[];
  achieved: boolean;
}

export interface Analytics {
  sessions: number;
  focusScore: number;
  goalsCompleted: number;
  timeStudied: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: Record<string, any>;
}
