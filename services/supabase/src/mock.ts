type Listener = (payload: any) => void;

class MockChannel {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: 'postgres_changes' | 'presence' | 'broadcast', filter: any, callback: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) || []), callback]);
    return this;
  }

  subscribe() {
    return this;
  }

  simulateChange(eventType: 'INSERT' | 'UPDATE' | 'DELETE', data: any) {
    const listeners = this.listeners.get('postgres_changes') || [];
    listeners.forEach(callback => {
      callback({
        eventType,
        new: data,
        old: null,
        schema: 'public',
        table: 'kyc_verifications'
      });
    });
  }
}

class MockSupabase {
  private mockChannel = new MockChannel();

  channel() {
    return this.mockChannel;
  }

  from(table: string) {
    return {
      upsert: async (data: any) => {
        console.log(`Mock upsert to ${table}:`, data);
        this.mockChannel.simulateChange(
          data.id ? 'UPDATE' : 'INSERT',
          data
        );
        return { error: null };
      },
      select: async () => {
        return {
          data: [],
          error: null,
        };
      },
    };
  }
}

export const createMockClient = () => new MockSupabase(); 