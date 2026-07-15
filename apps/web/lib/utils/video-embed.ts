/**
 * Video embed helpers for project pitch videos.
 * Supports YouTube, Vimeo, and Loom share/watch/embed URL formats.
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'loom'

export const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
	youtube: 'YouTube',
	vimeo: 'Vimeo',
	loom: 'Loom',
}

export const SUPPORTED_VIDEO_PROVIDERS_LABEL = 'YouTube, Vimeo, or Loom'

const YOUTUBE_ID_RE = /^[\w-]{11}$/
const VIMEO_ID_RE = /^\d+$/
const LOOM_ID_RE = /^[a-zA-Z0-9_-]{16,64}$/

const stripWww = (hostname: string): string => hostname.replace(/^www\./, '')

/**
 * Returns the video provider for a URL, or null if unsupported.
 */
export const getVideoProvider = (url: string): VideoProvider | null => {
	try {
		const host = stripWww(new URL(url).hostname.toLowerCase())

		if (
			host === 'youtu.be' ||
			host === 'youtube.com' ||
			host === 'youtube-nocookie.com' ||
			host === 'm.youtube.com' ||
			host === 'music.youtube.com'
		) {
			return 'youtube'
		}
		if (host === 'vimeo.com' || host === 'player.vimeo.com') {
			return 'vimeo'
		}
		if (host === 'loom.com') {
			return 'loom'
		}
		return null
	} catch {
		return null
	}
}

const extractYouTubeId = (parsedUrl: URL): string | null => {
	const hostname = stripWww(parsedUrl.hostname.toLowerCase())
	const pathname = parsedUrl.pathname

	if (hostname === 'youtu.be') {
		const id = pathname.split('/').filter(Boolean)[0]?.split('?')[0]
		return id && YOUTUBE_ID_RE.test(id) ? id : null
	}

	const watchId = parsedUrl.searchParams.get('v')
	if (watchId && YOUTUBE_ID_RE.test(watchId)) {
		return watchId
	}

	const pathMatch = pathname.match(/^\/(?:embed|shorts|live|v|e)\/([\w-]{11})(?:\/|$)/i)
	if (pathMatch?.[1]) {
		return pathMatch[1]
	}

	return null
}

const extractVimeoId = (parsedUrl: URL): string | null => {
	const hostname = stripWww(parsedUrl.hostname.toLowerCase())
	const segments = parsedUrl.pathname.split('/').filter(Boolean)

	if (hostname === 'player.vimeo.com') {
		const id = segments[0] === 'video' ? segments[1] : segments[0]
		return id && VIMEO_ID_RE.test(id) ? id : null
	}

	// /123456789
	if (segments.length === 1 && VIMEO_ID_RE.test(segments[0])) {
		return segments[0]
	}

	// /channels/.../123456789, /groups/.../videos/123456789,
	// /album/.../video/123456789, /manage/videos/123456789, /video/123456789
	for (let i = segments.length - 1; i >= 0; i--) {
		const segment = segments[i]
		if (VIMEO_ID_RE.test(segment)) {
			return segment
		}
	}

	return null
}

const extractLoomId = (parsedUrl: URL): string | null => {
	const segments = parsedUrl.pathname.split('/').filter(Boolean)
	// /share/ID, /embed/ID, /looms/ID
	const typeIndex = segments.findIndex((s) => ['share', 'embed', 'looms'].includes(s.toLowerCase()))
	if (typeIndex >= 0) {
		const id = segments[typeIndex + 1]
		return id && LOOM_ID_RE.test(id) ? id : null
	}

	// Fallback: last path segment if it looks like a Loom id
	const last = segments[segments.length - 1]
	return last && LOOM_ID_RE.test(last) ? last : null
}

/**
 * Extracts a provider-specific video id from a share/watch/embed URL.
 */
export const extractVideoId = (url: string): string | null => {
	try {
		const parsedUrl = new URL(url)
		const provider = getVideoProvider(url)
		if (!provider) return null

		switch (provider) {
			case 'youtube':
				return extractYouTubeId(parsedUrl)
			case 'vimeo':
				return extractVimeoId(parsedUrl)
			case 'loom':
				return extractLoomId(parsedUrl)
			default:
				return null
		}
	} catch {
		return null
	}
}

/**
 * Returns true when the URL is a supported HTTPS video link (YouTube, Vimeo, or Loom).
 */
export const isSupportedVideoUrl = (url: string): boolean => {
	if (!url.startsWith('https://')) return false
	return extractVideoId(url) !== null
}

/**
 * Converts a YouTube, Vimeo, or Loom URL into an iframe-compatible embed URL.
 * Returns the original string when the URL is not recognized.
 */
export const transformToEmbedUrl = (url: string): string => {
	try {
		const parsedUrl = new URL(url)
		if (parsedUrl.protocol !== 'https:') return url

		const provider = getVideoProvider(url)
		const videoId = extractVideoId(url)
		if (!provider || !videoId) return url

		switch (provider) {
			case 'youtube':
				return `https://www.youtube.com/embed/${videoId}`
			case 'vimeo':
				return `https://player.vimeo.com/video/${videoId}`
			case 'loom':
				return `https://www.loom.com/embed/${videoId}`
			default:
				return url
		}
	} catch {
		return url
	}
}

/**
 * Hosts allowed in CSP `frame-src` for project video embeds.
 */
export const VIDEO_EMBED_FRAME_SRC = [
	'https://www.youtube.com',
	'https://youtube.com',
	'https://www.youtube-nocookie.com',
	'https://player.vimeo.com',
	'https://www.loom.com',
	'https://loom.com',
] as const
