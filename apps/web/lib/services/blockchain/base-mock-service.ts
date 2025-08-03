/**
 * Base class for mock blockchain services providing common functionality
 * like delay simulation, error injection, and event emission
 */

import type { 
  MockServiceConfig, 
  IEventEmitter, 
  EventCallback 
} from '~/lib/types/blockchain/contract-interfaces.types';

export abstract class BaseMockService implements IEventEmitter {
  protected config: Required<MockServiceConfig>;
  private eventListeners: Map<string, Set<EventCallback<any>>> = new Map();

  constructor(config: Partial<MockServiceConfig> = {}) {
    this.config = {
      networkDelay: config.networkDelay ?? 100,
      errorRate: config.errorRate ?? 0.05,
      enableLogging: config.enableLogging ?? true,
      seedData: config.seedData ?? {},
    };

    this.log('Mock service initialized', { config: this.config });
  }

  /**
   * Simulate network delay
   */
  protected async simulateDelay(): Promise<void> {
    if (this.config.networkDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.networkDelay));
    }
  }

  /**
   * Simulate random errors based on error rate
   */
  protected simulateRandomError(operation: string): void {
    if (Math.random() < this.config.errorRate) {
      const error = new Error(`Simulated network error during ${operation}`);
      this.log('Simulated error', { operation, error: error.message });
      throw error;
    }
  }

  /**
   * Log messages if logging is enabled
   */
  protected log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[${this.constructor.name}] ${message}`, data || '');
    }
  }

  /**
   * Generate a realistic timestamp
   */
  protected generateTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Generate a mock address
   */
  protected generateMockAddress(prefix: string = 'GABC'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = prefix;
    for (let i = 0; i < 52; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate address format (basic validation)
   */
  protected validateAddress(address: string): boolean {
    return typeof address === 'string' && 
           address.length === 56 && 
           address.startsWith('G');
  }

  /**
   * Require authentication (simulate user.require_auth())
   */
  protected requireAuth(user: string, operation: string): void {
    if (!this.validateAddress(user)) {
      throw new Error(`Invalid address format for ${operation}: ${user}`);
    }
    this.log('Authentication required', { user, operation });
  }

  /**
   * Event emitter implementation
   */
  on<T>(eventType: string, callback: EventCallback<T>): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
    this.log('Event listener added', { eventType });
  }

  off<T>(eventType: string, callback: EventCallback<T>): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      this.log('Event listener removed', { eventType });
    }
  }

  emit<T>(eventType: string, data: T): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.log('Error in event callback', { eventType, error });
        }
      });
      this.log('Event emitted', { eventType, data });
    }
  }

  /**
   * Create a success result
   */
  protected createSuccessResult<T>(data: T): { success: true; data: T } {
    return { success: true, data };
  }

  /**
   * Create an error result
   */
  protected createErrorResult<E>(error: E): { success: false; error: E } {
    return { success: false, error };
  }

  /**
   * Execute an operation with standard error handling and delay simulation
   */
  protected async executeOperation<T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    this.log(`Starting operation: ${operation}`);
    
    try {
      // Simulate network delay
      await this.simulateDelay();
      
      // Simulate random errors
      this.simulateRandomError(operation);
      
      // Execute the actual operation
      const result = await fn();
      
      this.log(`Operation completed: ${operation}`, { result });
      return result;
    } catch (error) {
      this.log(`Operation failed: ${operation}`, { error });
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Required<MockServiceConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MockServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated', { newConfig });
  }

  /**
   * Reset service state (to be implemented by subclasses)
   */
  abstract reset(): void;

  /**
   * Get service status
   */
  getStatus(): {
    serviceName: string;
    isHealthy: boolean;
    config: Required<MockServiceConfig>;
    eventListeners: number;
  } {
    return {
      serviceName: this.constructor.name,
      isHealthy: true,
      config: this.config,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((total, set) => total + set.size, 0),
    };
  }
}

/**
 * Utility functions for mock data generation
 */
export class MockDataGenerator {
  /**
   * Generate realistic badge metadata
   */
  static generateBadgeMetadata(badgeType: string, referenceId: number): string {
    const templates = {
      ChapterCompletion: `Completed Chapter ${referenceId} - Advanced Blockchain Concepts`,
      SpecialAchievement: `Special Achievement #${referenceId} - Outstanding Performance`,
      CommunityContribution: `Community Contribution #${referenceId} - Helping Others Learn`,
    };
    
    return templates[badgeType as keyof typeof templates] || 
           `Badge ${badgeType} #${referenceId}`;
  }

  /**
   * Generate realistic NFT version string
   */
  static generateNFTVersion(): string {
    const versions = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0'];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  /**
   * Generate realistic lesson names
   */
  static generateLessonNames(chapterId: number, totalLessons: number): string[] {
    const chapterTopics = {
      1: 'Blockchain Fundamentals',
      2: 'Smart Contracts',
      3: 'DeFi Protocols',
      4: 'NFTs and Digital Assets',
      5: 'Web3 Development',
    };

    const topic = chapterTopics[chapterId as keyof typeof chapterTopics] || 'Advanced Topics';
    
    return Array.from({ length: totalLessons }, (_, i) => 
      `${topic} - Lesson ${i + 1}`
    );
  }

  /**
   * Generate realistic user addresses for testing
   */
  static generateTestUsers(count: number): string[] {
    return Array.from({ length: count }, (_, i) => 
      `GABC${String(i).padStart(4, '0')}${'A'.repeat(48)}`
    );
  }
}
