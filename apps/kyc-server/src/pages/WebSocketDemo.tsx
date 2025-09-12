/** biome-ignore-all lint/correctness/useExhaustiveDependencies: dependency overload [to be worked on later]*/

import { Send, Server, User, Wifi, WifiOff } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback } from '~/components/base/avatar'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Input } from '~/components/base/input'
import { ScrollArea } from '~/components/base/scroll-area'
import { Separator } from '~/components/base/separator'
import { cn } from '~/lib/utils'

interface Message {
	id: string
	text: string
	sender: 'user' | 'server'
	timestamp: number
}

export default function WebSocketDemo() {
	const [connected, setConnected] = useState(false)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputValue, setInputValue] = useState('')
	const windowRef = useRef<Window | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const lastMessageCountRef = useRef(0)
	const { current: userData } = useRef({
		id: `admin_${Math.random().toString(36).substring(2, 9)}`,
		name: 'Admin User',
		email: 'admin@kindfi.com',
		role: 'admin',
	})

	// Add a message to the chat
	const addMessage = (text: string, sender: 'user' | 'server') => {
		const newMessage: Message = {
			id: Date.now().toString(),
			text,
			sender,
			timestamp: Date.now(),
		}

		setMessages((prevMessages) => [...prevMessages, newMessage])
	}

	// Connect to WebSocket
	useEffect(() => {
		windowRef.current = window
		const windowLocation = windowRef.current.location
		// Get the current host
		const host = windowLocation.host
		const protocol = windowLocation.protocol === 'https:' ? 'wss:' : 'ws:'
		const wsUrl = `${protocol}//${host}/live`

		const ws = new WebSocket(wsUrl)

		ws.onopen = () => {
			setConnected(true)
			addMessage('Admin connection established', 'server')
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				addMessage(`${data.message || data.text || event.data}`, 'server')
			} catch (_e) {
				addMessage(`${event.data}`, 'server')
			}
		}

		ws.onclose = () => {
			setConnected(false)
			addMessage('Admin connection terminated', 'server')
		}

		ws.onerror = (error) => {
			console.error('WebSocket error:', error)
			addMessage('Connection error occurred', 'server')
		}

		wsRef.current = ws

		// Cleanup on unmount
		return () => {
			ws.close()
		}
	}, [windowRef.current])

	// Auto-scroll to bottom when messages change
	useLayoutEffect(() => {
		if (messages.length > lastMessageCountRef.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
			lastMessageCountRef.current = messages.length
		}
	}, [messages])

	// Send a message
	const sendMessage = () => {
		if (!inputValue.trim() || !connected) return

		const userMessages = messages.filter((msg) => msg.sender === 'user')
		wsRef.current?.send(
			JSON.stringify({
				type: userMessages.length > 0 ? 'reply' : 'subscribe',
				userId: userData.id,
				text: inputValue,
			}),
		)
		addMessage(inputValue, 'user')
		setInputValue('')
	}

	// Handle Enter key press
	const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			sendMessage()
		}
	}

	// Format timestamp
	const formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
	}

	return (
		<div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl font-semibold">
							Admin WebSocket Console
						</CardTitle>
						<Badge
							variant={connected ? 'default' : 'destructive'}
							className="flex items-center gap-1"
						>
							{connected ? (
								<>
									<Wifi className="w-3 h-3" />
									Connected
								</>
							) : (
								<>
									<WifiOff className="w-3 h-3" />
									Disconnected
								</>
							)}
						</Badge>
					</div>
				</CardHeader>
				<Separator />
				<CardContent className="p-0">
					<ScrollArea className="h-96 p-4">
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={cn(
										'flex gap-1.5',
										message.sender === 'user' ? 'justify-end' : 'justify-start',
									)}
								>
									{message.sender === 'server' && (
										<Avatar className="w-8 h-8">
											<AvatarFallback className="bg-primary text-primary-foreground">
												<Server className="w-4 h-4" />
											</AvatarFallback>
										</Avatar>
									)}
									<div
										className={cn(
											'flex flex-col gap-1 max-w-xs lg:max-w-md',
											message.sender === 'user' ? 'items-end' : 'items-start',
										)}
									>
										<div
											className={cn(
												'rounded-lg px-3 py-2 text-sm',
												message.sender === 'user'
													? 'bg-primary text-primary-foreground'
													: 'bg-muted text-muted-foreground',
											)}
										>
											{message.text}
										</div>
										<span className="text-xs text-muted-foreground">
											{formatTime(message.timestamp)}
										</span>
									</div>
									{message.sender === 'user' && (
										<Avatar className="w-8 h-8">
											<AvatarFallback className="bg-secondary text-secondary-foreground">
												<User className="w-4 h-4" />
											</AvatarFallback>
										</Avatar>
									)}
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>
				</CardContent>
				<Separator />
				<CardContent className="p-4">
					<div className="flex gap-2">
						<Input
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Type an admin message..."
							disabled={!connected}
							className="flex-1"
						/>
						<Button
							onClick={sendMessage}
							disabled={!connected || !inputValue.trim()}
							size="sm"
						>
							<Send className="w-4 h-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
