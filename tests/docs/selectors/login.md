# Login Page Selectors

## Prompt
When automating the login page tests:
1. Use Playwright MCP Server for browser automation:
```javascript
const mcp = require('@executeautomation/mcp-playwright');
```

2. Read credentials from .env file:
```javascript
// Required environment variables from .env
// APP_URL=http://localhost:3000
// APP_USER=your.email@example.com
// APP_PASS=your_password
```

3. Focus on:
   - Secure authentication process
   - Proper handling of credentials
   - Verification of login success
   - Error state handling

These selectors support automated testing of the authentication flow.

## Authentication Form
- Login Form: `[data-testid="login-form"]`
- Email Input: `[data-testid="email-input"]`
- Password Input: `[data-testid="password-input"]`
- Login Button: `[data-testid="login-button"]`

## Example Usage with MCP Server
```javascript
// Launch browser and navigate to APP_URL
await mcp.playwright_navigate({
  url: process.env.APP_URL
});

// Fill in login credentials from .env
await page.fill('[data-testid="email-input"]', process.env.APP_USER);
await page.fill('[data-testid="password-input"]', process.env.APP_PASS);

// Click login button
await page.click('[data-testid="login-button"]');
```

## Best Practices
1. Always use data-testid attributes for stable element selection
2. Wait for form elements to be visible before interacting
3. Verify successful login by checking redirection to dashboard
4. Handle error messages and validation states
5. Ensure proper cleanup of credentials after testing
6. Use environment variables for sensitive data
7. Verify MCP Server connection before starting tests
