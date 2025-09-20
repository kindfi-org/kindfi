'use server'

import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import {
  Account,
  Keypair,
  Operation,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'
import { Api, assembleTransaction, Server } from '@stellar/stellar-sdk/rpc'
import { logger } from '~/lib'
import { generateStellarAddress } from '~/lib/passkey/deploy'

export async function handleDeploy(serializedData: string): Promise<string> {
  const {
    bundlerKey: bundlerKeyData,
    contractSalt: contractSaltArray,
    publicKey: publicKeyArray,
  }: {
    bundlerKey: { publicKey: string; secretKey: string }
    contractSalt: number[]
    publicKey?: number[]
  } = JSON.parse(serializedData)

  // Reconstruct the bundler keypair from the secret key
  const bundlerKey = Keypair.fromSecret(bundlerKeyData.secretKey)

  // Convert arrays back to Buffers with proper length validation
  const contractSalt = Buffer.from(contractSaltArray)
  const publicKey = publicKeyArray ? Buffer.from(publicKeyArray) : undefined

  // Validate salt length (must be exactly 32 bytes for Stellar)
  if (contractSalt.length !== 32) {
    throw new Error(
      `Invalid contract salt length: expected 32 bytes, got ${contractSalt.length}`,
    )
  }

  // Validate public key length if provided
  if (publicKey && publicKey.length !== 65) {
    throw new Error(
      `Invalid public key length: expected 65 bytes, got ${publicKey.length}`,
    )
  }

  console.log('handleDeploy::', {
    bundlerKeyPublic: bundlerKey.publicKey(),
    contractSaltLength: contractSalt.length,
    publicKeyLength: publicKey?.length,
  })

  const config: AppEnvInterface = appEnvConfig('web')
  const rpc = new Server(config.stellar.rpcUrl)
  const deployee = generateStellarAddress(contractSalt)

  try {
    // Signup deploy vs signin deploy: check if this contract already exists
    if (!publicKey) {
      await rpc.getContractData(
        deployee,
        xdr.ScVal.scvLedgerKeyContractInstance(),
      )
      return deployee
    }

    const bundlerKeyAccount = await rpc
      .getAccount(bundlerKey.publicKey())
      .then(
        (res) => new Account(res.accountId(), res.sequenceNumber()),
      )

    const simTxn = new TransactionBuilder(bundlerKeyAccount, {
      fee: '100',
      networkPassphrase: config.stellar.networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: config.stellar.factoryContractId,
          function: 'deploy',
          args: [
            xdr.ScVal.scvBytes(contractSalt),
            xdr.ScVal.scvBytes(Buffer.from(bundlerKeyAccount.accountId(), 'utf8')),
            xdr.ScVal.scvBytes(publicKey),
          ],
        }),
      )
      .setTimeout(0)
      .build()

    const sim = await rpc.simulateTransaction(simTxn)
    if (Api.isSimulationError(sim) || Api.isSimulationRestore(sim)) throw sim

    const transaction = assembleTransaction(simTxn, sim).setTimeout(0).build()

    console.log('Signing transaction with bundler key...', transaction)
    await transaction.sign(bundlerKey)

    // TODO: failure here results in sp:deployee undefined
    // TODO: handle archived entries
    const txResp = await (
      await fetch(`${config.stellar.horizonUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ tx: transaction.toXDR() }),
      })
    ).json()

    console.log('txResp -->', txResp)

    if (txResp.successful) return deployee

    console.log('txResp [NOT SUCCESSFUL] -->', txResp)
    throw txResp
  } catch (error) {
    logger.error({
      eventType: 'Error during deploy of new address in Stellar',
      details: error,
    })
    console.info(
      'Return unapproved deployee address for future deployment:',
      deployee,
    )
  }

  return deployee
}
