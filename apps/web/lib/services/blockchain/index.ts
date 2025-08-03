/**
 * Mock Blockchain Services for KindFi Academy
 * 
 * This module provides TypeScript mock implementations of the Soroban smart contracts
 * for local development and testing. The services simulate realistic blockchain behavior
 * including network delays, error conditions, and event emission.
 * 
 * @example
 * ```typescript
 * import { MockBlockchainServiceFactory } from '~/lib/services/blockchain';
 * 
 * // Get factory instance with development configuration
 * const factory = MockBlockchainServiceFactory.getInstance({
 *   environment: 'development',
 *   networkDelay: 100,
 *   errorRate: 0.05,
 * });
 * 
 * // Get individual services
 * const progressTracker = factory.getProgressTracker();
 * const badgeTracker = factory.getBadgeTracker();
 * const graduationNFT = factory.getGraduationNFT();
 * 
 * // Use the services
 * await progressTracker.mark_lesson_complete(userAddress, 1, 1);
 * const badges = await badgeTracker.get_user_badges(userAddress);
 * const nft = await graduationNFT.mint_graduation_nft(userAddress);
 * ```
 */

// Export all service classes
export { BaseMockService, MockDataGenerator } from './base-mock-service';
export { MockProgressTrackerService } from './mock-progress-tracker.service';
export { MockBadgeTrackerService } from './mock-badge-tracker.service';
export { MockAuthControllerService } from './mock-auth-controller.service';
export { MockGraduationNFTService } from './mock-graduation-nft.service';
export { MockBlockchainServiceFactory } from './mock-service-factory';

// Export types
export type {
  MockServiceConfig,
  MockBlockchainConfig,
} from './mock-service-factory';

// Re-export contract interface types
export type {
  IAcademyProgressTracker,
  IAcademyBadgeTracker,
  IAcademyGraduationNFT,
  IAuthController,
  Address,
  ContractString,
  ContractVec,
  Result,
  NFTError,
  BadgeError,
  ProgressError,
  NFTMetadata,
  GraduationNFT,
  Badge,
  BadgeType,
  LessonCompletedEventData,
  ChapterCompletedEventData,
  BadgeMintedEventData,
} from '~/lib/types/blockchain/contract-interfaces.types';

/**
 * Default factory instance for easy access
 * Configured for development environment with realistic defaults
 */
export const mockBlockchainServices = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  autoInitialize: true,
  generateTestData: true,
});

/**
 * Convenience functions for quick access to services
 */
export const getProgressTracker = () => mockBlockchainServices.getProgressTracker();
export const getBadgeTracker = () => mockBlockchainServices.getBadgeTracker();
export const getAuthController = () => mockBlockchainServices.getAuthController();
export const getGraduationNFT = () => mockBlockchainServices.getGraduationNFT();

/**
 * Reset all services to initial state
 */
export const resetAllServices = () => mockBlockchainServices.resetAllServices();

/**
 * Get system status for debugging
 */
export const getSystemStatus = () => mockBlockchainServices.getSystemStatus();

/**
 * Create a factory instance for testing with custom configuration
 */
export const createTestFactory = (config?: Partial<MockBlockchainConfig>) => 
  MockBlockchainServiceFactory.getInstance({
    environment: 'testing',
    networkDelay: 0,
    errorRate: 0,
    enableLogging: false,
    generateTestData: false,
    ...config,
  });

/**
 * Create a factory instance for demo purposes with realistic data
 */
export const createDemoFactory = (config?: Partial<MockBlockchainConfig>) =>
  MockBlockchainServiceFactory.getInstance({
    environment: 'demo',
    networkDelay: 200,
    errorRate: 0.02,
    enableLogging: true,
    generateTestData: true,
    testUserCount: 5,
    ...config,
  });

// Type definitions for common use cases
export interface MockBlockchainServices {
  progressTracker: MockProgressTrackerService;
  badgeTracker: MockBadgeTrackerService;
  authController: MockAuthControllerService;
  graduationNFT: MockGraduationNFTService;
}

/**
 * Get all services as a single object
 */
export const getAllServices = (): MockBlockchainServices => 
  mockBlockchainServices.getAllServices();

/**
 * Utility function to simulate a complete user journey
 * Useful for testing and demonstrations
 */
export const simulateUserJourney = async (userAddress: Address): Promise<{
  progress: any;
  badges: Badge[];
  graduationNFT: GraduationNFT | null;
}> => {
  const services = getAllServices();
  
  // Complete some lessons
  await services.progressTracker.mark_lesson_complete(userAddress, 1, 1);
  await services.progressTracker.mark_lesson_complete(userAddress, 1, 2);
  await services.progressTracker.mark_lesson_complete(userAddress, 1, 3);
  await services.progressTracker.mark_lesson_complete(userAddress, 1, 4);
  await services.progressTracker.mark_lesson_complete(userAddress, 1, 5);
  
  // Mint a chapter completion badge
  await services.badgeTracker.mint_badge(
    userAddress,
    BadgeType.ChapterCompletion,
    1,
    'Completed Blockchain Fundamentals'
  );
  
  // Get user's progress and badges
  const progress = await services.progressTracker.get_user_overall_progress(userAddress);
  const badges = await services.badgeTracker.get_user_badges(userAddress);
  
  // Try to mint graduation NFT (might fail if requirements not met)
  let graduationNFT: GraduationNFT | null = null;
  try {
    const result = await services.graduationNFT.mint_graduation_nft(userAddress);
    if (result.success) {
      graduationNFT = result.data;
    }
  } catch (error) {
    // NFT minting failed - requirements not met
  }
  
  return { progress, badges, graduationNFT };
};

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Generate test users with realistic data
   */
  generateTestUsers: (count: number = 5) => MockDataGenerator.generateTestUsers(count),
  
  /**
   * Reset and reinitialize all services
   */
  reinitialize: () => {
    resetAllServices();
    return getAllServices();
  },
  
  /**
   * Enable/disable logging for all services
   */
  setLogging: (enabled: boolean) => {
    mockBlockchainServices.updateConfig({ enableLogging: enabled });
  },
  
  /**
   * Set network delay for all services
   */
  setNetworkDelay: (delay: number) => {
    mockBlockchainServices.updateConfig({ networkDelay: delay });
  },
  
  /**
   * Set error rate for all services
   */
  setErrorRate: (rate: number) => {
    mockBlockchainServices.updateConfig({ errorRate: rate });
  },
};
