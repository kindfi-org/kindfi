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
			kindlers: {
				Row: {
					auth_id: string
					avatar_url: string | null
					bio: string | null
					created_at: string
					display_name: string | null
					email: string
					id: string
					updated_at: string
					username: string
				}
				Insert: {
					auth_id: string
					avatar_url?: string | null
					bio?: string | null
					created_at?: string
					display_name?: string | null
					email: string
					id?: string
					updated_at?: string
					username: string
				}
				Update: {
					auth_id?: string
					avatar_url?: string | null
					bio?: string | null
					created_at?: string
					display_name?: string | null
					email?: string
					id?: string
					updated_at?: string
					username?: string
				}
				Relationships: []
			}
			project_followers: {
				Row: {
					created_at: string
					id: string
					kindler_id: string
					project_id: string
				}
				Insert: {
					created_at?: string
					id?: string
					kindler_id: string
					project_id: string
				}
				Update: {
					created_at?: string
					id?: string
					kindler_id?: string
					project_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_followers_kindler_id_fkey'
						columns: ['kindler_id']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_followers_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			project_members: {
				Row: {
					created_at: string
					id: string
					kindler_id: string
					project_id: string
					role: string
				}
				Insert: {
					created_at?: string
					id?: string
					kindler_id: string
					project_id: string
					role: string
				}
				Update: {
					created_at?: string
					id?: string
					kindler_id?: string
					project_id?: string
					role?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_members_kindler_id_fkey'
						columns: ['kindler_id']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_members_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
				]
			}
			project_update_comments: {
				Row: {
					content: string
					created_at: string
					id: string
					kindler_id: string
					update_id: string
					updated_at: string
				}
				Insert: {
					content: string
					created_at?: string
					id?: string
					kindler_id: string
					update_id: string
					updated_at?: string
				}
				Update: {
					content?: string
					created_at?: string
					id?: string
					kindler_id?: string
					update_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_update_comments_kindler_id_fkey'
						columns: ['kindler_id']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_update_comments_update_id_fkey'
						columns: ['update_id']
						isOneToOne: false
						referencedRelation: 'project_updates'
						referencedColumns: ['id']
					},
				]
			}
			project_update_notifications: {
				Row: {
					created_at: string
					id: string
					is_read: boolean
					kindler_id: string
					update_id: string
				}
				Insert: {
					created_at?: string
					id?: string
					is_read?: boolean
					kindler_id: string
					update_id: string
				}
				Update: {
					created_at?: string
					id?: string
					is_read?: boolean
					kindler_id?: string
					update_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_update_notifications_kindler_id_fkey'
						columns: ['kindler_id']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_update_notifications_update_id_fkey'
						columns: ['update_id']
						isOneToOne: false
						referencedRelation: 'project_updates'
						referencedColumns: ['id']
					},
				]
			}
			project_updates: {
				Row: {
					content: string
					created_at: string
					created_by: string
					id: string
					media_urls: Json | null
					project_id: string
					status: string
					title: string
					update_type: string
					updated_at: string
					updated_by: string
				}
				Insert: {
					content: string
					created_at?: string
					created_by: string
					id?: string
					media_urls?: Json | null
					project_id: string
					status?: string
					title: string
					update_type: string
					updated_at?: string
					updated_by: string
				}
				Update: {
					content?: string
					created_at?: string
					created_by?: string
					id?: string
					media_urls?: Json | null
					project_id?: string
					status?: string
					title?: string
					update_type?: string
					updated_at?: string
					updated_by?: string
				}
				Relationships: [
					{
						foreignKeyName: 'project_updates_created_by_fkey'
						columns: ['created_by']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_updates_project_id_fkey'
						columns: ['project_id']
						isOneToOne: false
						referencedRelation: 'projects'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'project_updates_updated_by_fkey'
						columns: ['updated_by']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
				]
			}
			projects: {
				Row: {
					created_at: string
					created_by: string
					description: string | null
					id: string
					name: string
					status: string
					updated_at: string
					updated_by: string
				}
				Insert: {
					created_at?: string
					created_by: string
					description?: string | null
					id?: string
					name: string
					status?: string
					updated_at?: string
					updated_by: string
				}
				Update: {
					created_at?: string
					created_by?: string
					description?: string | null
					id?: string
					name?: string
					status?: string
					updated_at?: string
					updated_by?: string
				}
				Relationships: [
					{
						foreignKeyName: 'projects_created_by_fkey'
						columns: ['created_by']
						isOneToOne: false
						referencedRelation: 'kindlers'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'projects_updated_by_fkey'
						columns: ['updated_by']
						isOneToOne: false
						referencedRelation: 'kindlers'
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
			[_ in never]: never
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
