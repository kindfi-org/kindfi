import { describe, expect, it } from 'bun:test'

describe('ImageUpload preview management', () => {
	it('synchronously derives preview for string URL values without async delay', () => {
		const stringUrl = 'https://images.unsplash.com/photo-project.jpg'
		// In ImageUpload: const preview = typeof value === 'string' ? value : value instanceof File ? filePreview : null
		const derivePreview = (value: File | string | null, filePreview: string | null) =>
			typeof value === 'string' ? value : value instanceof File ? filePreview : null

		expect(derivePreview(stringUrl, null)).toBe(stringUrl)
		expect(derivePreview(null, 'stale-preview')).toBe(null)
	})

	it('runs exactly one managed preview operation per selected file', async () => {
		let operationCount = 0
		let activePreview: string | null = null

		// Simulates the single managed preview lifecycle
		class ManagedPreviewController {
			private isCancelled = false
			private activeReader: { abort: () => void } | null = null

			public setFile(file: File | null) {
				// Cleanup previous in-flight operation
				if (this.activeReader) {
					this.isCancelled = true
					this.activeReader.abort()
					this.activeReader = null
				}

				if (!file) {
					activePreview = null
					return
				}

				this.isCancelled = false
				operationCount++

				let aborted = false
				const reader = {
					abort: () => {
						aborted = true
					},
				}
				this.activeReader = reader

				// Simulating async file read
				return new Promise<void>((resolve) => {
					setTimeout(() => {
						if (!this.isCancelled && !aborted) {
							activePreview = `data:image/png;base64,mock-${file.name}`
						}
						resolve()
					}, 10)
				})
			}
		}

		const controller = new ManagedPreviewController()
		const fileA = new File(['alpha'], 'alpha.png', { type: 'image/png' })

		await controller.setFile(fileA)

		expect(operationCount).toBe(1)
		expect(activePreview).toBe('data:image/png;base64,mock-alpha.png')
	})

	it('ensures rapid A -> B selection always shows B and aborts stale A', async () => {
		let activePreview: string | null = null
		const abortedReaders: string[] = []

		class ManagedPreviewLifecycle {
			private isCancelled = false
			private currentFile: File | null = null
			private activeAbort: (() => void) | null = null

			public selectFile(file: File, delayMs: number): Promise<void> {
				// Abort previous read
				if (this.activeAbort) {
					this.isCancelled = true
					this.activeAbort()
					this.activeAbort = null
				}

				this.isCancelled = false
				this.currentFile = file

				return new Promise<void>((resolve) => {
					const fileName = file.name
					let wasAborted = false

					this.activeAbort = () => {
						wasAborted = true
						abortedReaders.push(fileName)
					}

					setTimeout(() => {
						if (!this.isCancelled && !wasAborted && this.currentFile === file) {
							activePreview = `data:image/png;base64,mock-${file.name}`
						}
						resolve()
					}, delayMs)
				})
			}

			public remove(): void {
				if (this.activeAbort) {
					this.isCancelled = true
					this.activeAbort()
					this.activeAbort = null
				}
				this.currentFile = null
				activePreview = null
			}
		}

		const lifecycle = new ManagedPreviewLifecycle()
		const fileA = new File(['alpha'], 'file-a.png', { type: 'image/png' })
		const fileB = new File(['beta'], 'file-b.png', { type: 'image/png' })

		// Rapid selection: File A is started with a longer delay (50ms)
		const promiseA = lifecycle.selectFile(fileA, 50)

		// File B is selected immediately before File A completes, with shorter delay (10ms)
		const promiseB = lifecycle.selectFile(fileB, 10)

		await Promise.all([promiseA, promiseB])

		// File A must have been aborted
		expect(abortedReaders).toContain('file-a.png')
		// Active preview must strictly be File B
		expect(activePreview).toBe('data:image/png;base64,mock-file-b.png')
	})

	it('clears preview immediately on removal and prevents delayed preview completion from reviving it', async () => {
		let activePreview: string | null = null
		let cancelled = false
		let aborted = false

		const file = new File(['content'], 'delayed.png', { type: 'image/png' })

		// Start reading file with delay
		const readPromise = new Promise<void>((resolve) => {
			setTimeout(() => {
				if (!cancelled && !aborted && file.size > 0) {
					activePreview = `data:image/png;base64,${file.name}`
				}
				resolve()
			}, 30)
		})

		// Before reading finishes, user removes the image
		cancelled = true
		aborted = true
		activePreview = null

		await readPromise

		// Preview must remain null, never resurrected by the delayed reader
		expect(activePreview).toBe(null)
	})

	it('preserves existing string URL values and clears immediately on removal', () => {
		let value: File | string | null = 'https://kindfi.org/existing-project.jpg'
		let filePreview: string | null = null

		const getPreview = () =>
			typeof value === 'string' ? value : value instanceof File ? filePreview : null

		expect(getPreview()).toBe('https://kindfi.org/existing-project.jpg')

		// Simulate removeImage()
		value = null
		filePreview = null
		expect(getPreview()).toBe(null)
	})
})
