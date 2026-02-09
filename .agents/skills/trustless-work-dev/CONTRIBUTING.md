# Contributing to Trustless Work Development Skill

Thank you for your interest in contributing to the Trustless Work Development Skill! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Issues

If you find a bug, have a feature request, or want to suggest improvements:

1. **Check existing issues** - Search [GitHub Issues](https://github.com/Trustless-Work/trustless-work-dev-skill/issues) to see if your issue has already been reported
2. **Create a new issue** - Use the appropriate issue template and provide:
   - Clear description of the issue or feature
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Relevant context or examples

### Contributing Documentation

This skill is documentation-focused. Contributions typically involve:

- **Updating existing documentation** - Fix errors, clarify explanations, add examples
- **Adding new documentation** - Document new API endpoints, SDK features, or use cases
- **Improving structure** - Enhance organization and navigation
- **Adding examples** - Provide more code samples and use cases

## Development Setup

### Prerequisites

- Git
- A text editor or IDE
- Basic knowledge of Markdown

### Getting Started

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/trustless-work-dev-skill.git
   cd trustless-work-dev-skill
   ```

2. **Create a branch**
   ```bash
   git checkout -b your-feature-branch
   ```

3. **Make your changes**
   - Edit files using your preferred editor
   - Follow the [Documentation Guidelines](#documentation-guidelines) below

4. **Test your changes**
   - Review the Markdown formatting
   - Verify links work correctly
   - Check that examples are accurate

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin your-feature-branch
   ```
   Then open a Pull Request on GitHub.

## Documentation Guidelines

### File Structure

Maintain the existing structure:

```
trustless-work-dev-skill/
├── SKILL.md                    # Main skill definition (required)
├── README.md                   # Project documentation
├── CONTRIBUTING.md             # This file
├── CODE_OF_CONDUCT.md          # Code of Conduct
├── LICENSE                     # Apache-2.0 License
└── skills/                     # Skill documentation
    ├── api/                    # REST API documentation
    ├── react-sdk/              # React SDK documentation
    └── blocks/                 # Blocks SDK documentation
```

### Writing Style

- **Be concise** - Skills should be concise and focused. Avoid unnecessary verbosity
- **Use clear headings** - Structure content with descriptive headings
- **Include examples** - Provide code examples for all concepts
- **Keep it accurate** - Ensure all API endpoints, types, and examples are current
- **Link to resources** - Reference official documentation when appropriate

### Markdown Formatting

- Use proper heading hierarchy (`#`, `##`, `###`)
- Format code blocks with language identifiers:
  ```typescript
  // Example
  ```
- Use backticks for inline code: `useInitializeEscrow`
- Use lists for multiple items
- Include links to related documentation

### Content Organization

When adding or updating documentation:

1. **Start with overview** - Explain what the feature/concept is
2. **Provide context** - When and why to use it
3. **Show examples** - Include complete, working code examples
4. **Reference types** - Link to TypeScript type definitions
5. **Add resources** - Link to official docs and resources

### Skill File Format

The main `SKILL.md` file uses frontmatter:

```yaml
---
name: trustless-work-dev
description: Comprehensive guide for developing with Trustless Work platform...
---
```

- Keep the description concise but comprehensive
- Include key trigger words that should activate this skill
- Reference all relevant documentation files

## Pull Request Process

### Before Submitting

- [ ] Review your changes for typos and formatting
- [ ] Ensure all links work correctly
- [ ] Verify code examples are accurate
- [ ] Check that your changes follow the documentation guidelines
- [ ] Update `README.md` if you've added new files or changed structure

### Pull Request Guidelines

1. **Clear title** - Summarize your changes in the PR title
2. **Detailed description** - Explain what you changed and why
3. **Reference issues** - Link to related issues using `Closes #123`
4. **Screenshots** - If applicable, include examples of the changes
5. **Keep focused** - One PR per feature or fix

### Review Process

- Maintainers will review your PR
- Feedback may be requested - please respond promptly
- Once approved, your PR will be merged

## Types of Contributions

### Bug Fixes

- Fix typos or errors in documentation
- Correct outdated API endpoints or examples
- Fix broken links

### Enhancements

- Add missing documentation
- Improve clarity of existing content
- Add more examples or use cases
- Enhance structure and organization

### New Features

- Document new API endpoints
- Add documentation for new SDK features
- Create guides for new use cases

## Documentation Areas

### REST API (`skills/api/`)

- Keep API endpoints current
- Include complete request/response examples
- Document all required and optional parameters
- Include error handling examples
- Maintain TypeScript type definitions

### React SDK (`skills/react-sdk/`)

- Document all hooks with examples
- Include complete component examples
- Show integration patterns
- Document TypeScript types
- Provide vibe-coding guides for AI workflows

### Blocks SDK (`skills/blocks/`)

- Document all available components
- Show provider setup and configuration
- Document hooks and context API
- Include installation and usage examples
- Provide AI context guides

## Questions?

- Open an issue for questions or discussions
- Check existing documentation first
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.

Thank you for contributing to Trustless Work Development Skill! 🎉
