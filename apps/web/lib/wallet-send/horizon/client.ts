// Classic payments and trustlines stay on Horizon; contract calls use RPC.
import { Horizon } from '@stellar/stellar-sdk'
import type { WalletTransferConfig } from '~/lib/config/wallet-transfer.config'

export const createHorizonServer = (config: WalletTransferConfig): Horizon.Server =>
	new Horizon.Server(config.horizonUrl, { allowHttp: config.horizonUrl.startsWith('http://') })
