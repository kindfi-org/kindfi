import { z } from 'zod';

// Base enums and their schemas
export const CommentTypeSchema = z.enum(['comment', 'question', 'answer']);
export const CommentStatusSchema = z.enum(['new', 'answered', 'resolved']);

// Type inference from schemas
export type CommentType = z.infer<typeof CommentTypeSchema>;
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

// Metadata schema and type
export const CommentMetadataSchema = z.object({
  status: CommentStatusSchema.optional(),
  isOfficial: z.boolean().optional(),
});
export type CommentMetadata = z.infer<typeof CommentMetadataSchema>;

// Comment schema and type
export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: CommentTypeSchema,
  metadata: CommentMetadataSchema,
  parentCommentId: z.string().optional(),
  projectId: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Comment = z.infer<typeof CommentSchema>;