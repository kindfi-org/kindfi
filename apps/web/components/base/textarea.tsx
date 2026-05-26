import * as React from 'react'

import { cn } from '~/lib/utils'
import { inputClasses } from '~/lib/form/form-styles'

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(inputClasses.textarea, className)}
			ref={ref}
			{...props}
		/>
	)
})
Textarea.displayName = 'Textarea'

export { Textarea }
