# Architecture & Code Organization

This document explains how Convayto is organized and the patterns used throughout the codebase.

## Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── LandingPage.jsx     # Public landing page
│   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   ├── AppLayout.jsx       # Main app layout
│   ├── NotFound.jsx        # 404 page
│   └── ...                 # Other UI components
│
├── features/               # Feature modules (grouped by feature, not by type)
│   ├── authentication/     # Auth-related code
│   │   ├── apiAuth.js      # API calls for auth
│   │   ├── Signin.jsx      # Sign in page
│   │   ├── Signup.jsx      # Sign up page
│   │   ├── useSignin.js    # Sign in hook
│   │   ├── useSignup.js    # Sign up hook
│   │   └── ...
│   │
│   ├── messageArea/        # Messaging features
│   │   ├── Messages.jsx    # Messages list
│   │   ├── useMessages.js  # Fetch messages hook
│   │   ├── useSendNewMessage.js
│   │   └── ...
│   │
│   ├── sideBar/           # Sidebar & navigation
│   │   ├── LeftSideBar.jsx
│   │   ├── useConversations.js
│   │   └── ...
│   │
│   ├── userProfile/       # User profile features
│   │   ├── Avatar.jsx
│   │   ├── useUpdateUser.js
│   │   └── ...
│   │
│   └── userSearch/        # User discovery
│       ├── SearchView.jsx
│       ├── useSearchedUsers.js
│       └── ...
│
├── contexts/              # Global state
│   └── UiContext.jsx      # UI state (sidebar open/closed, theme)
│
├── services/              # External service integration
│   └── supabase.js        # Supabase client setup
│
├── utils/                 # Utility functions & hooks
│   ├── common.js          # Common utilities
│   └── useEnterKeyPress.js # Custom hooks
│
├── styles/
│   └── index.css          # Global styles
│
├── config.js              # App configuration (constants, regex patterns)
├── App.jsx                # Main app component with routing
└── main.jsx               # React DOM entry point
```

## Design Patterns

### 1. Feature-Based Organization

Code is organized by **feature**, not by file type. This makes it easier to:

- Find all code related to a feature in one place
- Work on features independently
- Scale the app with new features

**Example**: All authentication code (components, hooks, API calls) lives in `src/features/authentication/`

### 2. Custom Hooks for Business Logic

Business logic is extracted into custom hooks, keeping components clean:

```jsx
// ❌ Bad: Logic mixed with component
function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ... signin logic here
  };
}

// ✅ Good: Logic in a hook
function SigninPage() {
  const { signin, isPending } = useSignin();
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => signin(data);
}

// src/features/authentication/useSignin.js
export function useSignin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: signin, isPending } = useMutation({
    mutationFn: (credentials) => apiAuth.signin(credentials),
    onSuccess: () => {
      navigate("/chat");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return { signin, isPending };
}
```

**Benefits:**

- Reusable logic across components
- Easier to test
- Cleaner components
- Better separation of concerns

### 3. API Layer Abstraction

API calls are isolated in separate files:

```javascript
// ✅ src/features/authentication/apiAuth.js
export const apiAuth = {
  signin: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },
};

// Then used in hooks:
// src/features/authentication/useSignin.js
const { mutate } = useMutation({
  mutationFn: apiAuth.signin,
});
```

**Benefits:**

- Easy to change API implementation
- Centralized error handling
- Mockable for testing

### 4. React Query for Server State

Server data is managed with TanStack React Query:

```jsx
// ✅ Good: Using React Query
function Messages({ conversationId }) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => apiMessage.getMessages(conversationId),
  });

  if (isLoading) return <Loader />;
  return <MessageList messages={messages} />;
}
```

**Why React Query?**

- Handles caching automatically
- Background syncing
- Automatic refetching
- Optimistic updates
- Infinite queries for pagination

### 5. Protected Routes

Authentication is checked at the route level:

```jsx
// App.jsx
<Route
  path="/chat"
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
/>;

// components/ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/signin");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <Loader />;
  return isAuthenticated ? children : null;
}
```

### 6. Context API for UI State

Global UI state (sidebar, theme) uses React Context:

```jsx
// contexts/UiContext.jsx
export function UiProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <UiContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </UiContext.Provider>
  );
}

// Usage:
function Component() {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(UiContext);
}
```

### 7. Form Management with React Hook Form

Forms use React Hook Form with Controller pattern:

```jsx
import { useForm, Controller } from "react-hook-form";

function SignupForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: "Email is required" }}
        render={({ field }) => <input {...field} />}
      />
    </form>
  );
}
```

## Data Flow

### Messaging Flow

```
User types message
     ↓
useSendNewMessage hook
     ↓
API call to insert in messages table
     ↓
Supabase RLS checks authorization
     ↓
Message inserted in database
     ↓
Realtime subscription triggered
     ↓
useMessages hook receives update
     ↓
React Query updates cache
     ↓
MessageList component re-renders
```

### Authentication Flow

```
User submits signin form
     ↓
useSignin hook calls apiAuth.signin()
     ↓
Supabase.auth.signInWithPassword()
     ↓
Session created
     ↓
useUser hook detects authentication
     ↓
Protected route allows access
     ↓
User navigated to /chat
```

## Naming Conventions

### Components

- PascalCase: `MessageList.jsx`, `UserAvatar.jsx`
- One component per file
- Clear, descriptive names

### Hooks

- camelCase with `use` prefix: `useMessages.js`, `useSignin.js`
- One hook per file (usually)
- Describe what they do, not how

### API Functions

- Group in objects: `apiAuth`, `apiMessage`, `apiConversation`
- Use descriptive names: `getMessages()`, `sendMessage()`

### Constants

- UPPER_SNAKE_CASE: `MAX_NAME_LENGTH`, `EMAIL_REGEX`
- Group related constants in `config.js`

## Styling Approach

### Tailwind CSS

All styling uses Tailwind utility classes:

```jsx
// ❌ Avoid inline styles
<div style={{ padding: '16px', borderRadius: '8px', color: '#333' }}>

// ✅ Use Tailwind
<div className="p-4 rounded-lg text-gray-900">

// ✅ Responsive classes
<div className="p-2 sm:p-4 md:p-6 lg:p-8">

// ✅ Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### Custom Colors

Custom colors are configured in `tailwind.config.js`:

```javascript
// Used throughout the app for consistency
<div className="bg-bgSecondary text-textPrimary dark:bg-bgSecondary-dark">
```

## Error Handling

### API Errors

```jsx
const { mutate } = useMutation({
  mutationFn: apiAuth.signin,
  onError: (error) => {
    toast.error(error.message || "Something went wrong");
  },
});
```

### User Feedback

Use `react-hot-toast` for notifications:

```jsx
import toast from "react-hot-toast";

toast.success("Message sent!");
toast.error("Failed to send message");
```

## Performance Optimization

### 1. Infinite Pagination

Messages use infinite queries to load in chunks:

```jsx
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ["messages"],
  queryFn: ({ pageParam }) => getMessages(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 2. Data Prefetching

On login, conversations are prefetched:

```jsx
queryClient.prefetchInfiniteQuery({
  queryKey: ["conversations"],
  queryFn: () => getConversations(),
});
```

### 3. React Query Caching

Results are cached automatically, reducing API calls

### 4. Lazy Loading

Components are code-split in routes:

```jsx
const MessageView = lazy(() => import('./MessageView'))

<Suspense fallback={<Loader />}>
  <MessageView />
</Suspense>
```

## Environment Configuration

All environment-specific settings are in `config.js`:

```javascript
export const APP_NAME = "Convayto";
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;
```

This allows quick changes without searching the codebase.

## Testing Strategy

Currently, Convayto doesn't have automated tests. This is a great area to contribute!

Recommended approach:

- Unit tests: Jest + React Testing Library for components and hooks
- Integration tests: Test features together
- E2E tests: Playwright or Cypress for full user flows

## Security Considerations

### Row-Level Security (RLS)

All data access is enforced at the database level:

```sql
-- Example: Users can only see conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid())
```

### Client-Side Secrets

⚠️ Never put sensitive secrets in the browser:

- ❌ API secret keys
- ❌ Database passwords
- ❌ Private encryption keys

Use RLS to protect sensitive data instead.

## Future Architecture Improvements

- **TypeScript**: Add type safety throughout
- **Testing**: Add unit and integration tests with Jest and React Testing Library
- **E2E Tests**: Add Playwright or Cypress for full user flow testing
- **State Management**: Consider Redux or Zustand if state becomes more complex
- **Code Splitting**: Lazy load feature modules for better performance
- **Error Boundaries**: Add React Error Boundaries for better error handling

---

For more detailed information about specific features, see:

- `DATABASE_DESIGN.md` - Database schema and design
- `CONTRIBUTING.md` - How to contribute
- `.eslintrc` - Code style rules
