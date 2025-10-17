/**
 * Custom hook for easy access to translations
 * Re-exports the useI18n hook with an alias for convenience
 */
import { useI18n } from '~/lib/i18n/context'

export const useTranslation = useI18n
