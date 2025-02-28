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
import { cn } from '../../../lib/utils'
import { Button } from '../../base/button'
import { LinkDialog } from './LinkDialog'


interface RichTextEditorProps {
	content: string
	onChange: (content: string) => void
	placeholder?: string
}

export function RichTextEditor({
	content,
	onChange,
	placeholder = 'Start writing your story...',
}: RichTextEditorProps) {
	// Add these state variables for the dialog
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
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		},
		editorProps: {
			attributes: {
				class:
					'prose prose-sm focus:outline-none max-w-none min-h-[200px] [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:ml-2 [&_li]:pl-1 [&_p]:mb-2 [&_p:last-child]:mb-0',
			},
		},
	})

	if (!editor) {
		return null
	}

	return (
		<div className="flex flex-col gap-4 rounded-lg border p-4">
			<div className="flex flex-wrap gap-2 border-b pb-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cn(
						'transition-colors',
						editor.isActive('bold') && 'bg-accent text-accent-foreground',
					)}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cn(
						'transition-colors',
						editor.isActive('italic') && 'bg-accent text-accent-foreground',
					)}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={cn(
						'transition-colors',
						editor.isActive('heading', { level: 1 }) &&
							'bg-accent text-accent-foreground',
					)}
				>
					<Heading1 className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={cn(
						'transition-colors',
						editor.isActive('heading', { level: 2 }) &&
							'bg-accent text-accent-foreground',
					)}
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={cn(
						'transition-colors',
						editor.isActive('bulletList') && 'bg-accent text-accent-foreground',
					)}
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={cn(
						'transition-colors',
						editor.isActive('orderedList') &&
							'bg-accent text-accent-foreground',
					)}
				>
					<ListOrdered className="h-4 w-4" />
				</Button>
				{/* Replaced the link button with this new implementation */}
				<Button
					variant="outline"
					size="icon"
					onClick={() => {
						const { state } = editor
						const { from, to } = state.selection
						const selectedText = state.doc.textBetween(from, to, ' ')

						const linkMark = editor.isActive('link')
						const initialUrl = linkMark ? editor.getAttributes('link').href : ''

						setLinkDialogData({ initialUrl, selectedText })
						setLinkDialogOpen(true)
					}}
					className={cn(
						'transition-colors',
						editor.isActive('link') && 'bg-accent text-accent-foreground',
					)}
				>
					<LinkIcon className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					className="transition-colors"
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					className="transition-colors"
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>
			<EditorContent editor={editor} />

			{/* Added the LinkDialog component */}
			<LinkDialog
				editor={editor}
				isOpen={linkDialogOpen}
				onClose={() => setLinkDialogOpen(false)}
				initialUrl={linkDialogData.initialUrl}
				selectedText={linkDialogData.selectedText}
			/>
		</div>
	)
}
