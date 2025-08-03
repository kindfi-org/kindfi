/**
 * Mock implementation of the AcademyProgressTracker contract
 * Simulates lesson completion tracking, chapter progress calculation, and event emission
 */

import { BaseMockService, MockDataGenerator } from './base-mock-service';
import type {
  IAcademyProgressTracker,
  Address,
  ContractVec,
  Result,
  ProgressError,
  LessonCompletedEventData,
  ChapterCompletedEventData,
  ChapterUpdatedEventData,
  MockServiceConfig,
} from '~/lib/types/blockchain/contract-interfaces.types';

interface UserProgress {
  [chapterId: number]: number[]; // Array of completed lesson IDs
}

interface ChapterConfig {
  totalLessons: number;
  lessonNames: string[];
}

export class MockProgressTrackerService extends BaseMockService implements IAcademyProgressTracker {
  private userProgress: Map<Address, UserProgress> = new Map();
  private chapterConfigs: Map<number, ChapterConfig> = new Map();

  constructor(config: Partial<MockServiceConfig> = {}) {
    super(config);
    this.initializeDefaultData();
  }

  /**
   * Initialize with realistic default data
   */
  private initializeDefaultData(): void {
    // Set up default chapter configurations
    const defaultChapters = [
      { id: 1, totalLessons: 5, topic: 'Blockchain Fundamentals' },
      { id: 2, totalLessons: 7, topic: 'Smart Contracts' },
      { id: 3, totalLessons: 6, topic: 'DeFi Protocols' },
      { id: 4, totalLessons: 8, topic: 'NFTs and Digital Assets' },
      { id: 5, totalLessons: 4, topic: 'Web3 Development' },
    ];

    defaultChapters.forEach(chapter => {
      this.chapterConfigs.set(chapter.id, {
        totalLessons: chapter.totalLessons,
        lessonNames: MockDataGenerator.generateLessonNames(chapter.id, chapter.totalLessons),
      });
    });

    // Initialize with seed data if provided
    if (this.config.seedData?.userProgress) {
      Object.entries(this.config.seedData.userProgress).forEach(([address, progress]) => {
        this.userProgress.set(address, progress);
      });
    }

    if (this.config.seedData?.chapterLessons) {
      Object.entries(this.config.seedData.chapterLessons).forEach(([chapterId, totalLessons]) => {
        const id = Number(chapterId);
        this.chapterConfigs.set(id, {
          totalLessons,
          lessonNames: MockDataGenerator.generateLessonNames(id, totalLessons),
        });
      });
    }

    this.log('Default data initialized', {
      chapters: Array.from(this.chapterConfigs.keys()),
      users: Array.from(this.userProgress.keys()),
    });
  }

  /**
   * Mark a lesson as complete for a user
   */
  async mark_lesson_complete(
    user: Address,
    chapter_id: number,
    lesson_id: number
  ): Promise<Result<void, ProgressError>> {
    return this.executeOperation('mark_lesson_complete', async () => {
      // Validate inputs
      this.requireAuth(user, 'mark_lesson_complete');

      if (chapter_id <= 0) {
        return this.createErrorResult(ProgressError.InvalidChapterId);
      }

      const chapterConfig = this.chapterConfigs.get(chapter_id);
      if (!chapterConfig) {
        return this.createErrorResult(ProgressError.InvalidChapterId);
      }

      if (lesson_id <= 0 || lesson_id > chapterConfig.totalLessons) {
        return this.createErrorResult(ProgressError.InvalidLessonId);
      }

      // Get or create user progress
      if (!this.userProgress.has(user)) {
        this.userProgress.set(user, {});
      }

      const userChapterProgress = this.userProgress.get(user)!;
      if (!userChapterProgress[chapter_id]) {
        userChapterProgress[chapter_id] = [];
      }

      // Check if lesson is already completed
      if (userChapterProgress[chapter_id].includes(lesson_id)) {
        return this.createErrorResult(ProgressError.LessonAlreadyCompleted);
      }

      // Mark lesson as completed
      userChapterProgress[chapter_id].push(lesson_id);
      userChapterProgress[chapter_id].sort((a, b) => a - b);

      // Emit lesson completed event
      this.emit('lesson_completed', {
        user,
        chapter_id,
        lesson_id,
      } as LessonCompletedEventData);

      // Check if chapter is now complete
      if (await this.is_chapter_complete(user, chapter_id)) {
        this.emit('chapter_completed', {
          user,
          chapter_id,
        } as ChapterCompletedEventData);
      }

      return this.createSuccessResult(undefined);
    });
  }

