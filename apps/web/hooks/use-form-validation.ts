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

export function useFormValidation(rules: ValidationRules = {}) {
	const [isEmailInvalid, setIsEmailInvalid] = useState(false)
	const [isPasswordInvalid, setIsPasswordInvalid] = useState(false)

	const validateEmail = (value: string) => {
		if (!rules.email) return
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
		setIsEmailInvalid(!emailRegex.test(value))
	}

	const validatePassword = (value: string) => {
		if (!rules.password) return
		setIsPasswordInvalid(value.length < (rules.minLength || 6))
	}

	const validateField = (name: string, value: string) => {
		switch (name) {
			case 'email':
				validateEmail(value)
				break
			case 'password':
				validatePassword(value)
				break
		}
	}

	const handleValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		validateField(name, value)
	}

	return {
		isEmailInvalid,
		isPasswordInvalid,
		handleValidation,
		validateEmail,
		validatePassword,
	}
}
