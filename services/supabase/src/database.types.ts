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
					id: number
					name: string
				}
				Insert: {
					color: string
					id?: never
					name: string
				}
				Update: {
					color?: string
					id?: never
					name?: string
				}
				Relationships: []
			}
			comments: {
				Row: {
					author_id: string
					content: string
					created_at: string | null
					id: string
					parent_comment_id: string | null
					project_id: string | null
					project_update_id: string | null
					updated_at: string | null
				}
				Insert: {
					author_id: string
					content: string
					created_at?: string | null
					id?: string
					parent_comment_id?: string | null
					project_id?: string | null
					project_update_id?: string | null
					updated_at?: string | null
				}
				Update: {
					author_id?: string
					content?: string
					created_at?: string | null
					id?: string
					parent_comment_id?: string | null
					project_id?: string | null
					project_update_id?: string | null
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
					amount: number
					completed_at: string | null
					created_at: string | null
					deadline: string
					description: string | null
					escrow_id: string
					id: string
					order_index: number
					project_milestone_id: string
					status: Database['public']['Enums']['milestone_status']
					title: string
				}
				Insert: {
					amount: number
					completed_at?: string | null
					created_at?: string | null
					deadline: string
					description?: string | null
					escrow_id: string
					id?: string
					order_index: number
					project_milestone_id: string
					status?: Database['public']['Enums']['milestone_status']
					title: string
				}
				Update: {
					amount?: number
					completed_at?: string | null
					created_at?: string | null
					deadline?: string
					description?: string | null
					escrow_id?: string
					id?: string
					order_index?: number
					project_milestone_id?: string
					status?: Database['public']['Enums']['milestone_status']
					title?: string
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
						foreignKeyName: 'escrow_milestones_project_milestone_id_fkey'
						columns: ['project_milestone_id']
						isOneToOne: false
						referencedRelation: 'project_milestones'
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
			profiles: {
				Row: {
					created_at: string
					id: string
					role: Database['public']['Enums']['user_role']
					updated_at: string
				}
				Insert: {
					created_at?: string
					id: string
					role?: Database['public']['Enums']['user_role']
					updated_at?: string
				}
				Update: {
					created_at?: string
					id?: string
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
					updated_at: string
					user_id: string
				}
				Insert: {
					id?: string
					joined_at?: string
					project_id: string
					role?: Database['public']['Enums']['project_member_role']
					updated_at?: string
					user_id: string
				}
				Update: {
					id?: string
					joined_at?: string
					project_id?: string
					role?: Database['public']['Enums']['project_member_role']
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
			project_milestones: {
				Row: {
					id: string
					milestone_id: string
					project_id: string
				}
				Insert: {
					id?: string
					milestone_id: string
					project_id: string
				}
				Update: {
					id?: string
					milestone_id?: string
					project_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_milestones_milestone_id_fkey'
						columns: ['milestone_id']
						isOneToOne: false
						referencedRelation: 'escrow_milestones'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_milestones_project_id_fkey'
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
					updated_at: string
				}
				Insert: {
					author_id: string
					content: string
					created_at?: string
					id?: string
					project_id: string
					updated_at?: string
				}
				Update: {
					author_id?: string
					content?: string
					created_at?: string
					id?: string
					project_id?: string
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
					milestones: string[] | null
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
					milestones?: string[] | null
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
					milestones?: string[] | null
					min_investment?: number
					owner_id?: string
					percentage_complete?: number
					target_amount?: number
					title?: string
					updated_at?: string | null
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			escrow_status_type:
				| 'NEW'
				| 'FUNDED'
				| 'ACTIVE'
				| 'COMPLETED'
				| 'DISPUTED'
				| 'CANCELLED'
			milestone_status: 'pending' | 'in_progress' | 'completed' | 'failed'
			project_member_role: 'admin' | 'editor'
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
			escrow_status_type: [
				'NEW',
				'FUNDED',
				'ACTIVE',
				'COMPLETED',
				'DISPUTED',
				'CANCELLED',
			],
			milestone_status: ['pending', 'in_progress', 'completed', 'failed'],
			project_member_role: ['admin', 'editor'],
			user_role: ['kinder', 'kindler'],
		},
	},
} as const
