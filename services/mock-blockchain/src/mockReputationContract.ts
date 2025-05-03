import { ReputationContractInterface, ReputationData } from './interfaces';
import { simulateDelay, simulateError } from './utils';

export class MockReputationContract implements ReputationContractInterface {
  private reputations: Map<string, ReputationData> = new Map();
  private config: {
    delay: number;
    errorRate: number;
  };

  constructor(config = { delay: 500, errorRate: 0.1 }) {
    this.config = config;
  }

  async getReputation(address: string): Promise<ReputationData> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to get reputation: Network error');
    
    if (!this.reputations.has(address)) {
      // Initialize a new reputation record for this address
      const newRep: ReputationData = {
        address,
        points: 0,
        level: 1,
        history: [],
        lastUpdated: Date.now()
      };
      this.reputations.set(address, newRep);
      return newRep;
    }
    
    return this.reputations.get(address)!;
  }
  
  async awardPoints(address: string, points: number, action: string): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to award points: Network error');
    
    if (points <= 0) {
      throw new Error('Points to award must be positive');
    }
    
    const repData = await this.getReputation(address);
    
    repData.points += points;
    repData.level = await this.calculateLevel(repData.points);
    repData.history.push({
      timestamp: Date.now(),
      action,
      points
    });
    repData.lastUpdated = Date.now();
    
    this.reputations.set(address, repData);
    return true;
  }
  
  async deductPoints(address: string, points: number, reason: string): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to deduct points: Network error');
    
    if (points <= 0) {
      throw new Error('Points to deduct must be positive');
    }
    
    const repData = await this.getReputation(address);
    
    // Don't allow negative points
    const newPoints = Math.max(0, repData.points - points);
    const actualDeduction = repData.points - newPoints;
    
    repData.points = newPoints;
    repData.level = await this.calculateLevel(repData.points);
    repData.history.push({
      timestamp: Date.now(),
      action: reason,
      points: -actualDeduction
    });
    repData.lastUpdated = Date.now();
    
    this.reputations.set(address, repData);
    return true;
  }
  
  async calculateLevel(points: number): Promise<number> {
    await simulateDelay(this.config.delay / 2); // Faster calculation
    await simulateError(this.config.errorRate / 2, 'Failed to calculate level: Network error');
    
    // Simple level calculation: 1 level per 100 points, minimum level 1
    return Math.max(1, Math.floor(points / 100) + 1);
  }
  
  async getTopAddresses(limit: number): Promise<ReputationData[]> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to get top addresses: Network error');
    
    const allReputations = Array.from(this.reputations.values());
    
    // Sort by points in descending order
    allReputations.sort((a, b) => b.points - a.points);
    
    // Return top N
    return allReputations.slice(0, limit);
  }
  
  async resetReputation(address: string): Promise<boolean> {
    await simulateDelay(this.config.delay);
    await simulateError(this.config.errorRate, 'Failed to reset reputation: Network error');
    
    if (!this.reputations.has(address)) {
      return false;
    }
    
    const repData = this.reputations.get(address)!;
    
    // Reset but keep history
    const resetRep: ReputationData = {
      ...repData,
      points: 0,
      level: 1,
      history: [
        ...repData.history,
        {
          timestamp: Date.now(),
          action: 'ADMIN_RESET',
          points: -repData.points
        }
      ],
      lastUpdated: Date.now()
    };
    
    this.reputations.set(address, resetRep);
    return true;
  }
}