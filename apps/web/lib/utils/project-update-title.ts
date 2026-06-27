const MAX_UPDATE_TITLE_LENGTH = 100

export const deriveProjectUpdateTitle = (content: string, explicitTitle?: string): string => {
	const trimmedTitle = explicitTitle?.trim()
	if (trimmedTitle) {
		return trimmedTitle.length <= MAX_UPDATE_TITLE_LENGTH
			? trimmedTitle
			: `${trimmedTitle.slice(0, MAX_UPDATE_TITLE_LENGTH - 3)}...`
	}

	const trimmedContent = content.trim()
	if (!trimmedContent) return 'Project update'

	const firstLine = trimmedContent.split('\n')[0]?.trim() ?? trimmedContent
	if (firstLine.length <= MAX_UPDATE_TITLE_LENGTH) return firstLine

	return `${firstLine.slice(0, MAX_UPDATE_TITLE_LENGTH - 3)}...`
}
