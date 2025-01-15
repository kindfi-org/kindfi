import type {
	SorobanEvent,
	StellarEffect,
	StellarOperation,
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
	const ledgerSequence = op.ledger?.sequence ?? 0
	console.info(`Indexing operation ${op.id}, type: ${op.type}`)

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
	console.info(`Indexing effect ${effect.id}, type: ${effect.type}`)

	const account = await checkAndGetAccount(
		effect.account,
		effect.ledger?.sequence ?? 0,
	)

	const credit = Credit.create({
		id: effect.id,
		accountId: account.id,
		amount: effect.amount,
	})

	account.lastSeenLedger = effect.ledger?.sequence ?? 0
	await Promise.all([account.save(), credit.save()])
}

export async function handleDebit(
	effect: StellarEffect<AccountDebited>,
): Promise<void> {
	console.info(`Indexing effect ${effect.id}, type: ${effect.type}`)

	const account = await checkAndGetAccount(
		effect.account,
		effect.ledger?.sequence ?? 0,
	)

	const debit = Debit.create({
		id: effect.id,
		accountId: account.id,
		amount: effect.amount,
	})

	account.lastSeenLedger = effect.ledger?.sequence
	await Promise.all([account.save(), debit.save()])
}

export async function handleEvent(event: SorobanEvent): Promise<void> {
	console.info(
		`New transfer event found at block ${event.ledger?.sequence.toString() ?? ''}`,
	)

	// Get data from the event
	// The transfer event has the following payload \[env, from, to\]
	// console.info(JSON.stringify(event));
	const {
		topic: [env, from, to],
	} = event

	try {
		decodeAddress(from)
		decodeAddress(to)
	} catch (e) {
		console.info('decode address failed')
	}

	const fromAccount = await checkAndGetAccount(
		decodeAddress(from),
		event.ledger?.sequence ?? 0,
	)
	const toAccount = await checkAndGetAccount(
		decodeAddress(to),
		event.ledger?.sequence ?? 0,
	)

	// Create the new transfer entity
	const transfer = Transfer.create({
		id: event.id,
		ledger: event.ledger?.sequence ?? 0,
		date: new Date(event.ledgerClosedAt),
		contract: event.contractId?.contractId().toString() ?? '',
		fromId: fromAccount.id,
		toId: toAccount.id,
		value: BigInt(event.value.u64()?.toBigInt() ?? 0),
	})

	if (event.ledger) {
		fromAccount.lastSeenLedger = event.ledger.sequence
		toAccount.lastSeenLedger = event.ledger.sequence
	}

	await Promise.all([fromAccount.save(), toAccount.save(), transfer.save()])
}

async function checkAndGetAccount(
	id: string,
	ledgerSequence: number,
): Promise<Account> {
	let account = await Account.get(id.toLowerCase())
	if (!account) {
		// We couldn't find the account
		account = Account.create({
			id: id.toLowerCase(),
			firstSeenLedger: ledgerSequence,
		})
	}
	return account
}

// scValToNative not works, temp solution
function decodeAddress(scVal: xdr.ScVal): string {
	try {
		return Address.account(scVal.address().accountId().ed25519()).toString()
	} catch (e) {
		return Address.contract(scVal.address().contractId()).toString()
	}
}
