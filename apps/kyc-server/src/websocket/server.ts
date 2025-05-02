import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { createClient } from '@services/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/*
 * @property userId - The ID of the user whose KYC status is being updated
 * @property status - The new KYC verification status
 * @property timestamp - ISO timestamp of when the update occurred
 * @property type - Whether this is a new signup or status change
 */
export interface KYCUpdate {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  type: 'status_change' | 'new_signup';
}

/**
 * @property
 * @property 
 */
interface KYCVerification {
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
}

export class WebSocketServer {
  private io: Server;
  private supabase = createClient();

  /**
   * @param httpServer
   */
  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
    this.setupSupabaseSubscription();
  }

  /**
   * @private
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe_kyc_updates', (userId: string) => {
        socket.join(`kyc_updates_${userId}`);
      });

      socket.on('unsubscribe_kyc_updates', (userId: string) => {
        socket.leave(`kyc_updates_${userId}`);
      });

      socket.on('join', (room: string) => {
        socket.join(room);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  /**
   * @private
   */
  private setupSupabaseSubscription() {
    const channel = this.supabase.channel('kyc_updates');
    
    channel
      .on(
        'postgres_changes' as any,
        {
          event: '*' as any,
          schema: 'public' as any,
          table: 'kyc_verifications' as any,
        } as any,
        ((payload: RealtimePostgresChangesPayload<KYCVerification>) => {
          const data = payload.new as KYCVerification;
          if (!data) return;

          const update: KYCUpdate = {
            userId: data.user_id,
            status: data.status,
            timestamp: new Date().toISOString(),
            type: payload.eventType === 'INSERT' ? 'new_signup' : 'status_change',
          };


          this.io.to(`kyc_updates_${update.userId}`).emit('kyc_update', update);

          this.io.to('admin_dashboard').emit('kyc_update', update);
        }) as any
      )
      .subscribe();
  }

  /**
   * @param update 
   * @public
   */
  public broadcastKYCUpdate(update: KYCUpdate) {
    this.io.to(`kyc_updates_${update.userId}`).emit('kyc_update', update);
    this.io.to('admin_dashboard').emit('kyc_update', update);
  }
}
