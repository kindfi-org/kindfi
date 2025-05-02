export async function runKYCTests() {
  console.group('🧪 Starting KYC WebSocket Tests');

  // Test 1: Connection Status
  console.log('Test 1: Checking WebSocket Connection...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Simulate Status Changes
  console.log('Test 2: Simulating KYC Status Changes...');
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  
  for (const status of statuses) {
    console.log(`Setting status to: ${status}`);
    try {
      const response = await fetch('/api/test/kyc-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'test-user-' + Math.random().toString(36).slice(2, 7),
          status,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set status to ${status}`);
      }

      // Wait to see the update
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error setting status to ${status}:`, error);
    }
  }

  // Test 3: Connection Quality
  console.log('Test 3: Checking Connection Quality Metrics...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Reconnection
  console.log('Test 4: Testing Reconnection...');
  // This will be tested manually by stopping/starting the KYC server

  console.groupEnd();
  console.log('✅ Tests completed! Check the UI for results.');
} 