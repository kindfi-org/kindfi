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
	Heading3,
	Heading4,
	ImageIcon,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Redo,
	Undo,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/base/tooltip'
import { cn } from '~/lib/utils'
import { LinkDialog } from './link-dialog'

// Returns the count of visible characters by collapsing whitespace and trimming the text
const visibleCharCount = (text: string) => Array.from(text.replace(/\s+/g, ' ').trim()).length

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
	error?: string
	projectSlug?: string
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = 'Start writing your story...',
	className,
	error,
	projectSlug,
}: RichTextEditorProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false)
	const [linkDialogData, setLinkDialogData] = useState({
		initialUrl: '',
		selectedText: '',
	})
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4],
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
			Image.configure({
				allowBase64: false,
				HTMLAttributes: {
					class: 'max-w-full rounded-lg my-2',
				},
			}),
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
					'prose prose-sm max-w-none min-h-[200px] p-4 outline-none [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg',
			},
		},
		immediatelyRender: false,
	})

	const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		// Reset so the same file can be re-uploaded
		e.target.value = ''

		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			toast.error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF.')
			return
		}
		if (file.size > MAX_IMAGE_SIZE) {
			toast.error('Image must be smaller than 5 MB.')
			return
		}

		setIsUploading(true)
		try {
			const formData = new FormData()
			formData.append('image', file)

			const response = await fetch(`/api/projects/${projectSlug}/story-image`, {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				const data = await response.json().catch(() => ({}))
				toast.error((data as { error?: string }).error ?? 'Image upload failed.')
				return
			}

			const { url } = await response.json()
			editor?.chain().focus().setImage({ src: url, alt: '' }).run()
		} catch {
			toast.error('Image upload failed. Please try again.')
		} finally {
			setIsUploading(false)
		}
	}

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
			icon: Heading3,
			action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
			label: 'H3',
			active: editor?.isActive('heading', { level: 3 }),
		},
		{
			icon: Heading4,
			action: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(),
			label: 'H4',
			active: editor?.isActive('heading', { level: 4 }),
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
				const initialUrl = editor?.isActive('link') ? editor?.getAttributes('link').href : ''
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
				className={cn('border rounded-lg overflow-hidden', error && 'border-red-500', className)}
			>
				<div className="flex items-center flex-wrap gap-1 p-2 bg-gray-50 border-b">
					{formatButtons.map(({ icon: Icon, action, label, active, disabled }) => (
						<Tooltip key={label}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className={cn('h-8 w-8 p-0', active && 'bg-accent text-accent-foreground')}
									onClick={action}
									aria-label={label}
									disabled={disabled}
								>
									<Icon className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{label}</TooltipContent>
						</Tooltip>
					))}

					{projectSlug && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading || !editor}
									aria-label="Insert image"
								>
									<ImageIcon className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{isUploading ? 'Uploading…' : 'Insert image'}</TooltipContent>
						</Tooltip>
					)}
				</div>

				<div className="min-h-[200px]">
					{!editor ? (
						<div className="p-4 text-gray-400 italic">Loading editor...</div>
					) : (
						<EditorContent editor={editor} aria-invalid={!!error} />
					)}
				</div>

				<div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 text-end">
					{editor ? visibleCharCount(editor.getText()) : visibleCharCount(value)} characters
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

			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				className="hidden"
				onChange={handleImageFileChange}
				tabIndex={-1}
			/>
		</TooltipProvider>
	)
}
