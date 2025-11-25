# XLM Dashboard - Tech Context

## Technology Stack

### Frontend Framework & Runtime
- **React**: 18.2.0 - Modern React with concurrent features, hooks, and functional components
- **React DOM**: 18.2.0 - DOM rendering and reconciliation
- **React Router DOM**: 6.2.1 - Declarative routing with modern API
- **Create React App**: 5.0.1 - Build toolchain and development environment

### State Management & Data Flow
- **Redux Toolkit**: 1.8.5 - Modern Redux with simplified API and Immer
- **React Redux**: 7.2.8 - Official React bindings for Redux
- **Redux Persist**: 6.0.0 - State persistence across browser sessions
- **Axios**: 0.27.2 - HTTP client for API communication

### UI Framework & Styling
- **Tailwind CSS**: 3.0.7 - Utility-first CSS framework
- **PostCSS**: 8.4.14 - CSS processing and transformation
- **Framer Motion**: 4.1.17 - Animation library for React components
- **React Icons**: 4.4.0 - Icon library with multiple icon packs

### Data Visualization & Charts
- **ApexCharts**: 3.44.0 - Modern charting library
- **React ApexCharts**: 1.4.0 - React wrapper for ApexCharts
- **D3 Libraries**: 
  - d3-fetch: 2.0.0 - Data fetching utilities
  - d3-geo: 3.0.1 - Geographic projections
  - d3-scale: 3.2.3 - Data scaling functions
- **React Simple Maps**: 3.0.0 - SVG map components

### Form Handling & Validation
- **Formik**: 2.2.9 - Form state management and validation
- **Yup**: 0.32.10 - Schema validation library
- **React Number Format**: 4.9.1 - Number input formatting

### Internationalization
- **i18next**: 21.6.3 - Internationalization framework
- **React i18next**: 11.15.1 - React integration for i18next

### Development & Build Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: 2.8.3 - Code formatting
- **Jest**: Testing framework with React Testing Library
- **Source Map Explorer**: Bundle analysis and optimization
- **PostCSS CLI**: CSS processing command line interface

### Additional Libraries
- **Lodash**: 4.17.21 - Utility functions
- **Moment.js**: 2.29.4 - Date manipulation
- **Moment Timezone**: 0.5.43 - Timezone handling
- **Day.js**: 1.11.5 - Lightweight date library
- **Classnames**: 2.2.6 - Conditional CSS class management
- **Match Sorter**: 6.3.1 - Fuzzy search and sorting
- **React Window**: 1.8.6 - Virtual scrolling for large lists
- **React Beautiful DnD**: 13.0.0 - Drag and drop functionality

## Development Setup

### Prerequisites
- **Node.js**: Version 12+ (AWS CodeBuild compatible)
- **npm**: Package manager (yarn also supported)
- **Git**: Version control system

### Local Development Environment
```bash
# Clone repository
git clone <repository-url>
cd xlm-dashboard

# Install dependencies
npm install

# Start development server
npm start

# Server runs on http://localhost:3000
# CSS watching and hot reloading enabled
```

### Development Scripts
```json
{
  "start": "run-p watch:css react-scripts:start",
  "build": "run-s build:css react-scripts:build",
  "test": "react-scripts test",
  "build:css": "cross-env TAILWIND_MODE=build NODE_ENV=production postcss src/assets/styles/app.css -o src/index.css",
  "watch:css": "cross-env TAILWIND_MODE=watch NODE_ENV=development postcss src/assets/styles/app.css -o src/index.css --watch",
  "analyze": "source-map-explorer 'build/static/js/*.js'",
  "format": "prettier --write ."
}
```

### Environment Configuration
```bash
# .env file (development)
REACT_APP_ROOT_API=http://localhost:8000/api/v1
REACT_APP_CUBE_API=https://cube.staging.xiot.com.au/cubejs-api/v1

# Environment variables injected at build time
NODE_ENV=development
REACT_APP_VERSION=1.0.0
```

## Technical Constraints

### Browser Support
- **Target Browsers**: Modern browsers (>0.2% market share)
- **Excluded**: Internet Explorer, Opera Mini
- **Mobile**: Full support for iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

### Performance Requirements
- **Initial Load**: < 3 seconds on standard broadband
- **Bundle Size**: < 2MB initial JavaScript bundle
- **Time to Interactive**: < 5 seconds on mobile devices
- **Memory Usage**: Efficient state management for large datasets

### Network Constraints
- **API Timeouts**: 60-second timeout for all requests
- **Offline Capability**: Basic functionality during connectivity issues
- **Mobile Networks**: Optimized for 3G+ connections
- **Caching Strategy**: Intelligent browser and service worker caching

### Security Constraints
- **HTTPS Only**: All production communications encrypted
- **JWT Expiration**: Appropriate token lifetimes
- **Data Isolation**: Multi-tenant data separation enforced
- **Input Validation**: Client and server-side validation

## Dependencies & Package Management

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "reduxjs/toolkit": "^1.8.5",
  "axios": "^0.27.2",
  "tailwindcss": "^3.0.7",
  "react-router-dom": "^6.2.1"
}
```

### Development Dependencies
```json
{
  "miragejs": "^0.1.43",           // API mocking
  "postcss": "^8.4.14",            // CSS processing
  "autoprefixer": "^10.4.0",       // CSS vendor prefixes
  "eslint": "^8.0.0",              // Code linting
  "prettier": "^2.8.3",            // Code formatting
  "@testing-library/react": "^13.3.0" // Component testing
}
```

### Dependency Management Strategy
- **Semantic Versioning**: Caret ranges for compatible updates
- **Regular Updates**: Monthly dependency updates and security patches
- **Bundle Analysis**: Regular bundle size monitoring
- **License Compliance**: Open source license verification

## Tool Usage Patterns

### Code Quality Tools

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'prettier'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-uses-react': 'off',
    'react/react-in-injected': 'off'
  }
}
```

