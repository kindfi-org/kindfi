import { createClient } from '~/lib/supabase/client'

const supabase = createClient()

export async function uploadToBucket(file: File, bucket: string) {
	if (!bucket) {
		return { error: 'No storage bucket specified' }
	}

	const filePath = `${Date.now()}-${file.name}`
	const { error } = await supabase.storage
		.from(bucket)
		.upload(filePath, file, { cacheControl: '3600', upsert: false })

	if (error) {
		return { error: `Upload failed: ${error.message}` }
	}

	const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
	return { url: publicUrl }
}