  /**
   * Check if a chapter is complete for a user
   */
  async is_chapter_complete(user: Address, chapter_id: number): Promise<boolean> {
    return this.executeOperation('is_chapter_complete', async () => {
      const chapterConfig = this.chapterConfigs.get(chapter_id);
      if (!chapterConfig) {
        return false;
      }

      const userChapterProgress = this.userProgress.get(user)?.[chapter_id] || [];
      return userChapterProgress.length === chapterConfig.totalLessons;
    });
  }

  /**
   * Get user's progress for a specific chapter
   */
  async get_user_progress(user: Address, chapter_id: number): Promise<ContractVec<number>> {
    return this.executeOperation('get_user_progress', async () => {
      return this.userProgress.get(user)?.[chapter_id] || [];
    });
  }

  /**
   * Calculate completion percentage for a chapter
   */
  async get_chapter_completion_percentage(user: Address, chapter_id: number): Promise<number> {
    return this.executeOperation('get_chapter_completion_percentage', async () => {
      const chapterConfig = this.chapterConfigs.get(chapter_id);
      if (!chapterConfig) {
        return 0;
      }

      const userChapterProgress = this.userProgress.get(user)?.[chapter_id] || [];
      return Math.round((userChapterProgress.length / chapterConfig.totalLessons) * 100);
    });
  }

  /**
   * Set total lessons for a chapter (admin only)
   */
  async set_chapter_lessons(admin: Address, chapter_id: number, total_lessons: number): Promise<void> {
    return this.executeOperation('set_chapter_lessons', async () => {
      this.requireAuth(admin, 'set_chapter_lessons');

      if (chapter_id <= 0) {
        throw new Error('Invalid chapter ID');
      }

      if (total_lessons <= 0) {
        throw new Error('Invalid lesson count');
      }

      this.chapterConfigs.set(chapter_id, {
        totalLessons: total_lessons,
        lessonNames: MockDataGenerator.generateLessonNames(chapter_id, total_lessons),
      });

      // Emit chapter updated event
      this.emit('chapter_updated', {
        chapter_id,
        total_lessons,
      } as ChapterUpdatedEventData);
    });
  }

  /**
   * Get total lessons for a chapter
   */
  async get_chapter_lessons(chapter_id: number): Promise<number> {
    return this.executeOperation('get_chapter_lessons', async () => {
      return this.chapterConfigs.get(chapter_id)?.totalLessons || 0;
    });
  }

  /**
   * Get all chapters with their configurations
   */
  async get_all_chapters(): Promise<Array<{ id: number; totalLessons: number; lessonNames: string[] }>> {
    return this.executeOperation('get_all_chapters', async () => {
      return Array.from(this.chapterConfigs.entries()).map(([id, config]) => ({
        id,
        totalLessons: config.totalLessons,
        lessonNames: config.lessonNames,
      }));
    });
  }

  /**
   * Get user's overall progress across all chapters
   */
  async get_user_overall_progress(user: Address): Promise<{
    totalChapters: number;
    completedChapters: number;
    totalLessons: number;
    completedLessons: number;
    overallPercentage: number;
  }> {
    return this.executeOperation('get_user_overall_progress', async () => {
      const userProgressData = this.userProgress.get(user) || {};
      
      let totalLessons = 0;
      let completedLessons = 0;
      let completedChapters = 0;

      for (const [chapterId, config] of this.chapterConfigs.entries()) {
        totalLessons += config.totalLessons;
        const chapterProgress = userProgressData[chapterId] || [];
        completedLessons += chapterProgress.length;
        
        if (chapterProgress.length === config.totalLessons) {
          completedChapters++;
        }
      }

      return {
        totalChapters: this.chapterConfigs.size,
        completedChapters,
        totalLessons,
        completedLessons,
        overallPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.userProgress.clear();
    this.chapterConfigs.clear();
    this.initializeDefaultData();
    this.log('Service state reset');
  }

  /**
   * Get service-specific status
   */
  getProgressTrackerStatus(): {
    totalUsers: number;
    totalChapters: number;
    totalLessonsCompleted: number;
  } {
    let totalLessonsCompleted = 0;
    
    for (const userProgressData of this.userProgress.values()) {
      for (const chapterProgress of Object.values(userProgressData)) {
        totalLessonsCompleted += chapterProgress.length;
      }
    }

    return {
      totalUsers: this.userProgress.size,
      totalChapters: this.chapterConfigs.size,
      totalLessonsCompleted,
    };
  }
}
