import { z } from 'zod';

/** Defines the possible types of comments in the system */
export const CommentTypeSchema = z.enum(['comment', 'question', 'answer']);

/** 
 * Defines the possible statuses of a question in its lifecycle
 * - new: Initial state when a question is created
 * - answered: When at least one answer has been provided
 * - resolved: When the question author has marked it as resolved
 */
export const CommentStatusSchema = z.enum(['new', 'answered', 'resolved']);

// Type inference from schemas
export type CommentType = z.infer<typeof CommentTypeSchema>;
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

/** Base metadata for regular comments - strictly empty object */
export const BaseMetadataSchema = z.object({}).strict();

/** Metadata specific to questions */
export const QuestionMetadataSchema = z.object({
  /** Status of a question - transitions from new → answered → resolved */
  status: CommentStatusSchema.optional(),
}).strict();

/** Metadata specific to answers */
export const AnswerMetadataSchema = z.object({
  /** When true, indicates this answer has been marked as official by a project member */
  isOfficial: z.boolean().optional(),
}).strict();

/** Combined metadata schema using discriminated union */
export const CommentMetadataSchema = z.union([
  BaseMetadataSchema,
  QuestionMetadataSchema,
  AnswerMetadataSchema
]);

// Type inference for metadata
export type QuestionMetadata = z.infer<typeof QuestionMetadataSchema>;
export type AnswerMetadata = z.infer<typeof AnswerMetadataSchema>;
export type CommentMetadata = z.infer<typeof CommentMetadataSchema>;

/** Helper function to ensure chronological integrity of timestamps */
/** 
 * Helper function to ensure chronological integrity of timestamps
 * Compares two dates to verify the first isn't later than the second
 * Used to validate that createdAt doesn't occur after updatedAt
 * 
 * @param date1 - The earlier date (typically createdAt)
 * @param date2 - The later date (typically updatedAt)
 * @returns boolean - True if date1 is on or before date2
 */
const isOnOrBefore = (date1: Date, date2: Date): boolean => date1.getTime() <= date2.getTime();

/** Base fields shared across all comment types */
const baseFields = {
  id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  parentCommentId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
};

/**
 * Represents a comment entity in the system, supporting standard comments,
 * questions, and answers in a threaded hierarchy
 */
export const CommentSchema = z.discriminatedUnion('type', [
  z.object({ ...baseFields, type: z.literal('comment'), metadata: BaseMetadataSchema }),
  z.object({ ...baseFields, type: z.literal('question'), metadata: QuestionMetadataSchema }),
  z.object({ 
    ...baseFields, 
    type: z.literal('answer'), 
    metadata: AnswerMetadataSchema,
    parentCommentId: z.string().uuid() // Override to make required for answers
  })
]).refine(
  data => isOnOrBefore(data.createdAt, data.updatedAt),
  {
    message: "updatedAt must be on or after createdAt",
    path: ["createdAt", "updatedAt"]
  }
).superRefine((data, ctx) => {
  if (data.type === 'answer' && data.parentCommentId) {
    // Note: This validation requires backend implementation
    // to check parent comment type is 'question'
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Answer must reference a question as parent",
      path: ["parentCommentId"]
    });
  }
});

export type Comment = z.infer<typeof CommentSchema>;