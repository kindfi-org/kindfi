/**
 * Unit tests for MockAuthControllerService
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockAuthControllerService } from '../mock-auth-controller.service';

describe('MockAuthControllerService', () => {
  let service: MockAuthControllerService;
  const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const testUser2 = 'GTEST2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM';
  const newAdmin = 'GNEWADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ';
  const invalidAddress = 'INVALID_ADDRESS';

  beforeEach(() => {
    service = new MockAuthControllerService({
      networkDelay: 0,
      errorRate: 0,
      enableLogging: false,
    });
  });

  describe('is_authenticated_user', () => {
    test('should return true for authenticated users', async () => {
      // Register a user first
      await service.register_user(adminUser, testUser);
      
      const result = await service.is_authenticated_user(testUser);
      expect(result).toBe(true);
    });

    test('should return false for non-authenticated users', async () => {
      const result = await service.is_authenticated_user(testUser);
      expect(result).toBe(false);
    });

    test('should return false for invalid addresses', async () => {
      const result = await service.is_authenticated_user(invalidAddress);
      expect(result).toBe(false);
    });

    test('should return false for deactivated users', async () => {
      // Register and then remove user
      await service.register_user(adminUser, testUser);
      await service.remove_user(adminUser, testUser);
      
      const result = await service.is_authenticated_user(testUser);
      expect(result).toBe(false);
    });
  });

  describe('register_user', () => {
    test('should register user successfully with valid admin', async () => {
      await expect(service.register_user(adminUser, testUser)).resolves.not.toThrow();
      
      // Verify user is registered
      const isAuthenticated = await service.is_authenticated_user(testUser);
      expect(isAuthenticated).toBe(true);
    });

    test('should reject registration by non-admin', async () => {
      await expect(service.register_user(testUser, testUser2))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should reject invalid user address', async () => {
      await expect(service.register_user(adminUser, invalidAddress))
        .rejects.toThrow('Invalid user address format');
    });

    test('should reject duplicate user registration', async () => {
      await service.register_user(adminUser, testUser);
      
      await expect(service.register_user(adminUser, testUser))
        .rejects.toThrow('User already registered');
    });
  });

  describe('remove_user', () => {
    beforeEach(async () => {
      await service.register_user(adminUser, testUser);
    });

    test('should deactivate user successfully', async () => {
      await expect(service.remove_user(adminUser, testUser)).resolves.not.toThrow();
      
      // Verify user is deactivated
      const isAuthenticated = await service.is_authenticated_user(testUser);
      expect(isAuthenticated).toBe(false);
    });

    test('should reject removal by non-admin', async () => {
      await expect(service.remove_user(testUser2, testUser))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should reject removal of non-existent user', async () => {
      await expect(service.remove_user(adminUser, testUser2))
        .rejects.toThrow('User not found');
    });
  });

  describe('get_authenticated_users', () => {
    test('should return empty array when no users registered', async () => {
      // Reset to clear default test users
      service.reset();
      
      const users = await service.get_authenticated_users();
      expect(users).toEqual([]);
    });

    test('should return only active users', async () => {
      // Reset to clear default test users
      service.reset();
      
      await service.register_user(adminUser, testUser);
      await service.register_user(adminUser, testUser2);
      await service.remove_user(adminUser, testUser2);
      
      const users = await service.get_authenticated_users();
      expect(users).toEqual([testUser]);
    });

    test('should return all active users', async () => {
      // Reset to clear default test users
      service.reset();
      
      await service.register_user(adminUser, testUser);
      await service.register_user(adminUser, testUser2);
      
      const users = await service.get_authenticated_users();
      expect(users).toContain(testUser);
      expect(users).toContain(testUser2);
      expect(users).toHaveLength(2);
    });
  });

  describe('add_admin', () => {
    test('should add admin successfully', async () => {
      await expect(service.add_admin(adminUser, newAdmin)).resolves.not.toThrow();
      
      // Verify new admin can perform admin operations
      await expect(service.register_user(newAdmin, testUser)).resolves.not.toThrow();
    });

    test('should reject adding admin by non-admin', async () => {
      await expect(service.add_admin(testUser, newAdmin))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should reject invalid admin address', async () => {
      await expect(service.add_admin(adminUser, invalidAddress))
        .rejects.toThrow('Invalid admin address format');
    });

    test('should reject duplicate admin', async () => {
      await expect(service.add_admin(adminUser, adminUser))
        .rejects.toThrow('Address is already an admin');
    });
  });

  describe('remove_admin', () => {
    beforeEach(async () => {
      await service.add_admin(adminUser, newAdmin);
    });

    test('should remove admin successfully', async () => {
      await expect(service.remove_admin(adminUser, newAdmin)).resolves.not.toThrow();

      // Verify removed admin cannot perform admin operations
      await expect(service.register_user(newAdmin, testUser))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should reject removal by non-admin', async () => {
      await expect(service.remove_admin(testUser, newAdmin))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should reject self-removal', async () => {
      await expect(service.remove_admin(adminUser, adminUser))
        .rejects.toThrow('Cannot remove self as admin');
    });

    test('should reject removal of non-admin', async () => {
      await expect(service.remove_admin(adminUser, testUser))
        .rejects.toThrow('Target address is not an admin');
    });

    test('should prevent removing last admin', async () => {
      // Remove all admins except one
      await service.remove_admin(adminUser, newAdmin);

      // Try to remove the last admin (should fail)
      await expect(service.remove_admin(adminUser, adminUser))
        .rejects.toThrow('Cannot remove last admin');
    });
  });

  describe('is_admin', () => {
    test('should return true for admin addresses', async () => {
      const result = await service.is_admin(adminUser);
      expect(result).toBe(true);
    });

    test('should return false for non-admin addresses', async () => {
      const result = await service.is_admin(testUser);
      expect(result).toBe(false);
    });

    test('should return true for newly added admin', async () => {
      await service.add_admin(adminUser, newAdmin);

      const result = await service.is_admin(newAdmin);
      expect(result).toBe(true);
    });

    test('should return false for removed admin', async () => {
      await service.add_admin(adminUser, newAdmin);
      await service.remove_admin(adminUser, newAdmin);

      const result = await service.is_admin(newAdmin);
      expect(result).toBe(false);
    });
  });

  describe('get_admins', () => {
    test('should return all admin addresses', async () => {
      const admins = await service.get_admins();
      expect(admins).toContain(adminUser);
      expect(admins).toContain('GADMIN2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM');
    });

    test('should include newly added admin', async () => {
      await service.add_admin(adminUser, newAdmin);

      const admins = await service.get_admins();
      expect(admins).toContain(newAdmin);
    });

    test('should exclude removed admin', async () => {
      await service.add_admin(adminUser, newAdmin);
      await service.remove_admin(adminUser, newAdmin);

      const admins = await service.get_admins();
      expect(admins).not.toContain(newAdmin);
    });
  });

  describe('get_user_details', () => {
    test('should return user details for registered user', async () => {
      await service.register_user(adminUser, testUser);

      const details = await service.get_user_details(testUser);
      expect(details).toBeDefined();
      expect(details?.isActive).toBe(true);
      expect(details?.registeredBy).toBe(adminUser);
      expect(details?.metadata?.registrationSource).toBe('admin_registration');
    });

    test('should return null for non-existent user', async () => {
      const details = await service.get_user_details(testUser);
      expect(details).toBeNull();
    });

    test('should return details for deactivated user', async () => {
      await service.register_user(adminUser, testUser);
      await service.remove_user(adminUser, testUser);

      const details = await service.get_user_details(testUser);
      expect(details).toBeDefined();
      expect(details?.isActive).toBe(false);
      expect(details?.metadata?.deactivatedBy).toBe(adminUser);
    });
  });

  describe('get_auth_stats', () => {
    test('should return correct statistics', async () => {
      // Reset to clear default test users
      service.reset();

      // Register some users
      await service.register_user(adminUser, testUser);
      await service.register_user(adminUser, testUser2);

      // Deactivate one user
      await service.remove_user(adminUser, testUser2);

      const stats = await service.get_auth_stats();
      expect(stats.totalUsers).toBe(2);
      expect(stats.activeUsers).toBe(1);
      expect(stats.inactiveUsers).toBe(1);
      expect(stats.totalAdmins).toBe(2); // Default admins
      expect(stats.recentRegistrations).toBe(2); // Both registered recently
    });

    test('should count recent registrations correctly', async () => {
      // Reset to clear default test users
      service.reset();

      const stats = await service.get_auth_stats();
      expect(stats.totalUsers).toBe(0);
      expect(stats.activeUsers).toBe(0);
      expect(stats.inactiveUsers).toBe(0);
      expect(stats.recentRegistrations).toBe(0);
    });
  });

  describe('bulk_register_users', () => {
    const users = [testUser, testUser2, 'GTEST3ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'];

    test('should register multiple users successfully', async () => {
      const result = await service.bulk_register_users(adminUser, users);

      expect(result.successful).toEqual(users);
      expect(result.failed).toEqual([]);

      // Verify all users are registered
      for (const user of users) {
        const isAuthenticated = await service.is_authenticated_user(user);
        expect(isAuthenticated).toBe(true);
      }
    });

    test('should handle partial failures', async () => {
      // Register one user first to cause a duplicate error
      await service.register_user(adminUser, testUser);

      const result = await service.bulk_register_users(adminUser, users);

      expect(result.successful).toEqual([testUser2, 'GTEST3ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM']);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].address).toBe(testUser);
      expect(result.failed[0].reason).toBe('User already registered');
    });

    test('should reject bulk registration by non-admin', async () => {
      await expect(service.bulk_register_users(testUser, users))
        .rejects.toThrow('Not authorized: caller is not an admin');
    });

    test('should handle invalid addresses in bulk registration', async () => {
      const usersWithInvalid = [...users, invalidAddress];

      const result = await service.bulk_register_users(adminUser, usersWithInvalid);

      expect(result.successful).toEqual(users);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].address).toBe(invalidAddress);
      expect(result.failed[0].reason).toBe('Invalid user address format');
    });
  });

  describe('reset', () => {
    test('should reset service state', async () => {
      // Register some users and add admin
      await service.register_user(adminUser, testUser);
      await service.add_admin(adminUser, newAdmin);

      // Reset the service
      service.reset();

      // Verify state is reset
      const isAuthenticated = await service.is_authenticated_user(testUser);
      expect(isAuthenticated).toBe(false);

      const isAdmin = await service.is_admin(newAdmin);
      expect(isAdmin).toBe(false);

      // Verify default admins are restored
      const isDefaultAdmin = await service.is_admin(adminUser);
      expect(isDefaultAdmin).toBe(true);
    });
  });

  describe('getAuthControllerStatus', () => {
    test('should return correct status information', async () => {
      // Reset to clear default test users
      service.reset();

      await service.register_user(adminUser, testUser);
      await service.register_user(adminUser, testUser2);
      await service.remove_user(adminUser, testUser2);

      const status = service.getAuthControllerStatus();
      expect(status.totalUsers).toBe(2);
      expect(status.activeUsers).toBe(1);
      expect(status.totalAdmins).toBe(2); // Default admins
    });
  });

  describe('service configuration', () => {
    test('should initialize with seed data', () => {
      const seedUsers = [testUser, testUser2];
      const serviceWithSeed = new MockAuthControllerService({
        networkDelay: 0,
        errorRate: 0,
        enableLogging: false,
        seedData: { authenticatedUsers: seedUsers },
      });

      // Verify seed users are authenticated
      seedUsers.forEach(async (user) => {
        const isAuthenticated = await serviceWithSeed.is_authenticated_user(user);
        expect(isAuthenticated).toBe(true);
      });
    });

    test('should inherit from BaseMockService', () => {
      expect(service.getStatus).toBeDefined();
      expect(service.getConfig).toBeDefined();
      expect(service.updateConfig).toBeDefined();
      expect(service.on).toBeDefined();
      expect(service.emit).toBeDefined();
    });
  });
});