#### Prettier Configuration
```javascript
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Testing Framework Setup

#### Jest Configuration (via react-scripts)
- **Test Environment**: jsdom for DOM simulation
- **Test Files**: `__tests__` folders and `.test.js` files
- **Coverage**: Automated coverage reporting
- **Mocking**: Jest mocks for API and utility functions

#### Testing Utilities
```javascript
// setupTests.js
import '@testing-library/jest-dom'

// Global test utilities
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  }
}
```

### Build System Configuration

#### Create React App Overrides
- **CSS Processing**: Custom PostCSS pipeline with Tailwind
- **Bundle Splitting**: Automatic code splitting by routes
- **Asset Optimization**: Image and font optimization
- **Service Worker**: Optional PWA capabilities

#### Custom Build Scripts
```javascript
// CSS build pipeline
"build:css": "cross-env TAILWIND_MODE=build NODE_ENV=production postcss src/assets/styles/app.css -o src/index.css"

// Development CSS watching
"watch:css": "cross-env TAILWIND_MODE=watch NODE_ENV=development postcss src/assets/styles/app.css -o src/index.css --watch"
```

### Development Server Configuration

#### Hot Reloading Setup
- **CSS Watching**: Automatic CSS recompilation
- **React Fast Refresh**: Component hot reloading
- **Error Overlay**: Development error display
- **Proxy Configuration**: API proxy for development

#### Development Features
```javascript
// src/setupProxy.js (optional)
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  )
}
```

## API Integration Patterns

### HTTP Client Configuration
```javascript
// BaseService setup
const BaseService = axios.create({
  timeout: 60000,
  baseURL: process.env.REACT_APP_API_PREFIX || '/api'
})

// Request interceptor - automatic header injection
BaseService.interceptors.request.use((config) => {
  // Add authentication
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add tenant/farm context
  const tenantId = getCurrentTenant()
  const farmId = getCurrentFarm()
  if (tenantId) config.headers['X-Tenant-Identifier'] = tenantId
  if (farmId) config.headers['X-Farm-Identifier'] = farmId
  
  return config
})
```

### Response Interceptor Pattern
```javascript
// Error handling and recovery
BaseService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      handleLogout()
    }
    
    if (error.response?.data?.detail?.includes('INACTIVE_TENANT')) {
      // Handle tenant issues
      handleTenantError()
    }
    
    return Promise.reject(error)
  }
)
```

### Service Layer Abstraction
```javascript
// Generic service wrapper
export const ApiService = {
  fetchData(param) {
    return BaseService(param)
  }
}

// Domain-specific services
export const AnimalService = {
  async getAnimals(params) {
    return ApiService.fetchData({
      url: API.getAnimals,
      method: 'get',
      params
    })
  }
}
```

## State Management Implementation

### Redux Store Configuration
```javascript
// Store setup with persistence
const persistConfig = {
  key: 'xlm-dashboard',
  storage,
  whitelist: ['auth', 'locale', 'theme']
}

const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer()),
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
})
```

### Redux Toolkit Patterns
```javascript
// Slice definition
const animalsSlice = createSlice({
  name: 'animals',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    // Synchronous actions
  },
  extraReducers: (builder) => {
    // Asynchronous actions
    builder
      .addCase(fetchAnimals.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAnimals.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
  }
})
```

## Styling & UI Framework

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        xsights: {
          50: '#f0f9ff',
          500: '#3b82f6',
          // Custom brand colors
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
```

### CSS Processing Pipeline
```
Source CSS → PostCSS → Tailwind CSS → Autoprefixer → Output CSS
     ↓              ↓              ↓              ↓              ↓
app.css    →  Processed  →  Utilities  →  Prefixes  →  index.css
```

## Internationalization Setup

### i18n Configuration
```javascript
// i18n setup
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    vi: { translation: viTranslations }
  },
  lng: 'en',
  fallbackLng: 'en'
})
```

### Translation Usage
```javascript
// In components
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()
  
  return <div>{t('animal.add')}</div>
}
```

## Deployment & Build Configuration

### AWS CodeBuild Setup
```yaml
# buildspec.yml
version: 0.2
phases:
  install:
    runtime-versions:
      nodejs: 12
  pre_build:
    commands:
      - npm install
  build:
    commands:
      - npm run build
artifacts:
  files:
    - '**/*'
  base-directory: build
```

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **CSS Purging**: Unused Tailwind classes removed
- **Asset Optimization**: Images and fonts compressed
- **Bundle Analysis**: Source map explorer integration

## Development Workflow

### Local Development
1. **Setup**: Clone repository and install dependencies
2. **Environment**: Configure `.env` file for local API
3. **Development**: Run `npm start` for hot reloading
4. **Testing**: Run `npm test` for unit tests
5. **Building**: Run `npm run build` for production build

### Code Quality Workflow
1. **Linting**: ESLint runs on pre-commit hooks
2. **Formatting**: Prettier formats code automatically
3. **Testing**: Jest tests run in CI/CD pipeline
4. **Type Checking**: JSDoc comments provide type hints

### Collaboration Workflow
1. **Branching**: Feature branches from main
2. **Pull Requests**: Code review required
3. **CI/CD**: Automated testing and building
4. **Deployment**: Automated deployment to staging/production

This technical context provides the foundation for understanding the XLM Dashboard's technology choices, development practices, and technical constraints that shape the project's implementation and evolution.
