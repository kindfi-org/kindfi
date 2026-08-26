export const isStaleProviderEvent = (
	incomingIso: string | null,
	lastIso: string | null,
): boolean => {
	if (!incomingIso || !lastIso) return false
	const incoming = Date.parse(incomingIso)
	const last = Date.parse(lastIso)
	if (Number.isNaN(incoming) || Number.isNaN(last)) return false
	return incoming < last
}
