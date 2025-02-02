# Implementation Steps for Languine.ai Integration

This document outlines all the detailed implementation steps to integrate Languine.ai for automated localization into KindFi's Next.js architecture. Follow the steps below to ensure a complete and robust integration.

---

## 1. Setup & Configuration

### 1.1. Install Languine CLI
- **Command:** Run the following command locally or within your CI environment:
  ```bash
  npx languine@latest
  ```
- Verify that the CLI is installed correctly by checking the version or help output.

### 1.2. Create Configuration File
- **File Type:** Use JSON or YAML to define the localization settings.
- **Location:** Place the configuration file (e.g., `languine.config.json`) in the project root.
- **Content Example:**
  ```json
  {
    "sourceLanguage": "en",
    "targetLanguages": ["fr", "es", "de"],
    "fileFormats": [".json", ".ts", ".md", ".yaml", ".po"],
    "paths": {
      "sourceDir": "apps/web",
      "translationDir": "locales"
    },
    "gitDiff": true  // Enables detection of added/modified/removed keys using Git diff
  }
  ```
- **Actions:**
  - Create the file with the defined structure.
  - Adjust `sourceDir` and `translationDir` based on your project's file structure.

### 1.3. Initial Testing
- Run Languine against your repository to extract and synchronize translation keys.
- Command:
  ```bash
  npx languine run
  ```
- Verify that the extraction logs show the discovered keys and that translation files are generated/updated accordingly.

---

## 2. Automating the Localization Workflow

### 2.1. Git Diff Detection
- **Purpose:** Enable Languine to track changes in translation keys by comparing Git diffs.
- **Configuration:**
  - Ensure `"gitDiff": true` is set in your config file.
  - Optionally, hook into Git events: use pre-commit or CI hooks to run `npx languine run` automatically.
- **Script Integration:**
  - Add a script to `package.json` for easy execution:
    ```json
    {
      "scripts": {
        "localize": "npx languine run"
      }
    }
    ```

### 2.2. Formatting and Code Hooks
- **Prettier/Biome Integration:**
  - Integrate formatting checks on the generated translation files by updating your Prettier/Biome hook configurations.
  - Ensure that any new translation keys follow the project's standard formatting.

---

## 3. Creating the Language Selector

### 3.1. Component Development
- **Location:** In your Next.js `apps/web/components` directory, create a new component (e.g., `language-selector.tsx`).
- **Functionality:** The component should:
  - Display available languages.
  - Allow users to select their preferred language.
  - Update both the UI and persist the choice (use local storage or session storage).

### 3.2. Utilizing React Context or Middleware
- **React Context:**
  - Create a context provider (e.g., `locale-context.tsx`) to store and access the current language throughout the app.
  - Update the provider on language selection.
- **Next.js Middleware (Optional):**
  - Alternatively, configure Next.js middleware to set the language based on query parameters.
- **Implementation Flow:**
  1. When the language is changed:
     - Update the React Context state.
     - Persist the selection in local storage.
     - Optionally, update the route (e.g., prefixing the URL with the language code).
  2. On app load, check for an existing language preference and set it in the context.

### 3.3. UI Integration
- **Navbar Integration:**
  - Import the `LanguageSelector` component into your navbar (e.g., in `apps/web/components/header-auth.tsx` or similar file).
  - Ensure that the component's UI is styled with Tailwind CSS for smooth UX.

---

## 4. CI/CD Integration

### 4.1. Automate Localization in CI/CD
- **Taskfile Update:**
  - Update the `Taskfile.yml` to include a step that runs the Languine localization sync before deploying.
  - Example snippet in Taskfile:
    ```yaml
    steps:
      - name: Localize
        run: npx languine run
    ```
- **CI Configuration:**
  - If using GitHub Actions, Jenkins, or another CI/CD tool, add a step in your workflow file that invokes the localization command.
  - Ensure environment variables (if required by Languine) are properly set in the CI/CD pipeline.

### 4.2. Integration Checks
- **On Merge/Push:** Make sure the localization update runs automatically by checking CI logs.
- **Validation:** Confirm that the generated translation files are committed (or available as artifacts) for review.

---

## 5. Testing & Validation

### 5.1. Manual Testing
- **Languine Output:** Run `npx languine run` locally and verify that:
  - New keys are detected.
  - Modified keys trigger updates.
  - Deleted keys are removed.
- **Language Selector:** Test the language selector by:
  - Switching languages.
  - Verifying that the content immediately reflects the changes.
  - Ensuring persistence across page reloads.

### 5.2. Automated Testing
- **Unit Tests:** Write tests for the language selector component and locale context to ensure correct state management.
- **Integration Tests:** Setup integration tests to simulate a user's language switch across multiple pages.
- **CI Validation:** Configure CI to run these tests and fail if the language functionality is broken.

### 5.3. Monitoring & Performance
- Check that the localization integration does not impact the page load or app performance.
- Monitor logs for any errors when translations are applied.

---

## 6. Documentation & Best Practices

### 6.1. Update Internal Documentation
- Document the Languine configuration, commands, and automation steps in your internal docs (see `docs/README.md` and `docs/SUMMARY.md`).
- Provide a troubleshooting guide for common issues (e.g., missing translations or formatting errors).

### 6.2. Code Comments & Repository Guidelines
- Ensure that new files such as `languine.config.json`, `language-selector.tsx`, and locale context files contain clear comments.
- Maintain consistency with naming conventions and code style as per KindFi's standards.

---

## 7. Summary of Deliverables

- **Languine Integration:**
  - Languine CLI installed and configured with a dedicated configuration file.
  - Automated localization workflow in place via Git diff detection.
- **Language Selector:**
  - A fully functional language selector integrated into the navbar.
  - Usage of React Context/middleware for language management.
- **CI/CD & Testing:**
  - Updated CI/CD pipeline with an automated localization step.
  - Comprehensive testing (manual and automated) that ensures robust translation and language switching.
- **Documentation:**
  - Detailed internal documentation outlining the setup, usage, and troubleshooting for the localization integration.

---

Follow these detailed steps to achieve a seamless integration of Languine.ai and ensure that KindFi's platform remains accessible, localized, and user-friendly.
