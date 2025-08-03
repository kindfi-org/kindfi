/**
 * Factory and configuration system for mock blockchain services
 * Provides centralized service management, dependency injection, and configuration
 */

import { MockProgressTrackerService } from './mock-progress-tracker.service';
import { MockBadgeTrackerService } from './mock-badge-tracker.service';
import { MockAuthControllerService } from './mock-auth-controller.service';
import { MockGraduationNFTService } from './mock-graduation-nft.service';
import { MockDataGenerator } from './base-mock-service';
import type {
  MockServiceConfig,
  Address,
  Badge,
  GraduationNFT,
  BadgeType,
} from '~/lib/types/blockchain/contract-interfaces.types';

export interface MockBlockchainConfig extends MockServiceConfig {
  /** Environment preset */
  environment?: 'development' | 'testing' | 'demo';
  /** Auto-initialize services with dependencies */
  autoInitialize?: boolean;
  /** Generate realistic test data */
  generateTestData?: boolean;
  /** Number of test users to generate */
  testUserCount?: number;
}

export class MockBlockchainServiceFactory {
  private static instance: MockBlockchainServiceFactory;
  private config: Required<MockBlockchainConfig>;
  
  // Service instances
  private progressTracker?: MockProgressTrackerService;
  private badgeTracker?: MockBadgeTrackerService;
  private authController?: MockAuthControllerService;
  private graduationNFT?: MockGraduationNFTService;

  private constructor(config: Partial<MockBlockchainConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.log('Mock blockchain service factory initialized', { config: this.config });
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<MockBlockchainConfig>): MockBlockchainServiceFactory {
    if (!MockBlockchainServiceFactory.instance) {
      MockBlockchainServiceFactory.instance = new MockBlockchainServiceFactory(config);
    }
    return MockBlockchainServiceFactory.instance;
  }

  /**
   * Merge config with environment-specific defaults
   */
  private mergeWithDefaults(config: Partial<MockBlockchainConfig>): Required<MockBlockchainConfig> {
    const environmentDefaults = this.getEnvironmentDefaults(config.environment || 'development');
    
    return {
      networkDelay: config.networkDelay ?? environmentDefaults.networkDelay,
      errorRate: config.errorRate ?? environmentDefaults.errorRate,
      enableLogging: config.enableLogging ?? environmentDefaults.enableLogging,
      environment: config.environment ?? 'development',
      autoInitialize: config.autoInitialize ?? true,
      generateTestData: config.generateTestData ?? true,
      testUserCount: config.testUserCount ?? 10,
      seedData: {
        ...environmentDefaults.seedData,
        ...config.seedData,
      },
    };
  }

  /**
   * Get environment-specific defaults
   */
  private getEnvironmentDefaults(environment: string): Partial<MockBlockchainConfig> {
    switch (environment) {
      case 'testing':
        return {
          networkDelay: 0,
          errorRate: 0,
          enableLogging: false,
          seedData: {},
        };
      case 'demo':
        return {
          networkDelay: 200,
          errorRate: 0.02,
          enableLogging: true,
          seedData: this.generateDemoData(),
        };
      case 'development':
      default:
        return {
          networkDelay: 100,
          errorRate: 0.05,
          enableLogging: true,
          seedData: this.generateDevelopmentData(),
        };
    }
  }

