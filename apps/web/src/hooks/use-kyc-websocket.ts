import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface KYCUpdate {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  type: 'status_change' | 'new_signup';
}

interface UseKYCWebSocketProps {
  userId?: string;
  isAdmin?: boolean;
  onUpdate?: (update: KYCUpdate) => void;
}

interface ConnectionMetrics {
  latency: number;
  reconnectAttempts: number;
  lastReconnectTime: number | null;
  connectionQuality: 'good' | 'poor' | 'unstable';
}

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const RECONNECT_ATTEMPTS = 10;
const LATENCY_THRESHOLD_POOR = 500;
const LATENCY_THRESHOLD_UNSTABLE = 1000; 

export function useKYCWebSocket({ userId, isAdmin, onUpdate }: UseKYCWebSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<KYCUpdate | null>(null);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    reconnectAttempts: 0,
    lastReconnectTime: null,
    connectionQuality: 'good',
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentReconnectDelay = useRef(INITIAL_RECONNECT_DELAY);

  const measureLatency = (socket: Socket) => {
    const start = Date.now();
    socket.emit('ping');
    socket.once('pong', () => {
      const latency = Date.now() - start;
      setMetrics(prev => ({
        ...prev,
        latency,
        connectionQuality: 
          latency > LATENCY_THRESHOLD_UNSTABLE ? 'unstable' :
          latency > LATENCY_THRESHOLD_POOR ? 'poor' : 'good'
      }));
    });
  };

  const handleReconnect = () => {
    setMetrics(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
      lastReconnectTime: Date.now(),
    }));

    currentReconnectDelay.current = Math.min(
      currentReconnectDelay.current * 1.5,
      MAX_RECONNECT_DELAY
    );
  };

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_KYC_SERVER_URL || 'http://localhost:4000', {
      reconnectionAttempts: RECONNECT_ATTEMPTS,
      reconnectionDelay: currentReconnectDelay.current,
      reconnectionDelayMax: MAX_RECONNECT_DELAY,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      currentReconnectDelay.current = INITIAL_RECONNECT_DELAY;
      setMetrics(prev => ({ ...prev, reconnectAttempts: 0 }));
      toast.success('Connected to KYC updates');

      if (userId) {
        socketInstance.emit('subscribe_kyc_updates', userId);
      }
      if (isAdmin) {
        socketInstance.emit('join', 'admin_dashboard');
      }

      pingIntervalRef.current = setInterval(() => measureLatency(socketInstance), 30000);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from KYC updates');
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      handleReconnect();

      if (metrics.reconnectAttempts >= RECONNECT_ATTEMPTS) {
        toast.error('Failed to connect to KYC server. Please check your connection.');
        socketInstance.disconnect();
      } else {
        toast.error(`Connection attempt failed (${metrics.reconnectAttempts}/${RECONNECT_ATTEMPTS})`);
      }
    });

    socketInstance.on('kyc_update', (update: KYCUpdate) => {
      setLastUpdate(update);
      onUpdate?.(update);

      if (update.type === 'status_change') {
        toast.info(`KYC status updated to ${update.status}`);
      } else if (isAdmin && update.type === 'new_signup') {
        toast.info('New KYC application received');
      }
    });

    setSocket(socketInstance);

    return () => {
      if (userId) {
        socketInstance.emit('unsubscribe_kyc_updates', userId);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, [userId, isAdmin, onUpdate, metrics.reconnectAttempts]);

  return {
    isConnected,
    lastUpdate,
    socket,
    metrics,
  };
} 