// Define the NFT Token structure
export interface NFTToken {
    owner: string;
    metadataUrl: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    lastUpdated: number;
  }
  
  // NFT Contract Interface
  export interface NFTContractInterface {
    // Mint a new NFT
    mint(to: string, metadataUrl: string): Promise<string>;
    
    // Get NFT details by token ID
    getToken(tokenId: string): Promise<NFTToken | null>;
    
    // Transfer NFT to a new owner
    transfer(from: string, to: string, tokenId: string): Promise<boolean>;
    
    // Update NFT metadata
    updateMetadata(tokenId: string, metadataUrl: string): Promise<boolean>;
    
    // Upgrade NFT tier
    upgradeTier(tokenId: string, newTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'): Promise<boolean>;
    
    // Get all NFTs owned by an address
    getOwnerTokens(owner: string): Promise<string[]>;
  }
  
  // Reputation points structure
  export interface ReputationData {
    address: string;
    points: number;
    level: number;
    history: Array<{
      timestamp: number;
      action: string;
      points: number;
    }>;
    lastUpdated: number;
  }
  
  // Reputation Contract Interface
  export interface ReputationContractInterface {
    // Get reputation data for an address
    getReputation(address: string): Promise<ReputationData>;
    
    // Award points to an address
    awardPoints(address: string, points: number, action: string): Promise<boolean>;
    
    // Deduct points from an address
    deductPoints(address: string, points: number, reason: string): Promise<boolean>;
    
    // Calculate level based on points
    calculateLevel(points: number): Promise<number>;
    
    // Get the top N addresses by reputation
    getTopAddresses(limit: number): Promise<ReputationData[]>;
    
    // Reset reputation (admin function)
    resetReputation(address: string): Promise<boolean>;
  }