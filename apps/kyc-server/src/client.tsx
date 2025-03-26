/** @jsxImportSource react */
import { hydrateRoot } from 'react-dom/client'
import { Navigation, routes } from './components/navigation'
import { getContent } from './utils/content-map'

// Get the current path from the window location
const currentPath = window.location.pathname

// Debug log to check if client-side JavaScript is being updated
console.log(
	'Client-side JavaScript loaded. Available routes:',
	routes.map((r) => r.path).join(', '),
)
console.log('Current path:', currentPath)

// Get content for the current path
const content = getContent(currentPath)

// Hydrate the application
document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('root')
	if (root) {
		// Create the navigation element with the same routes as the server
		const navigationElement = <Navigation currentPath={currentPath} />

		// Log the navigation element for debugging
		console.log('Navigation element:', navigationElement)

		hydrateRoot(
			root,
			<>
				{navigationElement}
				<div className="card">
					{typeof content === 'string' ? <p>{content}</p> : content}
				</div>
				<p>Server-side rendered with React and Bun</p>
			</>,
		)
	}
})
