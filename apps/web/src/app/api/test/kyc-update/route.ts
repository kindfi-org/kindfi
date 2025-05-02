import { NextResponse } from 'next/server';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_KYC_SERVER_URL || 'http://localhost:4000');

export async function POST(request: Request) {
  try {
    const { user_id, status } = await request.json();

    if (!user_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const update = {
      userId: user_id,
      status,
      timestamp: new Date().toISOString(),
      type: 'status_change' as const,
    };

    // Emit the update through the WebSocket server
    socket.emit('kyc_update', update);

    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error('Error simulating KYC update:', error);
    return NextResponse.json(
      { error: 'Failed to simulate KYC update' },
      { status: 500 }
    );
  }
} 