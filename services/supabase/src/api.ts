// Base API response interface
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
  message?: string
  timestamp?: string
}

// Success response helper
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  data: T
  error: null
  success: true
}

// Error response helper
export interface ApiErrorResponse extends ApiResponse<null> {
  data: null
  error: string
  success: false
}

// Supabase operation result
export interface SupabaseResult<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
    status?: number
  } | null
  count?: number | null
  status?: number
  statusText?: string
}

// Enhanced error types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiValidationErrorResponse extends ApiResponse<null> {
  data: null
  error: string
  success: false
  validation_errors: ValidationError[]
}

// Batch operation results
export interface BatchOperationResult<T> {
  successful: T[]
  failed: Array<{
    item: T
    error: string
    index: number
  }>
  total_processed: number
  success_count: number
  failure_count: number
  success_rate: number
}

// File upload types
export interface FileUploadResult {
  url: string
  path: string
  size: number
  mime_type: string
  filename: string
  bucket?: string
  created_at: string
}

export interface FileUploadError {
  message: string
  code: string
  file?: string
}

export interface BulkFileUploadResult {
  successful: FileUploadResult[]
  failed: Array<{
    file: File
    error: FileUploadError
  }>
  total_files: number
  success_count: number
  failure_count: number
}

// Analytics types for projects (campaigns)
export interface ProjectAnalytics {
  project_id: string
  total_views: number
  unique_visitors: number
  conversion_rate: number
  average_contribution: number
  total_contributions: number
  contributors_count: number
  funding_percentage: number
  top_referrers: Array<{
    source: string
    visits: number
    conversions: number
  }>
  daily_stats: Array<{
    date: string
    views: number
    contributions: number
    amount_raised: number
    new_contributors: number
  }>
  milestone_completion_rate: number
  time_to_funding?: number // days
}

// User analytics
export interface UserAnalytics {
  user_id: string
  total_projects_created: number
  total_projects_contributed: number
  total_amount_contributed: number
  total_amount_raised: number
  average_project_success_rate: number
  most_contributed_category: string
  contribution_frequency: 'high' | 'medium' | 'low'
  engagement_score: number
}

// Platform analytics
export interface PlatformAnalytics {
  total_projects: number
  active_projects: number
  completed_projects: number
  total_users: number
  total_amount_raised: number
  average_project_funding_time: number
  success_rate: number
  top_categories: Array<{
    category_id: string
    category_name: string
    project_count: number
    total_raised: number
  }>
  monthly_growth: Array<{
    month: string
    new_projects: number
    new_users: number
    amount_raised: number
  }>
}

// Search and query result types
export interface SearchResult<T> {
  results: T[]
  total_count: number
  query: string
  filters_applied: Record<string, any>
  search_time_ms: number
  suggestions?: string[]
}

// Notification types
export interface NotificationData {
  id: string
  user_id: string
  type: 'project_update' | 'milestone_completed' | 'contribution_received' | 'comment_reply'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

// Webhook types
export interface WebhookPayload<T = any> {
  event: string
  data: T
  timestamp: string
  signature?: string
  version: string
}

export interface EscrowWebhookData {
  escrow_id: string
  project_id: string
  status: string
  amount: number
  transaction_hash?: string
  milestone_id?: string
}

// Export types for different operations
export interface ExportRequest {
  format: 'csv' | 'json' | 'xlsx'
  filters?: Record<string, any>
  columns?: string[]
  date_range?: {
    start: string
    end: string
  }
}

export interface ExportResult {
  download_url: string
  filename: string
  format: string
  size: number
  expires_at: string
  record_count: number
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset_time: number
  retry_after?: number
}

export interface RateLimitedResponse extends ApiResponse<null> {
  data: null
  error: 'Rate limit exceeded'
  success: false
  rate_limit: RateLimitInfo
}

// Backward compatibility aliases
export type CampaignAnalytics = ProjectAnalytics

// Type guards for runtime checking
export const isApiSuccessResponse = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true && response.data !== null && response.error === null
}

export const isApiErrorResponse = (response: ApiResponse<any>): response is ApiErrorResponse => {
  return response.success === false && response.data === null && response.error !== null
}

export const isSupabaseError = <T>(result: SupabaseResult<T>): result is SupabaseResult<T> & { error: NonNullable<SupabaseResult<T>['error']> } => {
  return result.error !== null
}