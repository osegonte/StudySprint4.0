// src/lib/validation.ts
import { z } from 'zod';

export const topicSchema = z.object({
  name: z.string().min(1, 'Topic name is required').max(255, 'Topic name too long'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
  difficulty_level: z.number().min(1).max(5).optional(),
  priority_level: z.number().min(1).max(5).optional(),
});

export const pdfUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  topic_id: z.string().uuid('Invalid topic ID').optional(),
  pdf_type: z.enum(['study', 'exercise', 'reference']).optional(),
  difficulty_level: z.number().min(1).max(5).optional(),
});

export const studySessionSchema = z.object({
  pdf_id: z.string().uuid().optional(),
  topic_id: z.string().uuid().optional(),
  session_type: z.enum(['study', 'exercise', 'review', 'research']).optional(),
  planned_duration_minutes: z.number().min(5).max(480).optional(),
  goals_set: z.array(z.string()).optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  goal_type: z.enum(['time_based', 'completion', 'skill_based', 'performance', 'habit', 'project']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  target_value: z.number().min(1, 'Target value must be positive').optional(),
  target_date: z.string().optional(),
  difficulty_rating: z.number().min(1).max(5).optional(),
  importance_rating: z.number().min(1).max(5).optional(),
  estimated_hours: z.number().min(1).max(1000).optional(),
});

export type TopicFormData = z.infer<typeof topicSchema>;
export type PDFUploadFormData = z.infer<typeof pdfUploadSchema>;
export type StudySessionFormData = z.infer<typeof studySessionSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;