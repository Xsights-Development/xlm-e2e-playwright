# XLM App E2E Selectors (Login → Dashboard → Barn → Sign Out)

## Login Page
- **Email input:** `[data-testid="email-input"]`
- **Password input:** `[data-testid="password-input"]`
- **Login button:** `[data-testid="login-button"]`

## Tenant Selection
- **Tenant dropdown:** `.tenant-select .select__control`
- **Tenant option ("Groove Technology"):** `#react-select-2-option-3`

## Farm Selection
- **Farm dropdown:** `.farm-select .select__control`
- **Farm option ("Groove Farm"):** `#react-select-3-option-0`

## Navigation
- **Next button (after tenant):** `button:has-text('Next')`
- **Go to Dashboard button:** `button:has-text('Go to Dashboard')`

## Barns Menu (Dashboard)
- **Expand "Nursery Barns":** `text=Nursery Barns`
- **Select "Nursery 2":** `text=Nursery 2`

## Profile & Sign Out
- **Profile icon:** `.avatar`
- **Sign Out:** `text=Sign Out`

> All selectors are chosen for stability and resilience to UI changes. Prefer `data-testid` or unique IDs when available.
