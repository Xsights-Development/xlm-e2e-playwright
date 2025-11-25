# XLM Dashboard - System Patterns

## System Architecture Overview

The XLM Dashboard implements a modern React application architecture with clear separation of concerns, domain-driven design, and scalable patterns. The system is built around a multi-tenant, multi-farm architecture that supports enterprise-level livestock management operations.

## Core Architectural Patterns

### 1. Component Architecture Pattern

#### Component Hierarchy Structure
```
src/components/
├── layout/         # Application shell and routing containers
│   ├── Layout.js              # Main layout orchestrator
│   ├── AuthLayout/            # Authentication pages layout
│   ├── ClassicLayout.js       # Primary application layout
│   └── [other layouts]
├── shared/         # Cross-cutting UI components
│   ├── Loading.js
│   ├── Button.js
│   └── Modal.js
├── ui/            # Reusable UI primitives
└── route/         # Route-specific components
```

#### Component Design Principles
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Components are composed, not extended
- **Props Interface**: Clear, typed prop interfaces with JSDoc
- **Error Boundaries**: Graceful error handling at component level

### 2. State Management Architecture

#### Redux Store Organization
```
src/store/
├── index.js              # Store configuration and persistence
├── rootReducer.js        # Root reducer composition
├── theme/               # UI theme state
├── auth/                # Authentication and session state
├── base/                # Application-wide settings
├── locale/              # Internationalization state
├── location/            # Location data state
├── cube/                # Analytics state
├── farm/                # Farm-specific state
└── [async slices]       # View-specific state
```

#### State Management Patterns
- **Domain-Driven Slices**: State organized by business domains
- **Normalized Data**: Complex relationships normalized for efficiency
- **Immutable Updates**: Redux Toolkit ensures immutable state transitions
- **Selective Persistence**: Critical state persisted across sessions

### 3. Service Layer Pattern

#### API Service Architecture
```
src/services/
├── BaseService.js           # HTTP client foundation
├── ApiService.js            # Generic API wrapper
├── AuthService.js           # Authentication operations
├── AnimalService.js         # Animal domain operations
├── LocationService.js       # Location management
├── FarmService.js           # Farm operations
├── AlertsService.js         # Alert management
├── ReportService.js         # Reporting operations
└── CubeService.js           # Analytics integration
```

#### Service Design Patterns
- **Consistent Interface**: Standardized request/response handling
- **Error Abstraction**: Centralized error handling and user feedback
- **Header Injection**: Automatic tenant/farm context injection
- **Mock Integration**: Seamless development with MirageJS

### 4. Routing Architecture Pattern

#### Route Configuration Structure
```javascript
// Route definitions with metadata
export const protectedRoutes = [
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('views/FarmDashboard')),
        authority: [], // Access control
        isFarmNavigationRequired: true, // Farm selection required
    }
]
```

#### Routing Patterns
- **Lazy Loading**: Components loaded on-demand for performance
- **Protected Routes**: Authentication-based access control
- **Dynamic Routing**: Parameter-based routes (e.g., `/animal/:tagId`)
- **Route Guards**: Client-side authorization checks

## Key Technical Decisions

### Multi-Tenant Architecture Decision

#### Problem
Organizations need to manage multiple farms with complete data isolation while maintaining a unified user experience.

#### Solution: Header-Based Identification
```javascript
// Automatic header injection in BaseService
const config = {
    headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Identifier': tenantId,
        'X-Farm-Identifier': farmId,
    }
}
```

#### Benefits
- **Clean URLs**: No tenant/farm parameters in routes
- **Security**: Server-side enforcement of data isolation
- **Scalability**: Easy addition of new tenants/farms
- **User Experience**: Seamless farm switching

### State Persistence Strategy

#### Decision: Selective Redux Persistence
```javascript
const persistConfig = {
    key: 'xlm-dashboard',
    whitelist: ['auth', 'locale', 'persistData'], // Critical state only
}
```

#### Rationale
- **Performance**: Avoid persisting large datasets
- **Security**: Sensitive data not persisted client-side
- **Reliability**: Critical session state maintained across refreshes
- **Storage Limits**: Respect browser storage constraints

### Component State Management

#### Decision: Local State for UI, Redux for Domain
```javascript
// UI state stays local
const [isLoading, setIsLoading] = useState(false)

// Domain state goes to Redux
const dispatch = useDispatch()
dispatch(setAnimals(data))
```

