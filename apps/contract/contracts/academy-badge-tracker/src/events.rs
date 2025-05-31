use soroban_sdk::{contracttype, symbol_short, Address, Symbol};
use crate::datatypes::Badge;

pub const BADGE: Symbol = symbol_short!("BADGE");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BadgeMintedEventData {
    pub user: Address,
    pub badge: Badge,
}
