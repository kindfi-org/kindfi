/**
 * Server-only Smart Account exports (Node.js / API routes).
 * Pulls in Stellar deployment services and must not be imported from client components.
 */
export {
	createSmartAccountDeployer,
	StellarPasskeyDeployerAdapter,
} from './deployment/deployer.adapter'

export type {
	AddDeviceOperation,
	ContractInvocationOperation,
	PasskeyOperation,
	RemoveDeviceOperation,
} from './deployment/stellar-passkey-deploy.service'

export {
	queryContractDevices,
	StellarPasskeyService,
} from './deployment/stellar-passkey-deploy.service'
