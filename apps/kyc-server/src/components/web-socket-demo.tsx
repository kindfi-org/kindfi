import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

interface Message {
	id: string
	text: string
	sender: 'user' | 'server'
	timestamp: number
}

export function WebSocketDemo() {
	const [connected, setConnected] = useState(false)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputValue, setInputValue] = useState('')
	const wsRef = useRef<WebSocket | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const lastMessageCountRef = useRef(0)

	// Connect to WebSocket
	useEffect(() => {
		// Get the current host
		const host = window.location.host
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
		const wsUrl = `${protocol}//${host}/live`

		const ws = new WebSocket(wsUrl)

		ws.onopen = () => {
			setConnected(true)
			addMessage('Connected to server', 'server')
		}

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				addMessage(`${data.message || data.text || event.data}`, 'server')
			} catch (e) {
				addMessage(`${event.data}`, 'server')
			}
		}

		ws.onclose = () => {
			setConnected(false)
			addMessage('Disconnected from server', 'server')
		}

		ws.onerror = (error) => {
			console.error('WebSocket error:', error)
			addMessage('Error connecting to server', 'server')
		}

		wsRef.current = ws

		// Cleanup on unmount
		return () => {
			ws.close()
		}
	}, [])

	// Auto-scroll to bottom when messages change
	// Using useLayoutEffect to ensure scrolling happens before browser paint
	useLayoutEffect(() => {
		// Only scroll if messages have been added
		if (messages.length > lastMessageCountRef.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
			lastMessageCountRef.current = messages.length
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messages])

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

	// Send a message
	const sendMessage = () => {
		if (!inputValue.trim() || !connected) return

		// Send message as JSON with proper format
		wsRef.current?.send(JSON.stringify({ text: inputValue }))
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
		<div className="websocket-demo">
			<h2>WebSocket Demo</h2>

			<div className="connection-status">
				Status:{' '}
				<span className={connected ? 'connected' : 'disconnected'}>
					{connected ? 'Connected' : 'Disconnected'}
				</span>
			</div>

			<div className="chat-container">
				<div className="messages">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`message ${message.sender === 'user' ? 'user-message' : 'server-message'}`}
						>
							<div className="message-content">{message.text}</div>
							<div className="message-time">
								{formatTime(message.timestamp)}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				<div className="input-container">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Type a message..."
						disabled={!connected}
					/>
					<button
						type="button"
						onClick={sendMessage}
						disabled={!connected || !inputValue.trim()}
					>
						Send
					</button>
				</div>
			</div>

			<style>
				{`
        .websocket-demo {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .connection-status {
          margin-bottom: 1rem;
          font-weight: 500;
        }
        
        .connected {
          color: #4caf50;
        }
        
        .disconnected {
          color: #f44336;
        }
        
        .chat-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .messages {
          height: 300px;
          overflow-y: auto;
          padding: 1rem;
          background-color: #f9f9f9;
        }
        
        .message {
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          max-width: 80%;
          position: relative;
        }
        
        .user-message {
          background-color: #e3f2fd;
          margin-left: auto;
          border-bottom-right-radius: 0;
        }
        
        .server-message {
          background-color: #f1f1f1;
          margin-right: auto;
          border-bottom-left-radius: 0;
        }
        
        .message-time {
          font-size: 0.7rem;
          color: #666;
          margin-top: 0.25rem;
          text-align: right;
        }
        
        .input-container {
          display: flex;
          padding: 0.75rem;
          background-color: #fff;
          border-top: 1px solid #ddd;
        }
        
        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-right: 0.5rem;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        button:hover {
          background-color: #0055b3;
        }
        
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        `}
			</style>
		</div>
	)
}
