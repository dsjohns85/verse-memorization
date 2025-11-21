# Development Guide

This guide covers best practices, conventions, and workflows for developing the Verse Memorization application.

## Development Environment

### Recommended Tools

- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - Azure Tools
  - TypeScript and JavaScript Language Features

- **Git** for version control
- **Docker Desktop** for containerization
- **Postman** or **Insomnia** for API testing

### Environment Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/dsjohns85/verse-memorization.git
   cd verse-memorization
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in both `frontend` and `backend` directories
   - Update values for your local environment

3. **Start Development Servers**
   ```bash
   # Terminal 1 - API (Azure Functions)
   cd api && npm run start

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Code Style and Conventions

### TypeScript

- Use **strict mode** with all type checking enabled
- Prefer **interfaces** for object shapes
- Use **type** for unions, intersections, and primitives
- Always type function parameters and return values
- Avoid `any` type - use `unknown` if truly unknown

Example:
```typescript
interface Verse {
  id: string;
  reference: string;
  text: string;
  translation: string;
}

async function getVerse(id: string): Promise<Verse> {
  // implementation
}
```

### Naming Conventions

- **Files**: camelCase for TypeScript files (`verseService.ts`)
- **Components**: PascalCase for React components (`AddVerse.tsx`)
- **Variables**: camelCase (`currentVerse`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`VerseStats`)
- **Functions**: camelCase (`calculateNextReview`)

### Code Formatting

The project uses Prettier for code formatting:

```bash
# Format all files
npm run format

# Check formatting
npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

Configuration in `.prettierrc`:
- Semi-colons: Yes
- Single quotes: Yes
- Trailing commas: ES5
- Tab width: 2 spaces

### Linting

The project uses ESLint for code quality:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Project Architecture

### API Architecture (Azure Functions)

```
api/
├── health/            # Health check endpoint
├── verses/            # Verse management endpoints
├── host.json          # Azure Functions configuration
├── package.json
└── tsconfig.json
```

**Serverless Architecture:**
1. **Azure Functions**: HTTP-triggered serverless functions
2. **SQLite Database**: File-based database with better-sqlite3
3. **Simple Authentication**: Development mode for testing, JWT ready for production

### Frontend Architecture

```
frontend/
└── src/
    ├── components/     # Reusable UI components
    ├── pages/          # Page components (routes)
    ├── services/       # API client and services
    ├── hooks/          # Custom React hooks
    ├── contexts/       # React contexts
    ├── types/          # TypeScript type definitions
    ├── utils/          # Utility functions
    └── App.tsx         # Main application component
```

**Component Structure:**
- **Pages**: Top-level route components
- **Components**: Reusable UI pieces
- **Services**: API communication layer
- **Hooks**: Reusable stateful logic

## Database Management

The application uses SQLite with better-sqlite3 for direct SQL queries:

```typescript
import Database from 'better-sqlite3';

const db = new Database('verses.db');

// Example query
const verses = db.prepare('SELECT * FROM verses WHERE userId = ?').all(userId);
```

For Azure deployment, the SQLite file is stored in Azure Storage and mounted to the Functions runtime.

## API Development

### Creating a New Azure Function Endpoint

1. **Create Function Directory**
   ```bash
   mkdir api/my-endpoint
   ```

2. **Create function.json**
   ```json
   {
     "bindings": [
       {
         "authLevel": "anonymous",
         "type": "httpTrigger",
         "direction": "in",
         "name": "req",
         "methods": ["get", "post"],
         "route": "my-endpoint"
       },
       {
         "type": "http",
         "direction": "out",
         "name": "res"
       }
     ]
   }
   ```

3. **Create index.ts**
   ```typescript
   import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

   export async function myEndpoint(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
     context.log('Processing request');
     return {
       status: 200,
       jsonBody: { message: 'Success' }
     };
   }

   app.http('myEndpoint', {
     methods: ['GET', 'POST'],
     authLevel: 'anonymous',
     handler: myEndpoint
   });
   ```

4. **Update Frontend Service** (`frontend/src/services/api.ts`)
   ```typescript
   async getMyData(): Promise<Data> {
     return this.request<Data>(`/api/my-endpoint`);
   }
   ```

### Error Handling

Always use custom error classes:

```typescript
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

if (!verse) {
  throw new NotFoundError('Verse not found');
}

if (!data.reference) {
  throw new ValidationError('Reference is required');
}
```

## Frontend Development

### Creating a New Page

1. **Create Page Component** (`frontend/src/pages/NewPage.tsx`)
   ```typescript
   export default function NewPage() {
     return (
       <div className="container">
         <h1>New Page</h1>
       </div>
     );
   }
   ```

2. **Add Route** (`frontend/src/App.tsx`)
   ```typescript
   <Route path="/new" element={<NewPage />} />
   ```

3. **Add Navigation Link**
   ```typescript
   <Link to="/new">New Page</Link>
   ```

### State Management

Use React hooks for state management:

```typescript
const [data, setData] = useState<Type | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const result = await apiClient.getData();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Styling

Use inline styles with CSS-in-JS pattern:

```typescript
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem' 
}}>
  {/* content */}
</div>
```

Or use CSS classes defined in `index.css` or `App.css`.

## Testing

### API Tests

Create tests in `api/__tests__/`:

```typescript
describe('Verse Functions', () => {
  it('should return verses', async () => {
    const result = await getVerses(mockRequest, mockContext);
    
    expect(result.status).toBe(200);
    expect(result.jsonBody).toBeDefined();
  });
});
```

Run tests:
```bash
cd api
npm test
```

### Frontend Tests

Create tests alongside components:

```typescript
import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders home page', () => {
  render(<Home />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
```

Run tests:
```bash
cd frontend
npm test
```

## Debugging

### Backend Debugging

Add debug logging:
```typescript
console.log('Debug info:', data);
console.error('Error:', error);
```

Use Chrome DevTools with Node.js:
```bash
node --inspect-brk dist/index.js
```

### Frontend Debugging

- Use React DevTools browser extension
- Add breakpoints in browser DevTools
- Use `console.log()` for quick debugging
- Check Network tab for API calls

### Database Debugging

View SQLite database with a SQLite browser:
```bash
# Install sqlite3 CLI
npm install -g sqlite3

# Open database
sqlite3 verses.db
```

Or use a GUI tool like DB Browser for SQLite.

## Git Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(backend): add verse search endpoint

Implement full-text search for verses using PostgreSQL
full-text search capabilities.

Closes #123
```

### Pull Request Process

1. Create feature branch
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request
5. Wait for CI checks
6. Request review
7. Address feedback
8. Merge when approved

## Performance Optimization

### Backend

- Use database indexes for frequently queried fields
- Implement caching for expensive operations
- Use pagination for large result sets
- Optimize SQL queries with proper indexes and EXPLAIN

### Frontend

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use production build for deployment

## Security Best Practices

- Never commit secrets or credentials
- Validate all user input
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated
- Run security audits: `npm audit`

## Common Patterns

### Async/Await Error Handling

```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

### TypeScript Type Guards

```typescript
function isVerse(obj: any): obj is Verse {
  return obj && 
    typeof obj.reference === 'string' &&
    typeof obj.text === 'string';
}
```

### React Custom Hook

```typescript
function useVerses() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    try {
      const data = await apiClient.getVerses();
      setVerses(data);
    } finally {
      setLoading(false);
    }
  };

  return { verses, loading, reload: loadVerses };
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :7071
   # Kill process
   kill -9 <PID>
   ```

2. **Module not found**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   ```bash
   # Restart TypeScript server in VS Code
   Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)

## Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Ask questions in discussions
- Join the community
