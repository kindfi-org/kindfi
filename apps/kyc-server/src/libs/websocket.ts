import type {
	RealtimeChannel,
	RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { ServerWebSocket } from 'bun'

interface KYCWebSocketData {
	clientId: string
	joinedAt: string
	userId?: string
}

interface KYCStatusData {
	user_id: string
	status: string
	verification_level: string
	[key: string]: string | number | boolean
}

interface KYCStatusChange {
	new: {
		user_id: string
		status: string
		verification_level: string
		[key: string]: string | number | boolean
	}
	old: Record<string, string | number | boolean>
	[key: string]: unknown
}

interface KYCUpdate {
	type: 'kyc_status'
	data: {
		user_id: string
		status: string
		verification_level: string
		timestamp: string
	}
}

interface SupabaseKYCPayload {
	new: {
		user_id: string
		status: string
		verification_level: string
		[key: string]: string | number | boolean
	}
	old: Record<string, string | number | boolean>
	[key: string]: unknown
}

export class KYCWebSocketService {
	private clients: Set<ServerWebSocket<KYCWebSocketData>> = new Set()
	private supabase: ReturnType<typeof createClient>
	private channel?: RealtimeChannel

	constructor() {
		if (
			!process.env.NEXT_PUBLIC_SUPABASE_URL ||
			!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
		) {
			throw new Error('Missing required Supabase environment variables')
		}

		// Initialize Supabase client
		this.supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		)
		this.setupDatabaseSubscription()
	}

	private setupDatabaseSubscription() {
		this.channel = this.supabase
			.channel('kyc_status_changes')
			.on(
				'postgres_changes' as const,
				{
					event: '*',
					schema: 'public',
					table: 'kyc_status',
				},
				(payload: RealtimePostgresChangesPayload<KYCStatusChange>) => {
					console.log('Received KYC status change:', payload)

					const newRecord = payload.new as KYCStatusData

					const update: KYCUpdate = {
						type: 'kyc_status',
						data: {
							user_id: String(newRecord.user_id),
							status: String(newRecord.status),
							verification_level: String(newRecord.verification_level),
							timestamp: new Date().toISOString(),
						},
					}
					this.broadcastUpdate(update)
				},
			)
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log('Successfully subscribed to KYC status changes')
				} else {
					console.error('Failed to subscribe to KYC status changes:', status)
				}
			})
	}

	public handleConnection(ws: ServerWebSocket<KYCWebSocketData>) {
		this.clients.add(ws)
		console.log(`KYC WebSocket client connected: ${ws.data.clientId}`)

		// Send initial KYC status if userId is provided
		if (ws.data.userId) {
			this.sendInitialStatus(ws)
		}
	}

	public handleDisconnection(ws: ServerWebSocket<KYCWebSocketData>) {
		this.clients.delete(ws)
		console.log(`KYC WebSocket client disconnected: ${ws.data.clientId}`)
	}

	private async sendInitialStatus(ws: ServerWebSocket<KYCWebSocketData>) {
		try {
			if (!ws.data.userId) {
				return
			}

			const { data: status, error } = await this.supabase
				.from('kyc_status')
				.select('*')
				.eq('user_id', ws.data.userId)
				.single()

			if (error) {
				console.error('Error fetching KYC status:', error)
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'Failed to fetch KYC status',
					}),
				)
				return
			}

			if (status) {
				const kycStatus = status as KYCStatusData
				const update: KYCUpdate = {
					type: 'kyc_status',
					data: {
						user_id: String(kycStatus.user_id),
						status: String(kycStatus.status),
						verification_level: String(kycStatus.verification_level),
						timestamp: new Date().toISOString(),
					},
				}
				ws.send(JSON.stringify(update))
			} else {
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'No KYC status found for this user',
					}),
				)
			}
		} catch (error) {
			console.error('Error sending initial KYC status:', error)
			ws.send(
				JSON.stringify({ type: 'error', message: 'Internal server error' }),
			)
		}
	}

	private broadcastUpdate(update: KYCUpdate) {
		const message = JSON.stringify(update)
		let sentCount = 0

		for (const client of this.clients) {
			if (client.data.userId === update.data.user_id) {
				try {
					client.send(message)
					sentCount++
				} catch (error) {
					console.error('Error sending update to client:', error)
					this.clients.delete(client)
				}
			}
		}

		console.log(`Broadcasted KYC update to ${sentCount} clients`)
	}

	public async cleanup() {
		if (this.channel) {
			await this.channel.unsubscribe()
		}
	}
}

export const kycWebSocketService = new KYCWebSocketService()
