/**
 * Mock implementation of the AcademyGraduationNFT contract
 * Simulates graduation NFT minting, metadata management, and soulbound token behavior
 */

import { BaseMockService, MockDataGenerator } from './base-mock-service';
import type { MockProgressTrackerService } from './mock-progress-tracker.service';
import type { MockBadgeTrackerService } from './mock-badge-tracker.service';
import type {
  IAcademyGraduationNFT,
  Address,
  Result,
  NFTError,
  GraduationNFT,
  NFTMetadata,
  MockServiceConfig,
} from '~/lib/types/blockchain/contract-interfaces.types';

export class MockGraduationNFTService extends BaseMockService implements IAcademyGraduationNFT {
  private graduationNFTs: Map<Address, GraduationNFT> = new Map();
  private adminAddress: Address | null = null;
  private progressTrackerAddress: Address | null = null;
  private badgeTrackerAddress: Address | null = null;
  private isPaused = false;
  private isInitialized = false;
  private maxBadges = 100;

  // Dependencies (injected for testing)
  private progressTracker?: MockProgressTrackerService;
  private badgeTracker?: MockBadgeTrackerService;

  constructor(config: Partial<MockServiceConfig> = {}) {
    super(config);
    this.initializeDefaultData();
  }

  /**
   * Set dependencies for testing
   */
  setDependencies(
    progressTracker: MockProgressTrackerService,
    badgeTracker: MockBadgeTrackerService
  ): void {
    this.progressTracker = progressTracker;
    this.badgeTracker = badgeTracker;
  }

  /**
   * Initialize with realistic default data
   */
  private initializeDefaultData(): void {
    // Initialize with seed data if provided
    if (this.config.seedData?.graduationNFTs) {
      Object.entries(this.config.seedData.graduationNFTs).forEach(([address, nft]) => {
        this.graduationNFTs.set(address, nft);
      });
    }

    this.log('Default graduation NFT data initialized', {
      totalNFTs: this.graduationNFTs.size,
      holders: Array.from(this.graduationNFTs.keys()),
    });
  }

  /**
   * Initialize the contract
   */
  async initialize(
    admin: Address,
    progress_tracker: Address,
    badge_tracker: Address
  ): Promise<void> {
    return this.executeOperation('initialize', async () => {
      this.requireAuth(admin, 'initialize');

      if (this.isInitialized) {
        throw new Error('Contract already initialized');
      }

      this.adminAddress = admin;
      this.progressTrackerAddress = progress_tracker;
      this.badgeTrackerAddress = badge_tracker;
      this.isInitialized = true;

      this.log('Graduation NFT contract initialized', {
        admin,
        progressTracker: progress_tracker,
        badgeTracker: badge_tracker,
      });
    });
  }

  /**
   * Mint a graduation NFT for a user
   */
  async mint_graduation_nft(recipient: Address): Promise<Result<GraduationNFT, NFTError>> {
    return this.executeOperation('mint_graduation_nft', async () => {
      this.requireAuth(recipient, 'mint_graduation_nft');

      if (!this.isInitialized) {
        throw new Error('Contract not initialized');
      }

      if (this.isPaused) {
        return this.createErrorResult(NFTError.ContractPaused);
      }

      // Check if user already has a graduation NFT
      if (this.graduationNFTs.has(recipient)) {
        return this.createErrorResult(NFTError.AlreadyMinted);
      }

      // Validate graduation requirements
      const validationResult = await this.validateGraduationRequirements(recipient);
      if (!validationResult.success) {
        return this.createErrorResult(validationResult.error);
      }

      // Get user's badges for metadata
      const userBadges = this.badgeTracker 
        ? await this.badgeTracker.get_user_badges(recipient)
        : [];

      // Create NFT metadata
      const metadata: NFTMetadata = {
        issued_at: this.generateTimestamp(),
        version: MockDataGenerator.generateNFTVersion(),
        badges: userBadges.map(badge => 
          `${badge.badge_type}:${badge.reference_id}`
        ),
      };

      // Create the graduation NFT
      const graduationNFT: GraduationNFT = {
        owner: recipient,
        metadata,
      };

      // Store the NFT
      this.graduationNFTs.set(recipient, graduationNFT);

      this.log('Graduation NFT minted', {
        recipient,
        badgeCount: metadata.badges.length,
        version: metadata.version,
      });

      return this.createSuccessResult(graduationNFT);
    });
  }

  /**
   * Validate graduation requirements
   */
  private async validateGraduationRequirements(user: Address): Promise<Result<void, NFTError>> {
    try {
      // Check if user has sufficient progress
      if (this.progressTracker) {
        const overallProgress = await this.progressTracker.get_user_overall_progress(user);
        
        // Require at least 80% overall completion
        if (overallProgress.overallPercentage < 80) {
          return this.createErrorResult(NFTError.InsufficientProgress);
        }

        // Require at least 3 completed chapters
        if (overallProgress.completedChapters < 3) {
          return this.createErrorResult(NFTError.InsufficientProgress);
        }
      }

      // Check badge requirements
      if (this.badgeTracker) {
        const userBadges = await this.badgeTracker.get_user_badges(user);
        
        // Require at least 5 badges
        if (userBadges.length < 5) {
          return this.createErrorResult(NFTError.InvalidBadgeCount);
        }

        // Check for badge count limit
        if (userBadges.length > this.maxBadges) {
          return this.createErrorResult(NFTError.InvalidBadgeCount);
        }
      }

      return this.createSuccessResult(undefined);
    } catch (error) {
      this.log('Error validating graduation requirements', { user, error });
      return this.createErrorResult(NFTError.InsufficientProgress);
    }
  }

