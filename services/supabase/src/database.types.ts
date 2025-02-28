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
					milestones: string[]
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
					milestones?: string[]
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
					milestones?: string[]
				}
				Relationships: [
					{
						foreignKeyName: 'project_milestones_project_id_fkey'
						columns: ['id']
						isOneToOne: false
						referencedRelation: 'project_milestones'
						referencedColumns: ['project_id']
					},
				]
			}
			escrow_milestones: {
				Row: {
					id: string
					escrow_id: string
					project_milestone_id: string
					title: string
					description: string | null
					amount: number
					deadline: string
					status: Database['public']['Enums']['milestone_status']
					order_index: number
					created_at: string
					completed_at: string | null
				}
				Insert: {
					id?: string
					escrow_id: string
					project_milestone_id: string
					title: string
					description?: string | null
					amount: number
					deadline: string
					status?: Database['public']['Enums']['milestone_status']
					order_index: number
					created_at?: string
					completed_at?: string | null
				}
				Update: {
					id?: string
					escrow_id?: string
					project_milestone_id?: string
					title?: string
					description?: string | null
					amount?: number
					deadline?: string
					status?: Database['public']['Enums']['milestone_status']
					order_index?: number
					created_at?: string
					completed_at?: string | null
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
			project_milestones: {
				Row: {
					id: string
					project_id: string
					milestone_id: string
				}
				Insert: {
					id?: string
					project_id: string
					milestone_id: string
				}
				Update: {
					id?: string
					project_id?: string
					milestone_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_milestones_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_milestones_milestone_id_fkey'
						columns: ['milestone_id']
						isOneToOne: false
						referencedRelation: 'escrow_milestones'
						referencedColumns: ['id']
					},
				]
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
			milestone_status: 'pending' | 'in_progress' | 'failed' | 'completed'
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
				PublicSchema['Views'])
		? (PublicSchema['Tables'] &
				PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema['Enums']
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never
