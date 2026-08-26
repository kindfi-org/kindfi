#!/usr/bin/env bun
/**
 * Sync develop with main after a release PR is merged.
 *
 * Fetches latest branches, merges origin/main into develop, and optionally pushes.
 * Run this after merging develop → main so the next release PR stays conflict-free.
 *
 * Usage (from repo root):
 *   bun run sync:develop
 *   bun run sync:develop -- --no-push
 *   bun run sync:develop -- --dry-run
 */

const DEVELOP_BRANCH = 'develop'
const MAIN_BRANCH = 'main'
const MERGE_MESSAGE = 'merge: sync develop with main after release'

type RunResult = {
	stdout: string
	stderr: string
	exitCode: number
}

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const shouldPush = !args.has('--no-push')

const log = (message: string) => {
	console.log(message)
}

const fail = (message: string, code = 1): never => {
	console.error(`\n✗ ${message}`)
	process.exit(code)
}

const run = async (command: string[], options?: { allowFailure?: boolean }): Promise<RunResult> => {
	const proc = Bun.spawn(command, {
		cwd: process.cwd(),
		stdout: 'pipe',
		stderr: 'pipe',
	})

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	])

	const result: RunResult = {
		stdout: stdout.trim(),
		stderr: stderr.trim(),
		exitCode,
	}

	if (exitCode !== 0 && !options?.allowFailure) {
		const details = [result.stderr, result.stdout].filter(Boolean).join('\n')
		fail(`Command failed: ${command.join(' ')}\n${details}`)
	}

	return result
}

const runGit = async (gitArgs: string[], options?: { allowFailure?: boolean }) => {
	return run(['git', ...gitArgs], options)
}

const getCurrentBranch = async (): Promise<string> => {
	const { stdout } = await runGit(['branch', '--show-current'])
	return stdout
}

const hasUncommittedChanges = async (): Promise<boolean> => {
	const { stdout } = await runGit(['status', '--porcelain'])
	return stdout.length > 0
}

const isMergeInProgress = async (): Promise<boolean> => {
	const { exitCode } = await runGit(['rev-parse', '-q', '--verify', 'MERGE_HEAD'], {
		allowFailure: true,
	})
	return exitCode === 0
}

const getConflictedFiles = async (): Promise<string[]> => {
	const { stdout } = await runGit(['diff', '--name-only', '--diff-filter=U'], {
		allowFailure: true,
	})
	if (!stdout) return []
	return stdout.split('\n').filter(Boolean)
}

const isMainAlreadyMerged = async (): Promise<boolean> => {
	const { exitCode } = await runGit(
		['merge-base', '--is-ancestor', `origin/${MAIN_BRANCH}`, 'HEAD'],
		{
			allowFailure: true,
		},
	)
	return exitCode === 0
}

const main = async () => {
	log('Sync develop with main')
	log('======================\n')

	const repoRoot = (await runGit(['rev-parse', '--show-toplevel'])).stdout
	process.chdir(repoRoot)

	const mergeInProgress = await isMergeInProgress()
	if (!mergeInProgress && (await hasUncommittedChanges())) {
		fail('Working tree has uncommitted changes. Commit or stash them before syncing.')
	}

	const currentBranch = await getCurrentBranch()
	if (currentBranch !== DEVELOP_BRANCH) {
		log(`→ Checking out ${DEVELOP_BRANCH} (was on ${currentBranch || 'detached HEAD'})`)
		if (!dryRun) {
			await runGit(['checkout', DEVELOP_BRANCH])
		}
	}

	log('→ Fetching origin/main and origin/develop')
	if (!dryRun) {
		await runGit(['fetch', 'origin', MAIN_BRANCH, DEVELOP_BRANCH])
	}

	if (!dryRun) {
		log(`→ Updating local ${DEVELOP_BRANCH}`)
		await runGit(['pull', '--ff-only', 'origin', DEVELOP_BRANCH])
	}

	if (await isMainAlreadyMerged()) {
		log(`\n✓ ${DEVELOP_BRANCH} already includes origin/${MAIN_BRANCH}. Nothing to merge.`)
		if (shouldPush && !dryRun) {
			log('→ Pushing develop (noop if already up to date)')
			await runGit(['push', 'origin', DEVELOP_BRANCH])
		}
		return
	}

	log(`→ Merging origin/${MAIN_BRANCH} into ${DEVELOP_BRANCH}`)
	if (dryRun) {
		log('\n(dry run) Would merge origin/main into develop')
		if (shouldPush) {
			log('(dry run) Would push origin/develop')
		}
		return
	}

	const mergeResult = await runGit(
		['merge', `origin/${MAIN_BRANCH}`, '--no-edit', '-m', MERGE_MESSAGE],
		{ allowFailure: true },
	)

	if (mergeResult.exitCode !== 0) {
		const conflictedFiles = await getConflictedFiles()
		if (conflictedFiles.length > 0) {
			console.error('\n✗ Merge conflicts detected. Resolve these files, then commit and push:')
			for (const file of conflictedFiles) {
				console.error(`  - ${file}`)
			}
			console.error('\nAfter resolving:')
			console.error('  git add <resolved-files>')
			console.error(`  git commit -m "${MERGE_MESSAGE}"`)
			console.error(`  git push origin ${DEVELOP_BRANCH}`)
			process.exit(1)
		}

		fail(`Merge failed:\n${mergeResult.stderr || mergeResult.stdout}`)
	}

	log('\n✓ Merge completed successfully.')

	if (shouldPush) {
		log('→ Pushing origin/develop')
		await runGit(['push', 'origin', DEVELOP_BRANCH])
		log('\n✓ develop is synced with main and pushed to origin.')
		return
	}

	log('\n✓ develop is synced locally. Push when ready:')
	log(`  git push origin ${DEVELOP_BRANCH}`)
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error)
	fail(message)
})
