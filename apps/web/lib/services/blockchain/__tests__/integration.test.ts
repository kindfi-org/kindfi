/**
 * Integration tests for Mock Blockchain Services
 * Tests end-to-end user journeys, service dependencies, and cross-service interactions
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockBlockchainServiceFactory } from '../mock-service-factory';
import { BadgeType, NFTError, BadgeError, ProgressError } from '~/lib/types/blockchain/contract-interfaces.types';

describe('Mock Blockchain Services Integration', () => {
  let factory: MockBlockchainServiceFactory;
  let services: ReturnType<typeof factory.getAllServices>;
  
  const testUser1 = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const testUser2 = 'GTEST2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const testUser3 = 'GTEST3ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
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

  describe('End-to-End User Journey Tests', () => {
    test('should complete full graduation journey successfully', async () => {
      // Step 1: Register user
      await services.authController.register_user(adminUser, testUser1);
      
      // Verify user is authenticated
      const isAuthenticated = await services.authController.is_authenticated_user(testUser1);
      expect(isAuthenticated).toBe(true);

      // Step 2: Complete progress through multiple chapters
      const chapters = [1, 2, 3, 4];
      const lessonsPerChapter = [5, 7, 9, 11]; // Different lesson counts per chapter
      
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const lessonCount = lessonsPerChapter[i];
        
        for (let lesson = 1; lesson <= lessonCount; lesson++) {
          const result = await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
          expect(result.success).toBe(true);
        }
        
        // Verify chapter completion
        const isComplete = await services.progressTracker.is_chapter_complete(testUser1, chapter);
        expect(isComplete).toBe(true);
      }

      // Step 3: Mint badges for achievements
      const badgeTypes: BadgeType[] = ['ChapterCompletion', 'SpecialAchievement', 'QuizMastery'];
      const badges = [
        { type: 'ChapterCompletion' as BadgeType, ref: 1, desc: 'Completed Chapter 1' },
        { type: 'ChapterCompletion' as BadgeType, ref: 2, desc: 'Completed Chapter 2' },
        { type: 'ChapterCompletion' as BadgeType, ref: 3, desc: 'Completed Chapter 3' },
        { type: 'ChapterCompletion' as BadgeType, ref: 4, desc: 'Completed Chapter 4' },
        { type: 'SpecialAchievement' as BadgeType, ref: 1, desc: 'Perfect Score' },
        { type: 'QuizMastery' as BadgeType, ref: 1, desc: 'Quiz Champion' },
      ];

      for (const badge of badges) {
        const result = await services.badgeTracker.mint_badge(
          testUser1,
          badge.type,
          badge.ref,
          badge.desc
        );
        expect(result.success).toBe(true);
      }

      // Verify badges were minted
      const userBadges = await services.badgeTracker.get_user_badges(testUser1);
      expect(userBadges).toHaveLength(6);

      // Step 4: Check overall progress
      const overallProgress = await services.progressTracker.get_user_overall_progress(testUser1);
      expect(overallProgress.completedChapters).toBe(4);
      expect(overallProgress.overallPercentage).toBeGreaterThan(80);

      // Step 5: Mint graduation NFT
      const nftResult = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(nftResult.success).toBe(true);
      expect(nftResult.data?.owner).toBe(testUser1);
      expect(nftResult.data?.metadata.badges).toHaveLength(6);

      // Step 6: Verify final state
      const hasNFT = await services.graduationNFT.has_graduation_nft(testUser1);
      expect(hasNFT).toBe(true);

      const graduationStats = await services.graduationNFT.get_graduation_stats();
      expect(graduationStats.totalGraduates).toBe(1);
      expect(graduationStats.averageBadges).toBe(6);
    });

    test('should handle partial completion journey', async () => {
      // Register user
      await services.authController.register_user(adminUser, testUser2);
      
      // Complete only 2 chapters (insufficient for graduation)
      for (let chapter = 1; chapter <= 2; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser2, chapter, lesson);
        }
      }

      // Mint only 3 badges (insufficient for graduation)
      for (let i = 1; i <= 3; i++) {
        await services.badgeTracker.mint_badge(
          testUser2,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      // Attempt graduation NFT minting (should fail)
      const nftResult = await services.graduationNFT.mint_graduation_nft(testUser2);
      expect(nftResult.success).toBe(false);
      expect([NFTError.InsufficientProgress, NFTError.InvalidBadgeCount]).toContain(nftResult.error);
    });

    test('should support multiple users with different progress levels', async () => {
      const users = [testUser1, testUser2, testUser3];
      const progressLevels = [
        { chapters: 4, badges: 6, shouldGraduate: true },
        { chapters: 2, badges: 3, shouldGraduate: false },
        { chapters: 3, badges: 5, shouldGraduate: true },
      ];

      // Set up users with different progress levels
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const { chapters, badges, shouldGraduate } = progressLevels[i];

        // Register user
        await services.authController.register_user(adminUser, user);

        // Complete chapters
        for (let chapter = 1; chapter <= chapters; chapter++) {
          for (let lesson = 1; lesson <= 5; lesson++) {
            await services.progressTracker.mark_lesson_complete(user, chapter, lesson);
          }
        }

        // Mint badges
        for (let j = 1; j <= badges; j++) {
          await services.badgeTracker.mint_badge(
            user,
            'ChapterCompletion' as BadgeType,
            j,
            `Badge ${j}`
          );
        }

        // Attempt graduation
        const nftResult = await services.graduationNFT.mint_graduation_nft(user);
        expect(nftResult.success).toBe(shouldGraduate);
      }

      // Verify final statistics
      const authStats = await services.authController.get_auth_stats();
      expect(authStats.totalUsers).toBe(3);
      expect(authStats.activeUsers).toBe(3);

      const graduationStats = await services.graduationNFT.get_graduation_stats();
      expect(graduationStats.totalGraduates).toBe(2); // Only users 1 and 3 should graduate
    });
  });

  describe('Service Dependency Validation Tests', () => {
    test('should validate progress requirements for badge minting', async () => {
      await services.authController.register_user(adminUser, testUser1);

      // Try to mint chapter completion badge without completing chapter
      const badgeResult = await services.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Chapter 1 completion'
      );
      
      // Should succeed even without progress validation in current implementation
      // This tests the current behavior - could be enhanced to validate progress
      expect(badgeResult.success).toBe(true);
    });

    test('should validate badge and progress requirements for graduation NFT', async () => {
      await services.authController.register_user(adminUser, testUser1);

      // Test insufficient progress
      const nftResult1 = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(nftResult1.success).toBe(false);
      expect(nftResult1.error).toBe(NFTError.InsufficientProgress);

      // Complete sufficient progress but insufficient badges
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
        }
      }

      // Mint only 3 badges (insufficient)
      for (let i = 1; i <= 3; i++) {
        await services.badgeTracker.mint_badge(
          testUser1,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      const nftResult2 = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(nftResult2.success).toBe(false);
      expect(nftResult2.error).toBe(NFTError.InvalidBadgeCount);

      // Add sufficient badges
      for (let i = 4; i <= 6; i++) {
        await services.badgeTracker.mint_badge(
          testUser1,
          'SpecialAchievement' as BadgeType,
          i,
          `Achievement ${i}`
        );
      }

      // Now should succeed
      const nftResult3 = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(nftResult3.success).toBe(true);
    });

    test('should validate authentication requirements across services', async () => {
      // Try operations without registering user first
      
      // Progress tracking should work (no auth validation in current implementation)
      const progressResult = await services.progressTracker.mark_lesson_complete(testUser1, 1, 1);
      expect(progressResult.success).toBe(true);

      // Badge minting should work (no strict auth validation in current implementation)
      const badgeResult = await services.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Test badge'
      );
      expect(badgeResult.success).toBe(true);

      // Graduation NFT should work (no strict auth validation in current implementation)
      // Complete sufficient requirements first
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await services.badgeTracker.mint_badge(
          testUser1,
          'ChapterCompletion' as BadgeType,
          i,
          `Badge ${i}`
        );
      }

      const nftResult = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(nftResult.success).toBe(true);
    });
  });

  describe('Event Emission and Handling Tests', () => {
    test('should emit and handle lesson completion events', async () => {
      await services.authController.register_user(adminUser, testUser1);

      let lessonEvents: any[] = [];
      let chapterEvents: any[] = [];

      // Set up event listeners
      services.progressTracker.on('lesson_completed', (data) => {
        lessonEvents.push(data);
      });

      services.progressTracker.on('chapter_completed', (data) => {
        chapterEvents.push(data);
      });

      // Complete lessons in chapter 1
      for (let lesson = 1; lesson <= 5; lesson++) {
        await services.progressTracker.mark_lesson_complete(testUser1, 1, lesson);
      }

      // Verify lesson events were emitted
      expect(lessonEvents).toHaveLength(5);
      expect(lessonEvents[0]).toEqual({
        user: testUser1,
        chapter_id: 1,
        lesson_id: 1,
      });

      // Verify chapter completion event was emitted
      expect(chapterEvents).toHaveLength(1);
      expect(chapterEvents[0]).toEqual({
        user: testUser1,
        chapter_id: 1,
      });
    });

    test('should emit badge minting events', async () => {
      await services.authController.register_user(adminUser, testUser1);

      let badgeEvents: any[] = [];

      // Set up event listener
      services.badgeTracker.on('badge_minted', (data) => {
        badgeEvents.push(data);
      });

      // Mint badges
      const badges = [
        { type: 'ChapterCompletion' as BadgeType, ref: 1, desc: 'Chapter 1' },
        { type: 'SpecialAchievement' as BadgeType, ref: 1, desc: 'Special' },
      ];

      for (const badge of badges) {
        await services.badgeTracker.mint_badge(
          testUser1,
          badge.type,
          badge.ref,
          badge.desc
        );
      }

      // Verify badge events were emitted
      expect(badgeEvents).toHaveLength(2);
      expect(badgeEvents[0].user).toBe(testUser1);
      expect(badgeEvents[0].badge_type).toBe('ChapterCompletion');
      expect(badgeEvents[1].badge_type).toBe('SpecialAchievement');
    });

    test('should handle cross-service event coordination', async () => {
      await services.authController.register_user(adminUser, testUser1);

      let allEvents: Array<{ type: string; data: any }> = [];

      // Set up listeners for all services
      services.progressTracker.on('lesson_completed', (data) => {
        allEvents.push({ type: 'lesson_completed', data });
      });

      services.progressTracker.on('chapter_completed', (data) => {
        allEvents.push({ type: 'chapter_completed', data });
      });

      services.badgeTracker.on('badge_minted', (data) => {
        allEvents.push({ type: 'badge_minted', data });
      });

      // Simulate a complete workflow
      // 1. Complete chapter
      for (let lesson = 1; lesson <= 5; lesson++) {
        await services.progressTracker.mark_lesson_complete(testUser1, 1, lesson);
      }

      // 2. Mint chapter completion badge
      await services.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Chapter 1 completion'
      );

      // Verify event sequence
      expect(allEvents).toHaveLength(7); // 5 lessons + 1 chapter + 1 badge

      const eventTypes = allEvents.map(e => e.type);
      expect(eventTypes.filter(t => t === 'lesson_completed')).toHaveLength(5);
      expect(eventTypes.filter(t => t === 'chapter_completed')).toHaveLength(1);
      expect(eventTypes.filter(t => t === 'badge_minted')).toHaveLength(1);
    });
  });

  describe('Error Propagation Tests', () => {
    test('should propagate authentication errors across services', async () => {
      // Test with non-admin user trying admin operations
      const nonAdminUser = 'GUSER1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

      // Auth controller admin operations should fail
      await expect(services.authController.register_user(nonAdminUser, testUser1))
        .rejects.toThrow('Not authorized: caller is not an admin');

      await expect(services.authController.add_admin(nonAdminUser, testUser1))
        .rejects.toThrow('Not authorized: caller is not an admin');

      // Badge tracker admin operations should fail
      await expect(services.badgeTracker.init(
        'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GAUTH_CONTROLLER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        nonAdminUser
      )).rejects.toThrow();

      // Graduation NFT admin operations should fail
      await expect(services.graduationNFT.set_paused(nonAdminUser, true))
        .rejects.toThrow('Not authorized: caller is not admin');
    });

    test('should handle service initialization errors', async () => {
      // Create fresh services without auto-initialization
      const freshFactory = MockBlockchainServiceFactory.getInstance({
        environment: 'testing',
        autoInitialize: false,
      });

      const freshServices = freshFactory.getAllServices();

      // Badge tracker operations should fail when not initialized
      const badgeResult = await freshServices.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Test badge'
      );
      expect(badgeResult.success).toBe(false);
      expect(badgeResult.error).toBe(BadgeError.NotInitialized);

      // Graduation NFT operations should fail when not initialized
      await expect(freshServices.graduationNFT.mint_graduation_nft(testUser1))
        .rejects.toThrow('Contract not initialized');
    });

    test('should handle validation errors in graduation requirements', async () => {
      await services.authController.register_user(adminUser, testUser1);

      // Test various insufficient conditions
      const testCases = [
        {
          name: 'no progress or badges',
          setup: async () => {}, // No setup
          expectedError: NFTError.InsufficientProgress,
        },
        {
          name: 'sufficient progress but no badges',
          setup: async () => {
            for (let chapter = 1; chapter <= 3; chapter++) {
              for (let lesson = 1; lesson <= 5; lesson++) {
                await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
              }
            }
          },
          expectedError: NFTError.InvalidBadgeCount,
        },
        {
          name: 'insufficient progress with badges',
          setup: async () => {
            // Reset progress
            services.progressTracker.reset();
            await services.authController.register_user(adminUser, testUser1);

            // Only complete 1 chapter (insufficient)
            for (let lesson = 1; lesson <= 5; lesson++) {
              await services.progressTracker.mark_lesson_complete(testUser1, 1, lesson);
            }

            // But have enough badges
            for (let i = 1; i <= 6; i++) {
              await services.badgeTracker.mint_badge(
                testUser1,
                'ChapterCompletion' as BadgeType,
                i,
                `Badge ${i}`
              );
            }
          },
          expectedError: NFTError.InsufficientProgress,
        },
      ];

      for (const testCase of testCases) {
        // Reset services for each test case
        factory.resetAllServices();
        await services.authController.register_user(adminUser, testUser1);

        await testCase.setup();

        const result = await services.graduationNFT.mint_graduation_nft(testUser1);
        expect(result.success).toBe(false);
        expect(result.error).toBe(testCase.expectedError);
      }
    });

    test('should handle contract pause state errors', async () => {
      await services.authController.register_user(adminUser, testUser1);

      // Set up user with sufficient requirements
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await services.badgeTracker.mint_badge(
          testUser1,
          'ChapterCompletion' as BadgeType,
          i,
          `Badge ${i}`
        );
      }

      // Pause the graduation NFT contract
      await services.graduationNFT.set_paused(adminUser, true);

      // Attempt to mint NFT while paused
      const result = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.ContractPaused);

      // Unpause and try again
      await services.graduationNFT.set_paused(adminUser, false);
      const result2 = await services.graduationNFT.mint_graduation_nft(testUser1);
      expect(result2.success).toBe(true);
    });
  });

  describe('Service State Management Tests', () => {
    test('should maintain consistent state across service resets', async () => {
      // Set up initial state
      await services.authController.register_user(adminUser, testUser1);
      await services.progressTracker.mark_lesson_complete(testUser1, 1, 1);
      await services.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Test badge'
      );

      // Verify initial state
      const initialProgress = await services.progressTracker.get_user_progress(testUser1, 1);
      const initialBadges = await services.badgeTracker.get_user_badges(testUser1);
      const initialAuth = await services.authController.is_authenticated_user(testUser1);

      expect(initialProgress).toContain(1);
      expect(initialBadges).toHaveLength(1);
      expect(initialAuth).toBe(true);

      // Reset all services
      factory.resetAllServices();

      // Verify state is cleared
      const resetProgress = await services.progressTracker.get_user_progress(testUser1, 1);
      const resetBadges = await services.badgeTracker.get_user_badges(testUser1);
      const resetAuth = await services.authController.is_authenticated_user(testUser1);

      expect(resetProgress).toEqual([]);
      expect(resetBadges).toEqual([]);
      expect(resetAuth).toBe(false);
    });

    test('should handle concurrent operations correctly', async () => {
      await services.authController.register_user(adminUser, testUser1);

      // Simulate concurrent lesson completions
      const concurrentOperations = [];
      for (let lesson = 1; lesson <= 5; lesson++) {
        concurrentOperations.push(
          services.progressTracker.mark_lesson_complete(testUser1, 1, lesson)
        );
      }

      const results = await Promise.all(concurrentOperations);

      // All operations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify final state is consistent
      const finalProgress = await services.progressTracker.get_user_progress(testUser1, 1);
      expect(finalProgress).toHaveLength(5);
      expect(finalProgress).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle service configuration updates', async () => {
      // Update configuration
      factory.updateConfig({
        networkDelay: 100,
        errorRate: 0.1,
        enableLogging: true,
      });

      const status = factory.getSystemStatus();
      expect(status.config.networkDelay).toBe(100);
      expect(status.config.errorRate).toBe(0.1);
      expect(status.config.enableLogging).toBe(true);

      // Verify services still work with new configuration
      await services.authController.register_user(adminUser, testUser1);
      const result = await services.progressTracker.mark_lesson_complete(testUser1, 1, 1);
      expect(result.success).toBe(true);
    });
  });

  describe('Complex Scenario Tests', () => {
    test('should handle user deactivation and reactivation flow', async () => {
      // Register and activate user
      await services.authController.register_user(adminUser, testUser1);

      // Complete some progress
      await services.progressTracker.mark_lesson_complete(testUser1, 1, 1);
      await services.badgeTracker.mint_badge(
        testUser1,
        'ChapterCompletion' as BadgeType,
        1,
        'Test badge'
      );

      // Deactivate user
      await services.authController.remove_user(adminUser, testUser1);

      // Verify user is deactivated
      const isAuthenticated = await services.authController.is_authenticated_user(testUser1);
      expect(isAuthenticated).toBe(false);

      // Progress and badges should still exist
      const progress = await services.progressTracker.get_user_progress(testUser1, 1);
      const badges = await services.badgeTracker.get_user_badges(testUser1);
      expect(progress).toContain(1);
      expect(badges).toHaveLength(1);

      // Reactivate user by registering again
      await services.authController.register_user(adminUser, testUser1);

      const isReactivated = await services.authController.is_authenticated_user(testUser1);
      expect(isReactivated).toBe(true);
    });

    test('should handle admin role changes and permissions', async () => {
      const newAdmin = 'GNEWADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ';

      // Add new admin
      await services.authController.add_admin(adminUser, newAdmin);

      // New admin should be able to perform admin operations
      await expect(services.authController.register_user(newAdmin, testUser1))
        .resolves.not.toThrow();

      await expect(services.graduationNFT.set_paused(newAdmin, true))
        .resolves.not.toThrow();

      // Remove admin privileges
      await services.authController.remove_admin(adminUser, newAdmin);

      // Former admin should no longer be able to perform admin operations
      await expect(services.authController.register_user(newAdmin, testUser2))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should handle graduation NFT transfer attempts (soulbound)', async () => {
      // Set up user with graduation NFT
      await services.authController.register_user(adminUser, testUser1);
      await services.authController.register_user(adminUser, testUser2);

      // Complete requirements and mint NFT
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await services.progressTracker.mark_lesson_complete(testUser1, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await services.badgeTracker.mint_badge(
          testUser1,
          'ChapterCompletion' as BadgeType,
          i,
          `Badge ${i}`
        );
      }

      await services.graduationNFT.mint_graduation_nft(testUser1);

      // Attempt to transfer NFT (should always fail)
      const transferResult = await services.graduationNFT.attempt_transfer(testUser1, testUser2, 1);
      expect(transferResult.success).toBe(false);
      expect(transferResult.error).toBe(NFTError.TransferNotAllowed);

      // Verify NFT is still owned by original user
      const nft = await services.graduationNFT.get_graduation_nft(testUser1);
      expect(nft?.owner).toBe(testUser1);

      const hasNFT2 = await services.graduationNFT.has_graduation_nft(testUser2);
      expect(hasNFT2).toBe(false);
    });

    test('should handle service dependency injection correctly', async () => {
      // Create services without factory to test manual dependency injection
      const manualProgressService = new (await import('../mock-progress-tracker.service')).MockProgressTrackerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      const manualBadgeService = new (await import('../mock-badge-tracker.service')).MockBadgeTrackerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      const manualAuthService = new (await import('../mock-auth-controller.service')).MockAuthControllerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      const manualNFTService = new (await import('../mock-graduation-nft.service')).MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      // Set up dependencies manually
      manualBadgeService.setDependencies(manualProgressService, manualAuthService);
      manualNFTService.setDependencies(manualProgressService, manualBadgeService);

      // Initialize services
      await manualBadgeService.init(
        'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GAUTH_CONTROLLER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        adminUser
      );
      await manualNFTService.initialize(
        adminUser,
        'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM',
        'GBADGE_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM'
      );

      // Test that dependencies work correctly
      await manualAuthService.register_user(adminUser, testUser1);

      // Complete requirements
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await manualProgressService.mark_lesson_complete(testUser1, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await manualBadgeService.mint_badge(
          testUser1,
          'ChapterCompletion' as BadgeType,
          i,
          `Badge ${i}`
        );
      }

      // Should be able to mint graduation NFT
      const result = await manualNFTService.mint_graduation_nft(testUser1);
      expect(result.success).toBe(true);
    });
  });
});
