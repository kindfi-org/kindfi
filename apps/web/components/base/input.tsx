'use client'

import { composeEventHandlers } from '@radix-ui/primitive'
import { composeRefs } from '@radix-ui/react-compose-refs'
import { Primitive } from '@radix-ui/react-primitive'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { Button } from '~/components/base/button'
import { cn } from '~/lib/utils'

/**
 * ShadCN/UI Reference:https://ui.shadcn.com/docs/components/input
 * Input component for rendering styled input fields with support for various HTML input attributes.
 * This component provides a flexible and customizable input element, including styles for focus, disabled state, and file inputs.
 *
 * @component
 *
 * @example
 * <Input type="text" placeholder="Enter your name" />
 *
 * @param {InputProps} props - The component props.
 * @param {string} [props.className] - Additional CSS classes for custom styling.
 * @param {string} [props.type] - Specifies the type of the input (e.g., "text", "password", "file").
 *
 * @returns {JSX.Element} The Input component.
 */

export const Input = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 duration-200',
				className,
			)}
			ref={ref}
			{...props}
		/>
	)
})
Input.displayName = 'Input'

export type InputBaseContextProps = Pick<
	InputBaseProps,
	'autoFocus' | 'disabled'
> & {
	controlRef: React.RefObject<HTMLElement | null>
	onFocusedChange: (focused: boolean) => void
}

const InputBaseContext = React.createContext<InputBaseContextProps>({
	autoFocus: false,
	controlRef: { current: null },
	disabled: false,
	onFocusedChange: () => {},
})

const useInputBaseContext = () => React.useContext(InputBaseContext)

export interface InputBaseProps
	extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
	autoFocus?: boolean
	disabled?: boolean
}

export const InputBase = React.forwardRef<
	React.ElementRef<typeof Primitive.div>,
	InputBaseProps
>(({ autoFocus, disabled, className, onClick, ...props }, ref) => {
	const [focused, setFocused] = React.useState(false)

	const controlRef = React.useRef<HTMLElement>(null)

	// Memoize the click handler to avoid React Compiler warning about ref access
	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			// Access ref in event handler, not during render
			const control = controlRef.current
			if (control && event.currentTarget === event.target) {
				control.focus()
			}
		},
		[],
	)

	// Combine onClick handlers manually to avoid React Compiler ref access warning
	const combinedOnClick = React.useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			onClick?.(event)
			handleClick(event)
		},
		[onClick, handleClick],
	)

	return (
		<InputBaseContext.Provider
			value={{
				autoFocus,
				controlRef,
				disabled,
				onFocusedChange: setFocused,
			}}
		>
			<Primitive.div
				ref={ref}
				onClick={combinedOnClick}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 duration-200',
					disabled && 'cursor-not-allowed opacity-50',
					focused && 'ring-2 ring-ring ring-offset-2',
					className,
				)}
				{...props}
			/>
		</InputBaseContext.Provider>
	)
})
InputBase.displayName = 'InputBase'

export const InputBaseFlexWrapper = React.forwardRef<
	React.ElementRef<typeof Primitive.div>,
	React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => (
	<Primitive.div
		ref={ref}
		className={cn('flex flex-1 flex-wrap', className)}
		{...props}
	/>
))
InputBaseFlexWrapper.displayName = 'InputBaseFlexWrapper'

export const InputBaseControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	React.ComponentPropsWithoutRef<typeof Slot>
>(({ onFocus, onBlur, ...props }, ref) => {
	const { controlRef, autoFocus, disabled, onFocusedChange } =
		useInputBaseContext()

	return (
		<Slot
			ref={composeRefs(controlRef, ref)}
			autoFocus={autoFocus}
			onFocus={composeEventHandlers(onFocus, () => onFocusedChange(true))}
			onBlur={composeEventHandlers(onBlur, () => onFocusedChange(false))}
			{...{ disabled }}
			{...props}
		/>
	)
})
InputBaseControl.displayName = 'InputBaseControl'

export interface InputBaseAdornmentProps
	extends React.ComponentPropsWithoutRef<'div'> {
	asChild?: boolean
	disablePointerEvents?: boolean
}

export const InputBaseAdornment = React.forwardRef<
	React.ElementRef<'div'>,
	InputBaseAdornmentProps
>(({ className, disablePointerEvents, asChild, children, ...props }, ref) => {
	const Comp = asChild ? Slot : typeof children === 'string' ? 'p' : 'div'

	const isAction =
		React.isValidElement(children) && children.type === InputBaseAdornmentButton

	return (
		<Comp
			ref={ref}
			className={cn(
				'flex items-center text-muted-foreground [&_svg]:size-4',
				(!isAction || disablePointerEvents) && 'pointer-events-none',
				className,
			)}
			{...props}
		>
			{children}
		</Comp>
	)
})
InputBaseAdornment.displayName = 'InputBaseAdornment'

export const InputBaseAdornmentButton = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentPropsWithoutRef<typeof Button>
>(
	(
		{
			type = 'button',
			variant = 'ghost',
			size = 'icon',
			disabled: disabledProp,
			className,
			...props
		},
		ref,
	) => {
		const { disabled } = useInputBaseContext()

		return (
			<Button
				ref={ref}
				type={type}
				variant={variant}
				size={size}
				disabled={disabled || disabledProp}
				className={cn('size-6', className)}
				{...props}
			/>
		)
	},
)
InputBaseAdornmentButton.displayName = 'InputBaseAdornmentButton'

export const InputBaseInput = React.forwardRef<
	React.ElementRef<typeof Primitive.input>,
	React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ className, ...props }, ref) => (
	<Primitive.input
		ref={ref}
		className={cn(
			'w-full flex-1 bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:pointer-events-none',
			className,
		)}
		{...props}
	/>
))
InputBaseInput.displayName = 'InputBaseInput'
