/**
 * Unit tests for MockGraduationNFTService
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockGraduationNFTService } from '../mock-graduation-nft.service';
import { MockProgressTrackerService } from '../mock-progress-tracker.service';
import { MockBadgeTrackerService } from '../mock-badge-tracker.service';
import { MockAuthControllerService } from '../mock-auth-controller.service';
import { NFTError, BadgeType } from '~/lib/types/blockchain/contract-interfaces.types';

describe('MockGraduationNFTService', () => {
  let nftService: MockGraduationNFTService;
  let progressService: MockProgressTrackerService;
  let badgeService: MockBadgeTrackerService;
  let authService: MockAuthControllerService;
  
  const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const testUser2 = 'GTEST2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const newAdmin = 'GNEWADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ';
  const progressTrackerAddress = 'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM';
  const badgeTrackerAddress = 'GBADGE_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM';

  beforeEach(async () => {
    nftService = new MockGraduationNFTService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });

    progressService = new MockProgressTrackerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });

    badgeService = new MockBadgeTrackerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });

    authService = new MockAuthControllerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });

    // Set up dependencies
    nftService.setDependencies(progressService, badgeService);
    badgeService.setDependencies(progressService, authService);

    // Initialize services
    await badgeService.init(progressTrackerAddress, 'GAUTH_CONTROLLER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM', adminUser);
    await nftService.initialize(adminUser, progressTrackerAddress, badgeTrackerAddress);
  });

  describe('initialize', () => {
    test('should initialize successfully with valid admin', async () => {
      const newNftService = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      await expect(newNftService.initialize(adminUser, progressTrackerAddress, badgeTrackerAddress))
        .resolves.not.toThrow();

      const admin = await newNftService.get_admin();
      expect(admin).toBe(adminUser);
    });

    test('should reject double initialization', async () => {
      await expect(nftService.initialize(adminUser, progressTrackerAddress, badgeTrackerAddress))
        .rejects.toThrow('Contract already initialized');
    });
  });

  describe('mint_graduation_nft', () => {
    beforeEach(async () => {
      // Set up user with sufficient progress and badges
      await authService.register_user(adminUser, testUser);
      
      // Complete multiple chapters
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      // Mint sufficient badges
      for (let i = 1; i <= 6; i++) {
        await badgeService.mint_badge(
          testUser,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }
    });

    test('should mint graduation NFT successfully for qualified user', async () => {
      const result = await nftService.mint_graduation_nft(testUser);
      
      expect(result.success).toBe(true);
      expect(result.data?.owner).toBe(testUser);
      expect(result.data?.metadata.badges).toHaveLength(6);
      expect(result.data?.metadata.issued_at).toBeDefined();
      expect(result.data?.metadata.version).toBeDefined();
    });

    test('should reject minting when contract not initialized', async () => {
      const uninitializedService = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      await expect(uninitializedService.mint_graduation_nft(testUser))
        .rejects.toThrow('Contract not initialized');
    });

    test('should reject minting when contract is paused', async () => {
      await nftService.set_paused(adminUser, true);
      
      const result = await nftService.mint_graduation_nft(testUser);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.ContractPaused);
    });

    test('should reject duplicate minting', async () => {
      await nftService.mint_graduation_nft(testUser);
      
      const result = await nftService.mint_graduation_nft(testUser);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.AlreadyMinted);
    });

    test('should reject minting with insufficient progress', async () => {
      // Create user with insufficient progress
      await authService.register_user(adminUser, testUser2);
      
      const result = await nftService.mint_graduation_nft(testUser2);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.InsufficientProgress);
    });

    test('should reject minting with insufficient badges', async () => {
      // Create user with good progress but insufficient badges
      await authService.register_user(adminUser, testUser2);
      
      // Complete chapters
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser2, chapter, lesson);
        }
      }

      // Only mint 3 badges (insufficient)
      for (let i = 1; i <= 3; i++) {
        await badgeService.mint_badge(
          testUser2,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }
      
      const result = await nftService.mint_graduation_nft(testUser2);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.InvalidBadgeCount);
    });
  });

  describe('get_graduation_nft', () => {
    test('should return NFT for user who has one', async () => {
      // Set up and mint NFT
      await authService.register_user(adminUser, testUser);
      
      // Complete chapters and mint badges
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await badgeService.mint_badge(
          testUser,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      await nftService.mint_graduation_nft(testUser);
      
      const nft = await nftService.get_graduation_nft(testUser);
      expect(nft).toBeDefined();
      expect(nft?.owner).toBe(testUser);
    });

    test('should return null for user without NFT', async () => {
      const nft = await nftService.get_graduation_nft(testUser);
      expect(nft).toBeNull();
    });
  });

  describe('has_graduation_nft', () => {
    test('should return true for user with NFT', async () => {
      // Set up and mint NFT
      await authService.register_user(adminUser, testUser);
      
      // Complete chapters and mint badges
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await badgeService.mint_badge(
          testUser,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      await nftService.mint_graduation_nft(testUser);
      
      const hasNFT = await nftService.has_graduation_nft(testUser);
      expect(hasNFT).toBe(true);
    });

    test('should return false for user without NFT', async () => {
      const hasNFT = await nftService.has_graduation_nft(testUser);
      expect(hasNFT).toBe(false);
    });
  });

  describe('attempt_transfer', () => {
    test('should always reject transfer attempts (soulbound)', async () => {
      const result = await nftService.attempt_transfer(testUser, testUser2, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.TransferNotAllowed);
    });
  });

  describe('set_paused', () => {
    test('should pause contract successfully by admin', async () => {
      await expect(nftService.set_paused(adminUser, true)).resolves.not.toThrow();

      const isPaused = await nftService.is_paused();
      expect(isPaused).toBe(true);
    });

    test('should unpause contract successfully by admin', async () => {
      await nftService.set_paused(adminUser, true);
      await nftService.set_paused(adminUser, false);

      const isPaused = await nftService.is_paused();
      expect(isPaused).toBe(false);
    });

    test('should reject pause by non-admin', async () => {
      await expect(nftService.set_paused(testUser, true))
        .rejects.toThrow('Not authorized: caller is not admin');
    });

    test('should reject pause when not initialized', async () => {
      const uninitializedService = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      await expect(uninitializedService.set_paused(adminUser, true))
        .rejects.toThrow('Contract not initialized');
    });
  });

  describe('set_admin', () => {
    test('should update admin successfully', async () => {
      await expect(nftService.set_admin(adminUser, newAdmin)).resolves.not.toThrow();

      const admin = await nftService.get_admin();
      expect(admin).toBe(newAdmin);
    });

    test('should reject admin update by non-admin', async () => {
      await expect(nftService.set_admin(testUser, newAdmin))
        .rejects.toThrow('Not authorized: caller is not admin');
    });

    test('should reject invalid admin address', async () => {
      await expect(nftService.set_admin(adminUser, 'INVALID_ADDRESS'))
        .rejects.toThrow('Invalid admin address format');
    });

    test('should reject admin update when not initialized', async () => {
      const uninitializedService = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      await expect(uninitializedService.set_admin(adminUser, newAdmin))
        .rejects.toThrow('Contract not initialized');
    });
  });

  describe('set_max_badges', () => {
    test('should update max badges successfully', async () => {
      await expect(nftService.set_max_badges(adminUser, 50)).resolves.not.toThrow();
    });

    test('should reject max badges update by non-admin', async () => {
      await expect(nftService.set_max_badges(testUser, 50))
        .rejects.toThrow('Not authorized: caller is not admin');
    });

    test('should reject invalid max badges count', async () => {
      await expect(nftService.set_max_badges(adminUser, 0))
        .rejects.toThrow('Invalid max badges count');

      await expect(nftService.set_max_badges(adminUser, -5))
        .rejects.toThrow('Invalid max badges count');
    });
  });

  describe('get_all_holders', () => {
    test('should return empty array when no NFTs minted', async () => {
      const holders = await nftService.get_all_holders();
      expect(holders).toEqual([]);
    });

    test('should return all NFT holders', async () => {
      // Set up and mint NFTs for multiple users
      const users = [testUser, testUser2];

      for (const user of users) {
        await authService.register_user(adminUser, user);

        // Complete chapters and mint badges
        for (let chapter = 1; chapter <= 3; chapter++) {
          for (let lesson = 1; lesson <= 5; lesson++) {
            await progressService.mark_lesson_complete(user, chapter, lesson);
          }
        }

        for (let i = 1; i <= 6; i++) {
          await badgeService.mint_badge(
            user,
            'ChapterCompletion' as BadgeType,
            i,
            `Chapter ${i} completion`
          );
        }

        await nftService.mint_graduation_nft(user);
      }

      const holders = await nftService.get_all_holders();
      expect(holders).toContain(testUser);
      expect(holders).toContain(testUser2);
      expect(holders).toHaveLength(2);
    });
  });

  describe('get_graduation_stats', () => {
    test('should return empty stats when no NFTs minted', async () => {
      const stats = await nftService.get_graduation_stats();

      expect(stats.totalGraduates).toBe(0);
      expect(stats.averageBadges).toBe(0);
      expect(stats.latestGraduation).toBeUndefined();
    });

    test('should return correct statistics', async () => {
      // Set up and mint NFTs for multiple users with different badge counts
      const users = [testUser, testUser2];
      const badgeCounts = [6, 8];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const badgeCount = badgeCounts[i];

        await authService.register_user(adminUser, user);

        // Complete chapters and mint badges
        for (let chapter = 1; chapter <= 3; chapter++) {
          for (let lesson = 1; lesson <= 5; lesson++) {
            await progressService.mark_lesson_complete(user, chapter, lesson);
          }
        }

        for (let j = 1; j <= badgeCount; j++) {
          await badgeService.mint_badge(
            user,
            'ChapterCompletion' as BadgeType,
            j,
            `Badge ${j}`
          );
        }

        await nftService.mint_graduation_nft(user);
      }

      const stats = await nftService.get_graduation_stats();
      expect(stats.totalGraduates).toBe(2);
      expect(stats.averageBadges).toBe(7); // (6 + 8) / 2 = 7
      expect(stats.latestGraduation).toBeDefined();
      expect(stats.latestGraduation?.user).toBe(testUser2); // Last minted
    });
  });

  describe('reset', () => {
    test('should reset service state', async () => {
      // Set up some state
      await authService.register_user(adminUser, testUser);

      // Complete chapters and mint badges
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      for (let i = 1; i <= 6; i++) {
        await badgeService.mint_badge(
          testUser,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      await nftService.mint_graduation_nft(testUser);
      await nftService.set_paused(adminUser, true);

      // Reset the service
      nftService.reset();

      // Verify state is reset
      const hasNFT = await nftService.has_graduation_nft(testUser);
      expect(hasNFT).toBe(false);

      const isPaused = await nftService.is_paused();
      expect(isPaused).toBe(false);

      const admin = await nftService.get_admin();
      expect(admin).toBeNull();

      const holders = await nftService.get_all_holders();
      expect(holders).toEqual([]);
    });
  });

  describe('getGraduationNFTStatus', () => {
    test('should return correct status information', async () => {
      const status = nftService.getGraduationNFTStatus();

      expect(status.isInitialized).toBe(true);
      expect(status.isPaused).toBe(false);
      expect(status.totalNFTs).toBe(0);
      expect(status.maxBadges).toBe(100);
      expect(status.adminAddress).toBe(adminUser);
    });

    test('should reflect state changes', async () => {
      await nftService.set_paused(adminUser, true);
      await nftService.set_max_badges(adminUser, 50);

      const status = nftService.getGraduationNFTStatus();

      expect(status.isPaused).toBe(true);
      expect(status.maxBadges).toBe(50);
    });
  });

  describe('service configuration', () => {
    test('should initialize with seed data', () => {
      const seedNFTs = {
        [testUser]: {
          owner: testUser,
          metadata: {
            issued_at: Date.now(),
            version: '1.0.0',
            badges: ['ChapterCompletion:1', 'ChapterCompletion:2'],
          },
        },
      };

      const serviceWithSeed = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
        seedData: { graduationNFTs: seedNFTs },
      });

      // Verify seed NFT exists
      serviceWithSeed.has_graduation_nft(testUser).then(hasNFT => {
        expect(hasNFT).toBe(true);
      });
    });

    test('should inherit from BaseMockService', () => {
      expect(nftService.getStatus).toBeDefined();
      expect(nftService.getConfig).toBeDefined();
      expect(nftService.updateConfig).toBeDefined();
      expect(nftService.on).toBeDefined();
      expect(nftService.emit).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should handle validation with missing dependencies', async () => {
      const serviceWithoutDeps = new MockGraduationNFTService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      await serviceWithoutDeps.initialize(adminUser, progressTrackerAddress, badgeTrackerAddress);

      // Should still work but with limited validation
      const result = await serviceWithoutDeps.mint_graduation_nft(testUser);
      expect(result.success).toBe(true); // No dependencies to validate against
    });

    test('should handle max badges validation', async () => {
      await nftService.set_max_badges(adminUser, 3);

      // Set up user with too many badges
      await authService.register_user(adminUser, testUser);

      // Complete chapters
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          await progressService.mark_lesson_complete(testUser, chapter, lesson);
        }
      }

      // Mint too many badges
      for (let i = 1; i <= 5; i++) {
        await badgeService.mint_badge(
          testUser,
          'ChapterCompletion' as BadgeType,
          i,
          `Chapter ${i} completion`
        );
      }

      const result = await nftService.mint_graduation_nft(testUser);
      expect(result.success).toBe(false);
      expect(result.error).toBe(NFTError.InvalidBadgeCount);
    });
  });
});
