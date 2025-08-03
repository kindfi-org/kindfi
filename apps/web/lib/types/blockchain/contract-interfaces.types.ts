/**
 * TypeScript interfaces matching the Rust Soroban contract interfaces
 * for the KindFi Academy blockchain services
 */

// Base types matching Soroban SDK types
export type Address = string;
export type ContractString = string;
export type ContractVec<T> = T[];
export type ContractMap<K, V> = Map<K, V>;

// Error types matching the Rust contract errors
export enum NFTError {
  AlreadyMinted = "AlreadyMinted",
  NotAuthorized = "NotAuthorized",
  ContractPaused = "ContractPaused",
  InvalidBadgeCount = "InvalidBadgeCount",
  TransferNotAllowed = "TransferNotAllowed",
  InvalidMetadata = "InvalidMetadata",
  UserNotFound = "UserNotFound",
  InsufficientProgress = "InsufficientProgress",
}

export enum BadgeError {
  InvalidKindfiUserAddress = "InvalidKindfiUserAddress",
  InvalidReferenceId = "InvalidReferenceId",
  InvalidMetadata = "InvalidMetadata",
  BadgeAlreadyExists = "BadgeAlreadyExists",
  ChapterNotComplete = "ChapterNotComplete",
  NotAuthorized = "NotAuthorized",
}

export enum ProgressError {
  LessonAlreadyCompleted = "LessonAlreadyCompleted",
  InvalidLessonId = "InvalidLessonId",
  InvalidChapterId = "InvalidChapterId",
  InvalidProgress = "InvalidProgress",
  NotAuthorized = "NotAuthorized",
}

// Data types matching the Rust contract structures
export interface NFTMetadata {
  issued_at: number;
  version: ContractString;
  badges: ContractVec<ContractString>;
}

export interface GraduationNFT {
  owner: Address;
  metadata: NFTMetadata;
}

export enum BadgeType {
  ChapterCompletion = "ChapterCompletion",
  SpecialAchievement = "SpecialAchievement",
  CommunityContribution = "CommunityContribution",
}

export interface Badge {
  badge_type: BadgeType;
  reference_id: number;
  metadata: ContractString;
  issued_at: number;
}

// Event data structures
export interface LessonCompletedEventData {
  user: Address;
  chapter_id: number;
  lesson_id: number;
}

export interface ChapterCompletedEventData {
  user: Address;
  chapter_id: number;
}

export interface ChapterUpdatedEventData {
  chapter_id: number;
  total_lessons: number;
}

export interface BadgeMintedEventData {
  user: Address;
  badge: Badge;
}

// Contract interface definitions
export interface IAcademyProgressTracker {
  /**
   * Mark a lesson as complete for a user
   */
  mark_lesson_complete(
    user: Address,
    chapter_id: number,
    lesson_id: number
  ): Promise<Result<void, ProgressError>>;

  /**
   * Check if a chapter is complete for a user
   */
  is_chapter_complete(user: Address, chapter_id: number): Promise<boolean>;

  /**
   * Get user's progress for a specific chapter
   */
  get_user_progress(user: Address, chapter_id: number): Promise<ContractVec<number>>;

  /**
   * Calculate completion percentage for a chapter
   */
  get_chapter_completion_percentage(user: Address, chapter_id: number): Promise<number>;

  /**
   * Set total lessons for a chapter (admin only)
   */
  set_chapter_lessons(admin: Address, chapter_id: number, total_lessons: number): Promise<void>;

  /**
   * Get total lessons for a chapter
   */
  get_chapter_lessons(chapter_id: number): Promise<number>;
}

export interface IAcademyBadgeTracker {
  /**
   * Initialize the contract with required addresses
   */
  init(
    progress_tracker_address: Address,
    auth_controller_address: Address,
    admin: Address
  ): Promise<Result<void, BadgeError>>;

  /**
   * Mint a badge for a user
   */
  mint_badge(
    user: Address,
    badge_type: BadgeType,
    reference_id: number,
    metadata: ContractString
  ): Promise<Result<void, BadgeError>>;

  /**
   * Get all badges for a user
   */
  get_user_badges(user: Address): Promise<ContractVec<Badge>>;

  /**
   * Get badges by type for a user
   */
  get_user_badges_by_type(user: Address, badge_type: BadgeType): Promise<ContractVec<number>>;

  /**
   * Check if a user has a specific badge
   */
  has_badge(user: Address, badge_type: BadgeType, reference_id: number): Promise<boolean>;
}

export interface IAcademyGraduationNFT {
  /**
   * Initialize the contract
   */
  initialize(
    admin: Address,
    progress_tracker: Address,
    badge_tracker: Address
  ): Promise<void>;

  /**
   * Mint a graduation NFT for a user
   */
  mint_graduation_nft(recipient: Address): Promise<Result<GraduationNFT, NFTError>>;

  /**
   * Get graduation NFT for a user
   */
  get_graduation_nft(user: Address): Promise<GraduationNFT | null>;

  /**
   * Check if user has graduation NFT
   */
  has_graduation_nft(user: Address): Promise<boolean>;

  /**
   * Attempt transfer (should always fail for soulbound NFTs)
   */
  attempt_transfer(from: Address, to: Address, token_id: number): Promise<Result<void, NFTError>>;

  /**
   * Set contract pause status (admin only)
   */
  set_paused(admin: Address, paused: boolean): Promise<void>;

  /**
   * Check if contract is paused
   */
  is_paused(): Promise<boolean>;
}

export interface IAuthController {
  /**
   * Check if an address belongs to an authenticated KindFi user
   */
  is_authenticated_user(address: Address): Promise<boolean>;

  /**
   * Register a new authenticated user (admin only)
   */
  register_user(admin: Address, user: Address): Promise<void>;

  /**
   * Remove an authenticated user (admin only)
   */
  remove_user(admin: Address, user: Address): Promise<void>;

  /**
   * Get all authenticated users
   */
  get_authenticated_users(): Promise<ContractVec<Address>>;
}

// Utility type for contract results
export type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Mock service configuration
export interface MockServiceConfig {
  /** Simulate network delay (ms) */
  networkDelay?: number;
  /** Probability of random errors (0-1) */
  errorRate?: number;
  /** Enable detailed logging */
  enableLogging?: boolean;
  /** Predefined user data */
  seedData?: {
    authenticatedUsers?: Address[];
    userProgress?: Record<Address, Record<number, number[]>>;
    userBadges?: Record<Address, Badge[]>;
    graduationNFTs?: Record<Address, GraduationNFT>;
    chapterLessons?: Record<number, number>;
  };
}

// Event subscription types
export type EventCallback<T> = (event: T) => void;

export interface IEventEmitter {
  on<T>(eventType: string, callback: EventCallback<T>): void;
  off<T>(eventType: string, callback: EventCallback<T>): void;
  emit<T>(eventType: string, data: T): void;
}
