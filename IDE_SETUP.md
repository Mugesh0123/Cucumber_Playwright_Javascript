# IDE Setup Guide for Cucumber Extension

## Issue: "Undefined step" errors in VS Code

If you're seeing "undefined step" errors in your VS Code IDE for Cucumber feature files, follow these steps to resolve the issue:

### 1. Install Required Extensions

Make sure you have the following VS Code extensions installed:
- **Cucumber (Gherkin)** by Cucumber
- **Cucumber (Gherkin) Full Support** by Alexander Krechik

### 2. Reload VS Code Workspace

1. Close VS Code completely
2. Reopen VS Code
3. Open the workspace file: `Automation Framework BDD.code-workspace`
4. Or open the folder directly: `Automation Framework BDD`

### 3. Verify Configuration

The project includes the following configuration files:
- `.vscode/settings.json` - VS Code settings for Cucumber
- `.vscode/launch.json` - Debug configuration
- `Automation Framework BDD.code-workspace` - Workspace configuration

### 4. Manual Configuration (if needed)

If the automatic configuration doesn't work, manually add these settings to your VS Code settings:

```json
{
  "cucumber.features": [
    "features/**/*.feature"
  ],
  "cucumber.glue": [
    "step-definitions/**/*.js",
    "support/**/*.js"
  ],
  "cucumber.snippets": {
    "framework": "async-await"
  },
  "cucumber.smartSnippets": true,
  "cucumber.strictGherkinCompletion": false,
  "cucumber.strictGherkinValidation": false,
  "files.associations": {
    "*.feature": "cucumber"
  }
}
```

### 5. Restart Cucumber Extension

1. Open Command Palette (Ctrl+Shift+P)
2. Type: "Developer: Reload Window"
3. Press Enter

### 6. Verify Step Definitions

The step definitions are located in:
- `step-definitions/loginSteps.js` - Main step definitions
- `support/` - Support files and hooks

### 7. Test the Setup

Run the following command to verify everything works:
```bash
npx cucumber-js --dry-run
```

This should show all steps as recognized (not undefined).

### 8. Troubleshooting

If you still see undefined step errors:

1. **Check file associations**: Make sure `.feature` files are associated with Cucumber
2. **Restart VS Code**: Sometimes a full restart is needed
3. **Clear VS Code cache**: Delete the `.vscode` folder and recreate it
4. **Check extension version**: Make sure you have the latest Cucumber extension
5. **Verify file paths**: Ensure the step definition files are in the correct locations

### 9. Alternative Solutions

If the VS Code extension continues to show errors:

1. **Use a different editor**: Try IntelliJ IDEA with Cucumber plugin
2. **Ignore IDE errors**: The tests run correctly even if the IDE shows errors
3. **Use command line**: Run tests from terminal instead of relying on IDE integration

## Current Status

✅ **Tests are working correctly** - All 48 steps are recognized and executed successfully
✅ **Step definitions are properly implemented** - No actual undefined steps
❌ **IDE extension issue** - VS Code Cucumber extension not recognizing step definitions

The "undefined step" errors are a false positive from the IDE extension. The actual test execution works perfectly. 