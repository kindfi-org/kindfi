'use client'

import { Check, Copy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

interface CopyButtonProps {
	value: string
	/** Accessible name describing what gets copied, e.g. "Copy contract address". */
	label: string
	className?: string
}

/**
 * Icon-only copy-to-clipboard button with an accessible name and visible
 * copied feedback.
 */
export function CopyButton({ value, label, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false)
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (resetTimer.current) clearTimeout(resetTimer.current)
		}
	}, [])

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value)
			setCopied(true)
			if (resetTimer.current) clearTimeout(resetTimer.current)
			resetTimer.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error('Could not copy to clipboard')
		}
	}, [value])

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className={cn('h-7 w-7 shrink-0', className)}
			onClick={handleCopy}
			aria-label={copied ? 'Copied' : label}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
			) : (
				<Copy className="h-3.5 w-3.5" aria-hidden="true" />
			)}
			<span aria-live="polite" className="sr-only">
				{copied ? 'Copied to clipboard' : ''}
			</span>
		</Button>
	)
}
