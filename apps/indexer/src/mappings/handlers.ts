import type {
	SorobanEvent,
	StellarEffect,
	StellarOperation,
	StellarBlock,
} from '@subql/types-stellar'
import { Address, type xdr } from 'soroban-client'
import type { Horizon } from 'stellar-sdk'
import type {
	AccountCredited,
	AccountDebited,
} from 'stellar-sdk/lib/horizon/types/effects'
import { Account, Credit, Debit, Payment, Transfer } from '../types'

export async function handleOperation(
	op: StellarOperation<Horizon.HorizonApi.PaymentOperationResponse>,
): Promise<void> {
	if (!op.ledger?.sequence) {
		throw new Error('Missing ledger sequence')
	}
	
	const ledgerSequence = op.ledger.sequence
	console.info(`Indexing operation ${op.id}, type: ${op.type}`)

	if (!op.from || !op.to) {
		throw new Error('Missing from or to address')
	}

	const fromAccount = await checkAndGetAccount(op.from, ledgerSequence)
	const toAccount = await checkAndGetAccount(op.to, ledgerSequence)

	const payment = Payment.create({
		id: op.id,
		fromId: fromAccount.id,
		toId: toAccount.id,
		txHash: op.transaction_hash,
		amount: op.amount,
	})

	fromAccount.lastSeenLedger = ledgerSequence
	toAccount.lastSeenLedger = ledgerSequence
	await Promise.all([fromAccount.save(), toAccount.save(), payment.save()])
}

export async function handleCredit(
	effect: StellarEffect<AccountCredited>,
): Promise<void> {
	if (!effect.ledger?.sequence) {
		throw new Error('Missing ledger sequence')
	}

	console.info(`Indexing effect ${effect.id}, type: ${effect.type}`)

	const account = await checkAndGetAccount(
		effect.account,
		effect.ledger.sequence,
	)

	const credit = Credit.create({
		id: effect.id,
		accountId: account.id,
		amount: effect.amount,
	})

	account.lastSeenLedger = effect.ledger.sequence
	await Promise.all([account.save(), credit.save()])
}

export async function handleDebit(
	effect: StellarEffect<AccountDebited>,
): Promise<void> {
	if (!effect.ledger?.sequence) {
		throw new Error('Missing ledger sequence')
	}

	console.info(`Indexing effect ${effect.id}, type: ${effect.type}`)

	const account = await checkAndGetAccount(
		effect.account,
		effect.ledger.sequence,
	)

	const debit = Debit.create({
		id: effect.id,
		accountId: account.id,
		amount: effect.amount,
	})

	account.lastSeenLedger = effect.ledger.sequence
	await Promise.all([account.save(), debit.save()])
}

export async function handleEvent(event: SorobanEvent): Promise<void> {
	if (!event.ledger?.sequence) {
		throw new Error('Missing ledger sequence')
	}

	console.info(
		`New transfer event found at block ${event.ledger.sequence.toString()}`,
	)

	if (!event.topic || event.topic.length < 3) {
		throw new Error('Invalid event topic structure')
	}

	const [env, from, to] = event.topic

	if (!from || !to) {
		throw new Error('Missing from or to address in event topic')
	}

	let fromAddress: string
	let toAddress: string
	try {
		fromAddress = decodeAddress(from)
		toAddress = decodeAddress(to)
	} catch (e) {
		console.error('Failed to decode addresses:', e)
		throw new Error('Failed to decode addresses')
	}

	const fromAccount = await checkAndGetAccount(
		fromAddress,
		event.ledger.sequence,
	)
	const toAccount = await checkAndGetAccount(
		toAddress,
		event.ledger.sequence,
	)

	if (!event.contractId) {
		throw new Error('Missing contract ID')
	}

	const transfer = Transfer.create({
		id: event.id,
		ledger: event.ledger.sequence,
		date: new Date(event.ledgerClosedAt),
		contract: event.contractId.contractId().toString(),
		fromId: fromAccount.id,
		toId: toAccount.id,
		value: BigInt(event.value.u64()?.toBigInt() ?? 0),
	})

	fromAccount.lastSeenLedger = event.ledger.sequence
	toAccount.lastSeenLedger = event.ledger.sequence

	await Promise.all([fromAccount.save(), toAccount.save(), transfer.save()])
}

async function checkAndGetAccount(
	id: string,
	ledgerSequence: number,
): Promise<Account> {
	if (!id) {
		throw new Error('Invalid account ID')
	}

	const normalizedId = id.toLowerCase()
	let account = await Account.get(normalizedId)
	
	if (!account) {
		account = Account.create({
			id: normalizedId,
			firstSeenLedger: ledgerSequence,
			lastSeenLedger: ledgerSequence,
		})
	}
	return account
}

function decodeAddress(scVal: xdr.ScVal): string {
	try {
		return Address.account(scVal.address().accountId().ed25519()).toString()
	} catch (e) {
		try {
			return Address.contract(scVal.address().contractId()).toString()
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to decode address: ${error.message}`)
			}
			throw new Error('Failed to decode address: Unknown error')
		}
	}
}
