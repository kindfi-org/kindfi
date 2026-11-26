import { spawnSync } from 'node:child_process'
import path from 'node:path'

const fixtureDirectory = path.resolve('test/fixtures/server-client-boundary')
const result = spawnSync(process.execPath, ['run', 'next', 'build', '.'], {
	cwd: fixtureDirectory,
	encoding: 'utf8',
	timeout: 120_000,
})

if (result.error) {
	throw result.error
}

const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`

if (result.status === null) {
	throw new Error('The invalid server/client boundary fixture did not exit normally.')
}

if (result.status === 0) {
	throw new Error('The invalid server/client boundary fixture unexpectedly built successfully.')
}

if (!output.toLowerCase().includes('server-only')) {
	throw new Error(`The fixture failed for an unexpected reason:\n${output}`)
}

process.stdout.write('Next.js correctly rejected the server-only client import fixture.\n')