#### Benefits
- **Separation of Concerns**: UI vs. business logic
- **Performance**: Local state for frequent UI updates
- **Testability**: Redux state easily testable
- **Consistency**: Domain state synchronized across components

## Design Patterns in Use

### 1. Container/Presentational Pattern

#### Implementation
```javascript
// Container component (business logic)
const AnimalListContainer = () => {
    const dispatch = useDispatch()
    const animals = useSelector(selectAnimals)

    useEffect(() => {
        dispatch(fetchAnimals())
    }, [])

    return <AnimalList animals={animals} />
}

// Presentational component (UI only)
const AnimalList = ({ animals }) => (
    <div>
        {animals.map(animal => (
            <AnimalCard key={animal.id} animal={animal} />
        ))}
    </div>
)
```

#### Benefits
- **Reusability**: Presentational components reusable across containers
- **Testability**: Business logic separated from UI rendering
- **Maintainability**: Clear separation of concerns

### 2. Custom Hooks Pattern

#### Implementation
```javascript
// Business logic hook
const useAuth = () => {
    const dispatch = useDispatch()
    const { authenticated, user } = useSelector(selectAuth)

    const login = (credentials) => {
        dispatch(loginAsync(credentials))
    }

    const logout = () => {
        dispatch(logout())
    }

    return { authenticated, user, login, logout }
}

// Usage in component
const LoginForm = () => {
    const { login, authenticated } = useAuth()
    // Component logic
}
```

#### Benefits
- **Logic Reuse**: Business logic shared across components
- **Composition**: Hooks can be combined for complex functionality
- **Testing**: Business logic testable in isolation

### 3. Higher-Order Components (HOC) Pattern

#### Implementation
```javascript
// Authentication HOC
const withAuth = (WrappedComponent) => {
    return (props) => {
        const { authenticated } = useAuth()

        if (!authenticated) {
            return <Redirect to="/sign-in" />
        }

        return <WrappedComponent {...props} />
    }
}

// Usage
const ProtectedDashboard = withAuth(Dashboard)
```

#### Benefits
- **Cross-cutting Concerns**: Authentication, theming, error handling
- **Code Reuse**: Common functionality applied to multiple components
- **Separation**: Concerns separated from component logic

### 4. Error Boundary Pattern

#### Implementation
```javascript
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        // Log error
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />
        }

        return this.props.children
    }
}
```

#### Benefits
- **Graceful Degradation**: Errors don't crash the entire application
- **User Experience**: Friendly error messages instead of white screens
- **Debugging**: Error context preserved for investigation

## Component Relationships

### Application Component Flow
```
App
├── Provider (Redux)
│   └── PersistGate
│       └── BrowserRouter
│           └── ThemeProvider
│               └── Layout
│                   ├── AuthLayout (if not authenticated)
│                   │   ├── SignIn
│                   │   ├── SignUp
│                   │   └── ForgotPassword
│                   └── MainLayout (if authenticated)
│                       ├── Header (tenant/farm selector)
│                       ├── Sidebar (navigation)
│                       └── Content (route components)
```

### Data Flow Architecture
```
User Action → Component → Dispatch Action → Reducer → Store Update → Component Re-render
                                      ↓
                               Service Call → API → Response → State Update
```

### State Update Patterns
```javascript
// Async thunk pattern
const fetchAnimals = createAsyncThunk(
    'animals/fetch',
    async (params) => {
        const response = await apiGetAnimals(params)
        return response.data
    }
)

// Slice reducer
const animalsSlice = createSlice({
    name: 'animals',
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnimals.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAnimals.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchAnimals.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
    }
})
```

## Critical Implementation Paths

### 1. Authentication Flow
```
User Login → JWT Token → Tenant Selection → Farm Selection → Dashboard
     ↓              ↓              ↓              ↓              ↓
Validate    Store Token    Store Tenant   Store Farm    Load Data
Credentials  in Redux       Identifier     Identifier    & Redirect
```

### 2. Data Loading Sequence
```
App Start → Check Auth → Load User → Select Tenant → Select Farm → Load Farm Data
     ↓            ↓            ↓            ↓            ↓            ↓
Initialize   Verify Token   Get Profile   Set Context   Set Context  Fetch Data
Store        Redirect if    Update State   Update API    Update API   Update UI
             Invalid                        Headers       Headers
```

### 3. API Request Flow
```
Component Action → Service Call → BaseService → HTTP Request → API Response
        ↓                ↓                ↓                ↓
   Dispatch Action   Format Request   Add Headers    Process Response
   Update Loading     Add Params       Add Auth       Handle Errors
   State              Handle Errors    Add Tenant     Update State
                      Update State     Add Farm       Show Feedback
```

