type Listener = (payload: any) => void;

class MockChannel {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, filter: any, callback: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) || []), callback]);
    return this;
  }

  subscribe() {
    return this;
  }

  // Method to simulate database changes
  simulateChange(eventType: 'INSERT' | 'UPDATE', data: any) {
    const listeners = this.listeners.get('postgres_changes') || [];
    listeners.forEach(callback => {
      callback({
        eventType,
        new: data,
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
        // Simulate the change
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

  auth = {
    onAuthStateChange: (callback: any) => {
      // Simulate initial auth state
      setTimeout(() => {
        callback('SIGNED_IN', {
          user: { id: 'mock-user', email: 'mock@example.com' }
        });
      }, 0);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };
}

export const createClient = () => new MockSupabase(); 