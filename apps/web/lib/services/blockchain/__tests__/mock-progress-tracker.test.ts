/**
 * Unit tests for MockProgressTrackerService
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockProgressTrackerService } from '../mock-progress-tracker.service';
import { ProgressError } from '~/lib/types/blockchain/contract-interfaces.types';

describe('MockProgressTrackerService', () => {
  let service: MockProgressTrackerService;
  const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

  beforeEach(() => {
    service = new MockProgressTrackerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });
  });

  describe('mark_lesson_complete', () => {
    test('should mark lesson as complete successfully', async () => {
      const result = await service.mark_lesson_complete(testUser, 1, 1);
      
      expect(result.success).toBe(true);
      
      // Verify lesson is marked as complete
      const progress = await service.get_user_progress(testUser, 1);
      expect(progress).toContain(1);
    });

    test('should prevent duplicate lesson completion', async () => {
      // Mark lesson as complete first time
      await service.mark_lesson_complete(testUser, 1, 1);
      
      // Try to mark same lesson as complete again
      const result = await service.mark_lesson_complete(testUser, 1, 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ProgressError.LessonAlreadyCompleted);
    });

    test('should reject invalid chapter ID', async () => {
      const result = await service.mark_lesson_complete(testUser, 0, 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ProgressError.InvalidChapterId);
    });

    test('should reject invalid lesson ID', async () => {
      const result = await service.mark_lesson_complete(testUser, 1, 0);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ProgressError.InvalidLessonId);
    });

    test('should reject lesson ID exceeding chapter total', async () => {
      const result = await service.mark_lesson_complete(testUser, 1, 999);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(ProgressError.InvalidLessonId);
    });

    test('should emit lesson completed event', async () => {
      let eventEmitted = false;
      let eventData: any = null;

      service.on('lesson_completed', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      await service.mark_lesson_complete(testUser, 1, 1);

      expect(eventEmitted).toBe(true);
      expect(eventData).toEqual({
        user: testUser,
        chapter_id: 1,
        lesson_id: 1,
      });
    });

    test('should emit chapter completed event when chapter is finished', async () => {
      let chapterEventEmitted = false;
      let chapterEventData: any = null;

      service.on('chapter_completed', (data) => {
        chapterEventEmitted = true;
        chapterEventData = data;
      });

      // Complete all lessons in chapter 1 (5 lessons)
      for (let lesson = 1; lesson <= 5; lesson++) {
        await service.mark_lesson_complete(testUser, 1, lesson);
      }

      expect(chapterEventEmitted).toBe(true);
      expect(chapterEventData).toEqual({
        user: testUser,
        chapter_id: 1,
      });
    });
  });

  describe('is_chapter_complete', () => {
    test('should return false for incomplete chapter', async () => {
      await service.mark_lesson_complete(testUser, 1, 1);
      
      const isComplete = await service.is_chapter_complete(testUser, 1);
      expect(isComplete).toBe(false);
    });

    test('should return true for complete chapter', async () => {
      // Complete all lessons in chapter 1
      for (let lesson = 1; lesson <= 5; lesson++) {
        await service.mark_lesson_complete(testUser, 1, lesson);
      }
      
      const isComplete = await service.is_chapter_complete(testUser, 1);
      expect(isComplete).toBe(true);
    });

    test('should return false for non-existent chapter', async () => {
      const isComplete = await service.is_chapter_complete(testUser, 999);
      expect(isComplete).toBe(false);
    });

    test('should return false for user with no progress', async () => {
      const isComplete = await service.is_chapter_complete(testUser, 1);
      expect(isComplete).toBe(false);
    });
  });

  describe('get_user_progress', () => {
    test('should return empty array for new user', async () => {
      const progress = await service.get_user_progress(testUser, 1);
      expect(progress).toEqual([]);
    });

    test('should return completed lessons in order', async () => {
      await service.mark_lesson_complete(testUser, 1, 3);
      await service.mark_lesson_complete(testUser, 1, 1);
      await service.mark_lesson_complete(testUser, 1, 2);
      
      const progress = await service.get_user_progress(testUser, 1);
      expect(progress).toEqual([1, 2, 3]);
    });
  });

  describe('get_chapter_completion_percentage', () => {
    test('should return 0% for no progress', async () => {
      const percentage = await service.get_chapter_completion_percentage(testUser, 1);
      expect(percentage).toBe(0);
    });

    test('should calculate correct percentage', async () => {
      // Complete 2 out of 5 lessons (40%)
      await service.mark_lesson_complete(testUser, 1, 1);
      await service.mark_lesson_complete(testUser, 1, 2);
      
      const percentage = await service.get_chapter_completion_percentage(testUser, 1);
      expect(percentage).toBe(40);
    });

    test('should return 100% for complete chapter', async () => {
      // Complete all 5 lessons
      for (let lesson = 1; lesson <= 5; lesson++) {
        await service.mark_lesson_complete(testUser, 1, lesson);
      }
      
      const percentage = await service.get_chapter_completion_percentage(testUser, 1);
      expect(percentage).toBe(100);
    });
  });

  describe('set_chapter_lessons', () => {
    const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';

    test('should set chapter lessons successfully', async () => {
      await service.set_chapter_lessons(adminUser, 10, 8);
      
      const totalLessons = await service.get_chapter_lessons(10);
      expect(totalLessons).toBe(8);
    });

    test('should emit chapter updated event', async () => {
      let eventEmitted = false;
      let eventData: any = null;

      service.on('chapter_updated', (data) => {
        eventEmitted = true;
        eventData = data;
      });

      await service.set_chapter_lessons(adminUser, 10, 8);

      expect(eventEmitted).toBe(true);
      expect(eventData).toEqual({
        chapter_id: 10,
        total_lessons: 8,
      });
    });

    test('should reject invalid chapter ID', async () => {
      await expect(service.set_chapter_lessons(adminUser, 0, 5))
        .rejects.toThrow('Invalid chapter ID');
    });

    test('should reject invalid lesson count', async () => {
      await expect(service.set_chapter_lessons(adminUser, 1, 0))
        .rejects.toThrow('Invalid lesson count');
    });
  });

  describe('get_user_overall_progress', () => {
    test('should return zero stats for new user', async () => {
      const stats = await service.get_user_overall_progress(testUser);
      
      expect(stats.totalChapters).toBeGreaterThan(0);
      expect(stats.completedChapters).toBe(0);
      expect(stats.totalLessons).toBeGreaterThan(0);
      expect(stats.completedLessons).toBe(0);
      expect(stats.overallPercentage).toBe(0);
    });

    test('should calculate overall progress correctly', async () => {
      // Complete chapter 1 (5 lessons)
      for (let lesson = 1; lesson <= 5; lesson++) {
        await service.mark_lesson_complete(testUser, 1, lesson);
      }
      
      // Partially complete chapter 2 (3 out of 7 lessons)
      for (let lesson = 1; lesson <= 3; lesson++) {
        await service.mark_lesson_complete(testUser, 2, lesson);
      }
      
      const stats = await service.get_user_overall_progress(testUser);
      
      expect(stats.completedChapters).toBe(1);
      expect(stats.completedLessons).toBe(8); // 5 + 3
      expect(stats.overallPercentage).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    test('should reset all user progress', async () => {
      // Add some progress
      await service.mark_lesson_complete(testUser, 1, 1);
      await service.set_chapter_lessons(testUser, 10, 5);
      
      // Reset service
      service.reset();
      
      // Verify progress is cleared
      const progress = await service.get_user_progress(testUser, 1);
      expect(progress).toEqual([]);
      
      // Verify custom chapter is removed
      const totalLessons = await service.get_chapter_lessons(10);
      expect(totalLessons).toBe(0);
    });
  });

  describe('error simulation', () => {
    test('should simulate network errors when configured', async () => {
      const errorService = new MockProgressTrackerService({
        networkDelay: 0,
        errorRate: 1.0, // 100% error rate
        enableLogging: false,
      });

      await expect(errorService.mark_lesson_complete(testUser, 1, 1))
        .rejects.toThrow();
    });
  });

  describe('network delay simulation', () => {
    test('should simulate network delay', async () => {
      const delayService = new MockProgressTrackerService({
        networkDelay: 50,
        errorRate: 0,
        enableLogging: false,
      });

      const startTime = Date.now();
      await delayService.mark_lesson_complete(testUser, 1, 1);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });
  });
});
