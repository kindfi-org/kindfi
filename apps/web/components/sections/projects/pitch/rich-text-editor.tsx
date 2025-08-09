'use client'

import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
	Bold,
	Heading1,
	Heading2,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Redo,
	Undo,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'
import { cn } from '~/lib/utils'
import { LinkDialog } from './link-dialog'

// Returns the count of visible characters by collapsing whitespace and trimming the text
const visibleCharCount = (text: string) =>
	Array.from(text.replace(/\s+/g, ' ').trim()).length

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	error?: string
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = 'Start writing your story...',
	className,
	error,
}: RichTextEditorProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false)
	const [linkDialogData, setLinkDialogData] = useState({
		initialUrl: '',
		selectedText: '',
	})

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2],
				},
				bulletList: {
					keepMarks: true,
					HTMLAttributes: {
						class: 'list-disc list-outside ml-4',
					},
				},
				orderedList: {
					keepMarks: true,
					HTMLAttributes: {
						class: 'list-decimal list-outside ml-4',
					},
				},
				paragraph: {
					HTMLAttributes: {
						class: 'mb-2',
					},
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-blue-500 hover:text-blue-700 underline',
				},
			}),
			Image,
			Placeholder.configure({
				placeholder,
				emptyEditorClass:
					'cursor-text before:content-[attr(data-placeholder)] before:text-gray-500 before:float-left before:pointer-events-none',
			}),
		],
		content: value,
		onUpdate: ({ editor }) => onChange(editor.getHTML()),
		editorProps: {
			attributes: {
				class:
					'prose prose-sm max-w-none min-h-[200px] p-4 outline-none [&_h1]:text-3xl [&_h2]:text-2xl',
			},
		},
		immediatelyRender: false,
	})

	const formatButtons = [
		{
			icon: Bold,
			action: () => editor?.chain().focus().toggleBold().run(),
			label: 'Bold',
			active: editor?.isActive('bold'),
		},
		{
			icon: Italic,
			action: () => editor?.chain().focus().toggleItalic().run(),
			label: 'Italic',
			active: editor?.isActive('italic'),
		},
		{
			icon: Heading1,
			action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			label: 'H1',
			active: editor?.isActive('heading', { level: 1 }),
		},
		{
			icon: Heading2,
			action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			label: 'H2',
			active: editor?.isActive('heading', { level: 2 }),
		},
		{
			icon: List,
			action: () => editor?.chain().focus().toggleBulletList().run(),
			label: 'Bullet List',
			active: editor?.isActive('bulletList'),
		},
		{
			icon: ListOrdered,
			action: () => editor?.chain().focus().toggleOrderedList().run(),
			label: 'Ordered List',
			active: editor?.isActive('orderedList'),
		},
		{
			icon: LinkIcon,
			action: () => {
				if (!editor) return
				const { state } = editor
				const { from, to } = state.selection
				const selectedText = state.doc.textBetween(from, to, ' ')
				const initialUrl = editor?.isActive('link')
					? editor?.getAttributes('link').href
					: ''
				setLinkDialogData({ initialUrl, selectedText })
				setLinkDialogOpen(true)
			},
			label: 'Link',
			active: editor?.isActive('link'),
		},
		{
			icon: Undo,
			action: () => editor?.chain().focus().undo().run(),
			label: 'Undo',
			disabled: !editor?.can().undo(),
		},
		{
			icon: Redo,
			action: () => editor?.chain().focus().redo().run(),
			label: 'Redo',
			disabled: !editor?.can().redo(),
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
				<div className="flex items-center flex-wrap gap-1 p-2 bg-gray-50 border-b">
					{formatButtons.map(
						({ icon: Icon, action, label, active, disabled }) => (
							<Tooltip key={label}>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className={cn(
											'h-8 w-8 p-0',
											active && 'bg-accent text-accent-foreground',
										)}
										onClick={action}
										aria-label={label}
										disabled={disabled}
									>
										<Icon className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{label}</TooltipContent>
							</Tooltip>
						),
					)}
				</div>

				<div className="min-h-[200px]">
					{!editor ? (
						<div className="p-4 text-gray-400 italic">Loading editor...</div>
					) : (
						<EditorContent editor={editor} />
					)}
				</div>

				<div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 text-end">
					{editor
						? visibleCharCount(editor.getText())
						: visibleCharCount(value)}{' '}
					characters
				</div>
			</div>

			{editor && (
				<LinkDialog
					editor={editor}
					isOpen={linkDialogOpen}
					onClose={() => setLinkDialogOpen(false)}
					initialUrl={linkDialogData.initialUrl}
					selectedText={linkDialogData.selectedText}
				/>
			)}
		</TooltipProvider>
	)
}
