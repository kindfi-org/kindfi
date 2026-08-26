interface JsonLdProps {
	data: object | object[]
}

export function JsonLd({ data }: JsonLdProps) {
	const safeJson = JSON.stringify(data)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')

	return (
		<script
			// React 19 SSR can emit type={null} on <script>; suppress avoids hydration noise.
			suppressHydrationWarning
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe and required for SEO
			dangerouslySetInnerHTML={{ __html: safeJson }}
		/>
	)
}
