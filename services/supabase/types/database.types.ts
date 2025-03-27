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
			escrow_status: {
				Row: {
					id: string
					escrow_id: string
					status:
						| 'NEW'
						| 'FUNDED'
						| 'ACTIVE'
						| 'COMPLETED'
						| 'DISPUTED'
						| 'CANCELLED'
					current_milestone: number | null
					total_funded: number
					total_released: number
					last_updated: string
					metadata: Json
				}
				Insert: {
					id?: string
					escrow_id: string
					status:
						| 'NEW'
						| 'FUNDED'
						| 'ACTIVE'
						| 'COMPLETED'
						| 'DISPUTED'
						| 'CANCELLED'
					current_milestone?: number | null
					total_funded: number
					total_released: number
					last_updated?: string
					metadata?: Json
				}
				Update: {
					id?: string
					escrow_id?: string
					status?:
						| 'NEW'
						| 'FUNDED'
						| 'ACTIVE'
						| 'COMPLETED'
						| 'DISPUTED'
						| 'CANCELLED'
					current_milestone?: number | null
					total_funded?: number
					total_released?: number
					last_updated?: string
					metadata?: Json
				}
			},
			project_updates: {
				Row: {
					id: string;
					project_id: string;
					title: string;
					content?: string;
					creator_id: string;
					created_at: string;
					updated_at: string;
				}
				Insert: {
					id?: string;
					project_id: string;
					title: string;
					content?: string;
					creator_id: string;
					created_at?: string;
					updated_at?: string;
				}
				Update: {
					id?: string;
					project_id?: string;
					title?: string;
					content?: string;
					creator_id?: string;
					created_at?: string;
					updated_at?: string;
				}
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
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<PublicTableNameOrOptions extends keyof PublicSchema['Tables']> =
	PublicSchema['Tables'][PublicTableNameOrOptions]['Row']

export type TablesInsert<PublicTableNameOrOptions extends keyof PublicSchema['Tables']> =
	PublicSchema['Tables'][PublicTableNameOrOptions]['Insert']

export type TablesUpdate<PublicTableNameOrOptions extends keyof PublicSchema['Tables']> =
	PublicSchema['Tables'][PublicTableNameOrOptions]['Update']

export type Enums<PublicEnumNameOrOptions extends keyof PublicSchema['Enums']> =
	PublicSchema['Enums'][PublicEnumNameOrOptions]
