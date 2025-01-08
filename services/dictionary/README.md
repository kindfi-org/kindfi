# Dictionary for the app and services

> This dictionary would have a combo of CMS content, and the app's own content. It would be used to generate the app's content, and also to generate the CMS content for SSG cache.

## Guideline for Dictionary Static Translations

To facilitate the translation of the dictionary content from English to other languages, we use AI-powered translation tools. Here is a step-by-step guide for developers who want to collaborate on translation files:

1. **Setup**: Ensure you have access to the AI chat platform such as Anthropic Claude3.5 or ChatGPT. You might need an API key or other credentials, depending the type of access you have.
2. **Extract Content**: Identify the content that needs translation. This could be in JSON format used in the dictionary.
3. **Translate**: Generate the translation in the required language. For example, "Translate the following text to [targetLanguage]: [sourceText]". Make sure to use proper prompt engineering to get the best results and translation accuracy.
   1. Alternatively, you can use Copilot or Cursor to generate translations within the IDE. Use adequate prompt engineering to get the best results.
4. **Naming Convention**: Use `snake_case` for translation key names to maintain consistency across the dictionary files.
5. **Review**: Manually review the translated content to ensure accuracy and context relevance if you know the translated language. AI translations might not always be perfect.
6. **Integrate**: Add the translated content back into the dictionary files, maintaining the structure and format.
7. **Test**: Verify that the translations are correctly integrated and displayed in the application.
8. **Contribute**: Submit your changes via a pull request, following the project's contribution guidelines.

By following these steps, you can help expand the language support of the application, making it accessible to a broader audience.
