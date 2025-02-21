'use client'

import { TagManager } from '../../../../components/shared/tag-manager'
import { useTags } from '../../../../lib/utils/tag-context'

export default function ProjectTags() {
	useTags()

	return (
		<div className="max-w-2xl mx-auto mt-8">
			<TagManager />
		</div>
	)
}
