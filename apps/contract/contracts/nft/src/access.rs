use crate::errors::NFTError;
use soroban_sdk::{
    contracttype, vec, Address, Bytes, BytesN, Env, Symbol, Vec,
};

// Define role constants
pub const DEFAULT_ADMIN_ROLE: u32 = 0;
pub const MINTER_ROLE: u32 = 1;
pub const METADATA_MANAGER_ROLE: u32 = 2;

#[contracttype]
#[derive(Clone)]
pub enum AccessDataKey {
    RoleMembers(u32),       // Maps role -> Vec<Address>
    MemberRoles(Address),   // Maps address -> Vec<u32>
    RoleAdminConfig(u32),   // Maps role -> admin role
    MultiSigThreshold(u32), // Maps role -> threshold
}

pub struct AccessControl;

impl AccessControl {
    // Initialize access control
    pub fn initialize(env: &Env, admin: &Address) {
        // Store initial admin
        let role_members: Vec<Address> = vec![env, admin.clone()];
        env.storage().instance().set(
            &AccessDataKey::RoleMembers(DEFAULT_ADMIN_ROLE),
            &role_members,
        );

        // Set admin roles (default_admin has all roles)
        let admin_roles: Vec<u32> = vec![env, DEFAULT_ADMIN_ROLE];
        env.storage()
            .instance()
            .set(&AccessDataKey::MemberRoles(admin.clone()), &admin_roles);

        // Set initial thresholds
        env.storage()
            .instance()
            .set(&AccessDataKey::MultiSigThreshold(DEFAULT_ADMIN_ROLE), &2u32); // Default: require 2 admins

        // Set admin role as admin for all roles
        env.storage().instance().set(
            &AccessDataKey::RoleAdminConfig(DEFAULT_ADMIN_ROLE),
            &DEFAULT_ADMIN_ROLE,
        );
        env.storage().instance().set(
            &AccessDataKey::RoleAdminConfig(MINTER_ROLE),
            &DEFAULT_ADMIN_ROLE,
        );
        env.storage().instance().set(
            &AccessDataKey::RoleAdminConfig(METADATA_MANAGER_ROLE),
            &DEFAULT_ADMIN_ROLE,
        );
    }

    // Check if an address has a role
    pub fn has_role(env: &Env, role: u32, account: &Address) -> bool {
        let role_members: Vec<Address> = env
            .storage()
            .instance()
            .get(&AccessDataKey::RoleMembers(role))
            .unwrap_or_else(|| Vec::new(env));

        role_members.contains(account)
    }

    // Require that the invoker has the specified role
    pub fn require_role(env: &Env, role: u32, invoker: &Address) -> Result<(), NFTError> {
        if !Self::has_role(env, role, invoker) {
            return Err(NFTError::NotAuthorized);
        }

        // Require authorization from the invoker
        invoker.require_auth();

        Ok(())
    }

    // Grant a role to an address
    pub fn grant_role(env: &Env, role: u32, account: &Address) -> Result<(), NFTError> {
        // Update role members
        let mut role_members: Vec<Address> = env
            .storage()
            .instance()
            .get(&AccessDataKey::RoleMembers(role))
            .unwrap_or_else(|| Vec::new(env));

        if !role_members.contains(account) {
            role_members.push_back(account.clone());
            env.storage()
                .instance()
                .set(&AccessDataKey::RoleMembers(role), &role_members);
        }

        // Update member roles
        let mut member_roles: Vec<u32> = env
            .storage()
            .instance()
            .get(&AccessDataKey::MemberRoles(account.clone()))
            .unwrap_or_else(|| Vec::new(env));

        if !member_roles.contains(&role) {
            member_roles.push_back(role);
            env.storage()
                .instance()
                .set(&AccessDataKey::MemberRoles(account.clone()), &member_roles);
        }

        Ok(())
    }

    // Revoke a role from an address
    pub fn revoke_role(env: &Env, role: u32, account: &Address) -> Result<(), NFTError> {
        // Update role members
        let mut role_members: Vec<Address> = env
            .storage()
            .instance()
            .get(&AccessDataKey::RoleMembers(role))
            .unwrap_or_else(|| Vec::new(env));

        if let Ok(index) = role_members.binary_search(account) {
            role_members.remove(index);
            env.storage()
                .instance()
                .set(&AccessDataKey::RoleMembers(role), &role_members);
        }

        // Update member roles
        let mut member_roles: Vec<u32> = env
            .storage()
            .instance()
            .get(&AccessDataKey::MemberRoles(account.clone()))
            .unwrap_or_else(|| Vec::new(env));

        if let Ok(index) = member_roles.binary_search(&role) {
            member_roles.remove(index);
            env.storage()
                .instance()
                .set(&AccessDataKey::MemberRoles(account.clone()), &member_roles);
        }

        Ok(())
    }

    // Set the multi-signature threshold for a role
    pub fn set_multisig_threshold(env: &Env, role: u32, threshold: u32) -> Result<(), NFTError> {
        env.storage()
            .instance()
            .set(&AccessDataKey::MultiSigThreshold(role), &threshold);
        Ok(())
    }

    // Verify multiple signatures for a role operation
    pub fn require_role_with_multiple_signatures(
        env: &Env,
        role: u32,
        operation: Symbol,
        signatures: &Vec<(Address, BytesN<64>)>,
        payload: &Bytes,
    ) -> Result<(), NFTError> {
        // Get the threshold for this role
        let threshold: u32 = env
            .storage()
            .instance()
            .get(&AccessDataKey::MultiSigThreshold(role))
            .unwrap_or(1);

        // Get all members with this role
        let role_members: Vec<Address> = env
            .storage()
            .instance()
            .get(&AccessDataKey::RoleMembers(role))
            .unwrap_or_else(|| Vec::new(env));

        // Count valid signatures from role members
        let mut valid_sigs = 0;

        for (signer, _signature) in signatures.iter() {
            // Check if the signer has the role
            if role_members.contains(signer) {
                valid_sigs += 1;
            }
        }

        // Check if we have enough valid signatures
        if valid_sigs < threshold {
            return Err(NFTError::InsufficientSignatures);
        }

        Ok(())
    }

    fn specific_remove_role_member(
        env: &Env,
        role: u32,
        account: &Address,
    ) -> Result<(), NFTError> {
        let mut role_members: Vec<Address> = env
            .storage()
            .instance()
            .get(&AccessDataKey::RoleMembers(role))
            .unwrap_or_else(|| Vec::new(env));

        if role_members.contains(account) {
            let mut new_members = Vec::new(env);
            for member in role_members.iter() {
                if &member != account {
                    new_members.push_back(member.clone());
                }
            }
            env.storage()
                .instance()
                .set(&AccessDataKey::RoleMembers(role), &new_members);
        }

        Ok(())
    }

    fn specific_remove_member_role(
        env: &Env,
        account: &Address,
        role: &u32,
    ) -> Result<(), NFTError> {
        let mut member_roles: Vec<u32> = env
            .storage()
            .instance()
            .get(&AccessDataKey::MemberRoles(account.clone()))
            .unwrap_or_else(|| Vec::new(env));

        if member_roles.contains(role) {
            let mut new_roles = Vec::new(env);
            for r in member_roles.iter() {
                if r != *role {
                    new_roles.push_back(r);
                }
            }
            env.storage()
                .instance()
                .set(&AccessDataKey::MemberRoles(account.clone()), &new_roles);
        }

        Ok(())
    }
}
