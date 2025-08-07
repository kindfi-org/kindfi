'use client'

import {
	Bold,
	Edit,
	Eye,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link,
	List,
	ListOrdered,
	Redo,
	Undo,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useDebounce } from 'react-use'
import { Button } from '~/components/base/button'
import { Separator } from '~/components/base/separator'
import { Textarea } from '~/components/base/textarea'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { cn } from '~/lib/utils'

interface MarkdownEditorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	error?: string
}

interface HistoryState {
	content: string
	selectionStart: number
	selectionEnd: number
}

interface FormatButton {
	icon: React.ElementType
	label: string
	shortcut: string
	action: () => void
	disabled?: boolean
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder,
	className,
	error,
}: MarkdownEditorProps) {
	const [isPreview, setIsPreview] = useState(false)
	const [history, setHistory] = useState<HistoryState[]>([
		{ content: value, selectionStart: 0, selectionEnd: 0 },
	])
	const [historyIndex, setHistoryIndex] = useState(0)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const selectionRef = useRef<{ start: number; end: number } | null>(null)

	// Add to history when content changes (debounced)
	useDebounce(
		() => {
			if (value !== history[historyIndex]?.content) {
				const textarea = textareaRef.current
				const newState: HistoryState = {
					content: value,
					selectionStart: textarea?.selectionStart || 0,
					selectionEnd: textarea?.selectionEnd || 0,
				}

				const newHistory = history.slice(0, historyIndex + 1)
				newHistory.push(newState)

				if (newHistory.length > 50) {
					newHistory.shift()
				} else {
					setHistoryIndex(historyIndex + 1)
				}

				setHistory(newHistory)
			}
		},
		700, // delay
		[value, history, historyIndex],
	)

	const insertMarkdown = useCallback(
		(before: string, after: string = '', newLine: boolean = false) => {
			const textarea = textareaRef.current
			if (!textarea) return

			const start = textarea.selectionStart
			const end = textarea.selectionEnd
			const selectedText = value.substring(start, end)

			let newText: string
			let newCursorPos: number

			if (selectedText.includes('\n')) {
				const lines = selectedText.split('\n')
				const isOrdered = /^\d+\./.test(before)
				const formattedLines = lines.map((line, index) =>
					isOrdered ? `${index + 1}. ${line}` : `${before}${line}`,
				)
				const block = formattedLines.join('\n')
				newText = value.slice(0, start) + block + value.slice(end)
				newCursorPos = start + block.length
			} else {
				if (newLine && start > 0 && value[start - 1] !== '\n') {
					newText = `${value.substring(0, start)}\n${before}${selectedText}${after}${value.substring(end)}`
					newCursorPos = start + before.length + 1
				} else {
					newText =
						value.substring(0, start) +
						before +
						selectedText +
						after +
						value.substring(end)
					newCursorPos = start + before.length
				}
			}

			selectionRef.current = {
				start: newCursorPos,
				end: selectedText ? newCursorPos + selectedText.length : newCursorPos,
			}
			onChange(newText)

			requestAnimationFrame(() => {
				const textarea = textareaRef.current
				if (textarea && selectionRef.current) {
					textarea.focus()
					textarea.setSelectionRange(
						selectionRef.current.start,
						selectionRef.current.end,
					)
					selectionRef.current = null
				}
			})
		},
		[value, onChange],
	)

	const handleBold = useCallback(
		() => insertMarkdown('**', '**'),
		[insertMarkdown],
	)
	const handleItalic = useCallback(
		() => insertMarkdown('*', '*'),
		[insertMarkdown],
	)
	const handleHeading1 = useCallback(
		() => insertMarkdown('# ', '', true),
		[insertMarkdown],
	)
	const handleHeading2 = useCallback(
		() => insertMarkdown('## ', '', true),
		[insertMarkdown],
	)
	const handleHeading3 = useCallback(
		() => insertMarkdown('### ', '', true),
		[insertMarkdown],
	)
	const handleBulletList = useCallback(
		() => insertMarkdown('- ', '', true),
		[insertMarkdown],
	)
	const handleOrderedList = useCallback(
		() => insertMarkdown('1. ', '', true),
		[insertMarkdown],
	)
	const handleLink = useCallback(
		() => insertMarkdown('[', '](url)'),
		[insertMarkdown],
	)

	const handleUndo = useCallback(() => {
		if (historyIndex > 0) {
			const prevState = history[historyIndex - 1]
			onChange(prevState.content)
			setHistoryIndex(historyIndex - 1)

			requestAnimationFrame(() => {
				const textarea = textareaRef.current
				if (textarea) {
					textarea.focus()
					textarea.setSelectionRange(
						prevState.selectionStart,
						prevState.selectionEnd,
					)
				}
			})
		}
	}, [history, historyIndex, onChange])

	const handleRedo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1]
			onChange(nextState.content)
			setHistoryIndex(historyIndex + 1)

			requestAnimationFrame(() => {
				const textarea = textareaRef.current
				if (textarea) {
					textarea.focus()
					textarea.setSelectionRange(
						nextState.selectionStart,
						nextState.selectionEnd,
					)
				}
			})
		}
	}, [history, historyIndex, onChange])

	// Keyboard shortcuts
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const textarea = textareaRef.current
			if (!textarea) return

			if (e.key === 'Enter') {
				const { selectionStart } = textarea
				const lines = value.slice(0, selectionStart).split('\n')
				const currentLine = lines[lines.length - 1]

				const bulletMatch = /^(\s*[-*+])\s/.exec(currentLine)
				const orderedMatch = /^(\s*\d+)\.\s/.exec(currentLine)

				if (bulletMatch) {
					e.preventDefault()
					const prefix = bulletMatch[1]
					const insertion = `\n${prefix} `
					const newText =
						value.slice(0, selectionStart) +
						insertion +
						value.slice(selectionStart)
					onChange(newText)
					requestAnimationFrame(() => {
						const pos = selectionStart + insertion.length
						textarea.setSelectionRange(pos, pos)
					})
				} else if (orderedMatch) {
					e.preventDefault()
					const num = parseInt(orderedMatch[1]) + 1
					const insertion = `\n${num}. `
					const newText =
						value.slice(0, selectionStart) +
						insertion +
						value.slice(selectionStart)
					onChange(newText)
					requestAnimationFrame(() => {
						const pos = selectionStart + insertion.length
						textarea.setSelectionRange(pos, pos)
					})
				}
			}

			if (e.ctrlKey || e.metaKey) {
				switch (e.key) {
					case 'b':
						e.preventDefault()
						insertMarkdown('**', '**')
						break
					case 'i':
						e.preventDefault()
						insertMarkdown('*', '*')
						break
					case 'k':
						e.preventDefault()
						insertMarkdown('[', '](url)')
						break
					case 'z':
						if (e.shiftKey) {
							e.preventDefault()
							handleRedo()
						} else {
							e.preventDefault()
							handleUndo()
						}
						break
					case 'y':
						e.preventDefault()
						handleRedo()
						break
				}
			}
		},
		[value, onChange, insertMarkdown, handleUndo, handleRedo],
	)

	const formatButtons: { group: string; buttons: FormatButton[] }[] = [
		// Text Formatting Group
		{
			group: 'text',
			buttons: [
				{
					icon: Bold,
					label: 'Bold',
					shortcut: 'Ctrl+B',
					action: handleBold,
				},
				{
					icon: Italic,
					label: 'Italic',
					shortcut: 'Ctrl+I',
					action: handleItalic,
				},
			],
		},
		// Headings Group
		{
			group: 'headings',
			buttons: [
				{
					icon: Heading1,
					label: 'Heading 1',
					shortcut: '',
					action: handleHeading1,
				},
				{
					icon: Heading2,
					label: 'Heading 2',
					shortcut: '',
					action: handleHeading2,
				},
				{
					icon: Heading3,
					label: 'Heading 3',
					shortcut: '',
					action: handleHeading3,
				},
			],
		},
		// Lists Group
		{
			group: 'lists',
			buttons: [
				{
					icon: List,
					label: 'Bullet List',
					shortcut: '',
					action: handleBulletList,
				},
				{
					icon: ListOrdered,
					label: 'Numbered List',
					shortcut: '',
					action: handleOrderedList,
				},
			],
		},
		// Links Group
		{
			group: 'links',
			buttons: [
				{
					icon: Link,
					label: 'Link',
					shortcut: 'Ctrl+K',
					action: handleLink,
				},
			],
		},
		// Actions Group
		{
			group: 'actions',
			buttons: [
				{
					icon: Undo,
					label: 'Undo',
					shortcut: 'Ctrl+Z',
					action: handleUndo,
					disabled: historyIndex <= 0,
				},
				{
					icon: Redo,
					label: 'Redo',
					shortcut: 'Ctrl+Y',
					action: handleRedo,
					disabled: historyIndex >= history.length - 1,
				},
			],
		},
	]

	return (
		<TooltipProvider>
			<div
				className={cn(
					'border rounded-lg overflow-hidden',
					error && 'border-red-500',
					className,
				)}
			>
				{/* Toolbar */}
				<div className="flex items-center justify-between p-2 bg-gray-50 border-b">
					<div className="flex items-center gap-1">
						{formatButtons.map((group, groupIndex) => (
							<div key={group.group} className="flex items-center">
								{group.buttons.map((button) => (
									<Tooltip key={button.label}>
										<TooltipTrigger asChild>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onMouseDown={(e) => {
													const textarea = textareaRef.current
													if (textarea) {
														selectionRef.current = {
															start: textarea.selectionStart,
															end: textarea.selectionEnd,
														}
													}
													e.preventDefault()
												}}
												onClick={button.action}
												disabled={button.disabled}
												aria-label={button.label}
											>
												<button.icon className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												{button.label}{' '}
												{button.shortcut && (
													<span className="text-xs opacity-60">
														({button.shortcut})
													</span>
												)}
											</p>
										</TooltipContent>
									</Tooltip>
								))}
								{groupIndex < formatButtons.length - 1 && (
									<Separator orientation="vertical" className="h-6 mx-1" />
								)}
							</div>
						))}
					</div>

					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant={!isPreview ? 'default' : 'ghost'}
									size="sm"
									className="h-8 px-3"
									onClick={() => setIsPreview(false)}
								>
									<Edit className="h-4 w-4 mr-1" />
									Edit
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Switch to edit mode</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant={isPreview ? 'default' : 'ghost'}
									size="sm"
									className="h-8 px-3"
									onClick={() => setIsPreview(true)}
								>
									<Eye className="h-4 w-4 mr-1" />
									Preview
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Preview your markdown</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				{/* Content Area */}
				<div className="min-h-[200px]">
					{isPreview ? (
						<div className="p-4 prose prose-sm max-w-none">
							{value ? (
								<ReactMarkdown>{value}</ReactMarkdown>
							) : (
								<p className="text-gray-500 italic">
									Nothing to preview yet. Start writing your story!
								</p>
							)}
						</div>
					) : (
						<Textarea
							ref={textareaRef}
							value={value}
							onChange={(e) => onChange(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							className="min-h-[200px] border-0 resize-none focus-visible:ring-0 rounded-none"
						/>
					)}
				</div>

				{/* Footer */}
				<div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<span>Supports Markdown formatting</span>
						<span className="text-blue-600">
							Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links
						</span>
					</div>
					<span>{value.length} characters</span>
				</div>
			</div>
		</TooltipProvider>
	)
}
