export const parseApiError = async (
	res: Response,
	defaultMessage: string,
): Promise<string> => {
	const clonedRes = res.clone()
	let errorMessage = defaultMessage

	try {
		const contentType = clonedRes.headers.get('content-type')
		if (contentType?.includes('application/json')) {
			const error = await clonedRes.json()
			errorMessage = error?.error || errorMessage
		} else {
			const text = await clonedRes.text()
			errorMessage = text || errorMessage
		}
	} catch {
		// If reading fails, use default message
	}

	return errorMessage
}

export const teamQueryKey = (projectSlug: string) =>
	['supabase', 'project-team', projectSlug] as const
