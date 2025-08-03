/**
 * Mock implementation of the AcademyBadgeTracker contract
 * Simulates badge minting, validation, and user badge management
 */

import { BaseMockService, MockDataGenerator } from './base-mock-service';
import type { MockProgressTrackerService } from './mock-progress-tracker.service';
import type { MockAuthControllerService } from './mock-auth-controller.service';
import type {
  IAcademyBadgeTracker,
  Address,
  ContractVec,
  ContractString,
  Result,
  BadgeError,
  Badge,
  BadgeType,
  BadgeMintedEventData,
  MockServiceConfig,
} from '~/lib/types/blockchain/contract-interfaces.types';

interface UserBadgeIndex {
  [badgeType: string]: number[]; // Array of reference IDs for each badge type
}

export class MockBadgeTrackerService extends BaseMockService implements IAcademyBadgeTracker {
  private userBadges: Map<string, Badge> = new Map(); // Key: `${user}_${badgeType}_${referenceId}`
  private userBadgeIndex: Map<Address, UserBadgeIndex> = new Map();
  private progressTrackerAddress: Address | null = null;
  private authControllerAddress: Address | null = null;
  private isInitialized = false;

  // Dependencies (injected for testing)
  private progressTracker?: MockProgressTrackerService;
  private authController?: MockAuthControllerService;

  constructor(config: Partial<MockServiceConfig> = {}) {
    super(config);
    this.initializeDefaultData();
  }

  /**
   * Set dependencies for testing
   */
  setDependencies(
    progressTracker: MockProgressTrackerService,
    authController: MockAuthControllerService
  ): void {
    this.progressTracker = progressTracker;
    this.authController = authController;
  }

  /**
   * Initialize with realistic default data
   */
  private initializeDefaultData(): void {
    // Initialize with seed data if provided
    if (this.config.seedData?.userBadges) {
      Object.entries(this.config.seedData.userBadges).forEach(([address, badges]) => {
        badges.forEach(badge => {
          const key = `${address}_${badge.badge_type}_${badge.reference_id}`;
          this.userBadges.set(key, badge);
          
          // Update index
          if (!this.userBadgeIndex.has(address)) {
            this.userBadgeIndex.set(address, {});
          }
          const userIndex = this.userBadgeIndex.get(address)!;
          if (!userIndex[badge.badge_type]) {
            userIndex[badge.badge_type] = [];
          }
          userIndex[badge.badge_type].push(badge.reference_id);
        });
      });
    }

    this.log('Default badge data initialized', {
      totalBadges: this.userBadges.size,
      users: Array.from(this.userBadgeIndex.keys()),
    });
  }

  /**
   * Initialize the contract with required addresses
   */
  async init(
    progress_tracker_address: Address,
    auth_controller_address: Address,
    admin: Address
  ): Promise<Result<void, BadgeError>> {
    return this.executeOperation('init', async () => {
      this.requireAuth(admin, 'init');

      // Validate admin through auth controller if available
      if (this.authController) {
        const isValidAdmin = await this.authController.is_authenticated_user(admin);
        if (!isValidAdmin) {
          return this.createErrorResult(BadgeError.InvalidKindfiUserAddress);
        }
      }

      this.progressTrackerAddress = progress_tracker_address;
      this.authControllerAddress = auth_controller_address;
      this.isInitialized = true;

      this.log('Badge tracker initialized', {
        progressTrackerAddress: progress_tracker_address,
        authControllerAddress: auth_controller_address,
        admin,
      });

      return this.createSuccessResult(undefined);
    });
  }

  /**
   * Mint a badge for a user
   */
  async mint_badge(
    user: Address,
    badge_type: BadgeType,
    reference_id: number,
    metadata: ContractString
  ): Promise<Result<void, BadgeError>> {
    return this.executeOperation('mint_badge', async () => {
      this.requireAuth(user, 'mint_badge');

      if (!this.isInitialized) {
        throw new Error('Contract not initialized');
      }

      // Validate inputs
      if (reference_id <= 0) {
        return this.createErrorResult(BadgeError.InvalidReferenceId);
      }

      if (!metadata || metadata.trim().length === 0) {
        return this.createErrorResult(BadgeError.InvalidMetadata);
      }

      // Check if badge already exists
      const badgeKey = `${user}_${badge_type}_${reference_id}`;
      if (this.userBadges.has(badgeKey)) {
        return this.createErrorResult(BadgeError.BadgeAlreadyExists);
      }

      // Validate chapter completion for ChapterCompletion badges
      if (badge_type === BadgeType.ChapterCompletion && this.progressTracker) {
        const isChapterComplete = await this.progressTracker.is_chapter_complete(user, reference_id);
        if (!isChapterComplete) {
          return this.createErrorResult(BadgeError.ChapterNotComplete);
        }
      }

      // Create the badge
      const badge: Badge = {
        badge_type,
        reference_id,
        metadata: metadata || MockDataGenerator.generateBadgeMetadata(badge_type, reference_id),
        issued_at: this.generateTimestamp(),
      };

      // Store the badge
      this.userBadges.set(badgeKey, badge);

      // Update user badge index
      if (!this.userBadgeIndex.has(user)) {
        this.userBadgeIndex.set(user, {});
      }
      const userIndex = this.userBadgeIndex.get(user)!;
      if (!userIndex[badge_type]) {
        userIndex[badge_type] = [];
      }
      userIndex[badge_type].push(reference_id);
      userIndex[badge_type].sort((a, b) => a - b);

      // Emit badge minted event
      this.emit('badge_minted', {
        user,
        badge,
      } as BadgeMintedEventData);

      this.log('Badge minted', { user, badge_type, reference_id, metadata });

      return this.createSuccessResult(undefined);
    });
  }

