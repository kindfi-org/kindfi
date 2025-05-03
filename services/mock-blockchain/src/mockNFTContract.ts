import { NFTContractInterface, NFTToken } from './interfaces';
import { simulateDelay, simulateError } from './utils';

export class MockNFTContract implements NFTContractInterface {
  private tokens: Map<string, NFTToken> = new Map();
  private ownerTokens: Map<string, Set<string>> = new Map();
  private nextTokenId: number = 1;
  private config: {
    delay: number;
    errorRate: number;
  };

  constructor(config = { delay: 500, errorRate: 0.1 }) {
    this.config = config;
  }

  async mint(to: string, metadataUrl: string): Promise<string> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to mint NFT: Network error');

    const tokenId = this.nextTokenId.toString();
    this.nextTokenId++;
    
    const token: NFTToken = {
      owner: to,
      metadataUrl,
      tier: 'Bronze',
      lastUpdated: Date.now()
    };
    
    this.tokens.set(tokenId, token);
    
    // Add to owner's tokens
    if (!this.ownerTokens.has(to)) {
      this.ownerTokens.set(to, new Set());
    }
    this.ownerTokens.get(to)!.add(tokenId);
    
    return tokenId;
  }
  
  async getToken(tokenId: string): Promise<NFTToken | null> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to get token: Network error');
    
    return this.tokens.get(tokenId) || null;
  }
  
  async transfer(from: string, to: string, tokenId: string): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to transfer NFT: Network error');
    
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} does not exist`);
    }
    
    if (token.owner !== from) {
      throw new Error(`Token ${tokenId} is not owned by ${from}`);
    }
    
    // Update token owner
    token.owner = to;
    token.lastUpdated = Date.now();
    this.tokens.set(tokenId, token);
    
    // Update owner mappings
    this.ownerTokens.get(from)?.delete(tokenId);
    if (!this.ownerTokens.has(to)) {
      this.ownerTokens.set(to, new Set());
    }
    this.ownerTokens.get(to)!.add(tokenId);
    
    return true;
  }
  
  async updateMetadata(tokenId: string, metadataUrl: string): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to update metadata: Network error');
    
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} does not exist`);
    }
    
    token.metadataUrl = metadataUrl;
    token.lastUpdated = Date.now();
    this.tokens.set(tokenId, token);
    
    return true;
  }
  
  async upgradeTier(tokenId: string, newTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to upgrade tier: Network error');
    
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token ${tokenId} does not exist`);
    }
    
    const tierValues = {
      'Bronze': 1,
      'Silver': 2,
      'Gold': 3,
      'Platinum': 4
    };
    
    if (tierValues[newTier] <= tierValues[token.tier]) {
      throw new Error(`Cannot downgrade tier from ${token.tier} to ${newTier}`);
    }
    
    token.tier = newTier;
    token.lastUpdated = Date.now();
    this.tokens.set(tokenId, token);
    
    return true;
  }
  
  async getOwnerTokens(owner: string): Promise<string[]> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to get owner tokens: Network error');
    
    const ownerSet = this.ownerTokens.get(owner);
    return ownerSet ? Array.from(ownerSet) : [];
  }
}