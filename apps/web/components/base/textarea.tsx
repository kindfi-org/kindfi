import * as React from 'react'
import { inputClasses } from '~/lib/form/form-styles'
import { cn } from '~/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
	({ className, ...props }, ref) => {
		return <textarea className={cn(inputClasses.textarea, className)} ref={ref} {...props} />
	},
)
Textarea.displayName = 'Textarea'

export { Textarea }
