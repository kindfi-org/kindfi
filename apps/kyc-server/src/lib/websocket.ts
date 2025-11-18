import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { AppEnvInterface, TypedSupabaseClient } from '@packages/lib/types'
import type {
	RealtimeChannel,
	RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import type { ServerWebSocket } from 'bun'

import {
	type KYCUpdate,
	kycStatusRecordSchema,
	kycUpdateDataSchema,
} from '~/lib/validation/kyc-schemas'

const appConfig: AppEnvInterface = appEnvConfig('kyc-server')

interface KYCWebSocketData {
	clientId: string
	joinedAt: string
	userId?: string
}

export class KYCWebSocketService {
	private clients: Set<ServerWebSocket<KYCWebSocketData>> = new Set()
	private supabase: TypedSupabaseClient | null = null
	private channel?: RealtimeChannel
	private isInitialized = false

	constructor() {
		if (!appConfig.database.url || !appConfig.database.serviceRoleKey) {
			throw new Error('Missing required Supabase environment variables')
		}

		this.initializeSupabase()
	}

	private initializeSupabase() {
		try {
			this.supabase = supabaseServiceRole as TypedSupabaseClient
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
			.channel('kyc_reviews_changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'kyc_reviews',
				},
				(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
					console.log('Received KYC status change:', payload)

					try {
						const newRecord = kycStatusRecordSchema.parse(payload.new)

						const updateData = kycUpdateDataSchema.parse({
							user_id: newRecord.user_id,
							status: newRecord.status,
							verification_level: newRecord.verification_level,
							timestamp: new Date().toISOString(),
						})

						const update: KYCUpdate = {
							type: 'kyc_status',
							data: updateData,
						}
						this.broadcastUpdate(update)
					} catch (error) {
						console.error('Invalid KYC status record received:', {
							error,
							payload: payload.new,
							context: 'kyc_status_validation_error',
						})
					}
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
				.from('kyc_reviews')
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
				try {
					const kycStatus = kycStatusRecordSchema.parse(status)
					const updateData = kycUpdateDataSchema.parse({
						user_id: kycStatus.user_id,
						status: kycStatus.status,
						verification_level: kycStatus.verification_level,
						timestamp: new Date().toISOString(),
					})

					const update: KYCUpdate = {
						type: 'kyc_status',
						data: updateData,
					}
					ws.send(JSON.stringify(update))
				} catch (error) {
					console.error('Invalid KYC status record in database:', {
						error,
						status,
						context: 'initial_status_validation_error',
					})
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Invalid KYC data format',
						}),
					)
				}
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
