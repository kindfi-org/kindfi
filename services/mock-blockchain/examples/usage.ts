import { MockBlockchainClient } from '../src/client';

/**
 * Example usage of the MockBlockchainClient
 */
async function main() {
  try {
    // Initialize the client
    const client = new MockBlockchainClient('http://localhost:3800');
    
    console.log('--- Mock Blockchain Client Example ---');
    
    // Configure the mock services
    console.log('Updating configuration...');
    await client.config.update({ delay: 300, errorRate: 0.05 });
    const config = await client.config.get();
    console.log('Current config:', config);
    
    // Sample wallet addresses
    const userAddress = '0xUser123456789abcdef';
    const recipientAddress = '0xRecipient987654321fedcba';
    
    // Mint an NFT
    console.log(`\nMinting NFT for ${userAddress}...`);
    const tokenId = await client.nft.mint(
      userAddress, 
      'https://kindfi.example/metadata/nft1'
    );
    console.log(`Minted NFT with token ID: ${tokenId}`);
    
    // Get token details
    console.log('\nGetting token details...');
    const token = await client.nft.getToken(tokenId);
    console.log('Token details:', token);
    
    // Award reputation points
    console.log(`\nAwarding points to ${userAddress}...`);
    await client.reputation.awardPoints(
      userAddress, 
      100, 
      'Created a new campaign'
    );
    
    // Get updated reputation
    console.log('\nGetting reputation data...');
    const reputation = await client.reputation.getReputation(userAddress);
    console.log('Reputation data:', reputation);
    
    // Transfer NFT to another address
    console.log(`\nTransferring NFT ${tokenId} to ${recipientAddress}...`);
    await client.nft.transfer(userAddress, recipientAddress, tokenId);
    
    // Verify the transfer
    console.log('\nVerifying transfer...');
    const updatedToken = await client.nft.getToken(tokenId);
    console.log('Updated token details:', updatedToken);
    
    // Get top users by reputation
    console.log('\nGetting top users by reputation...');
    const topUsers = await client.reputation.getTopAddresses(5);
    console.log('Top users:', topUsers);
    
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
main();