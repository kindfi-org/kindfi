/**
 * Unit tests for MockBadgeTrackerService
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockBadgeTrackerService } from '../mock-badge-tracker.service';
import { MockProgressTrackerService } from '../mock-progress-tracker.service';
import { MockAuthControllerService } from '../mock-auth-controller.service';
import { BadgeError, BadgeType } from '~/lib/types/blockchain/contract-interfaces.types';

describe('MockBadgeTrackerService', () => {
  let badgeService: MockBadgeTrackerService;
  let progressService: MockProgressTrackerService;
  let authService: MockAuthControllerService;
  
  const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const progressTrackerAddress = 'GPROGRESS_TRACKER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM';
  const authControllerAddress = 'GAUTH_CONTROLLER_ADDRESS_MOCK_1234567890ABCDEFGHIJKLM';

  beforeEach(async () => {
    badgeService = new MockBadgeTrackerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });

    progressService = new MockProgressTrackerService({
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
    badgeService.setDependencies(progressService, authService);

    // Initialize the badge service
    await badgeService.init(progressTrackerAddress, authControllerAddress, adminUser);
  });

  describe('init', () => {
    test('should initialize successfully with valid admin', async () => {
      const newBadgeService = new MockBadgeTrackerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      newBadgeService.setDependencies(progressService, authService);

      const result = await newBadgeService.init(
        progressTrackerAddress,
        authControllerAddress,
        adminUser
      );

      expect(result.success).toBe(true);
    });

    test('should reject invalid admin user', async () => {
      const newBadgeService = new MockBadgeTrackerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
      });

      newBadgeService.setDependencies(progressService, authService);

      const invalidAdmin = 'GINVALID_USER_ADDRESS_1234567890ABCDEFGHIJKLM';
      const result = await newBadgeService.init(
        progressTrackerAddress,
        authControllerAddress,
        invalidAdmin
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(BadgeError.InvalidKindfiUserAddress);
    });
  });

  describe('mint_badge', () => {
    test('should mint badge successfully', async () => {
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Outstanding Performance'
      );

      expect(result.success).toBe(true);

      // Verify badge was created
      const badges = await badgeService.get_user_badges(testUser);
      expect(badges).toHaveLength(1);
      expect(badges[0].badge_type).toBe(BadgeType.SpecialAchievement);
      expect(badges[0].reference_id).toBe(1);
      expect(badges[0].metadata).toBe('Outstanding Performance');
    });

    test('should prevent duplicate badge minting', async () => {
      // Mint badge first time
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Outstanding Performance'
      );

      // Try to mint same badge again
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Outstanding Performance'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(BadgeError.BadgeAlreadyExists);
    });

    test('should reject invalid reference ID', async () => {
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        0,
        'Invalid Reference'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(BadgeError.InvalidReferenceId);
    });

    test('should reject empty metadata', async () => {
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(BadgeError.InvalidMetadata);
    });

    test('should validate chapter completion for ChapterCompletion badges', async () => {
      // Try to mint chapter completion badge without completing chapter
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.ChapterCompletion,
        1,
        'Chapter 1 Complete'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(BadgeError.ChapterNotComplete);
    });

    test('should mint ChapterCompletion badge after completing chapter', async () => {
      // Complete all lessons in chapter 1
      for (let lesson = 1; lesson <= 5; lesson++) {
        await progressService.mark_lesson_complete(testUser, 1, lesson);
      }

      // Now mint the badge
      const result = await badgeService.mint_badge(
        testUser,
        BadgeType.ChapterCompletion,
        1,
        'Chapter 1 Complete'
      );

      expect(result.success).toBe(true);
    });

    test('should emit badge minted event', async () => {
      let eventEmitted = false;
      let eventData: any = null;

      badgeService.on('badge_minted', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Outstanding Performance'
      );

      expect(eventEmitted).toBe(true);
      expect(eventData.user).toBe(testUser);
      expect(eventData.badge.badge_type).toBe(BadgeType.SpecialAchievement);
    });
  });

  describe('get_user_badges', () => {
    test('should return empty array for user with no badges', async () => {
      const badges = await badgeService.get_user_badges(testUser);
      expect(badges).toEqual([]);
    });

    test('should return badges sorted by newest first', async () => {
      // Mint multiple badges with delays to ensure different timestamps
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'First Badge'
      );

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      await badgeService.mint_badge(
        testUser,
        BadgeType.CommunityContribution,
        1,
        'Second Badge'
      );

      const badges = await badgeService.get_user_badges(testUser);
      expect(badges).toHaveLength(2);
      
      // Should be sorted by newest first
      expect(badges[0].metadata).toBe('Second Badge');
      expect(badges[1].metadata).toBe('First Badge');
    });
  });

  describe('get_user_badges_by_type', () => {
    test('should return empty array for badge type user does not have', async () => {
      const badges = await badgeService.get_user_badges_by_type(
        testUser,
        BadgeType.ChapterCompletion
      );
      expect(badges).toEqual([]);
    });

    test('should return reference IDs for specific badge type', async () => {
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Achievement 1'
      );

      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        3,
        'Achievement 3'
      );

      await badgeService.mint_badge(
        testUser,
        BadgeType.CommunityContribution,
        1,
        'Community Badge'
      );

      const specialBadges = await badgeService.get_user_badges_by_type(
        testUser,
        BadgeType.SpecialAchievement
      );

      expect(specialBadges).toEqual([1, 3]);
    });
  });

  describe('has_badge', () => {
    test('should return false for non-existent badge', async () => {
      const hasBadge = await badgeService.has_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1
      );
      expect(hasBadge).toBe(false);
    });

    test('should return true for existing badge', async () => {
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Test Badge'
      );

      const hasBadge = await badgeService.has_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1
      );
      expect(hasBadge).toBe(true);
    });
  });

  describe('get_user_badge_stats', () => {
    test('should return zero stats for user with no badges', async () => {
      const stats = await badgeService.get_user_badge_stats(testUser);
      
      expect(stats.totalBadges).toBe(0);
      expect(stats.badgesByType).toEqual({});
      expect(stats.latestBadge).toBeUndefined();
    });

    test('should calculate badge statistics correctly', async () => {
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Achievement 1'
      );

      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        2,
        'Achievement 2'
      );

      await badgeService.mint_badge(
        testUser,
        BadgeType.CommunityContribution,
        1,
        'Community Badge'
      );

      const stats = await badgeService.get_user_badge_stats(testUser);
      
      expect(stats.totalBadges).toBe(3);
      expect(stats.badgesByType[BadgeType.SpecialAchievement]).toBe(2);
      expect(stats.badgesByType[BadgeType.CommunityContribution]).toBe(1);
      expect(stats.latestBadge).toBeDefined();
    });
  });

  describe('get_badge_leaderboard', () => {
    test('should return empty leaderboard when no users have badges', async () => {
      const leaderboard = await badgeService.get_badge_leaderboard();
      expect(leaderboard).toEqual([]);
    });

    test('should return leaderboard sorted by total badges', async () => {
      const user1 = 'GUSER1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
      const user2 = 'GUSER2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

      // User1 gets 2 badges
      await badgeService.mint_badge(user1, BadgeType.SpecialAchievement, 1, 'Badge 1');
      await badgeService.mint_badge(user1, BadgeType.SpecialAchievement, 2, 'Badge 2');

      // User2 gets 1 badge
      await badgeService.mint_badge(user2, BadgeType.CommunityContribution, 1, 'Badge 1');

      const leaderboard = await badgeService.get_badge_leaderboard();
      
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].user).toBe(user1);
      expect(leaderboard[0].totalBadges).toBe(2);
      expect(leaderboard[1].user).toBe(user2);
      expect(leaderboard[1].totalBadges).toBe(1);
    });

    test('should respect limit parameter', async () => {
      const users = [
        'GUSER1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
        'GUSER2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
        'GUSER3ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      ];

      // Give each user a badge
      for (const user of users) {
        await badgeService.mint_badge(user, BadgeType.SpecialAchievement, 1, 'Badge');
      }

      const leaderboard = await badgeService.get_badge_leaderboard(2);
      expect(leaderboard).toHaveLength(2);
    });
  });

  describe('reset', () => {
    test('should reset all badge data', async () => {
      // Add some badges
      await badgeService.mint_badge(
        testUser,
        BadgeType.SpecialAchievement,
        1,
        'Test Badge'
      );

      // Reset service
      badgeService.reset();

      // Verify badges are cleared
      const badges = await badgeService.get_user_badges(testUser);
      expect(badges).toEqual([]);

      // Verify service needs re-initialization
      const status = badgeService.getBadgeTrackerStatus();
      expect(status.isInitialized).toBe(false);
    });
  });
});
