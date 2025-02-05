import * as React from 'react'

import { cn } from '~/lib/utils'
/**
 *  ShadCN/UI Reference:https://ui.shadcn.com/docs/components/textarea
 * Textarea component for rendering a styled, responsive textarea input field.
 * Provides support for custom styles, placeholder text, and focus states.
 *
 * @component
 * @param {React.ComponentProps<'textarea'>} props - The component props.
 * @param {string} [props.className] - Additional custom CSS classes to apply to the textarea.
 * @param {...React.ComponentProps<'textarea'>} props.* - All standard HTML textarea attributes are supported.
 * @example
 * <Textarea
 *   placeholder="Enter your message"
 *   className="min-h-[120px]"
 *   defaultValue="Default text"
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * @returns {JSX.Element} The rendered Textarea component
 */
const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				className,
			)}
			ref={ref}
			{...props}
		/>
	)
})
Textarea.displayName = 'Textarea'

export { Textarea }
