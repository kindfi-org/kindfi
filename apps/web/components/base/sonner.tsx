'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
/**
 * Toaster component for displaying toast notifications with custom styles and theme support.
 * @component
 * @param {ToasterProps} props - The component props
 * @param {import('sonner').ToastOptions} [props.toastOptions] - Custom options for toast notifications
 * @param {'system' | 'dark' | 'light'} [props.theme='system'] - The theme for the toaster
 * @example
 * // 1. Add Toaster to your app
 * <Toaster>
 * </Toaster>
 * 
 * // 2. Use toast methods anywhere in your app
 * import { toast } from 'sonner'
 * 
 * // Success notification
 * toast.success('Payment successful', {
 *   description: 'Your payment has been processed'
 * })
 * 
 * // Error notification
 * toast.error('Payment failed', {
 *   description: 'Please try again'
 * })
 */
type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton:
						'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
					cancelButton:
						'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
