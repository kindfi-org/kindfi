/// Transfer and payment operations for smart wallet accounts
/// 
/// This module implements token transfers (XLM and Stellar Assets) 
/// for WebAuthn-authenticated smart wallet accounts.
use soroban_sdk::{token, Address, Env, String};

use crate::errors::Error;

/// Transfer XLM (native Stellar lumens) to another address
/// 
/// # Arguments
/// * `env` - The Soroban environment
/// * `to` - Recipient address (can be G-address or C-address)
/// * `amount` - Amount in stroops (1 XLM = 10,000,000 stroops)
/// 
/// # Authorization
/// Requires authentication from the smart wallet (via WebAuthn signature)
pub fn transfer_xlm(env: &Env, to: Address, amount: i128) -> Result<(), Error> {
    // Require authorization from this contract
    env.current_contract_address().require_auth();

    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }

    // Get the native token (XLM) contract address
    let native_token_address = Address::from_string(&String::from_str(
        env,
        "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC", // Native XLM on Stellar in Testnet
    ));

    // Use standard token client for native XLM
    let token_client = token::Client::new(env, &native_token_address);

    // Transfer from this contract to the recipient
    token_client.transfer(
        &env.current_contract_address(),
        &to,
        &amount,
    );

    Ok(())
}

/// Transfer any Stellar Asset (SAC token) to another address
/// 
/// # Arguments
/// * `env` - The Soroban environment
/// * `token` - Token contract address (SAC-wrapped asset or native token)
/// * `to` - Recipient address
/// * `amount` - Amount to transfer (in token's smallest unit)
/// 
/// # Authorization
/// Requires authentication from the smart wallet (via WebAuthn signature)
pub fn transfer_token(
    env: &Env,
    token: Address,
    to: Address,
    amount: i128,
) -> Result<(), Error> {
    // Require authorization from this contract
    env.current_contract_address().require_auth();

    if amount <= 0 {
        return Err(Error::InvalidAmount);
    }

    // Create token client for the specified asset
    let token_client = token::Client::new(env, &token);

    // Transfer from this contract to the recipient
    token_client.transfer(
        &env.current_contract_address(),
        &to,
        &amount,
    );

    Ok(())
}

/// Invoke an arbitrary contract function on behalf of the smart wallet
/// 
/// This allows the smart wallet to interact with any Stellar smart contract
/// while maintaining WebAuthn-based authorization.
/// 
/// # Arguments
/// * `env` - The Soroban environment
/// * `contract` - Target contract address
/// * `function` - Function name to invoke
/// * `args` - Function arguments
/// 
/// # Authorization
/// Requires authentication from the smart wallet (via WebAuthn signature)
/// 
/// # Example Use Cases
/// - Swap tokens on DEX
/// - Stake assets
/// - Vote in governance
/// - Interact with DeFi protocols
pub fn invoke_contract(
    env: &Env,
    contract: Address,
    function: soroban_sdk::Symbol,
    args: soroban_sdk::Vec<soroban_sdk::Val>,
) -> Result<soroban_sdk::Val, Error> {
    // Require authorization from this contract
    env.current_contract_address().require_auth();

    // Invoke the target contract function
    let result = env.invoke_contract::<soroban_sdk::Val>(
        &contract,
        &function,
        args,
    );

    Ok(result)
}

/// Get the balance of XLM (native lumens) for this smart wallet
pub fn get_xlm_balance(env: &Env) -> i128 {
    let native_token_address = Address::from_string(&String::from_str(
        env,
        "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    ));

    let token_client = token::Client::new(env, &native_token_address);
    token_client.balance(&env.current_contract_address())
}

/// Get the balance of any Stellar Asset for this smart wallet
pub fn get_token_balance(env: &Env, token: Address) -> i128 {
    let token_client = token::Client::new(env, &token);
    token_client.balance(&env.current_contract_address())
}
