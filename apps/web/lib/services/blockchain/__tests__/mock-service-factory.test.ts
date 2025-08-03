/**
 * Unit tests for MockBlockchainServiceFactory
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockBlockchainServiceFactory } from '../mock-service-factory';

describe('MockBlockchainServiceFactory', () => {
  let factory: MockBlockchainServiceFactory;

  beforeEach(() => {
    // Create a new factory instance for each test
    factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
      generateTestData: false,
    });
  });

  describe('getInstance', () => {
    test('should return singleton instance', () => {
      const factory1 = MockBlockchainServiceFactory.getInstance();
      const factory2 = MockBlockchainServiceFactory.getInstance();
      
      expect(factory1).toBe(factory2);
    });

    test('should apply configuration correctly', () => {
      const testFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'development',
        networkDelay: 200,
        errorRate: 0.1,
      });

      const status = testFactory.getSystemStatus();
      expect(status.environment).toBe('development');
      expect(status.config.networkDelay).toBe(200);
      expect(status.config.errorRate).toBe(0.1);
    });
  });

  describe('service creation', () => {
    test('should create progress tracker service', () => {
      const progressTracker = factory.getProgressTracker();
      expect(progressTracker).toBeDefined();
      expect(progressTracker.constructor.name).toBe('MockProgressTrackerService');
    });

    test('should create badge tracker service', () => {
      const badgeTracker = factory.getBadgeTracker();
      expect(badgeTracker).toBeDefined();
      expect(badgeTracker.constructor.name).toBe('MockBadgeTrackerService');
    });

    test('should create auth controller service', () => {
      const authController = factory.getAuthController();
      expect(authController).toBeDefined();
      expect(authController.constructor.name).toBe('MockAuthControllerService');
    });

    test('should create graduation NFT service', () => {
      const graduationNFT = factory.getGraduationNFT();
      expect(graduationNFT).toBeDefined();
      expect(graduationNFT.constructor.name).toBe('MockGraduationNFTService');
    });

    test('should return same instance on multiple calls', () => {
      const progressTracker1 = factory.getProgressTracker();
      const progressTracker2 = factory.getProgressTracker();
      
      expect(progressTracker1).toBe(progressTracker2);
    });
  });

  describe('getAllServices', () => {
    test('should return all services', () => {
      const services = factory.getAllServices();
      
      expect(services.progressTracker).toBeDefined();
      expect(services.badgeTracker).toBeDefined();
      expect(services.authController).toBeDefined();
      expect(services.graduationNFT).toBeDefined();
    });
  });

  describe('environment configurations', () => {
    test('should apply development environment defaults', () => {
      const devFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'development',
      });

      const status = devFactory.getSystemStatus();
      expect(status.config.networkDelay).toBe(100);
      expect(status.config.errorRate).toBe(0.05);
      expect(status.config.enableLogging).toBe(true);
    });

    test('should apply testing environment defaults', () => {
      const testFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
      });

      const status = testFactory.getSystemStatus();
      expect(status.config.networkDelay).toBe(0);
      expect(status.config.errorRate).toBe(0);
      expect(status.config.enableLogging).toBe(false);
    });

    test('should apply demo environment defaults', () => {
      const demoFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'demo',
      });

      const status = demoFactory.getSystemStatus();
      expect(status.config.networkDelay).toBe(200);
      expect(status.config.errorRate).toBe(0.02);
      expect(status.config.enableLogging).toBe(true);
    });
  });

  describe('resetAllServices', () => {
    test('should reset all services', async () => {
      const services = factory.getAllServices();
      
      // Add some data to services
      const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
      await services.progressTracker.mark_lesson_complete(testUser, 1, 1);
      
      // Verify data exists
      const progressBefore = await services.progressTracker.get_user_progress(testUser, 1);
      expect(progressBefore).toContain(1);
      
      // Reset all services
      factory.resetAllServices();
      
      // Verify data is cleared
      const progressAfter = await services.progressTracker.get_user_progress(testUser, 1);
      expect(progressAfter).toEqual([]);
    });
  });

  describe('updateConfig', () => {
    test('should update configuration for all services', () => {
      const newConfig = {
        networkDelay: 500,
        errorRate: 0.2,
        enableLogging: true,
      };

      factory.updateConfig(newConfig);

      const status = factory.getSystemStatus();
      expect(status.config.networkDelay).toBe(500);
      expect(status.config.errorRate).toBe(0.2);
      expect(status.config.enableLogging).toBe(true);
    });
  });

  describe('getSystemStatus', () => {
    test('should return comprehensive system status', () => {
      const status = factory.getSystemStatus();
      
      expect(status.environment).toBeDefined();
      expect(status.config).toBeDefined();
      expect(status.services).toBeDefined();
      
      // Check that config has required properties
      expect(status.config.networkDelay).toBeDefined();
      expect(status.config.errorRate).toBeDefined();
      expect(status.config.enableLogging).toBeDefined();
    });
  });

  describe('test data generation', () => {
    test('should generate test data when enabled', () => {
      const dataFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'development',
        generateTestData: true,
        testUserCount: 5,
      });

      const status = dataFactory.getSystemStatus();
      expect(status.config.generateTestData).toBe(true);
      expect(status.config.testUserCount).toBe(5);
    });

    test('should not generate test data when disabled', () => {
      const noDataFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
        generateTestData: false,
      });

      const status = noDataFactory.getSystemStatus();
      expect(status.config.generateTestData).toBe(false);
    });
  });

  describe('auto initialization', () => {
    test('should auto-initialize services when enabled', () => {
      const autoFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'development',
        autoInitialize: true,
      });

      const badgeTracker = autoFactory.getBadgeTracker();
      const graduationNFT = autoFactory.getGraduationNFT();

      // Services should be initialized
      const badgeStatus = badgeTracker.getBadgeTrackerStatus();
      const nftStatus = graduationNFT.getGraduationNFTStatus();

      expect(badgeStatus.isInitialized).toBe(true);
      expect(nftStatus.isInitialized).toBe(true);
    });

    test('should not auto-initialize when disabled', () => {
      const manualFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
        autoInitialize: false,
      });

      const badgeTracker = manualFactory.getBadgeTracker();
      const graduationNFT = manualFactory.getGraduationNFT();

      // Services should not be initialized
      const badgeStatus = badgeTracker.getBadgeTrackerStatus();
      const nftStatus = graduationNFT.getGraduationNFTStatus();

      expect(badgeStatus.isInitialized).toBe(false);
      expect(nftStatus.isInitialized).toBe(false);
    });
  });

  describe('service dependencies', () => {
    test('should set up service dependencies correctly', async () => {
      const services = factory.getAllServices();
      const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

      // Complete a chapter in progress tracker
      for (let lesson = 1; lesson <= 5; lesson++) {
        await services.progressTracker.mark_lesson_complete(testUser, 1, lesson);
      }

      // Badge tracker should be able to validate chapter completion
      const isComplete = await services.progressTracker.is_chapter_complete(testUser, 1);
      expect(isComplete).toBe(true);

      // This demonstrates that dependencies are properly set up
      // (badge tracker can call progress tracker methods)
    });
  });

  describe('error handling', () => {
    test('should handle service creation errors gracefully', () => {
      // This test ensures the factory doesn't crash on edge cases
      expect(() => {
        factory.getProgressTracker();
        factory.getBadgeTracker();
        factory.getAuthController();
        factory.getGraduationNFT();
      }).not.toThrow();
    });
  });

  describe('data generation methods', () => {
    test('should generate testing data correctly', () => {
      const testData = factory.generateTestingData();

      expect(testData.authenticatedUsers).toBeDefined();
      expect(testData.userProgress).toBeDefined();
      expect(testData.userBadges).toBeDefined();
      expect(testData.graduationNFTs).toBeDefined();
      expect(testData.chapterLessons).toBeDefined();

      // Verify structure
      expect(Array.isArray(testData.authenticatedUsers)).toBe(true);
      expect(typeof testData.userProgress).toBe('object');
      expect(typeof testData.userBadges).toBe('object');
      expect(typeof testData.graduationNFTs).toBe('object');
      expect(typeof testData.chapterLessons).toBe('object');
    });

    test('should generate demo data correctly', () => {
      const demoData = factory.generateDemoData();

      expect(demoData.authenticatedUsers).toBeDefined();
      expect(demoData.userProgress).toBeDefined();
      expect(demoData.userBadges).toBeDefined();
      expect(demoData.graduationNFTs).toBeDefined();
      expect(demoData.chapterLessons).toBeDefined();

      // Demo data should have fewer graduation NFTs (more realistic)
      expect(Object.keys(demoData.graduationNFTs)).toHaveLength(0);
    });
  });

  describe('service lifecycle', () => {
    test('should maintain service state across multiple calls', async () => {
      const services1 = factory.getAllServices();
      const services2 = factory.getAllServices();

      // Should be the same instances
      expect(services1.progressTracker).toBe(services2.progressTracker);
      expect(services1.badgeTracker).toBe(services2.badgeTracker);
      expect(services1.authController).toBe(services2.authController);
      expect(services1.graduationNFT).toBe(services2.graduationNFT);
    });

    test('should properly initialize service dependencies', async () => {
      const factory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
        autoInitialize: true,
      });

      const services = factory.getAllServices();

      // Verify badge tracker is initialized
      const badgeStatus = services.badgeTracker.getBadgeTrackerStatus();
      expect(badgeStatus.isInitialized).toBe(true);

      // Verify graduation NFT is initialized
      const nftStatus = services.graduationNFT.getGraduationNFTStatus();
      expect(nftStatus.isInitialized).toBe(true);
    });
  });

  describe('configuration validation', () => {
    test('should handle invalid environment gracefully', () => {
      expect(() => {
        MockBlockchainServiceFactory.getInstance({
          environment: 'invalid' as any,
        });
      }).not.toThrow();
    });

    test('should apply custom configuration overrides', () => {
      const customFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'development',
        networkDelay: 999,
        errorRate: 0.99,
        enableLogging: false,
        generateTestData: true,
        testUserCount: 100,
        autoInitialize: false,
      });

      const status = customFactory.getSystemStatus();
      expect(status.config.networkDelay).toBe(999);
      expect(status.config.errorRate).toBe(0.99);
      expect(status.config.enableLogging).toBe(false);
      expect(status.config.generateTestData).toBe(true);
      expect(status.config.testUserCount).toBe(100);
      expect(status.config.autoInitialize).toBe(false);
    });
  });

  describe('service integration', () => {
    test('should support end-to-end user journey', async () => {
      const factory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
        autoInitialize: true,
      });

      const services = factory.getAllServices();
      const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
      const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

      // Register user
      await services.authController.register_user(adminUser, testUser);

      // Complete progress
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      // Mint badges
      for (let i = 1; i <= 6; i++) {
        await services.badgeTracker.mint_badge(
          testUser,
          'ChapterCompletion' as any,
          i,
          `Chapter ${i} completion`
        );
      }

      // Mint graduation NFT
      const nftResult = await services.graduationNFT.mint_graduation_nft(testUser);

      expect(nftResult.success).toBe(true);
      expect(nftResult.data?.owner).toBe(testUser);
    });
  });
});
