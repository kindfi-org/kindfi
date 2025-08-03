/**
 * Mock implementation of the AuthController contract
 * Simulates user authentication validation and KindFi user verification
 */

import { BaseMockService, MockDataGenerator } from './base-mock-service';
import type {
  IAuthController,
  Address,
  ContractVec,
  MockServiceConfig,
} from '~/lib/types/blockchain/contract-interfaces.types';

interface UserRegistrationData {
  registeredAt: number;
  registeredBy: Address;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export class MockAuthControllerService extends BaseMockService implements IAuthController {
  private authenticatedUsers: Map<Address, UserRegistrationData> = new Map();
  private adminAddresses: Set<Address> = new Set();

  constructor(config: Partial<MockServiceConfig> = {}) {
    super(config);
    this.initializeDefaultData();
  }

  /**
   * Initialize with realistic default data
   */
  private initializeDefaultData(): void {
    // Set up default admin addresses
    const defaultAdmins = [
      'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      'GADMIN2ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
    ];

    defaultAdmins.forEach(admin => {
      this.adminAddresses.add(admin);
    });

    // Initialize with seed data if provided
    if (this.config.seedData?.authenticatedUsers) {
      this.config.seedData.authenticatedUsers.forEach(address => {
        this.authenticatedUsers.set(address, {
          registeredAt: this.generateTimestamp() - Math.floor(Math.random() * 86400 * 30), // Random time in last 30 days
          registeredBy: defaultAdmins[0],
          isActive: true,
          metadata: {
            registrationSource: 'seed_data',
          },
        });
      });
    } else {
      // Create some default test users
      const testUsers = MockDataGenerator.generateTestUsers(5);
      testUsers.forEach(address => {
        this.authenticatedUsers.set(address, {
          registeredAt: this.generateTimestamp() - Math.floor(Math.random() * 86400 * 7), // Random time in last 7 days
          registeredBy: defaultAdmins[0],
          isActive: true,
          metadata: {
            registrationSource: 'default_test_data',
          },
        });
      });
    }

    this.log('Default auth data initialized', {
      admins: Array.from(this.adminAddresses),
      authenticatedUsers: Array.from(this.authenticatedUsers.keys()),
    });
  }

  /**
   * Check if an address belongs to an authenticated KindFi user
   */
  async is_authenticated_user(address: Address): Promise<boolean> {
    return this.executeOperation('is_authenticated_user', async () => {
      if (!this.validateAddress(address)) {
        return false;
      }

      const userData = this.authenticatedUsers.get(address);
      return userData?.isActive === true;
    });
  }

  /**
   * Register a new authenticated user (admin only)
   */
  async register_user(admin: Address, user: Address): Promise<void> {
    return this.executeOperation('register_user', async () => {
      this.requireAuth(admin, 'register_user');

      // Check if caller is admin
      if (!this.adminAddresses.has(admin)) {
        throw new Error('Not authorized: caller is not an admin');
      }

      // Validate user address
      if (!this.validateAddress(user)) {
        throw new Error('Invalid user address format');
      }

      // Check if user is already registered
      if (this.authenticatedUsers.has(user)) {
        throw new Error('User already registered');
      }

      // Register the user
      this.authenticatedUsers.set(user, {
        registeredAt: this.generateTimestamp(),
        registeredBy: admin,
        isActive: true,
        metadata: {
          registrationSource: 'admin_registration',
        },
      });

      this.log('User registered', { admin, user });
    });
  }

  /**
   * Remove an authenticated user (admin only)
   */
  async remove_user(admin: Address, user: Address): Promise<void> {
    return this.executeOperation('remove_user', async () => {
      this.requireAuth(admin, 'remove_user');

      // Check if caller is admin
      if (!this.adminAddresses.has(admin)) {
        throw new Error('Not authorized: caller is not an admin');
      }

      // Check if user exists
      if (!this.authenticatedUsers.has(user)) {
        throw new Error('User not found');
      }

      // Deactivate user instead of deleting (for audit trail)
      const userData = this.authenticatedUsers.get(user)!;
      userData.isActive = false;
      userData.metadata = {
        ...userData.metadata,
        deactivatedAt: this.generateTimestamp(),
        deactivatedBy: admin,
      };

      this.log('User deactivated', { admin, user });
    });
  }

  /**
   * Get all authenticated users
   */
  async get_authenticated_users(): Promise<ContractVec<Address>> {
    return this.executeOperation('get_authenticated_users', async () => {
      return Array.from(this.authenticatedUsers.entries())
        .filter(([_, userData]) => userData.isActive)
        .map(([address, _]) => address);
    });
  }

  /**
   * Add a new admin (existing admin only)
   */
  async add_admin(current_admin: Address, new_admin: Address): Promise<void> {
    return this.executeOperation('add_admin', async () => {
      this.requireAuth(current_admin, 'add_admin');

      // Check if caller is admin
      if (!this.adminAddresses.has(current_admin)) {
        throw new Error('Not authorized: caller is not an admin');
      }

      // Validate new admin address
      if (!this.validateAddress(new_admin)) {
        throw new Error('Invalid admin address format');
      }

      // Check if already admin
      if (this.adminAddresses.has(new_admin)) {
        throw new Error('Address is already an admin');
      }

      this.adminAddresses.add(new_admin);
      this.log('Admin added', { current_admin, new_admin });
    });
  }

  /**
   * Remove an admin (existing admin only)
   */
  async remove_admin(current_admin: Address, admin_to_remove: Address): Promise<void> {
    return this.executeOperation('remove_admin', async () => {
      this.requireAuth(current_admin, 'remove_admin');

      // Check if caller is admin
      if (!this.adminAddresses.has(current_admin)) {
        throw new Error('Not authorized: caller is not an admin');
      }

      // Prevent removing self
      if (current_admin === admin_to_remove) {
        throw new Error('Cannot remove self as admin');
      }

      // Ensure at least one admin remains
      if (this.adminAddresses.size <= 1) {
        throw new Error('Cannot remove last admin');
      }

      // Check if target is actually an admin
      if (!this.adminAddresses.has(admin_to_remove)) {
        throw new Error('Target address is not an admin');
      }

      this.adminAddresses.delete(admin_to_remove);
      this.log('Admin removed', { current_admin, admin_to_remove });
    });
  }

  /**
   * Check if an address is an admin
   */
  async is_admin(address: Address): Promise<boolean> {
    return this.executeOperation('is_admin', async () => {
      return this.adminAddresses.has(address);
    });
  }

  /**
   * Get all admin addresses
   */
  async get_admins(): Promise<ContractVec<Address>> {
    return this.executeOperation('get_admins', async () => {
      return Array.from(this.adminAddresses);
    });
  }

  /**
   * Get user registration details
   */
  async get_user_details(user: Address): Promise<UserRegistrationData | null> {
    return this.executeOperation('get_user_details', async () => {
      return this.authenticatedUsers.get(user) || null;
    });
  }

  /**
   * Get authentication statistics
   */
  async get_auth_stats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalAdmins: number;
    recentRegistrations: number; // Last 7 days
  }> {
    return this.executeOperation('get_auth_stats', async () => {
      const now = this.generateTimestamp();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60);

      let activeUsers = 0;
      let inactiveUsers = 0;
      let recentRegistrations = 0;

      for (const userData of this.authenticatedUsers.values()) {
        if (userData.isActive) {
          activeUsers++;
        } else {
          inactiveUsers++;
        }

        if (userData.registeredAt >= sevenDaysAgo) {
          recentRegistrations++;
        }
      }

      return {
        totalUsers: this.authenticatedUsers.size,
        activeUsers,
        inactiveUsers,
        totalAdmins: this.adminAddresses.size,
        recentRegistrations,
      };
    });
  }

  /**
   * Bulk register users (admin only)
   */
  async bulk_register_users(admin: Address, users: Address[]): Promise<{
    successful: Address[];
    failed: Array<{ address: Address; reason: string }>;
  }> {
    return this.executeOperation('bulk_register_users', async () => {
      this.requireAuth(admin, 'bulk_register_users');

      // Check if caller is admin
      if (!this.adminAddresses.has(admin)) {
        throw new Error('Not authorized: caller is not an admin');
      }

      const successful: Address[] = [];
      const failed: Array<{ address: Address; reason: string }> = [];

      for (const user of users) {
        try {
          await this.register_user(admin, user);
          successful.push(user);
        } catch (error) {
          failed.push({
            address: user,
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      this.log('Bulk user registration completed', {
        admin,
        successful: successful.length,
        failed: failed.length,
      });

      return { successful, failed };
    });
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.authenticatedUsers.clear();
    this.adminAddresses.clear();
    this.initializeDefaultData();
    this.log('Auth controller service state reset');
  }

  /**
   * Get service-specific status
   */
  getAuthControllerStatus(): {
    totalUsers: number;
    activeUsers: number;
    totalAdmins: number;
  } {
    const activeUsers = Array.from(this.authenticatedUsers.values())
      .filter(userData => userData.isActive).length;

    return {
      totalUsers: this.authenticatedUsers.size,
      activeUsers,
      totalAdmins: this.adminAddresses.size,
    };
  }
}
