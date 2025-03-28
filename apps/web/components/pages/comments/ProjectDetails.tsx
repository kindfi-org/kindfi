import dynamic from 'next/dynamic'

const CommentsTab = dynamic(
	() =>
		import('~/components/sections/comments/ProjectCommentsSection').then(
			(mod) => mod.ProjectCommentsSection,
		),
	{
		ssr: true,
		loading: () => <div className="p-4">Loading comments...</div>,
	},
)
