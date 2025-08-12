'use client'

import type * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
} from 'react-hook-form'
import { getCsrfTokenFromCookie } from '~/app/actions/csrf'
import { Label } from '~/components/base/label'
import { cn } from '~/lib/utils'

/**
 * ShadCN/UI Reference:https://ui.shadcn.com/docs/components/form
 * Provides form context to child components.
 */
const Form = FormProvider

/**
 * Context for managing form field state.
 * @template TFieldValues - Form field values
 * @template TName - Field name
 */
type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
)

/**
 * Wrapper for form fields with react-hook-form support.
 * @component
 * @template TFieldValues - Form field values
 * @template TName - Field name
 * @param {ControllerProps<TFieldValues, TName>} props - Form field properties
 */
const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

/**
 * Custom hook to access form field state.
 * @returns {object} Form field context values
 */
const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext)
	const itemContext = React.useContext(FormItemContext)
	const { getFieldState, formState } = useFormContext()

	const fieldState = getFieldState(fieldContext.name, formState)

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>')
	}

	const { id } = itemContext

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	}
}

/**
 * Context for managing form item state.
 * @property {string} id - Unique identifier for the form item, used for accessibility
 */
type FormItemContextValue = {
	id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
)

/**
 * Wrapper for form item elements.
 * @component
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Component properties
 */
const FormItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const id = React.useId()

	return (
		<FormItemContext.Provider value={{ id }}>
			<div ref={ref} className={cn('space-y-2', className)} {...props} />
		</FormItemContext.Provider>
	)
})
FormItem.displayName = 'FormItem'

/**
 * Label for form fields.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} props - Component properties
 */
const FormLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField()

	return (
		<Label
			ref={ref}
			className={cn(error && 'text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		/>
	)
})
FormLabel.displayName = 'FormLabel'

/**
 * Control element for form fields.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof Slot>} props - Component properties
 */
const FormControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

	return (
		<Slot
			ref={ref}
			id={formItemId}
			aria-describedby={
				!error
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	)
})
FormControl.displayName = 'FormControl'

/**
 * Description text for form fields.
 * @component
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Component properties
 */
const FormDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
	const { formDescriptionId } = useFormField()

	return (
		<p
			ref={ref}
			id={formDescriptionId}
			className={cn('text-[0.8rem] text-muted-foreground', className)}
			{...props}
		/>
	)
})
FormDescription.displayName = 'FormDescription'

/**
 * Message text for form validation errors.
 * @component
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Component properties
 */
const FormMessage = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
	const { error, formMessageId } = useFormField()
	const body = error ? String(error?.message) : children

	return (
		<p
			ref={ref}
			id={formMessageId}
			className={cn(
				'text-[0.8rem] font-medium text-destructive',
				!body && 'hidden',
				className,
			)}
			{...props}
		>
			{body}
		</p>
	)
})
FormMessage.displayName = 'FormMessage'

/**
 * Hidden CSRF token field for forms.
 * This should be used in server components or SSR context only.
 */
export function CSRFTokenField(): React.ReactElement {
	// Client-safe retrieval of CSRF token
	const [token, setToken] = React.useState('')
	React.useEffect(() => {
		let active = true
		getCsrfTokenFromCookie().then((fetchedToken) => {
			if (!active) return
			if (!fetchedToken) {
				console.warn(
					'CSRF token not found in cookies. Ensure you have set it correctly.',
				)
				return
			}
			setToken(fetchedToken)
		})
		return () => {
			active = false
		}
	}, [])
	return <input type="hidden" name="csrfToken" value={token} />
}

export {
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField,
}
