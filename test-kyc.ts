import { mapDiditStatusToKYC } from './apps/web/lib/services/didit'

const cases = [
	{ input: 'Approved', expected: 'approved' },
	{ input: 'Declined', expected: 'rejected' },
	{ input: 'In Review', expected: 'pending' },
	{ input: 'Abandoned', expected: 'pending' },
	{ input: 'UnknownStatus', expected: 'pending' },
]

console.log(' Iniciando prueba de mapeo KYC...\n')

cases.forEach(({ input, expected }) => {
	const result = mapDiditStatusToKYC(input)
	if (result === expected) {
		console.log(`✅ PASÓ: Input "${input}" -> Result "${result}"`)
	} else {
		console.log(
			`❌ FALLÓ: Input "${input}" -> Se esperaba "${expected}" pero llegó "${result}"`,
		)
	}
})

console.log('\n Prueba terminada.')
