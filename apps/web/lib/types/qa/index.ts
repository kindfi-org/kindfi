// This file exports the QA component for easier imports
// Other components can import it as import QA from '~/components/qa';

// Export the server component as the default export
export { default } from '~/components/shared/qa-server'

// Export other types and components that might be needed elsewhere
export type {
	CommentData,
	CommentWithAnswers,
	CommentWithReplies,
	UserData,
} from './types'
