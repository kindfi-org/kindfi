import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '~/components/mdx-components'
import { JsonLd } from '~/components/shared/json-ld'
import { SectionContainer } from '~/components/shared/section-container'
import { type LegalDocId, readLegalDoc } from '~/lib/legal-docs'
import { getBreadcrumbSchema } from '~/lib/seo/structured-data'

interface LegalDocumentPageProps {
	docId: LegalDocId
}

export const LegalDocumentPage = ({ docId }: LegalDocumentPageProps) => {
	const doc = readLegalDoc(docId)

	if (!doc) {
		return null
	}

	return (
		<>
			<JsonLd
				data={getBreadcrumbSchema([
					{ name: 'Home', url: '/' },
					{ name: doc.breadcrumbLabel, url: `/${doc.slug}` },
				])}
			/>
			<main className="min-h-screen bg-white" aria-label={doc.title}>
				<section className="relative isolate overflow-hidden border-b border-slate-200/60 bg-[#fafbfc] py-10 sm:py-14 lg:py-16">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)]" />
						<div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
					</div>
					<SectionContainer maxWidth="4xl" className="relative">
						<div className="mx-auto max-w-3xl text-center">
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
								Legal
							</p>
							<h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
								{doc.title}
							</h1>
							{doc.lastUpdated ? (
								<p className="mt-4 text-sm text-slate-600">Last updated: {doc.lastUpdated}</p>
							) : null}
							<p className="mt-4 text-base leading-relaxed text-slate-600">{doc.description}</p>
						</div>
					</SectionContainer>
				</section>

				<SectionContainer maxWidth="4xl" className="py-10 sm:py-14 lg:py-16">
					<article className="mx-auto max-w-3xl">
						<div className="prose prose-neutral max-w-none prose-headings:text-slate-900 prose-a:text-emerald-800">
							<MDXRemote
								source={doc.body}
								components={mdxComponents as never}
								options={{
									mdxOptions: {
										remarkPlugins: [remarkGfm],
										rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }]],
									},
								}}
							/>
						</div>
					</article>
				</SectionContainer>
			</main>
		</>
	)
}
