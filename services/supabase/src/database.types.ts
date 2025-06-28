export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			graphql: {
				Args: {
					operationName?: string
					query?: string
					variables?: Json
					extensions?: Json
				}
				Returns: Json
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	public: {
		Tables: {
			categories: {
				Row: {
					color: string
					id: string
					name: string
					slug: string | null
				}
				Insert: {
					color: string
					id?: string
					name: string
					slug?: string | null
				}
				Update: {
					color?: string
					id?: string
					name?: string
					slug?: string | null
				}
				Relationships: []
			}
			comments: {
				Row: {
					author_id: string
					content: string
					created_at: string | null
					id: string
					metadata: Json
					parent_comment_id: string | null
					project_id: string | null
					project_update_id: string | null
					type: Database['public']['Enums']['comment_type']
					updated_at: string | null
				}
				Insert: {
					author_id: string
					content: string
					created_at?: string | null
					id?: string
					metadata?: Json
					parent_comment_id?: string | null
					project_id?: string | null
					project_update_id?: string | null
					type?: Database['public']['Enums']['comment_type']
					updated_at?: string | null
				}
				Update: {
					author_id?: string
					content?: string
					created_at?: string | null
					id?: string
					metadata?: Json
					parent_comment_id?: string | null
					project_id?: string | null
					project_update_id?: string | null
					type?: Database['public']['Enums']['comment_type']
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'comments_parent_comment_id_fkey'
						columns: ['parent_comment_id']
						isOneToOne: false
						referencedRelation: 'comments'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'comments_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'comments_project_update_id_fkey'
						columns: ['project_update_id']
						isOneToOne: false
						referencedRelation: 'project_updates'
						referencedColumns: ['id']
					},
				]
			}
			community: {
				Row: {
					comment_id: string
					created_at: string | null
					id: string
					project_id: string
					update_id: string
				}
				Insert: {
					comment_id: string
					created_at?: string | null
					id?: string
					project_id: string
					update_id: string
				}
				Update: {
					comment_id?: string
					created_at?: string | null
					id?: string
					project_id?: string
					update_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'comment_id_fkey'
						columns: ['comment_id']
						isOneToOne: false
						referencedRelation: 'comments'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'community_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'community_update_id_fkey'
						columns: ['update_id']
						isOneToOne: false
						referencedRelation: 'project_updates'
						referencedColumns: ['id']
					},
				]
			}
			contributions: {
				Row: {
					amount: number
					contributor_id: string
					created_at: string | null
					id: string
					project_id: string
					updated_at: string | null
				}
				Insert: {
					amount: number
					contributor_id: string
					created_at?: string | null
					id?: string
					project_id: string
					updated_at?: string | null
				}
				Update: {
					amount?: number
					contributor_id?: string
					created_at?: string | null
					id?: string
					project_id?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'contributions_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			escrow_contracts: {
				Row: {
					amount: number
					completed_at: string | null
					contract_id: string
					contribution_id: string
					created_at: string | null
					current_state: Database['public']['Enums']['escrow_status_type']
					engagement_id: string
					id: string
					metadata: Json | null
					payer_address: string
					platform_fee: number
					project_id: string
					receiver_address: string
					updated_at: string | null
				}
				Insert: {
					amount: number
					completed_at?: string | null
					contract_id: string
					contribution_id: string
					created_at?: string | null
					current_state?: Database['public']['Enums']['escrow_status_type']
					engagement_id: string
					id?: string
					metadata?: Json | null
					payer_address: string
					platform_fee: number
					project_id: string
					receiver_address: string
					updated_at?: string | null
				}
				Update: {
					amount?: number
					completed_at?: string | null
					contract_id?: string
					contribution_id?: string
					created_at?: string | null
					current_state?: Database['public']['Enums']['escrow_status_type']
					engagement_id?: string
					id?: string
					metadata?: Json | null
					payer_address?: string
					platform_fee?: number
					project_id?: string
					receiver_address?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'escrow_contracts_contribution_id_fkey'
						columns: ['contribution_id']
						isOneToOne: false
						referencedRelation: 'contributions'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'escrow_contracts_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			escrow_milestones: {
				Row: {
					escrow_id: string
					milestone_id: string
				}
				Insert: {
					escrow_id: string
					milestone_id: string
				}
				Update: {
					escrow_id?: string
					milestone_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'escrow_milestones_escrow_id_fkey'
						columns: ['escrow_id']
						isOneToOne: false
						referencedRelation: 'escrow_contracts'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'escrow_milestones_milestone_id_fkey'
						columns: ['milestone_id']
						isOneToOne: false
						referencedRelation: 'milestones'
						referencedColumns: ['id']
					},
				]
			}
			escrow_reviews: {
				Row: {
					created_at: string | null
					disputer_id: string | null
					escrow_id: string
					evidence_urls: string[] | null
					id: string
					milestone_id: string | null
					resolution_text: string | null
					review_notes: string | null
					reviewed_at: string | null
					reviewer_address: string
					status: string
					transaction_hash: string | null
					type: string
				}
				Insert: {
					created_at?: string | null
					disputer_id?: string | null
					escrow_id: string
					evidence_urls?: string[] | null
					id?: string
					milestone_id?: string | null
					resolution_text?: string | null
					review_notes?: string | null
					reviewed_at?: string | null
					reviewer_address: string
					status?: string
					transaction_hash?: string | null
					type: string
				}
				Update: {
					created_at?: string | null
					disputer_id?: string | null
					escrow_id?: string
					evidence_urls?: string[] | null
					id?: string
					milestone_id?: string | null
					resolution_text?: string | null
					review_notes?: string | null
					reviewed_at?: string | null
					reviewer_address?: string
					status?: string
					transaction_hash?: string | null
					type?: string
				}
				Relationships: [
					{
						foreignKeyName: 'escrow_reviews_escrow_id_fkey'
						columns: ['escrow_id']
						isOneToOne: false
						referencedRelation: 'escrow_contracts'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'escrow_reviews_milestone_id_fkey'
						columns: ['milestone_id']
						isOneToOne: false
						referencedRelation: 'milestones'
						referencedColumns: ['id']
					},
				]
			}
			escrow_status: {
				Row: {
					current_milestone: number | null
					escrow_id: string
					id: string
					last_updated: string | null
					metadata: Json | null
					status: Database['public']['Enums']['escrow_status_type']
					total_funded: number | null
					total_released: number | null
				}
				Insert: {
					current_milestone?: number | null
					escrow_id: string
					id?: string
					last_updated?: string | null
					metadata?: Json | null
					status: Database['public']['Enums']['escrow_status_type']
					total_funded?: number | null
					total_released?: number | null
				}
				Update: {
					current_milestone?: number | null
					escrow_id?: string
					id?: string
					last_updated?: string | null
					metadata?: Json | null
					status?: Database['public']['Enums']['escrow_status_type']
					total_funded?: number | null
					total_released?: number | null
				}
				Relationships: []
			}
			kindler_projects: {
				Row: {
					joined_at: string
					kindler_id: string
					project_id: string
				}
				Insert: {
					joined_at?: string
					kindler_id: string
					project_id: string
				}
				Update: {
					joined_at?: string
					kindler_id?: string
					project_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'kindler_projects_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			kyc_reviews: {
				Row: {
					additional_notes: string | null
					created_at: string
					decision: Database['public']['Enums']['kyc_status_enum']
					id: string
					kyc_status_id: string
					reason: string | null
					review_notes: string | null
					reviewer_id: string
					updated_at: string
				}
				Insert: {
					additional_notes?: string | null
					created_at?: string
					decision: Database['public']['Enums']['kyc_status_enum']
					id?: string
					kyc_status_id: string
					reason?: string | null
					review_notes?: string | null
					reviewer_id: string
					updated_at?: string
				}
				Update: {
					additional_notes?: string | null
					created_at?: string
					decision?: Database['public']['Enums']['kyc_status_enum']
					id?: string
					kyc_status_id?: string
					reason?: string | null
					review_notes?: string | null
					reviewer_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'kyc_reviews_kyc_status_id_fkey'
						columns: ['kyc_status_id']
						isOneToOne: false
						referencedRelation: 'kyc_status'
						referencedColumns: ['id']
					},
				]
			}
			kyc_status: {
				Row: {
					created_at: string
					id: string
					status: Database['public']['Enums']['kyc_status_enum']
					updated_at: string
					user_id: string
					verification_level: Database['public']['Enums']['kyc_verification_enum']
				}
				Insert: {
					created_at?: string
					id?: string
					status?: Database['public']['Enums']['kyc_status_enum']
					updated_at?: string
					user_id: string
					verification_level?: Database['public']['Enums']['kyc_verification_enum']
				}
				Update: {
					created_at?: string
					id?: string
					status?: Database['public']['Enums']['kyc_status_enum']
					updated_at?: string
					user_id?: string
					verification_level?: Database['public']['Enums']['kyc_verification_enum']
				}
				Relationships: []
			}
			milestones: {
				Row: {
					amount: number
					completed_at: string | null
					created_at: string | null
					deadline: string
					description: string | null
					id: string
					order_index: number
					project_id: string
					status: Database['public']['Enums']['milestone_status']
					title: string
				}
				Insert: {
					amount: number
					completed_at?: string | null
					created_at?: string | null
					deadline: string
					description?: string | null
					id?: string
					order_index: number
					project_id: string
					status?: Database['public']['Enums']['milestone_status']
					title: string
				}
				Update: {
					amount?: number
					completed_at?: string | null
					created_at?: string | null
					deadline?: string
					description?: string | null
					id?: string
					order_index?: number
					project_id?: string
					status?: Database['public']['Enums']['milestone_status']
					title?: string
				}
				Relationships: [
					{
						foreignKeyName: 'milestones_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			notification_preferences: {
				Row: {
					created_at: string | null
					email: boolean | null
					in_app: boolean | null
					push: boolean | null
					updated_at: string | null
					user_id: string
				}
				Insert: {
					created_at?: string | null
					email?: boolean | null
					in_app?: boolean | null
					push?: boolean | null
					updated_at?: string | null
					user_id: string
				}
				Update: {
					created_at?: string | null
					email?: boolean | null
					in_app?: boolean | null
					push?: boolean | null
					updated_at?: string | null
					user_id?: string
				}
				Relationships: []
			}
			notifications: {
				Row: {
					body: string
					created_at: string | null
					data: Json | null
					delivery_attempts: number | null
					delivery_status:
						| Database['public']['Enums']['notification_delivery_status']
						| null
					expires_at: string | null
					id: string
					is_read: boolean | null
					metadata: Json | null
					next_retry_at: string | null
					priority: Database['public']['Enums']['notification_priority']
					title: string
					type: Database['public']['Enums']['notification_type']
					updated_at: string | null
					user_id: string
				}
				Insert: {
					body: string
					created_at?: string | null
					data?: Json | null
					delivery_attempts?: number | null
					delivery_status?:
						| Database['public']['Enums']['notification_delivery_status']
						| null
					expires_at?: string | null
					id?: string
					is_read?: boolean | null
					metadata?: Json | null
					next_retry_at?: string | null
					priority?: Database['public']['Enums']['notification_priority']
					title: string
					type?: Database['public']['Enums']['notification_type']
					updated_at?: string | null
					user_id: string
				}
				Update: {
					body?: string
					created_at?: string | null
					data?: Json | null
					delivery_attempts?: number | null
					delivery_status?:
						| Database['public']['Enums']['notification_delivery_status']
						| null
					expires_at?: string | null
					id?: string
					is_read?: boolean | null
					metadata?: Json | null
					next_retry_at?: string | null
					priority?: Database['public']['Enums']['notification_priority']
					title?: string
					type?: Database['public']['Enums']['notification_type']
					updated_at?: string | null
					user_id?: string
				}
				Relationships: []
			}
			profiles: {
				Row: {
					bio: string | null
					created_at: string
					display_name: string
					id: string
					image_url: string | null
					role: Database['public']['Enums']['user_role']
					updated_at: string
				}
				Insert: {
					bio?: string | null
					created_at?: string
					display_name: string
					id: string
					image_url?: string | null
					role?: Database['public']['Enums']['user_role']
					updated_at?: string
				}
				Update: {
					bio?: string | null
					created_at?: string
					display_name?: string
					id?: string
					image_url?: string | null
					role?: Database['public']['Enums']['user_role']
					updated_at?: string
				}
				Relationships: []
			}
			project_members: {
				Row: {
					id: string
					joined_at: string
					project_id: string
					role: Database['public']['Enums']['project_member_role']
					title: string
					updated_at: string
					user_id: string
				}
				Insert: {
					id?: string
					joined_at?: string
					project_id: string
					role?: Database['public']['Enums']['project_member_role']
					title: string
					updated_at?: string
					user_id: string
				}
				Update: {
					id?: string
					joined_at?: string
					project_id?: string
					role?: Database['public']['Enums']['project_member_role']
					title?: string
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_members_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			project_pitch: {
				Row: {
					created_at: string | null
					id: string
					pitch_deck: string | null
					project_id: string
					story: string | null
					title: string
					updated_at: string | null
					video_url: string | null
				}
				Insert: {
					created_at?: string | null
					id?: string
					pitch_deck?: string | null
					project_id: string
					story?: string | null
					title: string
					updated_at?: string | null
					video_url?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					pitch_deck?: string | null
					project_id?: string
					story?: string | null
					title?: string
					updated_at?: string | null
					video_url?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'project_pitch_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			project_tag_relationships: {
				Row: {
					project_id: string
					tag_id: string
				}
				Insert: {
					project_id: string
					tag_id: string
				}
				Update: {
					project_id?: string
					tag_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_tag_relationships_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_tag_relationships_tag_id_fkey'
						columns: ['tag_id']
						isOneToOne: false
						referencedRelation: 'project_tags'
						referencedColumns: ['id']
					},
				]
			}
			project_tags: {
				Row: {
					color: string
					created_at: string | null
					id: string
					name: string
					updated_at: string | null
				}
				Insert: {
					color: string
					created_at?: string | null
					id?: string
					name: string
					updated_at?: string | null
				}
				Update: {
					color?: string
					created_at?: string | null
					id?: string
					name?: string
					updated_at?: string | null
				}
				Relationships: []
			}
			project_updates: {
				Row: {
					author_id: string
					content: string
					created_at: string
					id: string
					project_id: string
					title: string
					updated_at: string
				}
				Insert: {
					author_id: string
					content: string
					created_at?: string
					id?: string
					project_id: string
					title: string
					updated_at?: string
				}
				Update: {
					author_id?: string
					content?: string
					created_at?: string
					id?: string
					project_id?: string
					title?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_updates_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			projects: {
				Row: {
					category_id: string | null
					created_at: string | null
					current_amount: number
					description: string | null
					id: string
					image_url: string | null
					investors_count: number
					min_investment: number
					owner_id: string
					percentage_complete: number
					target_amount: number
					title: string
					updated_at: string | null
				}
				Insert: {
					category_id?: string | null
					created_at?: string | null
					current_amount?: number
					description?: string | null
					id?: string
					image_url?: string | null
					investors_count?: number
					min_investment: number
					owner_id: string
					percentage_complete?: number
					target_amount: number
					title: string
					updated_at?: string | null
				}
				Update: {
					category_id?: string | null
					created_at?: string | null
					current_amount?: number
					description?: string | null
					id?: string
					image_url?: string | null
					investors_count?: number
					min_investment?: number
					owner_id?: string
					percentage_complete?: number
					target_amount?: number
					title?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'projects_category_id_fkey'
						columns: ['category_id']
						isOneToOne: false
						referencedRelation: 'categories'
						referencedColumns: ['id']
					},
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			unaccent: {
				Args: { '': string }
				Returns: string
			}
			unaccent_init: {
				Args: { '': unknown }
				Returns: unknown
			}
		}
		Enums: {
			comment_type: 'comment' | 'question' | 'answer'
			escrow_status_type:
				| 'NEW'
				| 'FUNDED'
				| 'ACTIVE'
				| 'COMPLETED'
				| 'DISPUTED'
				| 'CANCELLED'
			kyc_status_enum: 'pending' | 'approved' | 'rejected' | 'verified'
			kyc_verification_enum: 'basic' | 'enhanced'
			milestone_status:
				| 'pending'
				| 'completed'
				| 'approved'
				| 'rejected'
				| 'disputed'
			notification_delivery_status: 'pending' | 'delivered' | 'failed'
			notification_priority: 'low' | 'medium' | 'high' | 'urgent'
			notification_type: 'info' | 'success' | 'warning' | 'error'
			project_member_role:
				| 'admin'
				| 'editor'
				| 'advisor'
				| 'community'
				| 'core'
				| 'others'
			user_role: 'kinder' | 'kindler'
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
				DefaultSchema['Views'])
		? (DefaultSchema['Tables'] &
				DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof Database },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof Database },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
	? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			comment_type: ['comment', 'question', 'answer'],
			escrow_status_type: [
				'NEW',
				'FUNDED',
				'ACTIVE',
				'COMPLETED',
				'DISPUTED',
				'CANCELLED',
			],
			kyc_status_enum: ['pending', 'approved', 'rejected', 'verified'],
			kyc_verification_enum: ['basic', 'enhanced'],
			milestone_status: [
				'pending',
				'completed',
				'approved',
				'rejected',
				'disputed',
			],
			notification_delivery_status: ['pending', 'delivered', 'failed'],
			notification_priority: ['low', 'medium', 'high', 'urgent'],
			notification_type: ['info', 'success', 'warning', 'error'],
			project_member_role: [
				'admin',
				'editor',
				'advisor',
				'community',
				'core',
				'others',
			],
			user_role: ['kinder', 'kindler'],
		},
	},
} as const
