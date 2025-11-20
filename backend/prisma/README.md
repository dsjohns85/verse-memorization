# Prisma Database Configuration

This directory contains the database schema and migrations for the Verse Memorization app.

## Database Options

The app supports two database options:

### SQLite (Default - Simplest)

**Best for**: Development, personal use, small deployments

The default `schema.prisma` is configured for SQLite. No database server needed!

**Setup**:
```bash
# 1. Set DATABASE_URL in your .env
DATABASE_URL="file:./dev.db"

# 2. Generate client and run migrations
npx prisma generate
npx prisma migrate dev
```

### PostgreSQL (Production)

**Best for**: Production, multiple users, high concurrency

**Setup**:
```bash
# 1. Copy the PostgreSQL schema
cp schema.postgresql.prisma schema.prisma

# 2. Set DATABASE_URL in your .env
DATABASE_URL="postgresql://user:password@localhost:5432/verse_memorization"

# 3. Generate client and run migrations
npx prisma generate
npx prisma migrate dev
```

## Schema Files

- `schema.prisma` - Main schema file (SQLite by default)
- `schema.postgresql.prisma` - PostgreSQL version of the schema
- `migrations/` - Database migration history
- `seed.ts` - Sample data for development

## Common Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Deploy migrations to production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed the database with sample data
npm run prisma:seed

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Switching Databases

### From SQLite to PostgreSQL

```bash
# 1. Backup your SQLite data if needed
cp dev.db dev.db.backup

# 2. Switch to PostgreSQL schema
cp schema.postgresql.prisma schema.prisma

# 3. Update .env with PostgreSQL connection string
# DATABASE_URL="postgresql://..."

# 4. Generate client and run migrations
npx prisma generate
npx prisma migrate deploy
```

### From PostgreSQL to SQLite

```bash
# 1. Backup your PostgreSQL data
pg_dump your_db > backup.sql

# 2. Restore original SQLite schema
git checkout schema.prisma

# 3. Update .env with SQLite connection
# DATABASE_URL="file:./dev.db"

# 4. Generate client and run migrations
npx prisma generate
npx prisma migrate dev
```

## Notes

- SQLite stores data in a single file (e.g., `dev.db`)
- SQLite is perfect for 1-10 concurrent users
- PostgreSQL recommended for production with many users
- Both schemas are functionally identical
- Migrations work with both database types
