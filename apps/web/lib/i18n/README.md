# Internationalization (i18n) System

This directory contains the internationalization setup for the KindFi web application.

## Features

- 🌐 Support for English (en) and Spanish (es)
- 🎌 Flag icons for language selection (🇺🇸 USA, 🇪🇸 Spain)
- 💾 Persistent language selection using localStorage
- 🔄 Real-time language switching
- 🎨 Integrated with existing UI components
- ♿ Accessibility-friendly with proper ARIA labels

## Structure

```
lib/i18n/
├── context.tsx       # i18n Context Provider and Hook
├── translations.ts   # Translation strings for all languages
├── index.ts         # Main exports
└── README.md        # This file
```

## Usage

### Using translations in components

```tsx
import { useI18n } from '~/lib/i18n/context'

function MyComponent() {
  const { t, language, setLanguage } = useI18n()
  
  return (
    <div>
      <h1>{t('nav.projects')}</h1>
      <p>Current language: {language}</p>
    </div>
  )
}
```

### Alternative hook

```tsx
import { useTranslation } from '~/hooks/use-translation'

function MyComponent() {
  const { t } = useTranslation()
  
  return <h1>{t('nav.about')}</h1>
}
```

## Adding New Translations

1. Open `lib/i18n/translations.ts`
2. Add your translation key to both `en` and `es` objects:

```typescript
export const translations = {
  en: {
    'my.new.key': 'My English text',
    // ... other translations
  },
  es: {
    'my.new.key': 'Mi texto en español',
    // ... other translations
  },
}
```

3. Use the translation in your component:

```tsx
const { t } = useI18n()
return <p>{t('my.new.key')}</p>
```

## Translation Key Naming Convention

- Use dot notation for nested keys: `category.subcategory.key`
- Common categories:
  - `nav.*` - Navigation items
  - `common.*` - Common UI elements
  - `user.*` - User-related messages
  - `aria.*` - ARIA labels for accessibility
  - `language.*` - Language selector labels

## Language Selector Component

The language selector is automatically added to:
- Desktop header (top right)
- Mobile menu (top of the menu)

Users can click on the flag icon to switch between languages.

## Adding a New Language

1. Update the `Language` type in `context.tsx`:
```typescript
export type Language = 'en' | 'es' | 'fr' // Add 'fr' for French
```

2. Add translations in `translations.ts`:
```typescript
export const translations = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: { /* French translations */ },
}
```

3. Update the language selector in `components/shared/layout/header/language-selector.tsx`:
```typescript
const flagIcons = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
}
```

## Technical Details

- **Storage**: Language preference is stored in `localStorage` with key `'language'`
- **Default**: English (`en`) is the default language
- **HTML lang attribute**: Automatically updated when language changes
- **Context API**: Uses React Context for global state management
- **Type Safety**: Full TypeScript support with strict typing

## Best Practices

1. Always provide translations for all supported languages
2. Keep translation keys descriptive and organized
3. Use ARIA labels for accessibility
4. Test translations with different content lengths
5. Consider cultural nuances when translating

