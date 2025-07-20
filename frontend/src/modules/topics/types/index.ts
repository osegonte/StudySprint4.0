export interface Topic {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  total_pdfs: number;
  total_exercises: number;
  study_progress: number;
  estimated_completion_hours: number;
  difficulty_level: number;
  priority_level: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TopicCreateData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  difficulty_level: number;
  priority_level: number;
}

export interface TopicUpdateData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  difficulty_level?: number;
  priority_level?: number;
  is_archived?: boolean;
}

export interface TopicStats {
  totalTopics: number;
  totalPDFs: number;
  totalExercises: number;
  avgProgress: number;
}