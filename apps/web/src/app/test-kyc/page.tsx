'use client';

import { useState } from 'react';
import { useKYCWebSocket, type KYCUpdate } from '@/hooks/use-kyc-websocket';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestKYCPage() {
  const [userId] = useState('test-user-' + Math.random().toString(36).slice(2, 7));
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'pending' | 'success' | 'error'; message?: string }>>([]);
  
  const { isConnected, lastUpdate, metrics, socket } = useKYCWebSocket({
    userId,
    isAdmin: true,
    onUpdate: (update: KYCUpdate) => {
      console.log('Received update:', update);
      addTestResult('WebSocket Update', 'success', `Received ${update.type} update for user ${update.userId}`);
    },
  });

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message?: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  const runConnectionTest = async () => {
    addTestResult('Connection Test', 'pending');
    try {
      if (isConnected) {
        addTestResult('Connection Test', 'success', 'WebSocket connected successfully');
      } else {
        addTestResult('Connection Test', 'error', 'WebSocket connection failed');
      }
    } catch (error) {
      addTestResult('Connection Test', 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const simulateKYCUpdate = async (status: 'pending' | 'approved' | 'rejected') => {
    addTestResult(`KYC ${status} Test`, 'pending');
    try {
      const response = await fetch('/api/test/kyc-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to simulate KYC update');
      }

      addTestResult(`KYC ${status} Test`, 'success', `Status update to ${status} sent successfully`);
    } catch (error) {
      addTestResult(`KYC ${status} Test`, 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    // Test 1: Connection
    await runConnectionTest();
    
    // Test 2: Status Updates
    for (const status of ['pending', 'approved', 'rejected'] as const) {
      await simulateKYCUpdate(status);
      // Wait for WebSocket update
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 3: Connection Quality
    addTestResult('Connection Quality', 'success', `Latency: ${metrics.latency}ms, Quality: ${metrics.connectionQuality}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">KYC WebSocket Test Dashboard</h1>
            <p className="text-gray-600">Testing real-time KYC updates and WebSocket functionality</p>
          </div>
          <Button onClick={runAllTests}>Run All Tests</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'success' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <span className="text-sm text-gray-600">WebSocket Status</span>
              </div>
              <p><strong>User ID:</strong> {userId}</p>
              <p><strong>Latency:</strong> {metrics.latency}ms</p>
              <p><strong>Quality:</strong> {metrics.connectionQuality}</p>
              <p><strong>Reconnection Attempts:</strong> {metrics.reconnectAttempts}</p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Manual Testing</h2>
            <div className="flex gap-2">
              <Button onClick={() => simulateKYCUpdate('pending')} variant="outline">Test Pending</Button>
              <Button onClick={() => simulateKYCUpdate('approved')} variant="outline">Test Approved</Button>
              <Button onClick={() => simulateKYCUpdate('rejected')} variant="outline">Test Rejected</Button>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Badge variant={
                  result.status === 'success' ? 'success' :
                  result.status === 'error' ? 'destructive' : 'default'
                }>
                  {result.status === 'success' ? '✓' :
                   result.status === 'error' ? '✗' : '⋯'}
                </Badge>
                <span className="font-medium">{result.name}</span>
                {result.message && (
                  <span className="text-sm text-gray-600">- {result.message}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Last Update</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(lastUpdate, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
} 