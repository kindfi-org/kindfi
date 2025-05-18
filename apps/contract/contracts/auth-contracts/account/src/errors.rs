use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    ClientDataJsonChallengeIncorrect = 201,
    Secp256r1VerifyFailed = 202,
    JsonParseError = 203,
    DeviceAlreadySet = 204,
    DeviceNotFound = 205,
    NotInitiated = 206,
    RecoveryAddressSet = 207,
    RecoveryAddressNotSet = 208,
    DeviceCannotBeEmpty = 209,
}
