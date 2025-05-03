import { NFTContractInterface, NFTToken, ReputationContractInterface, ReputationData } from './interfaces';

/**
 * HTTP Client for Mock Blockchain Server
 */
export class MockBlockchainClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3800') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  /**
   * NFT Contract Client
   */
  nft = {
    mint: async (to: string, metadataUrl: string): Promise<string> => {
      const response = await this.request<{ tokenId: string }>('/nft/mint', 'POST', { to, metadataUrl });
      return response.tokenId;
    },

    getToken: async (tokenId: string): Promise<NFTToken | null> => {
      const response = await this.request<{ token: NFTToken | null }>(`/nft/token/${tokenId}`);
      return response.token;
    },

    transfer: async (from: string, to: string, tokenId: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>('/nft/transfer', 'POST', { from, to, tokenId });
      return response.success;
    },

    updateMetadata: async (tokenId: string, metadataUrl: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>(`/nft/metadata/${tokenId}`, 'PUT', { metadataUrl });
      return response.success;
    },

    upgradeTier: async (tokenId: string, tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>(`/nft/upgrade/${tokenId}`, 'PUT', { tier });
      return response.success;
    },

    getOwnerTokens: async (owner: string): Promise<string[]> => {
      const response = await this.request<{ tokens: string[] }>(`/nft/owner/${owner}`);
      return response.tokens;
    }
  };

  /**
   * Reputation Contract Client
   */
  reputation = {
    getReputation: async (address: string): Promise<ReputationData> => {
      const response = await this.request<{ reputation: ReputationData }>(`/reputation/${address}`);
      return response.reputation;
    },

    awardPoints: async (address: string, points: number, action: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>('/reputation/award', 'POST', { address, points, action });
      return response.success;
    },

    deductPoints: async (address: string, points: number, reason: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>('/reputation/deduct', 'POST', { address, points, reason });
      return response.success;
    },

    calculateLevel: async (points: number): Promise<number> => {
      const response = await this.request<{ level: number }>(`/reputation/level/${points}`);
      return response.level;
    },

    getTopAddresses: async (limit: number): Promise<ReputationData[]> => {
      const response = await this.request<{ topAddresses: ReputationData[] }>(`/reputation/top/${limit}`);
      return response.topAddresses;
    },

    resetReputation: async (address: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>(`/reputation/reset/${address}`, 'POST');
      return response.success;
    }
  };

  /**
   * Configuration
   */
  config = {
    get: async (): Promise<{ delay: number, errorRate: number }> => {
      return this.request<{ delay: number, errorRate: number }>('/config');
    },

    update: async (config: { delay?: number, errorRate?: number }): Promise<{ delay: number, errorRate: number }> => {
      const response = await this.request<{ config: { delay: number, errorRate: number } }>('/config', 'PUT', config);
      return response.config;
    }
  };
}