### 4. Error Handling Flow
```
Error Occurs → Catch Error → Check Type → Handle Appropriately
     ↓                ↓                ↓                ↓
Log Error      Service Level   Network/Auth    Show User Message
Update State   Component Level  Tenant/Farm     Redirect if Needed
Show Feedback  Global Level     Data Issues     Clear Invalid State
```

## Performance Patterns

### Code Splitting Strategy
```javascript
// Route-based splitting
const AnimalManagement = lazy(() =>
    import('views/AnimalManagement')
)

// Component-based splitting
const HeavyChart = lazy(() =>
    import('components/charts/HeavyChart')
)
```

### Bundle Optimization
- **Vendor Splitting**: Third-party libraries in separate chunk
- **Route Splitting**: Each route loads its own bundle
- **Component Splitting**: Large components loaded on-demand
- **Asset Optimization**: Images and fonts optimized for web

### State Performance
- **Selector Memoization**: Expensive computations cached
- **Shallow Comparison**: Prevent unnecessary re-renders
- **Normalized State**: Efficient data access patterns
- **Pagination**: Large datasets loaded incrementally

## Security Implementation Patterns

### Authentication Guards
```javascript
// Route protection
<Route
    path="/protected"
    element={
        <PrivateRoute>
            <ProtectedComponent />
        </PrivateRoute>
    }
/>

// Component protection
const PrivateRoute = ({ children }) => {
    const { authenticated } = useAuth()

    return authenticated ? children : <Navigate to="/sign-in" />
}
```

### Data Isolation
- **Tenant Headers**: `X-Tenant-Identifier` for organization isolation
- **Farm Headers**: `X-Farm-Identifier` for farm-specific data
- **API Validation**: Server-side enforcement of access controls
- **State Isolation**: Separate state slices prevent cross-contamination

### Secure Communication
- **HTTPS Only**: All production communications encrypted
- **Token Security**: JWT tokens with appropriate expiration
- **Header Injection**: Automatic security headers on all requests
- **Error Sanitization**: Sensitive information not exposed in errors

## Testing Patterns

### Component Testing
```javascript
// Component test structure
describe('AnimalCard', () => {
    it('renders animal information', () => {
        render(<AnimalCard animal={mockAnimal} />)
        expect(screen.getByText(mockAnimal.name)).toBeInTheDocument()
    })

    it('handles click events', () => {
        const mockOnClick = jest.fn()
        render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

        fireEvent.click(screen.getByRole('button'))
        expect(mockOnClick).toHaveBeenCalledWith(mockAnimal.id)
    })
})
```

### Service Testing
```javascript
// API service test
describe('AnimalService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('fetches animals successfully', async () => {
        const mockResponse = { data: [mockAnimal] }
        ApiService.fetchData.mockResolvedValue(mockResponse)

        const result = await apiGetAnimals()
        expect(result).toEqual(mockResponse)
        expect(ApiService.fetchData).toHaveBeenCalledWith({
            url: API.getAnimals,
            method: 'get',
            params: undefined
        })
    })
})
```

### Integration Testing
- **User Flows**: Complete user journey testing
- **API Integration**: End-to-end API testing
- **State Integration**: Redux state testing
- **Error Scenarios**: Error handling verification

## Evolution and Extension Patterns

### Feature Flag Pattern
```javascript
// Runtime feature toggles
const features = {
    advancedAnalytics: process.env.REACT_APP_ADVANCED_ANALYTICS === 'true',
    realTimeUpdates: process.env.REACT_APP_REALTIME_ENABLED === 'true',
}

// Conditional rendering
{features.advancedAnalytics && <AdvancedAnalytics />}
```

### Plugin Architecture
```javascript
// Extensible component system
const componentRegistry = {
    charts: {
        apex: ApexChart,
        custom: CustomChart,
    }
}

// Dynamic component loading
const ChartComponent = componentRegistry.charts[chartType]
```

### Configuration-Driven Development
```javascript
// Configurable feature sets
const farmModules = {
    basic: ['animals', 'locations'],
    advanced: ['animals', 'locations', 'analytics', 'reports'],
    enterprise: ['animals', 'locations', 'analytics', 'reports', 'ai'],
}

// Dynamic module loading
const enabledModules = farmModules[userTier]
```

These system patterns provide the architectural foundation for the XLM Dashboard, ensuring scalability, maintainability, and extensibility as the platform evolves to meet growing livestock management needs.
