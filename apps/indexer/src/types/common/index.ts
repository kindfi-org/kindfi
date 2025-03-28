// this is a dummy module to suppress error from /apps/indexer/src/mapping
export class Account {
	id: string
	lastSeenLedger: number | undefined
	firstSeenLedger: number

	constructor(id: string, ledgerSequence: number) {
		this.id = id
		this.firstSeenLedger = ledgerSequence
		this.lastSeenLedger = ledgerSequence
	}

	static async get(id: string): Promise<Account | null> {
		// Simulate a database call
		return null // or return a valid Account instance
	}

	static create(data: { id: string; firstSeenLedger: number }): Account {
		return new Account(data.id, data.firstSeenLedger)
	}

	async save(): Promise<void> {
		// Simulate saving to DB
	}
}


export class Credit {
	static create(data: any) {
		return new Credit()
	}
	async save() {}
}

export class Debit {
	static create(data: any) {
		return new Debit()
	}
	async save() {}
}

export class Payment {
	static create(data: any) {
		return new Payment()
	}
	async save() {}
}

export class Transfer {
	static create(data: any) {
		return new Transfer()
	}
	async save() {}
}
