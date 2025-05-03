import { MockNFTContract } from './mockNFTContract';
import { MockReputationContract } from './mockReputationContract';
import { MockBlockchainServer } from './server';
import { MockBlockchainClient } from './client';

// Export all classes
export {
  MockNFTContract,
  MockReputationContract,
  MockBlockchainServer,
  MockBlockchainClient
};

// Export interfaces
export * from './interfaces';

// Start server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3800;
  const delay = process.env.DELAY ? parseInt(process.env.DELAY, 10) : 500;
  const errorRate = process.env.ERROR_RATE ? parseFloat(process.env.ERROR_RATE) : 0.1;
  
  const server = new MockBlockchainServer(port, { delay, errorRate });
  server.start();
}