  /**
   * Generate realistic development data
   */
  private generateDevelopmentData(): MockServiceConfig['seedData'] {
    const testUsers = MockDataGenerator.generateTestUsers(this.config.testUserCount);
    const userProgress: Record<Address, Record<number, number[]>> = {};
    const userBadges: Record<Address, Badge[]> = {};
    const graduationNFTs: Record<Address, GraduationNFT> = {};

    // Generate progress data
    testUsers.forEach((user, index) => {
      userProgress[user] = {};
      userBadges[user] = [];

      // Simulate different progress levels
      const progressLevel = (index % 4) + 1; // 1-4 progress levels
      
      for (let chapterId = 1; chapterId <= progressLevel; chapterId++) {
        const totalLessons = 5 + (chapterId - 1) * 2; // 5, 7, 9, 11 lessons
        const completedLessons = chapterId < progressLevel 
          ? totalLessons // Complete previous chapters
          : Math.floor(totalLessons * 0.7); // 70% of current chapter

        userProgress[user][chapterId] = Array.from(
          { length: completedLessons }, 
          (_, i) => i + 1
        );

        // Add chapter completion badge if chapter is complete
        if (completedLessons === totalLessons) {
          userBadges[user].push({
            badge_type: BadgeType.ChapterCompletion,
            reference_id: chapterId,
            metadata: MockDataGenerator.generateBadgeMetadata('ChapterCompletion', chapterId),
            issued_at: Date.now() - (Math.random() * 86400 * 30), // Random time in last 30 days
          });
        }
      }

      // Add some special achievement badges
      if (index % 3 === 0) {
        userBadges[user].push({
          badge_type: BadgeType.SpecialAchievement,
          reference_id: 1,
          metadata: MockDataGenerator.generateBadgeMetadata('SpecialAchievement', 1),
          issued_at: Date.now() - (Math.random() * 86400 * 15),
        });
      }

      // Add community contribution badges
      if (index % 2 === 0) {
        userBadges[user].push({
          badge_type: BadgeType.CommunityContribution,
          reference_id: 1,
          metadata: MockDataGenerator.generateBadgeMetadata('CommunityContribution', 1),
          issued_at: Date.now() - (Math.random() * 86400 * 7),
        });
      }

      // Generate graduation NFT for users with sufficient progress
      if (userBadges[user].length >= 5 && progressLevel >= 3) {
        graduationNFTs[user] = {
          owner: user,
          metadata: {
            issued_at: Date.now() - (Math.random() * 86400 * 7),
            version: MockDataGenerator.generateNFTVersion(),
            badges: userBadges[user].map(badge => 
              `${badge.badge_type}:${badge.reference_id}`
            ),
          },
        };
      }
    });

    return {
      authenticatedUsers: testUsers,
      userProgress,
      userBadges,
      graduationNFTs,
      chapterLessons: {
        1: 5,
        2: 7,
        3: 9,
        4: 11,
        5: 6,
      },
    };
  }

  /**
   * Generate demo data with more realistic scenarios
   */
  private generateDemoData(): MockServiceConfig['seedData'] {
    const demoUsers = [
      'GDEMO1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      'GDEMO2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      'GDEMO3ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
    ];

    // Create more detailed demo scenarios
    const userProgress: Record<Address, Record<number, number[]>> = {
      [demoUsers[0]]: { 1: [1, 2, 3, 4, 5], 2: [1, 2, 3, 4, 5, 6, 7], 3: [1, 2, 3] },
      [demoUsers[1]]: { 1: [1, 2, 3, 4, 5], 2: [1, 2, 3] },
      [demoUsers[2]]: { 1: [1, 2] },
    };

    const userBadges: Record<Address, Badge[]> = {
      [demoUsers[0]]: [
        {
          badge_type: BadgeType.ChapterCompletion,
          reference_id: 1,
          metadata: 'Blockchain Fundamentals Master',
          issued_at: Date.now() - 86400 * 20,
        },
        {
          badge_type: BadgeType.ChapterCompletion,
          reference_id: 2,
          metadata: 'Smart Contracts Expert',
          issued_at: Date.now() - 86400 * 10,
        },
        {
          badge_type: BadgeType.SpecialAchievement,
          reference_id: 1,
          metadata: 'Outstanding Performance',
          issued_at: Date.now() - 86400 * 5,
        },
      ],
      [demoUsers[1]]: [
        {
          badge_type: BadgeType.ChapterCompletion,
          reference_id: 1,
          metadata: 'Blockchain Fundamentals Master',
          issued_at: Date.now() - 86400 * 15,
        },
      ],
      [demoUsers[2]]: [],
    };

    return {
      authenticatedUsers: demoUsers,
      userProgress,
      userBadges,
      graduationNFTs: {},
      chapterLessons: {
        1: 5,
        2: 7,
        3: 9,
        4: 11,
        5: 6,
      },
    };
  }

  /**
   * Get or create progress tracker service
   */
  getProgressTracker(): MockProgressTrackerService {
    if (!this.progressTracker) {
      this.progressTracker = new MockProgressTrackerService(this.config);
    }
    return this.progressTracker;
  }

