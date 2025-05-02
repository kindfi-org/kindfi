# KYC Server

A real-time KYC (Know Your Customer) verification server with WebSocket support for live updates.

## Features

- Real-time KYC status updates via WebSocket
- Integration with Supabase for data persistence
- Support for multiple client connections
- Automatic reconnection handling
- Room-based updates for specific users and admin dashboard

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create a `.env` file with the following variables:
```env
PORT=4000
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Start the development server:
```bash
bun run dev
```

## WebSocket Events

### Client Events

- `subscribe_kyc_updates`: Subscribe to updates for a specific user
  ```typescript
  socket.emit('subscribe_kyc_updates', userId: string)
  ```

- `unsubscribe_kyc_updates`: Unsubscribe from updates for a specific user
  ```typescript
  socket.emit('unsubscribe_kyc_updates', userId: string)
  ```

### Server Events

- `kyc_update`: Emitted when a KYC status changes or a new application is received
  ```typescript
  interface KYCUpdate {
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
    type: 'status_change' | 'new_signup';
  }
  ```

## Integration with Web App

1. Create a `.env.local` file in the web app directory with:
```env
NEXT_PUBLIC_KYC_SERVER_URL=http://localhost:4000
```

2. Use the `useKYCWebSocket` hook in your components:
```typescript
const { isConnected, lastUpdate } = useKYCWebSocket({
  userId: 'user-123', // Optional: for user-specific updates
  isAdmin: true, // Optional: for admin dashboard
  onUpdate: (update) => {
    // Handle updates
  },
});
```

## Architecture

The KYC server uses a room-based WebSocket architecture:
- Each user has their own room (`kyc_updates_${userId}`)
- Admins join the `admin_dashboard` room
- Updates are broadcasted to relevant rooms based on the event type

## Error Handling

- Automatic reconnection attempts (5 times with increasing delay)
- Fallback to SSR data when WebSocket is unavailable
- Toast notifications for connection status
