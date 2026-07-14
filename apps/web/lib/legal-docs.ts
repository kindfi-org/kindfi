import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'

export type LegalDocId = 'terms' | 'privacy' | 'cookies' | 'licenses'

export interface LegalDocConfig {
	id: LegalDocId
	slug: string
	filename: string
	title: string
	description: string
	breadcrumbLabel: string
}

export interface LegalDocContent extends LegalDocConfig {
	lastUpdated?: string
	body: string
}

export const LEGAL_DOCS: Record<LegalDocId, LegalDocConfig> = {
	terms: {
		id: 'terms',
		slug: 'terms',
		filename: 'terms-of-use.md',
		title: 'Terms of Use',
		description:
			'Terms governing your use of KindFi, including accounts, donations, escrow, governance, and platform responsibilities.',
		breadcrumbLabel: 'Terms of Use',
	},
	privacy: {
		id: 'privacy',
		slug: 'privacy',
		filename: 'privacy-policy.md',
		title: 'Privacy Policy',
		description:
			'How KindFi collects, uses, and protects personal information, wallet data, and KYC verification status.',
		breadcrumbLabel: 'Privacy Policy',
	},
	cookies: {
		id: 'cookies',
		slug: 'cookies',
		filename: 'cookie-policy.md',
		title: 'Cookie Policy',
		description:
			'How KindFi uses cookies for authentication, security, language preferences, and analytics.',
		breadcrumbLabel: 'Cookie Policy',
	},
	licenses: {
		id: 'licenses',
		slug: 'licenses',
		filename: 'licenses.md',
		title: 'Licenses',
		description:
			'Open-source licensing for KindFi software, brand asset restrictions, and third-party license notices.',
		breadcrumbLabel: 'Licenses',
	},
}

const getWebAppRoot = (): string => {
	const cwd = process.cwd()
	return cwd.endsWith(`${path.sep}web`) ? cwd : path.join(cwd, 'apps/web')
}

const LEGAL_DOCS_DIR = path.join(getWebAppRoot(), '../../docs/legal')

const parseLegalMarkdown = (raw: string): { title: string; lastUpdated?: string; body: string } => {
	const lines = raw.split('\n')
	let index = 0

	while (index < lines.length && !lines[index]?.trim()) {
		index += 1
	}

	let title = 'Legal'
	if (lines[index]?.startsWith('# ')) {
		title = lines[index].slice(2).trim()
		index += 1
	}

	while (index < lines.length && !lines[index]?.trim()) {
		index += 1
	}

	let lastUpdated: string | undefined
	const lastUpdatedMatch = lines[index]?.match(/^_Last updated:\s*(.+)_$/)
	if (lastUpdatedMatch) {
		lastUpdated = lastUpdatedMatch[1]?.trim()
		index += 1
	}

	const body = lines.slice(index).join('\n').trim()

	return { title, lastUpdated, body }
}

export const readLegalDoc = (id: LegalDocId): LegalDocContent | null => {
	const config = LEGAL_DOCS[id]
	const filePath = path.join(LEGAL_DOCS_DIR, config.filename)

	if (!fs.existsSync(filePath)) {
		return null
	}

	const raw = fs.readFileSync(filePath, 'utf8')
	const parsed = parseLegalMarkdown(raw)

	return {
		...config,
		title: parsed.title || config.title,
		lastUpdated: parsed.lastUpdated,
		body: parsed.body,
	}
}

export const getLegalDocMetadata = (id: LegalDocId): Metadata => {
	const config = LEGAL_DOCS[id]

	return {
		title: config.title,
		description: config.description,
		openGraph: {
			title: `${config.title} | KindFi`,
			description: config.description,
			type: 'website',
			url: `/${config.slug}`,
		},
		twitter: {
			card: 'summary',
			title: `${config.title} | KindFi`,
			description: config.description,
		},
		alternates: {
			canonical: `/${config.slug}`,
		},
	}
}

export const listLegalDocPaths = (): string[] =>
	Object.values(LEGAL_DOCS).map((doc) => `/${doc.slug}`)