  /**
   * Get graduation NFT for a user
   */
  async get_graduation_nft(user: Address): Promise<GraduationNFT | null> {
    return this.executeOperation('get_graduation_nft', async () => {
      return this.graduationNFTs.get(user) || null;
    });
  }

  /**
   * Check if user has graduation NFT
   */
  async has_graduation_nft(user: Address): Promise<boolean> {
    return this.executeOperation('has_graduation_nft', async () => {
      return this.graduationNFTs.has(user);
    });
  }

  /**
   * Attempt transfer (should always fail for soulbound NFTs)
   */
  async attempt_transfer(from: Address, to: Address, token_id: number): Promise<Result<void, NFTError>> {
    return this.executeOperation('attempt_transfer', async () => {
      this.requireAuth(from, 'attempt_transfer');

      // Soulbound NFTs cannot be transferred
      this.log('Transfer attempt rejected - soulbound NFT', { from, to, token_id });
      return this.createErrorResult(NFTError.TransferNotAllowed);
    });
  }

  /**
   * Set contract pause status (admin only)
   */
  async set_paused(admin: Address, paused: boolean): Promise<void> {
    return this.executeOperation('set_paused', async () => {
      this.requireAuth(admin, 'set_paused');

      if (!this.isInitialized) {
        throw new Error('Contract not initialized');
      }

      if (admin !== this.adminAddress) {
        throw new Error('Not authorized: caller is not admin');
      }

      this.isPaused = paused;
      this.log('Contract pause status changed', { admin, paused });
    });
  }

  /**
   * Check if contract is paused
   */
  async is_paused(): Promise<boolean> {
    return this.executeOperation('is_paused', async () => {
      return this.isPaused;
    });
  }

  /**
   * Set admin address (admin only)
   */
  async set_admin(current_admin: Address, new_admin: Address): Promise<void> {
    return this.executeOperation('set_admin', async () => {
      this.requireAuth(current_admin, 'set_admin');

      if (!this.isInitialized) {
        throw new Error('Contract not initialized');
      }

      if (current_admin !== this.adminAddress) {
        throw new Error('Not authorized: caller is not admin');
      }

      if (!this.validateAddress(new_admin)) {
        throw new Error('Invalid admin address format');
      }

      this.adminAddress = new_admin;
      this.log('Admin address updated', { current_admin, new_admin });
    });
  }

  /**
   * Get admin address
   */
  async get_admin(): Promise<Address | null> {
    return this.executeOperation('get_admin', async () => {
      return this.adminAddress;
    });
  }

  /**
   * Set maximum badges allowed
   */
  async set_max_badges(admin: Address, max_badges: number): Promise<void> {
    return this.executeOperation('set_max_badges', async () => {
      this.requireAuth(admin, 'set_max_badges');

      if (admin !== this.adminAddress) {
        throw new Error('Not authorized: caller is not admin');
      }

      if (max_badges <= 0) {
        throw new Error('Invalid max badges count');
      }

      this.maxBadges = max_badges;
      this.log('Max badges updated', { admin, max_badges });
    });
  }

  /**
   * Get all graduation NFT holders
   */
  async get_all_holders(): Promise<Address[]> {
    return this.executeOperation('get_all_holders', async () => {
      return Array.from(this.graduationNFTs.keys());
    });
  }

  /**
   * Get graduation statistics
   */
  async get_graduation_stats(): Promise<{
    totalGraduates: number;
    averageBadges: number;
    latestGraduation?: {
      user: Address;
      timestamp: number;
      badgeCount: number;
    };
  }> {
    return this.executeOperation('get_graduation_stats', async () => {
      const nfts = Array.from(this.graduationNFTs.values());
      
      if (nfts.length === 0) {
        return {
          totalGraduates: 0,
          averageBadges: 0,
        };
      }

      const totalBadges = nfts.reduce((sum, nft) => sum + nft.metadata.badges.length, 0);
      const averageBadges = Math.round(totalBadges / nfts.length);

      // Find latest graduation
      const latestNFT = nfts.reduce((latest, current) => 
        current.metadata.issued_at > latest.metadata.issued_at ? current : latest
      );

      return {
        totalGraduates: nfts.length,
        averageBadges,
        latestGraduation: {
          user: latestNFT.owner,
          timestamp: latestNFT.metadata.issued_at,
          badgeCount: latestNFT.metadata.badges.length,
        },
      };
    });
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.graduationNFTs.clear();
    this.adminAddress = null;
    this.progressTrackerAddress = null;
    this.badgeTrackerAddress = null;
    this.isPaused = false;
    this.isInitialized = false;
    this.maxBadges = 100;
    this.initializeDefaultData();
    this.log('Graduation NFT service state reset');
  }

  /**
   * Get service-specific status
   */
  getGraduationNFTStatus(): {
    isInitialized: boolean;
    isPaused: boolean;
    totalNFTs: number;
    maxBadges: number;
    adminAddress: Address | null;
  } {
    return {
      isInitialized: this.isInitialized,
      isPaused: this.isPaused,
      totalNFTs: this.graduationNFTs.size,
      maxBadges: this.maxBadges,
      adminAddress: this.adminAddress,
    };
  }
}