  /**
   * Get or create badge tracker service
   */
  getBadgeTracker(): MockBadgeTrackerService {
    if (!this.badgeTracker) {
      this.badgeTracker = new MockBadgeTrackerService(this.config);
      
      if (this.config.autoInitialize) {
        this.initializeBadgeTracker();
      }
    }
    return this.badgeTracker;
  }

  /**
   * Get or create auth controller service
   */
  getAuthController(): MockAuthControllerService {
    if (!this.authController) {
      this.authController = new MockAuthControllerService(this.config);
    }
    return this.authController;
  }

  /**
   * Get or create graduation NFT service
   */
  getGraduationNFT(): MockGraduationNFTService {
    if (!this.graduationNFT) {
      this.graduationNFT = new MockGraduationNFTService(this.config);
      
      if (this.config.autoInitialize) {
        this.initializeGraduationNFT();
      }
    }
    return this.graduationNFT;
  }

  /**
   * Get all services
   */
  getAllServices(): {
    progressTracker: MockProgressTrackerService;
    badgeTracker: MockBadgeTrackerService;
    authController: MockAuthControllerService;
    graduationNFT: MockGraduationNFTService;
  } {
    return {
      progressTracker: this.getProgressTracker(),
      badgeTracker: this.getBadgeTracker(),
      authController: this.getAuthController(),
      graduationNFT: this.getGraduationNFT(),
    };
  }

  /**
   * Initialize badge tracker with dependencies
   */
  private async initializeBadgeTracker(): Promise<void> {
    try {
      const progressTracker = this.getProgressTracker();
      const authController = this.getAuthController();
      const badgeTracker = this.getBadgeTracker();

      badgeTracker.setDependencies(progressTracker, authController);

      // Initialize with mock addresses
      await badgeTracker.init(
        'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GAUTH_CONTROLLER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
      );

      this.log('Badge tracker initialized with dependencies');
    } catch (error) {
      this.log('Error initializing badge tracker', { error });
    }
  }

  /**
   * Initialize graduation NFT with dependencies
   */
  private async initializeGraduationNFT(): Promise<void> {
    try {
      const progressTracker = this.getProgressTracker();
      const badgeTracker = this.getBadgeTracker();
      const graduationNFT = this.getGraduationNFT();

      graduationNFT.setDependencies(progressTracker, badgeTracker);

      // Initialize with mock addresses
      await graduationNFT.initialize(
        'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
        'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GBADGE_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM'
      );

      this.log('Graduation NFT initialized with dependencies');
    } catch (error) {
      this.log('Error initializing graduation NFT', { error });
    }
  }

  /**
   * Reset all services
   */
  resetAllServices(): void {
    this.progressTracker?.reset();
    this.badgeTracker?.reset();
    this.authController?.reset();
    this.graduationNFT?.reset();
    this.log('All services reset');
  }

  /**
   * Update configuration for all services
   */
  updateConfig(newConfig: Partial<MockBlockchainConfig>): void {
    this.config = this.mergeWithDefaults({ ...this.config, ...newConfig });
    
    this.progressTracker?.updateConfig(this.config);
    this.badgeTracker?.updateConfig(this.config);
    this.authController?.updateConfig(this.config);
    this.graduationNFT?.updateConfig(this.config);
    
    this.log('Configuration updated for all services', { newConfig });
  }

  /**
   * Get overall system status
   */
  getSystemStatus(): {
    environment: string;
    config: Required<MockBlockchainConfig>;
    services: {
      progressTracker?: any;
      badgeTracker?: any;
      authController?: any;
      graduationNFT?: any;
    };
  } {
    return {
      environment: this.config.environment,
      config: this.config,
      services: {
        progressTracker: this.progressTracker?.getStatus(),
        badgeTracker: this.badgeTracker?.getStatus(),
        authController: this.authController?.getStatus(),
        graduationNFT: this.graduationNFT?.getStatus(),
      },
    };
  }

  /**
   * Log messages
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[MockBlockchainServiceFactory] ${message}`, data || '');
    }
  }
}
