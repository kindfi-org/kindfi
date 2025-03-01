import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from 'bun'
import type { Server, ServerWebSocket } from 'bun'
import { routes } from './routes'
import { buildClient } from './utils/buildClient'

interface ClientData {
	clientId: string
	joinedAt: string
}

interface ParsedMessage {
	text?: string
	type?: string
	[key: string]: unknown
}

// Function to get the current client filename from manifest
function getClientFilename(): string {
	try {
		const manifestPath = join(process.cwd(), 'public', 'manifest.json')
		if (existsSync(manifestPath)) {
			const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
			return manifest.clientJs || 'client.js'
		}
	} catch (error) {
		console.error('Error reading manifest:', error)
	}
	return 'client.js'
}

async function startServer() {
	// Build the client-side JavaScript first
	await buildClient()

	// Keep track of connected clients
	// TODO: this is a demonstration of how to use the server, it should be replaced with a real database
	const clients = new Set<ServerWebSocket<ClientData>>()

	// Define server options with type assertion
	const serverOptions = {
		fetch(req: Request, server: Server): Response | Promise<Response> {
			const url = new URL(req.url)

			// Handle WebSocket connections
			if (url.pathname === '/live') {
				const upgraded = server.upgrade<ClientData>(req, {
					// Data passed to the WebSocket object
					data: {
						clientId: crypto.randomUUID(),
						joinedAt: new Date().toISOString(),
					},
				})

				if (!upgraded) {
					return new Response('Upgrade failed', { status: 400 })
				}

				return new Response()
			}

			// Serve static files from the public directory
			if (url.pathname.startsWith('/client') && url.pathname.endsWith('.js')) {
				try {
					// Get the requested filename from the URL
					const requestedFile = url.pathname.substring(1) // Remove leading slash

					// Get the path to the public directory
					const publicDir = join(process.cwd(), 'public')

					// Check if the specific file exists
					const specificFilePath = join(publicDir, requestedFile)
					if (existsSync(specificFilePath)) {
						const file = Bun.file(specificFilePath)
						return new Response(file, {
							headers: {
								'Content-Type': 'application/javascript',
								'Cache-Control': 'max-age=3600',
							},
						})
					}

					// If specific file not found, try to serve the current client file from manifest
					const currentClientJs = getClientFilename()
					const filePath = join(publicDir, currentClientJs)
					if (existsSync(filePath)) {
						const file = Bun.file(filePath)
						return new Response(file, {
							headers: {
								'Content-Type': 'application/javascript',
								'Cache-Control': 'max-age=3600',
							},
						})
					}

					throw new Error('Client JavaScript file not found')
				} catch (error) {
					console.error('Error serving static file:', error)
					return new Response('File not found', { status: 404 })
				}
			}

			// Check if the route exists in our routes object
			const pathname = url.pathname
			const route = routes[pathname as keyof typeof routes]

			if (route) {
				const method = req.method
				if (method in route) {
					// @ts-expect-error method is dynamically accessed
					return route[method](req)
				}

				// Method not allowed
				return new Response('Method not allowed', { status: 405 })
			}

			// Default response for unknown routes
			return new Response('Kindfi KYC Server API', { status: 404 })
		},
		websocket: {
			open(ws: ServerWebSocket<ClientData>) {
				// Add the client to the set of connected clients
				clients.add(ws)

				// Log the connection
				console.log(`Client connected: ${ws.data.clientId}`)

				// Send a welcome message to the client
				ws.send(
					JSON.stringify({
						type: 'welcome',
						message: `Welcome to the Kindfi KYC Server! Your client ID is ${ws.data.clientId}`,
						clientId: ws.data.clientId,
					}),
				)

				// Broadcast to all clients that a new user has joined
				for (const client of clients) {
					if (client !== ws) {
						client.send(
							JSON.stringify({
								type: 'userJoined',
								message: `A new user has joined! Total users: ${clients.size}`,
								totalUsers: clients.size,
							}),
						)
					}
				}
			},
			message(ws: ServerWebSocket<ClientData>, message: string) {
				// Log the message
				console.log(`Message from ${ws.data.clientId}: ${message}`)

				try {
					// Parse the message
					const parsedMessage = JSON.parse(message) as ParsedMessage

					// Prepare response message
					const responseMessage = {
						type: 'message',
						clientId: ws.data.clientId,
						message: parsedMessage.text || message,
						text: parsedMessage.text || message,
						timestamp: new Date().toISOString(),
					}

					// Broadcast the message to all clients
					for (const client of clients) {
						client.send(JSON.stringify(responseMessage))
					}
				} catch (error) {
					// If the message is not valid JSON, just broadcast it as is
					console.error('Error parsing message:', error)

					// Prepare response for plain text message
					const responseMessage = {
						type: 'message',
						clientId: ws.data.clientId,
						message: message,
						text: message,
						timestamp: new Date().toISOString(),
					}

					// Broadcast to all clients
					for (const client of clients) {
						client.send(JSON.stringify(responseMessage))
					}
				}
			},
			close(ws: ServerWebSocket<ClientData>) {
				// Remove the client from the set of connected clients
				clients.delete(ws)

				// Log the disconnection
				console.log(`Client disconnected: ${ws.data.clientId}`)

				// Broadcast to all clients that a user has left
				for (const client of clients) {
					client.send(
						JSON.stringify({
							type: 'userLeft',
							message: `A user has left. Total users: ${clients.size}`,
							totalUsers: clients.size,
						}),
					)
				}
			},
		},
		port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3001,
		routes,
		development: process.env.NODE_ENV !== 'production',
	} as const

	// Start the server
	const server = serve(serverOptions)
	console.log(`🚀 Server running at http://localhost:${server.port}/`)
}

// Start the server
startServer().catch((error) => {
	console.error('Failed to start server:', error)
	process.exit(1)
})
