import { ServerWebSocket } from 'bun'
import { createClient } from '@supabase/supabase-js'

interface KYCWebSocketData {
  clientId: string
  joinedAt: string
  userId?: string
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
  private supabase: ReturnType<typeof createClient>
  private channel: ReturnType<typeof createClient>['channel']

  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      'https://gcqrhpprpqyfqabrhmla.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcXJocHBycHF5ZnFhYnJobWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzAxMDYsImV4cCI6MjA0OTM0NjEwNn0.siqYyF5poKJRz8Wgw-YjhkBzvNY_TUn6rWxalx9HY6g'
    )
    this.setupDatabaseSubscription()
  }

  private setupDatabaseSubscription() {
    // Subscribe to KYC status changes using Supabase real-time
    this.channel = this.supabase
      .channel('kyc_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_status'
        },
        (payload) => {
          console.log('Received KYC status change:', payload)
          const update: KYCUpdate = {
            type: 'kyc_status',
            data: {
              user_id: payload.new.user_id,
              status: payload.new.status,
              verification_level: payload.new.verification_level,
              timestamp: new Date().toISOString()
            }
          }
          this.broadcastUpdate(update)
        }
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
      const { data: status, error } = await this.supabase
        .from('kyc_status')
        .select('*')
        .eq('user_id', ws.data.userId!)
        .single()

      if (error) {
        console.error('Error fetching KYC status:', error)
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch KYC status' }))
        return
      }

      if (status) {
        const update: KYCUpdate = {
          type: 'kyc_status',
          data: {
            user_id: status.user_id,
            status: status.status,
            verification_level: status.verification_level,
            timestamp: new Date().toISOString()
          }
        }
        ws.send(JSON.stringify(update))
      } else {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'No KYC status found for this user' 
        }))
      }
    } catch (error) {
      console.error('Error sending initial KYC status:', error)
      ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }))
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