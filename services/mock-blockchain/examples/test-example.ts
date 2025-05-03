import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { MockNFTContract, MockReputationContract } from '../src';

describe('Mock Blockchain Contracts', () => {
  let nftContract: MockNFTContract;
  let reputationContract: MockReputationContract;
  
  // Sample user addresses
  const firstUser = '0xUser123456789abcdef';
  const secondUser = '0xRecipient987654321fedcba';
  
  // Test data
  let mintedTokenId: string;
  
  beforeAll(() => {
    // Initialize contracts with minimal delay and no errors for testing
    nftContract = new MockNFTContract({ delay: 0, errorRate: 0 });
    reputationContract = new MockReputationContract({ delay: 0, errorRate: 0 });
  });
  
  describe('NFT Contract', () => {
    it('should mint a new NFT', async () => {
      // Mint an NFT
      mintedTokenId = await nftContract.mint(firstUser, 'https://example.com/metadata/1');
      
      // Verify the token ID was returned
      expect(mintedTokenId).toBeDefined();
      expect(typeof mintedTokenId).toBe('string');
    });
    
    it('should retrieve the NFT details', async () => {
      // Get the token
      const token = await nftContract.getToken(mintedTokenId);
      
      // Verify token details
      expect(token).toBeDefined();
      expect(token?.owner).toBe(firstUser);
      expect(token?.metadataUrl).toBe('https://example.com/metadata/1');
      expect(token?.tier).toBe('Bronze'); // Default tier
    });
    
    it('should transfer the NFT to another user', async () => {
      // Transfer the NFT
      const result = await nftContract.transfer(firstUser, secondUser, mintedTokenId);
      
      // Verify transfer was successful
      expect(result).toBe(true);
      
      // Get updated token
      const token = await nftContract.getToken(mintedTokenId);
      
      // Verify ownership changed
      expect(token?.owner).toBe(secondUser);
    });
    
    it('should upgrade the NFT tier', async () => {
      // Upgrade the tier
      const result = await nftContract.upgradeTier(mintedTokenId, 'Silver');
      
      // Verify upgrade was successful
      expect(result).toBe(true);
      
      // Get updated token
      const token = await nftContract.getToken(mintedTokenId);
      
      // Verify tier was upgraded
      expect(token?.tier).toBe('Silver');
    });
    
    it('should fail when trying to downgrade tier', async () => {
      // Try to downgrade from Silver to Bronze
      try {
        await nftContract.upgradeTier(mintedTokenId, 'Bronze');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw an error
        expect(error.message).toContain('Cannot downgrade tier');
      }
    });
  });
  
  describe('Reputation Contract', () => {
    it('should initialize reputation for a new user', async () => {
      // Get reputation for a new user
      const reputation = await reputationContract.getReputation(firstUser);
      
      // Verify initial state
      expect(reputation.address).toBe(firstUser);
      expect(reputation.points).toBe(0);
      expect(reputation.level).toBe(1);
      expect(reputation.history).toEqual([]);
    });
    
    it('should award points', async () => {
      // Award points
      const result = await reputationContract.awardPoints(firstUser, 150, 'Created Campaign');
      
      // Verify success
      expect(result).toBe(true);
      
      // Get updated reputation
      const reputation = await reputationContract.getReputation(firstUser);
      
      // Verify points increased
      expect(reputation.points).toBe(150);
      expect(reputation.level).toBe(2); // Level should be updated
      expect(reputation.history.length).toBe(1);
      expect(reputation.history[0].action).toBe('Created Campaign');
      expect(reputation.history[0].points).toBe(150);
    });
    
    it('should deduct points', async () => {
      // Deduct points
      const result = await reputationContract.deductPoints(firstUser, 50, 'Missed Deadline');
      
      // Verify success
      expect(result).toBe(true);
      
      // Get updated reputation
      const reputation = await reputationContract.getReputation(firstUser);
      
      // Verify points decreased
      expect(reputation.points).toBe(100);
      expect(reputation.history.length).toBe(2);
      expect(reputation.history[1].action).toBe('Missed Deadline');
      expect(reputation.history[1].points).toBe(-50);
    });
    
    it('should get top addresses by reputation', async () => {
      // Award points to second user
      await reputationContract.awardPoints(secondUser, 200, 'Completed Project');
      
      // Get top addresses
      const topAddresses = await reputationContract.getTopAddresses(2);
      
      // Verify correct order
      expect(topAddresses.length).toBe(2);
      expect(topAddresses[0].address).toBe(secondUser);
      expect(topAddresses[0].points).toBe(200);
      expect(topAddresses[1].address).toBe(firstUser);
      expect(topAddresses[1].points).toBe(100);
    });
  });
});