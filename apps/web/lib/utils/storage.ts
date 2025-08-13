import type { TypedSupabaseClient } from '@packages/lib/types'

export interface StorageAdapter {
	list(
		folder: string,
		opts?: { limit?: number },
	): Promise<{ files: { name: string }[] }>
	remove(paths: string[]): Promise<void>
	upload(
		path: string,
		data: Uint8Array,
		opts: { contentType: string; upsert?: boolean; cacheControl?: string },
	): Promise<void>
	getUrl(path: string): Promise<string | null> | string | null
}

/**
 * Generic helper to upload a file into a storage bucket.
 * Supports optional cleanup of existing files and custom filename generation.
 *
 * @param client - Storage adapter implementation (e.g., Supabase)
 * @param folder - Target folder path within the bucket
 * @param file - File to upload
 * @param generateFilename - Optional function to generate the file path; defaults to `${folder}/${file.name}`
 * @param deleteExisting - Whether to delete existing files in the folder before uploading
 * @param cacheControl - Optional cache-control in seconds (e.g., "3600" for 1 hour) for CDN/browser caching
 * @returns The public or signed URL of the uploaded file, or null if URL retrieval fails
 * @throws If listing, deleting, or uploading the file fails
 */
export async function uploadFile({
	client,
	folder,
	file,
	generateFilename = (folder: string, file: File) => `${folder}/${file.name}`,
	deleteExisting = true,
	cacheControl,
}: {
	client: StorageAdapter
	folder: string
	file: File
	generateFilename?: (folder: string, file: File) => string
	deleteExisting?: boolean
	cacheControl?: string
}): Promise<string | null> {
	const { files } = await client.list(folder, { limit: 100 })

	if (deleteExisting && files.length > 0) {
		const toDelete = files.map((f) => `${folder}/${f.name}`)
		await client.remove(toDelete)
	}

	const buffer = new Uint8Array(await file.arrayBuffer())
	const filename = generateFilename(folder, file)

	await client.upload(filename, buffer, {
		contentType: file.type,
		upsert: false,
		...(cacheControl ? { cacheControl } : {}),
	})

	const url = await client.getUrl(filename)
	return url ?? null
}

/**
 * Creates a StorageAdapter implementation for Supabase Storage.
 * Allows injecting a custom getUrl strategy (e.g., signed URLs).
 *
 * @param supabase - Supabase client instance
 * @param bucket - Target bucket name
 * @param opts - Optional configuration, including custom getUrl handler
 * @returns A StorageAdapter compatible with uploadFile
 */
export function makeSupabaseAdapter(
	supabase: TypedSupabaseClient,
	bucket: string,
	opts?: {
		getUrl?: (path: string) => Promise<string | null>
	},
): StorageAdapter {
	const bucketRef = supabase.storage.from(bucket)

	return {
		async list(prefix, options) {
			const { data, error } = await bucketRef.list(prefix, options)
			if (error)
				throw new Error(`Failed to list files in ${bucket}: ${error.message}`)
			return { files: data ?? [] }
		},
		async remove(paths) {
			const { error } = await bucketRef.remove(paths)
			if (error)
				throw new Error(
					`Failed to delete old files in ${bucket}: ${error.message}`,
				)
		},
		async upload(path, data, options) {
			const { error } = await bucketRef.upload(path, data, options)
			if (error) throw new Error(`Upload error in ${bucket}: ${error.message}`)
		},
		async getUrl(path) {
			if (opts?.getUrl) return opts.getUrl(path)
			const { data } = bucketRef.getPublicUrl(path)
			return data?.publicUrl ?? null
		},
	}
}
