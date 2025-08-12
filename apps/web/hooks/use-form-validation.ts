import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { throttle } from 'lodash'
import { useState } from 'react'

/**
 * Configuration options for form validation rules
 * @interface ValidationRules
 * @property {boolean} [email] - Enable email format validation
 * @property {boolean} [password] - Enable password validation
 * @property {number} [minLength] - Minimum length requirement for password
 */
interface ValidationRules {
	email?: boolean
	password?: boolean
	minLength?: number
}
type ValidFieldName = 'email'

export function useFormValidation(rules: ValidationRules = {}) {
	const [isEmailInvalid, setIsEmailInvalid] = useState(false)
	const [doesEmailExist, setDoesEmailExist] = useState('')
	const supabase = createSupabaseBrowserClient()

	const resetValidation = () => {
		setIsEmailInvalid(false)
		setDoesEmailExist('')
	}

	const validateEmail = (value: string) => {
		if (!rules.email) return
		const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
		const newEmailValidation = emailRegex.test(value)
		setIsEmailInvalid(!newEmailValidation)

		throttle(async () => {
			if (!newEmailValidation) return
			const { data } = await supabase
				.from('profiles')
				.select('id')
				.eq('email', value)
				.single()
			setDoesEmailExist(data?.id || '')
		}, 750)()
	}

	const validateField = (name: ValidFieldName, value: string) => {
		switch (name) {
			case 'email':
				validateEmail(value)
				break
			default:
				break
		}
	}

	const handleValidation = (
		e: React.ChangeEvent<HTMLInputElement & { name: ValidFieldName }>,
	) => {
		const { name, value } = e.target
		validateField(name, value)
	}

	return {
		isEmailInvalid,
		doesEmailExist,
		handleValidation,
		validateEmail,
		resetValidation,
	}
}
