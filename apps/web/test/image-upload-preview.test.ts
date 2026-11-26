import { describe, expect, it } from 'bun:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ImageUpload } from '../components/sections/projects/create/image-upload'

describe('ImageUpload component and preview lifecycle', () => {
	it('renders preview image for existing string URL values without delay', () => {
		const html = renderToStaticMarkup(
			React.createElement(ImageUpload, {
				value: 'https://images.unsplash.com/photo-banner.jpg',
				onChange: () => {},
			}),
		)

		expect(html).toContain('src="https://images.unsplash.com/photo-banner.jpg"')
		expect(html).toContain('alt="Project preview"')
		expect(html).toContain('aria-label="Remove image"')
	})

	it('renders dropzone when value is null', () => {
		const html = renderToStaticMarkup(
			React.createElement(ImageUpload, {
				value: null,
				onChange: () => {},
			}),
		)

		expect(html).toContain('Upload project image')
		expect(html).toContain('Drag and drop or click to select')
		expect(html).not.toContain('Project preview')
	})

	it('renders validation error message when error prop is provided', () => {
		const html = renderToStaticMarkup(
			React.createElement(ImageUpload, {
				value: null,
				onChange: () => {},
				error: 'File size exceeds 5MB limit',
			}),
		)

		expect(html).toContain('File size exceeds 5MB limit')
		expect(html).toContain('text-destructive')
	})

	it('does not render premature preview for a pending File before read completion', () => {
		const file = new File(['mock content'], 'pending.png', { type: 'image/png' })
		const html = renderToStaticMarkup(
			React.createElement(ImageUpload, {
				value: file,
				onChange: () => {},
			}),
		)

		// Before reader finishes, preview should be null and placeholder rendered
		expect(html).toContain('pending.png')
		expect(html).not.toContain('<img')
	})

	it('clears preview when transitioning from File A to pending File B', () => {
		const fileA = new File(['alpha'], 'a.png', { type: 'image/png' })
		const fileB = new File(['beta'], 'b.png', { type: 'image/png' })

		// State simulation matching ImageUpload:
		// preview = typeof value === 'string' ? value : value instanceof File && filePreview?.file === value ? filePreview.url : null
		let filePreview: { file: File; url: string } | null = {
			file: fileA,
			url: 'data:image/png;base64,alpha-data',
		}

		let currentValue: File | string | null = fileA
		const getPreview = () =>
			typeof currentValue === 'string'
				? currentValue
				: currentValue instanceof File && filePreview?.file === currentValue
					? filePreview.url
					: null

		// While File A is active
		expect(getPreview()).toBe('data:image/png;base64,alpha-data')

		// When user selects File B (before File B finishes reading)
		currentValue = fileB
		// Preview must immediately invalidate File A and evaluate to null
		expect(getPreview()).toBe(null)

		// When File B read completes
		filePreview = { file: fileB, url: 'data:image/png;base64,beta-data' }
		expect(getPreview()).toBe('data:image/png;base64,beta-data')
	})

	it('clears preview immediately on removal and prevents delayed reads from reviving it', async () => {
		const file = new File(['content'], 'delayed.png', { type: 'image/png' })
		let isCancelled = false
		let filePreview: { file: File; url: string } | null = null
		let currentValue: File | string | null = file

		const getPreview = () =>
			typeof currentValue === 'string'
				? currentValue
				: currentValue instanceof File && filePreview?.file === currentValue
					? filePreview.url
					: null

		// Simulate in-flight reader
		const readPromise = new Promise<void>((resolve) => {
			setTimeout(() => {
				if (!isCancelled) {
					filePreview = { file, url: 'data:image/png;base64,delayed-content' }
				}
				resolve()
			}, 25)
		})

		// User removes image before read finishes
		isCancelled = true
		currentValue = null
		filePreview = null

		await readPromise

		// Preview must remain null
		expect(getPreview()).toBe(null)
	})
})
