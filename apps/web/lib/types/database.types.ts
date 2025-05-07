export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json }
	| Json[]

export interface Database {
	public: {
		Tables: {
			escrow_milestones: {
				Row: {
					id: string
					user_id: string
					status: string
					completed_at: string | null
				}
				Insert: {
					id?: string
					user_id: string
					status: string
					completed_at?: string | null
				}
				Update: {
					id?: string
					user_id?: string
					status?: string
					completed_at?: string | null
				}
			}
			reviewers: {
				Row: {
					id: string
				}
				Insert: {
					id?: string
				}
				Update: {
					id?: string
				}
			}
			review_comments: {
				Row: {
					id: string
					milestone_id: string
					reviewer_id: string
					comments: string
					created_at: string
				}
				Insert: {
					id?: string
					milestone_id: string
					reviewer_id: string
					comments: string
					created_at?: string
				}
				Update: {
					id?: string
					milestone_id?: string
					reviewer_id?: string
					comments?: string
					created_at?: string
				}
			}
			notifications: {
				Row: {
					id: string
					user_id: string
					milestone_id: string | null
					message: string
					created_at: string
				}
				Insert: {
					id?: string
					user_id: string
					milestone_id?: string | null
					message: string
					created_at?: string
				}
				Update: {
					id?: string
					user_id?: string
					milestone_id?: string | null
					message?: string
					created_at?: string
				}
			}
		}
	}
}
