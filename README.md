# XLM E2E Playwright Tests

E2E automated tests for XLM projects (App & Admin) using Playwright.

## 📚 Table of Contents

- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running Tests](#-running-tests)
- [Viewing Reports](#-viewing-reports)
- [Test Tags](#-test-tags)
- [Environments](#-environments)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [Contact](#-contact)

## 📁 Project Structure

The repository is organized into two main testing projects: `app` and `admin`.

```
xlm-e2e-playwright/
└── tests/
    ├── app/          # Tests for the main application
    │   ├── specs/
    │   ├── pages/
    │   └── fixtures/
    ├── admin/        # Tests for the admin panel
    │   ├── specs/
    │   ├── pages/
    │   └── fixtures/
    └── common/       # Shared utilities, helpers, and base pages
```

## ✔️ Prerequisites

- Node.js 18+
- npm

## 🚀 Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Install Playwright Browsers:**
    This command downloads the necessary browser binaries for Playwright.
    ```bash
    npm run install:browsers
    ```

## 🧪 Running Tests

Tests can be run for the `app` or `admin` projects.

### General Commands

| Command                  | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `npm run test:app`       | Runs all tests for the **app**.                             |
| `npm run test:admin`     | Runs all tests for the **admin** panel.                     |
| `npm run test:all`       | Runs all tests for both `app` and `admin` sequentially.     |
| `npm run test:all:smoke` | Runs only `@smoke` tests for both projects on staging.      |

### UI, Headed, and Debug Modes

-   **UI Mode:** `npm run test:app:ui` or `npm run test:admin:ui`
    -   Opens the Playwright Test UI for an interactive testing experience.

-   **Headed Mode:** `npm run test:app:headed` or `npm run test:admin:headed`
    -   Runs tests with the browser window visible.

-   **Debug Mode:** `npm run test:app:debug` or `npm run test:admin:debug`
    -   Runs tests in debug mode for step-by-step inspection.

### Environment-Specific Testing

You can target different environments (`local`, `staging`, `prod`).

-   **Local:**
    -   `npm run test:app:local`
    -   `npm run test:admin:local`

-   **Staging:**
    -   `npm run test:app:staging`
    -   `npm run test:admin:staging`
    -   `npm run test:app:staging:smoke` (runs only `@smoke` tests)
    -   `npm run test:admin:staging:smoke` (runs only `@smoke` tests)

-   **Production:**
    -   `npm run test:app:prod` (runs only `@smoke` tests)
    -   `npm run test:admin:prod` (runs only `@smoke` tests)

## 📊 Viewing Reports

After a test run, an HTML report is generated in `tests/reports/html/`.

To open the latest report for a specific project, use:
```bash
# View app test report
npm run test:app:report

# View admin test report
npm run test:admin:report
```

## 🏷️ Test Tags

Use tags to categorize and selectively run tests.

-   `@smoke` - Critical flows suitable for running in any environment, including production.
-   `@regression` - Full regression suite, typically run on `local` and `staging`.
-   `@app` - App-specific tests.
-   `@admin` - Admin-specific tests.

## 🌍 Environments

The tests are configured to run against the following base URLs:

| Environment | App URL                  | Admin URL                   |
| ----------- | ------------------------ | --------------------------- |
| **local**   | `http://localhost:3000`  | `http://localhost:4000`     |
| **staging** | `https://app-staging.xlm.com` | `https://admin-staging.xlm.com` |
| **prod**    | `https://app.xlm.com`    | `https://admin.xlm.com`     |

## 📜 Available Scripts

Here is a summary of all available scripts from `package.json`:

| Script                        | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| `test:app`                    | Run all app tests.                                    |
| `test:app:ui`                 | Run app tests in UI mode.                             |
| `test:app:headed`             | Run app tests in headed mode.                         |
| `test:app:debug`              | Run app tests in debug mode.                          |
| `test:app:report`             | Show the latest app test report.                      |
| `test:app:local`              | Run app tests on the local environment.               |
| `test:app:staging`            | Run app tests on the staging environment.             |
| `test:app:staging:smoke`      | Run app smoke tests on staging.                       |
| `test:app:prod`               | Run app smoke tests on production.                    |
| `test:admin`                  | Run all admin tests.                                  |
| `test:admin:ui`               | Run admin tests in UI mode.                           |
| `test:admin:headed`           | Run admin tests in headed mode.                       |
| `test:admin:debug`            | Run admin tests in debug mode.                        |
| `test:admin:report`           | Show the latest admin test report.                    |
| `test:admin:local`            | Run admin tests on the local environment.             |
| `test:admin:staging`          | Run admin tests on the staging environment.           |
| `test:admin:staging:smoke`    | Run admin smoke tests on staging.                     |
| `test:admin:prod`             | Run admin smoke tests on production.                  |
| `test:all`                    | Run all tests for both app and admin.                 |
| `test:all:smoke`              | Run smoke tests for both app and admin on staging.    |
| `clean`                       | Remove all test artifacts.                            |
| `clean:app`                   | Remove app-specific test artifacts.                   |
| `clean:admin`                 | Remove admin-specific test artifacts.                 |
| `install:browsers`            | Install Playwright browser binaries.                  |

## 🤝 Contributing

1.  Create a new feature branch from `main`.
2.  Add or update tests as needed.
3.  Ensure all tests pass locally.
4.  Create a Pull Request.

## 📧 Contact

XLM Team - support@xlm.com
