/**
 * Performance and stress tests for Mock Blockchain Services
 * Tests service behavior under load and with large datasets
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockBlockchainServiceFactory } from '../mock-service-factory';
import { BadgeType } from '~/lib/types/blockchain/contract-interfaces.types';

describe('Mock Blockchain Services Performance', () => {
  let factory: MockBlockchainServiceFactory;
  let services: ReturnType<typeof factory.getAllServices>;
  
  const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

  beforeEach(() => {
    factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
      autoInitialize: true,
    });
    
    services = factory.getAllServices();
    factory.resetAllServices();
  });

  describe('Bulk Operations Performance', () => {
    test('should handle bulk user registration efficiently', async () => {
      const userCount = 100;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      const startTime = Date.now();
      const result = await services.authController.bulk_register_users(adminUser, users);
      const endTime = Date.now();

      expect(result.successful).toHaveLength(userCount);
      expect(result.failed).toHaveLength(0);
      
      // Should complete within reasonable time (adjust threshold as needed)
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds max

      // Verify all users are registered
      const authenticatedUsers = await services.authController.get_authenticated_users();
      expect(authenticatedUsers).toHaveLength(userCount);
    });

    test('should handle bulk progress tracking efficiently', async () => {
      const userCount = 50;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Register users
      await services.authController.bulk_register_users(adminUser, users);

      const startTime = Date.now();

      // Complete progress for all users
      const progressPromises = [];
      for (const user of users) {
        for (let chapter = 1; chapter <= 3; chapter++) {
          for (let lesson = 1; lesson <= 5; lesson++) {
            progressPromises.push(
              services.progressTracker.mark_lesson_complete(user, chapter, lesson)
            );
          }
        }
      }

      const results = await Promise.all(progressPromises);
      const endTime = Date.now();

      // All operations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(10000); // 10 seconds max

      // Verify progress for random users
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const overallProgress = await services.progressTracker.get_user_overall_progress(randomUser);
      expect(overallProgress.completedChapters).toBe(3);
    });

    test('should handle bulk badge minting efficiently', async () => {
      const userCount = 30;
      const badgesPerUser = 10;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Register users
      await services.authController.bulk_register_users(adminUser, users);

      const startTime = Date.now();

      // Mint badges for all users
      const badgePromises = [];
      for (const user of users) {
        for (let i = 1; i <= badgesPerUser; i++) {
          badgePromises.push(
            services.badgeTracker.mint_badge(
              user,
              'ChapterCompletion' as BadgeType,
              i,
              `Badge ${i} for ${user}`
            )
          );
        }
      }

      const results = await Promise.all(badgePromises);
      const endTime = Date.now();

      // All operations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(15000); // 15 seconds max

      // Verify badges for random users
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const userBadges = await services.badgeTracker.get_user_badges(randomUser);
      expect(userBadges).toHaveLength(badgesPerUser);
    });
  });

  describe('Large Dataset Handling', () => {
    test('should handle large number of users with progress data', async () => {
      const userCount = 200;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Register all users
      await services.authController.bulk_register_users(adminUser, users);

      // Add progress for all users (varying amounts)
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const chaptersToComplete = (i % 5) + 1; // 1-5 chapters per user
        
        for (let chapter = 1; chapter <= chaptersToComplete; chapter++) {
          const lessonsToComplete = Math.min(5, (i % 7) + 1); // 1-5 lessons per chapter
          for (let lesson = 1; lesson <= lessonsToComplete; lesson++) {
            await services.progressTracker.mark_lesson_complete(user, chapter, lesson);
          }
        }
      }

      // Verify system can handle queries efficiently
      const startTime = Date.now();
      
      // Query progress for all users
      const progressQueries = users.map(user => 
        services.progressTracker.get_user_overall_progress(user)
      );
      
      const progressResults = await Promise.all(progressQueries);
      const endTime = Date.now();

      expect(progressResults).toHaveLength(userCount);
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // 5 seconds max for all queries

      // Verify data integrity
      progressResults.forEach((progress, index) => {
        expect(progress.completedChapters).toBeGreaterThan(0);
        expect(progress.overallPercentage).toBeGreaterThan(0);
      });
    });

    test('should maintain performance with large badge collections', async () => {
      const userCount = 50;
      const maxBadgesPerUser = 50;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Register users
      await services.authController.bulk_register_users(adminUser, users);

      // Mint varying numbers of badges for each user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const badgeCount = Math.floor(Math.random() * maxBadgesPerUser) + 1;
        
        for (let j = 1; j <= badgeCount; j++) {
          await services.badgeTracker.mint_badge(
            user,
            'ChapterCompletion' as BadgeType,
            j,
            `Badge ${j}`
          );
        }
      }

      // Test query performance
      const startTime = Date.now();
      
      const badgeQueries = users.map(user => 
        services.badgeTracker.get_user_badges(user)
      );
      
      const badgeResults = await Promise.all(badgeQueries);
      const endTime = Date.now();

      expect(badgeResults).toHaveLength(userCount);
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(3000); // 3 seconds max

      // Verify total badge count
      const totalBadges = badgeResults.reduce((sum, badges) => sum + badges.length, 0);
      expect(totalBadges).toBeGreaterThan(userCount); // At least one badge per user
    });
  });

  describe('Concurrent Access Patterns', () => {
    test('should handle concurrent read/write operations', async () => {
      const userCount = 20;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Register users
      await services.authController.bulk_register_users(adminUser, users);

      // Create mixed read/write operations
      const operations = [];
      
      // Write operations (progress tracking)
      for (const user of users) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          operations.push(
            services.progressTracker.mark_lesson_complete(user, 1, lesson)
          );
        }
      }

      // Read operations (progress queries)
      for (const user of users) {
        operations.push(
          services.progressTracker.get_user_progress(user, 1)
        );
        operations.push(
          services.progressTracker.get_user_overall_progress(user)
        );
      }

      // Execute all operations concurrently
      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();

      // Verify all operations completed
      expect(results).toHaveLength(operations.length);

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(8000); // 8 seconds max

      // Verify data consistency
      for (const user of users) {
        const progress = await services.progressTracker.get_user_progress(user, 1);
        expect(progress).toHaveLength(5); // All 5 lessons should be completed
      }
    });

    test('should handle service reset under concurrent access', async () => {
      const userCount = 10;
      const users = Array.from({ length: userCount }, (_, i) => 
        `GUSER${i.toString().padStart(3, '0')}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
      );

      // Start concurrent operations
      const operations = users.map(async (user) => {
        await services.authController.register_user(adminUser, user);
        
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(user, 1, lesson);
        }
        
        return services.progressTracker.get_user_progress(user, 1);
      });

      // Reset services while operations are running
      setTimeout(() => {
        factory.resetAllServices();
      }, 100);

      // Wait for operations to complete (some may fail due to reset)
      const results = await Promise.allSettled(operations);

      // Verify system is in consistent state after reset
      const finalUsers = await services.authController.get_authenticated_users();
      expect(Array.isArray(finalUsers)).toBe(true);

      // System should be functional after reset
      await services.authController.register_user(adminUser, users[0]);
      const isAuthenticated = await services.authController.is_authenticated_user(users[0]);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('Memory and Resource Management', () => {
    test('should handle service lifecycle efficiently', async () => {
      const iterations = 10;
      
      for (let i = 0; i < iterations; i++) {
        // Create and use services
        const testFactory = MockBlockchainServiceFactory.getInstance({
          environment: 'testing',
          autoInitialize: true,
        });
        
        const testServices = testFactory.getAllServices();
        
        // Perform operations
        await testServices.authController.register_user(adminUser, `GUSER${i}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM`);
        await testServices.progressTracker.mark_lesson_complete(`GUSER${i}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM`, 1, 1);
        
        // Reset services
        testFactory.resetAllServices();
      }

      // Verify final state is clean
      const finalServices = factory.getAllServices();
      const users = await finalServices.authController.get_authenticated_users();
      expect(users).toHaveLength(0);
    });
  });
});
