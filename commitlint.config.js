module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// Make type case-insensitive
		'type-case': [0],
		// Allow any type (not just conventional ones)
		'type-enum': [0],
		// Allow longer subject lines
		'subject-max-length': [1, 'always', 100],
		// Allow shorter subject lines
		'subject-min-length': [0],
		// Make scope optional
		'scope-empty': [0],
		// Allow any scope
		'scope-enum': [0],
		// Allow body and footer to be optional
		'body-leading-blank': [0],
		'footer-leading-blank': [0],
	},
}
