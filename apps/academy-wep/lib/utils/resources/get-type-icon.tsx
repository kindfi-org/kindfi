import { BookMarked, Download, FileText, Video } from 'lucide-react'

import type { ResourceType } from '~/lib/types/resources.types'

export const getTypeIcon = (type: ResourceType) => {
	switch (type) {
		case 'article':
			return <FileText className="h-3.5 w-3.5 mr-1" />
		case 'video':
			return <Video className="h-3.5 w-3.5 mr-1" />
		case 'guide':
			return <BookMarked className="h-3.5 w-3.5 mr-1" />
		case 'document':
			return <Download className="h-3.5 w-3.5 mr-1" />
		default:
			return <FileText className="h-3.5 w-3.5 mr-1" />
	}
}
