import { dirname } from 'node:path'
import { FlatCompat } from '@eslint/eslintrc'
// biome-ignore lint/style/useNodejsImportProtocol: modern Node.js supports import.meta.url
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
