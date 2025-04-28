export type CommentType = 'comment' | 'question' | 'answer';

export interface Comment {
  id: string;
  content: string;
  type: CommentType;
  metadata: {
    status?: 'new' | 'answered' | 'resolved';
    is_official?: boolean;
  };
  parent_comment_id?: string;
  project_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}