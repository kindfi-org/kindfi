import { appEnvConfig } from '@packages/lib/config'
import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type {
	RealtimeChannel,
	RealtimePostgresChangesPayload,
	Subscription,
} from '@supabase/supabase-js'
import type { ServerWebSocket } from 'bun'

const appConfig = appEnvConfig()

interface KYCWebSocketData {
	clientId: string
	joinedAt: string
	userId?: string
}

interface KYCStatusRecord {
	user_id: string
	status: string
	verification_level: string
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

export class KYCWebSocketService {
	private clients: Set<ServerWebSocket<KYCWebSocketData>> = new Set()
	private supabase: TypedSupabaseClient | null = null
	private channel?: RealtimeChannel
	private isInitialized = false

	constructor() {
		if (!appConfig.database.url || !appConfig.database.anonKey) {
			throw new Error('Missing required Supabase environment variables')
		}

		this.initializeSupabase()
	}

	private async initializeSupabase() {
		try {
			this.supabase = await createSupabaseServerClient()
			if (!this.supabase) {
				throw new Error('Failed to create Supabase client')
			}
			this.isInitialized = true
			this.setupDatabaseSubscription()
		} catch (error) {
			console.error('Failed to initialize Supabase client:', error)
			throw error
		}
	}

	private setupDatabaseSubscription() {
		if (!this.supabase) {
			console.error('Supabase client not initialized')
			return
		}

		this.channel = this.supabase
			.channel('kyc_status_changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'kyc_status',
				},
				(payload: RealtimePostgresChangesPayload<KYCStatusRecord>) => {
					console.log('Received KYC status change:', payload)

					const newRecord = payload.new as KYCStatusRecord

					const update: KYCUpdate = {
						type: 'kyc_status',
						data: {
							user_id: newRecord.user_id,
							status: newRecord.status,
							verification_level: newRecord.verification_level,
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

		// Send initial KYC status if userId is provided and client is initialized
		if (ws.data.userId && this.isInitialized) {
			this.sendInitialStatus(ws)
		}
	}

	public handleDisconnection(ws: ServerWebSocket<KYCWebSocketData>) {
		this.clients.delete(ws)
		console.log(`KYC WebSocket client disconnected: ${ws.data.clientId}`)
	}

	private async sendInitialStatus(ws: ServerWebSocket<KYCWebSocketData>) {
		if (!this.supabase) {
			ws.send(
				JSON.stringify({
					type: 'error',
					message: 'Service not ready',
				}),
			)
			return
		}

		try {
			const { data: status, error } = await this.supabase
				.from('kyc_status')
				.select('*')
				.eq('user_id', ws.data.userId || 'no-user-id')
				.maybeSingle()

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
				const kycStatus = status as KYCStatusRecord
				const update: KYCUpdate = {
					type: 'kyc_status',
					data: {
						user_id: kycStatus.user_id,
						status: kycStatus.status,
						verification_level: kycStatus.verification_level,
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
