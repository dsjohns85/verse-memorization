# Development Guide

This guide covers best practices, conventions, and workflows for developing the Verse Memorization application.

## Development Environment

### Recommended Tools

- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
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
   # Option 1: Use Docker Compose (recommended)
   docker-compose up

   # Option 2: Run services individually
   # Terminal 1 - Backend
   cd backend && npm run dev

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

### Backend Architecture

```
backend/
├── src/
│   ├── config/         # Configuration (database, etc.)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Application entry point
└── prisma/
    ├── schema.prisma   # Database schema
    └── seed.ts         # Database seeding
```

**Layered Architecture:**
1. **Routes**: Define endpoints and call controllers
2. **Controllers**: Handle requests, call services, return responses
3. **Services**: Contain business logic, interact with database
4. **Prisma**: ORM for database access

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

### Prisma Workflow

1. **Modify Schema**
   ```prisma
   // prisma/schema.prisma
   model NewModel {
     id String @id @default(cuid())
     // fields...
   }
   ```

2. **Create Migration**
   ```bash
   cd backend
   npx prisma migrate dev --name add_new_model
   ```

3. **Generate Client**
   ```bash
   npx prisma generate
   ```

4. **Update Services**
   Use the new model in your service files

### Database Seeding

Add seed data in `backend/prisma/seed.ts`:

```typescript
async function main() {
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
}
```

Run seed:
```bash
npm run prisma:seed
```

### Prisma Studio

View and edit database data with Prisma Studio:

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

## API Development

### Creating a New Endpoint

1. **Define Service Method** (`backend/src/services/`)
   ```typescript
   export class MyService {
     async getItem(id: string) {
       return await prisma.item.findUnique({ where: { id } });
     }
   }
   ```

2. **Create Controller** (`backend/src/controllers/`)
   ```typescript
   export const getItem = async (req: AuthRequest, res: Response) => {
     const { id } = req.params;
     const item = await myService.getItem(id);
     res.json(item);
   };
   ```

3. **Add Route** (`backend/src/routes/`)
   ```typescript
   router.get('/:id', authenticate, getItem);
   ```

4. **Update Frontend Service** (`frontend/src/services/api.ts`)
   ```typescript
   async getItem(id: string): Promise<Item> {
     return this.request<Item>(`/api/items/${id}`);
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

### Backend Tests

Create tests in `backend/src/__tests__/`:

```typescript
describe('VerseService', () => {
  it('should create a verse', async () => {
    const verse = await verseService.createVerse({
      reference: 'John 3:16',
      text: 'For God so loved...',
      userId: 'test-user',
    });
    
    expect(verse).toBeDefined();
    expect(verse.reference).toBe('John 3:16');
  });
});
```

Run tests:
```bash
cd backend
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

Enable Prisma query logging:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

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
- Optimize Prisma queries with `select` and `include`

### Frontend

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images and assets
- Use production build for deployment

## Security Best Practices

- Never commit secrets or credentials
- Validate all user input
- Use parameterized queries (Prisma does this)
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
   lsof -i :3001
   # Kill process
   kill -9 <PID>
   ```

2. **Prisma Client not generated**
   ```bash
   cd backend
   npx prisma generate
   ```

3. **Module not found**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript errors**
   ```bash
   # Restart TypeScript server in VS Code
   Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Azure Documentation](https://docs.microsoft.com/azure/)

## Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Ask questions in discussions
- Join the community
