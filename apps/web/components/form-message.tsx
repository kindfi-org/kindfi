import { FormAlert } from '~/components/shared/form/form-alert'

export type Message =
	| { type: 'success'; message: string }
	| { type: 'error'; message: string }
	| { success: string }
	| { error: string }

export function FormMessage({ message }: { message: Message }) {
	if (!message) return null

	const type =
		'type' in message
			? message.type
			: 'success' in message
				? 'success'
				: 'error' in message
					? 'error'
					: null

	const text =
		'message' in message
			? message.message
			: 'success' in message
				? message.success
				: 'error' in message
					? message.error
					: ''

	if (!type || !text) return null

	return <FormAlert variant={type}>{text}</FormAlert>
}
