import { Horizon } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'

export const createHorizonServer = (config: WalletTransferConfig): Horizon.Server =>
	new Horizon.Server(config.horizonUrl, { allowHttp: config.horizonUrl.startsWith('http://') })
