'use client'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '~/components/base/accordion'
import { useI18n } from '~/lib/i18n/context'

type SourcePreviewAccordionProps = {
	title?: string
	description?: string
	story?: string
	highlights?: Array<{ title: string; description: string }>
}

export function SourcePreviewAccordion({
	title,
	description,
	story,
	highlights,
}: SourcePreviewAccordionProps) {
	const { t } = useI18n()

	return (
		<Accordion type="single" collapsible className="rounded-lg border bg-muted/30 px-4">
			<AccordionItem value="source" className="border-none">
				<AccordionTrigger className="text-sm font-medium hover:no-underline">
					{t('projects.manage.contentWizard.sourcePreview')}
				</AccordionTrigger>
				<AccordionContent className="space-y-3 text-sm text-muted-foreground">
					{title ? (
						<div>
							<p className="font-medium text-foreground">{title}</p>
						</div>
					) : null}
					{description ? <p>{description}</p> : null}
					{story ? (
						<div
							className="prose prose-sm max-w-none dark:prose-invert"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: preview of user's own rich text
							dangerouslySetInnerHTML={{ __html: story }}
						/>
					) : null}
					{highlights?.map((highlight) => (
						<div
							key={`${highlight.title}-${highlight.description}`}
							className="rounded-md border bg-background p-3"
						>
							<p className="font-medium text-foreground">{highlight.title}</p>
							<p className="mt-1">{highlight.description}</p>
						</div>
					))}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