  /**
   * Get all badges for a user
   */
  async get_user_badges(user: Address): Promise<ContractVec<Badge>> {
    return this.executeOperation('get_user_badges', async () => {
      const badges: Badge[] = [];
      const userIndex = this.userBadgeIndex.get(user);

      if (userIndex) {
        for (const [badgeType, referenceIds] of Object.entries(userIndex)) {
          for (const referenceId of referenceIds) {
            const badgeKey = `${user}_${badgeType}_${referenceId}`;
            const badge = this.userBadges.get(badgeKey);
            if (badge) {
              badges.push(badge);
            }
          }
        }
      }

      // Sort badges by issued_at timestamp (newest first)
      badges.sort((a, b) => b.issued_at - a.issued_at);

      return badges;
    });
  }

  /**
   * Get badges by type for a user
   */
  async get_user_badges_by_type(user: Address, badge_type: BadgeType): Promise<ContractVec<number>> {
    return this.executeOperation('get_user_badges_by_type', async () => {
      const userIndex = this.userBadgeIndex.get(user);
      return userIndex?.[badge_type] || [];
    });
  }

  /**
   * Check if a user has a specific badge
   */
  async has_badge(user: Address, badge_type: BadgeType, reference_id: number): Promise<boolean> {
    return this.executeOperation('has_badge', async () => {
      const badgeKey = `${user}_${badge_type}_${reference_id}`;
      return this.userBadges.has(badgeKey);
    });
  }

  /**
   * Get badge details
   */
  async get_badge(user: Address, badge_type: BadgeType, reference_id: number): Promise<Badge | null> {
    return this.executeOperation('get_badge', async () => {
      const badgeKey = `${user}_${badge_type}_${reference_id}`;
      return this.userBadges.get(badgeKey) || null;
    });
  }

  /**
   * Get badge statistics for a user
   */
  async get_user_badge_stats(user: Address): Promise<{
    totalBadges: number;
    badgesByType: Record<string, number>;
    latestBadge?: Badge;
  }> {
    return this.executeOperation('get_user_badge_stats', async () => {
      const badges = await this.get_user_badges(user);
      const badgesByType: Record<string, number> = {};

      badges.forEach(badge => {
        badgesByType[badge.badge_type] = (badgesByType[badge.badge_type] || 0) + 1;
      });

      return {
        totalBadges: badges.length,
        badgesByType,
        latestBadge: badges[0], // Already sorted by newest first
      };
    });
  }

  /**
   * Get all users with badges
   */
  async get_all_badge_holders(): Promise<ContractVec<Address>> {
    return this.executeOperation('get_all_badge_holders', async () => {
      return Array.from(this.userBadgeIndex.keys());
    });
  }

  /**
   * Get leaderboard of users by badge count
   */
  async get_badge_leaderboard(limit: number = 10): Promise<Array<{
    user: Address;
    totalBadges: number;
    badgesByType: Record<string, number>;
  }>> {
    return this.executeOperation('get_badge_leaderboard', async () => {
      const leaderboard: Array<{
        user: Address;
        totalBadges: number;
        badgesByType: Record<string, number>;
      }> = [];

      for (const user of this.userBadgeIndex.keys()) {
        const stats = await this.get_user_badge_stats(user);
        leaderboard.push({
          user,
          totalBadges: stats.totalBadges,
          badgesByType: stats.badgesByType,
        });
      }

      // Sort by total badges (descending)
      leaderboard.sort((a, b) => b.totalBadges - a.totalBadges);

      return leaderboard.slice(0, limit);
    });
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.userBadges.clear();
    this.userBadgeIndex.clear();
    this.progressTrackerAddress = null;
    this.authControllerAddress = null;
    this.isInitialized = false;
    this.initializeDefaultData();
    this.log('Badge tracker service state reset');
  }

  /**
   * Get service-specific status
   */
  getBadgeTrackerStatus(): {
    isInitialized: boolean;
    totalBadges: number;
    totalUsers: number;
    badgesByType: Record<string, number>;
  } {
    const badgesByType: Record<string, number> = {};
    
    for (const badge of this.userBadges.values()) {
      badgesByType[badge.badge_type] = (badgesByType[badge.badge_type] || 0) + 1;
    }

    return {
      isInitialized: this.isInitialized,
      totalBadges: this.userBadges.size,
      totalUsers: this.userBadgeIndex.size,
      badgesByType,
    };
  }
}
