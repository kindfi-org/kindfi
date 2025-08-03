/**
 * Mock Blockchain Server
 * HTTP API server that exposes the mock blockchain services for development and testing
 */

import { MockBlockchainServiceFactory } from '../apps/web/lib/services/blockchain';
import type { 
  Address, 
  BadgeType, 
  MockBlockchainConfig 
} from '../apps/web/lib/types/blockchain/contract-interfaces.types';

// Simple HTTP server implementation
const server = Bun.serve({
  port: process.env.PORT || 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Initialize services
      const config: Partial<MockBlockchainConfig> = {
        environment: (process.env.MOCK_ENVIRONMENT as any) || 'development',
        networkDelay: parseInt(process.env.NETWORK_DELAY || '100'),
        errorRate: parseFloat(process.env.ERROR_RATE || '0.05'),
        enableLogging: process.env.ENABLE_LOGGING === 'true',
        generateTestData: process.env.GENERATE_TEST_DATA === 'true',
        testUserCount: parseInt(process.env.TEST_USER_COUNT || '10'),
      };

      const factory = MockBlockchainServiceFactory.getInstance(config);
      const services = factory.getAllServices();

      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          services: factory.getSystemStatus()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // API routes
      if (path.startsWith('/api/')) {
        const response = await handleApiRequest(path, method, req, services);
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response('Mock Blockchain Services API', {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Server error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
});

/**
 * Handle API requests
 */
async function handleApiRequest(path: string, method: string, req: Request, services: any) {
  const segments = path.split('/').filter(Boolean);
  const service = segments[1]; // api/[service]/...
  const action = segments[2];

  let body: any = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  switch (service) {
    case 'progress':
      return handleProgressTrackerRequest(action, method, body, services.progressTracker);
    
    case 'badges':
      return handleBadgeTrackerRequest(action, method, body, services.badgeTracker);
    
    case 'auth':
      return handleAuthControllerRequest(action, method, body, services.authController);
    
    case 'graduation':
      return handleGraduationNFTRequest(action, method, body, services.graduationNFT);
    
    case 'system':
      return handleSystemRequest(action, method, body, services);
    
    default:
      return { error: 'Unknown service', service };
  }
}

/**
 * Handle Progress Tracker requests
 */
async function handleProgressTrackerRequest(action: string, method: string, body: any, service: any) {
  switch (action) {
    case 'mark-lesson-complete':
      if (method === 'POST') {
        const { user, chapterId, lessonId } = body;
        return await service.mark_lesson_complete(user, chapterId, lessonId);
      }
      break;

    case 'is-chapter-complete':
      if (method === 'GET') {
        const { user, chapterId } = body;
        return await service.is_chapter_complete(user, chapterId);
      }
      break;

    case 'user-progress':
      if (method === 'GET') {
        const { user, chapterId } = body;
        return await service.get_user_progress(user, chapterId);
      }
      break;

    case 'overall-progress':
      if (method === 'GET') {
        const { user } = body;
        return await service.get_user_overall_progress(user);
      }
      break;

    case 'chapters':
      if (method === 'GET') {
        return await service.get_all_chapters();
      }
      break;

    default:
      return { error: 'Unknown progress tracker action', action };
  }
}

/**
 * Handle Badge Tracker requests
 */
async function handleBadgeTrackerRequest(action: string, method: string, body: any, service: any) {
  switch (action) {
    case 'mint':
      if (method === 'POST') {
        const { user, badgeType, referenceId, metadata } = body;
        return await service.mint_badge(user, badgeType, referenceId, metadata);
      }
      break;

    case 'user-badges':
      if (method === 'GET') {
        const { user } = body;
        return await service.get_user_badges(user);
      }
      break;

    case 'user-badges-by-type':
      if (method === 'GET') {
        const { user, badgeType } = body;
        return await service.get_user_badges_by_type(user, badgeType);
      }
      break;

    case 'has-badge':
      if (method === 'GET') {
        const { user, badgeType, referenceId } = body;
        return await service.has_badge(user, badgeType, referenceId);
      }
      break;

    case 'stats':
      if (method === 'GET') {
        const { user } = body;
        return await service.get_user_badge_stats(user);
      }
      break;

    case 'leaderboard':
      if (method === 'GET') {
        const { limit } = body;
        return await service.get_badge_leaderboard(limit);
      }
      break;

    default:
      return { error: 'Unknown badge tracker action', action };
  }
}

/**
 * Handle Auth Controller requests
 */
async function handleAuthControllerRequest(action: string, method: string, body: any, service: any) {
  switch (action) {
    case 'is-authenticated':
      if (method === 'GET') {
        const { address } = body;
        return await service.is_authenticated_user(address);
      }
      break;

    case 'register':
      if (method === 'POST') {
        const { admin, user } = body;
        return await service.register_user(admin, user);
      }
      break;

    case 'users':
      if (method === 'GET') {
        return await service.get_authenticated_users();
      }
      break;

    case 'stats':
      if (method === 'GET') {
        return await service.get_auth_stats();
      }
      break;

    default:
      return { error: 'Unknown auth controller action', action };
  }
}

/**
 * Handle Graduation NFT requests
 */
async function handleGraduationNFTRequest(action: string, method: string, body: any, service: any) {
  switch (action) {
    case 'mint':
      if (method === 'POST') {
        const { recipient } = body;
        return await service.mint_graduation_nft(recipient);
      }
      break;

    case 'get':
      if (method === 'GET') {
        const { user } = body;
        return await service.get_graduation_nft(user);
      }
      break;

    case 'has':
      if (method === 'GET') {
        const { user } = body;
        return await service.has_graduation_nft(user);
      }
      break;

    case 'stats':
      if (method === 'GET') {
        return await service.get_graduation_stats();
      }
      break;

    case 'holders':
      if (method === 'GET') {
        return await service.get_all_holders();
      }
      break;

    default:
      return { error: 'Unknown graduation NFT action', action };
  }
}

/**
 * Handle System requests
 */
async function handleSystemRequest(action: string, method: string, body: any, services: any) {
  switch (action) {
    case 'status':
      if (method === 'GET') {
        return {
          progressTracker: services.progressTracker.getStatus(),
          badgeTracker: services.badgeTracker.getStatus(),
          authController: services.authController.getStatus(),
          graduationNFT: services.graduationNFT.getStatus(),
        };
      }
      break;

    case 'reset':
      if (method === 'POST') {
        services.progressTracker.reset();
        services.badgeTracker.reset();
        services.authController.reset();
        services.graduationNFT.reset();
        return { message: 'All services reset successfully' };
      }
      break;

    case 'simulate-journey':
      if (method === 'POST') {
        const { userAddress } = body;
        return await simulateUserJourney(userAddress, services);
      }
      break;

    default:
      return { error: 'Unknown system action', action };
  }
}

/**
 * Simulate a complete user journey for testing
 */
async function simulateUserJourney(userAddress: Address, services: any) {
  try {
    // Complete Chapter 1
    for (let lesson = 1; lesson <= 5; lesson++) {
      await services.progressTracker.mark_lesson_complete(userAddress, 1, lesson);
    }

    // Mint chapter completion badge
    await services.badgeTracker.mint_badge(
      userAddress,
      'ChapterCompletion' as BadgeType,
      1,
      'Completed Blockchain Fundamentals'
    );

    // Complete Chapter 2 partially
    for (let lesson = 1; lesson <= 4; lesson++) {
      await services.progressTracker.mark_lesson_complete(userAddress, 2, lesson);
    }

    // Add some special badges
    await services.badgeTracker.mint_badge(
      userAddress,
      'SpecialAchievement' as BadgeType,
      1,
      'Outstanding Performance'
    );

    // Get final state
    const progress = await services.progressTracker.get_user_overall_progress(userAddress);
    const badges = await services.badgeTracker.get_user_badges(userAddress);
    
    // Try to mint graduation NFT
    let graduationNFT = null;
    try {
      const result = await services.graduationNFT.mint_graduation_nft(userAddress);
      if (result.success) {
        graduationNFT = result.data;
      }
    } catch (error) {
      // NFT requirements not met
    }

    return {
      success: true,
      userAddress,
      progress,
      badges,
      graduationNFT,
      message: 'User journey simulation completed'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userAddress
    };
  }
}

console.log(`🚀 Mock Blockchain Services API running on port ${server.port}`);
console.log(`📊 Health check: http://localhost:${server.port}/health`);
console.log(`🔗 API base URL: http://localhost:${server.port}/api`);
