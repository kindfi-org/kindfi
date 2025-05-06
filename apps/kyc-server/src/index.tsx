import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from 'bun'
import type { Server, ServerWebSocket } from 'bun'
import { kycWebSocketService } from './libs/websocket'
import { routes } from './routes'
import { buildClient } from './utils/buildClient'

interface ClientData {
	clientId: string
	joinedAt: string
	userId?: string
}

interface ParsedMessage {
	type?: string
	userId?: string
	text?: string
	[key: string]: unknown
}

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
	if (process.env.NODE_ENV !== 'test') {
		await buildClient()
	}

	const serverOptions = {
		fetch(req: Request, server: Server): Response | Promise<Response> {
			const url = new URL(req.url)

			if (url.pathname === '/live') {
				const upgraded = server.upgrade<ClientData>(req, {
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

			if (url.pathname.startsWith('/client') && url.pathname.endsWith('.js')) {
				try {
					const requestedFile = url.pathname.substring(1)
					const publicDir = join(process.cwd(), 'public')
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
			const pathname = url.pathname
			const route = routes[pathname as keyof typeof routes]

			if (route) {
				const method = req.method
				if (method in route) {
					// @ts-expect-error method is dynamically accessed
					return route[method](req)
				}
				return new Response('Method not allowed', { status: 405 })
			}

			return new Response('Kindfi KYC Server API', { status: 404 })
		},
		websocket: {
			open(ws: ServerWebSocket<ClientData>) {
				kycWebSocketService.handleConnection(ws)
			},
			message(ws: ServerWebSocket<ClientData>, message: string) {
				try {
					const parsedMessage = JSON.parse(message) as ParsedMessage

					if (parsedMessage.type === 'subscribe' && parsedMessage.userId) {
						ws.data.userId = parsedMessage.userId
						kycWebSocketService.handleConnection(ws)
					} else {
						ws.send(
							JSON.stringify({
								type: 'error',
								message:
									'Invalid message format. Expected { type: "subscribe", userId: string }',
							}),
						)
					}
				} catch (error) {
					console.error('Error parsing message:', error)
					ws.send(
						JSON.stringify({
							type: 'error',
							message: 'Invalid message format',
						}),
					)
				}
			},
			close(ws: ServerWebSocket<ClientData>) {
				kycWebSocketService.handleDisconnection(ws)
			},
		},
		port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3001,
		routes,
		development: process.env.NODE_ENV !== 'production',
	} as const

	const server = serve(serverOptions)
	console.log(`🚀 Server running at http://localhost:${server.port}/`)
	return server
}

if (process.env.NODE_ENV !== 'test') {
	startServer().catch((error) => {
		console.error('Failed to start server:', error)
		process.exit(1)
	})
}

export { startServer }
