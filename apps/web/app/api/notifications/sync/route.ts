import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@packages/lib/supabase'
const logger = { info: console.info, error: console.error };

const syncPayloadSchema = z.object({
  notificationId: z.string().uuid(),
  status: z.enum(['delivered', 'failed']),
  error: z.string().optional(),
  timestamp: z.number()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = syncPayloadSchema.parse(body);

    // Log the sync attempt
    logger.info('Notification sync attempt:', payload);

    await supabase
      .from('notifications')
      .update({ 
        status: payload.status,
        delivered_at: payload.status === 'delivered' ? new Date(payload.timestamp) : null,
        error: payload.error
      })
      .eq('id', payload.notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Sync error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid sync payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process sync' },
      { status: 500 }
    );
  }
} 